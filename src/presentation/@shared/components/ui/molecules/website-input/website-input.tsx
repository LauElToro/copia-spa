import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Input } from "../../atoms/input";
import { DropdownButton } from "../dropdown-button";
import { WebsiteInputProps } from "./types";

export const WebsiteInput: React.FC<WebsiteInputProps> = ({
  value = "",
  onChange,
  protocol = "https",
  onProtocolChange,
  placeholder = "ejemplo.com",
  error = false,
  disabled = false,
  fullWidth = true,
  label,
  sx,
}) => {
  const protocolOptions = [
    { value: "http", label: "http://", native: "http://" },
    { value: "https", label: "https://", native: "https://" },
  ];

  // Estado local para el protocolo
  const [localProtocol, setLocalProtocol] = useState<string>(protocol);

  // Extraer la dirección sin el protocolo del valor completo
  const getAddressFromValue = (fullValue: string): string => {
    if (!fullValue) return "";
    // Remover http:// o https:// del inicio
    return fullValue.replace(/^https?:\/\//, "");
  };

  // Obtener el protocolo del valor completo
  const getProtocolFromValue = (fullValue: string): string => {
    if (!fullValue) return localProtocol;
    if (fullValue.startsWith("https://")) return "https";
    if (fullValue.startsWith("http://")) return "http";
    return localProtocol;
  };

  // Sincronizar el protocolo local con el valor cuando cambia externamente
  useEffect(() => {
    if (value) {
      const protocolFromValue = getProtocolFromValue(value);
      setLocalProtocol(protocolFromValue);
    } else {
      setLocalProtocol(protocol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, protocol]);

  const currentProtocol = value ? getProtocolFromValue(value) : localProtocol;
  const currentAddress = value ? getAddressFromValue(value) : "";

  const handleAddressChange = (address: string) => {
    const cleanAddress = address.trim();
    const fullUrl = cleanAddress
      ? `${currentProtocol}://${cleanAddress}`
      : "";
    onChange?.(fullUrl);
  };

  const handleProtocolChange = (option: { value: string; label: string }) => {
    const newProtocol = option.value;
    setLocalProtocol(newProtocol);
    onProtocolChange?.(newProtocol as "http" | "https");
    // Actualizar la URL completa siempre, incluso si no hay dirección
    const fullUrl = currentAddress
      ? `${newProtocol}://${currentAddress}`
      : "";
    onChange?.(fullUrl);
  };

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto", ...sx }}>
      {label && (
        <Typography
          component="label"
          sx={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#ffffff",
            mb: 1,
            fontFamily:
              "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {label}
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
          gap: 0,
          alignItems: "stretch",
          width: "100%",
          backgroundColor: "#1f2937",
          border: error ? "1px solid #ef4444" : "1px solid #374151",
          borderRadius: "4px",
          overflow: "hidden",
          transition: "all 0.2s ease",
          height: "56px",
          "&:hover": {
            borderColor: error ? "#ef4444" : "#22c55e",
          },
          "&:focus-within": {
            borderColor: error ? "#ef4444" : "#22c55e",
            boxShadow: error
              ? "0 0 0 1px rgba(239, 68, 68, 0.2)"
              : "0 0 0 1px rgba(34, 197, 94, 0.2)",
          },
        }}
      >
        {/* Select de protocolo */}
        <Box 
          sx={{ 
            flex: "0 0 auto", 
            minWidth: 120, 
            position: "relative", 
            display: "flex", 
            alignItems: "center",
            "& *": {
              border: "none !important",
              borderWidth: "0 !important",
              borderTopWidth: "0 !important",
              borderRightWidth: "0 !important",
              borderBottomWidth: "0 !important",
              borderLeftWidth: "0 !important",
              borderColor: "transparent !important",
              borderStyle: "none !important",
            },
            "& button": {
              border: "none !important",
              borderWidth: "0 !important",
              borderTopWidth: "0 !important",
              borderRightWidth: "0 !important",
              borderBottomWidth: "0 !important",
              borderLeftWidth: "0 !important",
              borderColor: "transparent !important",
              borderStyle: "none !important",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "1px",
              height: "32px",
              backgroundColor: "#374151",
              zIndex: 2,
            }}
          />
          <DropdownButton
            options={protocolOptions}
            value={currentProtocol}
            onChange={handleProtocolChange}
            placeholder="http://"
            fullWidth={true}
            searchable={true}
            disabled={disabled}
            disableHoverBorder={true}
            sx={{
              width: "100%",
              "& > div": {
                width: "100%",
                "& > div": {
                  width: "100%",
                  "& button": {
                    height: "56px !important",
                    minHeight: "56px !important",
                    maxHeight: "56px !important",
                    alignItems: "center",
                    display: "flex",
                    borderRadius: "0 !important",
                    border: "none !important",
                    borderWidth: "0 !important",
                    borderTopWidth: "0 !important",
                    borderRightWidth: "0 !important",
                    borderBottomWidth: "0 !important",
                    borderLeftWidth: "0 !important",
                    borderColor: "transparent !important",
                    borderStyle: "none !important",
                    boxShadow: "none !important",
                    backgroundColor: "transparent !important",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    margin: 0,
                    outline: "none",
                    "&:hover": {
                      border: "none !important",
                      borderWidth: "0 !important",
                      borderTopWidth: "0 !important",
                      borderRightWidth: "0 !important",
                      borderBottomWidth: "0 !important",
                      borderLeftWidth: "0 !important",
                      borderColor: "transparent !important",
                      borderStyle: "none !important",
                      boxShadow: "none !important",
                      backgroundColor: "transparent !important",
                    },
                    "&:hover:not(:disabled)": {
                      border: "none !important",
                      borderColor: "transparent !important",
                      borderWidth: "0 !important",
                      borderTopWidth: "0 !important",
                      borderRightWidth: "0 !important",
                      borderBottomWidth: "0 !important",
                      borderLeftWidth: "0 !important",
                      borderStyle: "none !important",
                      boxShadow: "none !important",
                      backgroundColor: "transparent !important",
                    },
                    "&:focus": {
                      border: "none !important",
                      borderWidth: "0 !important",
                      borderTopWidth: "0 !important",
                      borderRightWidth: "0 !important",
                      borderBottomWidth: "0 !important",
                      borderLeftWidth: "0 !important",
                      borderColor: "transparent !important",
                      borderStyle: "none !important",
                      boxShadow: "none !important",
                      outline: "none !important",
                    },
                    "&:focus-visible": {
                      outline: "none !important",
                      border: "none !important",
                      borderColor: "transparent !important",
                    },
                    "& .MuiTypography-root": {
                      fontSize: "0.875rem !important",
                      fontFamily:
                        "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      lineHeight: "1.5",
                      color: "#ffffff",
                    },
                  },
                },
              },
              "& button": {
                height: "56px !important",
                minHeight: "56px !important",
                maxHeight: "56px !important",
                alignItems: "center",
                display: "flex",
                borderRadius: "0 !important",
                border: "none !important",
                borderWidth: "0 !important",
                borderTopWidth: "0 !important",
                borderRightWidth: "0 !important",
                borderBottomWidth: "0 !important",
                borderLeftWidth: "0 !important",
                borderColor: "transparent !important",
                borderStyle: "none !important",
                boxShadow: "none !important",
                backgroundColor: "transparent !important",
                paddingLeft: "16px",
                paddingRight: "16px",
                margin: 0,
                outline: "none",
                "&:hover": {
                  border: "none !important",
                  borderWidth: "0 !important",
                  borderTopWidth: "0 !important",
                  borderRightWidth: "0 !important",
                  borderBottomWidth: "0 !important",
                  borderLeftWidth: "0 !important",
                  borderColor: "transparent !important",
                  borderStyle: "none !important",
                  boxShadow: "none !important",
                  backgroundColor: "transparent !important",
                },
                "&:hover:not(:disabled)": {
                  border: "none !important",
                  borderColor: "transparent !important",
                  borderWidth: "0 !important",
                  borderTopWidth: "0 !important",
                  borderRightWidth: "0 !important",
                  borderBottomWidth: "0 !important",
                  borderLeftWidth: "0 !important",
                  borderStyle: "none !important",
                  boxShadow: "none !important",
                  backgroundColor: "transparent !important",
                },
                "&:focus": {
                  border: "none !important",
                  borderWidth: "0 !important",
                  borderTopWidth: "0 !important",
                  borderRightWidth: "0 !important",
                  borderBottomWidth: "0 !important",
                  borderLeftWidth: "0 !important",
                  borderColor: "transparent !important",
                  borderStyle: "none !important",
                  boxShadow: "none !important",
                  outline: "none !important",
                },
                "&:focus-visible": {
                  outline: "none !important",
                  border: "none !important",
                  borderColor: "transparent !important",
                },
                "& .MuiTypography-root": {
                  fontSize: "0.875rem !important",
                  fontFamily:
                    "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  lineHeight: "1.5",
                  color: "#ffffff",
                },
              },
            }}
          />
        </Box>
        {/* Input de dirección */}
        <Box sx={{ flex: "1 1 auto", minWidth: 0, display: "flex", alignItems: "center", width: "100%", margin: 0, padding: 0 }}>
          <Input
            type="text"
            value={currentAddress}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleAddressChange(e.target.value)
            }
            state="modern"
            fullWidth
            placeholder={placeholder}
            error={false}
            disabled={disabled}
              sx={{
              width: "100% !important",
              margin: "0 !important",
              padding: "0 !important",
              "& > div": {
                width: "100% !important",
                maxWidth: "100% !important",
                margin: "0 !important",
                padding: "0 !important",
                position: "relative",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                border: "none !important",
                borderWidth: "0 !important",
                borderTopWidth: "0 !important",
                borderRightWidth: "0 !important",
                borderBottomWidth: "0 !important",
                borderLeftWidth: "0 !important",
                boxShadow: "none !important",
                backgroundColor: "transparent !important",
                height: "56px",
                minHeight: "56px",
                fontSize: "0.875rem",
                margin: "0 !important",
                padding: "0 !important",
                width: "100% !important",
                maxWidth: "100% !important",
                boxSizing: "border-box",
                "&:hover": {
                  border: "none !important",
                  borderWidth: "0 !important",
                  boxShadow: "none !important",
                },
                "&.Mui-focused": {
                  border: "none !important",
                  borderWidth: "0 !important",
                  boxShadow: "none !important",
                },
                "& fieldset": {
                  border: "none !important",
                  borderWidth: "0 !important",
                  borderTopWidth: "0 !important",
                  borderRightWidth: "0 !important",
                  borderBottomWidth: "0 !important",
                  borderLeftWidth: "0 !important",
                  padding: "0 !important",
                  margin: "0 !important",
                },
                "& .MuiInputBase-input": {
                  paddingLeft: "8px !important",
                  paddingRight: "16px !important",
                  padding: "0 16px 0 8px !important",
                  width: "100% !important",
                  maxWidth: "100% !important",
                  boxSizing: "border-box",
                  margin: 0,
                },
                "& input": {
                  paddingLeft: "8px !important",
                  paddingRight: "16px !important",
                  padding: "0 16px 0 8px !important",
                  fontSize: "0.875rem",
                  fontFamily:
                    "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  width: "100% !important",
                  maxWidth: "100% !important",
                  boxSizing: "border-box",
                  margin: 0,
                },
                "& input::placeholder": {
                  fontSize: "0.875rem",
                  opacity: 0.7,
                },
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

