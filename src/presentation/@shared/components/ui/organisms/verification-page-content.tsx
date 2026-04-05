/**
 * Verification Page Content Component
 *
 * Generic verification page that supports both KYC and KYB flows.
 * Integrates with ms-account microservice and Sumsub WebSDK.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, Grid } from '@mui/material';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { Icon } from '@/presentation/@shared/components/ui/atoms/icon';
import { LoadingSpinner } from '@/presentation/@shared/components/ui/atoms/loading-spinner';
import { Stack } from '@/presentation/@shared/components/ui/molecules/stack';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { VerificationStatusAlert } from '@/presentation/@shared/components/ui/molecules/verification/verification-status-alert';
import { SumsubContainer } from '@/presentation/@shared/components/ui/molecules/verification/sumsub-container';
import { VerificationRequirements } from '@/presentation/@shared/components/ui/molecules/verification/verification-requirements';
import { useVerification } from '@/presentation/@shared/hooks/use-verification';
import { useUserProfile } from '@/presentation/@shared/hooks/use-user-profile';
import { useAuth } from '@/presentation/@shared/hooks/use-auth';
import { VerificationStatus, VerificationType } from '@/presentation/@shared/types/verification';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

interface VerificationPageContentProps {
  type: VerificationType;
}

export const VerificationPageContent: React.FC<VerificationPageContentProps> = ({ type }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { userProfile } = useUserProfile();
  const [showSDK, setShowSDK] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const storeId = typeof window !== 'undefined' ? localStorage.getItem('storeId') : null;

  const {
    status,
    isLoadingStatus,
    isFetchingStatus,
    initiateAsync,
    isInitiating,
    getTokenAsync,
    isGettingToken,
    refreshStatus} = useVerification(type, storeId || undefined);

  const redirectPath = `/admin/panel/${type}`;
  const pageTitle = type === 'kyc' ? 'Verificación de Identidad' : 'Verificación de Negocio';
  const pageSubtitle = type === 'kyc'
    ? 'Estado de Verificación de Identidad'
    : 'Estado de Verificación de Negocio';
  const startButtonLabel = type === 'kyc'
    ? 'Iniciar Verificación de Identidad'
    : 'Iniciar Verificación de Negocio';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(`/login?redirect=${redirectPath}`);
    }
  }, [isAuthenticated, router, redirectPath]);

  // Auto-start SDK if status is review (in progress)
  useEffect(() => {
    if (status?.status === VerificationStatus.REVIEW && !showSDK) {
      handleStartVerification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.status]);

  /**
   * Handle verification start/continue
   */
  const handleStartVerification = async () => {
    if (!storeId) {
      console.error('Store ID not available');
      return;
    }

    try {
      // Initiate verification if not already started
      if (!status || status.status === VerificationStatus.PENDING) {
        const initiateData = type === 'kyb'
          ? { storeId, businessName: userProfile?.name, email: userProfile?.email }
          : { storeId, email: userProfile?.email };

        await initiateAsync(initiateData);
      }

      // Get access token
      const tokenResponse = await getTokenAsync(storeId);
      if (tokenResponse?.data?.accessToken) {
        setAccessToken(tokenResponse.data.accessToken);
        setShowSDK(true);
      } else {
        console.error('No access token received from server');
      }
    } catch (error) {
      console.error('Error starting verification:', error);
    }
  };

  /**
   * Handle verification completion
   * React Query se encarga del polling automático
   */
  const handleVerificationComplete = async () => {
    setShowSDK(false);
    // Trigger initial refresh - React Query continuará el polling automático
    refreshStatus();
  };

  /**
   * Handle token refresh for SDK
   */
  const handleTokenRefresh = async (): Promise<string> => {
    if (!storeId) {
      throw new Error('Store ID not available');
    }

    const tokenResponse = await getTokenAsync(storeId);
    if (tokenResponse?.data?.accessToken) {
      return tokenResponse.data.accessToken;
    }
    throw new Error('Failed to refresh token');
  };

  /**
   * Get button configuration based on status
   */
  const getButtonConfig = () => {
    if (!status) {
      return { label: 'Iniciar Verificación', disabled: isLoadingStatus, onClick: handleStartVerification };
    }

    switch (status.status) {
      case VerificationStatus.VERIFIED:
        return { label: 'Verificación Completada', disabled: true, icon: 'bi-check-circle' };
      case VerificationStatus.REJECTED:
        if (status.meta?.rejectionInfo?.canRetry) {
          return { label: 'Reintentar Verificación', disabled: false, onClick: handleStartVerification, icon: 'bi-arrow-clockwise' };
        }
        return { label: 'Contactar Soporte', disabled: false, href: 'mailto:soporte@libertyclub.io', icon: 'bi-envelope' };
      case VerificationStatus.REVIEW:
        if (status.meta?.rejectionInfo?.canRetry) {
          return { label: 'Reintentar Verificación', disabled: isInitiating || isGettingToken, onClick: handleStartVerification, icon: 'bi-arrow-clockwise' };
        }
        return { label: 'Continuar Verificación', disabled: isInitiating || isGettingToken, onClick: handleStartVerification };
      case VerificationStatus.PENDING:
      default:
        return { label: startButtonLabel, disabled: isInitiating || isGettingToken, onClick: handleStartVerification };
    }
  };

  const buttonConfig = getButtonConfig();

  // Solo mostrar spinner completo en carga inicial, no durante polling
  if (isLoadingStatus && !status) {
    return (
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          width: "100%",
          backgroundColor: '#000000',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
          <Box sx={{ px: { xs: 3, md: 0 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LoadingSpinner color="success" size="large" />
          </Box>
        </Container>
      </Box>
    );
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
                { label: pageTitle }
              ]}
            />

            {/* Cards Container - 2 Columns */}
            <Grid container spacing={3}>
              {/* Status Card - 30% */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
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
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {pageTitle}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {pageSubtitle}
                  </Typography>

                  {/* Indicador de polling activo (discreto) */}
                  {status?.status === VerificationStatus.REVIEW && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        backgroundColor: 'rgba(31, 59, 80, 0.5)',
                        borderRadius: '1rem',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isFetchingStatus && (
                          <LoadingSpinner color="primary" size="small" />
                        )}
                        <Text 
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.875rem'
                          }}
                        >
                          <strong>Estado:</strong> En revisión • Actualización automática cada 5s
                        </Text>
                      </Box>
                      {isFetchingStatus && (
                        <Text 
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.875rem',
                            fontStyle: 'italic'
                          }}
                        >
                          Verificando...
                        </Text>
                      )}
                    </Box>
                  )}

                  {status && (
                    <VerificationStatusAlert
                      status={status.status}
                      type={type}
                      rejectionInfo={status.meta?.rejectionInfo}
                    />
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, width: '100%' }}>
                    {buttonConfig.href ? (
                      <Button
                        component="a"
                        href={buttonConfig.href}
                        sx={{
                          width: '100%',
                          px: 4,
                          py: 1.5,
                          backgroundColor: "#29C480",
                          color: "#1e293b",
                          fontWeight: 600,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "1rem",
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#ffffff",
                            color: "#000000"
                          }
                        }}
                      >
                        <Icon name="bi-shield-check" color="currentColor" size="md" />
                        {buttonConfig.label}
                      </Button>
                    ) : (
                      <Button
                        disabled={buttonConfig.disabled}
                        onClick={buttonConfig.onClick}
                        sx={{
                          width: '100%',
                          px: 4,
                          py: 1.5,
                          backgroundColor: "#29C480",
                          color: "#1e293b",
                          fontWeight: 600,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "1rem",
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          "&:hover:not(:disabled)": {
                            backgroundColor: "#ffffff",
                            color: "#000000"
                          },
                          "&:disabled": {
                            backgroundColor: 'rgba(41, 196, 128, 0.5)',
                            color: 'rgba(30, 41, 59, 0.5)',
                            cursor: 'not-allowed',
                          }
                        }}
                      >
                        <Icon name="bi-shield-check" color="currentColor" size="md" />
                        {buttonConfig.label}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Requirements Card or SDK Container - 70% */}
              <Grid size={{ xs: 12, md: 9 }}>
                {/* SDK Container (shown when verification is active) */}
                {showSDK && accessToken ? (
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
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
                    <SumsubContainer
                      accessToken={accessToken}
                      verificationType={type}
                      email={userProfile?.email}
                      onComplete={handleVerificationComplete}
                      onTokenRefresh={handleTokenRefresh}
                    />
                  </Box>
                ) : (
                  /* Requirements Card (shown when not verified) */
                  (!status || status.status !== VerificationStatus.VERIFIED) && (
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
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
                      <VerificationRequirements type={type} />
                    </Box>
                  )
                )}
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

