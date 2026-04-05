import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { axiosHelper } from "../helpers/axios-helper";
import { useProfile } from "./use-profile";
import { useOptionalAuthContext } from "../contexts/auth-context";
import { useOptionalWebSocketNotificationsContext } from "../providers/websocket-notifications-provider";

export interface InAppNotification {
  id?: string;
  type: 'IN_APP';
  message: string;
  metadata: {
    icon?: string;
    actionUrl?: string;
    read: boolean;
    accountId: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  dateIso: string;
  seen: boolean;
  actionUrl?: string;
}

/**
 * Hook para gestionar notificaciones In-App con soporte WebSocket en tiempo real
 */
export const useInAppNotifications = () => {
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const authContext = useOptionalAuthContext();
  const wsContext = useOptionalWebSocketNotificationsContext();
  const accountId = (profile as { id?: string })?.id;
  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  // Callback para manejar nuevas notificaciones en tiempo real
  const handleNewNotification = useCallback(
    () => {
      // Invalidar queries para forzar refetch con los datos más recientes
      queryClient.invalidateQueries({ queryKey: ['notifications', 'in-app', accountId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', accountId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    [queryClient, accountId]
  );

  // Suscribirse a notificaciones WebSocket cuando el contexto está disponible
  useEffect(() => {
    if (!wsContext) return;

    const unsubscribe = wsContext.addNotificationListener(handleNewNotification);
    return unsubscribe;
  }, [wsContext, handleNewNotification]);

  // Query para obtener notificaciones por cuenta
  const getNotifications = useQuery({
    queryKey: ['notifications', 'in-app', accountId],
    queryFn: async () => {
      if (!accountId) {
        return [];
      }

      if (!hasToken) {
        return [];
      }

      try {
        const response = await axiosHelper.notifications.getInAppByAccount(accountId);
        // La respuesta tiene estructura: { data: { data: { data: [...] } } }
        const notifications = response.data?.data?.data || response.data?.data || [];
        return Array.isArray(notifications) ? notifications : [];
      } catch (error) {
        const axiosError = error as { response?: { status?: number }; code?: string; message?: string };
        const status = axiosError.response?.status;
        const isNetworkError = !status && (axiosError.code === 'ERR_NETWORK' || axiosError.message?.includes('EMPTY_RESPONSE') || axiosError.message?.includes('ECONNREFUSED'));

        if (status === 401 || isNetworkError) {
          queryClient.setQueryData(['notifications', 'in-app', accountId], []);
          return [];
        }

        throw error;
      }
    },
    enabled: !!accountId && (isAuthenticated || hasToken),
    staleTime: 30000,
    retry: false,
  });

  // Mutation para marcar todas como leídas
  const markAllAsRead = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await axiosHelper.notifications.markAllAsRead(accountId);
      return response.data;
    },
    onSuccess: (_data, accountId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'in-app', accountId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', accountId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutation para marcar una como leída
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosHelper.notifications.markAsRead(id);
      return response.data;
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData(['notifications', 'in-app', accountId], (old: InAppNotification[] | undefined) => {
        if (!old) return old;
        return old.map(notif => {
          if (notif.id === id || (notif as unknown as { metadata: { id?: string } }).metadata?.id === id) {
            return {
              ...notif,
              metadata: {
                ...notif.metadata,
                read: true,
              },
            };
          }
          return notif;
        });
      });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', accountId] });
    },
  });

  // Calcular notificaciones no leídas
  const unreadCount = getNotifications.data?.filter(
    (notif: { metadata: { read?: boolean } }) => !notif.metadata.read
  ).length || 0;

  // Transformar notificaciones al formato de la tabla
  const notificationsTable = getNotifications.data?.map((notif: InAppNotification, index: number) => ({
    id: notif.id || `n${index + 1}`,
    title: notif.message.split('\n')[0] || notif.message.substring(0, 50),
    description: notif.message.length > 50
      ? notif.message.substring(0, 50) + '...'
      : notif.message,
    dateIso: typeof notif.createdAt === 'string'
      ? notif.createdAt
      : notif.createdAt.toISOString(),
    seen: notif.metadata.read,
    actionUrl: notif.metadata.actionUrl,
  })) || [];

  return {
    notifications: getNotifications.data || [],
    notificationsTable,
    isLoading: getNotifications.isLoading,
    isError: getNotifications.isError,
    error: getNotifications.error,
    unreadCount,
    markAllAsRead: markAllAsRead.mutateAsync,
    markAsRead: markAsRead.mutateAsync,
    isMarkingAllAsRead: markAllAsRead.isPending,
    refetch: getNotifications.refetch,
    // WebSocket status
    isWebSocketConnected: wsContext?.isConnected ?? false,
  };
};
