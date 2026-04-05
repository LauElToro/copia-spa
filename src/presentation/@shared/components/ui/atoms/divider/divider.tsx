import React from 'react';
import { Divider as MuiDivider, DividerProps as MuiDividerProps } from '@mui/material';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'fullWidth' | 'inset' | 'middle';
  className?: string;
  sx?: MuiDividerProps['sx'];
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'fullWidth',
  className = '',
  sx,
}) => {
  return (
    <MuiDivider
      orientation={orientation}
      variant={variant}
      className={className}
      sx={{
        borderColor: 'rgba(255, 255, 255, 0.12)',
        ...sx,
      }}
    />
  );
};

