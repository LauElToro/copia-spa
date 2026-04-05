"use client";

import React from "react";
import { Box, Container, Typography } from "@mui/material";
import MainLayout from "@/presentation/@shared/components/layouts/main-layout";
import { Pagination } from "@/presentation/@shared/components/ui/molecules/pagination/pagination";
import { SearchInput } from "@/presentation/@shared/components/ui/atoms/search-input";
import { StoresCarousel } from "@/presentation/@shared/components/ui/molecules/stores-carousel";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { StoresGrid } from "../components/stores-grid/stores-grid";
import { StoreCardSkeleton } from "../components/store-card-skeleton";
import StoresHero from "@/presentation/@shared/components/ui/molecules/stores-hero/stores-hero";
import { useStoresPage } from "../hooks";

const StoresPage: React.FC = () => {
  const { t } = useLanguage();
  const {
    gridStores,
    recommendedGridStores,
    effectivePagination,
    showingFrom,
    showingTo,
    searchTerm,
    page,
    isFetching,
    isInitialLoading,
    handleSearchChange,
    handlePageChange,
  } = useStoresPage();

  return (
    <MainLayout>
      {/* Hero Section */}
      <StoresHero />

      {/* Recommended Stores Section */}
      {recommendedGridStores.length > 0 && (
        <Box
          component="section"
          sx={{
            py: { xs: 4, md: 6 },
            backgroundColor: '#000000',
            position: 'relative'
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 }, width: '100%' }}>
            <StoresCarousel
              stores={recommendedGridStores}
              title={t.stores.recommendedStores}
              itemsPerSlide={2}
              autoPlay={true}
              autoPlayInterval={6000}
            />
          </Container>
        </Box>
      )}

      {/* All Stores Section */}
      <Box sx={{ width: "100%", position: "relative" }}>
        {/* Línea separadora verde */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: 'linear-gradient(90deg, transparent 0%, transparent 5%, #29C480 25%, #29C480 75%, transparent 95%, transparent 100%)',
            boxShadow: '0 0 20px rgba(41, 196, 128, 0.5), 0 0 40px rgba(41, 196, 128, 0.2), inset 0 0 15px rgba(41, 196, 128, 0.15)',
            borderRadius: '9999px',
            zIndex: 10
          }}
        />
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          backgroundColor: '#000000',
          position: 'relative',
          overflow: 'hidden',
        }}
                    >
          <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 }, width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Title and Search in same row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 2, md: 3 },
              mb: 4,
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                textAlign: { xs: 'center', md: 'left' },
                flex: { md: '0 0 auto' }
              }}
            >
              {t.stores.allStores}
            </Typography>
            
            <Box sx={{ 
              maxWidth: { xs: '100%', md: 360 }, 
              width: { xs: '100%', md: 'auto' },
              flex: { md: '0 0 auto' }
            }}>
              <SearchInput
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t.stores.searchPlaceholder}
                isLoading={isFetching}
              />
            </Box>
          </Box>

          {/* Stores Grid */}
          {isInitialLoading ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 3,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <StoreCardSkeleton key={`skeleton-${index}`} />
              ))}
            </Box>
          ) : (
            <StoresGrid sellers={gridStores} />
          )}

          {/* Pagination */}
        {effectivePagination.totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2, 
              mt: 4 
            }}>
              {gridStores.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    textAlign: { xs: 'center', sm: 'left' },
                  }}
                >
                  {t.stores.showingStores
                    .replace('{from}', String(showingFrom))
                    .replace('{to}', String(showingTo))
                    .replace('{total}', String(effectivePagination.total))}
                </Typography>
              )}
            <Pagination
              currentPage={page}
              totalPages={effectivePagination.totalPages}
              onPageChange={handlePageChange}
              className={isFetching ? "opacity-75" : ""}
            />
            </Box>
        )}
        </Container>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default StoresPage; 
