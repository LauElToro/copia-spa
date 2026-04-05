import React from "react";
import { TextField, MenuItem, InputAdornment, Box, SelectChangeEvent } from "@mui/material";
import { SelectProps } from "./types";
import { defaultTheme } from "./theme";

export const Select: React.FC<SelectProps> = ({
  state = "default",
  theme = defaultTheme,
  options = [],
  className = "",
  leftIcon,
  onChange,
  value,
  name,
  id,
  disabled,
  required,
}) => {
  const currentTheme = theme.states[state] || theme.states.default;

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    if (onChange) {
      // Convertir el evento de SelectChangeEvent a ChangeEvent para compatibilidad
      const syntheticEvent = {
        ...event,
        target: {
          ...event.target,
          value: event.target.value,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } }), null);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        select
        className={className}
        error={state === "error"}
        value={value}
        name={name}
        id={id}
        disabled={disabled}
        required={required}
        onChange={handleChange as React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>}
        InputProps={{
          startAdornment: leftIcon ? (
            <InputAdornment position="start">{leftIcon}</InputAdornment>
          ) : undefined,
        }}
        sx={{
          width: "100%",
          "& .MuiOutlinedInput-root": {
            backgroundColor: currentTheme.background,
            color: currentTheme.color,
            borderRadius: currentTheme.borderRadius,
            height: currentTheme.height,
            minHeight: state === "modern" ? "56px" : undefined,
            borderLeftWidth: state === "modern" ? 0 : undefined,
            borderRightWidth: state === "modern" ? 0 : undefined,
            borderTopWidth: state === "modern" ? 0 : undefined,
            borderBottomWidth: state === "modern" ? 0 : undefined,
            fontSize: state === "modern" ? "0.875rem" : undefined,
            transition: state === "modern" ? "all 0.2s ease" : undefined,
            "& .MuiSelect-select": {
              padding: state === "modern" ? "0 16px" : undefined,
              display: "flex",
              alignItems: "center",
              height: "100%",
              minHeight: state === "modern" ? "56px" : undefined,
              boxSizing: "border-box",
            },
            "& fieldset": {
              borderColor: state === "error" ? "#ef4444" : currentTheme.borderColor,
              borderWidth: state === "modern" ? "1px" : undefined,
            },
            "&:hover fieldset": {
              borderColor: state === "error" 
                ? "#ef4444 !important" 
                : (state === "modern" 
                  ? "#22c55e !important" 
                  : `${currentTheme.focusBorderColor} !important`),
              borderWidth: state === "modern" ? "1px" : undefined,
            },
            "&.Mui-focused fieldset": {
              borderColor: state === "error" 
                ? "#ef4444 !important" 
                : (state === "modern" 
                  ? "#22c55e !important" 
                  : `${currentTheme.focusBorderColor} !important`),
              borderWidth: state === "modern" ? "1px" : undefined,
              boxShadow: currentTheme.focusBoxShadow,
            },
            "& .MuiInputAdornment-root": {
              color: state === "modern" ? "#9ca3af" : undefined,
              "& .MuiSvgIcon-root": {
                fontSize: state === "modern" ? "1rem" : undefined,
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};
