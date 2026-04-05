"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, CircularProgress, TextField } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { Input } from "@/presentation/@shared/components/ui/atoms/input";
import { LoadingSpinner } from "@/presentation/@shared/components/ui/atoms/loading-spinner";
import { Stack } from "@/presentation/@shared/components/ui/molecules/stack";
import { Breadcrumb } from "@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb";
import { StarRating } from "@/presentation/@shared/components/ui/atoms/star-rating/star-rating";
import { useTransactions } from "@/presentation/@shared/hooks/use-transactions";
import { usePaymentOrders } from "@/presentation/@shared/hooks/use-payment-orders";
import { axiosHelper } from "@/presentation/@shared/helpers/axios-helper";
import { notificationService } from '@/presentation/@shared/providers/toast-provider';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

interface TransactionReviewPageProps {
  transactionId: string;
}

interface ProductReview {
  productId: string;
  productName: string;
  rating: number;
  title: string;
  comment: string;
}

export default function TransactionReviewPage({ transactionId }: TransactionReviewPageProps) {
  const { t } = useLanguage();
  const router = useRouter();

  // Leer el perfil directamente del localStorage
  const userStr = globalThis.window?.localStorage?.getItem("user");
  const profile = userStr ? JSON.parse(userStr) : null;

  const accountId = profile?.id;

  // Obtener la transacción
  const { getTransactionById } = useTransactions(accountId);
  const transactionQuery = getTransactionById(transactionId);
  const { data: transaction, isLoading: isLoadingTransaction, isError: isErrorTransaction } = transactionQuery;

  // Obtener los detalles de la transacción desde ms-payments (para obtener productos)
  const { getPaymentOrderByTransactionId } = usePaymentOrders(accountId);
  const paymentOrderQuery = getPaymentOrderByTransactionId(transaction?.transactionId || '', accountId);
  const { 
    data: paymentOrderTransaction, 
    isLoading: isLoadingPaymentOrder, 
    isError: isErrorPaymentOrder,
    error: paymentOrderError 
  } = paymentOrderQuery;

  // Debug logs
  React.useEffect(() => {
    if (transaction) {
      console.log('[TransactionReviewPage] Transaction loaded:', {
        id: transaction.id,
        transactionId: transaction.transactionId,
        accountId});
    }
  }, [transaction, accountId]);

  React.useEffect(() => {
    if (paymentOrderTransaction) {
      console.log('[TransactionReviewPage] Payment order transaction loaded:', {
        transactionId: paymentOrderTransaction.transactionId,
        itemsCount: paymentOrderTransaction.items?.length || 0});
    } else if (!isLoadingPaymentOrder && transaction?.transactionId) {
      console.warn('[TransactionReviewPage] Payment order transaction not found for transactionId:', transaction.transactionId);
    }
  }, [paymentOrderTransaction, isLoadingPaymentOrder, transaction?.transactionId]);

  // Estado para las reviews de cada producto
  const [productReviews, setProductReviews] = useState<Record<string, ProductReview>>({});
  const [existingReviews, setExistingReviews] = useState<Record<string, { id: string; rating: number; title: string; comment: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<Record<string, number>>({});

  // Cargar reviews existentes para cada producto (solo del usuario actual)
  React.useEffect(() => {
    const loadExistingReviews = async () => {
      if (!paymentOrderTransaction?.items || !accountId) {
        console.log('[TransactionReviewPage] Skipping loadExistingReviews:', {
          hasItems: !!paymentOrderTransaction?.items,
          hasAccountId: !!accountId});
        return;
      }

      setIsLoadingReviews(true);
      try {
        const reviewsMap: Record<string, { id: string; rating: number; title: string; comment: string }> = {};
        
        await Promise.all(
          paymentOrderTransaction.items.map(async (item) => {
            try {
              // Filtrar por accountId del usuario actual para evitar mostrar reviews del service-spa
              const response = await axiosHelper.products.engagements.list(item.productId, {
                eventType: 'REVIEW',
                accountId: accountId, // Filtrar solo reviews del usuario actual
              });
              
              console.log(`[TransactionReviewPage] Response for product ${item.productId}:`, {
                productId: item.productId,
                accountId,
                responseData: response.data});
              
              // La respuesta del interceptor tiene estructura: { success: true, data: {...}, ... }
              // Y dentro de data está: { data: [...], pagination: {...}, filters: {...} }
              const apiResponse = response.data as {
                success?: boolean;
                data?: {
                  data?: Array<{ id: string; accountId?: string; rating?: number; title?: string; comment?: string }>;
                  pagination?: unknown;
                  filters?: unknown;
                };
                message?: string;
              };
              
              // Extraer el array de engagements
              // Primero verificar si response.data es directamente un array (caso sin interceptor)
              let engagements: Array<{ id: string; accountId?: string; rating?: number; title?: string; comment?: string }> = [];
              
              if (Array.isArray(apiResponse)) {
                // Si la respuesta es directamente un array
                engagements = apiResponse;
              } else if (apiResponse?.data) {
                // Si tiene estructura { data: { data: [...], ... } }
                if (Array.isArray(apiResponse.data)) {
                  engagements = apiResponse.data;
                } else if (apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
                  engagements = apiResponse.data.data;
                }
              }
              
              console.log(`[TransactionReviewPage] Engagements for product ${item.productId}:`, {
                count: engagements.length,
                engagements});
              
              // El backend ya filtra por accountId, así que debería haber máximo una review
              const userReview = engagements.find(
                (eng: { accountId?: string }) => eng.accountId === accountId
              ) || engagements[0]; // Si el backend filtra correctamente, el primero debería ser del usuario

              if (userReview) {
                console.log(`[TransactionReviewPage] Found review for product ${item.productId}:`, userReview);
                reviewsMap[item.productId] = {
                  id: userReview.id,
                  rating: userReview.rating || 0,
                  title: userReview.title || '',
                  comment: userReview.comment || ''};
              } else {
                console.log(`[TransactionReviewPage] No review found for product ${item.productId}`);
              }
            } catch (error) {
              console.error(`[TransactionReviewPage] Error loading review for product ${item.productId}:`, error);
            }
          })
        );

        console.log('[TransactionReviewPage] Reviews map:', reviewsMap);
        setExistingReviews(reviewsMap);
        
        // Inicializar productReviews con las reviews existentes o valores vacíos
        const initialReviews: Record<string, ProductReview> = {};
        paymentOrderTransaction.items.forEach((item) => {
          const existing = reviewsMap[item.productId];
          initialReviews[item.productId] = {
            productId: item.productId,
            productName: item.name,
            rating: existing?.rating || 0,
            title: existing?.title || '',
            comment: existing?.comment || ''};
        });
        console.log('[TransactionReviewPage] Initial reviews:', initialReviews);
        setProductReviews(initialReviews);
      } catch (error) {
        console.error('[TransactionReviewPage] Error loading existing reviews:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadExistingReviews();
  }, [paymentOrderTransaction?.items, accountId]);

  const updateProductReview = (productId: string, field: keyof ProductReview, value: string | number) => {
    setProductReviews((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value}}));
  };

  const handleSubmit = async () => {
    if (!paymentOrderTransaction?.items || paymentOrderTransaction.items.length === 0) {
      notificationService.error('No se encontraron productos para opinar');
      return;
    }

    // Verificar si todas las reviews ya existen
    const allReviewsExist = paymentOrderTransaction.items.every(
      (item) => existingReviews[item.productId]
    );

    if (allReviewsExist) {
      notificationService.info('Todas las opiniones ya han sido guardadas. No hay cambios para enviar.');
      return;
    }

    // Validar que todos los productos sin review tengan rating
    const productsWithoutRating = paymentOrderTransaction.items.filter(
      (item) => !existingReviews[item.productId] && (!productReviews[item.productId] || productReviews[item.productId].rating === 0)
    );

    if (productsWithoutRating.length > 0) {
      notificationService.error('Por favor, califica todos los productos con estrellas');
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear reviews solo para productos que no tienen review existente
      const reviewPromises = paymentOrderTransaction.items
        .filter((item) => !existingReviews[item.productId]) // Solo productos sin review
        .map(async (item) => {
          const review = productReviews[item.productId];
          if (!review || review.rating === 0) {
            return;
          }

          const payload = {
            eventType: 'REVIEW' as const,
            rating: review.rating,
            title: review.title || undefined,
            comment: review.comment || undefined,
            // accountId se extrae automáticamente del JWT en el backend
            metadata: {
              transactionId: transaction?.transactionId,
              source: 'transaction-review'}};

          // Crear nueva review (solo si no existe)
          await axiosHelper.products.engagements.create(item.productId, payload);
        });

      await Promise.all(reviewPromises);

      notificationService.success('¡Gracias por tu opinión! Tus valoraciones han sido guardadas.');
      router.push('/admin/panel/transactions');
    } catch (error) {
      console.error('Error submitting reviews:', error);
      
      // Extraer mensaje detallado del servidor
      let errorMessage = 'Error al guardar las opiniones. Por favor, intenta nuevamente.';
      
      const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string };
      
      if (axiosError?.response?.data && typeof axiosError.response.data === 'object') {
        const errorData = axiosError.response.data as { detail?: string; message?: string; error?: string };
        // Priorizar 'message' (formato del servicio), luego 'detail' (RFC 7807), luego 'error'
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (axiosError?.message) {
        errorMessage = axiosError.message;
      }
      
      notificationService.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingTransaction || (isLoadingPaymentOrder && !!transaction?.transactionId);

  if (isLoading) {
    return (
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          width: "100%",
          backgroundColor: '#000000',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
          <Box sx={{ px: { xs: 3, md: 0 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <LoadingSpinner color="success" size="large" />
          </Box>
        </Container>
      </Box>
    );
  }

  // Función helper para renderizar estados de error con card y breadcrumb
  const renderErrorState = (message: string, severity: 'error' | 'warning' = 'error') => (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: "100%",
        backgroundColor: '#000000',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: t.admin?.transactions || 'Transacciones', href: '/admin/panel/transactions' },
                { label: 'Opinión' }
              ]}
            />
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
                gap: 2,
              }}
            >
              {/* Título */}
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 700,
                  color: '#34d399',
                  mb: 1,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                Opinión sobre Productos
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: severity === 'warning' ? 'rgba(251, 146, 60, 0.1)' : severity === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(41, 196, 128, 0.1)',
                  border: severity === 'warning' ? '1px solid rgba(251, 146, 60, 0.2)' : severity === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(41, 196, 128, 0.2)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: severity === 'warning' ? 'rgba(251, 146, 60, 0.2)' : severity === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(41, 196, 128, 0.2)',
                    flexShrink: 0,
                  }}
                >
                  {severity === 'warning' ? (
                    <Box
                      component="svg"
                      sx={{
                        width: '20px',
                        height: '20px',
                        color: '#fb923c',
                      }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </Box>
                  ) : severity === 'error' ? (
                    <Box
                      component="svg"
                      sx={{
                        width: '20px',
                        height: '20px',
                        color: '#ef4444',
                      }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </Box>
                  ) : (
                    <CheckCircle
                      sx={{
                        color: '#29C480',
                        fontSize: '20px',
                      }}
                    />
                  )}
                </Box>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    flex: 1,
                  }}
                >
                  {message}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="secondary"
                  onClick={() => router.push('/admin/panel/transactions')}
                  sx={{
                    px: 5,
                    py: 1.5,
                    borderWidth: '2px !important',
                    borderColor: '#ef4444 !important',
                    borderStyle: 'solid !important',
                    color: '#ef4444 !important',
                    backgroundColor: 'transparent !important',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: 'none !important',
                    '& fieldset': {
                      borderWidth: '2px !important',
                      borderColor: '#ef4444 !important',
                      borderStyle: 'solid !important',
                    },
                    '&:hover': {
                      borderWidth: '2px !important',
                      borderColor: '#ef4444 !important',
                      borderStyle: 'solid !important',
                      backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
                      boxShadow: 'none !important',
                      '& fieldset': {
                        borderWidth: '2px !important',
                        borderColor: '#ef4444 !important',
                        borderStyle: 'solid !important',
                      },
                    },
                  }}
                >
                  Volver
                </Button>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );

  // Verificar errores
  if (isErrorTransaction) {
    return renderErrorState('Error al cargar la transacción. Por favor, intenta nuevamente.', 'error');
  }

  if (!transaction) {
    return renderErrorState('No se encontró la transacción solicitada.', 'warning');
  }

  // Verificar si hay error al cargar payment order o si no se encontraron productos
  if (isErrorPaymentOrder) {
    return renderErrorState(
      `Error al cargar los detalles de la transacción: ${paymentOrderError instanceof Error ? paymentOrderError.message : 'Error desconocido'}`,
      'error'
    );
  }

  if (!paymentOrderTransaction) {
    return renderErrorState(
      'No se encontraron los detalles de pago para esta transacción. Es posible que la transacción aún no esté completamente procesada.',
      'warning'
    );
  }

  if (!paymentOrderTransaction.items || paymentOrderTransaction.items.length === 0) {
    return renderErrorState('No se encontraron productos asociados a esta transacción.', 'warning');
  }

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: "100%",
        backgroundColor: '#000000',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: t.admin?.transactions || 'Transacciones', href: '/admin/panel/transactions' },
                { label: 'Detalle', href: `/admin/panel/transactions/${transactionId}` },
                { label: 'Opinión' }
              ]}
            />

            {/* Card principal única */}
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
                gap: 2,
              }}
            >
              {/* Título */}
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 700,
                  color: '#34d399',
                  mb: 1,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                Opinión sobre Productos
              </Typography>

              {/* Productos para opinar */}
              {isLoadingReviews ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <LoadingSpinner color="success" size="large" />
                </Box>
              ) : (
                <Stack spacing={3}>
                  {paymentOrderTransaction.items.map((item, index) => {
                  const review = productReviews[item.productId] || {
                    productId: item.productId,
                    productName: item.name,
                    rating: 0,
                    title: '',
                    comment: ''};
                  const hasExistingReview = !!existingReviews[item.productId];

                  return (
                    <Box
                      key={item.productId}
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        paddingBottom: index < paymentOrderTransaction.items.length - 1 ? 3 : 0,
                        borderBottom: index < paymentOrderTransaction.items.length - 1 ? '1px solid rgba(41, 196, 128, 0.2)' : 'none',
                      }}
                    >
                      <Stack spacing={2}>
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontSize: { xs: '1rem', md: '1.25rem' },
                              fontWeight: 700,
                              color: '#ffffff',
                              mb: 1,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.875rem',
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            Cantidad: {item.quantity} • Precio: {item.unitPrice} {item.currency}
                          </Typography>
                        </Box>

                        {hasExistingReview && (
                          <>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                padding: '16px 20px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(41, 196, 128, 0.1)',
                                border: '1px solid rgba(41, 196, 128, 0.2)',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(41, 196, 128, 0.2)',
                                  flexShrink: 0,
                                }}
                              >
                                <CheckCircle
                                  sx={{
                                    color: '#29C480',
                                    fontSize: '20px',
                                  }}
                                />
                              </Box>
                              <Typography
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.9)',
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                  flex: 1,
                                }}
                              >
                                Ya has dejado tu opinión para este producto. La opinión está guardada y no se puede modificar.
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#ffffff',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  mb: 1.5,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                Tu calificación:
                              </Typography>
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  padding: '8px 12px',
                                  borderRadius: '12px',
                                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                  border: '1px solid rgba(251, 191, 36, 0.3)',
                                  boxShadow: '0 0 8px rgba(251, 191, 36, 0.2)',
                                }}
                              >
                                <StarRating
                                  rating={existingReviews[item.productId]?.rating || 0}
                                  size={16}
                                  align="left"
                                  enableHover={false}
                                  activeColor="#FBBF24"
                                  inactiveColor="#6B7280"
                                  showShadow={true}
                                />
                                {existingReviews[item.productId]?.rating && (
                                  <Typography
                                    sx={{
                                      color: 'rgba(255, 255, 255, 0.5)',
                                      fontSize: '0.8125rem',
                                      ml: 0.5,
                                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                  >
                                    ({existingReviews[item.productId].rating} de 5)
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            {existingReviews[item.productId] && (
                              <Stack spacing={2}>
                                {existingReviews[item.productId].title && (
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        mb: 0.5,
                                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                      }}
                                    >
                                      Título:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: '#ffffff',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                      }}
                                    >
                                      {existingReviews[item.productId].title}
                                    </Typography>
                                  </Box>
                                )}
                                {existingReviews[item.productId].comment && (
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        mb: 0.5,
                                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                      }}
                                    >
                                      Comentario:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: '#ffffff',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                      }}
                                    >
                                      {existingReviews[item.productId].comment}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            )}
                          </>
                        )}

                        {!hasExistingReview && (
                          <>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#ffffff',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  mb: 2,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                Calificación con estrellas *
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                                onMouseLeave={() => setHoveredRating(prev => {
                                  const newState = { ...prev };
                                  delete newState[item.productId];
                                  return newState;
                                })}
                              >
                                {Array.from({ length: 5 }, (_, index) => {
                                  const starValue = index + 1;
                                  const currentRating = hoveredRating[item.productId] ?? review.rating;
                                  const isFilled = currentRating >= starValue;
                                  
                                  return (
                                    <Box
                                      key={index}
                                      onClick={() => !isSubmitting && updateProductReview(item.productId, 'rating', starValue)}
                                      onMouseEnter={() => !isSubmitting && setHoveredRating(prev => ({
                                        ...prev,
                                        [item.productId]: starValue
                                      }))}
                                      sx={{
                                        cursor: isSubmitting ? 'default' : 'pointer',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': {
                                          transform: isSubmitting ? 'none' : 'scale(1.1)'
                                        }
                                      }}
                                    >
                                      <svg
                                        width="40"
                                        height="40"
                                        viewBox="0 0 24 24"
                                        fill={isFilled ? '#FFD700' : 'none'}
                                        stroke={isFilled ? '#FFD700' : '#9CA3AF'}
                                        strokeWidth={isFilled ? 0 : 1.5}
                                        style={{
                                          filter: isFilled ? 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4))' : 'none'
                                        }}
                                      >
                                        <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.78 1.401 8.169L12 18.897l-7.335 3.862 1.401-8.169-5.934-5.78 8.2-1.192z"/>
                                      </svg>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Box>

                            <Box>
                              <Typography
                                component="label"
                                htmlFor={`title-${item.productId}`}
                                sx={{
                                  display: 'block',
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  color: '#ffffff',
                                  mb: 1,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                Título de tu opinión (opcional)
                              </Typography>
                              <Input
                                id={`title-${item.productId}`}
                                type="text"
                                placeholder="Ej: Excelente producto"
                                value={review.title}
                                onChange={(e) => updateProductReview(item.productId, 'title', e.target.value)}
                                disabled={isSubmitting}
                                state="modern"
                                fullWidth
                              />
                            </Box>

                            <Box>
                              <Typography
                                component="label"
                                htmlFor={`comment-${item.productId}`}
                                sx={{
                                  display: 'block',
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  color: '#ffffff',
                                  mb: 1,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                Comentario (opcional)
                              </Typography>
                              <TextField
                                id={`comment-${item.productId}`}
                                name={`comment-${item.productId}`}
                                value={review.comment}
                                onChange={(e) => updateProductReview(item.productId, 'comment', e.target.value)}
                                placeholder="Comparte tu experiencia con este producto..."
                                disabled={isSubmitting}
                                multiline
                                rows={4}
                                fullWidth
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#1f2937',
                                    color: '#ffffff',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    '& fieldset': {
                                      borderColor: '#374151',
                                    },
                                    '&:hover fieldset': {
                                      borderColor: '#22c55e',
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#22c55e',
                                      boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
                                    },
                                    '& .MuiInputBase-input': {
                                      fontSize: '0.875rem',
                                      padding: '16px',
                                      '&::placeholder': {
                                        color: '#9ca3af',
                                        opacity: 0.7,
                                        fontSize: '0.875rem',
                                      },
                                    },
                                    '& textarea': {
                                      color: '#ffffff',
                                      fontSize: '0.875rem',
                                    },
                                  },
                                }}
                              />
                            </Box>
                          </>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
                </Stack>
              )}

              {/* Botones de acción - Solo se muestran si hay productos sin opinión */}
              {paymentOrderTransaction.items.some(item => !existingReviews[item.productId]) && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: '1px solid rgba(41, 196, 128, 0.2)' }}>
                  <Button
                    variant="secondary"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    sx={{
                      px: 5,
                      py: 1.5,
                      borderWidth: '2px !important',
                      borderColor: '#ef4444 !important',
                      borderStyle: 'solid !important',
                      color: '#ef4444 !important',
                      backgroundColor: 'transparent !important',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: 'none !important',
                      '& fieldset': {
                        borderWidth: '2px !important',
                        borderColor: '#ef4444 !important',
                        borderStyle: 'solid !important',
                      },
                      '&:hover': {
                        borderWidth: '2px !important',
                        borderColor: '#ef4444 !important',
                        borderStyle: 'solid !important',
                        backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
                        boxShadow: 'none !important',
                        '& fieldset': {
                          borderWidth: '2px !important',
                          borderColor: '#ef4444 !important',
                          borderStyle: 'solid !important',
                        },
                      },
                      '&:disabled': {
                        borderColor: 'rgba(255, 255, 255, 0.3) !important',
                        color: 'rgba(255, 255, 255, 0.3) !important',
                        '& fieldset': {
                          borderWidth: '2px !important',
                          borderColor: 'rgba(255, 255, 255, 0.3) !important',
                          borderStyle: 'solid !important',
                        },
                      },
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(existingReviews).length === paymentOrderTransaction.items.length}
                    sx={{
                      px: 5,
                      py: 1.5,
                      backgroundColor: (isSubmitting || Object.keys(existingReviews).length === paymentOrderTransaction.items.length) 
                        ? '#374151 !important' 
                        : '#22c55e !important',
                      color: (isSubmitting || Object.keys(existingReviews).length === paymentOrderTransaction.items.length)
                        ? 'rgba(255, 255, 255, 0.5) !important'
                        : '#000000 !important',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: (isSubmitting || Object.keys(existingReviews).length === paymentOrderTransaction.items.length)
                          ? '#374151 !important'
                          : '#16a34a !important',
                        boxShadow: 'none',
                      },
                      '&:disabled': {
                        backgroundColor: '#374151 !important',
                        color: 'rgba(255, 255, 255, 0.5) !important',
                      },
                    }}
                  >
                    {isSubmitting && (
                      <CircularProgress size={20} sx={{ mr: 1, color: '#000000' }} />
                    )}
                    {isSubmitting ? 'Guardando...' : 'Enviar Opiniones'}
                  </Button>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
