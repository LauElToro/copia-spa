'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Person as PersonIcon, Storefront as StoreIcon, LocalShipping as ShippingIcon, Payment as PaymentIcon } from '@mui/icons-material';
import { SafeImage } from '../../atoms/safe-image';
import { useCart } from '@/presentation/@shared/hooks/use-cart';
import { useCheckoutStore } from '@/presentation/@shared/stores/checkout-store';
import { useUserProfile } from '@/presentation/@shared/hooks/use-user-profile';
import { formatPrice } from '@/presentation/@shared/utils/format-price';

const SummaryInfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
    <Typography
      sx={{
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.85rem',
        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        color: '#ffffff',
        fontSize: '0.85rem',
        fontWeight: 600,
        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {value}
    </Typography>
  </Box>
);

export const SummarySellerGroupProducts = () => {
  const { sellerGroups, total: grandTotal } = useCart();
  const { completedStores } = useCheckoutStore();
  const { userProfile } = useUserProfile();

  return (
    <Box
      sx={{
        maxHeight: { xs: 'auto', lg: '60vh' },
        overflowY: 'auto',
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
        },
      }}
    >
      {/* Información del comprador */}
      <Box
        sx={{
          p: 2.5,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
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
            <PersonIcon sx={{ fontSize: 18, color: '#29C480' }} />
          </Box>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 600,
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Información del Comprador
          </Typography>
        </Box>
        <SummaryInfoRow label="Nombre:" value={userProfile?.name || 'Cargando...'} />
        <SummaryInfoRow label="E-mail:" value={userProfile?.email || 'No disponible'} />
      </Box>

      {/* Título resumen */}
      <Typography
        sx={{
          color: '#ffffff',
          fontSize: '1rem',
          fontWeight: 600,
          mb: 2,
          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        Resumen de tu compra
      </Typography>

      {/* Resumen por tienda */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {sellerGroups.map((group, groupIndex) => {
          const storeCheckoutData = completedStores.find((s) => s.storeId === group.storeId);

          return (
            <Box
              key={group.storeId}
              sx={{
                p: 2.5,
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
                border: '1px solid rgba(41, 196, 128, 0.15)',
                borderRadius: '12px',
              }}
            >
              {/* Nombre de la tienda */}
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
                    color: '#29C480',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  Tienda {groupIndex + 1}: {group.storeName}
                </Typography>
              </Box>

              {/* Productos */}
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {group.items.map((item) => (
                  <Box
                    key={`${item.id}-${item.size}-${item.color}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      pb: 1.5,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: 45,
                        height: 45,
                        flexShrink: 0,
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        type="product"
                        fill
                        fallbackIconSize={18}
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.75rem',
                          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        }}
                      >
                        {item.quantity} x {formatPrice(item.price)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        color: '#34d399',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* Detalles de checkout */}
              {storeCheckoutData && (
                <Box sx={{ mb: 2, pt: 1.5, borderTop: '1px solid rgba(41, 196, 128, 0.15)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ShippingIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)' }} />
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                      {storeCheckoutData.shippingMethod || 'Sin método de envío'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)' }} />
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                      {storeCheckoutData.paymentMethod || 'Sin método de pago'}
                      {storeCheckoutData.cryptoNetwork && ` (${storeCheckoutData.cryptoNetwork})`}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Total de la tienda */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 1.5,
                  borderTop: '2px solid rgba(41, 196, 128, 0.2)',
                }}
              >
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  Total tienda:
                </Typography>
                <Typography
                  sx={{
                    color: '#29C480',
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  {formatPrice(group.total)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>

      {/* Total general */}
      <Box
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #29C480 0%, #22c55e 100%)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            color: '#0f172a',
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          TOTAL A PAGAR:
        </Typography>
        <Typography
          sx={{
            color: '#0f172a',
            fontSize: '1.25rem',
            fontWeight: 800,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {formatPrice(grandTotal)}
        </Typography>
      </Box>
    </Box>
  );
};
