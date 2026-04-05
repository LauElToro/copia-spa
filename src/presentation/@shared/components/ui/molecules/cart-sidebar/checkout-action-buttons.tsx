'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Stack } from '@mui/material';
import { ShoppingCart as CartIcon, Payment as PaymentIcon } from '@mui/icons-material';
import { useCart } from '@/presentation/@shared/hooks/use-cart';

export const CheckoutActionButtons = () => {
  const { items, isOpen, closeCart } = useCart();
  const router = useRouter();

  const handleViewCart = () => {
    closeCart();
    router.push('/cart');
  };

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      {isOpen && (
        <Button
          onClick={handleViewCart}
          fullWidth
          startIcon={<CartIcon />}
          sx={{
            height: 48,
            borderRadius: '10px',
            background: 'transparent',
            border: '1px solid rgba(41, 196, 128, 0.5)',
            color: '#29C480',
            fontSize: '0.9rem',
            fontWeight: 600,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'rgba(41, 196, 128, 0.1)',
              borderColor: '#29C480',
            },
          }}
        >
          Ver Carrito
        </Button>
      )}

      <Button
        onClick={handleCheckout}
        fullWidth
        startIcon={<PaymentIcon />}
        sx={{
          height: 48,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #29C480 0%, #22c55e 100%)',
          color: '#0f172a',
          fontSize: '0.9rem',
          fontWeight: 600,
          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          textTransform: 'none',
          boxShadow: '0 4px 14px rgba(41, 196, 128, 0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #34d399 0%, #29C480 100%)',
            boxShadow: '0 6px 20px rgba(41, 196, 128, 0.4)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        Finalizar Compra
      </Button>
    </Stack>
  );
};
