import { InputProps } from "@/presentation/@shared/components/ui/atoms/input/types";

export type PasswordStrength = "weak" | "medium" | "strong" | "very-strong";

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordInputProps extends Omit<InputProps, "type" | "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showStrengthBar?: boolean;
  showRequirements?: boolean;
  showGenerateButton?: boolean;
  minLength?: number;
  required?: boolean;
  onStrengthChange?: (strength: PasswordStrength) => void;
  passwordToCopy?: string; // Para el campo de confirmación, recibe la password del campo anterior
  onCopyPassword?: () => void; // Callback cuando se copia la contraseña
}

