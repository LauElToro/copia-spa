'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, Container, Stack } from '@mui/material';
import { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import NotificationsSection from '@/presentation/@shared/components/ui/molecules/notifications-section';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { useInAppNotifications, NotificationItem } from '@/presentation/@shared/hooks/use-in-app-notifications';
import { useProfile } from '@/presentation/@shared/hooks/use-profile';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { profile } = useProfile();
  const accountId = (profile as { id?: string })?.id;
  const toast = useToast();
  const {
    notificationsTable,
    isLoading,
    isError,
    error,
    unreadCount,
    markAllAsRead,
    isMarkingAllAsRead,
    refetch
  } = useInAppNotifications();

  // Formatear datos para la tabla
  const formattedNotifications = useMemo(() => {
    return notificationsTable.map((item: NotificationItem) => ({
      ...item,
      date: new Date(item.dateIso).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }));
  }, [notificationsTable]);

  const columns: DataTableColumn[] = useMemo(() => [
    { title: 'ID', data: 'id', responsivePriority: 1 },
    { title: 'TÍTULO', data: 'title', responsivePriority: 1, searchable: true },
    { title: 'DESCRIPCIÓN', data: 'description', responsivePriority: 1, searchable: true },
    {
      title: 'ESTADO', data: 'seen', responsivePriority: 1, type: 'html',
      render: function(data: unknown, type: string){
        if (type === 'display'){
          const seen = Boolean(data);
          const badgeStyles = seen
            ? { bg: 'rgba(107, 114, 128, 0.2)', border: '#6B7280', text: '#6B7280' }
            : { bg: 'rgba(41, 196, 128, 0.2)', border: '#29C480', text: '#29C480' };
          return `
            <div style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 4px 12px;
              border-radius: 8px;
              background-color: ${badgeStyles.bg};
              border: 1px solid ${badgeStyles.border};
              color: ${badgeStyles.text};
              font-size: 0.875rem;
              font-weight: 600;
              font-family: 'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              white-space: nowrap;
            ">
              ${seen ? 'Leída' : 'Nueva'}
            </div>
          `;
        }
        return data as string;
      }
    },
    { title: 'FECHA', data: 'date', responsivePriority: 1, searchable: true },
    {
      title: 'ACCIONES', data: 'actionUrl', orderable: false, searchable: false, type: 'html',
      render: function(data: unknown, type: string){
        if (type === 'display') {
          const actionUrl = (data as string) || '/admin/panel/notifications';
          return `
            <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end;">
              <a
                  href="${actionUrl}"
                  style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 32px;
                    background-color: #29C480;
                    color: #1e293b;
                    font-weight: 600;
                    border-radius: 8px;
                    text-transform: none;
                    font-size: 1rem;
                    text-decoration: none;
                    transition: background-color 0.3s ease, color 0.3s ease;
                    min-width: 100px;
                  "
                  onmouseover="this.style.backgroundColor='#ffffff'; this.style.color='#000000'"
                  onmouseout="this.style.backgroundColor='#29C480'; this.style.color='#1e293b'"
              >
                Ver
              </a>
            </div>
          `;
        }
        return data as string;
      },
      responsivePriority: 1}
  ], []);


  const handleMarkAllAsSeen = useCallback(async () => {
    if (!accountId) {
      toast.error('No se pudo identificar tu cuenta', { position: 'bottom-center' });
      return;
    }

    try {
      await markAllAsRead(accountId);
      toast.success('Todas las notificaciones han sido marcadas como leídas', { position: 'bottom-center' });
    } catch (error) {
      toast.error('Error al marcar las notificaciones como leídas', { position: 'bottom-center' });
      console.error('Error marking all as read:', error);
    }
  }, [accountId, markAllAsRead, toast]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: "100%",
        backgroundColor: '#000000',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: 'Notificaciones' }
              ]}
            />
            <NotificationsSection
              title="Notificaciones"
              isLoading={isLoading || isMarkingAllAsRead}
              isError={isError}
              error={error}
              notificationsData={formattedNotifications}
              columns={columns}
              unseenCount={unreadCount}
              onRetry={handleRetry}
              onMarkAllAsSeen={handleMarkAllAsSeen}
            />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}


