"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Description, Download } from '@mui/icons-material';
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { Stack } from "@/presentation/@shared/components/ui/molecules/stack";
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { useProducts } from "@/presentation/@shared/hooks/use-products";
import { LoadingSpinner } from "@/presentation/@shared/components/ui/atoms/loading-spinner";
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

interface XLSXLib {
  utils: {
    book_new: () => unknown;
    aoa_to_sheet: (data: unknown[][]) => unknown;
    book_append_sheet: (wb: unknown, ws: unknown, name: string) => void;
    sheet_to_json: (sheet: unknown, opts?: { defval?: string }) => unknown[];
  };
  writeFile: (wb: unknown, filename: string) => void;
  read: (data: Uint8Array, opts: { type: string }) => { SheetNames: string[]; Sheets: Record<string, unknown> };
}

declare global {
  interface Window { XLSX?: XLSXLib }
}

// const columns: DataTableColumn[] = [
//   { title: 'ID', data: 'id', responsivePriority: 1 },
//   { title: 'Producto', data: 'name', responsivePriority: 1 },
//   { title: 'Precio', data: 'price', responsivePriority: 3 },
//   { title: 'Envío', data: 'shipping', responsivePriority: 4 },
//   { title: 'Promoción', data: 'promo', responsivePriority: 5 },
//   {
//     title: 'Estado', data: 'status', type: 'html', responsivePriority: 6,
//     render: function(data: unknown, type: string) {
//       if (type === 'display') {
//         const isActive = (data as string) === 'Activo';
//         const statusText = isActive ? 'Activo' : 'Inactivo';
//         const bgColor = isActive ? 'rgba(41, 196, 128, 0.2)' : 'rgba(101, 116, 45, 0.3)';
//         const borderColor = isActive ? '#29C480' : '#D4AF37';
//         const textColor = isActive ? '#29C480' : '#D4AF37';
//         
//         return `
//           <div style="
//             display: inline-flex;
//             align-items: center;
//             justify-content: center;
//             padding: 4px 12px;
//             border-radius: 8px;
//             background-color: ${bgColor};
//             border: 1px solid ${borderColor};
//             color: ${textColor};
//             font-size: 0.875rem;
//             font-weight: 600;
//             font-family: 'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
//             white-space: nowrap;
//           ">
//             ${statusText}
//           </div>
//         `;
//       }
//       return data as string;
//     }
//   },
//   {
//     title: 'Acción', data: 'id', orderable: false, searchable: false, type: 'html',
//     render: function (data: unknown, type: string, row: Record<string, unknown>) {
//       return `
//         <div class="d-flex gap-2 align-items-center">
//            <a class="table-btn-success btn btn-sm me-2" style="min-width: 70px;" href="/admin/panel/products/${row.id}">Editar</a>
//         </div>`;
//     },
//     responsivePriority: 1
//   },
// ]

interface ParsedRow {
  name: string;
  priceUSDT: number;
  priceARS?: number;
  category: string;
  year: number;
  condition: string;
  description: string;
  promotion?: string;
  brand?: string;
  model?: string;
  dimensionsWidth?: number;
  dimensionsHeight?: number;
  dimensionsDepth?: number;
  dimensionsUnit?: string;
  weightValue?: number;
  weightUnit?: string;
}

// interface ProductRow {
//   id: string;
//   name: string;
//   price: number;
//   shipping_id?: string;
//   promotion?: string;
//   active_status: number;
// }

