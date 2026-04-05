export interface FormFieldState {
  background: string;
  color: string;
  borderColor: string;
  placeholderColor: string;
  focusBorderColor: string;
  focusBoxShadow: string;
  borderRadius: string;
  borderLeftWidth: string;
  borderRightWidth: string;
  borderTopWidth: string;
  borderBottomWidth: string;
  borderTopLeftRadius: string;
  borderTopRightRadius: string;
  borderBottomLeftRadius: string;
  borderBottomRightRadius: string;
  height: string;
}

export interface FormFieldTheme {
  states: {
    default: FormFieldState;
    error: FormFieldState;
    success: FormFieldState;
    disabled?: FormFieldState;
    ghost: FormFieldState;
  };
}

export interface FormFieldStateConfig {
  background: string;
  color: string;
  borderColor: string;
  placeholderColor: string;
  focusBorderColor: string;
  focusBoxShadow: string;
  borderRadius?: string;
  height?: string;
} 