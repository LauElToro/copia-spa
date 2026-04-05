'use client';

import React, { useState } from 'react';
import { Box, Typography, TextField, Button as MuiButton, CircularProgress } from '@mui/material';

export interface QuestionComposerProps {
  label?: string;
  placeholder?: string;
  onSubmit: (content: string) => Promise<void> | void;
  isSubmitting?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  className?: string;
}

export const QuestionComposer: React.FC<QuestionComposerProps> = ({
  label,
  placeholder = 'Escribí tu pregunta...',
  onSubmit,
  isSubmitting = false,
  maxLength = 500,
  autoFocus = false,
  submitLabel = 'Publicar pregunta',
  submittingLabel = 'Publicando...',
  className = '',
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const remaining = maxLength - value.length;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
      setError(false);
    }
  };

  const handleBlur = () => {
    if (value.trim().length === 0 && value.length > 0) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim() || isSubmitting) {
      return;
    }

    await Promise.resolve(onSubmit(value.trim()));
    setValue('');
    setError(false);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%'
      }}
    >
      {label && (
        <Typography
          component="label"
          htmlFor="question-input"
          sx={{
            display: 'block',
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: '#ffffff',
            mb: 1,
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          {label}
        </Typography>
      )}

      <TextField
        id="question-input"
        name="question"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        error={error}
        placeholder={placeholder}
        required
        multiline
        rows={5}
        fullWidth
        autoFocus={autoFocus}
        disabled={isSubmitting}
        inputProps={{
          maxLength: maxLength
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#1f2937',
            color: '#ffffff',
            borderRadius: '4px',
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: error ? '#ef4444' : '#374151',
            },
            '&:hover fieldset': {
              borderColor: error ? '#ef4444' : '#22c55e',
            },
            '&.Mui-focused fieldset': {
              borderColor: error ? '#ef4444' : '#22c55e',
              boxShadow: error ? '0 0 0 1px rgba(239, 68, 68, 0.2)' : '0 0 0 1px rgba(34, 197, 94, 0.2)',
            },
            '& .MuiInputBase-input': {
              fontSize: '0.875rem',
              padding: '16px',
              '&::placeholder': {
                color: '#9ca3af',
                opacity: 0.7,
                fontSize: '0.875rem',
              },
            },
            '& textarea': {
              color: '#ffffff',
              fontSize: '0.875rem',
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              '&::placeholder': {
                color: '#9ca3af',
                opacity: 0.7,
                fontSize: '0.875rem',
              },
            },
          },
        }}
      />

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: '#9ca3af',
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          {remaining} caracteres restantes
        </Typography>
        
        <MuiButton
          type="submit"
          disabled={isSubmitting || value.trim().length === 0}
          startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: '#1e293b' }} /> : undefined}
          sx={{
            px: 4,
            py: 1.5,
            backgroundColor: '#29C480',
            color: '#1e293b',
            fontWeight: 600,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '1rem',
            transition: 'background-color 0.3s ease, color 0.3s ease',
            '&:hover': {
              backgroundColor: isSubmitting ? '#29C480' : '#ffffff',
              color: isSubmitting ? '#1e293b' : '#000000'
            },
            '&:disabled': {
              backgroundColor: '#29C480',
              color: '#1e293b',
              opacity: 0.6
            }
          }}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </MuiButton>
      </Box>
    </Box>
  );
};

export default QuestionComposer;

