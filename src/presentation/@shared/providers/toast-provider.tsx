"use client";

import React from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastProviderProps {
  children: React.ReactNode;
}

// Configuración por defecto para los toasts
const defaultToastConfig: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

// Helper functions para diferentes tipos de notificaciones
export const notificationService = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultToastConfig, ...options });
  },
  
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultToastConfig, ...options });
  },
  
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultToastConfig, ...options });
  },
  
  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultToastConfig, ...options });
  },
  
  // Función para errores de API con manejo especial
  apiError: (error: unknown, fallbackMessage: string = "Error en la operación") => {
    let errorMessage = fallbackMessage;
    
    const axiosError = error as Error & { 
      response?: { 
        data?: { message?: string }; 
        status?: number 
      }; 
      message?: string 
    };
    
    if (axiosError?.response?.data?.message) {
      errorMessage = axiosError.response.data.message;
    } else if (axiosError?.response?.status === 409) {
      errorMessage = "Conflicto: El email ya está registrado o datos duplicados";
    } else if (axiosError?.response?.status === 401) {
      errorMessage = "No autorizado: Verifica tus credenciales";
    } else if (axiosError?.response?.status === 500) {
      errorMessage = "Error del servidor: Intenta nuevamente más tarde";
    } else if (axiosError?.message) {
      errorMessage = axiosError.message;
    }
    
    toast.error(errorMessage, defaultToastConfig);
  },
  
  // Función para éxito de operaciones
  apiSuccess: (message: string, options?: ToastOptions) => {
    toast.success(message, { 
      ...defaultToastConfig, 
      autoClose: 3000,
      ...options 
    });
  }
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          border: '1px solid #29C480',
          borderRadius: '8px',
        }}
      />
    </>
  );
}; 