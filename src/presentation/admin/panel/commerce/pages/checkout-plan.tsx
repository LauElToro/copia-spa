"use client";

import React, { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Box, Container, Stack, Grid, Typography, CircularProgress } from "@mui/material";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { usePlans } from "@/presentation/@shared/hooks/use-plans";
import { useUserProfile } from "@/presentation/@shared/hooks/use-user-profile";
import { useToast } from "@/presentation/@shared/components/ui/molecules/toast";
import { axiosHelper } from "@/presentation/@shared/helpers/axios-helper";
import { plansData } from "@/presentation/@shared/components/ui/molecules/plan-card/plans-data";

export default function CheckoutPlanPage() {
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan");
  const periodFromUrl = (searchParams.get("period") as "monthly" | "annual") || "monthly";
  const downgrade = searchParams.get("downgrade") === "true";

  const [period, setPeriod] = useState<"monthly" | "annual">(periodFromUrl);
  const [isProcessing, setIsProcessing] = useState(false);

  const { userProfile } = useUserProfile();
  const { data: plansFromApi } = usePlans();
  const toast = useToast();

  const basePlanName = planFromUrl || "Plan Liberty";
  const planNameWithPeriod =
    period === "monthly" ? `${basePlanName} - Monthly` : `${basePlanName} - Annual`;

  const apiPlan =
    plansFromApi?.find((p) => p.name === planNameWithPeriod) ||
    plansFromApi?.find(
      (p) =>
        p.name.toLowerCase().includes(basePlanName.toLowerCase()) &&
        (period === "monthly" ? p.name.toLowerCase().includes("month") : p.name.toLowerCase().includes("annual"))
    );
  const staticPlan = plansData.find((p) => p.name === (planFromUrl || "Plan Liberty"));

  const isStarter = planFromUrl === "Plan Starter" || staticPlan?.isFree;
  const displayPrice = apiPlan
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: apiPlan.currency || "USD",
        minimumFractionDigits: 0,
      }).format(apiPlan.price)
    : staticPlan?.monthly
      ? staticPlan.monthly
      : period === "annual" && staticPlan?.annual
        ? staticPlan.annual
        : staticPlan?.price || "Gratuito";

  const handlePayWithUala = useCallback(async () => {
    if (!userProfile?.id) {
      toast.error("Debe iniciar sesión para continuar.");
      return;
    }

    if (isStarter) {
      toast.info("El Plan Starter es gratuito. Será redirigido a configuración.");
      window.location.href = "/admin/panel/configuration-subscription";
      return;
    }

    if (!apiPlan) {
      toast.error("No se encontró el plan seleccionado. Intente de nuevo.");
      return;
    }

    const priceAmount = Number(apiPlan.price);
    if (isNaN(priceAmount) || priceAmount < 0.01) {
      toast.error("El plan no tiene un precio válido.");
      return;
    }

    const frontendUrl = typeof window !== "undefined" ? window.location.origin : "";
    if (frontendUrl.includes("localhost") || frontendUrl.includes("127.0.0.1")) {
      toast.error("Para probar pagos, use ngrok o un entorno HTTPS público.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axiosHelper.payments.createUalaCheckout({
        orderId: userProfile.id,
        userId: userProfile.id,
        planId: String(apiPlan.id),
        period,
        amount: priceAmount,
        currency: apiPlan.currency || "USD",
        description: `${apiPlan.name} - Suscripción`,
        successUrl: `${frontendUrl}/payment/success?orderId=${userProfile.id}&source=plan_purchase`,
        failureUrl: `${frontendUrl}/payment/failure?orderId=${userProfile.id}&source=plan_purchase`,
        pendingUrl: `${frontendUrl}/payment/success?orderId=${userProfile.id}&source=plan_purchase`,
        payerEmail: userProfile.email,
        payerName: userProfile.name,
      });

      const checkoutUrl = (response.data as { data?: { checkoutUrl?: string } })?.data?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No se recibió URL de checkout");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Error al crear el checkout. Intente nuevamente o contacte a soporte.");
      setIsProcessing(false);
    }
  }, [userProfile, apiPlan, isStarter, toast]);

  if (downgrade && isStarter) {
    return (
      <Box sx={{ py: 6, textAlign: "center", color: "#fff" }}>
        <Typography>Redirigiendo para completar la degradación...</Typography>
      </Box>
    );
  }

  const planIcon = staticPlan?.icon || "/images/plan.svg";
  const planName = planFromUrl || "Plan Liberty";

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: "100%",
        backgroundColor: "#000000",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            <Text
              variant="h3"
              weight="bold"
              sx={{
                fontSize: { xs: "1.25rem", md: "1.75rem" },
                color: "#34d399",
                fontFamily:
                  "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                textAlign: "center",
              }}
            >
              {isStarter ? "Plan Starter" : "Checkout de Plan"}
            </Text>
            <Grid container spacing={4} justifyContent="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(0, 0, 0, 0.9))",
                    border: "2px solid rgba(41, 196, 128, 0.2)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    padding: { xs: 3, md: 5 },
                    gap: 3,
                    boxShadow: "0 0 40px rgba(41, 196, 128, 0.08)",
                  }}
                >
                  {/* Header con imagen del plan */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: { xs: "center", md: "flex-start" },
                      gap: 3,
                      borderBottom: "1px solid rgba(41, 196, 128, 0.15)",
                      pb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: { xs: 100, md: 120 },
                        height: { xs: 90, md: 110 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "16px",
                        background: "rgba(41, 196, 128, 0.08)",
                        border: "1px solid rgba(41, 196, 128, 0.2)",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={planIcon}
                        alt={planName}
                        width={80}
                        height={80}
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
                      <Typography
                        sx={{
                          fontSize: { xs: "1.25rem", md: "1.5rem" },
                          fontWeight: 700,
                          color: "#34d399",
                          mb: 0.5,
                        }}
                      >
                        {planName}
                      </Typography>
                      {staticPlan?.description && (
                        <Typography
                          sx={{
                            fontSize: "0.95rem",
                            color: "rgba(255, 255, 255, 0.85)",
                            lineHeight: 1.5,
                          }}
                        >
                          {staticPlan.description}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          color: "rgba(255, 255, 255, 0.6)",
                          mt: 1,
                        }}
                      >
                        {period === "monthly" ? "Suscripción mensual" : "Suscripción anual"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Beneficios incluidos */}
                  {staticPlan?.benefits && staticPlan.benefits.length > 0 && (
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "rgba(255, 255, 255, 0.7)",
                          mb: 1.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Beneficios incluidos
                      </Typography>
                      <Box
                        component="ul"
                        sx={{
                          listStyle: "none",
                          p: 0,
                          m: 0,
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                          gap: 1,
                        }}
                      >
                        {staticPlan.benefits.slice(0, 4).map((b, i) => (
                          <Box
                            key={i}
                            component="li"
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                              fontSize: "0.875rem",
                              color: "rgba(255, 255, 255, 0.9)",
                            }}
                          >
                            <Box
                              component="span"
                              sx={{ color: "#34d399", flexShrink: 0, fontSize: "1rem" }}
                            >
                              ✓
                            </Box>
                            <span>{b}</span>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Precio y opciones */}
                  <Stack spacing={2} sx={{ width: "100%" }}>
                    {!isStarter && staticPlan?.monthly && staticPlan?.annual && (
                      <Box>
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: "rgba(255, 255, 255, 0.7)",
                            mb: 1.5,
                          }}
                        >
                          Selecciona el período
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                          <Button
                            variant={period === "monthly" ? "primary" : "outlined"}
                            size="md"
                            onClick={() => setPeriod("monthly")}
                            sx={{ minWidth: 150 }}
                          >
                            {staticPlan.monthly}
                          </Button>
                          <Button
                            variant={period === "annual" ? "primary" : "outlined"}
                            size="md"
                            onClick={() => setPeriod("annual")}
                            sx={{ minWidth: 150 }}
                          >
                            {staticPlan.annual}
                          </Button>
                        </Box>
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 2,
                        px: 2,
                        borderRadius: "12px",
                        background: "rgba(41, 196, 128, 0.06)",
                        border: "1px solid rgba(41, 196, 128, 0.15)",
                      }}
                    >
                      <Text color="success.main" weight="bold" sx={{ fontSize: "1.125rem" }}>
                        Total a pagar
                      </Text>
                      <Text sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
                        {displayPrice}
                      </Text>
                    </Box>

                    {!isStarter && (
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handlePayWithUala}
                        disabled={isProcessing || !apiPlan}
                        sx={{ py: 1.5, fontSize: "1rem" }}
                      >
                        {isProcessing ? (
                          <>
                            <CircularProgress size={20} sx={{ color: "inherit", mr: 1 }} />
                            Procesando...
                          </>
                        ) : (
                          "Pagar con Ualá"
                        )}
                      </Button>
                    )}

                    {isStarter && (
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => (window.location.href = "/admin/panel/configuration-subscription")}
                        sx={{ py: 1.5 }}
                      >
                        Volver a configuración
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
