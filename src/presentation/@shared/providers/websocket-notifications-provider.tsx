'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  useNativeWebSocket,
  NotificationPayload,
  AuthSuccessPayload,
} from '../hooks/use-native-websocket';

// Construir URL de WebSocket desde env
const WSS_BASE_URL = process.env.NEXT_PUBLIC_WSS_URL || 'http://localhost:3100';

// Convertir HTTP a WS protocol y agregar path /ws
function buildWebSocketUrl(baseUrl: string): string {
  let url = baseUrl;

  // Convertir http/https a ws/wss
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'ws://');
  } else if (url.startsWith('https://')) {
    url = url.replace('https://', 'wss://');
  } else if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
    url = `wss://${url}`;
  }

  // Siempre agregar /ws para el endpoint WebSocket nativo
  if (!url.endsWith('/ws')) {
    url = url.endsWith('/') ? `${url}ws` : `${url}/ws`;
  }

  return url;
}

export interface WebSocketNotification {
  id: string;
  accountId: string;
  message: string;
  timestamp: string;
  metadata?: {
    icon?: string;
    actionUrl?: string;
    read?: boolean;
  };
}

interface WebSocketNotificationsContextType {
  isConnected: boolean;
  isAuthenticated: boolean;
  isReconnecting: boolean;
  newNotifications: WebSocketNotification[];
  clearNewNotifications: () => void;
  addNotificationListener: (callback: (notification: WebSocketNotification) => void) => () => void;
}

const WebSocketNotificationsContext = createContext<WebSocketNotificationsContextType | undefined>(undefined);

export const WebSocketNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newNotifications, setNewNotifications] = useState<WebSocketNotification[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const listenersRef = useRef<Set<(notification: WebSocketNotification) => void>>(new Set());

  // Construir URL de WebSocket
  const wsUrl = buildWebSocketUrl(WSS_BASE_URL);

  // Callback para nuevas notificaciones
  const handleNotification = useCallback((notification: NotificationPayload) => {
    const wsNotification: WebSocketNotification = {
      id: notification.id,
      accountId: notification.accountId,
      message: notification.message,
      timestamp: notification.timestamp,
      metadata: notification.metadata,
    };

    setNewNotifications((prev) => {
      if (prev.some((n) => n.id === wsNotification.id)) {
        return prev;
      }
      return [wsNotification, ...prev];
    });

    // Notificar a todos los listeners
    listenersRef.current.forEach((callback) => {
      try {
        callback(wsNotification);
      } catch (error) {
        console.error('[WebSocketNotifications] Error in listener callback:', error);
      }
    });

    // Mostrar notificacion nativa del navegador si esta habilitado
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Liberty Club', {
        body: wsNotification.message,
        icon: '/favicon.ico',
      });
    }
  }, []);

  const handleNotificationsData = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[WebSocketNotifications] Received notifications data');
    }
  }, []);

  const handleAuthSuccess = useCallback((_user: AuthSuccessPayload) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[WebSocketNotifications] Authenticated');
    }
  }, []);

  // Solo registrar errores en desarrollo para no llenar consola cuando WSS/3100 no está levantado
  const handleError = useCallback((error: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[WebSocketNotifications]', error);
    }
  }, []);

  // Usar el hook de WebSocket nativo
  const {
    isConnected,
    isAuthenticated,
    isReconnecting,
    disconnect,
  } = useNativeWebSocket({
    url: wsUrl,
    token: authToken,
    enabled: !!authToken,
    reconnect: true,
    maxReconnectAttempts: 5,
    baseReconnectDelay: 3000,
    maxReconnectDelay: 15000,
    onNotification: handleNotification,
    onNotificationsData: handleNotificationsData,
    onAuthSuccess: handleAuthSuccess,
    onError: handleError,
  });

  // Obtener token de autenticacion
  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }, []);

  // Agregar listener para notificaciones
  const addNotificationListener = useCallback((callback: (notification: WebSocketNotification) => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  // Limpiar notificaciones nuevas
  const clearNewNotifications = useCallback(() => {
    setNewNotifications([]);
  }, []);

  // Efecto para obtener token inicial y escuchar cambios
  useEffect(() => {
    // Obtener token inicial
    setAuthToken(getAuthToken());

    // Handler para cambios de autenticacion
    const handleAuthChange = () => {
      const newToken = getAuthToken();

      if (!newToken) {
        setAuthToken(null);
        setNewNotifications([]);
        disconnect();
      } else {
        setAuthToken(newToken);
      }
    };

    // Escuchar eventos de cambio de auth
    window.addEventListener('auth-state-change', handleAuthChange);

    // Escuchar cambios en localStorage
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        handleAuthChange();
      }
    };
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener('auth-state-change', handleAuthChange);
      window.removeEventListener('storage', storageHandler);
    };
  }, [getAuthToken, disconnect]);

  return (
    <WebSocketNotificationsContext.Provider
      value={{
        isConnected,
        isAuthenticated,
        isReconnecting,
        newNotifications,
        clearNewNotifications,
        addNotificationListener,
      }}
    >
      {children}
    </WebSocketNotificationsContext.Provider>
  );
};

export const useWebSocketNotificationsContext = (): WebSocketNotificationsContextType => {
  const context = useContext(WebSocketNotificationsContext);
  if (context === undefined) {
    throw new Error('useWebSocketNotificationsContext must be used within a WebSocketNotificationsProvider');
  }
  return context;
};

export const useOptionalWebSocketNotificationsContext = (): WebSocketNotificationsContextType | undefined => {
  return useContext(WebSocketNotificationsContext);
};
