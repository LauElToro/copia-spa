import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOptionalWebSocketNotificationsContext } from '../providers/websocket-notifications-provider';
import { useProfile } from './use-profile';

/**
 * Hook para acceder a las notificaciones en tiempo real via WebSocket
 * Integra con React Query para actualizar el cache automáticamente
 */
export const useWebSocketNotifications = () => {
  const context = useOptionalWebSocketNotificationsContext();
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const accountId = (profile as { id?: string })?.id;

  // Callback para manejar nuevas notificaciones
  const handleNewNotification = useCallback(
    () => {
      // Invalidar las queries de notificaciones para que se refresquen
      queryClient.invalidateQueries({ queryKey: ['notifications', 'in-app', accountId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', accountId] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    [queryClient, accountId]
  );

  // Suscribirse a nuevas notificaciones cuando el contexto está disponible
  useEffect(() => {
    if (!context) return;

    const unsubscribe = context.addNotificationListener(handleNewNotification);
    return unsubscribe;
  }, [context, handleNewNotification]);

  return {
    isConnected: context?.isConnected ?? false,
    newNotifications: context?.newNotifications ?? [],
    clearNewNotifications: context?.clearNewNotifications ?? (() => {}),
    isAvailable: !!context,
  };
};

export default useWebSocketNotifications;