export default function UploadMassivePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const xlsxLoadedRef = useRef(false);
  // const [uploadKey, setUploadKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // cargar XLSX desde CDN cuando sea necesario
  useEffect(() => {
    if (xlsxLoadedRef.current) return;
    const existing = document.querySelector('script[data-sheetjs]');
    if (existing) { xlsxLoadedRef.current = true; return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';
    s.async = true;
    s.setAttribute('data-sheetjs','true');
    s.onload = () => { xlsxLoadedRef.current = true; };
    document.head.appendChild(s);
  }, []);

  // leer accountId desde localStorage
  useEffect(() => {
    try {
      const raw = globalThis.localStorage?.getItem('user');
      const user = raw ? JSON.parse(raw) as { id?: string } : undefined;
      setAccountId(user?.id);
    } catch {
      setAccountId(undefined);
    }
  }, []);

  const { useProductsByAccountId } = useProducts();
  const bulkCreate = async (rows: Record<string, unknown>[], accId?: string) => {
    try {
      await (await import('../../../../@shared/helpers/axios-helper')).axiosHelper.products.bulkCreate(rows, accId);
    } catch (e) { throw e; }
  };

  const productsQuery = useProductsByAccountId(accountId || '');

  // const tableData = useMemo(() => {
  //   try {
  //     // Verificar que productsQuery.data exista y sea un array
  //     if (!productsQuery || !productsQuery.data) {
  //       return [];
  //     }
  //     
  //     const data = productsQuery.data;
  //     if (!Array.isArray(data)) {
  //       return [];
  //     }
  //     
  //     // Verificar que el array no esté vacío y tenga la estructura correcta
  //     if (data.length === 0) {
  //       return [];
  //     }
  //     
  //     const items = data as ProductRow[];
  //     return items.map((p) => {
  //       // Validar que cada producto tenga las propiedades necesarias
  //       if (!p || typeof p !== 'object') {
  //         return null;
  //       }
  //       return {
  //         id: p.id || '',
  //         name: p.name || 'Sin nombre',
  //         price: p.price || 0,
  //         shipping: p.shipping_id ? 'Sí' : 'No',
  //         promo: p.promotion || 'Ninguna',
  //         status: p.active_status === 1 ? 'Activo' : 'Inactivo'
  //       };
  //     }).filter((item): item is NonNullable<typeof item> => item !== null);
  //   } catch (error) {
  //     console.error('Error processing table data:', error);
  //     return [];
  //   }
  // }, [productsQuery?.data]);

  const downloadTemplate = () => {
    if (!window.XLSX) { 
      // Si XLSX no está disponible, intentar cargarlo
      toast.info('Cargando librería XLSX, por favor espera unos segundos y vuelve a intentar');
      // Intentar cargar XLSX si no está disponible
      if (!xlsxLoadedRef.current) {
        const existing = document.querySelector('script[data-sheetjs]');
        if (!existing) {
          const s = document.createElement('script');
          s.src = 'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';
          s.async = true;
          s.setAttribute('data-sheetjs','true');
          s.onload = () => { 
            xlsxLoadedRef.current = true;
            toast.success('Librería cargada, puedes descargar la plantilla ahora');
          };
          document.head.appendChild(s);
        }
      }
      return; 
    }
    try {
      const XLSX = window.XLSX;
      const wb = XLSX.utils.book_new();
      // Plantilla actualizada con la nueva estructura de productos
      const data = [
        // Encabezados
        ['name', 'priceUSDT', 'priceARS', 'category', 'year', 'condition', 'description', 'promotion', 'brand', 'model', 'dimensionsWidth', 'dimensionsHeight', 'dimensionsDepth', 'dimensionsUnit', 'weightValue', 'weightUnit'],
        // Ejemplos
        ['Auriculares Sony WH-1000XM4', 350, 350000, 'Electrodomesticos y Aires ac.', 2023, 'new', 'Noise Cancelling, BT 5.0', 'Ninguna', 'Sony', 'WH-1000XM4', 20, 20, 8, 'cm', 250, 'g'],
        ['Remera básica algodón', 25, 25000, 'Moda', 2024, 'new', 'Remera unisex 100% algodón peinado', 'Descuento 10%', 'Básico', 'Algodón', 30, 40, 2, 'cm', 150, 'g'],
        ['Pelota fútbol tamaño 5', 40, 40000, 'Deportes', 2024, 'new', 'Pelota profesional cosida a máquina', 'Ninguna', 'Nike', 'Tamaño 5', 22, 22, 22, 'cm', 400, 'g'],
        ['Libro: Clean Code', 40, 40000, 'Libros', 2021, 'used', 'Libro usado en buen estado', 'Ninguna', '', '', 15, 23, 2, 'cm', 300, 'g'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');
      XLSX.writeFile(wb, 'plantilla-productos.xlsx');
      toast.success('Plantilla descargada correctamente');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Error al descargar la plantilla. Intenta nuevamente.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setParsedRows([]);
    
    // Validar extensión
    if (!/\.xlsx$/i.test(file.name)) { 
      toast.error('El archivo debe ser .xlsx'); 
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return; 
    }
    
    if (!window.XLSX) { 
      toast.info('Cargando librería XLSX, intenta nuevamente en unos segundos'); 
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return; 
    }

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (!window.XLSX) { 
          toast.error('XLSX no está disponible'); 
          setIsParsing(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return; 
        }
        const XLSX = window.XLSX;
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const first = wb.SheetNames[0];
        const sheet = wb.Sheets[first];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        
        // Verificar que rows sea un array válido
        if (!rows || !Array.isArray(rows)) {
          toast.error('El archivo no contiene datos válidos');
          setIsParsing(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
        
        // normalizar con la nueva estructura
        const normalized = (rows as Record<string, unknown>[]).map((r) => ({
          name: String(r.name || r.Nombre || '').trim(),
          priceUSDT: Number(r.priceUSDT || r.price || r.Precio || 0),
          priceARS: r.priceARS ? Number(r.priceARS) : undefined,
          category: String(r.category || r.categoria || 'Electrodomesticos y Aires ac.').trim(),
          year: Number(r.year || r.año || r.anio || new Date().getFullYear()),
          condition: String(r.condition || r.condicion || 'new').trim(),
          description: String(r.description || r.descripcion || ''),
          promotion: r.promotion ? String(r.promotion || r.promocion || '').trim() : undefined,
          brand: r.brand ? String(r.brand || r.marca || '').trim() : undefined,
          model: r.model ? String(r.model || r.modelo || '').trim() : undefined,
          dimensionsWidth: r.dimensionsWidth ? Number(r.dimensionsWidth) : undefined,
          dimensionsHeight: r.dimensionsHeight ? Number(r.dimensionsHeight) : undefined,
          dimensionsDepth: r.dimensionsDepth ? Number(r.dimensionsDepth) : undefined,
          dimensionsUnit: r.dimensionsUnit ? String(r.dimensionsUnit).trim() : undefined,
          weightValue: r.weightValue ? Number(r.weightValue) : undefined,
          weightUnit: r.weightUnit ? String(r.weightUnit).trim() : undefined
        })).filter(r => r.name && r.priceUSDT > 0);
        
        setParsedRows(normalized);
        
        if (normalized.length > 0) {
          toast.success(`Archivo válido: ${normalized.length} productos listos para cargar`);
        } else {
          toast.error('El archivo no contiene productos válidos. Verifica que tenga las columnas requeridas.');
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('No se pudo leer el archivo XLSX. Revisa el formato.');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBoxClick = () => {
    if (isParsing || isImporting) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setParsedRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedRows || !Array.isArray(parsedRows) || !parsedRows.length) { 
      toast.error('No hay productos válidos para importar'); 
      return; 
    }
    if (!accountId) { 
      toast.error('No se pudo determinar tu cuenta'); 
      return; 
    }
    setIsImporting(true);
    try {
      // Construir el objeto pricing según la nueva estructura
      const rows = parsedRows.map((row) => {
        // Construir pricing con la estructura correcta
        const pricingValues: Array<{ currency: string; amount: number; usdPerUnit: number }> = [];
        
        // Agregar USDT (siempre presente)
        if (row.priceUSDT > 0) {
          pricingValues.push({
            currency: 'USDT',
            amount: row.priceUSDT,
            usdPerUnit: 1
          });
        }
        
        // Agregar ARS si está disponible
        if (row.priceARS && row.priceARS > 0 && row.priceUSDT > 0) {
          const usdPerUnit = row.priceUSDT / row.priceARS;
          pricingValues.push({
            currency: 'ARS',
            amount: row.priceARS,
            usdPerUnit: usdPerUnit
          });
        }
        
        // Si no hay valores, usar USDT por defecto
        if (pricingValues.length === 0 && row.priceUSDT > 0) {
          pricingValues.push({
            currency: 'USDT',
            amount: row.priceUSDT,
            usdPerUnit: 1
          });
        }
        
        const pricing = {
          referenceBase: 'USD',
          referenceAt: new Date().toISOString(),
          values: pricingValues
        };
        
        // Construir meta si hay datos técnicos
        const meta: Record<string, unknown> = {};
        const technicalSheet: Record<string, unknown> = {};
        
        if (row.brand || row.model) {
          if (row.brand) technicalSheet.brand = row.brand;
          if (row.model) technicalSheet.model = row.model;
        }
        
        const specs: Record<string, unknown> = {};
        
        // Dimensiones
        if (row.dimensionsWidth || row.dimensionsHeight || row.dimensionsDepth || row.dimensionsUnit) {
          const dimensions: Record<string, unknown> = {};
          if (row.dimensionsWidth) dimensions.width = row.dimensionsWidth;
          if (row.dimensionsHeight) dimensions.height = row.dimensionsHeight;
          if (row.dimensionsDepth) dimensions.depth = row.dimensionsDepth;
          if (row.dimensionsUnit) dimensions.unit = row.dimensionsUnit;
          if (Object.keys(dimensions).length > 0) {
            specs.dimensions = dimensions;
          }
        }
        
        // Peso
        if (row.weightValue || row.weightUnit) {
          const weight: Record<string, unknown> = {};
          if (row.weightValue) weight.value = row.weightValue;
          if (row.weightUnit) weight.unit = row.weightUnit;
          if (Object.keys(weight).length > 0) {
            specs.weight = weight;
          }
        }
        
        if (Object.keys(specs).length > 0) {
          technicalSheet.specs = specs;
        }
        
        if (Object.keys(technicalSheet).length > 0) {
          meta.technicalSheet = technicalSheet;
        }
        
        return {
          name: row.name,
          pricing: pricing,
          description: row.description || undefined,
          categoryIdentificationCode: row.category,
          status: 'active',
          promotion: row.promotion && row.promotion !== 'Ninguna' ? row.promotion : undefined,
          year: Number(row.year) || new Date().getFullYear(),
          condition: (row.condition || 'new').toLowerCase() === 'used' ? 'used' : 'new',
          activeStatus: 1,
          ...(Object.keys(meta).length > 0 ? { meta } : {})
        };
      });
      
      await bulkCreate(rows, accountId);
      toast.success(`¡Importación exitosa! ${rows.length} productos creados correctamente`);
      // Refrescar lista de productos al finalizar correctamente
      try { 
        await productsQuery.refetch(); 
      } catch (error) {
        console.error('Error refetching products:', error);
      }
      // Redirigir a la página de productos después de una carga exitosa
      router.push('/admin/panel/products');
    } catch (error) {
      console.error('Error en importación masiva:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al importar productos: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: "100%",
        backgroundColor: '#000000',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: 'Carga Masiva de Productos' }
              ]}
            />

            {/* Panel de carga de archivo */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                backgroundColor: "rgba(41, 196, 128, 0.08)",
                border: "2px solid rgba(41, 196, 128, 0.2)",
                borderRadius: "24px",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                padding: { xs: 3, md: 4 },
                gap: 3,
                cursor: "default",
                "&:hover": {
                  backgroundColor: "rgba(41, 196, 128, 0.12)",
                  borderColor: "rgba(41, 196, 128, 0.4)",
                },
              }}
            >
              <Stack spacing={3}>
                {/* Título y descripción */}
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Carga masiva de productos
                  </Typography>
                  <Text 
                    variant="p"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      lineHeight: 1.6
                    }}
                  >
                    Importa múltiples productos de una vez cargando un archivo Excel (.xlsx). 
                    Asegúrate de usar la plantilla correcta para un mejor resultado.
                  </Text>
                </Box>


                {/* Área de carga */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    width: '100%'
                  }}
                >
                  {/* Upload y acciones - 70% */}
                  <Box
                    onClick={(isParsing || isImporting) ? undefined : handleBoxClick}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: { xs: 'stretch', md: 'center' },
                      justifyContent: 'center',
                      gap: 2,
                      p: 3,
                      borderRadius: '16px',
                      border: '2px dashed rgba(41, 196, 128, 0.3)',
                      backgroundColor: 'rgba(41, 196, 128, 0.05)',
                      width: { xs: '100%', md: '70%' },
                      transition: 'all 0.3s ease',
                      cursor: (isParsing || isImporting) ? 'not-allowed' : 'pointer',
                      opacity: (isParsing || isImporting) ? 0.6 : 1,
                      pointerEvents: (isParsing || isImporting) ? 'none' : 'auto',
                      '&:hover': {
                        borderColor: (isParsing || isImporting) ? 'rgba(41, 196, 128, 0.3)' : 'rgba(41, 196, 128, 0.5)',
                        backgroundColor: (isParsing || isImporting) ? 'rgba(41, 196, 128, 0.05)' : 'rgba(41, 196, 128, 0.1)',
                      }
                    }}
                  >
                    {/* Input file oculto */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileInputChange}
                      disabled={isParsing || isImporting}
                      style={{ display: 'none' }}
                    />
                    
                    {!selectedFile ? (
                      <>
                        <CloudUploadIcon 
                          sx={{ 
                            fontSize: '2.5rem', 
                            color: '#34d399', 
                            alignSelf: 'center',
                            opacity: isParsing ? 0.5 : 1
                          }} 
                        />
                        <Text 
                          variant="span"
                          weight="medium"
                          align="center"
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '0.875rem',
                            mb: 1
                          }}
                        >
                          ¿Listo para importar?
                        </Text>
                        <Text 
                          variant="span"
                          align="center"
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.8125rem',
                            mb: 2
                          }}
                        >
                          Haz clic para seleccionar tu archivo Excel
                        </Text>
                        {isParsing && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                            <LoadingSpinner size="medium" color="success" />
                          </Box>
                        )}
                      </>
                    ) : (
                      <>
                        <Description sx={{ color: '#34d399', fontSize: '2rem', alignSelf: 'center' }} />
                        <Text 
                          variant="span" 
                          weight="medium"
                          align="center"
                          sx={{ 
                            color: '#34d399',
                            fontSize: '0.875rem',
                            wordBreak: 'break-word',
                            mb: 1
                          }}
                        >
                          {selectedFile.name}
                        </Text>
                        {parsedRows.length > 0 ? (
                          <>
                            <Text 
                              variant="span"
                              align="center"
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                mb: 2
                              }}
                            >
                              {parsedRows.length} {parsedRows.length === 1 ? 'producto' : 'productos'} listos para cargar
                            </Text>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                width: '100%', 
                                mt: 2,
                                flexDirection: { xs: 'column', sm: 'row' }
                              }}
                            >
                              <Button
                                variant="primary"
                                size="md"
                                disabled={isImporting}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelFile();
                                }}
                                sx={{ 
                                  flex: { xs: '1', sm: '0 0 auto' },
                                  minWidth: { xs: '100%', sm: '140px' },
                                  background: '#ef4444',
                                  color: '#fff',
                                  borderColor: '#ef4444',
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  padding: '12px 32px',
                                  backgroundImage: 'unset',
                                  boxShadow: 'unset',
                                  textShadow: 'unset',
                                  transition: 'background-color 0.3s ease, color 0.3s ease',
                                  '&:hover': {
                                    background: '#dc2626',
                                    color: '#fff',
                                    borderColor: '#dc2626',
                                    backgroundImage: 'unset',
                                    boxShadow: 'unset',
                                  }
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button
                                variant="primary"
                                size="md"
                                disabled={isImporting}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleConfirmImport();
                                }}
                                isLoading={isImporting}
                                sx={{ 
                                  flex: 1,
                                  background: '#29C480',
                                  color: '#1e293b',
                                  borderColor: '#29C480',
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  padding: '12px 32px',
                                  backgroundImage: 'unset',
                                  boxShadow: 'unset',
                                  textShadow: 'unset',
                                  transition: 'background-color 0.3s ease, color 0.3s ease',
                                  '&:hover': {
                                    background: '#ffffff',
                                    color: '#000000',
                                    borderColor: '#29C480',
                                    backgroundImage: 'unset',
                                    boxShadow: 'unset',
                                  }
                                }}
                              >
                                {isImporting ? 'Cargando productos...' : 'Cargar productos'}
                              </Button>
                            </Box>
                          </>
                        ) : (
                          <Text 
                            variant="span"
                            align="center"
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.875rem'
                            }}
                          >
                            Procesando archivo...
                          </Text>
                        )}
                      </>
                    )}
                  </Box>

                  {/* Botón de descarga de plantilla - 30% */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: { xs: 'stretch', md: 'center' },
                      justifyContent: 'center',
                      gap: 2,
                      p: 3,
                      borderRadius: '16px',
                      border: '2px solid rgba(71, 85, 105, 0.3)',
                      backgroundColor: 'rgba(30, 41, 59, 0.3)',
                      width: { xs: '100%', md: '30%' }
                    }}
                  >
                    <Download sx={{ fontSize: '2.5rem', color: '#94a3b8', alignSelf: 'center' }} />
                    <Text 
                      variant="span"
                      weight="medium"
                      align="center"
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.875rem',
                        mb: 1
                      }}
                    >
                      ¿No tienes la plantilla?
                    </Text>
                    <Text 
                      variant="span"
                      align="center"
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.8125rem',
                        mb: 2
                      }}
                    >
                      Descarga nuestro formato estándar con ejemplos
                    </Text>
                    <Button 
                      variant="primary" 
                      size="md" 
                      onClick={downloadTemplate}
                      sx={{ width: '100%' }}
                    >
                      Descargar Plantilla
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Box>

          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
