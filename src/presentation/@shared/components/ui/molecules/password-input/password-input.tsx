"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Box, Typography, LinearProgress, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, Lock as LockIcon, Refresh as RefreshIcon, CheckCircle, RadioButtonUnchecked, Info as InfoIcon, FileCopy as FileCopyIcon } from "@mui/icons-material";
import { Input } from "@/presentation/@shared/components/ui/atoms/input";
import { Tooltip } from "@/presentation/@shared/components/ui/atoms/tooltip";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { PasswordInputProps, PasswordStrength, PasswordRequirements } from "./types";

// Función para generar contraseña aleatoria segura
const generateSecurePassword = (length: number = 16): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const allChars = lowercase + uppercase + numbers + specialChars;

  // Asegurar que la contraseña tenga al menos un carácter de cada tipo
  let password = "";
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Completar el resto de la longitud
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mezclar los caracteres
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// Función para validar requisitos de contraseña
const validatePasswordRequirements = (
  password: string,
  minLength: number = 8
): PasswordRequirements => {
  return {
    minLength: password.length >= minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  };
};

// Función para calcular la fuerza de la contraseña
const calculatePasswordStrength = (
  password: string,
  requirements: PasswordRequirements
): PasswordStrength => {
  if (password.length === 0) return "weak";

  let score = 0;

  // Puntos por longitud
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  // Puntos por requisitos cumplidos
  if (requirements.hasUppercase) score += 1;
  if (requirements.hasLowercase) score += 1;
  if (requirements.hasNumber) score += 1;
  if (requirements.hasSpecialChar) score += 1;

  // Puntos adicionales por variedad de caracteres
  const uniqueChars = new Set(password).size;
  if (uniqueChars > password.length * 0.6) score += 1;

  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  if (score <= 6) return "strong";
  return "very-strong";
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  label = "Contraseña",
  showStrengthBar = true,
  showRequirements = true,
  showGenerateButton = true,
  minLength = 8,
  required = false,
  onStrengthChange,
  passwordToCopy,
  onCopyPassword,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRequirementsDetails, setShowRequirementsDetails] = useState(false);
  const { t } = useLanguage();

  // Calcular requisitos y fuerza de la contraseña
  const requirements = useMemo(
    () => validatePasswordRequirements(value, minLength),
    [value, minLength]
  );

  const strength = useMemo(
    () => calculatePasswordStrength(value, requirements),
    [value, requirements]
  );

  // Notificar cambios de fuerza
  React.useEffect(() => {
    if (onStrengthChange) {
      onStrengthChange(strength);
    }
  }, [strength, onStrengthChange]);

  // Generar contraseña aleatoria
  const handleGeneratePassword = useCallback(() => {
    const generatedPassword = generateSecurePassword(16);
    onChange(generatedPassword);
    setShowPassword(true); // Mostrar la contraseña generada
  }, [onChange]);

  // Copiar contraseña al portapapeles y setearla en el input
  const handleCopyPassword = useCallback(async () => {
    if (passwordToCopy) {
      try {
        // Copiar al portapapeles
        await navigator.clipboard.writeText(passwordToCopy);
        // Setear el valor en el input
        onChange(passwordToCopy);
        if (onCopyPassword) {
          onCopyPassword();
        }
      } catch (err) {
        console.error("Error al copiar contraseña:", err);
      }
    }
  }, [passwordToCopy, onChange, onCopyPassword]);

  // Colores de la barra de fuerza
  const getStrengthColor = (strength: PasswordStrength): string => {
    switch (strength) {
      case "weak":
        return "#ef4444"; // red
      case "medium":
        return "#f59e0b"; // amber
      case "strong":
        return "#3b82f6"; // blue
      case "very-strong":
        return "#22c55e"; // green
      default:
        return "#ef4444";
    }
  };

  // Porcentaje de la barra de fuerza
  const getStrengthPercentage = (strength: PasswordStrength): number => {
    switch (strength) {
      case "weak":
        return 25;
      case "medium":
        return 50;
      case "strong":
        return 75;
      case "very-strong":
        return 100;
      default:
        return 0;
    }
  };

  // Texto de la fuerza
  const getStrengthText = (strength: PasswordStrength): string => {
    switch (strength) {
      case "weak":
        return "Débil";
      case "medium":
        return "Media";
      case "strong":
        return "Fuerte";
      case "very-strong":
        return "Muy Fuerte";
      default:
        return "";
    }
  };

  // Verificar si todos los requerimientos están cumplidos
  const allRequirementsMet = Object.values(requirements).every(Boolean) && value.length > 0;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Label */}
      {label && (
        <Typography
          component="label"
          htmlFor={inputProps.id || "password"}
          sx={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#ffffff",
            mb: 1,
            fontFamily:
              "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {label}
        </Typography>
      )}

      {/* Input con botones */}
      <Box sx={{ position: "relative", mb: showStrengthBar || showRequirements ? 1.5 : 0 }}>
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          state="modern"
          required={required}
          placeholder={label}
          fullWidth
          leftIcon={<LockIcon sx={{ fontSize: "1rem", color: "#9ca3af" }} />}
          rightIcon={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {showGenerateButton && (
                <Tooltip title={t.auth?.generatePassword || "Generar contraseña segura"} placement="top">
                  <IconButton
                    onClick={handleGeneratePassword}
                    edge="end"
                    size="small"
                    sx={{
                      color: "#9ca3af",
                      "&:hover": {
                        color: "#22c55e",
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                      },
                    }}
                    aria-label="generar contraseña"
                  >
                    <RefreshIcon sx={{ fontSize: "1rem" }} />
                  </IconButton>
                </Tooltip>
              )}
              {showRequirements && (
                <Tooltip 
                  title={showRequirementsDetails 
                    ? (t.auth?.hideRequirements || "Ocultar requerimientos") 
                    : (t.auth?.showRequirements || "Ver requerimientos de contraseña")} 
                  placement="top"
                >
                  <IconButton
                    onClick={() => setShowRequirementsDetails(!showRequirementsDetails)}
                    edge="end"
                    size="small"
                    sx={{
                      color: allRequirementsMet ? "#22c55e" : (showRequirementsDetails ? "#22c55e" : "#9ca3af"),
                      "&:hover": {
                        color: "#22c55e",
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                      },
                    }}
                    aria-label="toggle requirements"
                  >
                    <InfoIcon sx={{ fontSize: "1rem" }} />
                  </IconButton>
                </Tooltip>
              )}
              {passwordToCopy && (
                <Tooltip title={t.auth?.copyPassword || "Copiar contraseña"} placement="top">
                  <IconButton
                    onClick={handleCopyPassword}
                    edge="end"
                    size="small"
                    sx={{
                      color: "#9ca3af",
                      "&:hover": {
                        color: "#22c55e",
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                      },
                    }}
                    aria-label="copiar contraseña"
                  >
                    <FileCopyIcon sx={{ fontSize: "1rem" }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip 
                title={showPassword 
                  ? (t.auth?.hidePassword || "Ocultar contraseña") 
                  : (t.auth?.showPassword || "Mostrar contraseña")} 
                placement="top"
              >
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  sx={{
                    color: "#9ca3af",
                    "&:hover": {
                      color: "#22c55e",
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                    },
                  }}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? (
                    <Visibility sx={{ fontSize: "1rem" }} />
                  ) : (
                    <VisibilityOff sx={{ fontSize: "1rem" }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          }
          {...inputProps}
        />
      </Box>

      {/* Barra de fuerza de contraseña */}
      {showStrengthBar && value.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                fontFamily:
                  "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Fuerza de la contraseña:
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: getStrengthColor(strength),
                fontFamily:
                  "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {getStrengthText(strength)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getStrengthPercentage(strength)}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "#374151",
              "& .MuiLinearProgress-bar": {
                backgroundColor: getStrengthColor(strength),
                borderRadius: 3,
              },
            }}
          />
        </Box>
      )}

      {/* Requisitos mínimos */}
      {showRequirements && showRequirementsDetails && (
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            backgroundColor: "rgba(31, 41, 55, 0.5)",
            borderRadius: "8px",
            border: "1px solid rgba(55, 65, 81, 0.5)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: { xs: 0.75, sm: 1 },
              rowGap: 0.75,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.75rem",
                color: requirements.minLength ? "#22c55e" : "#9ca3af",
                fontFamily:
                  "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                transition: "color 0.2s ease",
              }}
            >
              {requirements.minLength ? (
                <CheckCircle sx={{ fontSize: "0.875rem", color: "#22c55e" }} />
              ) : (
                <RadioButtonUnchecked sx={{ fontSize: "0.875rem", color: "#6b7280" }} />
              )}
              <Typography
                component="span"
                sx={{
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                }}
              >
                Mín. {minLength} caracteres
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.75rem",
                color: requirements.hasUppercase ? "#22c55e" : "#9ca3af",
                fontFamily:
                  "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                transition: "color 0.2s ease",
              }}
            >
              {requirements.hasUppercase ? (
                <CheckCircle sx={{ fontSize: "0.875rem", color: "#22c55e" }} />
              ) : (
                <RadioButtonUnchecked sx={{ fontSize: "0.875rem", color: "#6b7280" }} />
              )}
              <Typography
                component="span"
                sx={{
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                }}
              >
                Mayúscula
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.75rem",
                color: requirements.hasLowercase ? "#22c55e" : "#9ca3af",
                fontFamily:
                  "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                transition: "color 0.2s ease",
              }}
            >
              {requirements.hasLowercase ? (
                <CheckCircle sx={{ fontSize: "0.875rem", color: "#22c55e" }} />
              ) : (
                <RadioButtonUnchecked sx={{ fontSize: "0.875rem", color: "#6b7280" }} />
              )}
              <Typography
                component="span"
                sx={{
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                }}
              >
                Minúscula
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.75rem",
                color: requirements.hasNumber ? "#22c55e" : "#9ca3af",
                fontFamily:
                  "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                transition: "color 0.2s ease",
              }}
            >
              {requirements.hasNumber ? (
                <CheckCircle sx={{ fontSize: "0.875rem", color: "#22c55e" }} />
              ) : (
                <RadioButtonUnchecked sx={{ fontSize: "0.875rem", color: "#6b7280" }} />
              )}
              <Typography
                component="span"
                sx={{
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                }}
              >
                Número
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.75rem",
                color: requirements.hasSpecialChar ? "#22c55e" : "#9ca3af",
                fontFamily:
                  "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                transition: "color 0.2s ease",
                gridColumn: { xs: "1", sm: "span 2" },
              }}
            >
              {requirements.hasSpecialChar ? (
                <CheckCircle sx={{ fontSize: "0.875rem", color: "#22c55e" }} />
              ) : (
                <RadioButtonUnchecked sx={{ fontSize: "0.875rem", color: "#6b7280" }} />
              )}
              <Typography
                component="span"
                sx={{
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                }}
              >
                Carácter especial (!@#$%^&*)
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

