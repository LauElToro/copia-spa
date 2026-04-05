"use client";

import React from 'react';
import { Box } from '@mui/material';
import { CategoryCard } from '../category-card';
import { CategoryWithIcon } from '../../hooks';

interface CategoriesGridProps {
  categories: CategoryWithIcon[];
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
          xl: 'repeat(5, minmax(0, 1fr))',
        },
        gap: { xs: 2.5, sm: 3, md: 3.5, lg: 4 },
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {categories.map((category, index) => (
        <Box
          key={category.id}
          sx={{
            position: 'relative',
            zIndex: 1,
            animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
            '@keyframes fadeInUp': {
              from: {
                opacity: 0,
                transform: 'translateY(20px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <CategoryCard category={category} />
        </Box>
      ))}
    </Box>
  );
};

export default CategoriesGrid;

