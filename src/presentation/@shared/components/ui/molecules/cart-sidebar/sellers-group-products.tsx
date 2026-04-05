'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import { Storefront as StoreIcon, Delete as DeleteIcon } from '@mui/icons-material';
import NextLink from 'next/link';
import { SafeImage } from '../../atoms/safe-image';
import { InputQuantity } from './input-quantity';
import { useCart, useCartOperations } from '@/presentation/@shared/hooks/use-cart';
import { useCartStores } from '@/presentation/@shared/hooks/use-cart-stores';
import { formatPrice } from '@/presentation/@shared/utils/format-price';
import { useModal } from '@/presentation/@shared/hooks/use-modal';
import { ImageModal } from '@/presentation/@shared/components/ui/molecules/image-modal';

export const SellersGroupProducts = () => {
  const { sellerGroups, closeCart } = useCart();
  const { removeItem, isLoading } = useCartOperations();
  const { stores } = useCartStores();
  const router = useRouter();
  const { openModal } = useModal();

  // Función para obtener el avatar de la tienda
  const getStoreAvatar = (storeId: string): string | undefined => {
    const store = stores.find(s => s.id === storeId);
    return store?.imageUrl;
  };

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

  // Función para obtener todas las imágenes del producto
  // Por ahora solo tenemos la imagen del carrito, pero esto permite extenderlo fácilmente
  const getProductImages = useCallback((itemImage: string): string[] => {
    const images: string[] = [];
    if (itemImage) {
      images.push(itemImage);
    }
    // Si no hay imagen, usar la imagen por defecto
    if (images.length === 0) {
      images.push('/images/icons/avatar.png');
    }
    return images;
  }, []);

  // Handler para el click en la imagen
  const handleImageClick = useCallback((e: React.SyntheticEvent, itemImage: string, itemName: string) => {
    e.preventDefault();
    e.stopPropagation();
    const images = getProductImages(itemImage);
    openModal(
      <ImageModal
        images={images}
        initialIndex={0}
        alt={itemName}
      />,
      {
        maxWidth: false,
        fullWidth: true
      }
    );
  }, [getProductImages, openModal]);

  // Función para prevenir propagación de eventos
  const stopAll = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent?.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        minWidth: 0,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(41, 196, 128, 0.3)',
          borderRadius: '3px',
          '&:hover': {
            background: 'rgba(41, 196, 128, 0.5)',
          },
        },
      }}
    >
      {sellerGroups.map((sellerGroup) => (
        <Box key={sellerGroup.storeId} sx={{ mb: 3 }}>
          {/* Header del vendedor */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 2,
              pb: 1.5,
              borderBottom: '1px solid rgba(41, 196, 128, 0.15)',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 32,
                height: 32,
                flexShrink: 0,
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'rgba(41, 196, 128, 0.1)',
                border: '1px solid rgba(41, 196, 128, 0.2)',
              }}
            >
              {getStoreAvatar(sellerGroup.storeId) ? (
                <SafeImage
                  src={getStoreAvatar(sellerGroup.storeId) || ''}
                  alt={getStoreName(sellerGroup.storeId, sellerGroup.storeName, sellerGroup)}
                  type="store"
                  fill
                  fallbackIconSize={18}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StoreIcon sx={{ fontSize: 18, color: '#29C480' }} />
                </Box>
              )}
            </Box>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              {getStoreName(sellerGroup.storeId, sellerGroup.storeName, sellerGroup)}
            </Typography>
          </Box>

          {/* Productos del vendedor */}
          <Stack spacing={2}>
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
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
                  },
                }}
              >
                {/* Imagen del producto */}
                <Box
                  onClick={(e) => handleImageClick(e, item.image, item.name)}
                  onMouseDownCapture={stopAll}
                  onTouchStartCapture={stopAll}
                  onPointerDownCapture={stopAll}
                  sx={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                    flexShrink: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.05)',
                    cursor: 'zoom-in',
                    touchAction: 'none',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    type="product"
                    fill
                    fallbackIconSize={28}
                    style={{ objectFit: 'contain' }}
                  />
                </Box>

                {/* Detalles del producto */}
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
                        fontSize: '0.875rem',
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
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    {formatPrice(item.price)}
                  </Typography>
                </Box>

                {/* Controles */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: 1.5,
                  }}
                >
                  <IconButton
                    onClick={() => removeItem(item.id)}
                    disabled={isLoading}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      borderRadius: '8px',
                      px: 1.5,
                      py: 0.75,
                      gap: 0.5,
                      textTransform: 'none',
                      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.25)',
                        color: '#ffffff',
                      },
                      '&:disabled': {
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        color: 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
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
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>

                  <InputQuantity item={item} />
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};
