import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { plansData } from "@/presentation/@shared/components/ui/molecules/plan-card/plans-data";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { formatPlanNameForDisplay } from "@/presentation/@shared/helpers/plan-display";

interface PlanSummaryProps {
  planName: string;
}

export const PlanSummary: React.FC<PlanSummaryProps> = ({ planName }) => {
  const { t } = useLanguage();
  
  // Nombre base sin período; normaliza errores típicos del backend (p. ej. Avión/plane → Plan)
  const basePlanName = formatPlanNameForDisplay(
    planName.replace(/ - (Monthly|Annual)$/i, "").trim()
  );
  
  // Determinar si es mensual o anual
  const isAnnual = planName.includes('Annual');
  
  const plan = plansData.find((p) => p.name === basePlanName);

  if (!plan) {
    return null;
  }

  const isFree = plan.isFree || plan.price === "Gratuito";
  // Mostrar el precio correspondiente al período seleccionado
  const displayPrice = isAnnual && plan.annual ? plan.annual : (plan.monthly || plan.price);
  const monthlyPrice = displayPrice;

  return (
    <Box
      className="plan-summary-container"
      sx={{
        position: "sticky",
        top: { xs: 16, md: 24 },
        alignSelf: "flex-start",
        height: "fit-content",
        maxHeight: { md: "calc(100vh - 48px)" },
        overflowY: { md: "auto" },
        zIndex: 10,
        width: "100%",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(41, 196, 128, 0.3)",
          borderRadius: "3px",
          "&:hover": {
            background: "rgba(41, 196, 128, 0.5)",
          },
        },
      }}
    >
      <Box
        className="plan-summary-card"
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
        }}
      >

        {/* Content Container */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: { xs: 3, md: 4 },
            gap: 2,
          }}
        >
          {/* Header */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                mb: 1.5,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {t.auth?.planSummary || "Resumen del Plan"}
            </Typography>
            <Typography
              component="h3"
              sx={{
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                fontWeight: 700,
                color: "#34d399",
                mb: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {plan.name}
            </Typography>
            {plan.description && (
              <Typography
                sx={{
                  fontSize: { xs: "0.875rem", md: "0.95rem" },
                  lineHeight: 1.6,
                  color: "#ffffff",
                  opacity: 0.9,
                  mb: 2,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {plan.description}
              </Typography>
            )}
          </Box>

          <Divider sx={{ borderColor: "rgba(41, 196, 128, 0.2)", my: 2 }} />

          {/* Precio */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.6)",
                mb: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {isAnnual ? (t.auth?.annualPayment || "Pago Anual") : (t.auth?.monthlyPayment || "Pago Mensual")}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1.75rem", md: "2rem" },
                fontWeight: 700,
                color: "#34d399",
                mb: 0.5,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {monthlyPrice}
            </Typography>
            {!isAnnual && plan.annual && !isFree && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.5)",
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {t.auth?.orPayAnnual?.replace("{annual}", plan.annual) || `O paga ${plan.annual} anual`}
              </Typography>
            )}
            {isAnnual && plan.monthly && !isFree && (
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.5)",
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {t.auth?.orPayMonthly?.replace("{monthly}", plan.monthly) || `O paga ${plan.monthly} mensual`}
              </Typography>
            )}
          </Box>

          <Divider sx={{ borderColor: "rgba(41, 196, 128, 0.2)", my: 2 }} />

          {/* Beneficios destacados */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.8)",
                mb: 1.5,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {t.auth?.includes || "Incluye:"}
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", padding: 0, margin: 0 }}>
              {plan.benefits.slice(0, 4).map((benefit, index) => (
                <Box
                  component="li"
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    mb: 1.5,
                    "&:last-child": { mb: 0 },
                  }}
                >
                  <CheckCircle
                    sx={{
                      color: "#34d399",
                      fontSize: "1.125rem",
                      mr: 1,
                      mt: 0.25,
                      flexShrink: 0,
                    }}
                  />
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
        </Box>
      </Box>
    </Box>
  );
};

