'use client';

import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { Box, BoxProps } from '@mui/material';

export interface StarRatingProps {
  /**
   * Valor del rating (0-5)
   */
  rating: number;
  /**
   * Tamaño de las estrellas en px
   */
  size?: number;
  /**
   * Color de las estrellas llenas
   */
  activeColor?: string;
  /**
   * Color de las estrellas vacías
   */
  inactiveColor?: string;
  /**
   * Mostrar sombra en las estrellas activas
   */
  showShadow?: boolean;
  /**
   * Habilitar efecto hover
   */
  enableHover?: boolean;
  /**
   * Alineación de las estrellas
   */
  align?: 'left' | 'center' | 'right';
  /**
   * Clase CSS adicional
   */
  className?: string;
  /**
   * Props adicionales para el contenedor
   */
  containerProps?: BoxProps;
}

/**
 * Componente de rating con estrellas reutilizable
 * 
 * @example
 * ```tsx
 * <StarRating rating={4.5} size={20} />
 * ```
 */
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 16,
  activeColor = '#FBBF24',
  inactiveColor = '#9CA3AF',
  showShadow = true,
  enableHover = true,
  align = 'left',
  className = '',
  containerProps
}) => {
  const getStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(
          <Box
            key={i}
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              transition: enableHover ? 'transform 0.2s ease' : 'none',
              '&:hover': enableHover ? {
                transform: 'scale(1.1)'
              } : {}
            }}
          >
            <FaStar
              style={{
                color: activeColor,
                fontSize: `${size}px`,
                filter: showShadow ? `drop-shadow(0 2px 4px ${activeColor}40)` : 'none'
              }}
            />
          </Box>
        );
      } else if (rating >= i - 0.5) {
        stars.push(
          <Box
            key={i}
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              transition: enableHover ? 'transform 0.2s ease' : 'none',
              '&:hover': enableHover ? {
                transform: 'scale(1.1)'
              } : {}
            }}
          >
            <FaStarHalfAlt
              style={{
                color: activeColor,
                fontSize: `${size}px`,
                filter: showShadow ? `drop-shadow(0 2px 4px ${activeColor}40)` : 'none'
              }}
            />
          </Box>
        );
      } else {
        stars.push(
          <Box
            key={i}
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              opacity: 0.4,
              transition: enableHover ? 'opacity 0.2s ease' : 'none',
              '&:hover': enableHover ? {
                opacity: 0.6
              } : {}
            }}
          >
            <FaRegStar
              style={{
                color: inactiveColor,
                fontSize: `${size}px`
              }}
            />
          </Box>
        );
      }
    }
    return stars;
  };

  const justifyContent = align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end';

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 0.5,
        alignItems: 'center',
        justifyContent
      }}
      {...containerProps}
    >
      {getStars()}
    </Box>
  );
};

