"use client";

import { useCallback, useRef } from 'react';
import { Box, Typography, Button as MuiButton, CircularProgress } from '@mui/material';
import { useModal } from './use-modal';
import type { ToastContextType } from '@/presentation/@shared/components/ui/molecules/toast';

interface UseDeleteConfirmationOptions {
  onConfirm: (id: string) => Promise<void> | void;
  itemName?: string;
  toast?: ToastContextType;
}

export const useDeleteConfirmation = () => {
  const { openModal, closeModal, updateModalContent } = useModal();
  const loadingRef = useRef(false);
  const onConfirmRef = useRef<((id: string) => Promise<void> | void) | null>(null);
  const idRef = useRef<string>('');
  const itemNameRef = useRef<string>('');
  const toastRef = useRef<ToastContextType | undefined>(undefined);

  const getModalContent = useCallback(() => {
    const loading = loadingRef.current;
    const itemName = itemNameRef.current;
    const toast = toastRef.current;

    const handleConfirm = async () => {
      if (onConfirmRef.current && idRef.current) {
        try {
          loadingRef.current = true;
          updateModalContent(getModalContent);
          await onConfirmRef.current(idRef.current);
          closeModal();
          loadingRef.current = false;
          onConfirmRef.current = null;
          idRef.current = '';
          itemNameRef.current = '';
          toastRef.current = undefined;
          if (toast) {
            toast.success('Producto eliminado correctamente');
          }
        } catch (error) {
          // El error debe ser manejado por el componente que llama
          console.error('Error al eliminar:', error);
          loadingRef.current = false;
          updateModalContent(getModalContent);
          if (toast) {
            toast.error('No se pudo eliminar el producto');
          }
          // No cerrar el modal si hay error, para que el usuario pueda reintentar
        }
      }
    };

    return (
      <Box
        sx={{
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          color: "#fff",
          py: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {/* Título */}
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
            Eliminar {itemName}
          </Typography>

          {/* Producto Section */}
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 500,
                mb: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              PRODUCTO
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                lineHeight: 1.6,
                color: "#34d399",
                fontWeight: 600,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {itemName}
            </Typography>
          </Box>

          {/* Mensaje de confirmación */}
          <Box>
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", md: "1rem" },
                lineHeight: 1.6,
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 500,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              ¿Desea eliminar este {itemName}? Esta acción no se puede deshacer.
            </Typography>
          </Box>

          {/* Action Buttons Section */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
            <MuiButton
              type="button"
              onClick={() => {
                closeModal();
                loadingRef.current = false;
                onConfirmRef.current = null;
                idRef.current = '';
                itemNameRef.current = '';
              }}
              variant="outlined"
              disabled={loading}
              sx={{
                px: 4,
                py: 1.5,
                borderWidth: '2px !important',
                borderColor: '#ef4444 !important',
                borderStyle: 'solid !important',
                color: '#ef4444 !important',
                backgroundColor: 'transparent !important',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none !important',
                '& fieldset': {
                  borderWidth: '2px !important',
                  borderColor: '#ef4444 !important',
                  borderStyle: 'solid !important',
                },
                '&:hover': {
                  borderWidth: '2px !important',
                  borderColor: '#ef4444 !important',
                  borderStyle: 'solid !important',
                  backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
                  boxShadow: 'none !important',
                  '& fieldset': {
                    borderWidth: '2px !important',
                    borderColor: '#ef4444 !important',
                    borderStyle: 'solid !important',
                  },
                },
                '&:disabled': {
                  borderColor: 'rgba(255, 255, 255, 0.3) !important',
                  color: 'rgba(255, 255, 255, 0.3) !important',
                  '& fieldset': {
                    borderWidth: '2px !important',
                    borderColor: 'rgba(255, 255, 255, 0.3) !important',
                    borderStyle: 'solid !important',
                  },
                },
              }}
            >
              Cancelar
            </MuiButton>
            <MuiButton
              type="button"
              onClick={handleConfirm}
              variant="contained"
              disabled={loading}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: loading ? '#374151' : '#ef4444',
                color: '#ffffff',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                transition: 'background-color 0.3s ease, color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  backgroundColor: loading ? '#374151' : '#dc2626',
                  color: '#ffffff'
                },
                '&:disabled': {
                  backgroundColor: '#374151',
                  color: 'rgba(255, 255, 255, 0.5)',
                  opacity: 0.6
                }
              }}
            >
              {loading && (
                <CircularProgress 
                  size={16} 
                  sx={{ 
                    color: '#ffffff',
                    marginRight: '4px'
                  }} 
                />
              )}
              {loading ? "Eliminando..." : "Eliminar"}
            </MuiButton>
          </Box>
        </Box>
      </Box>
    );
  }, [updateModalContent, closeModal]);

  const updateLoadingState = useCallback((loading: boolean) => {
    loadingRef.current = loading;
    updateModalContent(getModalContent);
  }, [updateModalContent, getModalContent]);

  const confirmDelete = useCallback(
    (id: string, options: UseDeleteConfirmationOptions) => {
      const { onConfirm, itemName, toast } = options;
      idRef.current = id;
      itemNameRef.current = itemName || 'elemento';
      onConfirmRef.current = onConfirm;
      toastRef.current = toast;
      loadingRef.current = false;

      openModal(getModalContent, {
        title: undefined,
        maxWidth: 'sm',
        actions: undefined,
      });
    },
    [openModal, getModalContent]
  );

  const updateLoading = useCallback((loading: boolean) => {
    updateLoadingState(loading);
  }, [updateLoadingState]);

  return { confirmDelete, updateLoading };
};

