"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Typography, IconButton, CircularProgress, Button as MuiButton } from "@mui/material";
import { Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff, Person as PersonIcon, Storefront as StorefrontIcon, ArrowForward } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/presentation/@shared/components/layouts/main-layout";
import { LoginHero } from "@/presentation/@shared/components/ui/molecules/login-hero";
import { Input } from "@/presentation/@shared/components/ui/atoms/input";
import { Link } from "@/presentation/@shared/components/ui/atoms/link";
import { useForm } from "@/presentation/@shared/hooks/use-form";
import { useAuth } from "@/presentation/@shared/hooks/use-auth";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { LoginFormData, mapLoginFormToApiRequest, validateLoginForm } from "@/presentation/@shared/helpers/auth-mappers";
import { useToast } from "@/presentation/@shared/components/ui/molecules/toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { t } = useLanguage();
  const toast = useToast();

  // Hook de auth unificado usando react-query
  const { login } = useAuth();

  // Mostrar mensaje de registro exitoso si viene desde el registro (solo una vez)
  const shownRegistrationToastRef = useRef(false);
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "registration_success" && !shownRegistrationToastRef.current) {
      toast.success(t.auth.registrationSuccess, { duration: 5000 });
      shownRegistrationToastRef.current = true;
      // Limpiar el parámetro para evitar que se muestre nuevamente
      const url = new URL(globalThis.window.location.href);
      url.searchParams.delete('message');
      globalThis.window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, t.auth.registrationSuccess, toast]);

  // Refs para evitar ejecuciones múltiples de toasts
  const loginSuccessShownRef = useRef(false);
  const loginErrorShownRef = useRef(false);

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Validar datos del formulario
      const validation = validateLoginForm(data);
      if (!validation.isValid) {
        // Mostrar errores de validación usando toast
        for (const error of validation.errors) {
          toast.error(error, { duration: 5000 });
        }
        return;
      }

      // Reset refs antes de iniciar nueva petición
      loginSuccessShownRef.current = false;
      loginErrorShownRef.current = false;

      // Mapear datos del formulario al formato de la API
      const apiData = mapLoginFormToApiRequest(data);
      
      // Enviar datos a la API con callbacks
      login.mutate(apiData, {
        onSuccess: () => {
          if (!loginSuccessShownRef.current) {
            loginSuccessShownRef.current = true;
            // Deshabilitar el formulario inmediatamente para evitar múltiples llamadas
            setIsRedirecting(true);
            // Mostrar mensaje de éxito
            toast.success("Sesión iniciada correctamente", { duration: 3000 });
            // Redirigir al panel después del login exitoso
            setTimeout(() => {
              router.push("/admin/panel/home");
            }, 1500); // Delay para que se vea la notificación
          }
        },
        onError: (error) => {
          if (!loginErrorShownRef.current) {
            loginErrorShownRef.current = true;
            // Extraer mensaje de error
            const axiosError = error as Error & { 
              response?: { 
                data?: { message?: string }; 
                status?: number 
              }; 
              message?: string 
            };
            
            let errorMessage = "Error al iniciar sesión";
            
            if (axiosError?.response?.data?.message) {
              errorMessage = axiosError.response.data.message;
            } else if (axiosError?.response?.status === 401) {
              errorMessage = "Credenciales inválidas";
            } else if (axiosError?.response?.status === 404) {
              errorMessage = "Usuario no encontrado";
            } else if (axiosError?.message) {
              errorMessage = axiosError.message;
            }
            
            toast.error(errorMessage, { duration: 5000 });
          }
        }
      });
      
    } catch (error) {
      console.error("Error submitting login form:", error);
      toast.error(t.auth.unexpectedError || "Error inesperado al procesar el login", { duration: 5000 });
    }
  };

  const { formData, handleInputChange, handleSubmit } = useForm(
    {
      email: "",
      password: "",
    },
    onSubmit,
  );

  const { email, password } = formData;
  
  // Validar que los campos tengan contenido válido
  const isFormValid = Boolean(
    email && typeof email === 'string' && email.trim().length > 0 &&
    password && typeof password === 'string' && password.trim().length > 0
  );

  return (
    <MainLayout>
      {/* Hero Section */}
      <LoginHero />

      {/* Login Form Section */}
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
                  {t.auth?.login || 'Iniciar Sesión'}
                </Typography>
                
                <form onSubmit={handleSubmit} style={{ width: '100%' }} noValidate>
                  {/* Email Input */}
                  <Box sx={{ mb: 3 }}>
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
                      disabled={isRedirecting || login.isPending}
                      leftIcon={<EmailIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />}
                    />
                  </Box>

                  {/* Password Input */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      component="label"
                      htmlFor="password"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      {t.auth?.password || 'Contraseña'}
                    </Typography>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      state="modern"
                      required
                      placeholder={t.auth?.password || 'Contraseña'}
                      fullWidth
                      disabled={isRedirecting || login.isPending}
                      leftIcon={<LockIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />}
                      rightIcon={
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isRedirecting || login.isPending}
                          sx={{ 
                            color: '#9ca3af',
                            '&:hover': {
                              color: '#ffffff'
                            },
                            '&:disabled': {
                              opacity: 0.5
                            }
                          }}
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? (
                            <Visibility sx={{ fontSize: '1rem' }} />
                          ) : (
                            <VisibilityOff sx={{ fontSize: '1rem' }} />
                          )}
                        </IconButton>
                      }
                    />
                  </Box>

                  {/* Forgot Password Link */}
                  <Box sx={{ mb: 4, textAlign: 'right' }}>
                    <Link 
                      href="/password-recovery" 
                      variant="primary"
                      sx={{
                        fontSize: '0.875rem',
                        color: '#22c55e',
                        '&:hover': {
                          color: '#34d399'
                        }
                      }}
                    >
                      {t.auth?.forgotPassword || '¿Olvidaste tu contraseña?'}
                    </Link>
                  </Box>

                  {/* Submit Button */}
                  <Box sx={{ mb: 4 }}>
                    <MuiButton
                      type="submit"
                      disabled={!isFormValid || login.isPending || isRedirecting}
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
                        login.isPending ? (
                          <CircularProgress size={18} sx={{ color: "#000000" }} />
                        ) : (
                          <ArrowForward sx={{ fontSize: 18 }} />
                        )
                      }
                    >
                      {t.auth?.access || 'Acceder'}
                    </MuiButton>
                  </Box>
                </form>

                {/* Register Section */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.875rem',
                      color: '#ffffff',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    {t.auth?.noAccount || '¿No tienes cuenta?'}
                  </Typography>
                </Box>

                {/* Register Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  justifyContent: 'center'
                }}>
                  <MuiButton
                    component="a"
                    href="/register?type=user"
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
                      "&:hover": {
                        backgroundColor: "#ffffff",
                        color: "#000000"
                      },
                      textDecoration: 'none',
                      "& .MuiButton-endIcon .MuiSvgIcon-root": {
                        transition: "transform 0.3s ease"
                      },
                      "&:hover .MuiButton-endIcon .MuiSvgIcon-root": {
                        transform: "translateX(4px)"
                      }
                    }}
                    endIcon={<PersonIcon sx={{ fontSize: 20 }} />}
                  >
                    {t.auth?.registerAsUser || 'Registrarse como Usuario'}
                  </MuiButton>
                  <MuiButton
                    component="a"
                    href="/register?type=commerce"
                    variant="outlined"
                    className="border-glow-hover"
                    sx={{
                      px: 4,
                      py: 1.5,
                      color: "#29C480",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "1rem",
                      transition: "all 0.3s ease",
                      borderColor: "#29C480",
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      "&:hover": {
                        borderColor: "#29C480",
                        backgroundColor: "rgba(41, 196, 128, 0.1)"
                      }
                    }}
                    endIcon={<StorefrontIcon sx={{ fontSize: 20 }} />}
                  >
                    {t.auth?.registerAsCommerce || 'Registrarse como Comercio'}
                  </MuiButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
}
