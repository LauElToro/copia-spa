import { SxProps, Theme } from "@mui/material";

export interface WebsiteInputProps {
  value?: string;
  onChange?: (value: string) => void;
  protocol?: "http" | "https";
  onProtocolChange?: (protocol: "http" | "https") => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  label?: string;
  sx?: SxProps<Theme>;
}










