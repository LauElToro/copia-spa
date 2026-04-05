import { SxProps, Theme } from "@mui/material";
import { ButtonVariant, ButtonSize } from "../../atoms/button/types";

export interface DropdownButtonOption {
  value: string;
  label: string;
  native?: string;
  description?: string;
}

export interface DropdownButtonProps {
  options?: DropdownButtonOption[];
  value?: string;
  onChange?: (option: DropdownButtonOption) => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  renderOption?: (option: DropdownButtonOption) => React.ReactNode;
  renderValue?: (option: DropdownButtonOption) => React.ReactNode;
  searchable?: boolean;
  label?: string;
  defaultOption?: DropdownButtonOption;
  closeOnSelect?: boolean;
  disableHoverBorder?: boolean;
}

export interface DropdownButtonTheme {
  // Theme properties can be extended here if needed
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
}
