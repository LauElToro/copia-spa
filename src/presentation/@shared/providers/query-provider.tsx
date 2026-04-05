"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tiempo de caché por defecto
            staleTime: 1000 * 60 * 5, // 5 minutos
            // Tiempo que los datos se mantienen en caché sin usar
            gcTime: 1000 * 60 * 30, // 30 minutos
            // No refrescar automáticamente al cambiar de ventana
            refetchOnWindowFocus: false,
            // Reintentos en caso de error
            retry: (failureCount, error: Error) => {
              // No reintentar para errores de autenticación
              const axiosError = error as Error & { response?: { status?: number } };
              if (axiosError?.response?.status === 401 || axiosError?.response?.status === 403) {
                return false;
              }
              // Reintentar hasta 3 veces para otros errores
              return failureCount < 3;
            }},
          mutations: {
            // Configuración para mutations
            retry: false, // No reintentar mutations por defecto
          }}})
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools - deshabilitado temporalmente */}
      {/* {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )} */}
    </QueryClientProvider>
  );
}; 