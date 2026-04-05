'use client';

import React from 'react';
import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import { RatingDisplay } from './rating-display';
import { StatsBadge } from './stats-badge';

export interface ProductStatsProps {
  /**
   * Valor del rating (0-5)
   */
  rating: number;
  /**
   * Número total de opiniones
   */
  totalReviews: number;
  /**
   * Cantidad de stock disponible
   */
  stock: number;
  /**
   * Número de ventas
   */
  sales: number;
  /**
   * Número de visitas
   */
  views: number;
}

/**
 * Componente que muestra las estadísticas del producto (rating, opiniones, stock, ventas, visitas)
 */
export const ProductStats: React.FC<ProductStatsProps> = ({
  rating,
  totalReviews,
  stock,
  sales,
  views
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Stack
      spacing={2}
      sx={{
        alignItems: { xs: 'flex-start', md: 'flex-end' },
        textAlign: { xs: 'left', md: 'right' }
      }}
    >
      {/* Rating y Opiniones */}
      <RatingDisplay
        rating={rating}
        totalReviews={totalReviews}
        align={(isMobile ? 'left' : 'right') as 'left' | 'right'}
        ratingSize="medium"
      />

      {/* Stock, Ventas y Visitas */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          justifyContent: { xs: 'flex-start', md: 'flex-end' }
        }}
      >
        <StatsBadge
          label={`${stock} unidades`}
          variant="default"
        />
        <Box
          component="span"
          sx={{
            color: '#6B7280',
            fontSize: '14px',
            fontWeight: 300
          }}
        >
          /
        </Box>
        <StatsBadge
          label={`Ventas ${sales}`}
          variant="success"
        />
        <Box
          component="span"
          sx={{
            color: '#6B7280',
            fontSize: '14px',
            fontWeight: 300
          }}
        >
          /
        </Box>
        <StatsBadge
          label={`Visitas ${views}`}
          variant="info"
        />
      </Box>
    </Stack>
  );
};
