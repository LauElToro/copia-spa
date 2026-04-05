'use client'
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { ShoppingCart, AttachMoney, TrendingUp, Visibility, CheckCircle, People, CalendarMonth } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { PendingTasksSection } from '@/presentation/@shared/components/ui/molecules/pending-tasks-section';
import { VerificationSection } from '@/presentation/@shared/components/ui/molecules/verification-section';
import { ProductsSection } from '@/presentation/@shared/components/ui/molecules/products-section';
import { UserDashboardSection } from '@/presentation/@shared/components/ui/molecules/user-dashboard-section';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { useProducts } from '@/presentation/@shared/hooks/use-products';
import { useProfile } from '@/presentation/@shared/hooks/use-profile';
import { useTransactions } from '@/presentation/@shared/hooks/use-transactions';
// useProductsStats removed - it returns marketplace-wide stats, not store-specific
import { ProductEntity } from '@/presentation/@shared/types/product';
import { TransactionEntity, TransactionStatus } from '@/presentation/@shared/types/transaction';
import { axiosHelper } from '@/presentation/@shared/helpers/axios-helper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { useDeleteConfirmation } from '@/presentation/@shared/hooks/use-delete-confirmation';
import { usePauseConfirmation } from '@/presentation/@shared/hooks/use-pause-confirmation';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

// Extender la interfaz Window para las funciones globales
declare global {
  interface Window {
    handlePausedClick?: (id: string | number, paused: boolean) => void;
    handleDeleteClick?: (id: string | number) => void;
  }
}



// Función para transformar ProductEntity a formato de tabla
const transformProductsForTable = (products: ProductEntity[], actingId: string, actionLoading: boolean) => {
  return products.map((product) => ({
    id: product.id,
    productId: product.id, // ID para las acciones
    name: product.name,
    image: product.image_url || '/images/product-placeholder.jpg',
    price: `${product.price} ${product.crypto}`,
    promo: product.promotion || 'Ninguna',
    status: product.active_status === 1 ? 'Aprobado' : 'Pausado',
    paused: product.active_status !== 1,
    processing: actingId === product.id && actionLoading,
    original: product, // Mantener referencia al producto original para acciones
  }));
};

