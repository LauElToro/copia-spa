'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';

interface StorePickupProps {
  storeAddress: string;
}

export const StorePickup: React.FC<StorePickupProps> = ({ storeAddress }) => {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
        border: '1px solid rgba(41, 196, 128, 0.15)',
        borderRadius: '12px',
      }}
    >
      {/* Título */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(41, 196, 128, 0.15)',
            borderRadius: '8px',
          }}
        >
          <LocationIcon sx={{ fontSize: 18, color: '#29C480' }} />
        </Box>
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '0.95rem', md: '1rem' },
            fontWeight: 600,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          Dirección de la tienda
        </Typography>
      </Box>

      {/* Dirección */}
      <Box
        sx={{
          p: 2,
          backgroundColor: '#1f2937',
          borderRadius: '4px',
          border: '1px solid #374151',
        }}
      >
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            whiteSpace: 'pre-line',
          }}
        >
          {storeAddress || 'Dirección no disponible'}
        </Typography>
      </Box>
    </Box>
  );
};

