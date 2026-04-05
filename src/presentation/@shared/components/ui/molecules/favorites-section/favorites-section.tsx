"use client";

import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import DataTable, { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { SearchInput } from '@/presentation/@shared/components/ui/atoms/search-input';
import { FavoriteItem } from '@/presentation/@shared/stores/favorites-store';

interface FavoritesSectionProps {
  title: string;
  isLoading: boolean;
  favoritesData: FavoriteItem[];
  columns: DataTableColumn[];
  onClearFavorites: () => void;
  isClearing: boolean;
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  title,
  isLoading,
  favoritesData,
  columns,
  onClearFavorites,
  isClearing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

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
          {title}
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
          <Button
            variant="secondary"
            size="md"
            onClick={onClearFavorites}
            disabled={isClearing || favoritesData.length === 0}
            isLoading={isClearing}
            sx={{
              px: 3,
              height: '56px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Limpiar Todo
          </Button>
          <Box sx={{ flex: { md: '0 0 auto' }, maxWidth: { xs: '100%', md: '360px' }, width: { xs: '100%', md: 'auto' } }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar favoritos..."
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

      {/* Content */}
      {!isLoading && (
        <>
          {favoritesData.length === 0 ? (
            <EmptyState
              title="Tu lista de favoritos está vacía"
              message="Agrega productos que te gusten para verlos aquí."
            />
          ) : (
            <DataTable
              id="favorites-table"
              columns={columns}
              data={favoritesData as unknown as Record<string, unknown>[]}
              className="shadow-lg"
              searching={false}
              externalSearchTerm={searchTerm}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default FavoritesSection;

