import { SelectProps as MuiSelectProps } from "@mui/material";
import { FormFieldTheme } from "../shared/form-field-theme";

export type SelectState = "default" | "error" | "success" | "ghost" | "modern";

export interface SelectTheme extends FormFieldTheme {
  states: {
    default: FormFieldTheme["states"]["default"];
    error: FormFieldTheme["states"]["error"];
    success: FormFieldTheme["states"]["success"];
    ghost: FormFieldTheme["states"]["ghost"];
    modern: FormFieldTheme["states"]["default"];
  };
}

export interface SelectProps extends Omit<MuiSelectProps, "variant" | "color" | "error"> {
  state?: SelectState;
  theme?: SelectTheme;
  leftIcon?: React.ReactNode;
  options: Array<{
    value: string;
    label: string;
  }>;
  label?: string;
}
