'use client';

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { CheckoutActionButtons } from './checkout-action-buttons';
import { formatPrice } from '@/presentation/@shared/utils/format-price';
import { useCart, useCartOperations } from '@/presentation/@shared/hooks/use-cart';

export const OrderSummary = () => {
  const { totalItems, total, sellerGroups, items } = useCart();
  const { clearCart, isLoading } = useCartOperations();

  const showScrollIndicator = sellerGroups.length > 2 || items.length > 2;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
        border: '1px solid rgba(41, 196, 128, 0.15)',
        borderRadius: '16px',
      }}
    >
      {/* Indicador de scroll */}
      {showScrollIndicator && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ExpandMoreIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 28 }} />
        </Box>
      )}

      {/* Items y vaciar carrito */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          mb: 2,
          borderBottom: '1px solid rgba(41, 196, 128, 0.15)',
        }}
      >
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          Cantidad de items:{' '}
          <Box
            component="span"
            sx={{
              color: '#29C480',
              fontWeight: 700,
              ml: 0.5,
            }}
          >
            {totalItems}
          </Box>
        </Typography>

        <IconButton
          onClick={() => clearCart()}
          disabled={isLoading}
          size="small"
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.8rem',
            borderRadius: '8px',
            px: 1.5,
            gap: 0.5,
            '&:hover': {
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.1)',
            },
            '&:disabled': {
              color: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Vaciar carrito
          </Typography>
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Total */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: 600,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          Total General:
        </Typography>
        <Typography
          sx={{
            color: '#34d399',
            fontSize: '1.25rem',
            fontWeight: 700,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {formatPrice(total)}
        </Typography>
      </Box>

      {/* Botones de acción */}
      <CheckoutActionButtons />
    </Box>
  );
};
