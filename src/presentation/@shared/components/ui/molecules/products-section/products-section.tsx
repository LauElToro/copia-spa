"use client";

import React, { useState } from 'react';
import { Box, Typography, Stack, CircularProgress, Menu, MenuItem } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { SearchInput } from '@/presentation/@shared/components/ui/atoms/search-input';
import DataTable, { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';

interface ProductsSectionProps {
  title: string;
  isLoading: boolean;
  isError: boolean;
  tableData: unknown[];
  columns: DataTableColumn[];
  onCreateProduct: () => void;
  onUploadMassive: () => void;
  onRetry: () => void;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({
  title,
  isLoading,
  isError,
  tableData,
  columns,
  onCreateProduct,
  onUploadMassive,
  onRetry,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (callback: () => void) => {
    handleDropdownClose();
    callback();
  };

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
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              gap: 2,
              mb: 2,
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
              {title}
            </Typography>
            <Stack 
              direction="row" 
              spacing={2} 
              sx={{ 
                flexWrap: 'wrap',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: 'center',
                width: { xs: '100%', md: 'auto' }
              }}
            >
              <Box>
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={handleDropdownClick}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  Crear producto
                  <KeyboardArrowDown
                    style={{
                      transition: 'transform 500ms ease',
                      transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                      fontSize: '1rem',
                    }}
                  />
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleDropdownClose}
                  sx={{
                    '& .MuiPaper-root': {
                      background: '#111827',
                      borderRadius: '0px',
                      mt: 2,
                      minWidth: 240,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                    },
                  }}
                  transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                >
                  <MenuItem
                    onClick={() => handleMenuItemClick(onCreateProduct)}
                    sx={{
                      px: 2,
                      py: 2,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      borderLeft: '3px solid transparent',
                      cursor: 'pointer',
                      color: '#ffffff',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: '#374151',
                        borderLeft: '3px solid #22c55e',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{
                      fontWeight: 500,
                      fontSize: '1rem'
                    }}>
                      Individual
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleMenuItemClick(onUploadMassive)}
                    sx={{
                      px: 2,
                      py: 2,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      borderLeft: '3px solid transparent',
                      cursor: 'pointer',
                      color: '#ffffff',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: '#374151',
                        borderLeft: '3px solid #22c55e',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{
                      fontWeight: 500,
                      fontSize: '1rem'
                    }}>
                      Masivo
                    </Typography>
                  </MenuItem>
                </Menu>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 auto' }, maxWidth: { xs: '100%', md: '360px' }, width: { xs: '100%', md: 'auto' } }}>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar productos"
                  debounceMs={0}
                />
              </Box>
            </Stack>
          </Box>

      {isLoading && (
        <Box sx={{ textAlign: 'center', paddingY: 4 }}>
          <CircularProgress sx={{ color: '#29C480' }} size="large" />
        </Box>
      )}

      {isError && (
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 3,
            px: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <Box
              component="svg"
              sx={{
                width: 24,
                height: 24,
                color: '#ef4444',
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </Box>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              textAlign: 'center',
              mb: 2,
              maxWidth: '300px',
            }}
          >
            Error al cargar los productos
          </Typography>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            sx={{
              fontSize: '0.8125rem',
              px: 2,
              py: 0.75,
            }}
          >
            Reintentar
          </Button>
        </Box>
      )}

      {!isLoading && !isError && (
        <>
          {tableData.length === 0 ? (
            <EmptyState
              title="No tienes productos cargados aún"
              action={
                <Button variant="primary" onClick={onCreateProduct}>
                  Crear tu primer producto
                </Button>
              }
            />
          ) : (
            <DataTable
              id="products-table"
              columns={columns}
              data={tableData as Record<string, unknown>[]}
              className="shadow-lg"
              externalSearchTerm={searchTerm}
              searching={false}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default ProductsSection;

