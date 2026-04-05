"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { Box, Typography, Stack, Grid, CircularProgress } from '@mui/material';
import { ShoppingBag, Favorite, TrendingUp, LocalOffer } from '@mui/icons-material';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { useRouter } from 'next/navigation';
import { useTransactions } from '@/presentation/@shared/hooks/use-transactions';
import { useProfile } from '@/presentation/@shared/hooks/use-profile';
import { TransactionStatus } from '@/presentation/@shared/types/transaction';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useProductsStats } from '@/presentation/@shared/hooks/use-products-stats';
import { useFavorites } from '@/presentation/@shared/hooks/use-favorites';

// Función para formatear fecha relativa
const formatRelativeDate = (date: string | Date): string => {
  try {
    const transactionDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - transactionDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInDays === 0) {
      return 'Hoy';
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else if (diffInWeeks === 1) {
      return 'Hace 1 semana';
    } else if (diffInWeeks < 4) {
      return `Hace ${diffInWeeks} semanas`;
    } else if (diffInMonths === 1) {
      return 'Hace 1 mes';
    } else {
      return `Hace ${diffInMonths} meses`;
    }
  } catch {
    return 'Fecha inválida';
  }
};

// Función para mapear status a texto en español
const getStatusText = (status: TransactionStatus): string => {
  const statusMap: Record<TransactionStatus, string> = {
    [TransactionStatus.COMPLETED]: 'Completado',
    [TransactionStatus.PENDING]: 'En proceso',
    [TransactionStatus.CANCELLED]: 'Cancelado',
    [TransactionStatus.FAILED]: 'Fallido',
    [TransactionStatus.REFUNDED]: 'Reembolsado',
  };
  return statusMap[status] || status;
};

const UserDashboardSection: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { profile: profileData } = useProfile();
  const accountId = (profileData as { id?: string })?.id;

  // Obtener transacciones
  const { getTransactions } = useTransactions(accountId);
  const { data: transactions = [], isLoading: isLoadingTransactions } = getTransactions;

  // Obtener estadísticas de productos (marketplace)
  const productsStatsQuery = useProductsStats();

  // Obtener favoritos del usuario (almacenados localmente en localStorage)
  const { totalItems: favoriteProductsCount } = useFavorites();

  // Obtener las últimas 5 transacciones
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  // Calcular estadísticas usando datos de stats y transacciones
  const userStats = useMemo(() => {
    const stats = productsStatsQuery.data;
    const marketplaceStats = stats?.marketplace;
    const metrics = stats?.metrics;
    
    // Compras realizadas (transacciones completadas)
    const completedTransactions = transactions.filter(
      (t) => t.status === TransactionStatus.COMPLETED
    );
    
    // Productos favoritos - obtenidos del store local (Zustand + localStorage)
    // Nota: Actualmente los favoritos se almacenan solo en el navegador del usuario
    // No hay integración con backend aún
    const favoriteProducts = favoriteProductsCount.toString();
    
    // Transacciones activas (pendientes)
    const activeTransactions = transactions.filter(
      (t) => t.status === TransactionStatus.PENDING
    ).length;
    
    // Ofertas disponibles - usar productos nuevos del mes o productos destacados del marketplace
    const offersAvailable = metrics?.newProductsThisMonth || marketplaceStats?.mostViewed?.length || 15;

    return [
      { icon: ShoppingBag, label: 'Compras realizadas', value: completedTransactions.length.toString(), color: '#29C480' },
      { icon: Favorite, label: 'Productos favoritos', value: favoriteProducts, color: '#ef4444' },
      { icon: TrendingUp, label: t.admin?.activeTransactions || 'Transacciones activas', value: activeTransactions.toString(), color: '#3b82f6' },
      { icon: LocalOffer, label: 'Ofertas disponibles', value: offersAvailable.toString(), color: '#f59e0b' },
    ];
  }, [transactions, productsStatsQuery.data, t.admin?.activeTransactions, favoriteProductsCount]);

  const mockOffers = [
    { title: 'Descuento del 20%', description: 'En productos seleccionados', validUntil: 'Válido hasta el 15/02' },
    { title: 'Envío gratis', description: 'En compras superiores a $100', validUntil: 'Oferta permanente' },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <Stack spacing={3}>
      {/* Estadísticas rápidas */}
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
          Resumen de tu cuenta
        </Typography>
        
        <Grid container spacing={2}>
          {userStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Grid size={{ xs: 6 }} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 2,
                    background: 'rgba(41, 196, 128, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(41, 196, 128, 0.1)',
                  }}
                >
                  <IconComponent sx={{ color: stat.color, fontSize: 28, mb: 1 }} />
                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      mb: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      textAlign: 'center',
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Compras recientes */}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontWeight: 700,
              color: '#34d399',
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            Compras recientes
          </Typography>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/admin/panel/transactions')}
          >
            Ver todas
          </Button>
        </Box>

        {isLoadingTransactions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#29C480' }} />
          </Box>
        ) : recentTransactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              No tienes transacciones recientes
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {recentTransactions.map((transaction) => {
              const isCompleted = transaction.status === TransactionStatus.COMPLETED;
              const statusText = getStatusText(transaction.status);
              const formattedDate = formatRelativeDate(transaction.date);
              const amount = `${transaction.totalAmount} ${transaction.currency}`;

              return (
                <Box
                  key={transaction.id}
                  sx={{
                    padding: 2,
                    background: 'rgba(41, 196, 128, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(41, 196, 128, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#ffffff',
                      }}
                    >
                      {transaction.transactionId}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#29C480',
                      }}
                    >
                      {amount}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      {formattedDate}
                    </Typography>
                    <Box
                      sx={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: isCompleted 
                          ? 'rgba(41, 196, 128, 0.2)' 
                          : 'rgba(251, 191, 36, 0.2)',
                        border: `1px solid ${isCompleted 
                          ? 'rgba(41, 196, 128, 0.4)' 
                          : 'rgba(251, 191, 36, 0.4)'}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: isCompleted ? '#29C480' : '#fbbf24',
                          fontWeight: 600,
                        }}
                      >
                        {statusText}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Ofertas destacadas */}
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
          Ofertas destacadas
        </Typography>

        <Stack spacing={2}>
          {mockOffers.map((offer, index) => (
            <Box
              key={index}
              sx={{
                padding: 2,
                background: 'rgba(41, 196, 128, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(41, 196, 128, 0.1)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#29C480',
                  mb: 0.5,
                }}
              >
                {offer.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 1,
                }}
              >
                {offer.description}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {offer.validUntil}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Button
          variant="primary"
          onClick={() => router.push('/')}
          sx={{ mt: 1 }}
        >
          Explorar ofertas
        </Button>
      </Box>
    </Stack>
  );
};

export default UserDashboardSection;

