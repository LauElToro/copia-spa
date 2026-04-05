"use client";

import React, { useState, useCallback } from 'react';
import { Box, Typography, Stack, CircularProgress, Button as MuiButton } from '@mui/material';
import { ShoppingCart, PointOfSale } from '@mui/icons-material';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import DataTable, { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { Alert } from '@/presentation/@shared/components/ui/atoms/alert';
import { SearchInput } from '@/presentation/@shared/components/ui/atoms/search-input';

interface TransactionsSectionProps {
  title: string;
  isLoading: boolean;
  isError: boolean;
  error?: Error | unknown;
  purchasesData: unknown[];
  salesData?: unknown[];
  purchasesColumns: DataTableColumn[];
  salesColumns?: DataTableColumn[];
  isCommerce?: boolean;
  onRetry: () => void;
}

const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  isLoading,
  isError,
  error,
  purchasesData,
  salesData = [],
  purchasesColumns,
  salesColumns = [],
  isCommerce = false,
  onRetry,
}) => {
  const [tab, setTab] = useState<'purchases' | 'sales'>('purchases');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSalesTab = useCallback(() => {
    setTab('sales');
  }, []);

  const handlePurchasesTab = useCallback(() => {
    setTab('purchases');
  }, []);

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
        gap: 3,
      }}
    >
      {/* Título y botones */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: '#34d399',
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          }}
        >
          {tab === "sales" ? "Ventas" : "Compras"}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            flex: { md: '0 0 auto' }
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ alignItems: 'center' }}>
            {isCommerce && (
              <MuiButton
                onClick={handleSalesTab}
                endIcon={<PointOfSale sx={{ fontSize: '1rem' }} />}
                sx={{
                  px: 4,
                  py: 1.5,
                  minHeight: '56px',
                  backgroundColor: tab === "sales" ? "#29C480" : "transparent",
                  color: tab === "sales" ? "#1e293b" : "#29C480",
                  fontWeight: 600,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  transition: "background-color 0.3s ease, color 0.3s ease",
                  border: tab === "sales" ? "none" : "1px solid",
                  borderColor: "#29C480",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  "&:hover": {
                    backgroundColor: tab === "sales" ? "#ffffff" : "rgba(41, 196, 128, 0.1)",
                    color: tab === "sales" ? "#000000" : "#29C480",
                  },
                  "& .MuiSvgIcon-root": {
                    transition: "transform 0.3s ease"
                  },
                  "&:hover .MuiSvgIcon-root": {
                    transform: "translateX(4px)"
                  }
                }}
              >
                Ventas
              </MuiButton>
            )}
            <MuiButton
              onClick={handlePurchasesTab}
              endIcon={<ShoppingCart sx={{ fontSize: '1rem' }} />}
              sx={{
                px: 4,
                py: 1.5,
                minHeight: '56px',
                backgroundColor: tab === "purchases" ? "#29C480" : "transparent",
                color: tab === "purchases" ? "#1e293b" : "#29C480",
                fontWeight: 600,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "1rem",
                transition: "background-color 0.3s ease, color 0.3s ease",
                border: tab === "purchases" ? "none" : "1px solid",
                borderColor: "#29C480",
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                "&:hover": {
                  backgroundColor: tab === "purchases" ? "#ffffff" : "rgba(41, 196, 128, 0.1)",
                  color: tab === "purchases" ? "#000000" : "#29C480",
                },
                "& .MuiSvgIcon-root": {
                  transition: "transform 0.3s ease"
                },
                "&:hover .MuiSvgIcon-root": {
                  transform: "translateX(4px)"
                }
              }}
            >
              Compras
            </MuiButton>
          </Stack>
          <Box sx={{ flex: { md: '0 0 auto' }, maxWidth: { xs: '100%', md: '360px' }, width: { xs: '100%', md: 'auto' } }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar transacciones..."
              debounceMs={0}
            />
          </Box>
        </Box>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            width: '100%',
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: '#29C480',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Box sx={{ textAlign: 'center', paddingY: 4 }}>
          <Stack spacing={2} alignItems="center">
            <Alert severity="error" sx={{ mb: 2 }}>
              Error al cargar las transacciones: {error instanceof Error ? error.message : 'Error desconocido'}
            </Alert>
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
            >
              Reintentar
            </Button>
          </Stack>
        </Box>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {/* Sales Tab */}
          {isCommerce && (
            <Box sx={{ display: tab === "sales" ? "block" : "none", width: '100%', maxWidth: '100%' }}>
              {salesData.length === 0 ? (
                <EmptyState
                  title="No tienes ventas aún"
                  message="Cuando realices ventas, aparecerán aquí."
                />
              ) : (
                <DataTable
                  id="transactions-sales-table"
                  columns={salesColumns}
                  data={salesData as Record<string, unknown>[]}
                  className="shadow-lg"
                  searching={false}
                  externalSearchTerm={searchTerm}
                  isLoading={isLoading}
                />
              )}
            </Box>
          )}

          {/* Purchases Tab */}
          <Box sx={{ display: tab === "purchases" ? "block" : "none", width: '100%', maxWidth: '100%' }}>
            {purchasesData.length === 0 ? (
              <EmptyState
                title="No se encontraron transacciones de compras"
                message="Tus compras aparecerán aquí cuando realices una transacción."
              />
            ) : (
              <DataTable
                id="transactions-purchases-table"
                columns={purchasesColumns}
                data={purchasesData as unknown as Record<string, unknown>[]}
                className="shadow-lg"
                searching={false}
                externalSearchTerm={searchTerm}
                isLoading={isLoading}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default TransactionsSection;
