'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useProducts } from './use-products';
import { ActiveFilter } from '@/presentation/@shared/components/ui/molecules/active-filters-list';
import { useLanguage } from './use-language';

export interface ProductsFiltersState {
  search: string;
  condition: string;
  categoryId: string;
  yearFrom: string;
  yearTo: string;
  city: string;
  state: string;
  country: string;
  shippingMethod: string;
  sortBy: 'price' | 'name' | 'visits' | 'sales' | 'year' | 'creation_date';
  sortOrder: 'asc' | 'desc';
}

const initialFilters: ProductsFiltersState = {
  search: '',
  condition: '',
  categoryId: '',
  yearFrom: '',
  yearTo: '',
  city: '',
  state: '',
  country: '',
  shippingMethod: '',
  sortBy: 'creation_date',
  sortOrder: 'desc',
};

export const useProductsFilters = (initialCategoryId?: string) => {
  const { categories } = useProducts();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<ProductsFiltersState>({
    ...initialFilters,
    categoryId: initialCategoryId || '',
  });
  const [appliedFilters, setAppliedFilters] = useState<ProductsFiltersState>({
    ...initialFilters,
    categoryId: initialCategoryId || '',
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Al cambiar la ruta (ej. /categories/A → /categories/B) el estado inicial no se recalcula:
  // sincronizar categoría y filtros aplicados con el slug de la URL.
  // `''` (ofertas u otras rutas sin categoría) limpia la categoría seleccionada.
  useEffect(() => {
    if (initialCategoryId === undefined) return;
    setFilters((prev) => ({ ...prev, categoryId: initialCategoryId }));
    setAppliedFilters((prev) => ({ ...prev, categoryId: initialCategoryId }));
    setIsFiltering(false);
    setPage(1);
  }, [initialCategoryId]);

  // Construir parámetros de filtro para la API - solo usar los filtros aplicados
  const apiFilters = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit,
      sortBy: appliedFilters.sortBy,
      sortOrder: appliedFilters.sortOrder,
    };

    if (appliedFilters.search.trim()) params.search = appliedFilters.search.trim();
    if (appliedFilters.condition) params.condition = appliedFilters.condition;
    if (appliedFilters.categoryId) {
      params.category_identification_code = appliedFilters.categoryId;
      params.include_subcategories = true;
    }
    if (appliedFilters.yearFrom) {
      const year = Number.parseInt(appliedFilters.yearFrom, 10);
      if (!Number.isNaN(year)) params.minYear = year;
    }
    if (appliedFilters.yearTo) {
      const year = Number.parseInt(appliedFilters.yearTo, 10);
      if (!Number.isNaN(year)) params.maxYear = year;
    }
    // Filtros de ubicación comentados temporalmente
    // if (appliedFilters.city.trim()) params.city = appliedFilters.city.trim();
    // if (appliedFilters.state.trim()) params.state = appliedFilters.state.trim();
    // if (appliedFilters.country.trim()) params.country = appliedFilters.country.trim();
    if (appliedFilters.shippingMethod) params.shipping_method = appliedFilters.shippingMethod;

    return params;
  }, [appliedFilters, page, limit]);

  // Definir updateFilter antes de usarlo en activeFilters
  const updateFilter = useCallback(<K extends keyof ProductsFiltersState>(
    key: K,
    value: ProductsFiltersState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Construir lista de filtros activos - solo mostrar los filtros aplicados
  const activeFilters: ActiveFilter[] = useMemo(() => {
    const active: ActiveFilter[] = [];
    
    if (appliedFilters.search.trim()) {
      active.push({
        key: 'search',
        label: 'Búsqueda',
        value: appliedFilters.search.trim(),
        onRemove: () => {
          updateFilter('search', '');
          setAppliedFilters(prev => ({ ...prev, search: '' }));
        },
      });
    }
    if (appliedFilters.condition) {
      active.push({
        key: 'condition',
        label: 'Condición',
        value: appliedFilters.condition === 'new' ? t.categories.new : t.categories.used,
        onRemove: () => {
          updateFilter('condition', '');
          setAppliedFilters(prev => ({ ...prev, condition: '' }));
        },
      });
    }
    if (appliedFilters.categoryId) {
      const list = categories.data;
      const category = Array.isArray(list) ? list.find(c => c.id === appliedFilters.categoryId) : undefined;
      active.push({
        key: 'category',
        label: 'Categoría',
        value: category?.name || appliedFilters.categoryId,
        onRemove: () => {
          updateFilter('categoryId', '');
          setAppliedFilters(prev => ({ ...prev, categoryId: '' }));
        },
      });
    }
    if (appliedFilters.yearFrom) {
      active.push({
        key: 'yearFrom',
        label: 'Año desde',
        value: appliedFilters.yearFrom,
        onRemove: () => {
          updateFilter('yearFrom', '');
          setAppliedFilters(prev => ({ ...prev, yearFrom: '' }));
        },
      });
    }
    if (appliedFilters.yearTo) {
      active.push({
        key: 'yearTo',
        label: 'Año hasta',
        value: appliedFilters.yearTo,
        onRemove: () => {
          updateFilter('yearTo', '');
          setAppliedFilters(prev => ({ ...prev, yearTo: '' }));
        },
      });
    }
    // Filtros de ubicación comentados temporalmente
    // if (appliedFilters.city.trim()) {
    //   active.push({
    //     key: 'city',
    //     label: 'Ciudad',
    //     value: appliedFilters.city.trim(),
    //     onRemove: () => {
    //       updateFilter('city', '');
    //       setAppliedFilters(prev => ({ ...prev, city: '' }));
    //     },
    //   });
    // }
    // if (appliedFilters.state.trim()) {
    //   active.push({
    //     key: 'state',
    //     label: 'Estado',
    //     value: appliedFilters.state.trim(),
    //     onRemove: () => {
    //       updateFilter('state', '');
    //       setAppliedFilters(prev => ({ ...prev, state: '' }));
    //     },
    //   });
    // }
    // if (appliedFilters.country.trim()) {
    //   active.push({
    //     key: 'country',
    //     label: 'País',
    //     value: appliedFilters.country.trim(),
    //     onRemove: () => {
    //       updateFilter('country', '');
    //       setAppliedFilters(prev => ({ ...prev, country: '' }));
    //     },
    //   });
    // }
    if (appliedFilters.shippingMethod) {
      active.push({
        key: 'shipping',
        label: 'Envío',
        value: appliedFilters.shippingMethod,
        onRemove: () => {
          updateFilter('shippingMethod', '');
          setAppliedFilters(prev => ({ ...prev, shippingMethod: '' }));
        },
      });
    }

    return active;
  }, [appliedFilters, categories.data, t, updateFilter]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      ...initialFilters,
      categoryId: initialCategoryId || '',
    });
    setAppliedFilters({
      ...initialFilters,
      categoryId: initialCategoryId || '',
    });
    setIsFiltering(false);
    setPage(1);
  }, [initialCategoryId]);

  const applyFilters = useCallback(() => {
    // Usar el patrón funcional de setState para asegurar que siempre use el valor más reciente
    setFilters((currentFilters) => {
      // Copiar los filtros actuales a los filtros aplicados
      setAppliedFilters(currentFilters);
      setIsFiltering(true);
      setPage(1); // Resetear a página 1 al aplicar filtros
      return currentFilters; // No cambiar filters, solo leer su valor actual
    });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    filters,
    updateFilter,
    clearAllFilters,
    applyFilters,
    isFiltering,
    apiFilters,
    activeFilters,
    page,
    limit,
    handlePageChange,
  };
};

