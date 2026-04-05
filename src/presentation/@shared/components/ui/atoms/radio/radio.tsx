import React from "react";
import { Radio as MuiRadio, RadioGroup, FormControlLabel, FormControl, FormLabel, Box } from "@mui/material";
import { RadioProps } from "./types";
import { defaultTheme } from "./theme";

export const Radio: React.FC<RadioProps> = ({
  state = "default",
  theme = defaultTheme,
  label,
  className = "",
  disabled,
  icon,
  ...props
}) => {
  const currentTheme = theme.states[state];

  const radio = (
    <MuiRadio
      className={className}
      disabled={disabled || state === "disabled"}
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
        control={radio}
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {icon}
            <span>{label}</span>
          </Box>
        }
        sx={{
          "& .MuiFormControlLabel-label": {
            color: currentTheme.color,
          },
        }}
      />
    );
  }

  return <Box>{radio}</Box>;
};

// RadioGroup component for grouped radios
export const RadioGroupComponent: React.FC<{
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  label?: string;
  children: React.ReactNode;
  row?: boolean;
}> = ({ value, onChange, label, children, row = false }) => {
  return (
    <FormControl component="fieldset">
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <RadioGroup
        value={value}
        onChange={onChange}
        row={row}
      >
        {children}
      </RadioGroup>
    </FormControl>
  );
};
