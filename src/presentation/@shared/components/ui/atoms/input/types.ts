import { TextFieldProps } from "@mui/material";
import { FormFieldTheme } from "../shared/form-field-theme";

export type InputState = "default" | "error" | "success" | "disabled" | "ghost" | "modern";

export interface InputTheme extends FormFieldTheme {
  states: {
    default: FormFieldTheme["states"]["default"];
    error: FormFieldTheme["states"]["error"];
    success: FormFieldTheme["states"]["success"];
    disabled: FormFieldTheme["states"]["disabled"];
    ghost: FormFieldTheme["states"]["ghost"];
    modern: FormFieldTheme["states"]["default"];
  };
}

export interface InputProps extends Omit<TextFieldProps, "variant" | "color"> {
  state?: InputState;
  theme?: InputTheme;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  min?: number;
  step?: number;
  max?: number;
  error?: boolean;
  advancedMode?: boolean;
}
