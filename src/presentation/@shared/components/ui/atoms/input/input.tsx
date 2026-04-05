import React from "react";
import { TextField, InputAdornment, Box } from "@mui/material";
import { InputProps } from "./types";
import { defaultTheme } from "./theme";
import { RichTextEditor } from "./rich-text-editor";

export const Input: React.FC<InputProps> = ({
  type = "text",
  state = "default",
  theme = defaultTheme,
  className = "",
  disabled = false,
  leftIcon,
  rightIcon,
  name,
  inputProps: inputPropsProp,
  advancedMode = false,
  ...props
}) => {
  const currentState = theme.states[state] || theme.states.default;
  const { min, step, max, maxLength, minLength, multiline, value, defaultValue, onChange, placeholder, required, id, ...otherProps } = props as Record<string, unknown>;
  
  // Determinar si el input debe ser controlado o no controlado
  // Si se proporciona 'value', es controlado. Si solo 'defaultValue', es no controlado.
  const isControlled = value !== undefined;

  // Si advancedMode está activo y es multiline, renderizar el editor WYSIWYG
  if (advancedMode && multiline) {
    const handleRichTextChange = (content: string) => {
      if (onChange) {
        // Crear un evento sintético para mantener compatibilidad
        const syntheticEvent = {
          target: {
            name: name || '',
            value: content,
          },
        } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
        (onChange as (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void)(syntheticEvent);
      }
    };

    return (
      <Box sx={{ position: "relative" }}>
        <RichTextEditor
          value={(value as string) || ''}
          onChange={handleRichTextChange}
          placeholder={placeholder as string}
          id={id as string}
          name={name}
          required={required as boolean}
          disabled={disabled}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        type={type}
        name={name}
        disabled={disabled}
        className={className}
        error={state === "error" || props.error}
        {...(isControlled ? { 
          value: (() => {
            // Para inputs de tipo number, manejar explícitamente todos los casos
            if (type === 'number') {
              // Si el valor es undefined, null o cadena vacía, retornar cadena vacía
              if (value === undefined || value === null || value === '') {
                return '';
              }
              // Convertir a número y luego a string
              // IMPORTANTE: Incluir el caso cuando value es 0 (que es un valor válido)
              const numValue = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
              if (Number.isNaN(numValue)) {
                return '';
              }
              // Asegurar que 0 y otros números se muestren correctamente
              // Usar String() para garantizar que siempre sea un string válido
              const stringValue = String(numValue);
              // Asegurar que el valor no sea una cadena vacía para números válidos
              return stringValue === '' ? String(numValue) : stringValue;
            }
            // Para otros tipos, usar el valor como string o cadena vacía
            return value !== undefined && value !== null ? String(value) : '';
          })()
        } : { 
          defaultValue: (() => {
            // Para inputs de tipo number, manejar explícitamente todos los casos
            if (type === 'number') {
              if (defaultValue === undefined || defaultValue === null || defaultValue === '') {
                return '';
              }
              // Convertir a número y luego a string
              const numValue = typeof defaultValue === 'string' ? Number.parseFloat(defaultValue) : Number(defaultValue);
              if (Number.isNaN(numValue)) {
                return '';
              }
              return String(numValue);
            }
            // Para otros tipos, usar el valor como string o cadena vacía
            return defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : '';
          })()
        })}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined}
        placeholder={placeholder as string | undefined}
        required={required as boolean | undefined}
        id={id as string | undefined}
        InputProps={{
          startAdornment: leftIcon ? (
            <InputAdornment position="start">{leftIcon}</InputAdornment>
          ) : undefined,
          endAdornment: rightIcon ? (
            <InputAdornment position="end">{rightIcon}</InputAdornment>
          ) : undefined}}
        inputProps={{
          ...(min !== undefined && { min }),
          ...(step !== undefined && { step }),
          ...(max !== undefined && { max }),
          ...(maxLength !== undefined && { maxLength }),
          ...(minLength !== undefined && { minLength }),
          ...(inputPropsProp || {})
        }}
        sx={{
          width: "100%",
          "& .MuiOutlinedInput-root": {
            backgroundColor: currentState?.background,
            color: currentState?.color,
            borderRadius: currentState?.borderRadius,
            height: currentState?.height,
            minHeight: state === "modern" ? "56px" : undefined,
            borderLeftWidth: state === "modern" ? 0 : currentState?.borderLeftWidth,
            borderRightWidth: state === "modern" ? 0 : currentState?.borderRightWidth,
            borderTopWidth: state === "modern" ? 0 : currentState?.borderTopWidth,
            borderBottomWidth: state === "modern" ? 0 : currentState?.borderBottomWidth,
            fontSize: state === "modern" ? "0.875rem" : undefined,
            transition: state === "modern" ? "all 0.2s ease" : undefined,
            "& fieldset": {
              borderColor: state === "error" ? "#ef4444" : (state === "modern" && props.error ? "#ef4444" : currentState?.borderColor),
              borderWidth: state === "modern" ? "1px" : undefined,
            },
            "&:hover fieldset": {
              borderColor: state === "error" ? "#ef4444" : (state === "modern" && props.error ? "#ef4444" : currentState?.focusBorderColor),
            },
            "&.Mui-focused fieldset": {
              borderColor: state === "error" ? "#ef4444" : (state === "modern" && props.error ? "#ef4444" : currentState?.focusBorderColor),
              boxShadow: state === "error" 
                ? "0 0 0 1px rgba(239, 68, 68, 0.2)"
                : (state === "modern" && props.error 
                  ? "0 0 0 1px rgba(239, 68, 68, 0.2)"
                  : (state === "modern" 
                ? (currentState?.focusBoxShadow || "0 0 0 1px rgba(34, 197, 94, 0.2)")
                    : currentState?.focusBoxShadow)),
            },
            "& input::placeholder": {
              color: currentState?.placeholderColor,
              opacity: state === "modern" ? 0.7 : 1,
              fontSize: state === "modern" ? "0.875rem" : undefined,
            },
            "& .MuiInputBase-input": {
              padding: state === "modern" ? "0 16px" : undefined,
              display: "flex",
              alignItems: "center",
            },
            "& .MuiInputAdornment-root": {
              color: state === "modern" ? "#9ca3af" : undefined,
              "& .MuiSvgIcon-root": {
                fontSize: state === "modern" ? "1rem" : undefined,
              },
            },
          },
        }}
        {...otherProps}
      />
    </Box>
  );
};
