"use client";

import { useCallback, useRef } from 'react';
import { Box, Typography, Button as MuiButton, CircularProgress } from '@mui/material';
import { useModal } from './use-modal';
import type { ToastContextType } from '@/presentation/@shared/components/ui/molecules/toast';

interface UsePauseConfirmationOptions {
  onConfirm: (id: string, paused: boolean) => Promise<void> | void;
  itemName?: string;
  paused: boolean;
  toast?: ToastContextType;
}

export const usePauseConfirmation = () => {
  const { openModal, closeModal, updateModalContent } = useModal();
  const loadingRef = useRef(false);
  const onConfirmRef = useRef<((id: string, paused: boolean) => Promise<void> | void) | null>(null);
  const idRef = useRef<string>('');
  const pausedRef = useRef<boolean>(false);
  const itemNameRef = useRef<string>('');
  const toastRef = useRef<ToastContextType | undefined>(undefined);

  const getModalContent = useCallback(() => {
    const loading = loadingRef.current;
    const paused = pausedRef.current;
    const itemName = itemNameRef.current;
    const toast = toastRef.current;
    const actionTextCapitalized = paused ? 'Publicar' : 'Pausar';
    const buttonColor = paused ? '#34d399' : '#ef4444';

    const handleConfirm = async () => {
      if (onConfirmRef.current && idRef.current) {
        try {
          loadingRef.current = true;
          updateModalContent(getModalContent);
          await onConfirmRef.current(idRef.current, pausedRef.current);
          closeModal();
          loadingRef.current = false;
          onConfirmRef.current = null;
          idRef.current = '';
          pausedRef.current = false;
          itemNameRef.current = '';
          toastRef.current = undefined;
          if (toast) {
            toast.success(
              paused 
                ? 'Producto publicado correctamente' 
                : 'Producto pausado correctamente'
            );
          }
        } catch (error) {
          // El error debe ser manejado por el componente que llama
          console.error('Error al cambiar estado:', error);
          loadingRef.current = false;
          updateModalContent(getModalContent);
          if (toast) {
            toast.error(
              paused 
                ? 'No se pudo publicar el producto' 
                : 'No se pudo pausar el producto'
            );
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
            {actionTextCapitalized} {itemName}
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
              {paused
                ? `¿Desea publicar este ${itemName} para que vuelva a estar visible?`
                : `¿Desea pausar este ${itemName} para que deje de estar visible?`}
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
                pausedRef.current = false;
                itemNameRef.current = '';
              }}
              variant="outlined"
              disabled={loading}
              sx={{
                px: 4,
                py: 1.5,
                borderWidth: '2px !important',
                borderColor: `${buttonColor} !important`,
                borderStyle: 'solid !important',
                color: `${buttonColor} !important`,
                backgroundColor: 'transparent !important',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none !important',
                '& fieldset': {
                  borderWidth: '2px !important',
                  borderColor: `${buttonColor} !important`,
                  borderStyle: 'solid !important',
                },
                '&:hover': {
                  borderWidth: '2px !important',
                  borderColor: `${buttonColor} !important`,
                  borderStyle: 'solid !important',
                  backgroundColor: `${buttonColor}15 !important`,
                  boxShadow: 'none !important',
                  '& fieldset': {
                    borderWidth: '2px !important',
                    borderColor: `${buttonColor} !important`,
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
                backgroundColor: loading ? '#374151' : buttonColor,
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
                  backgroundColor: loading ? '#374151' : (paused ? '#22c55e' : '#dc2626'),
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
              {loading 
                ? (paused ? "Publicando..." : "Pausando...") 
                : actionTextCapitalized}
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

  const confirmPause = useCallback(
    (id: string, options: UsePauseConfirmationOptions) => {
      const { onConfirm, itemName, paused, toast } = options;
      idRef.current = id;
      itemNameRef.current = itemName || 'elemento';
      onConfirmRef.current = onConfirm;
      pausedRef.current = paused;
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

  return { confirmPause, updateLoading };
};

