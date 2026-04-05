"use client";

import React from "react";
import { TextField, FormHelperText, Box } from "@mui/material";
import { defaultTheme, TextareaTheme } from "./theme";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  error?: string;
  label?: string;
  state?: "default" | "transparent";
  theme?: TextareaTheme;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  className = "",
  state = "default",
  theme = defaultTheme,
  name,
  ...otherProps
}) => {
  const {
    error,
    id,
    label,
    disabled = false,
    required = false,
    placeholder,
    rows = 4,
    maxLength} = otherProps;

  const currentTheme = theme.states[state] || theme.states.default;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <TextField
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className={className}
        label={label}
        error={!!error}
        multiline
        fullWidth
        helperText={error}
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: state === "transparent" ? "transparent" : currentTheme.background,
            color: currentTheme.color,
            borderRadius: currentTheme.borderRadius,
            whiteSpace: currentTheme.whiteSpace,
            borderLeftWidth: state === "transparent" ? 0 : undefined,
            borderRightWidth: state === "transparent" ? 0 : undefined,
            borderTopWidth: state === "transparent" ? 0 : undefined,
            borderBottomWidth: state === "transparent" ? "1px" : undefined,
            "& fieldset": {
              borderColor: currentTheme.borderColor,
              borderWidth: state === "transparent" ? "0 0 1px 0" : undefined,
            },
            "&:hover fieldset": {
              borderColor: currentTheme.focusBorderColor || currentTheme.borderColor,
              borderWidth: state === "transparent" ? "0 0 1px 0" : undefined,
            },
            "&.Mui-focused fieldset": {
              borderColor: currentTheme.focusBorderColor || currentTheme.borderColor,
              borderWidth: state === "transparent" ? "0 0 1px 0" : undefined,
              boxShadow: currentTheme.focusBoxShadow || "none",
            },
            "& textarea::placeholder": {
              color: currentTheme.placeholderColor,
              opacity: 1,
            },
          },
          "& .MuiInputLabel-root": {
            color: currentTheme.color,
            "&.Mui-focused": {
              color: currentTheme.focusBorderColor || currentTheme.borderColor,
            },
          },
        }}
        inputProps={{
          ...(maxLength && { maxLength }),
          "aria-invalid": !!error,
          "aria-describedby": error ? `${id}-error` : undefined}}
      />
      {error && (
        <FormHelperText error id={`${id}-error`}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export default Textarea;
