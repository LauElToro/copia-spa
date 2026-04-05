"use client";

import React from 'react';
import { Box, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import NextLink from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <Box
      component="nav"
      aria-label="breadcrumb"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 3,
        flexWrap: 'wrap',
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {isLast ? (
              <Typography
                sx={{
                  color: '#34d399',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {item.label}
              </Typography>
            ) : (
              <Box
                component={item.href ? NextLink : 'span'}
                href={item.href}
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  transition: 'color 0.3s ease',
                  '&:hover': {
                    color: '#34d399',
                  },
                }}
              >
                {item.label}
              </Box>
            )}
            {!isLast && (
              <ChevronRight
                sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '1rem',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default Breadcrumb;

