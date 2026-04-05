'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { UalaPaymentService } from '@/presentation/@shared/services/uala-payment.service';
import { useAuth } from '@/presentation/@shared/hooks/use-auth';

export default function CompletePaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const source = searchParams.get('source');
  const isPlanPurchase = source === 'plan_purchase';
  const { getCurrentUser } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const checkPayment = async () => {
      const orderId = orderIdParam || getCurrentUser()?.id;
      if (!orderId) {
        toast.warning('Debes iniciar sesión para continuar', { duration: 5000 });
        router.push('/login');
        return;
      }

      try {
        toast.info('Verificando estado del pago...', { duration: 3000 });

        const payments = await UalaPaymentService.checkPaymentStatus(orderId);

        if (payments.data.status === 'approved') {
          toast.success('Tu pago ya fue confirmado', { duration: 5000 });
          if (isPlanPurchase) {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            setTimeout(() => {
              router.push('/admin/panel/configuration-subscription');
            }, 1500);
          } else {
            setTimeout(() => {
              router.push('/admin/panel/home');
            }, 1500);
          }
          return;
        }

        if (payments.data.status === 'pending') {
          toast.warning('Tu pago está pendiente de confirmación', { duration: 5000 });
        }

        setPaymentData(payments.data);
        setLoading(false);
      } catch (error: unknown) {
        console.error('Error checking payment:', error);
        toast.error('Error al verificar el estado del pago', { duration: 5000 });
        setLoading(false);
      }
    };

    checkPayment();
  }, [orderIdParam, source, isPlanPurchase, router, toast, queryClient, getCurrentUser]);

  const handleRetryPayment = () => {
    if (paymentData?.checkoutUrl) {
      window.location.href = paymentData.checkoutUrl as string;
    } else {
      router.push(isPlanPurchase ? '/admin/panel/checkout-plan' : '/register?type=seller');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000'
          }}
        >
          <CircularProgress sx={{ color: '#34d399' }} />
        </Box>
      </MainLayout>
    );
  }

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
              border: '1px solid rgba(251, 191, 36, 0.2)'
            }}
          >
            <Warning
              sx={{
                fontSize: 80,
                color: '#fbbf24',
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
              Pago pendiente
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '1.125rem',
                mb: 4
              }}
            >
              Tu cuenta está pendiente de pago. Para acceder a todas las funcionalidades, 
              por favor completa el pago de tu plan.
            </Typography>
            
            <Button
              variant="contained"
              onClick={handleRetryPayment}
              sx={{
                backgroundColor: '#34d399',
                color: '#000000',
                px: 6,
                py: 1.5,
                fontSize: '1.125rem',
                fontWeight: 600,
                textTransform: 'none',
                mb: 2,
                '&:hover': {
                  backgroundColor: '#10b981'
                }
              }}
            >
              Completar pago ahora
            </Button>

            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.875rem',
                mt: 3
              }}
            >
              Mientras tanto, solo tienes acceso limitado a la plataforma
            </Typography>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}

