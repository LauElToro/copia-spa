'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { UalaPaymentService } from '@/presentation/@shared/services/uala-payment.service';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const source = searchParams.get('source');
  const isPlanPurchase = source === 'plan_purchase';
  const queryClient = useQueryClient();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        toast.error('No se encontró información del pago', { duration: 5000 });
        router.push(isPlanPurchase ? '/admin/panel/configuration-subscription' : '/register?type=seller');
        return;
      }

      try {
        toast.info('Verificando estado del pago...', { duration: 3000 });

        const status = await UalaPaymentService.checkPaymentStatus(orderId);

        if (status.data.status === 'approved') {
          setVerified(true);
          setLoading(false);

          toast.success(
            isPlanPurchase ? '¡Plan activado exitosamente!' : '¡Pago confirmado exitosamente!',
            { duration: 5000 }
          );

          if (isPlanPurchase) {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            setTimeout(() => {
              router.push('/admin/panel/configuration-subscription');
            }, 2000);
          } else {
            setTimeout(() => {
              router.push('/login?message=registration_payment_success');
            }, 3000);
          }
        } else if (status.data.status === 'pending') {
          toast.warning('El pago está pendiente de confirmación', { duration: 5000 });
          const completeUrl = isPlanPurchase
            ? '/payment/complete?source=plan_purchase&orderId=' + orderId
            : '/payment/complete';
          setTimeout(() => {
            router.push(completeUrl);
          }, 3000);
        } else {
          toast.error('El pago no fue aprobado', { duration: 5000 });
          router.push('/payment/failure?orderId=' + orderId + (isPlanPurchase ? '&source=plan_purchase' : ''));
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast.error('Error al verificar el estado del pago', { duration: 5000 });
        setTimeout(() => {
          router.push('/payment/failure?orderId=' + orderId + (isPlanPurchase ? '&source=plan_purchase' : ''));
        }, 2000);
      }
    };

    verifyPayment();
  }, [orderId, source, isPlanPurchase, router, toast, queryClient]);

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
              border: '1px solid rgba(52, 211, 153, 0.2)'
            }}
          >
            {loading ? (
              <>
                <CircularProgress
                  size={60}
                  sx={{ color: '#34d399', mb: 3 }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Verificando pago...
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.125rem'
                  }}
                >
                  Por favor espera mientras confirmamos tu pago
                </Typography>
              </>
            ) : verified ? (
              <>
                <CheckCircle
                  sx={{
                    fontSize: 80,
                    color: '#34d399',
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
                  ¡Pago exitoso!
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.125rem',
                    mb: 3
                  }}
                >
                  {isPlanPurchase
                    ? 'Tu plan ha sido activado correctamente. Ya puedes disfrutar de todos los beneficios.'
                    : 'Tu cuenta ha sido activada correctamente'}
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.875rem'
                  }}
                >
                  {isPlanPurchase ? 'Redirigiendo a tu suscripción...' : 'Redirigiendo al inicio de sesión...'}
                </Typography>
              </>
            ) : null}
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}

