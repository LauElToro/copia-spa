'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { StarRating } from '@/presentation/@shared/components/ui/atoms/star-rating';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

export interface RatingDisplayProps {
  /**
   * Valor del rating (0-5)
   */
  rating: number;
  /**
   * Número total de opiniones
   */
  totalReviews: number;
  /**
   * Alineación del componente
   */
  align?: 'left' | 'right';
  /**
   * Tamaño del rating (texto)
   */
  ratingSize?: 'small' | 'medium' | 'large';
}

/**
 * Componente que muestra el rating con estrellas y número de opiniones
 */
export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  totalReviews,
  align = 'right',
  ratingSize = 'medium'
}) => {
  const { t } = useLanguage();
  const fontSizeMap = {
    small: { xs: '18px', md: '20px' },
    medium: { xs: '20px', md: '24px' },
    large: { xs: '24px', md: '28px' }
  };

  const starSizeMap = {
    small: 14,
    medium: 16,
    large: 18
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        justifyContent: align === 'left' ? 'flex-start' : 'flex-end'
    }}
    >
      <Typography
        component="span"
        sx={{
          color: '#ffffff',
          fontWeight: 700,
          fontSize: fontSizeMap[ratingSize],
          lineHeight: 1,
          letterSpacing: '-0.02em'
        }}
      >
        {rating.toFixed(1)}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 0.5,
          alignItems: 'center',
          px: 1,
          py: 0.5,
          borderRadius: '8px',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.2)'
        }}
      >
        <StarRating
          rating={rating}
          size={starSizeMap[ratingSize]}
          align="left"
          enableHover={true}
        />
      </Box>
      <Typography
        component="span"
        sx={{
          color: '#9CA3AF',
          fontSize: '13px',
          lineHeight: 1.5,
          fontWeight: 400
        }}
      >
        ({totalReviews} {totalReviews === 1 ? t.shop.review : t.shop.reviews})
      </Typography>
    </Box>
  );
};
