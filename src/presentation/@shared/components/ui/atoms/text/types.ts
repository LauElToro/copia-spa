export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "label"
  | "small"
  | "body1"
  | "body2";
export type TextAlign = "left" | "center" | "right" | "justify";
export type TextWeight = "normal" | "medium" | "semibold" | "bold" | "black" | "light";

export interface TextTheme {
  variants: {
    h1: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    h2: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    h3: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    h4: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    h5: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    h6: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    p: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    span: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    label: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    small: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    body1: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
    body2: {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
      color: string;
      opacity: string;
    };
  };
}

import { SxProps, Theme } from '@mui/material';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  theme?: TextTheme;
  align?: TextAlign;
  weight?: TextWeight;
  fontWeight?: string | number;
  color?: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  component?: React.ElementType;
  htmlFor?: string;
}
