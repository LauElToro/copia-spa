'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Close } from '@mui/icons-material';

export interface ActiveFilter {
  key: string;
  label: string;
  value: string | number;
  onRemove: () => void;
}

interface ActiveFiltersListProps {
  filters: ActiveFilter[];
  onClearAll?: () => void;
}

export const ActiveFiltersList: React.FC<ActiveFiltersListProps> = ({ filters, onClearAll }) => {

  if (filters.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        backgroundColor: 'rgba(41, 196, 128, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(41, 196, 128, 0.2)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#34d399',
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          Filtros activos ({filters.length})
        </Typography>
        {onClearAll && (
          <Typography
            onClick={onClearAll}
            sx={{
              fontSize: '0.75rem',
              color: '#34d399',
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': {
                color: '#22c55e',
              }
            }}
          >
            Limpiar todo
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {filters.map((filter) => (
          <Chip
            key={filter.key}
            label={`${filter.label}: ${filter.value}`}
            onDelete={filter.onRemove}
            deleteIcon={<Close sx={{ fontSize: '16px !important', color: '#ffffff !important' }} />}
            sx={{
              backgroundColor: '#29C480',
              color: '#1e293b',
              fontWeight: 500,
              fontSize: '0.75rem',
              height: '28px',
              '& .MuiChip-deleteIcon': {
                color: '#1e293b',
                '&:hover': {
                  color: '#000000',
                }
              },
              '&:hover': {
                backgroundColor: '#22c55e',
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

