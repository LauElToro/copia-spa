'use client';

import React from 'react';
import { Chip, ChipProps, SxProps, Theme } from '@mui/material';

export type StatsBadgeVariant = 'default' | 'success' | 'info' | 'warning';

export interface StatsBadgeProps {
  /**
   * Texto del badge
   */
  label: string;
  /**
   * Variante del badge (color)
   */
  variant?: StatsBadgeVariant;
  /**
   * Props adicionales del Chip
   */
  chipProps?: ChipProps;
}

const variantStyles: Record<StatsBadgeVariant, SxProps<Theme>> = {
  default: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#D1D5DB',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  success: {
    backgroundColor: 'rgba(41, 196, 128, 0.1)',
    color: '#29C480',
    border: '1px solid rgba(41, 196, 128, 0.2)'
  },
  info: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#3B82F6',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  },
  warning: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    color: '#FBBF24',
    border: '1px solid rgba(251, 191, 36, 0.2)'
  }
};

/**
 * Badge reutilizable para mostrar estadísticas
 */
export const StatsBadge: React.FC<StatsBadgeProps> = ({
  label,
  variant = 'default',
  chipProps
}) => {
  return (
    <Chip
      label={label}
      size="small"
      sx={[
        {
          fontSize: '12px',
          height: '28px',
          fontWeight: 500,
          '& .MuiChip-label': {
            px: 1.5
          },
          ...(variantStyles[variant] as SxProps<Theme>)
        },
        chipProps?.sx
      ] as SxProps<Theme>}
      {...chipProps}
    />
  );
};

