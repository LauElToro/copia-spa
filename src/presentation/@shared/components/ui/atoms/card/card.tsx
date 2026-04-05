import React from "react";
import { Card as MuiCard, CardContent, CardHeader, CardActions, Box } from "@mui/material";
import { CardProps } from "./types";
import { defaultTheme } from "./theme";

export const Card: React.FC<CardProps> = ({
  variant = "default",
  theme = defaultTheme,
  header,
  footer,
  children,
  className = "",
  sx,
  ...props
}) => {
  const currentVariant = theme.variants[variant] || theme.variants.default;

  const getVariantProps = () => {
    switch (variant) {
      case "outlined":
        return { variant: "outlined" as const };
      case "elevated":
        return { elevation: 4 };
      case "primary":
        return {
          sx: {
            border: `2px solid ${theme.primary?.main || "#29C480"}`}
        };
      default:
        return { elevation: 1 };
    }
  };

  return (
    <MuiCard
      className={className}
      sx={{
        backgroundColor: currentVariant.background,
        borderColor: currentVariant.borderColor,
        boxShadow: currentVariant.shadow,
        borderRadius: theme.borderRadius?.md || "8px",
        ...sx}}
      {...getVariantProps()}
      {...props}
    >
      {header && (
        <CardHeader
          title={header}
          sx={{
            backgroundColor: theme.header.background,
            borderBottom: `1px solid ${theme.header.borderColor}`,
            padding: theme.header.padding}}
        />
      )}
      <CardContent
        sx={{
          backgroundColor: theme.body.background,
          padding: theme.body.padding}}
      >
        {children}
      </CardContent>
      {footer && (
        <CardActions
          sx={{
            backgroundColor: theme.footer.background,
            borderTop: `1px solid ${theme.footer.borderColor}`,
            padding: theme.footer.padding}}
        >
          <Box sx={{ width: "100%" }}>{footer}</Box>
        </CardActions>
      )}
    </MuiCard>
  );
};
