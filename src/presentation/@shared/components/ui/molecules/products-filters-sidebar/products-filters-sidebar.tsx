'use client';

import React from 'react';
import { Box, Typography, Button, CircularProgress, Drawer, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Link from 'next/link';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Input } from '@/presentation/@shared/components/ui/atoms/input';
import { DropdownButton } from '@/presentation/@shared/components/ui/molecules/dropdown-button';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { CategoryEntity } from '@/presentation/@shared/types/product';
import { ProductsFiltersState } from '@/presentation/@shared/hooks/use-products-filters';
import { useIsMobile } from '@/presentation/@shared/hooks/use-is-mobile';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { useRouter } from 'next/navigation';

interface ProductsFiltersSidebarProps {
  filters: ProductsFiltersState;
  updateFilter: <K extends keyof ProductsFiltersState>(key: K, value: ProductsFiltersState[K]) => void;
  applyFilters: () => void;
  isLoading: boolean;
  productsCount: number;
  categories?: CategoryEntity[];
  showMoreCategories?: boolean;
  onToggleCategories?: () => void;
  currentCategoryId?: string;
}

const ProductsFiltersSidebarComponent: React.FC<ProductsFiltersSidebarProps> = ({
  filters,
  updateFilter,
  applyFilters,
  isLoading,
  productsCount,
  categories,
  showMoreCategories = false,
  onToggleCategories,
  currentCategoryId,
}) => {
  const { t } = useLanguage();
  const router = useRouter();
  const { error: showErrorToast } = useToast();
  const isMobile = useIsMobile(1200); // Usar lg breakpoint (1200px) para que tablets se comporten como mobile
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [filtersExpanded, setFiltersExpanded] = React.useState(true); // Expandido por defecto
  const [categoriesExpanded, setCategoriesExpanded] = React.useState(false); // Cerrado por defecto
  const isButtonClickRef = React.useRef(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  
  // Input de búsqueda como UNCONTROLLED - completamente independiente, NO se sincroniza automáticamente
  // Usamos ref para obtener el valor solo cuando se hace click en "Filter"
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  
  // Estado local SOLO para inicializar el defaultValue del input (solo se establece una vez)
  // NO se actualiza mientras el usuario escribe
  const [initialSearchValue] = React.useState(() => filters.search || '');
  
  // Ref para almacenar el último valor aplicado - usado para restaurar el valor si se pierde
  const lastAppliedValueRef = React.useRef<string>(filters.search || '');

  // Inputs de año como UNCONTROLLED - misma implementación que search
  const yearFromInputRef = React.useRef<HTMLInputElement | null>(null);
  const yearToInputRef = React.useRef<HTMLInputElement | null>(null);
  
  // Estados locales SOLO para inicializar el defaultValue (solo se establece una vez)
  const [initialYearFromValue] = React.useState(() => filters.yearFrom || '');
  const [initialYearToValue] = React.useState(() => filters.yearTo || '');
  
  // Refs para almacenar los últimos valores aplicados
  const lastAppliedYearFromRef = React.useRef<string>(filters.yearFrom || '');
  const lastAppliedYearToRef = React.useRef<string>(filters.yearTo || '');
  
  // Estado para validación de error (yearTo < yearFrom)
  const [yearToError, setYearToError] = React.useState(false);
  
  // NO usar useEffect/useLayoutEffect aquí - causa pérdida de foco mientras se escribe
  // La sincronización se hará solo cuando sea necesario (clearAllFilters cuando NO está enfocado)
  // Usando una técnica diferente: solo actualizar cuando realmente sea necesario sin efectos

  const conditionOptions = [
    { value: '', label: t.categories.select, native: t.categories.select },
    { value: 'new', label: t.categories.new, native: t.categories.new },
    { value: 'used', label: t.categories.used, native: t.categories.used },
  ];

  const categoryOptions = React.useMemo(() => {
    if (!categories) return [];
    return [
      { value: '', label: t.categories.select, native: t.categories.select },
      ...categories.map(cat => ({
        value: cat.id,
        label: cat.name,
        native: cat.name,
      })),
    ];
  }, [categories, t]);

  const shippingOptions = [
    { value: '', label: t.categories.select, native: t.categories.select },
    { value: 'Express', label: 'Express', native: 'Express' },
    { value: 'Standard', label: 'Estándar', native: 'Estándar' },
    { value: 'Economy', label: 'Económico', native: 'Económico' },
  ];

  const sortByOptions = [
    { value: 'creation_date', label: 'Fecha de creación', native: 'Fecha de creación' },
    { value: 'price', label: 'Precio', native: 'Precio' },
    { value: 'name', label: 'Nombre', native: 'Nombre' },
    { value: 'visits', label: 'Visitas', native: 'Visitas' },
    { value: 'sales', label: 'Ventas', native: 'Ventas' },
    { value: 'year', label: 'Año', native: 'Año' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Descendente', native: 'Descendente' },
    { value: 'asc', label: 'Ascendente', native: 'Ascendente' },
  ];

  const handleApplyFilters = React.useCallback(() => {
    // Obtener el valor directamente del input DOM (uncontrolled)
    const inputElement = searchInputRef.current || document.getElementById('search-product') as HTMLInputElement | null;
    const currentValue = inputElement?.value || '';
    
    // Guardar el valor antes de cualquier operación para asegurar que no se pierda
    const valueToKeep = currentValue;
    lastAppliedValueRef.current = valueToKeep;
    
    // Obtener valores de los inputs de año
    const yearFromElement = yearFromInputRef.current || document.getElementById('year-from') as HTMLInputElement | null;
    const yearToElement = yearToInputRef.current || document.getElementById('year-to') as HTMLInputElement | null;
    const yearFromValue = yearFromElement?.value || '';
    const yearToValue = yearToElement?.value || '';
    
    // Validar que yearTo no sea menor que yearFrom
    const yearFromNum = yearFromValue ? parseInt(yearFromValue, 10) : null;
    const yearToNum = yearToValue ? parseInt(yearToValue, 10) : null;
    const hasError = yearFromNum !== null && yearToNum !== null && yearToNum < yearFromNum;
    
    // Guardar los valores de año antes de validar (para mantenerlos aunque haya error)
    lastAppliedYearFromRef.current = yearFromValue;
    lastAppliedYearToRef.current = yearToValue;
    
    // Actualizar los filtros en el estado (aunque haya error) para que los valores se mantengan
    // Esto asegura que si hay un re-render, los valores se mantengan
    if (valueToKeep !== filters.search) {
      updateFilter('search', valueToKeep);
    }
    if (yearFromValue !== filters.yearFrom) {
      updateFilter('yearFrom', yearFromValue);
    }
    if (yearToValue !== filters.yearTo) {
      updateFilter('yearTo', yearToValue);
    }
    
    if (hasError) {
      setYearToError(true);
      showErrorToast('El año "Hasta" no puede ser menor que el año "Desde"');
      // Cerrar el drawer en mobile si está abierto, pero mantener los valores
      if (isMobile) {
        // No cerrar el drawer cuando hay error para que el usuario pueda corregir
        // setMobileFiltersOpen(false);
      }
      return; // No aplicar filtros si hay error, pero los valores se mantienen en el estado
    }
    
    setYearToError(false);
    
    // Usar un delay más largo (100ms) para asegurar que React haya actualizado el estado
    // antes de llamar a applyFilters. Esto garantiza que appliedFilters tenga el valor correcto
    setTimeout(() => {
      // Verificar nuevamente el valor del input por si cambió
      const latestInputElement = searchInputRef.current || document.getElementById('search-product') as HTMLInputElement | null;
      const latestValue = latestInputElement?.value || valueToKeep;
      
      const latestYearFromElement = yearFromInputRef.current || document.getElementById('year-from') as HTMLInputElement | null;
      const latestYearToElement = yearToInputRef.current || document.getElementById('year-to') as HTMLInputElement | null;
      const latestYearFromValue = latestYearFromElement?.value || yearFromValue;
      const latestYearToValue = latestYearToElement?.value || yearToValue;
      
      // Si el valor cambió, actualizar nuevamente antes de aplicar
      if (latestValue !== filters.search && latestValue !== valueToKeep) {
        updateFilter('search', latestValue);
      }
      if (latestYearFromValue !== filters.yearFrom && latestYearFromValue !== yearFromValue) {
        updateFilter('yearFrom', latestYearFromValue);
      }
      if (latestYearToValue !== filters.yearTo && latestYearToValue !== yearToValue) {
        updateFilter('yearTo', latestYearToValue);
      }
      
      // Ahora aplicar los filtros - el estado ya debería estar actualizado
      applyFilters();
      
      // No restaurar valores aquí - los inputs uncontrolled mantienen sus propios valores
    }, 100);
    
    if (isMobile) {
      setMobileFiltersOpen(false);
    }
  }, [filters.search, filters.yearFrom, filters.yearTo, updateFilter, applyFilters, isMobile, showErrorToast]);

  // Contenido de filtros (sin acordeón para desktop)
  const FiltersFormContent = () => (
    <>
      {/* Búsqueda */}
      <Box sx={{ mb: 3 }}>
        <Typography
          component="label"
          htmlFor="search-product"
          sx={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#ffffff',
            mb: 1,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          {t.categories.searchProduct}
        </Typography>
        <Input
          key="search-product-input"
          id="search-product"
          type="text"
          defaultValue={initialSearchValue}
          inputRef={(el: HTMLInputElement | null) => {
            searchInputRef.current = el;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApplyFilters();
            }
          }}
          placeholder={t.categories.searchPlaceholder}
          state="modern"
          fullWidth
          autoComplete="off"
        />
      </Box>

      {/* Categoría */}
      <Box sx={{ mb: 3 }}>
        <Typography
          component="label"
          htmlFor="category-select"
          sx={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#ffffff',
            mb: 1,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          Categoría
        </Typography>
        <DropdownButton
          options={categoryOptions}
          value={filters.categoryId}
          onChange={(option) => {
            updateFilter('categoryId', option.value);
            // Tienda (/shop): aplicar al instante (incluye limpiar categoría).
            // Página de categoría: la URL manda; navegar al elegir otra categoría.
            if (currentCategoryId) {
              if (option.value) router.push(`/categories/${option.value}`);
              return;
            }
            window.setTimeout(() => applyFilters(), 0);
          }}
          placeholder={t.categories.select}
          renderValue={(option) => option ? option.label : ''}
          fullWidth={true}
          searchable={true}
        />
      </Box>

      {/* Año */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#ffffff',
            mb: 1,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          {t.categories.year}
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'row', lg: 'row' },
          gap: 2, 
          mb: 2 
        }}>
          <Box sx={{ flex: 1, width: { xs: '50%', lg: 'auto' } }}>
            <Input
              key="year-from-input"
              id="year-from"
              type="text"
              defaultValue={initialYearFromValue}
              inputRef={(el: HTMLInputElement | null) => {
                yearFromInputRef.current = el;
              }}
              onBlur={() => {
                // Validar cuando el usuario termine de escribir
                const yearFromElement = yearFromInputRef.current;
                const yearToElement = yearToInputRef.current;
                if (yearFromElement && yearToElement) {
                  const yearFromValue = yearFromElement.value;
                  const yearToValue = yearToElement.value;
                  const yearFromNum = yearFromValue ? parseInt(yearFromValue, 10) : null;
                  const yearToNum = yearToValue ? parseInt(yearToValue, 10) : null;
                  const hasError = yearFromNum !== null && yearToNum !== null && yearToNum < yearFromNum;
                  setYearToError(hasError);
                  if (hasError) {
                    showErrorToast('El año "Hasta" no puede ser menor que el año "Desde"');
                  }
                }
              }}
              onKeyDown={(e) => {
                const allowedKeys = [
                  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Home', 'End'
                ];
                const isNumber = /^[0-9]$/.test(e.key);
                const isControlKey = allowedKeys.includes(e.key) || 
                                    (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase());
                
                if (!isNumber && !isControlKey) {
                  e.preventDefault();
                }
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyFilters();
                }
              }}
              placeholder={t.categories.from}
              state="modern"
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1, width: { xs: '50%', lg: 'auto' } }}>
            <Input
              key="year-to-input"
              id="year-to"
              type="text"
              defaultValue={initialYearToValue}
              inputRef={(el: HTMLInputElement | null) => {
                yearToInputRef.current = el;
              }}
              onBlur={() => {
                // Validar cuando el usuario termine de escribir
                const yearFromElement = yearFromInputRef.current;
                const yearToElement = yearToInputRef.current;
                if (yearFromElement && yearToElement) {
                  const yearFromValue = yearFromElement.value;
                  const yearToValue = yearToElement.value;
                  const yearFromNum = yearFromValue ? parseInt(yearFromValue, 10) : null;
                  const yearToNum = yearToValue ? parseInt(yearToValue, 10) : null;
                  const hasError = yearFromNum !== null && yearToNum !== null && yearToNum < yearFromNum;
                  setYearToError(hasError);
                  if (hasError) {
                    showErrorToast('El año "Hasta" no puede ser menor que el año "Desde"');
                  }
                }
              }}
              onKeyDown={(e) => {
                const allowedKeys = [
                  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Home', 'End'
                ];
                const isNumber = /^[0-9]$/.test(e.key);
                const isControlKey = allowedKeys.includes(e.key) || 
                                    (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase());
                
                if (!isNumber && !isControlKey) {
                  e.preventDefault();
                }
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyFilters();
                }
              }}
              placeholder={t.categories.to}
              state="modern"
              error={yearToError}
              fullWidth
            />
          </Box>
        </Box>
      </Box>

      {/* Condición */}
      <Box sx={{ mb: 3 }}>
        <Typography
          component="label"
          htmlFor="condition-select"
          sx={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#ffffff',
            mb: 1,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          {t.categories.condition}
        </Typography>
        <DropdownButton
          options={conditionOptions}
          value={filters.condition}
          onChange={(option) => updateFilter('condition', option.value)}
          placeholder={t.categories.select}
          renderValue={(option) => option ? option.label : ''}
          fullWidth={true}
          searchable={true}
        />
      </Box>

      {/* Método de envío */}
      <Box sx={{ mb: 3 }}>
        <Typography
          component="label"
          htmlFor="shipping-select"
          sx={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#ffffff',
            mb: 1,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          Método de envío
        </Typography>
        <DropdownButton
          options={shippingOptions}
          value={filters.shippingMethod}
          onChange={(option) => updateFilter('shippingMethod', option.value)}
          placeholder={t.categories.select}
          renderValue={(option) => option ? option.label : ''}
          fullWidth={true}
          searchable={true}
        />
      </Box>

      {/* Ordenamiento */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#ffffff',
            mb: 1,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          Ordenar por
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'row', lg: 'row' },
          gap: 2, 
          mb: 2 
        }}>
          <Box sx={{ flex: 1, width: { xs: '50%', lg: 'auto' } }}>
            <DropdownButton
              options={sortByOptions}
              value={filters.sortBy}
              onChange={(option) => updateFilter('sortBy', option.value as typeof filters.sortBy)}
              placeholder="Campo"
              renderValue={(option) => option ? option.label : ''}
              fullWidth={true}
              searchable={true}
            />
          </Box>
          <Box sx={{ flex: 1, width: { xs: '50%', lg: 'auto' } }}>
            <DropdownButton
              options={sortOrderOptions}
              value={filters.sortOrder}
              onChange={(option) => updateFilter('sortOrder', option.value as typeof filters.sortOrder)}
              placeholder="Orden"
              renderValue={(option) => option ? option.label : ''}
              fullWidth={true}
              searchable={true}
            />
          </Box>
        </Box>
      </Box>

      {/* Botón Filtrar */}
      <Button
        onClick={handleApplyFilters}
        fullWidth
        disabled={isLoading}
        sx={{
          px: 4,
          py: 1.5,
          backgroundColor: '#29C480',
          color: '#1e293b',
          fontWeight: 600,
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '1rem',
          transition: 'background-color 0.3s ease, color 0.3s ease',
          '&:hover': {
            backgroundColor: '#ffffff',
            color: '#000000'
          },
          '&:disabled': {
            backgroundColor: '#29C480',
            opacity: 0.6,
          },
          '& .MuiSvgIcon-root': {
            transition: 'transform 0.3s ease'
          },
          '&:hover .MuiSvgIcon-root': {
            transform: 'translateX(4px)'
          }
        }}
      >
        {isLoading ? (
          <CircularProgress size={20} sx={{ color: '#1e293b' }} />
        ) : (
          <>
            Aplicar filtros
            <TuneIcon sx={{ fontSize: 18, ml: 0.5 }} />
          </>
        )}
      </Button>
    </>
  );

  const FiltersContent = () => {
    if (isMobile) {
      // Versión mobile con acordeón
      return (
        <Box
          ref={scrollContainerRef}
          sx={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            px: 2,
            pb: 2,
            pt: 2
          }}
        >
          <Accordion 
            expanded={filtersExpanded}
            onChange={(event, isExpanded) => {
              setFiltersExpanded(isExpanded);
            }}
            sx={{ 
              backgroundColor: 'transparent',
              boxShadow: 'none',
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: 0 }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#29C480' }} />}
              sx={{
                px: 2,
                py: 2,
                minHeight: 'auto',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                mb: 1,
                mt: 2,
                '&.Mui-expanded': { 
                  minHeight: 'auto',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  mt: 2
                },
                '& .MuiAccordionSummary-content': {
                  margin: 0,
                  '&.Mui-expanded': { margin: 0 }
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }
              }}
            >
              <Typography sx={{ 
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}>
                Filtros
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pb: 2 }}>
              <FiltersFormContent />
            </AccordionDetails>
          </Accordion>

          {categories && categories.length > 0 && (
            <Accordion 
              expanded={categoriesExpanded}
              onChange={(event, isExpanded) => {
                // Solo permitir toggle si NO es un click del botón "See more/less"
                if (!isButtonClickRef.current) {
                  setCategoriesExpanded(isExpanded);
                }
                // Resetear el flag después de procesar
                isButtonClickRef.current = false;
              }}
              sx={{ 
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: 0 }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#29C480' }} />}
                sx={{
                  px: 2,
                  py: 2,
                  minHeight: 'auto',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  mb: 1,
                  mt: 2,
                  '&.Mui-expanded': { 
                    minHeight: 'auto',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    mt: 2
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                    '&.Mui-expanded': { margin: 0 }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }}
              >
                <Typography sx={{ 
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}>
                  {t.categories.otherCategories}
                </Typography>
              </AccordionSummary>
              <AccordionDetails 
                sx={{ px: 0, pb: 2 }}
              >
                <Box
                  sx={{
                    maxHeight: showMoreCategories ? '600px' : '200px',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-in-out',
                    mb: 2
                  }}
                >
                  <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {(() => {
                      const sortedCategories = [...categories].sort((a, b) =>
                        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
                      );
                      return sortedCategories
                        .slice(0, showMoreCategories ? categories.length : 6)
                        .map((cat) => {
                          const isCurrentCategory = currentCategoryId && cat.id === currentCategoryId;
                          return (
                            <Box component="li" key={cat.id} sx={{ mb: 1.5 }}>
                              {isCurrentCategory ? (
                                <Box
                                  component="span"
                                  sx={{
                                    fontSize: '0.875rem',
                                    color: '#34d399',
                                    fontWeight: 700,
                                    cursor: 'not-allowed',
                                    display: 'inline-block',
                                    lineHeight: 1.5,
                                  }}
                                >
                                  {cat.name}
                                </Box>
                              ) : (
                                <Link
                                  href={`/categories/${cat.id}`}
                                  style={{
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    color: '#ffffff',
                                    transition: 'color 0.2s ease',
                                    display: 'inline-block',
                                    lineHeight: 1.5,
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#34d399'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
                                >
                                  {cat.name}
                                </Link>
                              )}
                            </Box>
                          );
                        });
                    })()}
                  </Box>
                </Box>
                {categories.length > 6 && onToggleCategories && (
                  <Button
                    type="button"
                    onClick={(e) => {
                      // Marcar que el click viene del botón para prevenir el toggle del acordeón
                      isButtonClickRef.current = true;
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.nativeEvent) {
                        e.nativeEvent.stopImmediatePropagation();
                      }
                      const scrollContainer = scrollContainerRef.current;
                      const bodyScroll = document.body.scrollTop || document.documentElement.scrollTop;
                      const containerScroll = scrollContainer?.scrollTop || 0;
                      onToggleCategories();
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                          if (scrollContainer) {
                            scrollContainer.scrollTop = containerScroll;
                          }
                          if (document.body.scrollTop !== undefined) {
                            document.body.scrollTop = bodyScroll;
                          }
                          if (document.documentElement.scrollTop !== undefined) {
                            document.documentElement.scrollTop = bodyScroll;
                          }
                          window.scrollTo({
                            top: bodyScroll,
                            behavior: 'auto'
                          });
                        });
                      });
                    }}
                    onMouseDown={(e) => {
                      isButtonClickRef.current = true;
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.nativeEvent) {
                        e.nativeEvent.stopImmediatePropagation();
                      }
                    }}
                    onTouchStart={(e) => {
                      isButtonClickRef.current = true;
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.nativeEvent) {
                        e.nativeEvent.stopImmediatePropagation();
                      }
                    }}
                    onPointerDown={(e) => {
                      isButtonClickRef.current = true;
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.nativeEvent) {
                        e.nativeEvent.stopImmediatePropagation();
                      }
                    }}
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      textTransform: 'none',
                      color: '#34d399',
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#22c55e',
                      }
                    }}
                  >
                    {showMoreCategories ? t.categories.seeLessCategories : t.categories.seeMoreCategories}
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      );
    }

    // Versión desktop sin acordeón
    return (
      <Box
        ref={scrollContainerRef}
        sx={{
          width: '100%',
          minHeight: 'calc(100vh - 400px)',
          p: 0,
          background: 'transparent',
          height: 'auto',
          overflowY: 'visible',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
      {/* Card de Filtros - Solo en desktop */}
      <Box
        sx={{
          padding: 3,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(0, 0, 0, 0.6))',
          border: '1px solid rgba(41, 196, 128, 0.1)',
          width: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          boxShadow: 'none !important',
          filter: 'none !important',
          outline: 'none !important',
          WebkitBoxShadow: 'none !important',
          MozBoxShadow: 'none !important',
          textShadow: 'none !important',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            display: 'none !important'
          },
          '&::after': {
            display: 'none !important'
          },
          '&:hover': {
            borderColor: 'rgba(41, 196, 128, 0.4)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.7))',
            boxShadow: 'none !important',
            filter: 'none !important',
            outline: 'none !important',
            WebkitBoxShadow: 'none !important',
            MozBoxShadow: 'none !important',
            textShadow: 'none !important',
            '&::before': {
              display: 'none !important'
            },
            '&::after': {
              display: 'none !important'
            }
          }
        }}
      >
        <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h5"
          sx={{ 
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#ffffff',
            mb: 1,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          {t.categories.results}
        </Typography>
        <Typography 
          sx={{ 
            fontSize: '1rem',
            color: '#34d399',
            fontWeight: 600
          }}
        >
          {isLoading ? '...' : productsCount} {t.categories.products}
        </Typography>
      </Box>

      <FiltersFormContent />
      </Box>

      {/* Card de Otras Categorías - Solo en desktop */}
      {categories && categories.length > 0 && (
        <Box
          sx={{
            padding: 3,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(0, 0, 0, 0.6))',
            border: '1px solid rgba(41, 196, 128, 0.1)',
            width: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box',
            boxShadow: 'none !important',
            filter: 'none !important',
            outline: 'none !important',
            WebkitBoxShadow: 'none !important',
            MozBoxShadow: 'none !important',
            textShadow: 'none !important',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              display: 'none !important'
            },
            '&::after': {
              display: 'none !important'
            },
            '&:hover': {
              borderColor: 'rgba(41, 196, 128, 0.4)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.7))',
              boxShadow: 'none !important',
              filter: 'none !important',
              outline: 'none !important',
              WebkitBoxShadow: 'none !important',
              MozBoxShadow: 'none !important',
              textShadow: 'none !important',
              '&::before': {
                display: 'none !important'
              },
              '&::after': {
                display: 'none !important'
              }
            }
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              mb: 2,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            {t.categories.otherCategories}
          </Typography>
          <Box
            sx={{
              maxHeight: showMoreCategories ? '600px' : '200px',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease-in-out',
              mb: 2
            }}
          >
            <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(() => {
                const sortedCategories = [...categories].sort((a, b) =>
                  a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
                );
                return sortedCategories
                  .slice(0, showMoreCategories ? categories.length : 6)
                  .map((cat) => {
                    const isCurrentCategory = currentCategoryId && cat.id === currentCategoryId;
                    return (
                      <Box component="li" key={cat.id} sx={{ mb: 1.5 }}>
                        {isCurrentCategory ? (
                          <Box
                            component="span"
                            sx={{
                              fontSize: '0.875rem',
                              color: '#34d399',
                              fontWeight: 700,
                              cursor: 'not-allowed',
                              display: 'inline-block',
                              lineHeight: 1.5,
                            }}
                          >
                            {cat.name}
                          </Box>
                        ) : (
                          <Link
                            href={`/categories/${cat.id}`}
                            style={{
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              color: '#ffffff',
                              transition: 'color 0.2s ease',
                              display: 'inline-block',
                              lineHeight: 1.5,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#34d399'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
                          >
                            {cat.name}
                          </Link>
                        )}
                      </Box>
                    );
                  });
              })()}
            </Box>
          </Box>
          {categories.length > 6 && onToggleCategories && (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Guardar la posición del scroll de todos los posibles contenedores
                const scrollContainer = scrollContainerRef.current;
                const bodyScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const containerScroll = scrollContainer?.scrollTop || 0;
                
                // Ejecutar el toggle
                onToggleCategories();
                
                // Prevenir cualquier scroll después del toggle
                // Usar múltiples requestAnimationFrame para asegurar que el DOM se actualizó
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    // Restaurar scroll del contenedor
                    if (scrollContainer) {
                      scrollContainer.scrollTop = containerScroll;
                    }
                    // Prevenir scroll del body/document
                    if (document.body.scrollTop !== undefined) {
                      document.body.scrollTop = bodyScroll;
                    }
                    if (document.documentElement.scrollTop !== undefined) {
                      document.documentElement.scrollTop = bodyScroll;
                    }
                    // Prevenir scroll de la ventana
                    window.scrollTo({
                      top: bodyScroll,
                      behavior: 'auto'
                    });
                  });
                });
              }}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
              }}
              sx={{
                p: 0,
                minWidth: 'auto',
                textTransform: 'none',
                color: '#34d399',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#22c55e',
                }
              }}
            >
              {showMoreCategories ? t.categories.seeLessCategories : t.categories.seeMoreCategories}
            </Button>
          )}
        </Box>
      )}
    </Box>
    );
  };

  // En móvil, mostrar botón de filtros y drawer
  if (isMobile) {
    return (
      <>
        {/* Botón de Filtros para móvil */}
        <Box
          sx={{
            width: { xs: '100%', lg: '25%' },
            px: { xs: 3, lg: 4 },
            pt: { xs: 2, lg: 0 },
            pb: { xs: 1, lg: 0 },
            display: { xs: 'flex', lg: 'none' },
            justifyContent: 'flex-start',
            alignItems: 'center',
            minHeight: { xs: 'auto', lg: 'calc(100vh - 400px)' }
          }}
        >
          <Button
            onClick={() => setMobileFiltersOpen(true)}
            endIcon={<FilterListIcon />}
            sx={{
              px: 4,
              py: 1.5,
              backgroundColor: '#29C480',
              color: '#1e293b',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'background-color 0.3s ease, color 0.3s ease',
              '&:hover': {
                backgroundColor: '#ffffff',
                color: '#000000'
              },
              '& .MuiSvgIcon-root': {
                transition: 'transform 0.3s ease'
              },
              '&:hover .MuiSvgIcon-root': {
                transform: 'translateX(4px)'
              }
            }}
          >
            Filtros
          </Button>
        </Box>

        {/* Drawer para filtros en móvil */}
        <Drawer
          anchor="bottom"
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          PaperProps={{
            ref: drawerRef,
            sx: {
              background: '#1f2937',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '90vh'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}
            >
              Filtros
            </Typography>
            <IconButton
              onClick={() => setMobileFiltersOpen(false)}
              sx={{
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <FiltersContent />
        </Drawer>
      </>
    );
  }

  // En desktop, mostrar filtros normalmente con el ancho correcto
  return (
    <Box
      sx={{
        width: { xs: '100%', lg: '35%' },
        minHeight: 'calc(100vh - 400px)',
        p: { xs: 3, lg: 4 }
      }}
    >
      <FiltersContent />
    </Box>
  );
};

// Memoizar el componente para evitar re-renders innecesarios que causan pérdida de foco
// Solo re-renderizar si realmente cambió algo relevante
export const ProductsFiltersSidebar = React.memo(ProductsFiltersSidebarComponent);

