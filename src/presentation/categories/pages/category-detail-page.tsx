'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { useProducts } from '@/presentation/@shared/hooks/use-products';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { notificationService } from '@/presentation/@shared/providers/toast-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProductsFilters } from '@/presentation/@shared/hooks/use-products-filters';
import { ProductsFiltersSidebar } from '@/presentation/@shared/components/ui/molecules/products-filters-sidebar/products-filters-sidebar';
import { ProductsGrid } from '@/presentation/@shared/components/ui/molecules/products-grid/products-grid';
import { ActiveFiltersList } from '@/presentation/@shared/components/ui/molecules/active-filters-list';

interface Props {
  slug: string;
}

const CategoryDetailPage: React.FC<Props> = ({ slug }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories, useProductsWithFilters } = useProducts();
  const { t } = useLanguage();
  
  // Detectar si es la página de ofertas
  const isOffersPage = slug === 'offers';
  
  // Hook de filtros (con categoryId inicial si no es ofertas)
  const {
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
  } = useProductsFilters(isOffersPage ? '' : slug);

  const listParams = React.useMemo(() => {
    const base = { status: 'approved', active_status: 1 };
    // La URL es la fuente de verdad: siempre acotar por categoría (excepto ofertas),
    // incluso cuando hay filtros aplicados (evita listar todo el catálogo sin categoría).
    const categoryScope =
      !isOffersPage && slug
        ? { category_identification_code: slug, include_subcategories: true }
        : {};
    if (isFiltering && activeFilters.length > 0) {
      return { ...apiFilters, ...categoryScope, ...base };
    }
    return {
      page,
      limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      ...categoryScope,
      ...base,
    };
  }, [
    isFiltering,
    activeFilters.length,
    apiFilters,
    page,
    limit,
    filters.sortBy,
    filters.sortOrder,
    slug,
    isOffersPage,
  ]);

  const { data: listData, isLoading, isError, error } = useProductsWithFilters(
    listParams,
    !isOffersPage
  );

  const products = React.useMemo(() => {
    if (isOffersPage) return [];
    return listData?.data || [];
  }, [isOffersPage, listData?.data]);

  const pagination = React.useMemo(() => {
    if (isOffersPage) {
      return { total: 0, totalPages: 0, page: 1, limit };
    }
    const paginationData = listData?.pagination as
      | { total?: number; totalPages?: number; page?: number; limit?: number }
      | undefined;
    const total = paginationData?.total || 0;
    const totalPages = paginationData?.totalPages || 0;
    return {
      total,
      totalPages,
      page: paginationData?.page ?? page,
      limit: paginationData?.limit ?? limit,
    };
  }, [isOffersPage, listData?.pagination, page, limit]);
  
  useEffect(() => {
    if (isError) {
      notificationService.apiError(
        error,
        t.categories.errorGettingProducts
      );
    }
  }, [isError, error, t]);

  const [showMoreCategories, setShowMoreCategories] = useState(false);

  useEffect(() => {
    if (searchParams.get('expandCategories') === 'true') {
      setShowMoreCategories(true);
      return;
    }

    if (categories.data) {
      const sorted = [...categories.data].sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      );
      const top6 = sorted.slice(0, 6);
      const isInTop6 = top6.some((cat) => cat.id === slug);
      setShowMoreCategories(!isInTop6);
    }
  }, [categories.data, slug, searchParams]);

  return (
    <MainLayout>
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          backgroundColor: '#000000',
          position: 'relative'
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0, lg: 0 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' } }}>
            {/* Sidebar - Filtros */}
            <ProductsFiltersSidebar
              filters={filters}
              updateFilter={updateFilter}
              applyFilters={applyFilters}
              isLoading={isLoading}
              productsCount={products.length}
              categories={categories.data}
              showMoreCategories={showMoreCategories}
              currentCategoryId={slug}
              onToggleCategories={() => {
                const newValue = !showMoreCategories;
                setShowMoreCategories(newValue);
                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                if (newValue) {
                  currentParams.set('expandCategories', 'true');
                } else {
                  currentParams.delete('expandCategories');
                }
                router.push(`?${currentParams.toString()}`, { scroll: false });
              }}
            />

            {/* Main Content - Grid de Productos */}
            <Box
              sx={{
                width: { xs: '100%', lg: '65%' },
                pt: { xs: 3, lg: 4 },
                pb: { xs: 3, lg: 4 },
                pl: { xs: 3, lg: 4 },
                pr: { xs: 3, lg: 4 }
              }}
            >
              {/* Lista de filtros activos */}
              {isFiltering && activeFilters.length > 0 && <ActiveFiltersList filters={activeFilters} onClearAll={clearAllFilters} />}

              <ProductsGrid
                products={products}
                isLoading={isLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
                emptyStateTitle={t.categories.noProductsAvailable}
                emptyStateMessage={t.categories.noProductsMessage}
                showInitialMessage={!isFiltering && products.length === 0}
                initialMessageTitle="Configura los filtros"
                initialMessageText="Haz clic en 'Filtrar' para buscar productos"
                isFiltering={isFiltering && activeFilters.length > 0}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default CategoryDetailPage;
