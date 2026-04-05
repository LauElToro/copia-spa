import { ButtonHTMLAttributes } from "react";
import { SxProps, Theme } from "@mui/material";
import { ButtonTheme } from "./theme";

export type ButtonVariant = "primary" | "secondary" | "success" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  theme?: ButtonTheme;
  fullWidth?: boolean;
  isLoading?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  component?: React.ElementType;
  href?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}
