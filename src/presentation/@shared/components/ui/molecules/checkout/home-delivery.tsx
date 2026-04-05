'use client';

import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';

interface HomeDeliveryProps {
  address: {
    street: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
  };
  onAddressChange: (field: string, value: string) => void;
}

export const HomeDelivery: React.FC<HomeDeliveryProps> = ({ address, onAddressChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAddressChange(event.target.name, event.target.value);
  };

  const handlePostalCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números
    const value = event.target.value.replace(/\D/g, '');
    onAddressChange('postalCode', value);
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#1f2937',
      color: '#ffffff',
      borderRadius: '4px',
      fontSize: '0.875rem',
      minHeight: '56px',
      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      '& fieldset': {
        borderColor: '#374151',
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: '#22c55e',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#22c55e',
        borderWidth: '1px',
        boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#ffffff',
      fontSize: '0.875rem',
      fontWeight: 500,
      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      '&.Mui-focused': {
        color: '#22c55e',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '16px',
      fontSize: '0.875rem',
      '&::placeholder': {
        color: '#9ca3af',
        opacity: 0.7,
        fontSize: '0.875rem',
      },
    },
  };

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
          Datos de envío
        </Typography>
      </Box>

      {/* Formulario */}
      <Stack spacing={2}>
        <Box>
          <Typography
            component="label"
            htmlFor="city"
            sx={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#ffffff',
              mb: 1,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            Ciudad
          </Typography>
          <TextField
            fullWidth
            name="city"
            id="city"
            value={address.city}
            onChange={handleChange}
            placeholder="Ciudad"
            sx={inputSx}
          />
        </Box>
        <Box>
          <Typography
            component="label"
            htmlFor="street"
            sx={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#ffffff',
              mb: 1,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            Calle y número
          </Typography>
          <TextField
            fullWidth
            name="street"
            id="street"
            value={address.street}
            onChange={handleChange}
            placeholder="Calle y número"
            sx={inputSx}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              component="label"
              htmlFor="province"
              sx={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#ffffff',
                mb: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}
            >
              Provincia
            </Typography>
            <TextField
              fullWidth
              name="province"
              id="province"
              value={address.province}
              onChange={handleChange}
              placeholder="Provincia"
              sx={inputSx}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              component="label"
              htmlFor="postalCode"
              sx={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#ffffff',
                mb: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}
            >
              Código postal
            </Typography>
            <TextField
              fullWidth
              name="postalCode"
              id="postalCode"
              value={address.postalCode}
              onChange={handlePostalCodeChange}
              placeholder="Código postal"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              sx={inputSx}
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
