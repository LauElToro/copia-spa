import React from "react";
import { Button as MuiButton, CircularProgress } from "@mui/material";
import { defaultTheme } from "./theme";
import { ButtonProps, ButtonVariant, ButtonSize } from "./types";

const variantMap: Record<ButtonVariant, "contained" | "outlined" | "text"> = {
  primary: "contained",
  secondary: "outlined",
  success: "contained",
  danger: "contained"};

const colorMap: Record<ButtonVariant, "primary" | "secondary" | "success" | "error"> = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  danger: "error"};

const sizeMap: Record<ButtonSize, "small" | "medium" | "large"> = {
  sm: "small",
  md: "medium",
  lg: "large"};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  theme = defaultTheme,
  fullWidth = false,
  isLoading = false,
  className = "",
  disabled,
  icon,
  endIcon,
  sx,
  ...props
}) => {
  const muiVariant = variantMap[variant];
  const muiColor = colorMap[variant];
  const muiSize = sizeMap[size];

  // Verificar que la variante existe en el tema
  const variantTheme = theme.variants[variant] || theme.variants.primary;

  return (
    <MuiButton
      variant={muiVariant}
      color={muiColor}
      size={muiSize}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      className={className}
      startIcon={icon && !isLoading ? icon : undefined}
      endIcon={
        isLoading ? (
          <CircularProgress size={muiSize === "small" ? 16 : 20} color="inherit" />
        ) : endIcon ? (
          endIcon
        ) : undefined
      }
      sx={{
        borderRadius: variantTheme.borderRadius,
        fontWeight: parseInt(variantTheme.fontWeight || "400", 10),
        fontSize: variantTheme.fontSize,
        padding: variantTheme.padding,
        width: fullWidth ? "100%" : variantTheme.width,
        background: variantTheme.background,
        backgroundImage: variantTheme.backgroundImage,
        color: variantTheme.color,
        borderColor: variantTheme.borderColor,
        boxShadow: variantTheme.boxShadow,
        textShadow: variantTheme.textShadow,
        textTransform: "none",
        transition: variantTheme.transition,
        "&:hover": {
          background: variantTheme.hoverBackground,
          backgroundImage: variantTheme.hoverBackgroundImage,
          color: variantTheme.hoverColor,
          boxShadow: variantTheme.hoverBoxShadow,
          textShadow: variantTheme.textShadow},
        "&:disabled": {
          opacity: 0.6},
        ...(sx || {})}}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
