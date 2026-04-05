'use client';

import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

interface RadioCardOption {
  id: string;
  value: string;
  icon: ReactNode;
  title: string;
  description: string;
}

interface RadioCardProps {
  option: RadioCardOption;
  name: string;
  isSelected: boolean;
  onChange: (value: string) => void;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  option,
  name,
  isSelected,
  onChange,
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        component="label"
        htmlFor={option.id}
        sx={{
          display: 'block',
          cursor: 'pointer',
          padding: { xs: '1rem', md: '1.25rem 1.5rem' },
          background: isSelected
            ? 'linear-gradient(135deg, rgba(41, 196, 128, 0.15) 0%, rgba(41, 196, 128, 0.05) 100%)'
            : 'rgba(255, 255, 255, 0.02)',
          border: isSelected
            ? '2px solid #29C480'
            : '2px solid transparent',
          borderRadius: '12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: isSelected
              ? 'linear-gradient(135deg, rgba(41, 196, 128, 0.15) 0%, rgba(41, 196, 128, 0.05) 100%)'
              : 'rgba(255, 255, 255, 0.05)',
            borderColor: isSelected ? '#29C480' : 'rgba(41, 196, 128, 0.3)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 2, md: 3 },
          }}
        >
          <input
            type="radio"
            id={option.id}
            name={name}
            value={option.value}
            onChange={() => onChange(option.value)}
            checked={isSelected}
            style={{ display: 'none' }}
          />

          {/* Icono */}
          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isSelected
                ? 'rgba(41, 196, 128, 0.15)'
                : 'rgba(41, 196, 128, 0.05)',
              borderRadius: '10px',
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              color: isSelected ? '#29C480' : 'rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease',
            }}
          >
            {option.icon}
          </Box>

          {/* Contenido */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                mb: 0.5,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              {option.title}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: { xs: '0.8rem', md: '0.875rem' },
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              {option.description}
            </Typography>
          </Box>

          {/* Check icon */}
          {isSelected && (
            <CheckCircleIcon
              sx={{
                color: '#29C480',
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
