"use client";

import React from 'react';
import { Box } from '@mui/material';

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <Box
      sx={{
        height: '200px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.05)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    />
  );
};

export default CategoryCardSkeleton;

