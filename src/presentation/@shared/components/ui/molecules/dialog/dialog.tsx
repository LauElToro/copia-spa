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

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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

export const Dialog: React.FC<DialogProps> = ({
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
      PaperProps={{
        sx: {
          backgroundColor: '#0c0c0c',
          color: '#fff',
          borderRadius: 2,
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
          sx={{ position: 'absolute', top: 8, right: 8, color: '#aaa' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      )}
      <DialogContent sx={{ padding: 3 }}>
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

