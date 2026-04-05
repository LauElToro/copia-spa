'use client';

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Remove, Add } from '@mui/icons-material';
import { Input } from '../../atoms/input';

export interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  showStockFormat?: boolean;
  totalStock?: number;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
  showLabel = true,
  disabled = false,
  isLoading = false,
  className = '',
  showStockFormat = false,
  totalStock = 0
}) => {
  const handleIncrement = () => {
    const effectiveMax = showStockFormat && totalStock > 0 ? Math.min(max, totalStock) : max;
    if (!disabled && !isLoading && value < effectiveMax) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (!disabled && !isLoading && value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    // Permitir cadena vacía temporalmente mientras el usuario escribe
    if (newInputValue === '') {
      // No actualizar el estado si está vacío, mantener el valor actual
      return;
    }
    // Solo procesar si es un número válido
    const numValue = Number.parseInt(newInputValue, 10);
    if (Number.isNaN(numValue)) {
      return;
    }
    const effectiveMax = showStockFormat && totalStock > 0 ? Math.min(max, totalStock) : max;
    
    if (numValue >= min && numValue <= effectiveMax) {
      onChange(numValue);
    } else if (numValue < min) {
      onChange(min);
    } else if (numValue > effectiveMax) {
      onChange(effectiveMax);
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Cuando pierde el foco, asegurar que siempre haya un valor válido
    const inputValue = e.target.value;
    if (inputValue === '' || Number.isNaN(Number.parseInt(inputValue, 10))) {
      const effectiveMax = showStockFormat && totalStock > 0 ? Math.min(max, totalStock) : max;
      const currentValue = value !== undefined && value !== null && !Number.isNaN(Number(value)) 
        ? Number(value) 
        : (min !== undefined ? min : 1);
      onChange(Math.max(min, Math.min(currentValue, effectiveMax)));
    }
  };

  const effectiveMax = showStockFormat && totalStock > 0 ? Math.min(max, totalStock) : max;
  const isDecrementDisabled = disabled || isLoading || value <= min;
  const isIncrementDisabled = disabled || isLoading || value >= effectiveMax;

  return (
    <Box 
      className={`quantity-input ${className}`} 
      sx={{ 
        width: showLabel ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
      }}
    >
      {showLabel && label && (
        <Typography
          component="label"
          htmlFor="quantity-input-field"
          sx={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#ffffff',
            whiteSpace: 'nowrap',
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            lineHeight: '48px',
            height: '48px'
          }}
        >
          {label}:
        </Typography>
      )}
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: showLabel ? 'auto' : 'auto',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #374151',
          backgroundColor: '#1f2937',
          transition: 'all 0.2s ease',
          height: '48px',
          flex: showLabel ? '0 0 auto' : '1 1 auto',
          '&:hover': {
            borderColor: '#22c55e'
          },
          '&:focus-within': {
            borderColor: '#22c55e',
            boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)'
          }
        }}
      >
        {/* Botón Decrementar */}
        <IconButton
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          size="small"
          sx={{
            minWidth: '48px',
            width: '48px',
            height: '48px',
            flexShrink: 0,
            color: '#ffffff',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 0,
            padding: 0,
            transition: 'all 0.2s ease',
            borderRight: '1px solid #374151',
            '&:hover:not(:disabled)': {
              backgroundColor: '#374151',
              color: '#22c55e'
            },
            '&:disabled': {
              color: '#4b5563',
              opacity: 0.5,
              cursor: 'not-allowed'
            },
            '&:focus-visible': {
              outline: '2px solid #22c55e',
              outlineOffset: '-2px'
            }
          }}
          aria-label="decrease quantity"
        >
          <Remove sx={{ fontSize: '1rem' }} />
        </IconButton>

        {/* Input */}
        <Input
          key={`quantity-input-${value}-${effectiveMax}`}
          type="text"
          inputMode="numeric"
          name="quantity"
          id="quantity-input-field"
          value={(() => {
            // Asegurar que siempre tengamos un valor numérico válido y convertirlo a string
            const numValue = value !== undefined && value !== null && !Number.isNaN(Number(value)) 
              ? Number(value) 
              : (min !== undefined ? min : 1);
            // Retornar como string para asegurar que siempre se muestre
            return String(numValue);
          })()}
          onChange={handleInputChange}
          onBlur={handleBlur}
          state="modern"
          disabled={disabled || isLoading}
          sx={{
            flex: 1,
            minWidth: '60px',
            maxWidth: '80px',
            display: 'flex',
            alignItems: 'center',
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              border: 'none',
              height: '48px',
              minHeight: '48px',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              '& fieldset': {
                display: 'none'
              },
              '&:hover fieldset': {
                display: 'none'
              },
              '&.Mui-focused fieldset': {
                display: 'none'
              }
            },
            '& .MuiInputBase-input': {
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.9375rem',
              padding: '0 6px',
              color: '#ffffff',
              width: '100%',
              height: '48px',
              lineHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0
              }
            }
          }}
          inputProps={{
            style: {
              textAlign: 'center',
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
              fontWeight: 600,
              height: '48px',
              lineHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            },
            pattern: '[0-9]*',
            inputMode: 'numeric',
            onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
              // Permitir solo números y teclas de control
              const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
              const isNumber = /^[0-9]$/.test(e.key);
              const isAllowedKey = allowedKeys.includes(e.key);
              const isControlKey = e.ctrlKey || e.metaKey;
              
              if (!isNumber && !isAllowedKey && !isControlKey) {
                e.preventDefault();
              }
            }
          }}
        />

        {/* Botón Incrementar */}
        <IconButton
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          size="small"
          sx={{
            minWidth: '48px',
            width: '48px',
            height: '48px',
            flexShrink: 0,
            color: '#ffffff',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 0,
            padding: 0,
            transition: 'all 0.2s ease',
            borderLeft: '1px solid #374151',
            '&:hover:not(:disabled)': {
              backgroundColor: '#374151',
              color: '#22c55e'
            },
            '&:disabled': {
              color: '#4b5563',
              opacity: 0.5,
              cursor: 'not-allowed'
            },
            '&:focus-visible': {
              outline: '2px solid #22c55e',
              outlineOffset: '-2px'
            }
          }}
          aria-label="increase quantity"
        >
          <Add sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>
      
      {/* Texto del stock total fuera del contenedor del input */}
      {showStockFormat && totalStock > 0 && (
        <Typography
          component="span"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 400,
            color: '#4b5563',
            lineHeight: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none',
            flexShrink: 0,
            ml: 1,
            whiteSpace: 'nowrap'
          }}
        >
          de {totalStock} máximo
        </Typography>
      )}
    </Box>
  );
};

export default QuantityInput;

