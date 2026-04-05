"use client";

import React from 'react';
import { Box } from '@mui/material';

export interface StatusBadgeProps {
  label: string;
  variant?: 'pending' | 'completed' | 'cancelled' | 'failed' | 'refunded' | 'approved' | 'paused';
}

const variantStyles: Record<NonNullable<StatusBadgeProps['variant']>, { bg: string; border: string; text: string }> = {
  pending: {
    bg: 'rgba(101, 116, 45, 0.3)', // Verde oliva oscuro
    border: '#D4AF37', // Amarillo dorado
    text: '#D4AF37', // Amarillo dorado
  },
  completed: {
    bg: 'rgba(41, 196, 128, 0.2)',
    border: '#29C480',
    text: '#29C480',
  },
  approved: {
    bg: 'rgba(41, 196, 128, 0.2)',
    border: '#29C480',
    text: '#29C480',
  },
  cancelled: {
    bg: 'rgba(239, 68, 68, 0.2)',
    border: '#EF4444',
    text: '#EF4444',
  },
  failed: {
    bg: 'rgba(239, 68, 68, 0.2)',
    border: '#EF4444',
    text: '#EF4444',
  },
  refunded: {
    bg: 'rgba(251, 191, 36, 0.2)',
    border: '#FBBF24',
    text: '#FBBF24',
  },
  paused: {
    bg: 'rgba(107, 114, 128, 0.2)',
    border: '#6B7280',
    text: '#6B7280',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant = 'pending' }) => {
  const styles = variantStyles[variant];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 12px',
        borderRadius: '8px',
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        color: styles.text,
        fontSize: '0.875rem',
        fontWeight: 600,
        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
};

export default StatusBadge;

