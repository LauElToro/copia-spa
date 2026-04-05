'use client';

import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { ProductCard } from '@/presentation/@shared/components/ui/molecules/product-card';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { Pagination } from '@/presentation/@shared/components/ui/molecules/pagination/pagination';
import { ProductEntity } from '@/presentation/@shared/types/product';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { getPrimaryImage } from '@/presentation/@shared/utils/product-mapper';

const extractDiscount = (promotion?: string): number | undefined => {
  if (!promotion) {
    return undefined;
  }
  const match = promotion.match(/(\d{1,3})%/);
  if (!match) {
    return undefined;
  }
  const parsed = Number.parseInt(match[1], 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    return undefined;
  }
  return parsed;
};

interface ProductsGridProps {
  products: ProductEntity[];
  isLoading: boolean;
  pagination?: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  onPageChange?: (page: number) => void;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  showInitialMessage?: boolean;
  initialMessageTitle?: string;
  initialMessageText?: string;
  isFiltering?: boolean;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  isLoading,
  pagination,
  onPageChange,
  emptyStateTitle,
  emptyStateMessage,
  showInitialMessage = false,
  initialMessageTitle = "Configura los filtros",
  initialMessageText = "Haz clic en 'Filtrar' para buscar ofertas",
  isFiltering = false,
}) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <CircularProgress sx={{ color: '#29C480' }} />
      </Box>
    );
  }

  if (products.length > 0) {
    return (
      <>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {products.map((product: ProductEntity) => {
            const discountPercent = extractDiscount(product.promotion);
            
            // Manejar precio que puede ser número u objeto
            let basePrice: number;
            let finalPrice: number;
            let originalPrice: number | undefined;
            
            if (typeof product.price === 'number') {
              basePrice = product.price;
              finalPrice = discountPercent
                ? product.price * (1 - discountPercent / 100)
                : product.price;
              originalPrice = discountPercent ? product.price : undefined;
            } else if (typeof product.price === 'object' && product.price !== null) {
              const priceObj = product.price as { usd?: number; originalUsd?: number };
              finalPrice = priceObj.usd ?? 0;
              originalPrice = priceObj.originalUsd;
            } else {
              basePrice = Number(product.price) || 0;
              finalPrice = discountPercent
                ? basePrice * (1 - discountPercent / 100)
                : basePrice;
              originalPrice = discountPercent ? basePrice : undefined;
            }

            // Extraer promociones desde meta.promotions
            const meta = product.meta as { promotions?: {
              promoReturn?: string;
              promoShipping?: string;
              promoBanks?: string;
            } } | undefined;
            const promotions = meta?.promotions || {};

            // Determinar shippingTime desde promoShipping
            let shippingTime: string | undefined;
            if (promotions.promoShipping === "24hs" || promotions.promoShipping === "48hs") {
              shippingTime = promotions.promoShipping;
            }

            return (
              <Box key={product.id}>
                <ProductCard
                  id={product.id}
                  image={getPrimaryImage(product)}
                  title={product.name}
                  price={finalPrice}
                  originalPrice={originalPrice}
                  discount={discountPercent}
                  currency={product.crypto || "USD"}
                  pesosPrice={product.price_ars}
                  promotion={product.promotion}
                  hasSecurePurchase={promotions.promoReturn === "yes"}
                  hasFreeShipping={false} // Se puede agregar si viene de otro lugar
                  hasInterestFreeInstallments={promotions.promoBanks === "yes"}
                  shippingTime={shippingTime}
                />
              </Box>
            );
          })}
        </Box>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && onPageChange && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2, 
            mt: 4 
          }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
            </Typography>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
              className={isLoading ? "opacity-75" : ""}
            />
          </Box>
        )}
      </>
    );
  }

  // Empty States
  if (isFiltering) {
    return (
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <EmptyState
          title={emptyStateTitle || t.categories.noOffersAvailable}
          message={emptyStateMessage || t.categories.noOffersMessage}
          action={
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button
                sx={{
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#29C480',
                  color: '#1e293b',
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#22c55e',
                  }
                }}
              >
                {t.categories.backToHome}
              </Button>
            </Link>
          }
        />
      </Box>
    );
  }

  if (showInitialMessage) {
    return (
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <EmptyState
          title={initialMessageTitle}
          message={initialMessageText}
        />
      </Box>
    );
  }

  return null;
};

