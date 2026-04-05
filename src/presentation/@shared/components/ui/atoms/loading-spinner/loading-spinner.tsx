import React from "react";
import { CircularProgress, Box, SxProps, Theme } from "@mui/material";

export interface LoadingSpinnerProps {
  className?: string;
  size?: number | "small" | "medium" | "large";
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit";
  sx?: SxProps<Theme>;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className = "",
  size = "medium",
  color = "primary",
  sx,
}) => {
  return (
    <Box
      className={className}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...sx,
      }}
    >
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

export default LoadingSpinner;
