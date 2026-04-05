"use client";

import React, { useEffect } from "react";
import { Box, Container, Button } from "@mui/material";
import Link from "next/link";
import MainLayout from "@/presentation/@shared/components/layouts/main-layout";
import { EmptyState } from "@/presentation/@shared/components/ui/atoms/empty-state";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
    }
  }, [error]);

  return (
    <MainLayout>
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          backgroundColor: '#000000',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="xl">
          <EmptyState
            title="Algo salió mal"
            message="Ocurrió un error inesperado. Por favor, intenta nuevamente."
            action={
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  onClick={reset}
                  sx={{
                    px: 4,
                    py: 1.5,
                    backgroundColor: '#29C480',
                    color: '#1e293b',
                    fontWeight: 600,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: '#22c55e',
                    }
                  }}
                >
                  Intentar de nuevo
                </Button>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <Button
                    sx={{
                      px: 4,
                      py: 1.5,
                      backgroundColor: 'transparent',
                      color: '#29C480',
                      fontWeight: 600,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      border: '1px solid #29C480',
                      '&:hover': {
                        backgroundColor: 'rgba(41, 196, 128, 0.1)',
                      }
                    }}
                  >
                    Volver al inicio
                  </Button>
                </Link>
              </Box>
            }
          />
        </Container>
      </Box>
    </MainLayout>
  );
}


