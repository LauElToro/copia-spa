'use client';

import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { useProducts } from '@/presentation/@shared/hooks/use-products';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { useProductsFilters } from '@/presentation/@shared/hooks/use-products-filters';
import { ProductsFiltersSidebar } from '@/presentation/@shared/components/ui/molecules/products-filters-sidebar';
import { ProductsGrid } from '@/presentation/@shared/components/ui/molecules/products-grid';
import { ActiveFiltersList } from '@/presentation/@shared/components/ui/molecules/active-filters-list';

export default function ShopPage() {
  const { categories, useProductsWithFilters } = useProducts();
  const { t } = useLanguage();
  const toast = useToast();
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
    const base = { status: 'approved', active_status: 1 };
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

  const productsToShow = React.useMemo(() => listData?.data || [], [listData?.data]);

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
      // Extraer mensaje del backend si está disponible
      let errorMessage = t.categories.errorGettingProducts;
      
      const apiError = error as { 
        response?: { 
          data?: { 
            message?: string; 
            detail?: string;
            error?: string;
          } 
        };
        message?: string;
      };
      
      // Priorizar message, luego detail, luego error, luego el mensaje del error
      const backendMessage = 
        apiError?.response?.data?.message ||
        apiError?.response?.data?.detail ||
        apiError?.response?.data?.error ||
        apiError?.message;
      
      if (backendMessage) {
        errorMessage = backendMessage;
      }
      
      toast.error(errorMessage);
    }
  }, [isError, error, t, toast]);

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
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Sidebar - Filtros */}
            <ProductsFiltersSidebar
              filters={filters}
              updateFilter={updateFilter}
              applyFilters={applyFilters}
              isLoading={isLoading}
              productsCount={productsToShow.length}
              categories={categories.data}
              showMoreCategories={showMoreCategories}
              onToggleCategories={() => setShowMoreCategories(!showMoreCategories)}
            />

            {/* Main Content - Grid de Productos */}
            <Box
              sx={{
                width: { xs: '100%', md: '75%' },
                pt: { xs: 3, md: 4 },
                pb: { xs: 3, md: 4 },
                pl: { xs: 3, md: 4 },
                pr: { xs: 3, md: 4 }
              }}
            >
              {/* Lista de filtros activos */}
              {isFiltering && activeFilters.length > 0 && <ActiveFiltersList filters={activeFilters} onClearAll={clearAllFilters} />}

              <ProductsGrid
                products={productsToShow}
                isLoading={isLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
                emptyStateTitle={t.categories.noProductsAvailable}
                emptyStateMessage={t.categories.noProductsMessage}
                showInitialMessage={!isFiltering && productsToShow.length === 0}
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
}

