"use client";

import React from 'react';
import { Box, Typography, CircularProgress, Button as MuiButton } from '@mui/material';
import { Error as ErrorIcon, ShoppingCart, DeleteOutline } from '@mui/icons-material';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { SellersGroupProducts } from '@/presentation/@shared/components/ui/molecules/cart-sidebar/sellers-group-products';
import { SellersGroup } from '@/presentation/@shared/components/ui/molecules/cart-sidebar/sellers-group';
import { formatPrice } from '@/presentation/@shared/utils/format-price';
import { FaShoppingCart } from 'react-icons/fa';

interface CartSectionProps {
  title: string;
  isLoading: boolean;
  isError: boolean;
  error?: Error | unknown;
  itemsCount: number;
  totalItems: number;
  remainingForFreeShipping?: number;
  isFreeShippingEligible?: boolean;
  onRetry: () => void;
  onClearCart: () => void;
  onContinueShopping: () => void;
  isClearingCart?: boolean;
}

const CartSection: React.FC<CartSectionProps> = ({
  title,
  isLoading,
  isError,
  error,
  itemsCount,
  totalItems,
  remainingForFreeShipping,
  isFreeShippingEligible,
  onRetry,
  onClearCart,
  onContinueShopping,
  isClearingCart = false,
}) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
        border: "2px solid rgba(41, 196, 128, 0.1)",
        borderRadius: "24px",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        "&:hover": {
          backgroundColor: "rgba(41, 196, 128, 0.08)",
          borderColor: "rgba(41, 196, 128, 0.4)",
        },
        padding: { xs: 3, md: 4 },
        gap: 3,
      }}
    >
      {/* Título y controles */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: '#34d399',
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            flex: { md: '0 0 auto' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}
            >
              Items: {totalItems}
            </Typography>
            {itemsCount > 0 && (
              <MuiButton
                variant="text"
                onClick={onClearCart}
                disabled={isClearingCart}
                startIcon={<DeleteOutline sx={{ fontSize: '1rem !important' }} />}
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  },
                  '&:disabled': {
                    color: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                Vaciar carrito
              </MuiButton>
            )}
          </Box>
        </Box>
      </Box>

      {/* Banner de envío gratuito */}
      {!isLoading && !isError && itemsCount > 0 && !isFreeShippingEligible && remainingForFreeShipping !== undefined && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: 2,
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '12px',
            color: '#fbbf24',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <FaShoppingCart size={20} />
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            ¡Agrega productos por {formatPrice(remainingForFreeShipping)} más para envío GRATIS!
          </Typography>
        </Box>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            width: '100%',
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: '#29C480',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 4,
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}
          >
            <ErrorIcon sx={{ fontSize: 32, color: '#ef4444' }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            Error al cargar el carrito
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.875rem',
              textAlign: 'center',
              maxWidth: '400px',
              mb: 3,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            {error instanceof Error
              ? error.message.includes('401') || error.message.includes('Invalid or expired token')
                ? 'Tu sesión ha expirado. Por favor, cierra sesión y vuelve a iniciar sesión para continuar.'
                : error.message.includes('403') || error.message.includes('Forbidden')
                ? 'No tienes permisos para ver el carrito. Contacta al administrador.'
                : error.message
              : 'Ocurrió un error desconocido. Por favor, intenta nuevamente.'}
          </Typography>
          <Button
            variant="primary"
            onClick={onRetry}
            sx={{
              minWidth: '140px',
            }}
          >
            Reintentar
          </Button>
        </Box>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <Box sx={{ width: '100%', maxWidth: '100%', px: { xs: 0, md: 0 } }}>
          {itemsCount === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 4,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(41, 196, 128, 0.1)',
                  border: '2px solid rgba(41, 196, 128, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <ShoppingCart sx={{ fontSize: 40, color: '#29C480' }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                Tu carrito está vacío
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  maxWidth: '400px',
                  mb: 3,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                Agrega productos para comenzar a comprar
              </Typography>
              <Button
                variant="primary"
                onClick={onContinueShopping}
                sx={{
                  minWidth: '200px',
                }}
              >
                Continuar Comprando
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 4,
                width: '100%',
                alignItems: { xs: 'stretch', lg: 'stretch' },
                maxHeight: { xs: 'none', lg: '450px' },
                overflow: { xs: 'visible', lg: 'visible' },
                minWidth: 0,
                boxSizing: 'border-box',
              }}
            >
              {/* Lista de productos */}
              <Box
                sx={{
                  flex: { xs: '1 1 100%', lg: '0 0 calc(40% - 16px)' },
                  maxHeight: { xs: 'none', lg: '100%' },
                  overflowY: { xs: 'visible', lg: 'auto' },
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}
              >
                <SellersGroupProducts />
              </Box>

              {/* Resumen del carrito */}
              <Box
                sx={{
                  flex: { xs: '1 1 100%', lg: '0 0 calc(60% - 16px)' },
                  maxHeight: { xs: 'none', lg: '100%' },
                  overflowY: { xs: 'visible', lg: 'auto' },
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}
              >
                <SellersGroup />
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CartSection;

