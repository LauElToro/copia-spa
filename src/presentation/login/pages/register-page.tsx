"use client";

import React, { useEffect, useRef } from "react";
import { Box, Container, Typography, CircularProgress, Checkbox as MuiCheckbox, FormControlLabel, Button as MuiButton } from "@mui/material";
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Storefront as StorefrontIcon,
  ArrowForward,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  LocalFireDepartment as FireIcon
} from "@mui/icons-material";
import { useSearchParams, useRouter } from "next/navigation";
import MainLayout from "@/presentation/@shared/components/layouts/main-layout";
import { RegisterHero } from "@/presentation/@shared/components/ui/molecules/register-hero";
import { Input } from "@/presentation/@shared/components/ui/atoms/input";
import { Link } from "@/presentation/@shared/components/ui/atoms/link";
import { DropdownButton } from "@/presentation/@shared/components/ui/molecules/dropdown-button";
import { PasswordInput } from "@/presentation/@shared/components/ui/molecules/password-input";
import { useForm } from "@/presentation/@shared/hooks/use-form";
import { useAuth } from "@/presentation/@shared/hooks/use-auth";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { RegisterFormData, RegisterType, LoginTypesEnum, DocumentType } from "@/presentation/@shared/types/login";
import { mapRegisterFormToIntegratedRequest, validateRegisterForm } from "@/presentation/@shared/helpers/auth-mappers";
import { useToast } from "@/presentation/@shared/components/ui/molecules/toast";
import { axiosHelper } from "@/presentation/@shared/helpers/axios-helper";
import { usePlans, buildPlanDropdownLabel } from "@/presentation/@shared/hooks/use-plans";
import countries from "@/data/paises.json";
import type { DropdownButtonOption } from "@/presentation/@shared/components/ui/molecules/dropdown-button/types";
import { getDocumentPlaceholder, getDocumentInputType, formatDocumentNumber } from "@/presentation/@shared/helpers/document-validators";
import { PlanSummary } from "@/presentation/login/components/plan-summary";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const toast = useToast();

  // Obtener el tipo de registro desde los query params
  const type = (searchParams.get("type") as RegisterType) || "user";

  // Obtener planes desde la API (solo si es commerce o seller)
  const isCommerceOrSellerType = type === LoginTypesEnum.COMMERCE || type === LoginTypesEnum.SELLER;
  const { data: plansFromApi, isLoading: plansLoading, error: plansError } = usePlans();
  const planFromUrl = searchParams.get("plan");
  const periodFromUrl = searchParams.get("period") as 'monthly' | 'annual' | null;
  const isUser = type === LoginTypesEnum.USER;
  const isSeller = type === LoginTypesEnum.SELLER;
  const isCommerce = type === LoginTypesEnum.COMMERCE;
  const isCommerceOrSeller = isCommerce || isSeller;

  // Hook de auth unificado usando react-query
  const { registerIntegrated, requireGuest } = useAuth();

  // Verificar si el usuario ya está logueado y redirigir
  // Solo ejecutar una vez al montar el componente
  useEffect(() => {
    requireGuest('/admin/panel/home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ejecutar solo una vez - requireGuest ahora está memoizado

  // Refs para evitar ejecuciones múltiples de toasts
  const registerSuccessShownRef = useRef(false);
  const registerErrorShownRef = useRef(false);

  // Preparar opciones de países para el DropdownButton (país completo)
  const countryOptions: DropdownButtonOption[] = countries.map((country) => ({
    value: country.name,
    label: country.name,
    native: country.name,
  }));

  // Preparar opciones de códigos de país para el DropdownButton del teléfono
  const phoneCountryCodeOptions: DropdownButtonOption[] = countries.map((country) => ({
    value: `+${country.phone_code}`,
    label: `${country.name} (+${country.phone_code})`,
    native: `${country.name} (+${country.phone_code})`,
  }));

  // Preparar opciones de planes desde la API
  const planOptions: DropdownButtonOption[] = React.useMemo(() => {
    const defaultOption = {
      value: "",
      label: t.auth?.selectPlan || "Seleccionar plan",
      native: t.auth?.selectPlan || "Seleccionar plan"
    };

    if (!plansFromApi || plansFromApi.length === 0) {
      return [defaultOption];
    }

    const options = plansFromApi
      .sort((a, b) => a.level - b.level)
      .map((plan) => {
        const label = buildPlanDropdownLabel(plan);
        return {
          value: plan.name,
          label,
          native: label,
        };
      });

    return [defaultOption, ...options];
  }, [plansFromApi, t.auth?.selectPlan]);

  // Preparar opciones de tipos de documento
  const documentTypeOptions: DropdownButtonOption[] = [
    { value: "DNI", label: "DNI", native: "DNI" },
    { value: "LC", label: "LC (Libreta Cívica)", native: "LC (Libreta Cívica)" },
    { value: "LE", label: "LE (Libreta de Enrolamiento)", native: "LE (Libreta de Enrolamiento)" },
    { value: "PASAPORTE", label: "Pasaporte", native: "Pasaporte" },
    { value: "CUIL", label: "CUIL", native: "CUIL" },
    { value: "CUIT", label: "CUIT", native: "CUIT" },
  ];

  const getLabelByType = () => {
    if (isSeller) {
      return {
        type: t.auth?.registerSeller || "Registrarse como Vendedor",
        name: t.auth?.commerceName || "Nombre del comercio",
        email: t.auth?.commerceEmail || "Email",
      };
    } else if (isCommerce) {
      return {
        type: t.auth?.registerCommerce || "Registrarse como Comercio",
        name: t.auth?.commerceName || "Nombre del comercio",
        email: t.auth?.commerceEmail || "Email",
      };
    }
    return {
      type: t.auth?.registerUser || "Registrarse como Usuario",
      name: t.auth?.name || "Nombre",
      email: t.auth?.email || "Email",
    };
  };

  const labelByType = getLabelByType();

  // Mostrar error si falla la carga de planes
  useEffect(() => {
    if (plansError && isCommerceOrSellerType) {
      toast.error('Error al cargar los planes. Por favor, recarga la página.', { duration: 7000 });
    }
  }, [plansError, isCommerceOrSellerType, toast]);

  // Función auxiliar para validar formato de contraseña
  const isValidPasswordFormat = (password: string): boolean => {
    if (!password || password.length < 8) return false;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const isFormComplete = (): boolean => {
    // Validar que el password cumpla con los requisitos mínimos
    const passwordValid = formData.password?.trim() && isValidPasswordFormat(formData.password);
    const passwordsMatch = formData.password === formData.confirmPassword && formData.password?.trim();

    const basicFieldsComplete = !!(
      formData.name?.trim() &&
      formData.email?.trim() &&
      passwordValid &&
      passwordsMatch &&
      formData.country?.trim() &&
      formData.termsAccepted
    );

    const hasAnyPhoneField = !!(
      formData.phoneCountryCode?.trim() ||
      formData.phoneAreaCode?.trim() ||
      formData.phoneNumber?.trim()
    );

    const phoneComplete =
      !hasAnyPhoneField ||
      !!(
        formData.phoneCountryCode?.trim() &&
        formData.phoneAreaCode?.trim() &&
        formData.phoneNumber?.trim()
      );

    if (isUser) {
      const hasDocument = !!(formData.documentType && formData.documentNumber?.trim()) || !!formData.dni?.trim();
      return basicFieldsComplete && phoneComplete && hasDocument;
    } else if (isCommerceOrSeller) {
      return basicFieldsComplete && phoneComplete && !!formData.plan?.trim();
    }

    return basicFieldsComplete && phoneComplete;
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Validar datos del formulario
      const validation = validateRegisterForm(data, type);
      if (!validation.isValid) {
        // Mostrar errores de validación usando toast
        for (const error of validation.errors) {
          toast.error(error, { duration: 5000 });
        }
        return;
      }

      // Reset refs antes de iniciar nueva petición
      registerSuccessShownRef.current = false;
      registerErrorShownRef.current = false;

      // Verificar si el plan requiere pago (solo para commerce/seller)
      let planDetails = null;
      let requiresPayment = false;

      if (isCommerceOrSeller && data.plan) {
        try {
          // Buscar el plan en los datos cargados o hacer llamada a la API
          if (plansFromApi) {
            planDetails = plansFromApi.find(p => p.name === data.plan) || null;
          }

          // Si no se encontró en cache, buscar en la API
          if (!planDetails) {
            const planResponse = await axiosHelper.plans.getByName(data.plan);
            console.log('Plan response:', planResponse);
            planDetails = planResponse.data;
          }

          console.log('Plan details:', planDetails);

          // Verificar que el plan tenga precio válido
          if (planDetails && planDetails.price !== undefined && planDetails.price !== null) {
            requiresPayment = !planDetails.isFree && Number(planDetails.price) > 0;
          } else {
            requiresPayment = planDetails && !planDetails.isFree;
          }

          console.log('Requires payment:', requiresPayment, 'Price:', planDetails?.price);
        } catch (error) {
          console.error('Error fetching plan details:', error);
          toast.error('Error al verificar detalles del plan', { duration: 5000 });
          return;
        }
      }

      // Tipo de cuenta: URL (?type=commerce) o, si eligió plan, forzar commerce para no guardar como user
      const effectiveType: RegisterType =
        type === LoginTypesEnum.COMMERCE || type === LoginTypesEnum.SELLER
          ? type
          : data.plan
            ? LoginTypesEnum.COMMERCE
            : type;
      const apiData = mapRegisterFormToIntegratedRequest(data, effectiveType);

      // Enviar datos a la API integrada con callbacks
      registerIntegrated.mutate(apiData, {
        onSuccess: async (registration) => {
          if (!registerSuccessShownRef.current) {
            registerSuccessShownRef.current = true;

            // Si requiere pago, crear checkout de Uala
            if (requiresPayment && planDetails && registration.accountId) {
              try {
                const frontendUrl = window.location.origin;

                // Validar que no sea localhost (Ualá requiere URLs HTTPS públicas)
                if (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
                  toast.error(
                    '⚠️ Para probar pagos, debes usar ngrok. Ejecuta: cd ms-payments && export NODE_ENV=development && yarn start:local',
                    { duration: 10000 }
                  );
                  console.error('Ualá requiere URLs HTTPS públicas. Usa ngrok para testing local.');
                  throw new Error('Ualá requires HTTPS public URLs. Use ngrok for local testing.');
                }

                // Convertir precio a número válido
                let priceAmount = 0;
                if (planDetails.price !== undefined && planDetails.price !== null) {
                  // Si es string (Decimal serializado), convertir
                  if (typeof planDetails.price === 'string') {
                    priceAmount = parseFloat(planDetails.price);
                  } else {
                    priceAmount = Number(planDetails.price);
                  }
                }

                // Validar que el precio sea válido
                if (isNaN(priceAmount) || priceAmount < 0.01) {
                  console.error('Invalid price:', planDetails.price, 'converted to:', priceAmount);
                  toast.error(`Error: El plan no tiene un precio válido (${priceAmount}). Por favor contacta a soporte.`, { duration: 7000 });
                  throw new Error(`Precio inválido para el plan: ${planDetails.price}. No se puede proceder con el pago.`);
                }

                console.log('Creating Uala checkout:', {
                  planName: planDetails.name,
                  amount: priceAmount,
                  currency: planDetails.currency || 'USD',
                  userId: registration.accountId,
                });

                const period = (data.plan || '').toLowerCase().includes('annual') ? 'annual' : 'monthly';
                const paymentResponse = await axiosHelper.payments.createUalaCheckout({
                  orderId: registration.accountId,
                  userId: registration.accountId,
                  planId: String(planDetails.id),
                  period,
                  amount: priceAmount,
                  currency: planDetails.currency || 'USD',
                  description: `${planDetails.name} - Suscripción`,
                  successUrl: `${frontendUrl}/payment/success?orderId=${registration.accountId}`,
                  failureUrl: `${frontendUrl}/payment/failure?orderId=${registration.accountId}`,
                  pendingUrl: `${frontendUrl}/payment/success?orderId=${registration.accountId}`,
                  payerEmail: data.email,
                  payerName: data.name,
                  payerPhone: data.phoneNumber ? `${data.phoneCountryCode}${data.phoneAreaCode}${data.phoneNumber}` : undefined,
                });

                console.log('Checkout created successfully:', paymentResponse.data);

                // Redirigir a Uala para completar el pago
                const checkoutUrl = paymentResponse.data.data?.checkoutUrl;
                if (checkoutUrl) {
                  window.location.href = checkoutUrl;
                } else {
                  throw new Error('No se recibió URL de checkout');
                }
              } catch (paymentError) {
                console.error('Error creating payment checkout:', paymentError);
                toast.error('Error al crear el checkout de pago. Por favor, intenta nuevamente o contacta a soporte.', { duration: 7000 });
                // NO redirigir - mantener al usuario en el formulario para que pueda reintentar
                // El usuario ya fue creado pero está inactivo hasta que complete el pago
              }
            } else {
              // Plan gratuito - redirigir al login directamente
              router.push("/login?message=registration_success");
            }
          }
        },
        onError: (error) => {
          if (!registerErrorShownRef.current) {
            registerErrorShownRef.current = true;
            // Extraer mensaje de error
            const axiosError = error as Error & {
              response?: {
                data?: { message?: string };
                status?: number
              };
              message?: string
            };

            let errorMessage = "Error inesperado al procesar el registro";

            if (axiosError?.response?.data?.message) {
              errorMessage = axiosError.response.data.message;
            } else if (axiosError?.response?.status === 409) {
              errorMessage = "El email ya está registrado";
            } else if (axiosError?.message) {
              errorMessage = axiosError.message;
            }

            toast.error(errorMessage, { duration: 5000 });
          }
        }
      });

    } catch (error) {
      console.error("Error submitting register form:", error);
      toast.error("Error inesperado al procesar el registro", { duration: 5000 });
    }
  };

  // Determinar el plan inicial basado en los query params
  const getInitialPlan = () => {
    if (planFromUrl && periodFromUrl) {
      // Capitalizar el período para que coincida con el formato de las opciones
      const periodLabel = periodFromUrl === 'monthly' ? 'Monthly' : 'Annual';
      return `${planFromUrl} - ${periodLabel}`;
    }
    return "";
  };

  const { formData, handleInputChange, handleSubmit } = useForm(
    {
      name: "",
      lastName: "",
      dni: "",
      documentType: "",
      documentNumber: "",
      country: "",
      phoneCountryCode: "",
      phoneAreaCode: "",
      phoneNumber: "",
      plan: getInitialPlan(),
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
      termsAccepted: false,
    },
    onSubmit,
  );

  // Manejar cambio de país
  const handleCountryChange = (option: DropdownButtonOption) => {
    const selectedCountry = countries.find((c) => c.name === option.value);
    if (selectedCountry) {
      handleInputChange("country", selectedCountry.name);
      handleInputChange("phoneCountryCode", `+${selectedCountry.phone_code}`);
    }
  };

  // Manejar cambio de plan
  const handlePlanChange = (option: DropdownButtonOption) => {
    handleInputChange("plan", option.value);
  };

  // Sincronizar plan cuando los planes de la API cargan y venimos desde la landing con plan+period
  const planSyncedRef = useRef(false);
  useEffect(() => {
    if (planSyncedRef.current || !plansFromApi?.length || !planFromUrl || !periodFromUrl || !isCommerceOrSeller) return;
    const periodLabel = periodFromUrl === 'monthly' ? 'Monthly' : 'Annual';
    const expected = `${planFromUrl} - ${periodLabel}`;
    const match = plansFromApi.find(
      (p) =>
        p.name === expected ||
        (p.name.toLowerCase().includes(planFromUrl.toLowerCase()) &&
          (periodFromUrl === 'monthly'
            ? p.name.toLowerCase().includes('month')
            : p.name.toLowerCase().includes('annual')))
    );
    if (match) {
      planSyncedRef.current = true;
      handleInputChange("plan", match.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- handleInputChange is stable; sync only once when plans load
  }, [plansFromApi, planFromUrl, periodFromUrl, isCommerceOrSeller]);

  // Manejar cambio de tipo de documento
  const handleDocumentTypeChange = (option: DropdownButtonOption) => {
    handleInputChange("documentType", option.value);
    // Limpiar el número de documento cuando cambia el tipo
    if (formData.documentNumber) {
      handleInputChange("documentNumber", "");
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}

      <RegisterHero type={type} />

      {/* Register Form Section */}
      <Box
        component="section"
        sx={{
          py: 8,
          width: "100%",
          position: "relative"
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
          {/* Resumen del Plan - Versión Móvil (solo para commerce/seller con plan) */}
          {isCommerceOrSeller && formData.plan && (
            <Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
              <PlanSummary planName={formData.plan} />
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              justifyContent: "center",
              alignItems: "flex-start",
              position: "relative"
            }}
          >
            {/* Columna del Formulario */}
            <Box
              sx={{
                width: { xs: "100%", md: isCommerceOrSeller && formData.plan ? "58.33%" : (isCommerceOrSeller ? "83.33%" : "83.33%") },
                maxWidth: { xs: "100%", md: isCommerceOrSeller && formData.plan ? "700px" : "1000px" },
                flexShrink: 0
              }}
            >
              <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                p: { xs: 3, md: 4 }
              }}>
                <Typography
                  component="h3"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '1.875rem' },
                    fontWeight: 700,
                    color: '#ffffff',
                    mb: { xs: 2, md: 3 },
                    textAlign: 'center',
                    lineHeight: 1.2,
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                  }}
                >
                  {labelByType.type}
                </Typography>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  {/* Nombre y Email - 2 columnas */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    mb: 3,
                    width: '100%'
                  }}>
                    {/* Nombre */}
                    <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                      <Typography
                        component="label"
                        htmlFor="name"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        {labelByType.name}
                      </Typography>
                      <Input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        state="modern"
                        required
                        placeholder={labelByType.name}
                        fullWidth
                        leftIcon={isUser ? <PersonIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} /> : <StorefrontIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />}
                      />
                    </Box>

                    {/* Apellido - Solo para usuarios */}
                    {isUser && (
                      <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                        <Typography
                          component="label"
                          htmlFor="lastName"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          {t.auth?.lastName || 'Apellido'}
                        </Typography>
                        <Input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={formData.lastName || ""}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          state="modern"
                          placeholder={t.auth?.lastName || 'Apellido'}
                          fullWidth
                          leftIcon={<PersonIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />}
                        />
                      </Box>
                    )}

                    {/* Email */}
                    <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                      <Typography
                        component="label"
                        htmlFor="email"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        {labelByType.email}
                      </Typography>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        state="modern"
                        required
                        placeholder={labelByType.email}
                        fullWidth
                        leftIcon={<EmailIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />}
                      />
                    </Box>
                  </Box>

                  {/* DNI o Plan y País - 2 columnas */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    mb: 3,
                    width: '100%'
                  }}>
                    {/* Documento o Plan */}
                    <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                      {isUser ? (
                        <>
                          <Typography
                            component="label"
                            htmlFor="documentType"
                            sx={{
                              display: 'block',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#ffffff',
                              mb: 1,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            {t.auth?.dni || 'Documento'}
                          </Typography>
                          <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            width: '100%'
                          }}>
                            <Box sx={{ flex: { sm: '0 0 180px' }, width: { xs: '100%', sm: 'auto' } }}>
                              <DropdownButton
                                options={documentTypeOptions}
                                value={formData.documentType || ""}
                                onChange={handleDocumentTypeChange}
                                placeholder="Tipo"
                                renderValue={(option) => option ? option.label : ''}
                                fullWidth={true}
                                searchable={true}
                                sx={{
                                  width: '100%',
                                  '& button': {
                                    height: '56px',
                                    minHeight: '56px',
                                    alignItems: 'center',
                                    display: 'flex',
                                    '& .MuiTypography-root': {
                                      fontSize: '0.875rem !important',
                                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                      lineHeight: '1.5',
                                    }
                                  }
                                }}
                              />
                            </Box>
                            <Box sx={{ flex: { sm: '1 1 auto' }, width: { xs: '100%', sm: 'auto' }, minWidth: 0 }}>
                              <Input
                                type={getDocumentInputType(formData.documentType as DocumentType)}
                                name="documentNumber"
                                id="documentNumber"
                                value={formData.documentNumber || ""}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  // Formatear automáticamente para CUIL/CUIT
                                  if (formData.documentType === "CUIL" || formData.documentType === "CUIT") {
                                    value = formatDocumentNumber(formData.documentType as DocumentType, value);
                                  }
                                  handleInputChange("documentNumber", value);
                                }}
                                state="modern"
                                required={isUser}
                                placeholder={getDocumentPlaceholder(formData.documentType as DocumentType)}
                                fullWidth
                                disabled={!formData.documentType}
                                leftIcon={<BadgeIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />}
                              />
                            </Box>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Typography
                            component="label"
                            htmlFor="plan"
                            sx={{
                              display: 'block',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#ffffff',
                              mb: 1,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            {t.auth?.selectPlan || 'Plan'}
                          </Typography>
                          <DropdownButton
                            options={planOptions}
                            value={formData.plan || ""}
                            onChange={handlePlanChange}
                            placeholder={plansLoading ? 'Cargando planes...' : (t.auth?.selectPlan || 'Seleccionar plan')}
                            renderValue={(option) => option ? option.label : ''}
                            fullWidth={true}
                            searchable={true}
                            disabled={plansLoading}
                            sx={{
                              width: '100%',
                              '& button': {
                                height: '56px',
                                minHeight: '56px',
                                alignItems: 'center',
                                display: 'flex',
                                '& .MuiTypography-root': {
                                  fontSize: '0.875rem !important',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                  lineHeight: '1.5',
                                }
                              }
                            }}
                          />
                        </>
                      )}
                    </Box>

                    {/* País */}
                    <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                      <Typography
                        component="label"
                        htmlFor="country"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        {'País'}
                      </Typography>
                      <DropdownButton
                        options={countryOptions}
                        value={formData.country || ""}
                        onChange={handleCountryChange}
                        placeholder={'Seleccionar país'}
                        renderValue={(option) => option ? option.label : ''}
                        fullWidth={true}
                        searchable={true}
                        sx={{
                          width: '100%',
                          '& button': {
                            height: '56px',
                            minHeight: '56px',
                            alignItems: 'center',
                            display: 'flex',
                            '& .MuiTypography-root': {
                              fontSize: '0.875rem !important',
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                              lineHeight: '1.5',
                            }
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Teléfono - 3 columnas */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    mb: 3,
                    width: '100%'
                  }}>
                    {/* Código de País */}
                    <Box sx={{ flex: { md: '0 0 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: { md: '150px' } }}>
                      <Typography
                        component="label"
                        htmlFor="phoneCountryCode"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        {(t.auth as { phoneCountryCode?: string })?.phoneCountryCode || 'Código de país'}
                      </Typography>
                      <DropdownButton
                        options={phoneCountryCodeOptions}
                        value={formData.phoneCountryCode || ""}
                        onChange={(option) => {
                          const selectedCode = option.value;
                          handleInputChange("phoneCountryCode", selectedCode);
                          // Actualizar el país también cuando se selecciona el código
                          const selectedCountry = countries.find(c => `+${c.phone_code}` === selectedCode);
                          if (selectedCountry) {
                            handleInputChange("country", selectedCountry.name);
                          }
                        }}
                        placeholder={'Seleccionar código'}
                        renderValue={(option) => option ? option.label : ''}
                        fullWidth={true}
                        searchable={true}
                        sx={{
                          width: '100%',
                          minHeight: '56px'
                        }}
                      />
                    </Box>

                    {/* Código de Área */}
                    <Box sx={{ flex: { md: '0 0 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: { md: '120px' } }}>
                      <Typography
                        component="label"
                        htmlFor="phoneAreaCode"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        {(t.auth as { phoneAreaCode?: string })?.phoneAreaCode || 'Código de área'}
                      </Typography>
                      <Input
                        type="text"
                        name="phoneAreaCode"
                        id="phoneAreaCode"
                        value={formData.phoneAreaCode || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Solo permitir números y que no empiece con 0
                          if (value === '' || (/^\d+$/.test(value) && !value.startsWith('0'))) {
                            handleInputChange("phoneAreaCode", value);
                          }
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[1-9][0-9]*'
                        }}
                        state="modern"
                        placeholder={(t.auth as { phoneAreaCodePlaceholder?: string })?.phoneAreaCodePlaceholder || '11'}
                        fullWidth
                      />
                    </Box>

                    {/* Número de Teléfono */}
                    <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                      <Typography
                        component="label"
                        htmlFor="phoneNumber"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        {'Teléfono'}
                      </Typography>
                      <Input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        value={formData.phoneNumber || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Solo permitir números
                          if (value === '' || /^\d+$/.test(value)) {
                            handleInputChange("phoneNumber", value);
                          }
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*'
                        }}
                        state="modern"
                        placeholder={'12345678'}
                        fullWidth
                        leftIcon={<PhoneIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />}
                      />
                    </Box>
                  </Box>

                  {/* Password y Confirm Password - 2 columnas */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 3,
                    mb: 3,
                    width: '100%'
                  }}>
                    {/* Password */}
                    <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                      <PasswordInput
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={(value) => handleInputChange("password", value)}
                        label={t.auth?.password || 'Contraseña'}
                        required
                        showStrengthBar={true}
                        showRequirements={true}
                        showGenerateButton={true}
                        minLength={8}
                      />
                    </Box>

                    {/* Confirm Password */}
                    <Box sx={{ flex: { md: '1 1 auto' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(value) => handleInputChange("confirmPassword", value)}
                        label={t.auth?.repeatPassword || 'Confirmar Contraseña'}
                        required
                        showStrengthBar={false}
                        showRequirements={false}
                        showGenerateButton={false}
                        passwordToCopy={formData.password}
                        onCopyPassword={() => {
                          toast.success('Contraseña copiada al portapapeles', { duration: 2000 });
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Código de Referido - Solo para commerce/seller */}
                  {isCommerceOrSeller && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        component="label"
                        htmlFor="referralCode"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        {'Código de referido (opcional)'}
                      </Typography>
                      <Input
                        type="text"
                        name="referralCode"
                        id="referralCode"
                        value={formData.referralCode || ""}
                        onChange={(e) => handleInputChange("referralCode", e.target.value)}
                        state="modern"
                        placeholder={'Código de referido'}
                        fullWidth
                        leftIcon={<FireIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />}
                      />
                    </Box>
                  )}

                  {/* Checkbox Términos */}
                  <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <FormControlLabel
                      control={
                        <MuiCheckbox
                          checked={formData.termsAccepted}
                          onChange={(e) => handleInputChange("termsAccepted", e.target.checked)}
                          sx={{
                            color: '#9ca3af',
                            '&.Mui-checked': {
                              color: '#22c55e',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            fontSize: '0.875rem',
                            color: '#ffffff',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          {'Acepto los'}{" "}
                          <Link
                            href="/terms"
                            variant="primary"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push('/terms');
                            }}
                            sx={{
                              fontSize: '0.875rem',
                              color: '#22c55e',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              '&:hover': {
                                color: '#34d399'
                              }
                            }}
                          >
                            {'Términos y Condiciones'}
                          </Link>
                        </Typography>
                      }
                    />
                  </Box>

                  {/* Submit Button */}
                  <Box sx={{ mb: 4 }}>
                    <MuiButton
                      type="submit"
                      disabled={!isFormComplete() || registerIntegrated.isPending}
                      sx={{
                        px: 4,
                        py: 1.5,
                        backgroundColor: "#29C480",
                        color: "#1e293b",
                        fontWeight: 600,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "1rem",
                        transition: "background-color 0.3s ease, color 0.3s ease",
                        width: "100%",
                        "&:hover:not(:disabled)": {
                          backgroundColor: "#ffffff",
                          color: "#000000"
                        },
                        "&:disabled": {
                          backgroundColor: "#29C480",
                          color: "#1e293b",
                          opacity: 0.6
                        },
                        "& .MuiSvgIcon-root": {
                          transition: "transform 0.3s ease"
                        },
                        "&:hover:not(:disabled) .MuiSvgIcon-root": {
                          transform: "translateX(4px)"
                        }
                      }}
                      endIcon={
                        registerIntegrated.isPending ? (
                          <CircularProgress size={18} sx={{ color: "#000000" }} />
                        ) : (
                          <ArrowForward sx={{ fontSize: 18 }} />
                        )
                      }
                    >
                      {t.auth?.register || 'Registrarse'}
                    </MuiButton>
                  </Box>
                </form>

                {/* Login Link */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.875rem',
                      color: '#ffffff',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {'¿Ya tienes cuenta?'}{' '}
                  </Typography>
                  <Link
                    href="/login"
                    variant="primary"
                    sx={{
                      fontSize: '0.875rem',
                      color: '#22c55e',
                      fontWeight: 600,
                      '&:hover': {
                        color: '#34d399'
                      }
                    }}
                  >
                    {'Inicia sesión'}
                  </Link>
                </Box>
              </Box>
            </Box>

            {/* Columna del Resumen del Plan - Solo para commerce/seller con plan seleccionado */}
            {isCommerceOrSeller && formData.plan && (
              <Box
                sx={{
                  width: { xs: "100%", md: "41.67%" },
                  maxWidth: { xs: "100%", md: "500px" },
                  flexShrink: 0,
                  display: { xs: "none", md: "block" },
                  alignSelf: "flex-start",
                  position: "relative",
                  height: "fit-content"
                }}
              >
                <PlanSummary planName={formData.plan} />
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}
