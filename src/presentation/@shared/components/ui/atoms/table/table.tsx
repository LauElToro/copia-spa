// atoms/DataTable/DataTable.tsx
'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Box, Skeleton, Typography, Menu, MenuItem, IconButton, Accordion, AccordionSummary, AccordionDetails, Stack } from '@mui/material';
import { MoreVert, ExpandMore } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/presentation/@shared/hooks/use-is-mobile';
import { SearchInput } from '@/presentation/@shared/components/ui/atoms/search-input';
import { Pagination } from '@/presentation/@shared/components/ui/molecules/pagination/pagination';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import NextImage from 'next/image';

export interface DataTableColumn {
  title: string;
  data: string;
  className?: string;
  orderable?: boolean;
  searchable?: boolean;
  responsivePriority?: number;
  type?: 'text' | 'image' | 'html';
  render?: (data: string, type: string, row: Record<string, unknown>) => string;
  imageOptions?: {
    width?: number;
    height?: number;
    className?: string;
    defaultImage?: string;
    alt?: string;
  };
}

export interface DataTableProps {
  id: string;
  columns: DataTableColumn[];
  data: Record<string, unknown>[];
  className?: string;
  responsive?: boolean;
  pagination?: boolean;
  searching?: boolean;
  ordering?: boolean;
  pageLength?: number;
  isMobile?: boolean;
  isLoading?: boolean;
  externalSearchTerm?: string;
  language?: {
    search?: string;
    lengthMenu?: string;
    info?: string;
    infoEmpty?: string;
    infoFiltered?: string;
    paginate?: {
      first?: string;
      last?: string;
      next?: string;
      previous?: string;
    };
  };
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  pagination = true,
  searching = true,
  ordering = true,
  pageLength = 10,
  isMobile: forceMobile,
  isLoading = false,
  externalSearchTerm,
  language = {
    search: ' ',
    lengthMenu: 'Resultados: _MENU_ ',
    info: 'Mostrando _START_ - _END_ de _TOTAL_ productos',
    paginate: {
      next: '>',
      previous: '<'
    }
  }
}) => {
  const router = useRouter();
  const isMobileHook = useIsMobile(992);
  const isMobile = forceMobile !== undefined ? forceMobile : isMobileHook;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const actionButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [anchorEls, setAnchorEls] = useState<Record<number, HTMLElement | null>>({});
  const [, setShowRows] = useState(false);
  const [rowsToShow, setRowsToShow] = useState<number[]>([]);
  const hasAnimatedRef = useRef(false);
  const previousLoadingRef = useRef(isLoading);
  const dataIdRef = useRef<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Usar externalSearchTerm si se proporciona, sino usar el interno
  const effectiveSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : searchTerm;

  // Filtrar datos por búsqueda
  const filteredData = useMemo(() => {
    // Normalizar el término de búsqueda
    const searchTerm = String(effectiveSearchTerm || '').trim();
    if (!searchTerm) return data;

    // Normalizar el término de búsqueda: convertir a minúsculas y normalizar espacios
    const searchLower = searchTerm.toLowerCase().replace(/\s+/g, ' ').trim();

    return data.filter(row => {
      return columns.some(column => {
        // Excluir columnas HTML y columnas marcadas como no buscables
        if (column.searchable === false || column.type === 'html') return false;

        const value = row[column.data];

        // Manejar valores null, undefined o vacíos
        if (value === null || value === undefined || value === '') return false;

        // Normalizar el valor: convertir a string, minúsculas, y normalizar espacios
        const valueStr = String(value)
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim();

        // Buscar si el valor contiene el término de búsqueda (case-insensitive)
        return valueStr.includes(searchLower);
      });
    });
  }, [data, effectiveSearchTerm, columns]);

  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginar datos
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageLength;
    const end = start + pageLength;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageLength, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageLength);
  const showingFrom = pagination && sortedData.length > 0 ? (currentPage - 1) * pageLength + 1 : 0;
  const showingTo = pagination ? Math.min(currentPage * pageLength, sortedData.length) : sortedData.length;

  // Resetear página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveSearchTerm, sortedData.length]);

  // Generar un ID único para los datos actuales (solo los primeros 10 para performance)
  const currentDataId = useMemo(() => {
    if (data.length === 0) return '';
    return JSON.stringify(data.slice(0, 10).map((row, idx) => row.id || idx));
  }, [data]);

  // Controlar animación de filas cuando termina de cargar
  useEffect(() => {
    // Si los datos cambiaron, resetear el flag de animación
    if (currentDataId !== dataIdRef.current) {
      hasAnimatedRef.current = false;
      dataIdRef.current = currentDataId;
      setRowsToShow([]);
    }

    // Solo ejecutar cuando isLoading cambia de true a false (transición de carga a cargado)
    const wasLoading = previousLoadingRef.current;
    const isNowLoading = isLoading;

    // Función para animar filas secuencialmente
    const animateRowsSequentially = (): (() => void) => {
      if (paginatedData.length === 0) {
        return () => {}; // Retornar función vacía si no hay datos
      }

      // Resetear todo antes de animar
      hasAnimatedRef.current = false;
      setShowRows(true);
      setRowsToShow([]); // Resetear antes de animar

      // Animar filas secuencialmente, esperando a que termine la anterior
      const timeouts: NodeJS.Timeout[] = [];
      const staggerDelay = 175; // Delay between each row starting

      paginatedData.forEach((_, index) => {
        const timeout = setTimeout(() => {
          setRowsToShow((prev) => {
            // Solo agregar si no está ya en la lista
            if (!prev.includes(index)) {
              const newRows = [...prev, index];
              // Cuando todas las filas se han agregado, marcar como animado
              if (newRows.length === paginatedData.length) {
                hasAnimatedRef.current = true;
              }
              return newRows;
            }
            return prev;
          });
        }, index * staggerDelay); // Esperar a que termine la animación anterior
        timeouts.push(timeout);
      });

      return () => {
        timeouts.forEach((timeout) => clearTimeout(timeout));
      };
    };

    let cleanup: (() => void) | undefined;

    if (wasLoading && !isNowLoading && paginatedData.length > 0 && !hasAnimatedRef.current) {
      // Transición de loading a cargado
      cleanup = animateRowsSequentially();
    } else if (isNowLoading) {
      // Cuando empieza a cargar, resetear todo
      hasAnimatedRef.current = false;
      setShowRows(false);
      setRowsToShow([]);
    } else if (!isNowLoading && !wasLoading && paginatedData.length > 0 && rowsToShow.length === 0 && !hasAnimatedRef.current) {
      // Si los datos ya están cargados desde el inicio (sin transición de loading)
      // También animar secuencialmente
      cleanup = animateRowsSequentially();
    }

    // Actualizar la referencia del estado anterior
    previousLoadingRef.current = isNowLoading;

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, paginatedData.length, currentDataId]);

  // Componente para renderizar imágenes con manejo de errores
  const TableImageCell: React.FC<{
    src: string;
    defaultImage: string;
    width: number;
    height: number;
    alt: string;
    borderRadius: string;
  }> = ({ src, defaultImage, width, height, alt, borderRadius }) => {
    const [imageSrc, setImageSrc] = useState<string>(src || defaultImage);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      setImageSrc(src || defaultImage);
      setHasError(false);
    }, [src, defaultImage]);

    const handleError = () => {
      if (!hasError && imageSrc !== defaultImage) {
        setHasError(true);
        setImageSrc(defaultImage);
      }
    };

    const isLocalImage = imageSrc.startsWith('/');
    const isSvg = imageSrc.toLowerCase().endsWith('.svg');

    return (
      <Box
        sx={{
          width,
          height,
          position: 'relative',
          borderRadius,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {(isLocalImage || isSvg) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={alt}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <NextImage
            src={imageSrc}
            alt={alt}
            fill
            style={{ objectFit: 'cover' }}
            onError={handleError}
            unoptimized={true}
          />
        )}
      </Box>
    );
  };

  // Renderizar valor de celda
  const renderCellValue = (column: DataTableColumn, row: Record<string, unknown>): React.ReactNode => {
    const value = row[column.data];

    if (column.type === 'image') {
      const defaultImage = column.imageOptions?.defaultImage || '/images/icons/avatar.png';
      const imageUrl = (value as string) || defaultImage;
      const width = column.imageOptions?.width || 50;
      const height = column.imageOptions?.height || 50;
      const borderRadius = column.imageOptions?.className?.includes('rounded-circle') ? '50%' : '8px';

      return (
        <TableImageCell
          src={imageUrl}
          defaultImage={defaultImage}
          width={width}
          height={height}
          alt={column.imageOptions?.alt || ''}
          borderRadius={borderRadius}
        />
      );
    }

    if (column.type === 'html' || column.render) {
      const html = column.render
        ? column.render(String(value || ''), 'display', row)
        : String(value || '');
      return <Box dangerouslySetInnerHTML={{ __html: html }} sx={{ width: '100%' }} />;
    }

    return String(value || '');
  };

  // Manejar ordenamiento
  const handleSort = (columnKey: string) => {
    if (!ordering) return;
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Manejar acciones dropdown
  const handleActionMenuOpen = (rowIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEls(prev => ({
      ...prev,
      [rowIndex]: event.currentTarget
    }));
  };

  const handleActionMenuClose = (rowIndex: number) => {
    setAnchorEls(prev => ({
      ...prev,
      [rowIndex]: null
    }));
  };

  // Parsear HTML para extraer links y botones
  const parseActionLinks = (html: string): Array<{ href: string; text: string; onClick?: string; icon?: string }> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const actions: Array<{ href: string; text: string; onClick?: string; icon?: string }> = [];

    // Extraer links
    const links = doc.querySelectorAll('a');
    Array.from(links).forEach(link => {
      actions.push({
        href: link.getAttribute('href') || '#',
        text: link.textContent?.trim() || '',
        icon: link.getAttribute('data-icon') || undefined
      });
    });

    // Extraer botones con onclick
    const buttons = doc.querySelectorAll('button[onclick]');
    Array.from(buttons).forEach(button => {
      let onClick = button.getAttribute('onclick') || '';
      // Limpiar el onclick para remover return false y otros problemas
      onClick = onClick.replace(/return false;?/gi, '').trim();
      // Si termina con punto y coma, removerlo
      if (onClick.endsWith(';')) {
        onClick = onClick.slice(0, -1);
      }
      actions.push({
        href: '#',
        text: button.textContent?.trim() || '',
        onClick: onClick,
        icon: button.getAttribute('data-icon') || undefined
      });
    });

    return actions;
  };



  return (
    <Box component="div" sx={{ width: '100%', maxWidth: '100%', minWidth: '100%', boxSizing: 'border-box' }}>
      {/* Keyframes globales para animación de filas */}
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulseIn {
              0% {
                opacity: 0;
                transform: scale(0.7);
              }
              30% {
                opacity: 0.5;
                transform: scale(0.85);
              }
              60% {
                opacity: 0.8;
                transform: scale(1.05);
              }
              80% {
                transform: scale(0.98);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
          `,
        }}
      />
      {/* Search Input */}
      {searching && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={language.search || 'Buscar...'}
          />
        </Box>
      )}

      {/* Table Container */}
      <Box
        component="div"
        sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          backgroundColor: 'transparent',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header - Oculto en mobile */}
        {!isMobile && (
          <Box
            component="div"
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
              gap: 0,
              backgroundColor: 'transparent',
              borderBottom: 'none',
              width: '100%',
              minWidth: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
          {columns.map((column, idx) => {
            const isLast = idx === columns.length - 1;
            const isActionsColumn = column.title === 'ACCIONES' || (isLast && column.type === 'html' && column.render);
            const isSorted = sortColumn === column.data;

            return (
              <Box
                key={column.data}
                onClick={() => column.orderable !== false && handleSort(column.data)}
                sx={{
                  padding: { xs: 1.5, md: 2 },
                  borderBottom: '2px solid rgba(41, 196, 128, 0.2)',
                  backgroundColor: '#080808',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.875rem',
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 500,
                  cursor: column.orderable !== false ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                  '&:hover': {
                    backgroundColor: 'rgba(41, 196, 128, 0.08)',
                    borderBottom: '2px solid rgba(41, 196, 128, 0.4)',
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                  ...(isSorted && {
                    color: '#29C480',
                  }),
                }}
              >
                {!isActionsColumn && column.title}
                {isSorted && !isActionsColumn && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </Box>
                )}
              </Box>
            );
          })}
          </Box>
        )}

          {/* Rows */}
          {isLoading ? (
            // Loading skeleton
            isMobile ? (
              // Mobile skeleton
              Array.from({ length: pageLength }).map((_, idx) => (
                <Accordion
                  key={`skeleton-mobile-${idx}`}
                  disabled
                  sx={{
                    backgroundColor: 'rgba(8, 8, 8, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    mb: 2,
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary>
                    <Skeleton variant="text" width="100%" height={30} />
                  </AccordionSummary>
                </Accordion>
              ))
            ) : (
              // Desktop skeleton
              Array.from({ length: pageLength }).map((_, idx) => (
                <Box
                  key={`skeleton-${idx}`}
                  component="div"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                    gap: 0,
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    width: '100%',
                    minWidth: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  {columns.map((col, colIdx) => (
                    <Box
                      key={colIdx}
                      sx={{
                        padding: { xs: 1.5, md: 2 },
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Skeleton
                        variant="text"
                        width="100%"
                        height={20}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '&::after': {
                            background: 'linear-gradient(90deg, transparent, rgba(41, 196, 128, 0.1), transparent)',
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              ))
            )
          ) : sortedData.length === 0 ? (
            <Box
              component="div"
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                gap: 0,
                backgroundColor: 'transparent',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                width: '100%',
                minWidth: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  gridColumn: '1 / -1',
                  padding: { xs: 1.5, md: 2 },
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {language.infoEmpty || "No se encontraron resultados"}
              </Box>
            </Box>
          ) : isMobile ? (
            // Mobile Accordion View
            paginatedData.map((row, rowIndex) => {
            const globalRowIndex = (currentPage - 1) * pageLength + rowIndex;
            const isExpanded = expandedRows.has(globalRowIndex);

            // Obtener la primera columna para el título del acordeón (excluyendo acciones)
            const firstColumn = columns.find(col => col.title !== 'ACCIONES' && !(col.type === 'html' && col.render && col === columns[columns.length - 1])) || columns[0];
            const firstColumnValue = firstColumn ? renderCellValue(firstColumn, row) : '';
            const summaryText = firstColumn
              ? `${firstColumn.title}: ${typeof firstColumnValue === 'string' ? firstColumnValue : String(firstColumnValue)}`
              : `Fila ${rowIndex + 1}`;

            // Obtener acciones
            const actionsColumn = columns.find(col => col.title === 'ACCIONES' || (col.type === 'html' && col.render && col === columns[columns.length - 1]));
            const actionLinks = actionsColumn?.render
              ? parseActionLinks(actionsColumn.render('', 'display', row))
              : [];

            // Obtener columnas sin acciones y sin la primera columna (ya está en el header) para mostrar en el contenido
            const dataColumns = columns.filter(col => {
              const isActions = col.title === 'ACCIONES' || (col.type === 'html' && col.render && col === columns[columns.length - 1]);
              const isFirstColumn = col === firstColumn;
              return !isActions && !isFirstColumn;
            });

            const handleAccordionChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
              setExpandedRows(() => {
                // Si se está expandiendo, solo mantener este acordeón abierto (cerrar los demás)
                if (isExpanded) {
                  return new Set([globalRowIndex]);
                } else {
                  // Si se está cerrando, simplemente remover este índice
                  return new Set();
                }
              });
            };

            return (
              <Accordion
                key={globalRowIndex}
                expanded={isExpanded}
                onChange={handleAccordionChange}
                sx={{
                  backgroundColor: rowIndex % 2 === 0 ? 'rgba(8, 8, 8, 0.3)' : 'rgba(8, 8, 8, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  mb: 0,
                  borderRadius: 0,
                  '&:before': { display: 'none' },
                  '&:first-of-type': {
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  },
                  '&:last-of-type': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    mb: 0,
                  },
                  '&.Mui-expanded': {
                    backgroundColor: 'rgba(41, 196, 128, 0.08)',
                    borderColor: 'rgba(41, 196, 128, 0.2)',
                    margin: 0,
                  },
                  '& + &': {
                    borderTop: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#29C480' }} />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      my: 1.5,
                      overflow: 'hidden',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      overflow: 'hidden',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {summaryText}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    pt: 0,
                    pb: 2,
                    px: 2,
                  }}
                >
                  <Stack spacing={2}>
                    {/* Datos de la fila */}
                    {dataColumns.map((column) => {
                      const cellValue = renderCellValue(column, row);
                      return (
                        <Box
                          key={column.data}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}
                          >
                            {column.title}
                          </Typography>
                          <Box
                            sx={{
                              color: '#ffffff',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                              wordBreak: 'break-word',
                            }}
                          >
                            {cellValue}
                          </Box>
                        </Box>
                      );
                    })}

                    {/* Acciones como botones */}
                    {actionLinks.length > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          mt: 1,
                          pt: 2,
                          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Typography
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            mb: 0.5,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          ACCIONES
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {actionLinks.map((link, linkIndex) => (
                            <Button
                              key={linkIndex}
                              variant="primary"
                              size="sm"
                              fullWidth={actionLinks.length === 1}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (link.href && link.href !== '#') {
                                  router.push(link.href);
                                }
                              }}
                              sx={{
                                flex: actionLinks.length > 1 ? '1 1 auto' : '1 1 100%',
                                minWidth: actionLinks.length > 1 ? '120px' : 'auto',
                              }}
                            >
                              {link.text}
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })
          ) : (
            // Desktop Grid View
            paginatedData.map((row, rowIndex) => {
            const globalRowIndex = (currentPage - 1) * pageLength + rowIndex;

            // Simplified animation logic:
            // - Row is visible if it's in rowsToShow OR all animations are complete
            // - Animation is applied when row is in rowsToShow (CSS handles the rest)
            const isInRowsToShow = rowsToShow.includes(rowIndex);
            const allAnimationsComplete = hasAnimatedRef.current;
            const shouldShow = !isLoading && (isInRowsToShow || allAnimationsComplete);

            const isEven = rowIndex % 2 === 0;

            // TODO: Row animation disabled - was causing laggy/broken appearance
            // Re-enable and fix properly when there's time for polish
            // const shouldApplyAnimation = isInRowsToShow;

            return (
              <Box
                component="div"
                key={globalRowIndex}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                  gap: 0,
                  backgroundColor: isEven ? 'rgba(8, 8, 8, 0.3)' : 'rgba(8, 8, 8, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '100%',
                  minWidth: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  // Simple instant display - no animation
                  opacity: shouldShow ? 1 : 0,
                  transform: 'scale(1)',
                  animation: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(41, 196, 128, 0.08)',
                    '& > div': {
                      borderBottom: '1px solid rgba(41, 196, 128, 0.2)',
                      color: '#34d399',
                      fontWeight: 600,
                    },
                  },
                }}
              >
                {columns.map((column, colIdx) => {
                  const isLast = colIdx === columns.length - 1;
                  const isActionsColumn = column.title === 'ACCIONES' || (isLast && column.type === 'html' && column.render);
                  const cellValue = renderCellValue(column, row);

                  if (isActionsColumn) {
                    // Obtener el HTML renderizado
                    const renderedHtml = column.render
                      ? column.render('', 'display', row)
                      : '';

                    // Acciones dropdown con Menu de MUI
                    const actionLinks = parseActionLinks(renderedHtml);

                    // Siempre mostrar el dropdown
                    return (
                      <Box
                        key={column.data}
                        sx={{
                          padding: { xs: 1.5, md: 2 },
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          overflow: 'hidden',
                        }}
                      >
                        <IconButton
                          ref={(el) => {
                            actionButtonRefs.current[globalRowIndex] = el;
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionMenuOpen(globalRowIndex, e);
                          }}
                          sx={{
                            width: '32px',
                            height: '32px',
                            minHeight: '32px',
                            padding: 0,
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'rgba(41, 196, 128, 0.1)',
                            },
                          }}
                          aria-label="Más opciones"
                        >
                          <MoreVert sx={{ fontSize: 28 }} />
                        </IconButton>

                        <Menu
                          anchorEl={anchorEls[globalRowIndex] || null}
                          open={Boolean(anchorEls[globalRowIndex])}
                          onClose={() => handleActionMenuClose(globalRowIndex)}
                          sx={{
                            '& .MuiPaper-root': {
                              background: '#111827',
                              borderRadius: '0px',
                              mt: 2,
                              minWidth: 200,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                              border: 'none',
                            },
                          }}
                          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                          {actionLinks.length > 0 ? (
                            actionLinks.map((link, linkIndex) => (
                              <MenuItem
                                key={linkIndex}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleActionMenuClose(globalRowIndex);
                                  if (link.onClick) {
                                    // Ejecutar el onclick del botón
                                    try {
                                      // Crear una función que tenga acceso a window para las funciones globales
                                      const func = new Function('handlePausedClick', 'handleDeleteClick', link.onClick);
                                      // Pasar las funciones globales como parámetros
                                      const windowWithHandlers = window as Window & {
                                        handlePausedClick?: () => void;
                                        handleDeleteClick?: () => void;
                                      };
                                      func(
                                        windowWithHandlers.handlePausedClick,
                                        windowWithHandlers.handleDeleteClick
                                      );
                                    } catch (error) {
                                      console.error('Error ejecutando acción:', error);
                                      // Fallback a eval si new Function falla
                                      try {
                                        // eslint-disable-next-line no-eval
                                        eval(link.onClick);
                                      } catch (evalError) {
                                        console.error('Error con eval fallback:', evalError);
                                      }
                                    }
                                  } else if (link.href && link.href !== '#') {
                                    router.push(link.href);
                                  }
                                }}
                                sx={{
                                  px: 2,
                                  py: 2,
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  borderLeft: '3px solid transparent',
                                  cursor: 'pointer',
                                  color: '#ffffff',
                                  '&:hover': {
                                    backgroundColor: '#374151',
                                    borderLeftColor: '#22c55e',
                                  },
                                }}
                              >
                                <Typography variant="body2" sx={{
                                  fontWeight: 600,
                                  fontSize: '1rem'
                                }}>
                                  {link.text}
                                </Typography>
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled sx={{ px: 2, py: 2, color: 'rgba(255, 255, 255, 0.5)' }}>
                              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                No hay acciones disponibles
                              </Typography>
                            </MenuItem>
                          )}
                        </Menu>
                      </Box>
                    );
                  }

                  return (
                    <Box
                      key={column.data}
                      sx={{
                        padding: { xs: 1.5, md: 2 },
                        color: '#ffffff',
                        fontSize: { xs: '0.875rem', md: '1rem' },
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        width: '100%',
                        maxWidth: '100%',
                        ...(isLast && {
                          flexShrink: 0,
                          overflow: 'visible',
                          textOverflow: 'clip',
                          whiteSpace: 'normal',
                        }),
                      }}
                    >
                      {cellValue}
                    </Box>
                  );
                })}
              </Box>
            );
          })
          )}
      </Box>

      {/* Footer con paginación */}
      {pagination && sortedData.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mt: 4,
          }}
        >
          {/* Info de paginación */}
          {showingFrom > 0 && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                fontSize: '0.875rem',
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              Mostrando {showingFrom} - {showingTo} de {sortedData.length}
            </Typography>
          )}

          {/* Paginación - siempre visible */}
          <Box sx={{ flex: { sm: '0 0 auto' } }}>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(totalPages, 1)}
              onPageChange={setCurrentPage}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DataTable;
