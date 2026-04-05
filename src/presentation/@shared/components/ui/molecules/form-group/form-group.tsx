import React from "react";
import { SelectChangeEvent, Typography } from "@mui/material";
import { Input } from "../../atoms/input";
import { Label } from "../../atoms/label";
import { InputProps } from "../../atoms/input/types";
import { Select } from "../../atoms/select";

interface FormGroupProps {
  label?: string;
  id: string;
  showLabel?: boolean;
  type?: InputProps["type"];
  state?: InputProps["state"];
  theme?: InputProps["theme"];
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant: "input" | "select";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  name?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  id,
  showLabel,
  variant,
  type,
  value,
  name,
  required,
  options,
  ...inputProps
}) => {
  const isModern = inputProps.state === "modern";
  
  return (
    <div className={"form-group"}>
      {isModern && label ? (
        <Typography
          component="label"
          htmlFor={id}
          sx={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#ffffff',
            mb: 1,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          {label}
        </Typography>
      ) : (
      <Label htmlFor={id} showLabel={showLabel}>
        {label}
      </Label>
      )}
      {variant === "input" ? (
        <Input
          id={id}
          type={type}
          leftIcon={inputProps.leftIcon}
          rightIcon={inputProps.rightIcon}
          name={name}
          required={required}
          value={value}
          {...inputProps}
        />
      ) : (
        <Select
          id={id}
          value={value}
          name={name}
          onChange={(e: SelectChangeEvent<unknown>) => {
            const syntheticEvent = {
              ...e,
              target: {
                ...e.target,
                value: e.target.value,
                name: name || '',
              },
            } as React.ChangeEvent<HTMLInputElement>;
            inputProps.onChange(syntheticEvent);
          }}
          options={options || []}
          state={(inputProps.state === "disabled" ? "default" : inputProps.state) || "default"}
        />
      )}
    </div>
  );
};
