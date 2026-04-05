import { HTMLAttributes } from 'react';
import { CounterTheme } from './theme';

export type CounterVariant = "default" | "primary" | "success" | "warning" | "danger";
export type CounterSize = "sm" | "md" | "lg";

export interface CounterProps extends HTMLAttributes<HTMLSpanElement> {
  count: number;
  variant?: CounterVariant;
  size?: CounterSize;
  theme?: CounterTheme;
  className?: string;
}
