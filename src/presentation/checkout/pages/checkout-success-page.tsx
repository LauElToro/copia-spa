'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { CheckCircle as CheckIcon, Storefront as ShopIcon, Receipt as OrdersIcon } from '@mui/icons-material';

const CheckoutSuccessPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    // Solo establecer si es un ID de orden válido
    if (orderIdParam && orderIdParam !== 'undefined' && orderIdParam.trim() !== '' && orderIdParam !== 'null') {
      setOrderId(orderIdParam);
    }
  }, [searchParams]);

  const handleContinueShopping = () => {
    router.push('/stores');
  };

  const handleViewOrders = () => {
    router.push('/admin/panel/transactions');
  };

  return (
    <MainLayout>
      <Box
        sx={{
          minHeight: '80vh',
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(41, 196, 128, 0.15) 0%, transparent 50%),
            #000000
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 6, md: 10 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 4, md: 6 },
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(0, 0, 0, 0.7))',
              border: '1px solid rgba(41, 196, 128, 0.2)',
              borderRadius: '24px',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Icono de éxito animado */}
            <Box
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 4,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(41, 196, 128, 0.2), rgba(34, 197, 94, 0.1))',
                border: '3px solid #29C480',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    boxShadow: '0 0 0 0 rgba(41, 196, 128, 0.4)',
                  },
                  '50%': {
                    boxShadow: '0 0 0 15px rgba(41, 196, 128, 0)',
                  },
                },
              }}
            >
              <CheckIcon sx={{ fontSize: 50, color: '#29C480' }} />
            </Box>

            {/* Mensaje de éxito */}
            <Typography
              variant="h4"
              sx={{
                color: '#29C480',
                fontWeight: 700,
                mb: 1.5,
                fontSize: { xs: '1.75rem', md: '2rem' },
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              ¡Compra Exitosa!
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '1rem', md: '1.125rem' },
                mb: 4,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Tu orden ha sido procesada correctamente
            </Typography>

            {/* Número de orden */}
            {orderId ? (
              <Box
                sx={{
                  mb: 4,
                  p: 3,
                  background: 'rgba(41, 196, 128, 0.08)',
                  border: '1px solid rgba(41, 196, 128, 0.2)',
                  borderRadius: '16px',
                }}
              >
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.875rem',
                    mb: 1,
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  Número de Orden
                </Typography>
                <Typography
                  sx={{
                    color: '#29C480',
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    letterSpacing: '0.5px',
                    wordBreak: 'break-all',
                  }}
                >
                  {orderId}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  mb: 4,
                  p: 3,
                  background: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: '16px',
                }}
              >
                <Typography
                  sx={{
                    color: '#fbbf24',
                    fontSize: '0.9rem',
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  ⏳ Tu orden está siendo procesada. Recibirás el número de orden por correo electrónico.
                </Typography>
              </Box>
            )}

            {/* Mensaje informativo */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.875rem',
                mb: 5,
                lineHeight: 1.6,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Recibirás un correo electrónico con los detalles de tu compra y el estado de tu envío al momento de ser procesada.
            </Typography>

            {/* Botones de acción */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                startIcon={<ShopIcon />}
                onClick={handleContinueShopping}
                sx={{
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #29C480 0%, #22c55e 100%)',
                  borderRadius: '12px',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  boxShadow: '0 4px 14px rgba(41, 196, 128, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #34d399 0%, #29C480 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(41, 196, 128, 0.4)',
                  },
                }}
              >
                Seguir comprando
              </Button>

              <Button
                startIcon={<OrdersIcon />}
                onClick={handleViewOrders}
                sx={{
                  px: 4,
                  py: 1.5,
                  border: '2px solid rgba(41, 196, 128, 0.5)',
                  borderRadius: '12px',
                  color: '#29C480',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#29C480',
                    background: 'rgba(41, 196, 128, 0.1)',
                  },
                }}
              >
                Ver mis compras
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default CheckoutSuccessPage;
