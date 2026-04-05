'use client';

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useCartOperations } from '@/presentation/@shared/hooks/use-cart';
import { CartItem } from '@/presentation/@shared/types/cart.types';

interface InputQuantityCart {
  item: CartItem;
}

export const InputQuantity = ({ item }: InputQuantityCart) => {
  const { updateQuantity, isLoading } = useCartOperations();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity({ id, quantity: newQuantity });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        background: 'rgba(41, 196, 128, 0.08)',
        borderRadius: '8px',
        p: 0.5,
      }}
    >
      <IconButton
        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
        disabled={isLoading || item.quantity <= 1}
        size="small"
        sx={{
          width: 28,
          height: 28,
          color: '#29C480',
          '&:hover': {
            background: 'rgba(41, 196, 128, 0.15)',
          },
          '&:disabled': {
            color: 'rgba(255, 255, 255, 0.3)',
          },
        }}
      >
        <RemoveIcon sx={{ fontSize: 16 }} />
      </IconButton>

      <Typography
        sx={{
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: 600,
          minWidth: '24px',
          textAlign: 'center',
          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {item.quantity}
      </Typography>

      <IconButton
        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
        disabled={isLoading}
        size="small"
        sx={{
          width: 28,
          height: 28,
          color: '#29C480',
          '&:hover': {
            background: 'rgba(41, 196, 128, 0.15)',
          },
          '&:disabled': {
            color: 'rgba(255, 255, 255, 0.3)',
          },
        }}
      >
        <AddIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
};
