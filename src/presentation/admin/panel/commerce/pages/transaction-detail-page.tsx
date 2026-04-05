"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Grid, Typography, Stack } from '@mui/material';
import { Divider } from "@/presentation/@shared/components/ui/atoms/divider";
import { LoadingSpinner } from "@/presentation/@shared/components/ui/atoms/loading-spinner";
import { Alert } from "@/presentation/@shared/components/ui/atoms/alert";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { Breadcrumb } from "@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb";
import DataTable, { DataTableColumn } from "@/presentation/@shared/components/ui/atoms/table/table";
import { useTransactions } from "@/presentation/@shared/hooks/use-transactions";
import { usePaymentOrders } from "@/presentation/@shared/hooks/use-payment-orders";
import { axiosHelper } from "@/presentation/@shared/helpers/axios-helper";
import { TransactionStatus, PaymentMethod } from "@/presentation/@shared/types/transaction";
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

interface TransactionDetailPageProps {
  transactionId: string;
}

export default function TransactionDetailPage({ transactionId }: TransactionDetailPageProps) {
  const { t } = useLanguage();
  const router = useRouter();
  
  // Leer el perfil directamente del localStorage
  const userStr = globalThis.window?.localStorage?.getItem("user");
  const profile = userStr ? JSON.parse(userStr) : null;

  const accountId = profile?.id;

  // Obtener la transacción
  const { getTransactionById } = useTransactions(accountId);
  const transactionQuery = getTransactionById(transactionId);
  const { data: transaction, isLoading: isLoadingTransaction, isError: isErrorTransaction, error: transactionError } = transactionQuery;

  // Obtener los detalles de la transacción desde ms-payments (para obtener productos)
  const { getPaymentOrderByTransactionId } = usePaymentOrders(accountId);
  const paymentOrderQuery = getPaymentOrderByTransactionId(transaction?.transactionId || '', accountId);
  const { data: paymentOrderTransaction, isLoading: isLoadingPaymentOrder } = paymentOrderQuery;

  // Estado para verificar si hay opiniones
  const [hasReview, setHasReview] = useState<boolean>(false);
  const [isCheckingReview, setIsCheckingReview] = useState<boolean>(false);

  // Verificar si hay opiniones para los productos de esta transacción
  useEffect(() => {
    const checkReviews = async () => {
      if (!paymentOrderTransaction?.items || !accountId || paymentOrderTransaction.items.length === 0) {
        setHasReview(false);
        return;
      }

      setIsCheckingReview(true);
      try {
        // Verificar si hay al menos una opinión del usuario para alguno de los productos
        const reviewChecks = await Promise.all(
          paymentOrderTransaction.items.map(async (item) => {
            try {
              const response = await axiosHelper.products.engagements.list(item.productId, {
                eventType: 'REVIEW',
                accountId: accountId,
              });

              const apiResponse = response.data as {
                success?: boolean;
                data?: {
                  data?: Array<{ id: string; accountId?: string }>;
                  pagination?: unknown;
                  filters?: unknown;
                };
                message?: string;
              };

              let engagements: Array<{ id: string; accountId?: string }> = [];
              
              if (Array.isArray(apiResponse)) {
                engagements = apiResponse;
              } else if (apiResponse?.data) {
                if (Array.isArray(apiResponse.data)) {
                  engagements = apiResponse.data;
                } else if (apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
                  engagements = apiResponse.data.data;
                }
              }

              return engagements.some(eng => eng.accountId === accountId);
            } catch (error) {
              console.error(`Error checking review for product ${item.productId}:`, error);
              return false;
            }
          })
        );

        // Si hay al menos una opinión, hasReview es true
        setHasReview(reviewChecks.some(hasReview => hasReview));
      } catch (error) {
        console.error('Error checking reviews:', error);
        setHasReview(false);
      } finally {
        setIsCheckingReview(false);
      }
    };

    checkReviews();
  }, [paymentOrderTransaction?.items, accountId]);


  // Formatear fecha
  const formattedDate = useMemo(() => {
    if (!transaction?.date) return 'N/A';
    const date = new Date(transaction.date);
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'});
  }, [transaction?.date]);

  // Mapear estado
  const statusMap: Record<TransactionStatus, string> = {
    [TransactionStatus.COMPLETED]: 'Aprobada',
    [TransactionStatus.PENDING]: 'Pendiente',
    [TransactionStatus.CANCELLED]: 'Cancelada',
    [TransactionStatus.FAILED]: 'Fallida',
    [TransactionStatus.REFUNDED]: 'Reembolsada'};
  const statusText = transaction ? statusMap[transaction.status] || transaction.status : 'N/A';

  // Mapear método de pago
  const paymentMethodMap: Record<PaymentMethod, string> = {
    [PaymentMethod.CREDIT_CARD]: 'Tarjeta de Crédito',
    [PaymentMethod.CRYPTO]: 'Criptomoneda',
    [PaymentMethod.BANK_TRANSFER]: 'Transferencia Bancaria',
    [PaymentMethod.CASH]: 'Efectivo'};
  const paymentMethodText = transaction ? paymentMethodMap[transaction.paymentMethod] || transaction.paymentMethod : 'N/A';

  const isLoading = isLoadingTransaction || isLoadingPaymentOrder;
  const isError = isErrorTransaction;
  const error = transactionError;

  // Preparar columnas y datos para la tabla de productos
  const productsColumns: DataTableColumn[] = useMemo(() => [
    {
      title: 'PRODUCTO',
      data: 'name',
      responsivePriority: 1,
      searchable: true,
    },
    {
      title: 'CANTIDAD',
      data: 'quantity',
      responsivePriority: 1,
    },
    {
      title: 'PRECIO UNITARIO',
      data: 'unitPrice',
      responsivePriority: 1,
    },
    {
      title: 'SUBTOTAL',
      data: 'subtotal',
      responsivePriority: 1,
    },
  ], []);

  const productsData = useMemo(() => {
    if (!paymentOrderTransaction?.items) return [];
    return paymentOrderTransaction.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: `${item.unitPrice} ${item.currency}`,
      subtotal: `${item.subtotal} ${item.currency}`,
    }));
  }, [paymentOrderTransaction?.items]);

  // Función para obtener el variant del badge según el estado
  const getStatusVariant = (status: string): 'pending' | 'completed' | 'cancelled' | 'failed' | 'refunded' | 'approved' => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pendiente') || statusLower.includes('proceso')) return 'pending';
    if (statusLower.includes('aprobada') || statusLower.includes('completada') || statusLower.includes('autorizado') || statusLower.includes('capturado')) return 'completed';
    if (statusLower.includes('cancelada')) return 'cancelled';
    if (statusLower.includes('fallida') || statusLower.includes('fallido')) return 'failed';
    if (statusLower.includes('reembolsada')) return 'refunded';
    return 'pending';
  };

  // Función para obtener los estilos del badge
  const getBadgeStyles = (variant: string) => {
    const styles: Record<string, { bg: string; border: string; text: string }> = {
      pending: {
        bg: 'rgba(101, 116, 45, 0.3)',
        border: '#D4AF37',
        text: '#D4AF37',
      },
      completed: {
        bg: 'rgba(41, 196, 128, 0.2)',
        border: '#29C480',
        text: '#29C480',
      },
      approved: {
        bg: 'rgba(41, 196, 128, 0.2)',
        border: '#29C480',
        text: '#29C480',
      },
      cancelled: {
        bg: 'rgba(239, 68, 68, 0.2)',
        border: '#EF4444',
        text: '#EF4444',
      },
      failed: {
        bg: 'rgba(239, 68, 68, 0.2)',
        border: '#EF4444',
        text: '#EF4444',
      },
      refunded: {
        bg: 'rgba(251, 191, 36, 0.2)',
        border: '#FBBF24',
        text: '#FBBF24',
      },
    };
    return styles[variant] || styles.pending;
  };

  const getPaymentStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'authorized': 'Autorizado',
      'captured': 'Capturado',
      'pending': 'Pendiente',
      'failed': 'Fallido'};
    return map[status] || status;
  };

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
                { label: 'Detalle de Transacción' }
              ]}
            />

            {/* Loading State */}
            {isLoading && (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <LoadingSpinner color="success" size="large" />
              </Box>
            )}

            {/* Error State */}
            {isError && (
              <Alert severity="error">
                Error al cargar la transacción: {error instanceof Error ? error.message : 'Error desconocido'}
              </Alert>
            )}

            {/* Content */}
            {!isLoading && !isError && transaction && (
              <>
                {/* Información General e Información de Pago en 2 columnas */}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    {/* Información General */}
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
                    Información General
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.875rem',
                            mb: 0.5,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          ID de Transacción:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#ffffff',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          {transaction.transactionId}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.875rem',
                            mb: 0.5,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Estado:
                        </Typography>
                        {(() => {
                          const variant = getStatusVariant(statusText);
                          const badgeStyles = getBadgeStyles(variant);
                          return (
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                backgroundColor: badgeStyles.bg,
                                border: `1px solid ${badgeStyles.border}`,
                                color: badgeStyles.text,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {statusText}
                            </Box>
                          );
                        })()}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.875rem',
                            mb: 0.5,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Fecha:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#ffffff',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          {formattedDate}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.875rem',
                            mb: 0.5,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Método de Pago:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#ffffff',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          {paymentMethodText}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    {/* Información de Pago */}
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
                    Información de Pago
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.875rem',
                            mb: 0.5,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Monto Total:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#ffffff',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          {transaction.totalAmount} {transaction.currency}
                        </Typography>
                      </Box>
                    </Grid>
                    {paymentOrderTransaction?.payment && (
                      <>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.875rem',
                                mb: 0.5,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Proveedor de Pago:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#ffffff',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              {paymentOrderTransaction.payment.provider || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                        {paymentOrderTransaction.payment.transactionReference && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  fontSize: '0.875rem',
                                  mb: 0.5,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                Referencia de Transacción:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#ffffff',
                                  fontSize: '0.8125rem',
                                  fontWeight: 500,
                                  wordBreak: 'break-all',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                {paymentOrderTransaction.payment.transactionReference}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.875rem',
                                mb: 0.5,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Estado del Pago:
                            </Typography>
                            {(() => {
                              const paymentStatusLabel = getPaymentStatusLabel(paymentOrderTransaction.payment.status);
                              const variant = getStatusVariant(paymentStatusLabel);
                              const badgeStyles = getBadgeStyles(variant);
                              return (
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: badgeStyles.bg,
                                    border: `1px solid ${badgeStyles.border}`,
                                    color: badgeStyles.text,
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {paymentStatusLabel}
                                </Box>
                              );
                            })()}
                          </Box>
                        </Grid>
                        {paymentOrderTransaction.payment.cryptoId && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  fontSize: '0.875rem',
                                  mb: 0.5,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                ID de Criptomoneda:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#ffffff',
                                  fontSize: '0.8125rem',
                                  fontWeight: 500,
                                  wordBreak: 'break-all',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                {paymentOrderTransaction.payment.cryptoId}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </>
                    )}
                    {paymentOrderTransaction?.store && (
                      <>
                        <Grid size={{ xs: 12 }}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.875rem',
                                mb: 0.5,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Tienda:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#ffffff',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              {paymentOrderTransaction.store.name}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.875rem',
                                mb: 0.5,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Email de la Tienda:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#ffffff',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              {paymentOrderTransaction.store.contactEmail}
                            </Typography>
                          </Box>
                        </Grid>
                      </>
                    )}
                    {paymentOrderTransaction?.shipping && (
                      <>
                        <Grid size={{ xs: 12 }}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.875rem',
                                mb: 0.5,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Método de Envío:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#ffffff',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              {paymentOrderTransaction.shipping.method}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.875rem',
                                mb: 0.5,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Costo de Envío:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#ffffff',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              {paymentOrderTransaction.shipping.cost} {transaction.currency}
                            </Typography>
                          </Box>
                        </Grid>
                        {paymentOrderTransaction.shipping.estimatedDelivery && (
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  fontSize: '0.875rem',
                                  mb: 0.5,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                Entrega Estimada:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#ffffff',
                                  fontSize: '0.8125rem',
                                  fontWeight: 500,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                                }}
                              >
                                {new Date(paymentOrderTransaction.shipping.estimatedDelivery).toLocaleDateString('es-AR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                    </Box>
                  </Grid>
                </Grid>

                {/* Productos */}
                {paymentOrderTransaction?.items && paymentOrderTransaction.items.length > 0 && (
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                      border: "2px solid rgba(41, 196, 128, 0.1)",
                      borderRadius: "24px",
                      overflow: "visible",
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
                      Productos
                    </Typography>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        maxWidth: '100%',
                        overflow: 'visible',
                        boxSizing: 'border-box',
                      }}
                    >
                      {productsData.length > 0 ? (
                        <DataTable
                          id="transaction-products-table"
                          columns={productsColumns}
                          data={productsData as Record<string, unknown>[]}
                          className="shadow-lg"
                          searching={false}
                          isLoading={isLoadingPaymentOrder}
                        />
                      ) : (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                          <Typography
                            sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.875rem',
                            }}
                          >
                            No hay productos disponibles
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Información Adicional */}
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
                    Información Adicional
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.875rem',
                            mb: 0.5,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          ID de Cuenta:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#ffffff',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          {transaction.accountId}
                        </Typography>
                      </Box>
                    </Grid>
                    {paymentOrderTransaction?.items && paymentOrderTransaction.items.length > 0 && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                          <Button
                            variant="primary"
                            onClick={() => router.push(`/admin/panel/transactions/${transactionId}/review`)}
                            disabled={isCheckingReview}
                            sx={{
                              px: 3,
                              py: 1,
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              borderRadius: '8px',
                              textTransform: 'none',
                            }}
                          >
                            {isCheckingReview ? 'Verificando...' : (hasReview ? 'Ver Opinión' : 'Opinar')}
                          </Button>
                        </Box>
                      </Grid>
                    )}
                    {transaction.cryptoId && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.875rem',
                              mb: 0.5,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            ID de Criptomoneda:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#ffffff',
                              fontSize: '0.8125rem',
                              fontWeight: 500,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            {transaction.cryptoId}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {transaction.shippingId && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.875rem',
                              mb: 0.5,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            ID de Envío:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#ffffff',
                              fontSize: '0.8125rem',
                              fontWeight: 500,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            {transaction.shippingId}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </>
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
