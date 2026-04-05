'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Typography, Button } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';

export default function PaymentFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const source = searchParams.get('source');
  const isPlanPurchase = source === 'plan_purchase';
  const toast = useToast();

  useEffect(() => {
    toast.error('El pago no pudo ser completado', { duration: 5000 });
  }, [toast]);

  return (
    <MainLayout>
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          py: 8
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              p: 6,
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 80,
                color: '#ef4444',
                mb: 3
              }}
            />
            <Typography
              variant="h4"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 2
              }}
            >
              Pago no completado
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.125rem',
                mb: 4
              }}
            >
              Tu pago no se pudo completar. Por favor, intenta nuevamente.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() =>
                  router.push(
                    isPlanPurchase
                      ? '/admin/panel/checkout-plan'
                      : '/register?type=seller'
                  )
                }
                sx={{
                  backgroundColor: '#34d399',
                  color: '#000000',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#10b981'
                  }
                }}
              >
                {isPlanPurchase ? 'Volver al checkout' : 'Intentar nuevamente'}
              </Button>

              {isPlanPurchase && (
                <Button
                  variant="outlined"
                  onClick={() => router.push('/admin/panel/configuration-subscription')}
                  sx={{
                    borderColor: 'rgba(52, 211, 153, 0.5)',
                    color: '#34d399',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#34d399',
                      backgroundColor: 'rgba(52, 211, 153, 0.1)'
                    }
                  }}
                >
                  Ver mi suscripción
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={() => router.push('/')}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                Volver al inicio
              </Button>
            </Box>

            {orderId && (
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '0.75rem',
                  mt: 4
                }}
              >
                ID de orden: {orderId}
              </Typography>
            )}
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}

