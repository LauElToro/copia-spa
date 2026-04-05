export type CardVariant = "default" | "outlined" | "elevated" | "primary";

export interface CardTheme {
  variants: {
    default: {
      background: string;
      borderColor: string;
      shadow: string;
    };
    outlined: {
      background: string;
      borderColor: string;
      shadow: string;
    };
    elevated: {
      background: string;
      borderColor: string;
      shadow: string;
    };
    primary: {
      background: string;
      borderColor: string;
      shadow: string;
    };
  };
  header: {
    background: string;
    borderColor: string;
    padding: string;
  };
  body: {
    background: string;
    padding: string;
  };
  footer: {
    background: string;
    borderColor: string;
    padding: string;
  };
  borderRadius?: {
    sm?: string;
    main?: string;
    md?: string;
    none?: string;
  };
  primary?: {
    main?: string;
  };
}

import { SxProps, Theme } from "@mui/material";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  theme?: CardTheme;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}
