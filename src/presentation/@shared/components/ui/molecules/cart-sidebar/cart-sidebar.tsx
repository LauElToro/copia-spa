'use client';

import React from 'react';
import { Drawer, Box, IconButton, Typography, Stack } from '@mui/material';
import { Close as CloseIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { usePathname } from 'next/navigation';

//atoms & molecules
import { Text } from '../../atoms/text';
import { Image } from '../../atoms/image';
import { SellersGroupProducts } from './sellers-group-products';
import { OrderSummary } from './order-summary';

//utils & hooks
import { useCart, useFreeShipping } from '../../../../hooks/use-cart';
import { formatPrice } from '@/presentation/@shared/utils/format-price';

const CartSidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    items,
    isOpen,
    closeCart } = useCart();

  const { remainingForFreeShipping, isFreeShippingEligible } = useFreeShipping();

  // No mostrar el sidebar si estamos en la página del carrito
  if (pathname === '/cart') {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={closeCart}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100%',
          backgroundColor: '#000000',
          color: '#ffffff',
        },
        zIndex: 1300,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Header del carrito */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 3,
            borderBottom: '1px solid rgba(41, 196, 128, 0.15)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <ShoppingCartIcon sx={{ color: '#29C480', fontSize: '1.5rem' }} />
            <Text
              variant="h5"
              sx={{
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}
            >
              Mi Carrito
            </Text>
          </Stack>
          <IconButton
            onClick={closeCart}
            aria-label="Cerrar carrito"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(41, 196, 128, 0.1)',
                color: '#29C480',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Banner de envío gratuito */}
        {!isFreeShippingEligible && items.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              padding: 2,
              mx: 2,
              mt: 2,
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '10px',
              color: '#fbbf24',
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: '1.1rem' }} />
            <Typography
              variant="body2"
              sx={{
                color: '#fbbf24',
                fontWeight: 500,
                fontSize: '0.85rem',
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              ¡Agrega productos por {formatPrice(remainingForFreeShipping)} más para envío GRATIS!
            </Typography>
          </Box>
        )}

        {/* Lista de productos agrupados por vendedor */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: items.length === 0 ? 'center' : 'space-between',
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
          {items.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                padding: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Text
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '1rem',
                }}
              >
                Tu carrito está vacío
              </Text>
              <Image src="/images/icons/carrito-tienda-1.svg" width={150} height={187} alt="cart_icon" />
            </Box>
          ) : (
            <>
              <SellersGroupProducts />
              {/* Resumen general del carrito */}
              {items.length > 0 && (
                <OrderSummary />
              )}
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default CartSidebar;

/*
Ejemplo de uso del carrito con productos de diferentes vendedores:

// Agregar productos de diferentes vendedores
const { addToCart } = useAddToCart();

// Producto del vendedor 1
addToCart({
  id: 'product-1',
  name: 'Camiseta Deportiva',
  price: 25.99,
  image: '/images/products/camiseta.jpg',
  size: 'M',
  color: 'Azul',
  storeId: 'store-1',
  storeName: 'Deportes Express'
});

// Producto del vendedor 2
addToCart({
  id: 'product-2',
  name: 'Zapatillas Running',
  price: 89.99,
  image: '/images/products/zapatillas.jpg',
  size: '42',
  color: 'Negro',
  storeId: 'store-2',
  storeName: 'Calzado Premium'
});

// Producto del mismo vendedor 1
addToCart({
  id: 'product-3',
  name: 'Pantalón Deportivo',
  price: 35.50,
  image: '/images/products/pantalon.jpg',
  size: 'L',
  color: 'Gris',
  storeId: 'store-1',
  storeName: 'Deportes Express'
});

El carrito automáticamente agrupará los productos por vendedor y calculará:
- Subtotal por vendedor
- Envío por vendedor ($5 por vendedor)
- Impuestos por vendedor (16% del subtotal)
- Total por vendedor
- Total general de todos los vendedores
*/
