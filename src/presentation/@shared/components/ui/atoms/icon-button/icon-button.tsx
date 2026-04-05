import React, { ReactNode } from 'react';
import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps } from '@mui/material';

export interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  sx?: MuiIconButtonProps['sx'];
  'aria-label'?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  size = 'medium',
  color = 'default',
  sx,
  'aria-label': ariaLabel,
}) => {
  return (
    <MuiIconButton
      onClick={onClick}
      className={className}
      disabled={disabled}
      size={size}
      color={color}
      sx={sx}
      aria-label={ariaLabel}
    >
      {children}
    </MuiIconButton>
  );
};

