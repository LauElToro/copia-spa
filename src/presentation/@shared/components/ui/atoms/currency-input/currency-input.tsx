import React, { useState, useEffect } from 'react';
import { Input } from '../input';
import { InputProps } from '../input/types';
import { Box, Typography } from '@mui/material';

export interface CurrencyInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  name: string;
  id: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  name,
  id,
  ...props
}) => {
  // Separar el valor en parte entera y decimal
  const getIntegerAndDecimal = (val: number | string): { integer: string; decimal: string } => {
    if (!val && val !== 0) return { integer: '', decimal: '' };
    
    // Si el valor es 0, retornar strings vacíos para mostrar placeholder
    if (val === 0 || val === '0') return { integer: '', decimal: '' };
    
    const numStr = String(val);
    const parts = numStr.split('.');
    
    return {
      integer: parts[0] || '',
      decimal: parts[1] || '',
    };
  };

  const initialValues = getIntegerAndDecimal(value);
  const [integerPart, setIntegerPart] = useState<string>(initialValues.integer);
  const [decimalPart, setDecimalPart] = useState<string>(initialValues.decimal);

  // Sincronizar cuando cambia el value prop
  useEffect(() => {
    const { integer, decimal } = getIntegerAndDecimal(value);
    setIntegerPart(integer);
    setDecimalPart(decimal);
  }, [value]);

  const handleIntegerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    // Solo permitir números
    const cleanedValue = inputValue.replace(/[^0-9]/g, '');
    setIntegerPart(cleanedValue);
    
    // Combinar y emitir el cambio
    const combinedValue = cleanedValue + (decimalPart ? `.${decimalPart}` : '');
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: combinedValue || '',
        name,
        id,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    
    onChange(syntheticEvent);
  };

  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    // Solo permitir números, máximo 2 dígitos
    const cleanedValue = inputValue.replace(/[^0-9]/g, '').slice(0, 2);
    setDecimalPart(cleanedValue);
    
    // Combinar y emitir el cambio
    const combinedValue = (integerPart || '') + (cleanedValue ? `.${cleanedValue}` : '');
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: combinedValue || '',
        name,
        id,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    
    onChange(syntheticEvent);
  };

  const isModern = props.state === 'modern';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        borderRadius: isModern ? '4px' : undefined,
        border: isModern ? '1px solid #374151' : 'none',
        backgroundColor: isModern ? '#1f2937' : 'transparent',
        height: isModern ? '56px' : 'auto',
        minHeight: isModern ? '56px' : undefined,
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: isModern ? 'all 0.2s ease' : undefined,
        '&:hover': isModern ? {
          borderColor: '#22c55e',
        } : {},
        '&:focus-within': isModern ? {
          borderColor: '#22c55e',
          boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
        } : {},
      }}
    >
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          minWidth: 0, // Permite que el flex item se contraiga
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            border: 'none',
            backgroundColor: 'transparent',
            height: isModern ? '56px' : 'auto',
            minHeight: isModern ? '56px' : undefined,
            width: '100%',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
              boxShadow: 'none',
            },
            '& input': {
              height: isModern ? '56px' : 'auto',
              padding: isModern ? '0 16px' : undefined,
              fontSize: isModern ? '0.875rem' : undefined,
              width: '100%',
            },
          },
        }}
      >
        <Input
          {...props}
          type="text"
          name={`${name}_integer`}
          id={`${id}_integer`}
          value={integerPart}
          onChange={handleIntegerChange}
          inputMode="numeric"
          placeholder="00"
          state={isModern ? undefined : props.state}
          sx={{
            width: '100%',
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              height: isModern ? '56px' : 'auto',
              minHeight: isModern ? '56px' : undefined,
              width: '100%',
            },
            '& input': {
              height: isModern ? '56px' : 'auto',
              fontSize: isModern ? '0.875rem' : undefined,
              width: '100%',
            },
            ...props.sx,
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '16px',
          flexShrink: 0,
          px: 0.5,
          height: isModern ? '56px' : 'auto',
        }}
      >
        <Typography
          sx={{
            fontSize: isModern ? '0.875rem' : '1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          ,
        </Typography>
      </Box>
      <Box
        sx={{
          width: '80px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            border: 'none',
            backgroundColor: 'transparent',
            height: isModern ? '56px' : 'auto',
            minHeight: isModern ? '56px' : undefined,
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
              boxShadow: 'none',
            },
            '& input': {
              height: isModern ? '56px' : 'auto',
              padding: isModern ? '0 16px' : undefined,
              fontSize: isModern ? '0.875rem' : undefined,
            },
          },
        }}
      >
        <Input
          {...props}
          type="text"
          name={`${name}_decimal`}
          id={`${id}_decimal`}
          value={decimalPart}
          onChange={handleDecimalChange}
          inputMode="numeric"
          placeholder="00"
          state={isModern ? undefined : props.state}
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              height: isModern ? '56px' : 'auto',
              minHeight: isModern ? '56px' : undefined,
            },
            '& input': {
              height: isModern ? '56px' : 'auto',
              fontSize: isModern ? '0.875rem' : undefined,
            },
            ...props.sx,
          }}
        />
      </Box>
    </Box>
  );
};

export default CurrencyInput;
