import { RadioProps as MuiRadioProps } from "@mui/material";
import { RadioTheme } from "./theme";

export interface RadioProps extends Omit<MuiRadioProps, "color"> {
  state?: "default" | "checked" | "disabled";
  theme?: RadioTheme;
  label?: string;
  icon?: React.ReactNode;
}
