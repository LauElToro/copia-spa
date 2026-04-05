// types.ts
import { HTMLAttributes } from "react";
import { FooterTheme } from "./themes";

export type FooterVariant = "light" | "dark";
export type FooterSize = "sm" | "md" | "lg";

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  size?: FooterSize;
  theme?: FooterTheme;
  fullWidth?: boolean;
  className?: string;
}
