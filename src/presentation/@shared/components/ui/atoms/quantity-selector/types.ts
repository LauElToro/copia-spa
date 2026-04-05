export type QuantitySelectorSize = 'sm' | 'md' | 'lg';

export interface QuantitySelectorProps {
  value?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: QuantitySelectorSize;
  theme?: Record<string, unknown>;
  className?: string;
  disabled?: boolean;
}
