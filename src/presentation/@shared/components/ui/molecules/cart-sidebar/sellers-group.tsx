'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { SafeImage } from '../../atoms/safe-image';
import StarRating from '../../molecules/star-rating';
import { VerificationBadges } from '../../molecules/verification-badges';
import { OrderSummary } from './order-summary';
import { useCartStores } from '@/presentation/@shared/hooks/use-cart-stores';

export const SellersGroup = () => {
  const { stores, isEmpty } = useCartStores();

  // Early return después de todos los hooks
  if (isEmpty) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minWidth: 0 }}>
      {/* Título */}
      <Box sx={{ mb: 3, flexShrink: 0 }}>
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1rem', md: '1.125rem' },
            fontWeight: 600,
            textAlign: { xs: 'center', md: 'left' },
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          Vendedores de tus productos
        </Typography>
      </Box>

      {/* Lista de tiendas */}
      <Stack spacing={2} sx={{ mb: 3, flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
        {stores.map((store) => (
          <Box
            key={store.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 2, md: 3 },
              p: { xs: 2, md: 2.5 },
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(0, 0, 0, 0.6))',
              border: '1px solid rgba(41, 196, 128, 0.1)',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'rgba(41, 196, 128, 0.25)',
              },
            }}
          >
            {/* Imagen de la tienda */}
            <Box
              sx={{
                position: 'relative',
                width: { xs: 60, md: 80 },
                height: { xs: 60, md: 80 },
                flexShrink: 0,
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(41, 196, 128, 0.2)',
              }}
            >
              <SafeImage
                src={store.imageUrl || ''}
                alt={store.name}
                type="store"
                fill
                fallbackIconSize={32}
                style={{ objectFit: 'cover' }}
              />
            </Box>

            {/* Información de la tienda */}
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: { xs: 0.5, md: 2 },
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 600,
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  {store.name}
                </Typography>
                {store.rating && store.rating > 0 && (
                  <StarRating rating={store.rating} size="md" />
                )}
              </Box>

              <VerificationBadges
                kyc={store.kyc || false}
                kyb={store.kyb || false}
                buttonsWidth={150}
              />
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Resumen del pedido */}
      <Box sx={{ flexShrink: 0 }}>
        <OrderSummary />
      </Box>
    </Box>
  );
};
