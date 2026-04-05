import React from "react";
import { Checkbox as MuiCheckbox, FormControlLabel, Box } from "@mui/material";
import { CheckboxProps } from "./types";
import { defaultTheme } from "./theme";

export const Checkbox: React.FC<CheckboxProps> = ({
  state = "default",
  theme = defaultTheme,
  label,
  className = "",
  ...props
}) => {
  const currentTheme = theme.states[state];

  const checkbox = (
    <MuiCheckbox
      className={className}
      sx={{
        color: currentTheme.borderColor,
        "&.Mui-checked": {
          color: currentTheme.color,
        },
        "&.Mui-disabled": {
          color: currentTheme.borderColor,
          opacity: 0.5,
        },
      }}
      {...props}
    />
  );

  if (label) {
    return (
      <FormControlLabel
        control={checkbox}
        label={label}
        sx={{
          "& .MuiFormControlLabel-label": {
            color: currentTheme.color,
          },
        }}
      />
    );
  }

  return <Box>{checkbox}</Box>;
};
