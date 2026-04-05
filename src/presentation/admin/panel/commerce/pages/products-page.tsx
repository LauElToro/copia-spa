"use client";

import { useRouter } from "next/navigation";

import React, { FC, useMemo, useState } from "react";
import { Box, Container, Grid, Stack, Typography, Menu, MenuItem } from '@mui/material';
import { Inventory, CheckCircle, ShoppingCart, Visibility, TrendingUp, AttachMoney, Star, NewReleases, KeyboardArrowDown } from '@mui/icons-material';
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import DataTable, { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { LoadingSpinner } from "@/presentation/@shared/components/ui/atoms/loading-spinner";
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { SearchInput } from "@/presentation/@shared/components/ui/atoms/search-input";
import { useQueryClient } from '@tanstack/react-query';
import { useProducts } from "@/presentation/@shared/hooks/use-products";
import { useProfile } from "@/presentation/@shared/hooks/use-profile";
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { useDeleteConfirmation } from '@/presentation/@shared/hooks/use-delete-confirmation';
import { usePauseConfirmation } from '@/presentation/@shared/hooks/use-pause-confirmation';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

// Extender la interfaz Window para las funciones globales
declare global {
  interface Window {
    handlePausedClick?: (id: string | number, paused: boolean) => void;
    handleDeleteClick?: (id: string | number) => void;
  }
}

type Product = {
  id: number; // solo para tabla
  productId: string; // id real del producto en ms-products
  name: string;
  image: string;
  price: string;
  shipping: string;
  promotion: string;
  status: string;
  paused: boolean;
  processing?: boolean;
};

const columns: DataTableColumn[] = [
  {
    title: 'PRODUCTO',
    data: 'name',
    responsivePriority: 1},
  {
    title: 'IMAGEN',
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
      alt: 'Imagen del producto'
    }
  },
  {
    title: 'PRECIO',
    data: 'price',
    responsivePriority: 2},
  {
    title: 'ENVIO',
    data: 'shipping',
    responsivePriority: 4},
  {
    title: 'PROMOCIÓN',
    data: 'promotion',
    responsivePriority: 5},
  {
    title: 'ESTADO',
    data: 'status',
    responsivePriority: 5,
    type: 'html',
    render: function(data: unknown, type: string) {
      if (type === 'display') {
        const isActive = data === 'Aprobado';
        const statusText = isActive ? 'Activo' : 'Inactivo';
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
    title: 'ACCIONES',
    data: 'paused',
    orderable: false,
    searchable: false,
    type: 'html',
    render: function (data: unknown, type: string, row: Record<string, unknown>) {
      // Obtener el estado paused del row directamente (más confiable que data)
      const pausedValue = row.paused;
      // Convertir a booleano de forma segura
      let isPaused = false;
      if (pausedValue === true || pausedValue === 'true') {
        isPaused = true;
      } else if (pausedValue === false || pausedValue === 'false' || pausedValue === null || pausedValue === undefined) {
        isPaused = false;
      } else {
        // Fallback: cualquier otro valor truthy se considera pausado
        isPaused = Boolean(pausedValue);
      }

      // Si está pausado, mostrar "Activar", si está activo, mostrar "Pausar"
      const buttonText = isPaused ? 'Activar' : 'Pausar';
      const disabledAttr = row.processing ? 'disabled' : '';
      const spinner = row.processing ? '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>' : '';

      return `
        <a href="/product/${row.productId}" target="_blank" rel="noopener noreferrer" data-icon="Visibility">Ver el producto</a>
        <a href="/admin/panel/products/${row.productId}" data-icon="Edit">Editar</a>
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
          ${spinner}Eliminar
        </button>
      `;
    },
    responsivePriority: 1}
]

export const ProductsPage: FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { profile: profileData } = useProfile();
  const { useProductsByAccountId } = useProducts();
  const productsQuery = useProductsByAccountId((profileData as { id?: string })?.id || '');

  // Mutaciones y funciones globales
  const { deleteProduct, togglePauseProduct } = useProducts();
  const { confirmDelete, updateLoading: updateDeleteLoading } = useDeleteConfirmation();
  const { confirmPause, updateLoading: updatePauseLoading } = usePauseConfirmation();
  const [actionLoading, setActionLoading] = React.useState<boolean>(false);
  const [actingId, setActingId] = React.useState<string>('');
  const [tableVersion, setTableVersion] = React.useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [optimisticProducts, setOptimisticProducts] = React.useState<ProductFromQuery[] | undefined>(undefined);

  interface ProductFromQuery {
    id: string;
    name: string;
    image_url?: string;
    photos?: Array<{ image_url?: string }>;
    price: number;
    crypto: string;
    shipping?: boolean;
    promotion?: string;
    active_status: number;
    sales?: number;
    visits?: number;
    creation_date?: string;
    engagementStats?: {
      sales?: { unitsSold?: number };
      visits?: { total?: number; uniqueVisitors?: number };
      rating?: { average?: number; totalOpinions?: number };
    };
  }

  if (globalThis.window !== undefined) {
    globalThis.window.handlePausedClick = ((id: string | number, paused: boolean) => {
      const products = productsQuery.data as ProductFromQuery[] | undefined;
      const found = (products || []).find((p) => String(p.id) === String(id));
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
            const accountId = (profileData as { id?: string })?.id;
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
            // Limpiar actualización optimista si existe
            setOptimisticProducts(undefined);
            // Incrementar la versión de la tabla para forzar reinicialización
            setTableVersion(prev => prev + 1);
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
        }});
    }) as (id: string | number, paused: boolean) => void;

    globalThis.window.handleDeleteClick = ((id: string | number) => {
      // El id que viene es el productId (UUID del producto)
      // Buscar en los productos para obtener el nombre
      const products = productsQuery.data as ProductFromQuery[] | undefined;
      const found = (products || []).find((p) => String(p.id) === String(id));
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

            // Debug: Log del accountId que se está usando
            const raw = localStorage.getItem('user');
            const user = raw ? JSON.parse(raw) : undefined;
            const accountIdFromStorage = user?.id;

            // Decodificar JWT para obtener accountId
            const token = localStorage.getItem('accessToken');
            let accountIdFromJWT: string | null = null;
            if (token) {
              try {
                const parts = token.split('.');
                if (parts.length === 3) {
                  const payload = parts[1];
                  const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
                  const decodedPayload = atob(paddedPayload);
                  const parsedPayload = JSON.parse(decodedPayload);
                  accountIdFromJWT = parsedPayload.accountId || parsedPayload.sub || null;
                }
              } catch (e) {
                console.error('Error decoding JWT:', e);
              }
            }

            console.log('[deleteProduct] Debug info:', {
              productId,
              accountIdFromStorage,
              accountIdFromJWT,
              profileDataId: (profileData as { id?: string })?.id,
              match: accountIdFromStorage === accountIdFromJWT});

            // Actualización optimista: remover el producto de la lista localmente antes de eliminar
            const currentProducts = productsQuery.data as ProductFromQuery[] | undefined;
            if (currentProducts) {
              const filteredProducts = currentProducts.filter(p => String(p.id) !== productId);
              setOptimisticProducts(filteredProducts);
            }

            await deleteProduct.mutateAsync(productId);

            // Invalidar específicamente la query byAccount para asegurar que se actualice
            const accountId = (profileData as { id?: string })?.id;
            if (accountId) {
              // Invalidar primero
              queryClient.invalidateQueries({
                queryKey: ['products', 'byAccount', accountId]
              });
              // Luego refetch y esperar a que complete
              await queryClient.refetchQueries({
                queryKey: ['products', 'byAccount', accountId],
                type: 'active'
              });
            }

            // Refetch explícito de la query actual y esperar a que complete
            const refetchedData = await productsQuery.refetch();
            console.log('[deleteProduct] Refetched data:', refetchedData.data);

            // Limpiar la actualización optimista y usar los datos del servidor
            if (refetchedData.data && Array.isArray(refetchedData.data)) {
              setOptimisticProducts(undefined);
              // Incrementar versión de tabla para forzar reinicialización
              setTableVersion(prev => prev + 1);
            }
            setActingId('');
            setActionLoading(false);
            updateDeleteLoading(false);
          } catch (error) {
            console.error('[deleteProduct] Error:', error);
            // Revertir la actualización optimista en caso de error
            setOptimisticProducts(undefined);
            setActionLoading(false);
            setActingId('');
            updateDeleteLoading(false);
            throw error; // Re-lanzar para que el hook maneje el cierre del modal
          }
        }});
    }) as (id: string | number) => void;
  }

  // Transformar datos reales a formato de tabla esperado
  // Usar useMemo para recalcular cuando cambien los datos o el actingId
  // Usar optimisticProducts si está disponible, sino usar productsQuery.data
  const tableData: Product[] = React.useMemo(() => {
    const dataToUse = optimisticProducts !== undefined ? optimisticProducts : (productsQuery.data as ProductFromQuery[] | undefined);
    return ((dataToUse || [])).map((p, idx: number) => ({
      id: idx + 1,
      productId: String(p.id),
      name: p.name,
      image: p.image_url || (p.photos && p.photos[0]?.image_url) || '/images/product-placeholder.jpg',
      price: `${p.price} ${p.crypto}`,
      shipping: p.shipping ? 'Completado' : 'Desactivado',
      promotion: p.promotion || 'Ninguna',
      status: p.active_status === 1 ? 'Aprobado' : 'Pausado',
      paused: p.active_status !== 1,
      processing: actingId === String(p.id) && actionLoading}));
  }, [productsQuery.data, optimisticProducts, actingId, actionLoading]);

  // Key para forzar reinicialización de DataTable cuando cambien los datos
  // Incluye el estado de los productos (active_status) para detectar cambios
  const tableKey = React.useMemo(() => {
    const products = productsQuery.data as ProductFromQuery[] | undefined;
    const count = (products || []).length;
    // Crear un hash del estado de los productos para detectar cambios
    const statusHash = products?.map(p => `${p.id}:${p.active_status}`).join(',') || '';
    return `products-table-v${tableVersion}-${count}-${statusHash.substring(0, 50)}`;
  }, [productsQuery.data, tableVersion]);

  // Calcular métricas de productos
  const productMetrics = useMemo(() => {
    const products = (productsQuery.data as ProductFromQuery[] | undefined) || [];
    const total = products.length;
    const active = products.filter(p => p.active_status === 1).length;

    // Calcular ventas totales (usando engagementStats si está disponible, sino sales directo)
    const totalSales = products.reduce((sum, p) => {
      const sales = p.engagementStats?.sales?.unitsSold || p.sales || 0;
      return sum + sales;
    }, 0);

    // Calcular visitas totales
    const totalVisits = products.reduce((sum, p) => {
      const visits = p.engagementStats?.visits?.total || p.visits || 0;
      return sum + visits;
    }, 0);

    // Calcular ingresos totales (precio * ventas)
    const totalRevenue = products.reduce((sum, p) => {
      const sales = p.engagementStats?.sales?.unitsSold || p.sales || 0;
      return sum + (p.price * sales);
    }, 0);

    // Tasa de conversión (ventas/visitas * 100)
    const conversionRate = totalVisits > 0 ? ((totalSales / totalVisits) * 100).toFixed(1) : '0.0';

    // Productos nuevos este mes
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const newThisMonth = products.filter(p => {
      if (!p.creation_date) return false;
      const created = new Date(p.creation_date);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length;

    // Productos con mejor rating (rating promedio > 4)
    const highRated = products.filter(p => {
      const avgRating = p.engagementStats?.rating?.average || 0;
      return avgRating >= 4;
    }).length;

    return [
      { icon: ShoppingCart, label: t.admin?.totalSales || 'Total de ventas', value: totalSales.toString(), color: '#29C480' },
      { icon: AttachMoney, label: t.admin?.totalRevenue || 'Ingresos totales', value: `$${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, color: '#34d399' },
      { icon: TrendingUp, label: t.admin?.conversionRate || 'Tasa de conversión', value: `${conversionRate}%`, color: '#3b82f6' },
      { icon: Visibility, label: t.admin?.totalVisits || 'Total de visitas', value: totalVisits.toLocaleString(), color: '#8b5cf6' },
      { icon: CheckCircle, label: t.admin?.activeProducts || 'Productos activos', value: active.toString(), color: '#34d399' },
      { icon: Star, label: t.admin?.highRatedProducts || 'Bien calificados', value: highRated.toString(), color: '#f59e0b' },
      { icon: NewReleases, label: t.admin?.newThisMonth || 'Nuevos este mes', value: newThisMonth.toString(), color: '#ef4444' },
      { icon: Inventory, label: t.admin?.totalProducts || 'Total de productos', value: total.toString(), color: '#29C480' },
    ];
  }, [productsQuery.data]);

  const handleUploadProduct = () => {
    router.push(`/admin/panel/upload-product`);
  }

  // const handleUploadMassive = () => {
  //   router.push('/admin/panel/upload-massive');
  // }

  const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    handleDropdownClose();
    router.push(path);
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
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: t.menu?.products || 'Productos' }
              ]}
            />
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
                Resumen de productos
              </Typography>

              <Grid container spacing={2}>
                {productMetrics.map((stat, index) => {
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

            {/* Administra tus productos */}
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
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
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
                  Tus productos
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                    alignItems: 'center',
                    width: { xs: '100%', md: 'auto' }
                  }}
                >
                  <Box>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleDropdownClick}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      Crear producto
                      <KeyboardArrowDown
                        style={{
                          transition: 'transform 500ms ease',
                          transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                          fontSize: '1rem',
                        }}
                      />
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleDropdownClose}
                      sx={{
                        '& .MuiPaper-root': {
                          background: '#111827',
                          borderRadius: '0px',
                          mt: 2,
                          minWidth: 240,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                          border: 'none',
                        },
                      }}
                      transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                    >
                      <MenuItem
                        onClick={() => handleMenuItemClick('/admin/panel/upload-product')}
                        sx={{
                          px: 2,
                          py: 2,
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          borderLeft: '3px solid transparent',
                          cursor: 'pointer',
                          color: '#ffffff',
                          backgroundColor: 'transparent',
                          '&:hover': {
                            backgroundColor: '#374151',
                            borderLeft: '3px solid #22c55e',
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{
                          fontWeight: 500,
                          fontSize: '1rem'
                        }}>
                          Individual
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleMenuItemClick('/admin/panel/upload-massive')}
                        sx={{
                          px: 2,
                          py: 2,
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          borderLeft: '3px solid transparent',
                          cursor: 'pointer',
                          color: '#ffffff',
                          backgroundColor: 'transparent',
                          '&:hover': {
                            backgroundColor: '#374151',
                            borderLeft: '3px solid #22c55e',
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{
                          fontWeight: 500,
                          fontSize: '1rem'
                        }}>
                          Masivo
                        </Typography>
                      </MenuItem>
                    </Menu>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 auto' }, maxWidth: { xs: '100%', md: '360px' }, width: { xs: '100%', md: 'auto' } }}>
                    <SearchInput
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Buscar productos"
                      debounceMs={0}
                    />
                  </Box>
                </Stack>
              </Box>

              {productsQuery.isLoading ? (
                <Box sx={{ textAlign: 'center', paddingY: 4 }}>
                  <LoadingSpinner color="success" size="large" />
                </Box>
              ) : productsQuery.isError ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 3,
                    px: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    <Box
                      component="svg"
                      sx={{
                        width: 24,
                        height: 24,
                        color: '#ef4444',
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      mb: 2,
                      maxWidth: '300px',
                    }}
                  >
                    Error al cargar los productos
                  </Typography>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => productsQuery.refetch()}
                    sx={{
                      fontSize: '0.8125rem',
                      px: 2,
                      py: 0.75,
                    }}
                  >
                    Reintentar
                  </Button>
                </Box>
              ) : tableData.length === 0 ? (
                <EmptyState
                  title="No tienes productos cargados aún"
                  message="Crea tu primer producto para empezar a vender."
                  action={
                    <Button variant="primary" onClick={handleUploadProduct}>
                      Crear tu primer producto
                    </Button>
                  }
                />
              ) : (
            <Box sx={{ position: 'relative' }}>
              <DataTable
                key={tableKey}
                id="products-table"
                columns={columns}
                data={tableData}
                className="shadow-lg"
                externalSearchTerm={searchTerm}
                searching={false}
              />
              {actionLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.25)',
                        borderRadius: '1rem'
                      }}
                >
                  <LoadingSpinner color="inherit" />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Stack>
          </Box>
      </Container>
    </Box>
  );
};