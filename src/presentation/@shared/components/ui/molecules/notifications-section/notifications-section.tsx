"use client";

import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { DoneAll, Error as ErrorIcon } from '@mui/icons-material';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import DataTable, { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { SearchInput } from '@/presentation/@shared/components/ui/atoms/search-input';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';

interface NotificationsSectionProps {
  title: string;
  isLoading: boolean;
  isError: boolean;
  error?: Error | unknown;
  notificationsData: unknown[];
  columns: DataTableColumn[];
  unseenCount: number;
  onRetry: () => void;
  onMarkAllAsSeen: () => void;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  title,
  isLoading,
  isError,
  error,
  notificationsData,
  columns,
  unseenCount,
  onRetry,
  onMarkAllAsSeen,
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
      {/* Título y controles */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Text 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem'
              }}
            >
              No leídas: {unseenCount}
            </Text>
            <Button
              variant="primary"
              onClick={onMarkAllAsSeen}
            >
              Marcar todas como leídas
              <DoneAll sx={{ fontSize: 18, ml: 1, verticalAlign: 'middle' }} />
            </Button>
          </Box>
          <Box sx={{ flex: { md: '0 0 auto' }, maxWidth: { xs: '100%', md: '360px' }, width: { xs: '100%', md: 'auto' } }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar notificaciones..."
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
        <Box
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
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}
          >
            <ErrorIcon sx={{ fontSize: 32, color: '#ef4444' }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: '#ffffff',
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            Error al cargar las notificaciones
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.875rem',
              textAlign: 'center',
              maxWidth: '400px',
              mb: 3,
              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            }}
          >
            {error instanceof Error 
              ? error.message.includes('401') || error.message.includes('Invalid or expired token')
                ? 'Tu sesión ha expirado. Por favor, cierra sesión y vuelve a iniciar sesión para continuar.'
                : error.message.includes('403') || error.message.includes('Forbidden')
                ? 'No tienes permisos para ver las notificaciones. Contacta al administrador.'
                : error.message
              : 'Ocurrió un error desconocido. Por favor, intenta nuevamente.'}
          </Typography>
          <Button
            variant="primary"
            onClick={onRetry}
            sx={{
              minWidth: '140px',
            }}
          >
            Reintentar
          </Button>
        </Box>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <Box sx={{ width: '100%', maxWidth: '100%' }}>
          {notificationsData.length === 0 ? (
            <EmptyState
              title="No tienes notificaciones"
              message="Las notificaciones aparecerán aquí cuando recibas actualizaciones."
            />
          ) : (
            <DataTable
              id="notifications-table"
              columns={columns}
              data={notificationsData as Record<string, unknown>[]}
              className="shadow-lg"
              searching={false}
              externalSearchTerm={searchTerm}
              isLoading={isLoading}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default NotificationsSection;

