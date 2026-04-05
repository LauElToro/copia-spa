"use client";

import React from 'react';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';

interface PendingTasksSectionProps {
  message: string;
  linkText: string;
  linkHref: string;
}

const PendingTasksSection: React.FC<PendingTasksSectionProps> = ({
  message,
  linkText,
  linkHref,
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
        Tareas pendientes
      </Typography>
      
      <Text
        variant="p"
        align="center"
        fontWeight={600}
        sx={{ 
          marginY: 2, 
          color: '#fff',
          fontSize: { xs: "0.875rem", md: "1rem" },
          lineHeight: 1.6,
        }}
      >
        {message}
        <Link
          href={linkHref}
          style={{ color: '#29C480', textDecoration: 'none', marginLeft: '4px' }}
        >
          {linkText}
        </Link>
      </Text>
    </Box>
  );
};

export default PendingTasksSection;

