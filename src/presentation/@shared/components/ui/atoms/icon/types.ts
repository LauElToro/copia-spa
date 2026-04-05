import { IconTheme } from "./theme";

export type IconSize = "sm" | "md" | "lg" | "xl";
export type IconVariant = "default" | "primary" | "secondary" | "success" | "danger";

export interface IconProps {
  className?: string;
  name: string;
  size?: IconSize;
  variant?: IconVariant;
  color?: string;
  theme?: IconTheme;
  onClick?: () => void;
}
