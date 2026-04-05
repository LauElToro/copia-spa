"use client";

import React from 'react';
import { Box, Typography, Stack, CircularProgress, Button as MuiButton } from '@mui/material';
import { CheckCircle, ArrowForward } from '@mui/icons-material';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';

interface VerificationSectionProps {
  title: string;
  isLoading: boolean;
  isVerified: boolean;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  verifiedText: string;
}

const VerificationSection: React.FC<VerificationSectionProps> = ({
  title,
  isLoading,
  isVerified,
  description,
  buttonText,
  onButtonClick,
  verifiedText,
}) => {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
        border: "2px solid rgba(41, 196, 128, 0.1)",
        borderRadius: "24px",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        "&:hover": {
          backgroundColor: "rgba(41, 196, 128, 0.08)",
          borderColor: "rgba(41, 196, 128, 0.4)",
        },
        padding: { xs: 3, md: 4 },
        gap: 2,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          fontWeight: 700,
          color: '#34d399',
          mb: 1,
          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        }}
      >
        {title}
      </Typography>
      
      {isLoading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} sx={{ color: '#29C480' }} />
          <Text variant="p" sx={{ color: '#fff' }}>Verificando...</Text>
        </Stack>
      )}
      
      {!isLoading && (
        <Stack spacing={2}>
          {!isVerified && (
            <>
              <Typography
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  lineHeight: 1.6,
                  color: "#ffffff",
                  opacity: 0.9,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {description}
              </Typography>
              <MuiButton
                onClick={onButtonClick}
                sx={{
                  px: 4,
                  py: 1.5,
                  backgroundColor: "#29C480",
                  color: "#1e293b",
                  fontWeight: 600,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  transition: "background-color 0.3s ease, color 0.3s ease",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  "&:hover": {
                    backgroundColor: "#ffffff",
                    color: "#000000"
                  },
                  "& .MuiSvgIcon-root": {
                    transition: "transform 0.3s ease"
                  },
                  "&:hover .MuiSvgIcon-root": {
                    transform: "translateX(4px)"
                  }
                }}
              >
                {buttonText}
                <ArrowForward sx={{ fontSize: 18 }} />
              </MuiButton>
            </>
          )}
          {isVerified && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Text variant="h6" sx={{ color: '#fff' }}>{verifiedText}</Text>
              <CheckCircle sx={{ color: '#29C480' }} />
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default VerificationSection;

