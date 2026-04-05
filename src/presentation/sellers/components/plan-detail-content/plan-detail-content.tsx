"use client";

import React from "react";
import { Box, Typography, IconButton, Button as MuiButton, CircularProgress } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { Plan } from "@/presentation/@shared/components/ui/molecules/plan-card/plans-data";
import { useRouter } from "next/navigation";
import { useModal } from "@/presentation/@shared/hooks/use-modal";
import { formatPlanNameForDisplay } from "@/presentation/@shared/helpers/plan-display";

const DOWNGRADE_WARNING = "Perderá los beneficios de su cuenta actual y el asistente IA. Su tienda pasará al plan gratuito. ¿Desea continuar?";

const DowngradeWarningModal: React.FC<{
  onConfirm?: () => void | Promise<void>;
  onCancel: () => void;
  planName: string;
}> = ({ onConfirm, onCancel, planName }) => {
  const [isDowngrading, setIsDowngrading] = React.useState(false);
  const { closeModal } = useModal();
  const handleConfirm = async () => {
    setIsDowngrading(true);
    try {
      await onConfirm?.();
      closeModal();
    } finally {
      setIsDowngrading(false);
    }
  };
  return (
    <Box sx={{ color: "#fff", py: 2, px: 2, position: "relative" }}>
      <IconButton onClick={onCancel} sx={{ position: "absolute", top: 0, right: 0, color: "#fff" }}>
        <CloseIcon />
      </IconButton>
      <Typography variant="h3" sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#34d399", mb: 2 }}>
        Cambiar a {planName}
      </Typography>
      <Typography sx={{ fontSize: "0.875rem", color: "#ffffff", opacity: 0.9, mb: 3, lineHeight: 1.6 }}>
        {DOWNGRADE_WARNING}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <MuiButton onClick={onCancel} disabled={isDowngrading} variant="outlined" sx={{ color: "#fff", borderColor: "#666" }}>
          Cancelar
        </MuiButton>
        <Button variant="primary" size="md" onClick={handleConfirm} disabled={isDowngrading}>
          {isDowngrading ? (
            <>
              <CircularProgress size={16} sx={{ color: "inherit", mr: 1 }} />
              Procesando...
            </>
          ) : (
            "Confirmar degradación"
          )}
        </Button>
      </Box>
    </Box>
  );
};

export type PlanDetailMode = 'register' | 'change';

interface PlanDetailContentProps {
  plan: Plan;
  mode?: PlanDetailMode;
  onDowngradeConfirm?: () => void | Promise<void>;
}

const PlanDetailContent: React.FC<PlanDetailContentProps> = ({ plan, mode = 'register', onDowngradeConfirm }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const isStarter = formatPlanNameForDisplay(plan.name) === "Plan Starter";
  const displayMonthly = plan.monthly;
  const displayAnnual = plan.annual;
  const displayPrice = plan.price;
  const isChangeMode = mode === 'change';

  const handlePlanSelection = (period: 'monthly' | 'annual') => {
    const planName = plan.name;
    closeModal();
    if (isChangeMode) {
      router.push(`/admin/panel/checkout-plan?plan=${encodeURIComponent(planName)}&period=${period}`);
    } else {
      router.push(`/register?type=seller&plan=${encodeURIComponent(planName)}&period=${period}`);
    }
  };

  const handleStarterClick = () => {
    if (isChangeMode) {
      openModal(
        <DowngradeWarningModal
          onConfirm={onDowngradeConfirm}
          onCancel={closeModal}
          planName={formatPlanNameForDisplay(plan.name)}
        />,
        { maxWidth: 'sm' }
      );
    } else {
      handlePlanSelection('monthly');
    }
  };

  return (
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
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
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
              {formatPlanNameForDisplay(plan.name)}
            </Typography>
            {plan.description && (
              <Typography
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  lineHeight: 1.6,
                  color: "#ffffff",
                  opacity: 0.9,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {plan.description}
              </Typography>
            )}
            {plan.intro && (
              <Typography
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  lineHeight: 1.6,
                  color: "#ffffff",
                  opacity: 0.9,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  mt: plan.description ? 1 : 0,
                }}
              >
                {plan.intro}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "center",
              gap: "5px",
              marginRight: { xs: "0", md: "20px" },
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                color: "#ffffff",
                opacity: 0.9,
                fontWeight: 600,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {t.sellers.value}
            </Typography>
            {isStarter ? (
              <Typography
                sx={{
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                  color: "#34d399",
                  fontWeight: 700,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {displayPrice}
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "flex-start", md: "flex-end" },
                  gap: 0.5,
                }}
              >
                {displayMonthly && (
                  <Typography
                    sx={{
                      fontSize: { xs: "1rem", md: "1.125rem" },
                      color: "#34d399",
                      fontWeight: 700,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    {displayMonthly}
                  </Typography>
                )}
                {displayAnnual && (
                  <Typography
                    sx={{
                      fontSize: { xs: "1rem", md: "1.125rem" },
                      color: "#34d399",
                      fontWeight: 700,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    {displayAnnual}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Benefits Section */}
        <Box>
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
            Beneficios
          </Typography>
          <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {plan.benefits?.map((benefit, index) => (
              <Box
                component="li"
                key={`${plan.name}-benefit-${index}`}
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
        </Box>

        {/* Action Buttons Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            gap: 2,
            alignItems: "center",
            pt: 1,
          }}
        >
          {isStarter ? (
            <Button 
              variant="primary" 
              size="md" 
              sx={{ width: { xs: "100%", sm: "auto" } }}
              onClick={handleStarterClick}
            >
              {isChangeMode ? (t.sellers?.changeToPlan || "Cambiar a este plan") : "Obtener"}
            </Button>
          ) : (
            <>
              {displayMonthly && (
                <Button 
                  variant="primary" 
                  size="md" 
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                  onClick={() => handlePlanSelection('monthly')}
                >
                  {t.sellers.get} {displayMonthly}
                </Button>
              )}
              {displayAnnual && (
                <Button 
                  variant="primary" 
                  size="md" 
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                  onClick={() => handlePlanSelection('annual')}
                >
                  {t.sellers.get} {displayAnnual}
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PlanDetailContent;

