"use client";

import React from "react";
import { Box } from "@mui/material";
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { Stack } from "@/presentation/@shared/components/ui/molecules/stack";
import { Grid } from '@mui/material';
import AddToCartSection from "@/presentation/@shared/components/ui/molecules/add-to-cart-section";
import { ProductEntity } from '@/presentation/@shared/types/product';
import { ShippingBadges } from "../shipping-badges/shipping-badges";
import { ProductStats } from "../product-stats/products-stats";

interface ProductDataProps {
  product: ProductEntity;
  handleAddToCart: (quantity: number) => void;
  handleToggleFavorite: () => void;
  isLoading: boolean;
  isFavorite: (id: string) => boolean;
  isProductOwner?: boolean;
  isAuthenticated?: boolean;
}

type FormatNumberOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

const formatNumber = (value: number, options: FormatNumberOptions = {}) => {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;

  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits,
    maximumFractionDigits}).format(value);
};

const formatCryptoAmount = (value: number, currencyLabel: string) => {
  return `${currencyLabel} ${formatNumber(value)}`;
};

const formatFiatAmount = (value: number, currencyCode: string) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2}).format(value);
};

const ProductData: React.FC<ProductDataProps> = ({
  product,
  handleAddToCart,
  handleToggleFavorite,
  isLoading,
  isFavorite,
  isProductOwner = false,
  isAuthenticated}) => {
  const price = product.price as number | { usd?: number; ars?: number; originalUsd?: number; originalArs?: number; discountPct?: number };
  const stats = product.engagementStats;
  const cryptoUpper = (product.crypto || "USDT").toUpperCase();
  /** Línea principal en stablecoin: USDT (incluye legacy USD como etiqueta USDT); ARS solo si el producto es solo en pesos */
  const cryptoLineLabel =
    cryptoUpper === "ARS" ? "ARS" : cryptoUpper === "USDC" ? "USDC" : "USDT";

  // El precio en el objeto ya viene CON descuento aplicado
  const hasArsPrice = typeof price === 'object' && price !== null && typeof price.ars === "number" && !Number.isNaN(price.ars);
  const arsPriceValue = hasArsPrice ? (price.ars as number) : undefined;

  const primaryAmount = (() => {
    if (typeof price === "number") return price;
    if (!price || typeof price !== "object") return 0;
    if (cryptoUpper === "ARS") {
      return price.ars ?? price.usd ?? 0;
    }
    return price.usd ?? price.ars ?? 0;
  })();

  // Compat: nombre legacy en UI (es el monto principal en moneda `crypto`)
  const priceUsd = primaryAmount;
  
  // Precio original (sin descuento) - viene del objeto o se calcula si no está
  const originalUsd = typeof price === 'object' && price !== null 
    ? (price.originalUsd ?? (price.discountPct && cryptoUpper !== 'ARS' ? priceUsd / (1 - price.discountPct / 100) : undefined))
    : undefined;
  
  const originalArs = hasArsPrice && typeof price === 'object' && price !== null && arsPriceValue !== undefined
    ? (price.originalArs ?? (price.discountPct ? arsPriceValue / (1 - price.discountPct / 100) : undefined))
    : undefined;

  const reviews = (product as ProductEntity & { reviews?: Array<{ rating: number }> }).reviews ?? [];
  const fallbackRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
  const rating = stats?.rating?.average ?? fallbackRating ?? 0;
  const totalReviews = stats?.rating?.totalOpinions ?? reviews.length;
  const sales = stats?.sales?.unitsSold ?? product.sales ?? 0;
  const views = stats?.visits?.total ?? product.visits ?? 0;

  return (
    <Stack spacing={3}>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            {/* Nombre del producto */}
            <Text
              variant="p"
              weight="bold"
              sx={{
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                lineHeight: 1.4,
                letterSpacing: '-0.01em',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                color: '#ffffff'
              }}
            >
            {product.name}
          </Text>

            {/* Precio */}
            <Stack spacing={1}>
              {cryptoUpper === "ARS" ? (
                <>
                  {typeof price === "object" && price !== null && price.originalArs !== undefined && price.discountPct ? (
                    <Text
                      variant="body2"
                      sx={{
                        textDecoration: 'line-through',
                        fontWeight: 400,
                        fontSize: '1rem',
                        color: '#9ca3af'
                      }}
                    >
                      {formatFiatAmount(price.originalArs, "ARS")}
                    </Text>
                  ) : null}
                  <Text variant="h6" color="#29C480" weight="bold" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, lineHeight: 1 }}>
                    {formatFiatAmount(priceUsd, "ARS")}
                  </Text>
                </>
              ) : (
                <>
                  {originalUsd !== undefined && originalUsd > 0 && (
                    <Text
                      variant="body2"
                      sx={{
                        textDecoration: 'line-through',
                        fontWeight: 400,
                        fontSize: '1rem',
                        color: '#9ca3af'
                      }}
                    >
                      {formatCryptoAmount(originalUsd, cryptoLineLabel)}
                    </Text>
                  )}
                  <Text variant="h6" color="#29C480" weight="bold" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, lineHeight: 1 }}>
                    {formatCryptoAmount(priceUsd, cryptoLineLabel)}
                  </Text>
                </>
              )}

              {hasArsPrice && arsPriceValue !== undefined && cryptoUpper !== "ARS" && (
                <Stack spacing={0.5}>
                  {originalArs && (
                    <Text
                      variant="body2"
                      sx={{
                        textDecoration: 'line-through',
                        fontWeight: 400,
                        fontSize: '1rem',
                        color: '#9ca3af'
                      }}
                    >
                      {formatFiatAmount(originalArs, "ARS")}
                    </Text>
                  )}
                  <Text variant="small" color="#ffffff" weight="medium" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {formatFiatAmount(arsPriceValue, "ARS")}
                  </Text>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProductStats
            rating={rating}
            totalReviews={totalReviews}
            stock={(product as ProductEntity & { stock?: number }).stock ?? 0}
            sales={sales}
            views={views}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} justifyContent="flex-start" alignItems="flex-start">
        <Grid size={{ xs: 12, md: "auto" }}>
          {(() => {
            // Extraer promociones desde meta.promotions
            const meta = product.meta as { promotions?: {
              promoReturn?: string;
              promoShipping?: string;
              promoBanks?: string;
            } } | undefined;
            const promotions = meta?.promotions || {};
            
            // Determinar deliveryTimeInDays desde promoShipping
            let deliveryTimeInDays: number | undefined;
            if (promotions.promoShipping === "24hs") {
              deliveryTimeInDays = 1;
            } else if (promotions.promoShipping === "48hs") {
              deliveryTimeInDays = 2;
            }

            return (
              <ShippingBadges
                freeShipping={false} // Se puede agregar si viene de otro lugar
                interestFreeInstallments={promotions.promoBanks === "yes"}
                deliveryTimeInDays={deliveryTimeInDays}
              />
            );
          })()}
        </Grid>
      </Grid>

      <Box>
        <AddToCartSection
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          isLoading={isLoading}
          isFavorite={isFavorite(product.id)}
          stock={product.stock !== undefined && product.stock !== null ? product.stock : 0}
          isProductOwner={isProductOwner}
          isAuthenticated={isAuthenticated}
        />
      </Box>
    </Stack>
  );
};

export default ProductData;
