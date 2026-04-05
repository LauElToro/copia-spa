'use client';

import React, { useState } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import { Fingerprint as FingerprintIcon, ContentPaste, Check as CheckIcon } from '@mui/icons-material';

interface TransactionHashInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onPaste?: (value: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
}

export const TransactionHashInput: React.FC<TransactionHashInputProps> = ({
  value,
  onChange,
  onBlur,
  onPaste,
  label = 'Hash de la transacción',
  placeholder = '0x...',
  helperText,
  error = false,
  disabled = false,
}) => {
  const [pasted, setPasted] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmedText = text.trim();
      onChange(trimmedText);
      setPasted(true);
      setTimeout(() => setPasted(false), 2000);
      onPaste?.(trimmedText);
    } catch {
      // Fallback para navegadores que no soportan clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        document.execCommand('paste');
        const text = textArea.value;
        document.body.removeChild(textArea);
        const trimmedText = text.trim();
        onChange(trimmedText);
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
        onPaste?.(trimmedText);
      } catch {
        // Error al pegar
      }
    }
  };

  return (
    <Box>
      <Typography
        sx={{
          color: '#ffffff',
          fontSize: { xs: '0.95rem', md: '1rem' },
          fontWeight: 600,
          mb: 2,
          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          p: 2,
          backgroundColor: '#1f2937',
          borderRadius: '4px',
          border: error ? '1px solid #ef4444' : '1px solid #374151',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          transition: 'border-color 0.2s ease',
          '&:hover': {
            borderColor: error ? '#ef4444' : '#29C480',
          },
        }}
      >
        <FingerprintIcon
          sx={{
            color: '#29C480',
            fontSize: '1rem',
            flexShrink: 0,
          }}
        />
        <TextField
          fullWidth
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setPasted(false);
          }}
          onBlur={onBlur}
          disabled={disabled}
          error={error}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              background: 'transparent',
              borderRadius: '0',
              border: 'none',
              color: '#29C480',
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
              '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.5)',
              },
              '& input': {
                color: '#29C480',
                fontSize: '0.875rem',
                padding: '0',
                wordBreak: 'break-all',
              },
              '& input::placeholder': {
                color: 'rgba(41, 196, 128, 0.5)',
                opacity: 1,
              },
            },
          }}
        />
        <IconButton
          onClick={handlePaste}
          disabled={disabled}
          size="small"
          sx={{
            color: pasted ? '#29C480' : 'rgba(41, 196, 128, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(41, 196, 128, 0.1)',
              color: '#29C480',
            },
            transition: 'all 0.2s ease',
          }}
          title="Pegar hash"
        >
          {pasted ? <CheckIcon sx={{ fontSize: '1rem' }} /> : <ContentPaste sx={{ fontSize: '1rem' }} />}
        </IconButton>
      </Box>
      {helperText && (
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.75rem',
            mt: 1,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

