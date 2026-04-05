import { useMutation } from "@tanstack/react-query";
import { axiosHelper } from "../helpers/axios-helper";

export interface SendEmailNotificationPayload {
  to: string; // destinatario
  subject: string;
  message: string;
  // metadata opcional para enriquecer en el backend (se enviará como metadata)
  metadata?: Record<string, unknown>;
}

/**
 * Hook para integrar ms-notifications respetando la arquitectura del SPA (react-query)
 * Endpoint: POST /api/v1/notifications (JWT requerido si está disponible)
 * Payload esperado (README):
 *  { type: "EMAIL", message: string, email: string, metadata? }
 */
export const useNotifications = () => {
  const sendEmailNotification = useMutation({
    mutationFn: async (payload: SendEmailNotificationPayload) => {
      const { to, subject, message, metadata } = payload;
      // Compose message including subject; el MS utiliza 'message' y 'email'
      const body: Record<string, unknown> = {
        type: "EMAIL",
        message: subject ? `${subject}\n\n${message}` : message,
        email: to,
      };
      if (metadata && typeof metadata === "object") {
        body.metadata = metadata;
      }
      const resp = await axiosHelper.notifications.send(body);
      return resp.data;
    },
  });

  return {
    sendEmailNotification,
  };
};


