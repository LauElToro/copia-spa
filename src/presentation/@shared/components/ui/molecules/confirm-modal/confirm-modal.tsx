"use client";

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'success' | 'danger' | 'secondary';
  title?: string;
  children: React.ReactNode;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  title,
  children,
  loading = false,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
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
          <Typography variant="h6">{title}</Typography>
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
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton
            onClick={onClose}
            sx={{ color: '#aaa' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}
      <DialogContent sx={{ padding: 3 }}>
        {children}
      </DialogContent>
      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} size="sm" onClick={onConfirm} isLoading={loading} disabled={loading}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;


