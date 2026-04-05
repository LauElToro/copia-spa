"use client";

import React from "react";
import { Box, CircularProgress } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { Input } from "../input";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  isLoading = false,
  disabled = false,
  className = "",
  debounceMs = 500,
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);

    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si debounceMs es 0 o el valor está vacío, llamar inmediatamente sin debounce
    if (debounceMs === 0 || newValue.trim() === '') {
      onChange(newValue);
    } else {
      // Esperar a que el usuario termine de escribir (debounce)
      timeoutRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    }
  };

  // Cleanup al desmontar
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isDisabled = disabled || isLoading;

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Input
        type="text"
        state="modern"
        placeholder={placeholder}
        value={localValue}
        onChange={(event) => handleChange(event.target.value)}
        disabled={isDisabled}
        className={className}
        leftIcon={<SearchIcon />}
        rightIcon={
          isLoading ? (
            <CircularProgress
              size={20}
              sx={{
                color: '#29C480',
              }}
            />
          ) : undefined
        }
      />
    </Box>
  );
};

export default SearchInput;

