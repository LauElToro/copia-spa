import { CheckboxProps as MuiCheckboxProps } from "@mui/material";

export type CheckboxState = "default" | "error" | "success";

export interface CheckboxTheme {
  states: {
    default: {
      background: string;
      color: string;
      borderColor: string;
      focusBorderColor: string;
      focusBoxShadow: string;
      checkedBackground: string;
      checkedBorderColor: string;
    };
    error: {
      background: string;
      color: string;
      borderColor: string;
      checkedBackground: string;
      checkedBorderColor: string;
    };
    success: {
      background: string;
      color: string;
      borderColor: string;
      checkedBackground: string;
      checkedBorderColor: string;
    };
  };
}

export interface CheckboxProps extends Omit<MuiCheckboxProps, "color"> {
  state?: CheckboxState;
  theme?: CheckboxTheme;
  label?: string;
}
