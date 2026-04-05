import React, { ReactNode } from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'success' | 'danger' | 'secondary';
      isLoading?: boolean;
      disabled?: boolean;
    };
    secondary?: {
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'success' | 'danger' | 'secondary';
      disabled?: boolean;
    };
  };
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  title,
  maxWidth = 'sm',
  fullWidth = true,
  actions,
}) => {
  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disablePortal={false}
      transitionDuration={{ appear: 300, enter: 400, exit: 200 }}
      sx={{
        '& .MuiDialog-container': {
          zIndex: 9999, // Z-index muy alto para el contenedor del Dialog
        },
        '& .MuiBackdrop-root': {
          zIndex: 0, // El backdrop debe estar por debajo del modal
          position: 'fixed',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) !important',
          '@keyframes backdropFadeIn': {
            '0%': {
              opacity: 0,
            },
            '100%': {
              opacity: 1,
            },
          },
        },
        '& .MuiBackdrop-root.MuiBackdrop-entered': {
          animation: 'backdropFadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        },
        '& .MuiDialog-paper': {
          zIndex: '10000 !important', // El modal debe estar por encima del backdrop (9998)
          position: 'relative',
        },
        zIndex: 9999, // Z-index muy alto para asegurar que esté por encima del menú (1400)
      }}
      slotProps={{
        backdrop: {
          sx: {
            zIndex: 0, // El backdrop debe estar por debajo del modal
            position: 'fixed',
          },
        },
      }}
      PaperProps={{
        style: {
          zIndex: 10000, // Forzar z-index directamente en el estilo
        },
        sx: {
          backgroundColor: '#0c0c0c',
          color: '#fff',
          borderRadius: 2,
          zIndex: '10000 !important', // El modal debe estar por encima del backdrop (9998) y del menú
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms, opacity 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms !important',
          '@keyframes modalSlideIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.9) translateY(-20px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
          '@keyframes modalSlideOut': {
            '0%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
            '100%': {
              opacity: 0,
              transform: 'scale(0.95) translateY(-10px)',
            },
          },
        },
      }}
      TransitionProps={{
        onEnter: (node: HTMLElement) => {
          node.style.opacity = '0';
          node.style.transform = 'scale(0.9) translateY(-20px)';
        },
        onEntering: (node: HTMLElement) => {
          node.style.transition = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms, opacity 400ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms';
        },
        onEntered: (node: HTMLElement) => {
          node.style.opacity = '1';
          node.style.transform = 'scale(1) translateY(0)';
        },
        onExit: (node: HTMLElement) => {
          node.style.transition = 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)';
        },
        onExiting: (node: HTMLElement) => {
          node.style.opacity = '0';
          node.style.transform = 'scale(0.95) translateY(-10px)';
        },
      }}
    >
      {title && (
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h6" weight="bold">{title}</Text>
          <IconButton
            onClick={onClose}
            sx={{ color: '#aaa' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      {!title && (
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, color: '#aaa' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      )}
      <DialogContent sx={{ 
        padding: (!title && !actions) ? 0 : 3,
        '&.MuiDialogContent-root': {
          padding: (!title && !actions) ? 0 : undefined
        }
      }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ padding: 2, gap: 1 }}>
          {actions.secondary && (
            <Button
              variant={actions.secondary.variant || 'secondary'}
              onClick={actions.secondary.onClick}
              disabled={actions.secondary.disabled}
            >
              {actions.secondary.label}
            </Button>
          )}
          {actions.primary && (
            <Button
              variant={actions.primary.variant || 'primary'}
              onClick={actions.primary.onClick}
              isLoading={actions.primary.isLoading}
              disabled={actions.primary.disabled}
            >
              {actions.primary.label}
            </Button>
          )}
        </DialogActions>
      )}
    </MuiDialog>
  );
};

