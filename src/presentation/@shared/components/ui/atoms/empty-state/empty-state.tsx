"use client";

import React, { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  action,
  className = "",
}) => {
  const defaultIcon = (
    <Box
      component="svg"
      sx={{
        width: 32,
        height: 32,
        color: '#ffffff',
      }}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      {/* Lupa principal */}
      <circle cx="11" cy="11" r="7" strokeWidth="2" />
      <path d="m20 20-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
      {/* Signo de interrogación dentro de la lupa */}
      <circle cx="11" cy="9" r="0.5" fill="currentColor" />
      <path d="M11 11.5v2" strokeWidth="1.5" strokeLinecap="round" />
    </Box>
  );

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: '#29C480',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          boxShadow: '0 4px 12px rgba(41, 196, 128, 0.3)',
        }}
      >
        {icon || defaultIcon}
      </Box>
      <Typography
        variant="h5"
        sx={{
          color: '#ffffff',
          fontWeight: 600,
          mb: message ? 1 : 0,
          fontSize: { xs: '1.25rem', md: '1.5rem' },
        }}
      >
        {title}
      </Typography>
      {message && (
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.875rem',
            textAlign: 'center',
            maxWidth: '400px',
            mb: action ? 3 : 0,
          }}
        >
          {message}
        </Typography>
      )}
      {action && (
        <Box sx={{ mt: 2 }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
