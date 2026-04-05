'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Stack, Divider } from '@mui/material';
import { Delete as DeleteIcon, Storefront as StoreIcon } from '@mui/icons-material';
import NextLink from 'next/link';
import { SafeImage } from '../../atoms/safe-image';
import { useCart, useCartOperations } from '@/presentation/@shared/hooks/use-cart';
import { useCartStores } from '@/presentation/@shared/hooks/use-cart-stores';
import { useCheckoutStore } from '@/presentation/@shared/stores/checkout-store';
import { formatPrice } from '@/presentation/@shared/utils/format-price';

export const SellerGroupProducts = () => {
  const { sellerGroups, closeCart, totalItems } = useCart();
  const { removeItem, isLoading } = useCartOperations();
  const { stores } = useCartStores();
  const { currentStoreIndex } = useCheckoutStore();
  const router = useRouter();

  const sellerGroup = useMemo(() => {
    // Mostrar el grupo correspondiente al índice de la tienda actual
    return sellerGroups[currentStoreIndex] || sellerGroups[0];
  }, [sellerGroups, currentStoreIndex]);

  // Obtener nombre de la tienda enriquecido por storeId
  const getStoreName = (storeId: string, fallbackName: string, sellerGroup: typeof sellerGroups[0]) => {
    // Primero intentar obtener desde stores enriquecidos (obtenidos de la API)
    const enrichedStore = stores.find(s => s.id === storeId);
    if (enrichedStore?.name && enrichedStore.name !== 'Vendedor Desconocido') {
      return enrichedStore.name;
    }
    
    // Si no está disponible, intentar obtener desde el primer item del grupo que tenga storeName válido
    const itemWithStoreName = sellerGroup.items.find(item => 
      item.storeName && 
      item.storeName.trim() !== '' && 
      item.storeName !== 'Vendedor Desconocido'
    );
    if (itemWithStoreName?.storeName) {
      return itemWithStoreName.storeName;
    }
    
    // Si el fallbackName es válido y no es "Vendedor Desconocido", usarlo
    if (fallbackName && fallbackName.trim() !== '' && fallbackName !== 'Vendedor Desconocido') {
      return fallbackName;
    }
    
    // Solo como último recurso usar "Vendedor Desconocido"
    return 'Vendedor Desconocido';
  };

  const handleProductClick = (productId: string) => {
    closeCart();
    router.push(`/product/${productId}`);
  };

  if (!sellerGroup) {
    return null;
  }

  return (
    <Box>
      {/* Título */}
      <Typography
        sx={{
          color: '#ffffff',
          fontSize: { xs: '0.95rem', md: '1rem' },
          fontWeight: 600,
          mb: 3,
          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        Pagando productos por vendedor
      </Typography>

      {/* Lista de productos */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        {sellerGroup.items.map((item) => (
          <Box
            key={`${item.id}-${item.size}-${item.color}`}
            sx={{
              display: 'flex',
              gap: 2,
              p: 2,
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(0, 0, 0, 0.6))',
              border: '1px solid rgba(41, 196, 128, 0.1)',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'rgba(41, 196, 128, 0.25)',
              },
            }}
          >
            {/* Imagen */}
            <Box
              sx={{
                position: 'relative',
                width: { xs: 70, md: 80 },
                height: { xs: 70, md: 80 },
                flexShrink: 0,
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <SafeImage
                src={item.image}
                alt={item.name}
                type="product"
                fill
                fallbackIconSize={24}
                style={{ objectFit: 'contain' }}
              />
            </Box>

            {/* Detalles */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <NextLink
                href={`/product/${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleProductClick(item.id);
                }}
                style={{ textDecoration: 'none' }}
              >
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontSize: { xs: '0.85rem', md: '0.9rem' },
                    fontWeight: 600,
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: '#34d399',
                    },
                  }}
                >
                  {item.name}
                </Typography>
              </NextLink>

              {/* Variantes */}
              {(item.size || item.color) && (
                <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                  {item.size && (
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      Talla: {item.size}
                    </Typography>
                  )}
                  {item.color && (
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      Color: {item.color}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Precio */}
              <Typography
                sx={{
                  color: '#34d399',
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  fontWeight: 700,
                  mb: 1,
                  fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                {formatPrice(item.price)}
              </Typography>

              {/* Cantidad y botón eliminar */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.75rem',
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  Cantidad: {item.quantity}
                </Typography>
                
                {/* Botón eliminar */}
                <Box
                  component="button"
                  onClick={() => removeItem(item.id)}
                  disabled={isLoading}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    padding: '6px 10px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover:not(:disabled)': {
                      color: '#ef4444',
                      background: 'rgba(239, 68, 68, 0.1)',
                    },
                    '&:disabled': {
                      color: 'rgba(255, 255, 255, 0.2)',
                      cursor: 'not-allowed',
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    Eliminar
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Resumen de la tienda */}
      <Box
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, rgba(41, 196, 128, 0.08), rgba(41, 196, 128, 0.02))',
          border: '1px solid rgba(41, 196, 128, 0.15)',
          borderRadius: '12px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
            <StoreIcon sx={{ fontSize: 18, color: '#29C480' }} />
          </Box>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.9rem',
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Tienda:{' '}
            <Box component="span" sx={{ color: '#29C480', fontWeight: 600 }}>
              {sellerGroup ? getStoreName(sellerGroup.storeId, sellerGroup.storeName, sellerGroup) : 'Vendedor Desconocido'}
            </Box>
          </Typography>
        </Box>

        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.85rem',
            mb: 2,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          Items en esta tienda:{' '}
          <Box component="span" sx={{ color: '#29C480', fontWeight: 600 }}>
            {totalItems}
          </Box>
        </Typography>

        <Divider sx={{ borderColor: 'rgba(41, 196, 128, 0.15)', mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 600,
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Total General:
          </Typography>
          <Typography
            sx={{
              color: '#34d399',
              fontSize: '1.1rem',
              fontWeight: 700,
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {formatPrice(sellerGroup.total)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
