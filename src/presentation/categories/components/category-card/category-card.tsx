"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';
import { CategoryWithIcon } from '../../hooks';

interface CategoryCardProps {
  category: CategoryWithIcon;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box className="category-card-container group" sx={{ position: 'relative', height: '100%' }}>
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="category-card group"
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 2.5, sm: 3, md: 3.5 },
          minHeight: { xs: '180px', sm: '200px', md: '220px' },
          height: '100%',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(0, 0, 0, 0.6))',
          border: '1px solid rgba(41, 196, 128, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          "&:hover": {
            borderColor: 'rgba(41, 196, 128, 0.4)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.7))',
            '& .category-icon-main': {
              opacity: 0,
              transform: 'scale(0.8) rotate(-5deg)',
            },
            '& .category-icon-hover': {
              opacity: 1,
              transform: 'scale(1) rotate(0deg)',
            },
            '& .category-name': {
              color: '#29C480',
              transform: 'translateY(-2px)',
            },
          },
        }}
      >
        
        <Link
          href={`/categories/${category.id}`}
          style={{ 
            textDecoration: 'none',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: { xs: 70, sm: 80, md: 90 },
              height: { xs: 70, sm: 80, md: 90 },
              mb: { xs: 2, sm: 2.5 },
            }}
          >
            {/* Ícono principal (visible al inicio) */}
            <Box
              className="category-icon category-icon-main"
              component="img"
              src={`/images/categories/${category.iconName}.svg`}
              alt={category.name}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 1,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'scale(1) rotate(0deg)',
                // Mantener calidad vectorial - evitar pixelado
                imageRendering: 'crisp-edges',
                WebkitImageRendering: 'crisp-edges',
              }}
            />

            {/* Ícono hover (logo.svg, aparece con hover) */}
            <Box
              className="category-icon-2 category-icon-hover"
              component="img"
              src="/logo.svg"
              alt="Logo"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 0,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'scale(0.8) rotate(5deg)',
                // Mantener calidad vectorial - evitar pixelado
                imageRendering: 'crisp-edges',
                WebkitImageRendering: 'crisp-edges',
              }}
            />
          </Box>

          <Typography
            variant="h6"
            component="h5"
            className="category-name"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              textAlign: 'center',
              fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '0.02em',
            }}
          >
            {category.name}
          </Typography>
        </Link>
      </Box>
    </Box>
  );
};

export default CategoryCard;

