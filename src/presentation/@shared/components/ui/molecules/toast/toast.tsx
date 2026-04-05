"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Box, Grow } from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Warning, Info } from '@mui/icons-material';
import type { TransitionProps } from '@mui/material/transitions';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  options?: ToastOptions;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface GrowTransitionProps extends TransitionProps {
  children: React.ReactElement;
}

const GrowTransition = React.forwardRef<unknown, GrowTransitionProps>(function GrowTransition(
  props,
  ref,
) {
  return <Grow ref={ref} {...props} timeout={{ enter: 400, exit: 300 }} />;
});

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle sx={{ color: '#22c55e' }} />;
    case 'error':
      return <ErrorIcon sx={{ color: '#ef4444' }} />;
    case 'warning':
      return <Warning sx={{ color: '#f59e0b' }} />;
    case 'info':
      return <Info sx={{ color: '#3b82f6' }} />;
    default:
      return <Info sx={{ color: '#3b82f6' }} />;
  }
};


export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', options?: ToastOptions) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      id,
      message,
      type,
      options,
    };

    setToasts((prev) => [...prev, newToast]);

    const duration = options?.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, options?: ToastOptions) => {
    showToast(message, 'success', options);
  }, [showToast]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    showToast(message, 'error', options);
  }, [showToast]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    showToast(message, 'warning', options);
  }, [showToast]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    showToast(message, 'info', options);
  }, [showToast]);

  const getAnchorOrigin = (position?: ToastOptions['position']) => {
    switch (position) {
      case 'top-left':
        return { vertical: 'top' as const, horizontal: 'left' as const };
      case 'top-center':
        return { vertical: 'top' as const, horizontal: 'center' as const };
      case 'top-right':
        return { vertical: 'top' as const, horizontal: 'right' as const };
      case 'bottom-left':
        return { vertical: 'bottom' as const, horizontal: 'left' as const };
      case 'bottom-center':
        return { vertical: 'bottom' as const, horizontal: 'center' as const };
      case 'bottom-right':
        return { vertical: 'bottom' as const, horizontal: 'right' as const };
      default:
        return { vertical: 'bottom' as const, horizontal: 'center' as const };
    }
  };

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'rgba(34, 197, 94, 0.15)';
      case 'error':
        return 'rgba(239, 68, 68, 0.15)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.15)';
      case 'info':
        return 'rgba(59, 130, 246, 0.15)';
      default:
        return 'rgba(59, 130, 246, 0.15)';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {toasts.map((toast) => {
        const anchorOrigin = getAnchorOrigin(toast.options?.position || 'bottom-center');
        return (
          <Snackbar
            key={toast.id}
            open={true}
            autoHideDuration={toast.options?.duration ?? 5000}
            onClose={() => removeToast(toast.id)}
            anchorOrigin={anchorOrigin}
            TransitionComponent={GrowTransition}
            sx={{
              '& .MuiSnackbar-root': {
                bottom: anchorOrigin.vertical === 'bottom' ? '32px !important' : undefined,
                top: anchorOrigin.vertical === 'top' ? '24px !important' : undefined,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 2,
                backgroundColor: getBackgroundColor(toast.type),
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                minWidth: { xs: '280px', sm: '320px' },
                maxWidth: { xs: 'calc(100vw - 32px)', sm: '420px' },
                border: 'none',
                animation: 'toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                '@keyframes toastSlideIn': {
                  '0%': {
                    transform: 'translateY(20px) scale(0.95)',
                    opacity: 0,
                  },
                  '100%': {
                    transform: 'translateY(0) scale(1)',
                    opacity: 1,
                  },
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getIcon(toast.type)}
              </Box>
              <Box
                component="span"
                sx={{
                  flex: 1,
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 500,
                  lineHeight: 1.5,
                }}
              >
                {toast.message}
              </Box>
            </Box>
          </Snackbar>
        );
      })}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

