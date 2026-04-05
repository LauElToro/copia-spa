"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Grid, Stack, Typography, CircularProgress, Button as MuiButton, Menu, MenuItem, IconButton, Collapse, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import { Close as CloseIcon, ExpandMore, ExpandLess } from "@mui/icons-material";
import { ListAlt, PeopleAlt, CalendarToday, AttachMoney, CheckCircle, CreditCard, KeyboardArrowDown, Warning, Receipt } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { plansData, Plan } from "@/presentation/@shared/components/ui/molecules/plan-card/plans-data";
import PlansGrid from "@/presentation/sellers/components/plans-grid/plans-grid";
import { defaultFeatures } from "@/presentation/sellers/components/plans-grid/types";
import { useModal } from '@/presentation/@shared/hooks/use-modal';
import PlanDetailContent from '@/presentation/sellers/components/plan-detail-content/plan-detail-content';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useUserProfile } from '@/presentation/@shared/hooks/use-user-profile';
import { useSubscription } from '@/presentation/@shared/hooks/use-subscription';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { axiosHelper } from '@/presentation/@shared/helpers/axios-helper';
import { formatPlanNameForDisplay } from '@/presentation/@shared/helpers/plan-display';

type Tab = "plan" | "planes";

function generateReceiptHtml(
  plan: { name: string; start: string; end: string; cost: string; benefits: string[] },
  userProfile: { id?: string; name?: string; email?: string } | null
): string {
  const userName = userProfile?.name || 'Usuario';
  const userEmail = userProfile?.email || '';
  const benefitsList = plan.benefits.map((b) => `<li>${b}</li>`).join('');
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante - ${formatPlanNameForDisplay(plan.name)}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
    h1 { color: #22c55e; }
    .section { margin: 20px 0; }
    .label { font-weight: bold; color: #666; }
    ul { padding-left: 20px; }
    .footer { margin-top: 40px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>Liberty Club - Comprobante de Suscripción</h1>
  <div class="section">
    <p class="label">Datos de cuenta</p>
    <p>Nombre: ${userName}</p>
    <p>Email: ${userEmail}</p>
  </div>
  <div class="section">
    <p class="label">Plan</p>
    <p>${formatPlanNameForDisplay(plan.name)}</p>
    <p>Fecha de inicio: ${plan.start}</p>
    <p>Vencimiento: ${plan.end}</p>
    <p>Costo: ${plan.cost}</p>
  </div>
  <div class="section">
    <p class="label">Beneficios incluidos</p>
    <ul>${benefitsList}</ul>
  </div>
  <div class="footer">
    <p>Documento generado el ${new Date().toLocaleDateString('es-AR')} - Liberty Club</p>
    <p>Para guardar como PDF: Ctrl+P (Windows) o Cmd+P (Mac) y seleccione "Guardar como PDF".</p>
  </div>
</body>
</html>`;
}

export default function ConfigurationSubscriptionPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("plan");
  const [isCancelling, setIsCancelling] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { openModal, closeModal } = useModal();

  const { userProfile } = useUserProfile();
  const { subscription, downgrade, isDowngrading, refetch } = useSubscription(userProfile?.id);
  const toast = useToast();
  const benefitsStarter = plansData[0].benefits;
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  const { data: paymentHistory = [] } = useQuery({
    queryKey: ['payments', 'uala', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      const res = await axiosHelper.payments.getUalaPaymentsByUserId(userProfile.id);
      const payload = res.data as { data?: Array<{ id?: string; amount?: number; currency?: string; status?: string; createdAt?: string }> };
      return payload?.data ?? [];
    },
    enabled: !!userProfile?.id && showPaymentHistory,
  });

  const currentPlan = useMemo(() => {
    const subPlan = subscription?.plan;
    if (subPlan) {
      const start = subscription.startDate?.split('T')[0] ?? '';
      const end = subscription.endDate?.split('T')[0] ?? '';
      const costStr = subscription.cost
        ? `${subscription.cost} ${subscription.currency || 'USD'}`
        : subPlan?.price
          ? `${subPlan.price} ${subPlan.currency || 'USD'}`
          : 'Gratuito';
      const planBenefits =
        plansData.find(
          (p) =>
            formatPlanNameForDisplay(p.name) === formatPlanNameForDisplay(subPlan.name)
        )?.benefits ?? benefitsStarter;
      return {
        name: subPlan.name,
        planName: subPlan.name,
        displayName: formatPlanNameForDisplay(subPlan.name),
        period: subscription.period ?? ('monthly' as const),
        start,
        end,
        cost: costStr,
        benefits: planBenefits,
      };
    }
    return {
      name: 'Plan Starter',
      planName: 'Plan Starter',
      displayName: 'Plan Starter',
      period: 'monthly' as const,
      start: '',
      end: '',
      cost: 'Gratuito',
      benefits: benefitsStarter,
    };
  }, [subscription, benefitsStarter]);

  const handleOpenPlan = (plan: Plan) => {
    openModal(
      <PlanDetailContent
        plan={plan}
        mode="change"
        onDowngradeConfirm={handleDowngradeToStarter}
      />,
      { maxWidth: 'md' }
    );
  };

  const handleDowngradeToStarter = useCallback(async () => {
    if (!userProfile?.id) {
      toast.error('Debe iniciar sesión para realizar esta acción.');
      return;
    }
    try {
      await downgrade(userProfile.id);
      await refetch();
      toast.success('Su cuenta ha sido degradada al Plan Starter.');
      closeModal();
    } catch (error) {
      console.error('Error al degradar:', error);
      toast.error('No se pudo completar la degradación. Intente nuevamente.');
    }
  }, [toast, closeModal, userProfile?.id, downgrade, refetch]);

  const handleRenewPlan = useCallback(() => {
    setAnchorEl(null);
    router.push(
      `/admin/panel/checkout-plan?plan=${encodeURIComponent(currentPlan.planName)}&period=${currentPlan.period}`
    );
  }, [router, currentPlan.planName, currentPlan.period]);

  const handleChangePlan = useCallback(() => {
    setAnchorEl(null);
    setTab("planes");
  }, []);

  const handleDownloadReceipt = useCallback(() => {
    setAnchorEl(null);
    const receiptContent = generateReceiptHtml(currentPlan, userProfile ?? null);
    const blob = new Blob([receiptContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprobante-${currentPlan.displayName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Comprobante descargado. Abra el archivo y use Ctrl+P (o Cmd+P) para imprimirlo como PDF.');
  }, [currentPlan, userProfile, toast]);

  const handleCancelSubscription = useCallback(() => {
    const handleConfirm = async () => {
      try {
        setIsCancelling(true);
        await handleDowngradeToStarter();
      } catch (error) {
        console.error('Error al cancelar suscripción:', error);
        toast.error('No se pudo cancelar la suscripción.');
      } finally {
        setIsCancelling(false);
      }
    };

    openModal(
      <Box
          sx={{
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          color: "#fff",
          py: 2,
          }}
        >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            px: { xs: 2, sm: 3, md: 4 },
            position: 'relative',
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={closeModal}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

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
            {t.admin?.cancelSubscription || "Cancelar Suscripción"}: {currentPlan.displayName}
          </Typography>

          {/* Plan Section */}
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 500,
                mb: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              PLAN
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                lineHeight: 1.6,
                color: "#34d399",
                fontWeight: 600,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {currentPlan.displayName}
            </Typography>
          </Box>

          {/* Mensaje de confirmación */}
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                lineHeight: 1.6,
                color: "#ffffff",
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Perderá los beneficios de su cuenta y el asistente IA. Su tienda pasará al plan gratuito (Starter). Esta acción no se puede deshacer. ¿Desea continuar?
            </Typography>
          </Box>

          {/* Action Buttons Section */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
            <MuiButton
              type="button"
              onClick={closeModal}
              variant="outlined"
              disabled={isCancelling}
              sx={{
                px: 4,
                py: 1.5,
                borderWidth: '2px !important',
                borderColor: '#ef4444 !important',
                borderStyle: 'solid !important',
                color: '#ef4444 !important',
                backgroundColor: 'transparent !important',
                fontSize: '1rem',
                fontWeight: 600,
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
            </MuiButton>
            <MuiButton
              type="button"
              onClick={handleConfirm}
              variant="contained"
              disabled={isCancelling}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: isCancelling ? '#374151' : '#ef4444',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none !important',
                '&:hover': {
                  backgroundColor: isCancelling ? '#374151' : '#dc2626',
                  boxShadow: 'none !important',
                },
                '&:disabled': {
                  backgroundColor: '#374151',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
            }}
          >
              {isCancelling ? (
              <>
                <CircularProgress size={16} sx={{ color: 'inherit', mr: 1 }} />
                {t.admin?.cancelling || 'Cancelando...'}
              </>
            ) : (
                t.admin?.cancelSubscription || 'Cancelar Suscripción'
            )}
            </MuiButton>
          </Box>
        </Box>
      </Box>,
      {
        maxWidth: 'sm',
      }
    );
  }, [openModal, closeModal, handleDowngradeToStarter, toast, currentPlan.displayName, t.admin?.cancelSubscription, t.admin?.cancelling]);

  // Calcular métricas del plan actual (Plan Starter sin fechas muestra "—")
  const planMetrics = useMemo(() => {
    const hasValidDates = currentPlan.start && currentPlan.end && !isNaN(new Date(currentPlan.start).getTime()) && !isNaN(new Date(currentPlan.end).getTime());
    let daysRemaining: number | null = null;
    let progressPercentage: number | null = null;

    if (hasValidDates) {
      const startDate = new Date(currentPlan.start);
      const endDate = new Date(currentPlan.end);
      const today = new Date();
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      progressPercentage = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;
    }

    return [
      { icon: CalendarToday, label: t.admin?.remainingDays || 'Días restantes', value: daysRemaining !== null ? daysRemaining.toString() : '—', valueRaw: daysRemaining, color: '#34d399' },
      { icon: AttachMoney, label: 'Costo del plan', value: currentPlan.cost, valueRaw: null, color: '#29C480' },
      { icon: CheckCircle, label: t.admin?.activeBenefits || 'Beneficios activos', value: currentPlan.benefits.length.toString(), valueRaw: null, color: '#3b82f6' },
      { icon: CreditCard, label: 'Progreso del plan', value: progressPercentage !== null ? `${progressPercentage}%` : '—', valueRaw: progressPercentage, color: '#8b5cf6' },
    ];
  }, [currentPlan, t.admin?.activeBenefits, t.admin?.remainingDays]);

  const daysRemainingForBanner = planMetrics[0]?.valueRaw as number | null;
  const showExpirationBanner =
    daysRemainingForBanner !== null &&
    daysRemainingForBanner <= 30 &&
    formatPlanNameForDisplay(currentPlan.planName) !== 'Plan Starter';

  const renderBenefits = (benefits: string[]) => (
    <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {benefits.map((benefit, index) => (
        <Box
          component="li"
          key={`benefit-${index}-${benefit.substring(0, 20)}`}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            mb: 1.5,
            "&:last-child": { mb: 0 },
          }}
        >
          <Box
            component="span"
            sx={{
              color: "#34d399",
              fontSize: "1.125rem",
              mr: 1.5,
              mt: 0.25,
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ✓
          </Box>
          <Typography
            sx={{
              fontSize: { xs: "0.8125rem", md: "0.875rem" },
              lineHeight: 1.6,
              color: "#ffffff",
              opacity: 0.9,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {benefit}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: "100%",
        backgroundColor: '#000000',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: 'Configuración de Suscripción' }
              ]}
            />

            {/* Banner de vencimiento próximo */}
            {showExpirationBanner && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: daysRemainingForBanner! <= 7 ? 'error.main' : 'warning.main',
                  backgroundColor: daysRemainingForBanner! <= 7 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                }}
              >
                <Warning sx={{ color: daysRemainingForBanner! <= 7 ? '#ef4444' : '#fbbf24', fontSize: 32 }} />
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#ffffff' }}>
                    {daysRemainingForBanner! <= 7
                      ? '¡Tu plan vence en menos de una semana!'
                      : 'Tu plan vence pronto'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                    {daysRemainingForBanner === 0
                      ? 'Tu plan vence hoy. Renueva para no perder beneficios.'
                      : `Te quedan ${daysRemainingForBanner} día${daysRemainingForBanner === 1 ? '' : 's'}. Renueva desde el menú Acciones.`}
                  </Typography>
                </Box>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRenewPlan}
                  sx={{ ml: 'auto', flexShrink: 0 }}
                >
                  Renovar ahora
                </Button>
              </Box>
            )}

              {/* Plan actual */}
              {tab === "plan" && (
                <>
                  {/* Métricas del plan */}
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
                    mb: 3,
                  }}
                >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", md: "center" },
                        gap: 2,
                        mb: 1,
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
                      Resumen de tu plan
                    </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <MuiButton
                          onClick={() => setTab("plan")}
                          sx={{
                            px: 4,
                            py: 1.5,
                            backgroundColor: tab === "plan" ? "#29C480" : "transparent",
                            color: tab === "plan" ? "#1e293b" : "#29C480",
                            fontWeight: 600,
                            borderRadius: "8px",
                            textTransform: "none",
                            fontSize: "1rem",
                            transition: "background-color 0.3s ease, color 0.3s ease",
                            border: tab === "plan" ? "none" : "1px solid",
                            borderColor: "#29C480",
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            "&:hover": {
                              backgroundColor: tab === "plan" ? "#ffffff" : "rgba(41, 196, 128, 0.1)",
                              color: tab === "plan" ? "#000000" : "#29C480",
                            },
                            "& .MuiSvgIcon-root": {
                              transition: "transform 0.3s ease"
                            },
                            "&:hover .MuiSvgIcon-root": {
                              transform: "translateX(4px)"
                            }
                          }}
                        >
                          Mi Plan
                          <ListAlt sx={{ fontSize: '1rem' }} />
                        </MuiButton>
                        <MuiButton
                          variant="outlined"
                          onClick={() => setTab("planes")}
                          sx={{
                            px: 4,
                            py: 1.5,
                            backgroundColor: "transparent",
                            color: "#29C480",
                            fontWeight: 600,
                            borderRadius: "8px",
                            textTransform: "none",
                            fontSize: "1rem",
                            transition: "all 0.3s ease",
                            border: "1px solid",
                            borderColor: "#29C480",
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            "&:hover": {
                              backgroundColor: "rgba(41, 196, 128, 0.1)",
                              color: "#29C480",
                              borderColor: "#29C480",
                            },
                            "& .MuiSvgIcon-root": {
                              transition: "transform 0.3s ease"
                            },
                            "&:hover .MuiSvgIcon-root": {
                              transform: "translateX(4px)"
                            }
                          }}
                        >
                          Planes
                          <PeopleAlt sx={{ fontSize: '1rem' }} />
                        </MuiButton>
                      </Stack>
                    </Box>
                    
                    <Grid container spacing={2}>
                      {planMetrics.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                          <Grid size={{ xs: 6, sm: 3 }} key={index}>
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

                  {/* Detalles del plan actual */}
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
                        Tu plan actual: {currentPlan.displayName}
                      </Typography>
                      <Button
                        variant="primary"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 20px',
                          minWidth: 'auto',
                          width: 'auto',
                          color: '#000000 !important',
                          height: '44px',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          textShadow: 'none !important',
                          '&:hover': {
                            color: '#000000 !important',
                            backgroundColor: '#ffffff !important',
                            textShadow: 'none !important',
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                          Acciones
                        </Typography>
                        <KeyboardArrowDown
                          style={{
                            transition: 'transform 500ms ease',
                            transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                            fontSize: '1rem',
                            marginLeft: '4px'
                          }}
                        />
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        sx={{
                          '& .MuiPaper-root': {
                            background: '#111827',
                            borderRadius: '0px',
                            mt: 2,
                            minWidth: 340,
                            maxWidth: 380,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                            border: 'none',
                          },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      >
                        <MenuItem
                          onClick={handleDownloadReceipt}
                          sx={{
                            px: 2,
                            py: 2,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            borderLeft: '3px solid transparent',
                            cursor: 'pointer',
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: '#374151',
                              borderLeftColor: '#22c55e',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{
                            fontWeight: 500,
                            fontSize: '1rem'
                          }}>
                            Descargar Comprobante
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={handleRenewPlan}
                          sx={{
                            px: 2,
                            py: 2,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            borderLeft: '3px solid transparent',
                            cursor: 'pointer',
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: '#374151',
                              borderLeftColor: '#22c55e',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{
                            fontWeight: 500,
                            fontSize: '1rem'
                          }}>
                            Renovar plan
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={handleChangePlan}
                          sx={{
                            px: 2,
                            py: 2,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            borderLeft: '3px solid transparent',
                            cursor: 'pointer',
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: '#374151',
                              borderLeftColor: '#22c55e',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{
                            fontWeight: 500,
                            fontSize: '1rem'
                          }}>
                            Cambiar de plan
                          </Typography>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setAnchorEl(null);
                            handleCancelSubscription();
                          }}
                          sx={{
                            px: 2,
                            py: 2,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            borderLeft: '3px solid transparent',
                            cursor: 'pointer',
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: '#374151',
                              borderLeftColor: '#ef4444',
                              color: '#ef4444',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{
                            fontWeight: 500,
                            fontSize: '1rem'
                          }}>
                            {t.admin?.cancelSubscription || "Cancelar Suscripción"}
                          </Typography>
                        </MenuItem>
                      </Menu>
                    </Box>

                    <Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontSize: { xs: '1rem', md: '1.125rem' },
                          fontWeight: 700,
                          color: '#34d399',
                          mb: 2,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        Beneficios
                      </Typography>
                      {renderBenefits(currentPlan.benefits)}
                    </Box>
                    
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                          sx={{
                            padding: 2,
                            background: 'rgba(41, 196, 128, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(41, 196, 128, 0.1)',
                          }}
                        >
                          <Text sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', mb: 0.5 }}>Fecha de inicio:</Text>
                          <Text weight="bold" sx={{ color: '#ffffff', fontSize: '1rem' }}>{currentPlan.start}</Text>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                          sx={{
                            padding: 2,
                            background: 'rgba(41, 196, 128, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(41, 196, 128, 0.1)',
                          }}
                        >
                          <Text sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', mb: 0.5 }}>Vencimiento:</Text>
                          <Text weight="bold" sx={{ color: '#ffffff', fontSize: '1rem' }}>{currentPlan.end}</Text>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                          sx={{
                            padding: 2,
                            background: 'rgba(41, 196, 128, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(41, 196, 128, 0.1)',
                          }}
                        >
                          <Text sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', mb: 0.5 }}>Costo del plan:</Text>
                          <Text weight="bold" sx={{ color: '#ffffff', fontSize: '1rem' }}>{currentPlan.cost}</Text>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Historial de pagos */}
                  <Box
                    sx={{
                      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                      border: "2px solid rgba(41, 196, 128, 0.1)",
                      borderRadius: "24px",
                      overflow: "hidden",
                      padding: { xs: 2, md: 3 },
                    }}
                  >
                    <MuiButton
                      fullWidth
                      onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "#34d399",
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Receipt />
                        Historial de pagos (Ualá)
                      </Box>
                      {showPaymentHistory ? <ExpandLess /> : <ExpandMore />}
                    </MuiButton>
                    <Collapse in={showPaymentHistory}>
                      <Box sx={{ mt: 2 }}>
                        {paymentHistory.length === 0 ? (
                          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>
                            No hay pagos registrados o la información se está cargando.
                          </Typography>
                        ) : (
                          <Table size="small" sx={{ "& .MuiTableCell-root": { color: "#ffffff", borderColor: "rgba(255,255,255,0.1)" } }}>
                            <TableHead>
                              <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Monto</TableCell>
                                <TableCell>Estado</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {paymentHistory.map((p: { id?: string; amount?: number; currency?: string; status?: string; createdAt?: string }) => (
                                <TableRow key={p.id ?? p.createdAt ?? Math.random()}>
                                  <TableCell sx={{ fontSize: "0.875rem" }}>
                                    {p.createdAt
                                      ? new Date(p.createdAt).toLocaleDateString("es-AR", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "—"}
                                  </TableCell>
                                  <TableCell sx={{ fontSize: "0.875rem" }}>
                                    {p.amount != null
                                      ? `${p.amount} ${p.currency ?? "ARS"}`
                                      : "—"}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={p.status ?? "—"}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          p.status === "approved"
                                            ? "rgba(34, 197, 94, 0.2)"
                                            : p.status === "pending"
                                              ? "rgba(251, 191, 36, 0.2)"
                                              : "rgba(239, 68, 68, 0.2)",
                                        color:
                                          p.status === "approved"
                                            ? "#22c55e"
                                            : p.status === "pending"
                                              ? "#fbbf24"
                                              : "#ef4444",
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                </>
              )}

              {/* Planes - mismo diseño que landing */}
              {tab === "planes" && (
                <>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      mb: 2,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Planes disponibles
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      color: 'rgba(255,255,255,0.9)',
                      mb: 3,
                      maxWidth: 600,
                    }}
                  >
                    Elige el plan ideal para tu negocio
                  </Typography>
                  <PlansGrid
                    plans={plansData.map((p) => ({
                      name: p.name,
                      price: p.price === 'Gratuito' ? 'Gratuito' : (p.monthly || p.price || ''),
                      trial: p.benefits?.[0] ?? 'Ver beneficios',
                      label:
                        p.name === 'Plan Liberty'
                          ? 'RECOMENDADO'
                          : formatPlanNameForDisplay(p.name) === formatPlanNameForDisplay(currentPlan.planName)
                            ? (t.admin?.currentPlan || 'Plan actual')
                            : undefined,
                    }))}
                    features={defaultFeatures}
                    onOpenPlan={(index) => handleOpenPlan(plansData[index])}
                    ctaLabel={t.admin?.viewPlan || 'Ver plan'}
                  />
                </>
              )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

