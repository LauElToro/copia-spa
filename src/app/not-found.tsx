"use client";

import React from "react";
import { Box, Container, Button } from "@mui/material";
import Link from "next/link";
import MainLayout from "@/presentation/@shared/components/layouts/main-layout";
import { EmptyState } from "@/presentation/@shared/components/ui/atoms/empty-state";

export default function NotFound() {
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
            title="404 - Página no encontrada"
            message="Lo sentimos, la página que estás buscando no existe o ha sido movida."
            action={
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button
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
                  Volver al inicio
                </Button>
              </Link>
            }
          />
        </Container>
      </Box>
    </MainLayout>
  );
}











