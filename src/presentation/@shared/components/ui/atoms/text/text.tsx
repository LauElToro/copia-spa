import React from "react";
import { Typography, TypographyProps } from "@mui/material";
import { TextProps } from "./types";
import { defaultTheme } from "./theme";
import { useThemeMode } from "@/presentation/@shared/contexts/theme-mode-context";

const variantMap: Record<string, TypographyProps['variant']> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  p: 'body1',
  span: 'body2',
  label: 'body2',
  small: 'caption',
  body1: 'body1',
  body2: 'body2'};

const getFontWeight = (weight?: string): number => {
  switch (weight) {
    case "light":
      return 300;
    case "normal":
      return 400;
    case "medium":
      return 500;
    case "semibold":
      return 600;
    case "bold":
      return 700;
    case "black":
      return 900;
    default:
      return 400;
  }
};

export const Text: React.FC<TextProps> = ({
  variant = "p",
  theme = defaultTheme,
  align = "left",
  weight,
  children,
  className = "",
  fontWeight,
  htmlFor,
  ...props
}) => {
  const { mode } = useThemeMode();
  const currentVariant = theme.variants[variant] || theme.variants.p || theme.variants.body1;
  const muiVariant = variantMap[variant] || 'body1';
  
  const finalWeight = weight || fontWeight || currentVariant?.fontWeight || "400";
  const numericWeight = typeof finalWeight === 'string' 
    ? (parseInt(finalWeight, 10) || getFontWeight(finalWeight))
    : (typeof finalWeight === 'number' ? finalWeight : getFontWeight(String(finalWeight)));

  const color = props.color || currentVariant?.color || (mode === "dark" ? "#ffffff" : "#121619");

  // Para elementos específicos que no tienen equivalente en Typography
  if (variant === "label") {
    return (
      <Typography
        component="label"
        variant={muiVariant}
        className={className}
        htmlFor={htmlFor}
        sx={{
          fontSize: currentVariant?.fontSize || "1rem",
          lineHeight: currentVariant?.lineHeight || "1.5",
          fontWeight: numericWeight,
          color: color,
          textAlign: align,
          opacity: currentVariant?.opacity || "1",
          ...(props.sx || {})}}
        {...props}
      >
        {children}
      </Typography>
    );
  }

  return (
    <Typography
      variant={muiVariant}
      className={className}
      component={props.component}
      sx={{
        fontSize: currentVariant?.fontSize || "1rem",
        lineHeight: currentVariant?.lineHeight || "1.5",
        fontWeight: numericWeight,
        color: color,
        textAlign: align,
        opacity: currentVariant?.opacity || "1",
        ...(props.sx || {})}}
      {...props}
    >
      {children}
    </Typography>
  );
};
