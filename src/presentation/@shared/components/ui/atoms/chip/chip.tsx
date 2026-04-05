import React from 'react';
import { Chip as MuiChip, ChipProps as MuiChipProps } from '@mui/material';

export type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

export interface ChipProps {
  label: string;
  color?: ChipColor;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  className?: string;
  sx?: MuiChipProps['sx'];
}

export const Chip: React.FC<ChipProps> = ({
  label,
  color = 'default',
  size = 'medium',
  variant = 'filled',
  className = '',
  sx,
}) => {
  return (
    <MuiChip
      label={label}
      color={color}
      size={size}
      variant={variant}
      className={className}
      sx={sx}
    />
  );
};

