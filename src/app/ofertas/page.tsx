'use client';

import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { useProducts } from '@/presentation/@shared/hooks/use-products';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { notificationService } from '@/presentation/@shared/providers/toast-provider';
import { ActiveFiltersList } from '@/presentation/@shared/components/ui/molecules/active-filters-list';
import { useProductsFilters } from '@/presentation/@shared/hooks/use-products-filters';
import { ProductsFiltersSidebar } from '@/presentation/@shared/components/ui/molecules/products-filters-sidebar';
import { ProductsGrid } from '@/presentation/@shared/components/ui/molecules/products-grid';

export default function OffersPage() {
  const { categories, useProductsWithFilters } = useProducts();
  const { t } = useLanguage();
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
  } = useProductsFilters();

  const listParams = React.useMemo(() => {
    const base = {
      status: 'approved',
      active_status: 1,
      has_promotion: true,
    };
    if (isFiltering && activeFilters.length > 0) {
      return { ...apiFilters, ...base };
    }
    return {
      page,
      limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
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
  ]);

  const { data: listData, isLoading, isError, error } = useProductsWithFilters(listParams, true);

  const products = React.useMemo(() => listData?.data || [], [listData?.data]);

  const pagination = React.useMemo(() => {
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
  }, [listData?.pagination, page, limit]);

  useEffect(() => {
    if (isError) {
      notificationService.apiError(
        error,
        t.categories.errorGettingOffers
      );
    }
  }, [isError, error, t]);

  const [showMoreCategories, setShowMoreCategories] = React.useState(false);

  return (
    <MainLayout>
      {/* Main Content Section */}
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
              onToggleCategories={React.useCallback(() => setShowMoreCategories(prev => !prev), [])}
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
                emptyStateTitle={t.categories.noOffersAvailable}
                emptyStateMessage={t.categories.noOffersMessage}
                showInitialMessage={!isFiltering && products.length === 0}
                initialMessageTitle="Configura los filtros"
                initialMessageText="Haz clic en 'Filtrar' para buscar ofertas"
                isFiltering={isFiltering && activeFilters.length > 0}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}
