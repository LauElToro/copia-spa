"use client";

import React, { useMemo, useState, useCallback } from 'react';
import { Box, Container, Stack, Typography, CircularProgress, Grid, Button as MuiButton } from '@mui/material';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import DataTable from '@/presentation/@shared/components/ui/atoms/table/table';
import { Checkbox } from "@/presentation/@shared/components/ui/atoms/checkbox";
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { IconButton } from "@/presentation/@shared/components/ui/atoms/icon-button";
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { SearchInput } from '@/presentation/@shared/components/ui/atoms/search-input';
import { ContentCopy as CopyIcon, People, AttachMoney, History } from "@mui/icons-material";
import { useAmbassador } from "@/presentation/@shared/hooks/use-ambassador";
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';


const AmbassadorPage: React.FC = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'referrals' | 'earnings' | 'history'>('referrals');
  const [searchTerm, setSearchTerm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const toast = useToast();
  const normalizedSearch = searchTerm.trim();
  
  const { profile, referrals, earnings, payouts, activate } = useAmbassador({
    referrals: { page: 1, pageSize: 100, search: normalizedSearch || undefined }
  });

  const referralList = useMemo(() => referrals.data?.items ?? [], [referrals.data?.items]);
  const payoutsData = useMemo(() => payouts.data ?? [], [payouts.data]);

  const notActivated = useMemo(
    () => !profile.isLoading && !profile.data,
    [profile.isLoading, profile.data]
  );

  const referralCode = useMemo(() => {
    const code = profile.data?.code;
    if (code && code.trim().length > 0) return code;
    const link = profile.data?.shareLink ?? "";
    try {
      if (!link) return "-";
      const url = new URL(link, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      const qp = url.searchParams;
      const byParam = qp.get('ref') || qp.get('code') || qp.get('c');
      if (byParam) return byParam;
      const segments = url.pathname.split('/').filter(Boolean);
      return segments.length ? segments[segments.length - 1] : "-";
    } catch {
      return "-";
    }
  }, [profile.data?.code, profile.data?.shareLink]);

  // Copiar código al portapapeles
  const handleCopyCode = async () => {
    if (referralCode === "-") return;

    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success('Código copiado al portapapeles', { position: 'bottom-center' });
    } catch (error) {
      console.error('Error al copiar código:', error);
      toast.error('No se pudo copiar el código', { position: 'bottom-center' });
    }
  };

  const earningsData = useMemo(
    () =>
      earnings.data ?? {
        month: "",
        initialUSD: 0,
        residualUSD: 0,
        bonusesUSD: 0,
        lifetimeUSD: 0
      },
    [earnings.data]
  );

  const handleReferralsTab = useCallback(() => {
    setTab('referrals');
  }, []);

  const handleEarningsTab = useCallback(() => {
    setTab('earnings');
  }, []);

  const handleHistoryTab = useCallback(() => {
    setTab('history');
  }, []);

  // Columnas para referidos
  const referralsColumns: DataTableColumn[] = useMemo(() => [
    { title: "ID DE COMERCIO", data: "id", responsivePriority: 1 },
    { title: "NOMBRE", data: "name", responsivePriority: 1, searchable: true },
    { title: "PLAN", data: "plan", responsivePriority: 1, searchable: true },
    { title: "PRECIO", data: "price", responsivePriority: 1 },
    { title: "FECHA DE SUSCRIPCIÓN", data: "date", responsivePriority: 1, searchable: true },
  ], []);

  // Columnas para historial
  const historyColumns: DataTableColumn[] = useMemo(() => [
    { title: "ID", data: "id", responsivePriority: 1 },
    { title: "CICLO", data: "cycle", responsivePriority: 1, searchable: true },
    { title: "MONTO (USD)", data: "amount", responsivePriority: 1 },
    { title: "FECHA PAGO", data: "date", responsivePriority: 1, searchable: true },
    {
      title: "ESTADO",
      data: "status",
      responsivePriority: 1,
      type: 'html',
      render: function (data: unknown, type: string) {
        if (type === 'display') {
          const status = String(data || '');
          const isPaid = status.toLowerCase() === 'paid';
          const bgColor = isPaid ? 'rgba(41, 196, 128, 0.2)' : 'rgba(101, 116, 45, 0.3)';
          const borderColor = isPaid ? '#29C480' : '#D4AF37';
          const textColor = isPaid ? '#29C480' : '#D4AF37';
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
              text-transform: capitalize;
            ">
              ${status}
            </div>
          `;
        }
        return data as string;
      },
    },
  ], []);

  // Datos formateados para referidos
  const referralsData = useMemo(() => {
    return referralList.map((row) => ({
      id: row.id,
      name: row.name || row.email || '-',
      plan: row.plan || '-',
      price: row.planValue !== undefined && row.planValue !== null
        ? `$${Number(row.planValue).toFixed(2)}`
        : '-',
      date: row.firstPaymentAt 
        ? new Date(row.firstPaymentAt).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : '-',
    }));
  }, [referralList]);

  // Datos formateados para historial
  const historyData = useMemo(() => {
    return payoutsData.map((row) => ({
      id: row.id,
      cycle: row.cycle || '-',
      amount: row.amountUSD.toFixed(2),
      date: row.paidAt 
        ? new Date(row.paidAt).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : '-',
      status: row.status || 'pending',
    }));
  }, [payoutsData]);

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
                { label: 'Embajador' }
              ]}
            />
            {/* Activación de embajador */}
            {profile.isLoading && (
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  width: '100%',
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{
                    color: '#29C480',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    }
                  }}
                />
              </Box>
            )}

            {!profile.isLoading && notActivated && (
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
                <Stack spacing={3}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Activa tu cuenta de Embajador
                  </Typography>
                  <Text 
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.875rem'
                    }}
                  >
                    Para comenzar a referir y generar comisiones debes aceptar los Términos y Condiciones del programa.
                  </Text>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      id="tyc"
                      checked={acceptTerms}
                      onChange={() => setAcceptTerms(v => !v)}
                    />
                    <Text variant="label" htmlFor="tyc" sx={{ cursor: 'pointer' }}>
                      Acepto los Términos y Condiciones del Programa de Embajadores
                    </Text>
                  </Box>
                  <MuiButton
                    disabled={!acceptTerms || activate.isPending}
                    onClick={() => activate.mutate(true)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      minHeight: '56px',
                      backgroundColor: !acceptTerms || activate.isPending ? "rgba(41, 196, 128, 0.3)" : "#29C480",
                      color: "#1e293b",
                      fontWeight: 600,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "1rem",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                      "&:hover": {
                        backgroundColor: !acceptTerms || activate.isPending ? "rgba(41, 196, 128, 0.3)" : "#ffffff",
                        color: "#000000",
                      },
                      "&:disabled": {
                        backgroundColor: "rgba(41, 196, 128, 0.3)",
                        color: "rgba(30, 41, 59, 0.5)",
                      },
                    }}
                  >
                    {activate.isPending ? 'Activando...' : 'Activar Embajador'}
                  </MuiButton>
                </Stack>
              </Box>
            )}

            {/* Main Content */}
            {!profile.isLoading && !notActivated && (
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
                {/* Título, búsqueda y tabs */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'flex-start',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                    width: '100%',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      flex: { md: '0 0 auto' }
                    }}
                  >
                    {tab === "referrals" ? (t.admin?.referrals || "Referidos") : tab === "earnings" ? "Ganancias" : "Historial"}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'stretch', md: 'center' },
                      gap: 2,
                      flex: { md: '1 1 auto' },
                      justifyContent: { md: 'flex-end' }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                      }}
                    >
                      <MuiButton
                        onClick={handleReferralsTab}
                        endIcon={<People sx={{ fontSize: '1rem' }} />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          minHeight: '56px',
                          backgroundColor: tab === 'referrals' ? "#29C480" : "transparent",
                          color: tab === 'referrals' ? "#1e293b" : "#29C480",
                          fontWeight: 600,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "1rem",
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          border: tab === 'referrals' ? "none" : "1px solid",
                          borderColor: "#29C480",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          "&:hover": {
                            backgroundColor: tab === 'referrals' ? "#ffffff" : "rgba(41, 196, 128, 0.1)",
                            color: tab === 'referrals' ? "#000000" : "#29C480",
                          },
                          "& .MuiSvgIcon-root": {
                            transition: "transform 0.3s ease"
                          },
                          "&:hover .MuiSvgIcon-root": {
                            transform: "translateX(4px)"
                          }
                        }}
                      >
                        Referidos
                      </MuiButton>
                      <MuiButton
                        onClick={handleEarningsTab}
                        endIcon={<AttachMoney sx={{ fontSize: '1rem' }} />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          minHeight: '56px',
                          backgroundColor: tab === 'earnings' ? "#29C480" : "transparent",
                          color: tab === 'earnings' ? "#1e293b" : "#29C480",
                          fontWeight: 600,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "1rem",
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          border: tab === 'earnings' ? "none" : "1px solid",
                          borderColor: "#29C480",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          "&:hover": {
                            backgroundColor: tab === 'earnings' ? "#ffffff" : "rgba(41, 196, 128, 0.1)",
                            color: tab === 'earnings' ? "#000000" : "#29C480",
                          },
                          "& .MuiSvgIcon-root": {
                            transition: "transform 0.3s ease"
                          },
                          "&:hover .MuiSvgIcon-root": {
                            transform: "translateX(4px)"
                          }
                        }}
                      >
                        Ganancia
                      </MuiButton>
                      <MuiButton
                        onClick={handleHistoryTab}
                        endIcon={<History sx={{ fontSize: '1rem' }} />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          minHeight: '56px',
                          backgroundColor: tab === 'history' ? "#29C480" : "transparent",
                          color: tab === 'history' ? "#1e293b" : "#29C480",
                          fontWeight: 600,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "1rem",
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          border: tab === 'history' ? "none" : "1px solid",
                          borderColor: "#29C480",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          "&:hover": {
                            backgroundColor: tab === 'history' ? "#ffffff" : "rgba(41, 196, 128, 0.1)",
                            color: tab === 'history' ? "#000000" : "#29C480",
                          },
                          "& .MuiSvgIcon-root": {
                            transition: "transform 0.3s ease"
                          },
                          "&:hover .MuiSvgIcon-root": {
                            transform: "translateX(4px)"
                          }
                        }}
                      >
                        Historial
                      </MuiButton>
                      </Box>
                    {(tab === "referrals" || tab === "history") && (
                      <Box sx={{ flex: { md: '0 0 auto' }, maxWidth: { xs: '100%', md: '360px' }, width: { xs: '100%', md: 'auto' } }}>
                        <SearchInput
                          value={searchTerm}
                          onChange={setSearchTerm}
                          placeholder={tab === "referrals" ? "Buscar referidos..." : "Buscar historial..."}
                          debounceMs={300}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Referidos Tab */}
                {tab === "referrals" && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Text weight="medium" sx={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Tu código de referido:                         <Text 
                          component="span" 
                          sx={{ 
                            color: '#29C480',
                            fontSize: '0.875rem', 
                            fontWeight: 600,
                          }}
                        >
                          {referralCode}
                        </Text>
                      </Text>
                      <IconButton
                        onClick={handleCopyCode}
                        aria-label="Copiar código de referido"
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          p: 0.5,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            color: '#29C480',
                            backgroundColor: 'rgba(41, 196, 128, 0.1)'
                          }
                        }}
                        size="small"
                      >
                        <CopyIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </Box>

                    {referrals.isLoading && (
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '400px',
                          width: '100%',
                        }}
                      >
                        <CircularProgress
                          size={60}
                          thickness={4}
                          sx={{
                            color: '#29C480',
                            '& .MuiCircularProgress-circle': {
                              strokeLinecap: 'round',
                            }
                          }}
                        />
                      </Box>
                    )}

                    {referrals.isError && (
                      <Box sx={{ textAlign: 'center', paddingY: 4 }}>
                        <Stack spacing={3} alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{ 
                              color: '#ef4444', 
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              maxWidth: '600px',
                              lineHeight: 1.6,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            Error al cargar los referidos: {referrals.error instanceof Error ? referrals.error.message : 'Error desconocido'}
                          </Typography>
                          <MuiButton
                            onClick={() => referrals.refetch()}
                            sx={{
                              px: 4,
                              py: 1.5,
                              minHeight: '56px',
                              backgroundColor: "#29C480",
                              color: "#1e293b",
                              fontWeight: 600,
                              borderRadius: "8px",
                              textTransform: "none",
                              fontSize: "1rem",
                              transition: "background-color 0.3s ease, color 0.3s ease",
                              "&:hover": {
                                backgroundColor: "#ffffff",
                                color: "#000000",
                              },
                            }}
                          >
                            Reintentar
                          </MuiButton>
                        </Stack>
                      </Box>
                    )}

                    {!referrals.isLoading && !referrals.isError && (
                      <>
                        {referralsData.length === 0 ? (
                          <EmptyState
                            title="Aún no tienes referidos"
                            message="Cuando alguien se registre usando tu código de referido, aparecerán aquí."
                          />
                        ) : (
                          <DataTable
                            id="referrals-table"
                            columns={referralsColumns}
                            data={referralsData as Record<string, unknown>[]}
                            className="shadow-lg"
                            searching={false}
                            externalSearchTerm={searchTerm}
                            isLoading={referrals.isLoading}
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Earnings Tab */}
                {tab === "earnings" && (
                  <>
                    {earnings.isLoading && (
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '400px',
                          width: '100%',
                        }}
                      >
                        <CircularProgress
                          size={60}
                          thickness={4}
                          sx={{
                            color: '#29C480',
                            '& .MuiCircularProgress-circle': {
                              strokeLinecap: 'round',
                            }
                          }}
                        />
                      </Box>
                    )}

                    {earnings.isError && (
                      <Box sx={{ textAlign: 'center', paddingY: 4 }}>
                        <Stack spacing={3} alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{ 
                              color: '#ef4444', 
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              maxWidth: '600px',
                              lineHeight: 1.6,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            Error al cargar las ganancias: {earnings.error instanceof Error ? earnings.error.message : 'Error desconocido'}
                          </Typography>
                          <MuiButton
                            onClick={() => earnings.refetch()}
                            sx={{
                              px: 4,
                              py: 1.5,
                              minHeight: '56px',
                              backgroundColor: "#29C480",
                              color: "#1e293b",
                              fontWeight: 600,
                              borderRadius: "8px",
                              textTransform: "none",
                              fontSize: "1rem",
                              transition: "background-color 0.3s ease, color 0.3s ease",
                              "&:hover": {
                                backgroundColor: "#ffffff",
                                color: "#000000",
                              },
                            }}
                          >
                            Reintentar
                          </MuiButton>
                        </Stack>
                      </Box>
                    )}

                    {!earnings.isLoading && !earnings.isError && (
                      <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 3 }}>
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
                              variant="body2"
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Inicial USD
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: '#34d399',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              ${earningsData.initialUSD.toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
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
                              variant="body2"
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Residual USD
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: '#34d399',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              ${earningsData.residualUSD.toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
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
                              variant="body2"
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Bonos USD
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: '#34d399',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              ${earningsData.bonusesUSD.toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
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
                              variant="body2"
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Acumulado USD
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: '#34d399',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              ${earningsData.lifetimeUSD.toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                  </>
                )}

                {/* History Tab */}
                {tab === "history" && (
                  <>
                    {payouts.isLoading && (
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '400px',
                          width: '100%',
                        }}
                      >
                        <CircularProgress
                          size={60}
                          thickness={4}
                          sx={{
                            color: '#29C480',
                            '& .MuiCircularProgress-circle': {
                              strokeLinecap: 'round',
                            }
                          }}
                        />
                      </Box>
                    )}

                    {payouts.isError && (
                      <Box sx={{ textAlign: 'center', paddingY: 4 }}>
                        <Stack spacing={3} alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{ 
                              color: '#ef4444', 
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              maxWidth: '600px',
                              lineHeight: 1.6,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            Error al cargar el historial: {payouts.error instanceof Error ? payouts.error.message : 'Error desconocido'}
                          </Typography>
                          <MuiButton
                            onClick={() => payouts.refetch()}
                            sx={{
                              px: 4,
                              py: 1.5,
                              minHeight: '56px',
                              backgroundColor: "#29C480",
                              color: "#1e293b",
                              fontWeight: 600,
                              borderRadius: "8px",
                              textTransform: "none",
                              fontSize: "1rem",
                              transition: "background-color 0.3s ease, color 0.3s ease",
                              "&:hover": {
                                backgroundColor: "#ffffff",
                                color: "#000000",
                              },
                            }}
                          >
                            Reintentar
                          </MuiButton>
                        </Stack>
                      </Box>
                    )}

                    {!payouts.isLoading && !payouts.isError && (
                      <>
                        {historyData.length === 0 ? (
                          <EmptyState
                            title="Sin registros todavía"
                            message="Tu historial de cobros aparecerá aquí cuando recibas pagos."
                          />
                        ) : (
                          <DataTable
                            id="history-table"
                            columns={historyColumns}
                            data={historyData as Record<string, unknown>[]}
                            className="shadow-lg"
                            searching={false}
                            externalSearchTerm={searchTerm}
                            isLoading={payouts.isLoading}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </Box>
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default AmbassadorPage;