import React, { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';

export interface SectionProps extends Omit<BoxProps, 'component'> {
  children: ReactNode;
  variant?: 'default' | 'dark' | 'light';
  padding?: number | { xs?: number; sm?: number; md?: number; lg?: number };
}

export const Section: React.FC<SectionProps> = ({
  children,
  variant = 'default',
  padding = 5,
  sx,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'dark':
        return {
          backgroundColor: '#000',
          color: '#fff',
        };
      case 'light':
        return {
          backgroundColor: '#f9fafb',
          color: '#121619',
        };
      default:
        return {};
    }
  };

  return (
    <Box
      component="section"
      sx={{
        paddingY: padding,
        ...getVariantStyles(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

