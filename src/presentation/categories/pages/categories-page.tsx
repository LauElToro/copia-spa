"use client";

import React from 'react';
import Link from 'next/link';
import { Box, Container, Typography } from '@mui/material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { SearchInput } from '@/presentation/@shared/components/ui/atoms/search-input';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import CategoriesHero from '@/presentation/@shared/components/ui/molecules/categories-hero';
import { useCategoriesPage } from '../hooks';
import { CategoriesGrid } from '../components/categories-grid';
import { CategoryCardSkeleton } from '../components/category-card-skeleton';

export default function CategoriesPage() {
  const { t } = useLanguage();
  const {
    categories,
    searchTerm,
    isLoading,
    isError,
    error,
    isInitialLoading,
    handleSearchChange,
    retry,
  } = useCategoriesPage();

  return (
    <MainLayout>
      {/* Hero Section */}
      <CategoriesHero />

      {/* All Categories Section */}
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          backgroundColor: '#000000',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 }, width: '100%', position: 'relative', zIndex: 1 }}>
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
              {t.menu?.allCategories || 'Nuestras categorías'}
            </Typography>
            
            <Box sx={{ 
              maxWidth: { xs: '100%', md: 360 }, 
              width: { xs: '100%', md: 'auto' },
              flex: { md: '0 0 auto' }
            }}>
              <SearchInput
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t.categories?.searchCategoryPlaceholder || 'Buscar categoría...'}
                isLoading={isLoading}
              />
            </Box>
          </Box>

          {/* Categories Grid */}
          {isInitialLoading ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                  xl: 'repeat(5, minmax(0, 1fr))',
                },
                gap: { xs: 2.5, sm: 3, md: 3.5, lg: 4 },
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <CategoryCardSkeleton key={`skeleton-${index}`} />
              ))}
            </Box>
          ) : categories.length > 0 ? (
            <CategoriesGrid categories={categories} />
          ) : isError ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 3,
                px: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <Box
                  component="svg"
                  sx={{
                    width: 24,
                    height: 24,
                    color: '#ef4444',
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  mb: 2,
                  maxWidth: '300px',
                }}
              >
                {(() => {
                  // Extraer mensaje del backend si está disponible
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
                  
                  return apiError?.response?.data?.message ||
                    apiError?.response?.data?.detail ||
                    apiError?.response?.data?.error ||
                    apiError?.message ||
                    'Error al cargar categorías';
                })()}
              </Typography>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => retry()}
                sx={{
                  fontSize: '0.8125rem',
                  px: 2,
                  py: 0.75,
                }}
              >
                Reintentar
              </Button>
            </Box>
          ) : (
            <Box sx={{ py: 5 }}>
              <EmptyState
                title="No hay categorías disponibles"
                message="Actualmente no hay categorías para mostrar. Intenta recargar la página o vuelve más tarde."
                action={
                  <Link href="/" style={{ textDecoration: 'none' }}>
                    <Box
                      component="button"
                      sx={{
                        px: 3,
                        py: 1.5,
                        backgroundColor: '#29C480',
                        color: '#1e293b',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#ffffff',
                          color: '#000000'
                        }
                      }}
                    >
                      Volver al inicio
                    </Box>
                  </Link>
                }
              />
            </Box>
          )}
        </Container>
      </Box>
    </MainLayout>
  );
}