const CommerceHomePage: React.FC = () => {
  const { t } = useLanguage();
  
  // Note: columns are defined inside the component to access translations
  const columns: DataTableColumn[] = [
  {
    title: t.admin?.name || 'Nombre',
    data: 'name',
    responsivePriority: 1,
  },
  {
    title: t.admin?.image || 'Imagen',
    data: 'image',
    responsivePriority: 3,
    type: 'image',
    orderable: false,
    searchable: false,
    imageOptions: {
      width: 40,
      height: 40,
      className: 'rounded-circle',
      defaultImage: '/images/icons/avatar.png',
      alt: t.admin?.productImage || 'Imagen del producto'
    }
  },
  {
    title: t.admin?.price || 'Precio',
    data: 'price',
    responsivePriority: 2
  },
  {
    title: t.admin?.promotion || 'Promoción',
    data: 'promo',
    responsivePriority: 4
  },
  {
    title: t.admin?.status || 'Estado',
    data: 'status',
    responsivePriority: 5,
    type: 'html',
    render: function(data: unknown, type: string) {
      if (type === 'display') {
        const isActive = data === 'Aprobado';
        const statusText = isActive ? (t.admin?.active || 'Activo') : (t.admin?.inactive || 'Inactivo');
        const bgColor = isActive ? 'rgba(41, 196, 128, 0.2)' : 'rgba(101, 116, 45, 0.3)';
        const borderColor = isActive ? '#29C480' : '#D4AF37';
        const textColor = isActive ? '#29C480' : '#D4AF37';

        return `
          <div style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 4px 12px;
            border-radius: 8px;
            background-color: ${bgColor};
            border: 1px solid ${borderColor};
            color: ${textColor};
            font-size: 0.875rem;
            font-weight: 600;
            font-family: 'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            white-space: nowrap;
          ">
            ${statusText}
          </div>
        `;
      }
      return data as string;
    }
  },
  {
    title: t.admin?.actions || 'ACCIONES',
    data: 'paused',
    orderable: false,
    searchable: false,
    type: 'html',
    render: function (data: unknown, type: string, row: Record<string, unknown>) {
      // Obtener el valor de paused del row directamente (más confiable que data que puede venir como string)
      const pausedValue = row.paused;
      // Convertir a booleano de forma segura
      // Si paused es true (producto pausado), mostrar "Activar"
      // Si paused es false (producto activo), mostrar "Pausar"
      let isPaused = false;
      if (pausedValue === true || pausedValue === 'true') {
        isPaused = true;
      } else if (pausedValue === false || pausedValue === 'false' || pausedValue === null || pausedValue === undefined) {
        isPaused = false;
      } else {
        // Fallback: cualquier otro valor truthy se considera pausado
        isPaused = Boolean(pausedValue);
      }

      const buttonText = isPaused ? (t.admin?.activate || 'Activar') : (t.admin?.pause || 'Pausar');
      const disabledAttr = row.processing ? 'disabled' : '';
      const spinner = row.processing ? '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>' : '';

      return `
        <a href="/product/${row.productId}" target="_blank" rel="noopener noreferrer" data-icon="Visibility">${t.admin?.viewProduct || 'Ver el producto'}</a>
        <a href="/admin/panel/products/${row.productId}" data-icon="Edit">${t.admin?.edit || 'Editar'}</a>
        <button
          ${disabledAttr}
          onclick="handlePausedClick('${row.productId}', ${isPaused})"
          data-icon="${isPaused ? 'PlayArrow' : 'Pause'}"
        >
          ${spinner}${buttonText}
        </button>
        <button
          ${disabledAttr}
          onclick="handleDeleteClick('${row.productId}')"
          data-icon="Delete"
        >
          ${spinner}${t.admin?.delete || 'Eliminar'}
        </button>
      `;
    },
    responsivePriority: 1
  }
];

  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actingId, setActingId] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Obtener perfil del usuario actual
  const { profile: profileData } = useProfile();
  const accountId = (profileData as { id?: string })?.id;

  // Obtener productos del usuario actual
  const { useProductsByAccountId, deleteProduct, togglePauseProduct } = useProducts();
  const productsQuery = useProductsByAccountId(accountId || '');

  // Obtener transacciones del usuario actual
  const { getTransactions } = useTransactions(accountId);

  // Hooks para confirmaciones
  const { confirmDelete, updateLoading: updateDeleteLoading } = useDeleteConfirmation();
  const { confirmPause, updateLoading: updatePauseLoading } = usePauseConfirmation();

  const isLoading = productsQuery.isLoading;
  const isError = productsQuery.isError;

  // Transformar productos para la tabla
  const products = useMemo(() => productsQuery.data || [], [productsQuery.data]);
  const tableData = useMemo(() => transformProductsForTable(products, actingId, actionLoading), [products, actingId, actionLoading]);

  // Helper function to format large numbers with abbreviations
  const formatNumber = (num: number, prefix = ''): string => {
    if (num >= 1_000_000_000) {
      return `${prefix}${(num / 1_000_000_000).toFixed(1)}B`;
    }
    if (num >= 1_000_000) {
      return `${prefix}${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `${prefix}${(num / 1_000).toFixed(1)}K`;
    }
    return `${prefix}${num.toLocaleString('es-AR')}`;
  };

  // Calcular métricas de negocio usando SOLO datos del usuario (productos propios y transacciones)
  // NO usamos productsStatsQuery porque retorna stats de todo el marketplace
  const businessMetrics = useMemo(() => {
    const transactions = getTransactions.data || [];
    const productsData = productsQuery.data || [];

    // Transacciones completadas del usuario
    const completedTransactions = transactions.filter(
      (t: TransactionEntity) => t.status === TransactionStatus.COMPLETED
    );

    // Ingresos totales - calculamos desde las transacciones del usuario
    const totalRevenue = completedTransactions.reduce(
      (sum: number, t: TransactionEntity) => sum + (t.totalAmount || 0),
      0
    );

    // Ingresos del mes actual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const revenueThisMonth = completedTransactions
      .filter((t: TransactionEntity) => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum: number, t: TransactionEntity) => sum + (t.totalAmount || 0), 0);

    // Total de ventas - desde productos del usuario
    const totalSoldUnits = productsData.reduce((sum, p) => {
      const sales = p.engagementStats?.sales?.unitsSold ?? p.sales ?? 0;
      return sum + sales;
    }, 0);

    // Productos activos del usuario
    const activeProducts = productsData.filter(p => p.active_status === 1).length;

    // Total de visitas de productos del usuario
    const totalVisits = productsData.reduce((sum, p) => {
      const visits = p.engagementStats?.visits?.total ?? p.visits ?? 0;
      return sum + visits;
    }, 0);

    // Tasa de conversión
    const conversionRate = totalVisits > 0
      ? ((totalSoldUnits / totalVisits) * 100).toFixed(1)
      : '0.0';

    // Clientes únicos (aproximado por transacciones únicas)
    const uniqueCustomers = new Set(
      completedTransactions.map((t: TransactionEntity) => t.accountId)
    ).size;

    // Crecimiento mensual (comparar con mes anterior)
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const revenueLastMonth = completedTransactions
      .filter((t: TransactionEntity) => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === lastMonth &&
               transactionDate.getFullYear() === lastMonthYear;
      })
      .reduce((sum: number, t: TransactionEntity) => sum + (t.totalAmount || 0), 0);

    const growthRate = revenueLastMonth > 0
      ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
      : revenueThisMonth > 0 ? '100.0' : '0.0';

    return [
      { icon: AttachMoney, label: 'Ingresos totales', value: formatNumber(totalRevenue, '$'), color: '#29C480' },
      { icon: CalendarMonth, label: 'Ingresos del mes', value: formatNumber(revenueThisMonth, '$'), color: '#34d399' },
      { icon: ShoppingCart, label: 'Total de ventas', value: formatNumber(totalSoldUnits), color: '#3b82f6' },
      { icon: TrendingUp, label: 'Crecimiento mensual', value: `${growthRate}%`, color: growthRate.startsWith('-') ? '#ef4444' : '#34d399' },
      { icon: CheckCircle, label: 'Productos activos', value: activeProducts.toString(), color: '#34d399' },
      { icon: Visibility, label: 'Total de visitas', value: formatNumber(totalVisits), color: '#8b5cf6' },
      { icon: TrendingUp, label: 'Tasa de conversión', value: `${conversionRate}%`, color: '#f59e0b' },
      { icon: People, label: 'Clientes únicos', value: uniqueCustomers.toString(), color: '#ec4899' },
    ];
  }, [getTransactions.data, productsQuery.data]);

  // Get store ID from localStorage
  const storeId = typeof window !== 'undefined' ? localStorage.getItem('storeId') : null;

  // KYC / KYB status
  const kycQuery = useQuery({
    queryKey: ['kyc','status', storeId],
    queryFn: async () => {
      if (!storeId) return { verified: false };
      const res = await axiosHelper.kyc.getStatus(storeId);
      const response = res.data as { status?: string; verified?: boolean; data?: { status?: string; verified?: boolean } };
      const status = response?.data?.status ?? response?.status;
      const verified = Boolean(response?.data?.verified ?? response?.verified ?? (status === 'verified'));
      return { verified };
    },
    retry: false,
    staleTime: 60_000,
    enabled: isClient && typeof window !== 'undefined' && !!storeId,
  });
  const kybQuery = useQuery({
    queryKey: ['kyb','status', storeId],
    queryFn: async () => {
      if (!storeId) return { verified: false };
      const res = await axiosHelper.kyb.getStatus(storeId);
      const response = res.data as { status?: string; verified?: boolean; data?: { status?: string; verified?: boolean } };
      const status = response?.data?.status ?? response?.status;
      const verified = Boolean(response?.data?.verified ?? response?.verified ?? (status === 'verified'));
      return { verified };
    },
    retry: false,
    staleTime: 60_000,
    enabled: isClient && typeof window !== 'undefined' && !!storeId,
  });

  const handleUploadProduct = () => {
    router.push('/admin/panel/upload-product');
  };

  const handleUploadMassive = () => {
    router.push('/admin/panel/upload-massive');
  };

  // Configurar funciones globales para las acciones de la tabla
  useEffect(() => {
    if (typeof window === 'undefined' || !isClient) return;

    // Función para pausar/publicar producto
    window.handlePausedClick = ((id: string | number, paused: boolean) => {
      const products = productsQuery.data || [];
      const found = products.find((p) => String(p.id) === String(id));
      const productId = String(id);
      const productName = found?.name;

      // Usar el hook de confirmación de pausa/publicación con el modal centralizado
      confirmPause(productId, {
        itemName: productName || 'producto',
        paused,
        toast,
        onConfirm: async () => {
          try {
            setActionLoading(true);
            setActingId(productId);
            updatePauseLoading(true);

            await togglePauseProduct(productId, paused);
            // Invalidar y refetch la query específica del accountId
            if (accountId) {
              queryClient.invalidateQueries({
                queryKey: ['products', 'byAccount', accountId]
              });
              await queryClient.refetchQueries({
                queryKey: ['products', 'byAccount', accountId],
                type: 'active'
              });
            }
            // Refetch explícito para asegurar que la tabla se actualice
            const refetchedData = await productsQuery.refetch();
            console.log('[PauseProduct] Refetched data:', refetchedData.data);
            updatePauseLoading(false);
            setActingId('');
            setActionLoading(false);
          } catch (error) {
            console.error('[PauseProduct] Error:', error);
            setActionLoading(false);
            setActingId('');
            updatePauseLoading(false);
            throw error; // Re-lanzar para que el hook maneje el cierre del modal
          }
        }
      });
    }) as (id: string | number, paused: boolean) => void;

    // Función para eliminar producto
    window.handleDeleteClick = ((id: string | number) => {
      // El id que viene es el productId (UUID del producto)
      // Buscar en los productos para obtener el nombre
      const products = productsQuery.data || [];
      const found = products.find((p) => String(p.id) === String(id));
      const productId = String(id);
      const productName = found?.name;

      // Usar el hook de confirmación de eliminación con el modal centralizado
      confirmDelete(productId, {
        itemName: productName || 'producto',
        toast,
        onConfirm: async () => {
          try {
            setActionLoading(true);
            setActingId(productId);
            updateDeleteLoading(true);

            // Guardar los datos actuales antes de eliminar
            const currentAccountId = (profileData as { id?: string })?.id;
            if (!currentAccountId) {
              updateDeleteLoading(false);
              return;
            }

            const queryKey = ['products', 'byAccount', currentAccountId];
            const previousData = queryClient.getQueryData<ProductEntity[]>(queryKey);

            if (!previousData || !Array.isArray(previousData)) {
              updateDeleteLoading(false);
              return;
            }

            // Filtrar el producto eliminado de los datos anteriores
            const filteredData = previousData.filter(p => String(p.id) !== productId);

            // Actualizar el cache ANTES de llamar al servidor (actualización optimista)
            queryClient.setQueryData(queryKey, filteredData);

            try {
              // Llamar al servidor para eliminar (onSuccess del mutation se encarga del refetch)
              await deleteProduct.mutateAsync(productId);
            } catch (error) {
              // Si falla, revertir a los datos anteriores
              queryClient.setQueryData(queryKey, previousData);
              throw error;
            }

            updateDeleteLoading(false);
          } catch (error) {
            // El error ya fue manejado en el catch interno que revierte previousData
            // Extraer el mensaje del backend si está disponible
            let errorMessage = 'No se pudo eliminar el producto';

            if (error && typeof error === 'object') {
              const axiosError = error as {
                response?: {
                  data?: {
                    message?: string;
                    detail?: string;
                    error?: string;
                  }
                };
                message?: string;
              };

              // Priorizar message del response, luego detail, luego error, luego message directo
              const backendMessage =
                axiosError?.response?.data?.message ||
                axiosError?.response?.data?.detail ||
                axiosError?.response?.data?.error ||
                axiosError?.message;

              if (backendMessage) {
                errorMessage = backendMessage;
              }
            }

            console.error('[deleteProduct] Error:', error);
            toast.error(errorMessage);
            updateDeleteLoading(false);
            throw error; // Re-lanzar para que el hook maneje el cierre del modal
          } finally {
            setActionLoading(false);
            setActingId('');
          }
        }
      });
    }) as (id: string | number) => void;

    // Cleanup al desmontar
    return () => {
      if (typeof window !== 'undefined') {
        delete window.handlePausedClick;
        delete window.handleDeleteClick;
      }
    };
  }, [productsQuery, confirmPause, confirmDelete, togglePauseProduct, deleteProduct, updatePauseLoading, updateDeleteLoading, toast, isClient, accountId, profileData, queryClient]);

  // Leer el perfil directamente del localStorage
  const userStr = globalThis.window?.localStorage?.getItem("user");
  const profile = userStr ? JSON.parse(userStr) : null;

  const isCommerce = profile?.accountType === 'commerce' || profile?.accountType === 'seller';

  if (!isClient) {
    return null;
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
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' }
              ]}
            />
            <Box
              sx={{
                display: { xs: 'flex', md: 'grid' },
                flexDirection: { xs: 'column', md: 'row' },
                gridTemplateColumns: { md: '1fr 2fr' },
                gap: { xs: 3, md: 4 },
                width: '100%'
              }}
            >
            {/* Columna izquierda - Tareas y Verificaciones */}
            <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
              <Stack spacing={3}>
                {/* Tareas pendientes */}
                <PendingTasksSection
                  message="Terminar de configurar mi cuenta."
                  linkText="Click aquí"
                  linkHref="/admin/panel/configuration"
                />

                {/* KYC */}
                <VerificationSection
                  title="KYC"
                  isLoading={kycQuery.isLoading}
                  isVerified={kycQuery.data?.verified ?? false}
                  description="Debes verificar tu identidad para acceder a todas las funcionalidades"
                  buttonText="Verificar Identidad"
                  onButtonClick={() => router.push('/admin/panel/kyc')}
                  verifiedText="Identidad verificada"
                />

                {/* KYB */}
                {isCommerce && (
                  <VerificationSection
                    title="KYB"
                    isLoading={kybQuery.isLoading}
                    isVerified={kybQuery.data?.verified ?? false}
                    description="Debes verificar tu negocio para acceder a todas las funcionalidades"
                    buttonText="Verificar Negocio"
                    onButtonClick={() => router.push('/admin/panel/kyb')}
                    verifiedText="Negocio verificado"
                  />
                )}
              </Stack>
            </Box>

            {/* Columna derecha - Productos o Dashboard de Usuario */}
            <Box sx={{ width: { xs: '100%', md: 'auto' }, flex: { md: 1 } }}>
              {isCommerce ? (
                <Stack spacing={3}>
                  {/* Métricas de productos */}
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
                      Resumen de tu negocio
                    </Typography>

                    <Grid container spacing={2}>
                      {businessMetrics.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 2,
                                background: 'rgba(41, 196, 128, 0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(41, 196, 128, 0.1)',
                                minHeight: '120px',
                                justifyContent: 'center',
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
                                  lineHeight: 1.2,
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

                <ProductsSection
                    title="Tus productos"
                  isLoading={isLoading}
                  isError={isError}
                  tableData={tableData}
                  columns={columns}
                  onCreateProduct={handleUploadProduct}
                  onUploadMassive={handleUploadMassive}
                  onRetry={() => productsQuery.refetch()}
                />
                </Stack>
              ) : (
                <UserDashboardSection />
              )}
            </Box>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default CommerceHomePage;
