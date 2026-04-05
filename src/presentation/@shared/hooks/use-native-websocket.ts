/**
 * Hook de React para conexion WebSocket nativa
 * Reemplaza socket.io-client con WebSocket nativo del navegador
 * Incluye reconexion automatica con backoff exponencial
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Tipos de mensajes del protocolo
export type MessageType =
  | 'auth'
  | 'auth:success'
  | 'auth:error'
  | 'notification'
  | 'notifications:data'
  | 'dashboard:data'
  | 'ping'
  | 'pong'
  | 'error'
  | 'subscribe'
  | 'unsubscribe';

export type Channel = 'notifications' | 'dashboard';

export interface WebSocketMessage<T = unknown> {
  type: MessageType;
  payload?: T;
  channel?: Channel;
  timestamp: string;
  messageId?: string;
}

export interface AuthSuccessPayload {
  userId: string;
  username: string;
  email: string;
  accountId: string;
}

export interface NotificationPayload {
  id: string;
  accountId: string;
  message: string;
  timestamp: string;
  metadata?: {
    icon?: string;
    actionUrl?: string;
    read?: boolean;
    [key: string]: unknown;
  };
}

export interface NotificationsDataPayload {
  notifications: {
    unreadCount: number;
    items?: NotificationPayload[];
  };
}

// Configuracion del hook
export interface UseNativeWebSocketConfig {
  url: string;
  token: string | null;
  enabled?: boolean;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  baseReconnectDelay?: number;
  maxReconnectDelay?: number;
  pingInterval?: number;
  onNotification?: (notification: NotificationPayload) => void;
  onNotificationsData?: (data: NotificationsDataPayload) => void;
  onAuthSuccess?: (user: AuthSuccessPayload) => void;
  onError?: (error: string) => void;
}

// Estado del hook
export interface UseNativeWebSocketReturn {
  isConnected: boolean;
  isAuthenticated: boolean;
  isReconnecting: boolean;
  reconnectAttempt: number;
  connect: () => void;
  disconnect: () => void;
  subscribe: (channel: Channel) => void;
  unsubscribe: (channel: Channel) => void;
  send: <T>(message: WebSocketMessage<T>) => void;
}

// Constantes por defecto
const DEFAULT_CONFIG = {
  enabled: true,
  reconnect: true,
  maxReconnectAttempts: 10,
  baseReconnectDelay: 1000,
  maxReconnectDelay: 30000,
  pingInterval: 30000,
};

/**
 * Calcular delay de reconexion con backoff exponencial y jitter
 */
function calculateReconnectDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = exponentialDelay * 0.1 * Math.random();
  return exponentialDelay + jitter;
}

/**
 * Crear mensaje WebSocket
 */
function createMessage<T>(type: MessageType, payload?: T, channel?: Channel): WebSocketMessage<T> {
  return {
    type,
    payload,
    channel,
    timestamp: new Date().toISOString(),
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  };
}

/**
 * Hook principal para WebSocket nativo
 */
export function useNativeWebSocket(config: UseNativeWebSocketConfig): UseNativeWebSocketReturn {
  const {
    url,
    token,
    enabled = DEFAULT_CONFIG.enabled,
    reconnect = DEFAULT_CONFIG.reconnect,
    maxReconnectAttempts = DEFAULT_CONFIG.maxReconnectAttempts,
    baseReconnectDelay = DEFAULT_CONFIG.baseReconnectDelay,
    maxReconnectDelay = DEFAULT_CONFIG.maxReconnectDelay,
    onNotification,
    onNotificationsData,
    onAuthSuccess,
    onError,
  } = config;

  // Estado
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  // Refs para callbacks (evitar dependencias circulares)
  const onNotificationRef = useRef(onNotification);
  const onNotificationsDataRef = useRef(onNotificationsData);
  const onAuthSuccessRef = useRef(onAuthSuccess);
  const onErrorRef = useRef(onError);

  // Actualizar refs cuando cambien las callbacks
  useEffect(() => {
    onNotificationRef.current = onNotification;
    onNotificationsDataRef.current = onNotificationsData;
    onAuthSuccessRef.current = onAuthSuccess;
    onErrorRef.current = onError;
  }, [onNotification, onNotificationsData, onAuthSuccess, onError]);

  // Limpiar recursos
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // Enviar mensaje
  const send = useCallback(<T,>(message: WebSocketMessage<T>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Desconectar
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    cleanup();

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsAuthenticated(false);
    setIsReconnecting(false);
    setReconnectAttempt(0);
  }, [cleanup]);

  // Conectar
  const connect = useCallback(() => {
    if (!token || !enabled) return;

    // Limpiar conexion anterior
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    cleanup();

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);

        // Enviar autenticacion como primer mensaje
        const authMessage = createMessage('auth', { token });
        ws.send(JSON.stringify(authMessage));
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsAuthenticated(false);
        cleanup();

        // Intentar reconectar si no fue un cierre intencional
        if (shouldReconnectRef.current && event.code !== 1000 && reconnect) {
          setIsReconnecting(true);
          setReconnectAttempt(prev => {
            const currentAttempt = prev;
            if (currentAttempt < maxReconnectAttempts) {
              const delay = calculateReconnectDelay(currentAttempt, baseReconnectDelay, maxReconnectDelay);
              reconnectTimeoutRef.current = setTimeout(() => {
                setReconnectAttempt(p => p + 1);
              }, delay);
            } else {
              setIsReconnecting(false);
              onErrorRef.current?.('Max reconnection attempts reached');
            }
            return currentAttempt;
          });
        }
      };

      ws.onerror = () => {
        // Error silencioso
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'auth:success':
              setIsAuthenticated(true);
              setReconnectAttempt(0);
              setIsReconnecting(false);
              onAuthSuccessRef.current?.(message.payload as AuthSuccessPayload);
              break;

            case 'auth:error':
              setIsAuthenticated(false);
              shouldReconnectRef.current = false;
              onErrorRef.current?.((message.payload as { error: string })?.error || 'Authentication failed');
              break;

            case 'notification':
              onNotificationRef.current?.(message.payload as NotificationPayload);
              break;

            case 'notifications:data':
              onNotificationsDataRef.current?.(message.payload as NotificationsDataPayload);
              break;

            case 'ping':
              // Responder al ping del servidor
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(createMessage('pong')));
              }
              break;

            case 'error':
              onErrorRef.current?.((message.payload as { error: string })?.error || 'Server error');
              break;

            default:
              // Mensaje desconocido, ignorar
              break;
          }
        } catch {
          // Error al parsear mensaje, ignorar
        }
      };

    } catch {
      // Error de conexión, ignorar
      setIsReconnecting(true);
    }
  }, [url, token, enabled, cleanup, reconnect, maxReconnectAttempts, baseReconnectDelay, maxReconnectDelay]);

  // Suscribirse a canal
  const subscribe = useCallback((channel: Channel) => {
    send(createMessage('subscribe', { channel }, channel));
  }, [send]);

  // Desuscribirse de canal
  const unsubscribe = useCallback((channel: Channel) => {
    send(createMessage('unsubscribe', { channel }, channel));
  }, [send]);

  // Efecto para conectar/desconectar
  useEffect(() => {
    if (enabled && token) {
      shouldReconnectRef.current = true;
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, token]);

  // Efecto para manejar reconexiones
  useEffect(() => {
    if (reconnectAttempt > 0 && shouldReconnectRef.current && enabled && token) {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconnectAttempt]);

  return {
    isConnected,
    isAuthenticated,
    isReconnecting,
    reconnectAttempt,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
  };
}
