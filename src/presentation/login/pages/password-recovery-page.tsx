"use client";

import React, { useEffect, useRef } from "react";
import { Box, Container, Typography, Button as MuiButton, CircularProgress } from "@mui/material";
import { Email as EmailIcon, ArrowForward } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import MainLayout from "@/presentation/@shared/components/layouts/main-layout";
import { PasswordRecoveryHero } from "@/presentation/@shared/components/ui/molecules/password-recovery-hero";
import { Input } from "@/presentation/@shared/components/ui/atoms/input";
import { Link } from "@/presentation/@shared/components/ui/atoms/link";
import { useForm } from "@/presentation/@shared/hooks/use-form";
import { useAuth } from "@/presentation/@shared/hooks/use-auth";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { useToast } from "@/presentation/@shared/components/ui/molecules/toast";

export interface RecoveryFormData {
  email: string;
}

export default function PasswordRecoveryPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();
  const { requestOtp, requireGuest } = useAuth();

  // Refs para evitar ejecuciones múltiples de toasts
  const recoverySuccessShownRef = useRef(false);
  const recoveryErrorShownRef = useRef(false);

  // Verificar si el usuario ya está logueado y redirigir
  // Solo ejecutar una vez al montar el componente
  useEffect(() => {
    requireGuest('/admin/panel/home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ejecutar solo una vez - requireGuest ahora está memoizado

  const onSubmit = async (data: RecoveryFormData) => {
    try {
      // Validar email
      if (!data.email || !data.email.trim()) {
        toast.error(t.auth?.emailRequired || "El correo electrónico es requerido", { duration: 5000 });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        toast.error(t.auth?.invalidEmail || "Por favor ingresa un correo electrónico válido", { duration: 5000 });
        return;
      }

      // Reset refs antes de iniciar nueva petición
      recoverySuccessShownRef.current = false;
      recoveryErrorShownRef.current = false;

      // Enviar solicitud de OTP para recuperación de contraseña
      requestOtp.mutate({ email: data.email }, {
        onSuccess: () => {
          if (!recoverySuccessShownRef.current) {
            recoverySuccessShownRef.current = true;
            // Mostrar mensaje de éxito
            toast.success(t.auth?.recoveryCodeSent || "Código de recuperación enviado. Revisa tu correo electrónico.", { duration: 5000 });
            // Redirigir a la página de verificación OTP después de un delay
            setTimeout(() => {
              router.push(`/verify-otp?email=${encodeURIComponent(data.email)}&type=password-recovery`);
            }, 2000);
          }
        },
        onError: (error) => {
          if (!recoveryErrorShownRef.current) {
            recoveryErrorShownRef.current = true;
            // Extraer mensaje de error
            const axiosError = error as Error & { 
              response?: { 
                data?: { message?: string }; 
                status?: number 
              }; 
              message?: string 
            };
            
            let errorMessage = t.auth?.recoveryError || "Error al enviar código de recuperación";
            
            if (axiosError?.response?.data?.message) {
              errorMessage = axiosError.response.data.message;
            } else if (axiosError?.response?.status === 404) {
              errorMessage = t.auth?.emailNotFound || "No se encontró una cuenta con este correo electrónico";
            } else if (axiosError?.message) {
              errorMessage = axiosError.message;
            }
            
            toast.error(errorMessage, { duration: 5000 });
          }
        }
      });
      
    } catch (error) {
      console.error("Error submitting recovery form:", error);
      toast.error(t.auth?.recoveryError || "Error al enviar código de recuperación", { duration: 5000 });
    }
  };

  const { formData, handleInputChange, handleSubmit } = useForm(
    { email: "" },
    onSubmit,
  );

  const { email } = formData;

  return (
    <MainLayout>
      {/* Hero Section */}
      <PasswordRecoveryHero />

      {/* Password Recovery Form Section */}
      <Box
        component="section"
        sx={{
          py: 8,
          width: "100%"
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 4, sm: 6, lg: 8 } }}>
          <Box
            sx={{
              display: { xs: "block", md: "flex" },
              flexDirection: { md: "row" },
              gap: { md: 4 },
              justifyContent: { md: "center" },
              alignItems: { md: "flex-start" },
              position: "relative"
            }}
          >
            {/* Columna del Formulario */}
            <Box
              sx={{
                width: { xs: "100%", md: "66.67%" },
                maxWidth: { xs: "100%", md: "600px" },
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
                  {t.auth?.recoverPassword || 'Recuperar Contraseña'}
                </Typography>
                
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  {/* Email Input */}
                  <Box sx={{ mb: 4 }}>
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
                      {t.auth?.email || 'Email'}
                    </Typography>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      state="modern"
                      required
                      placeholder={t.auth?.email || 'Email'}
                      fullWidth
                      leftIcon={<EmailIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />}
                    />
                  </Box>

                  {/* Submit Button */}
                  <Box sx={{ mb: 4 }}>
                    <MuiButton
                      type="submit"
                      disabled={!email || requestOtp.isPending}
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
                        "& .MuiButton-endIcon .MuiSvgIcon-root": {
                          transition: "transform 0.3s ease"
                        },
                        "&:hover:not(:disabled) .MuiButton-endIcon .MuiSvgIcon-root": {
                          transform: "translateX(4px)"
                        }
                      }}
                      endIcon={
                        requestOtp.isPending ? (
                          <CircularProgress size={18} sx={{ color: "#000000" }} />
                        ) : (
                          <ArrowForward sx={{ fontSize: 18 }} />
                        )
                      }
                    >
                      {t.auth?.sendRecoveryLink || 'Enviar Código de Recuperación'}
                    </MuiButton>
                  </Box>

                  {/* Back to Login Link */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Link 
                      href="/login" 
                      variant="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push('/login');
                      }}
                      sx={{
                        fontSize: '0.875rem',
                        color: '#22c55e',
                        '&:hover': {
                          color: '#34d399'
                        }
                      }}
                    >
                      {t.auth?.backToLogin || 'Volver al inicio de sesión'}
                    </Link>
                  </Box>
                </form>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}
