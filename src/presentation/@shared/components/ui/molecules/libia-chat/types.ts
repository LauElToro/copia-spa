// Re-export ChatMessage from chat-messages molecule for backward compatibility
export type { ChatMessage } from '../chat-messages';

export type ChatRole = "user" | "assistant" | "system";

export interface ChatRequestPayload {
  question: string;
  userType?: string; // 'user' | 'seller' | 'panel' | 'product'
  budget?: number | null;
  codigoIdentificacionUsuario?: string | null;
  codigoIdentificacionComercio?: string | null;
  plan?: string | null;
  productId?: string | null; // Para contexto producto
}

export interface ChatSuccessResponse {
  response: string;
}

export interface ChatErrorResponse {
  detail?: string;
  error?: string;
}

export interface LibiaChatProps {
  endpoint: string;
  /** Si se define, usa streaming (respuesta tipo ChatGPT) */
  streamEndpoint?: string;

  userType: string; // 'user' | 'seller' | 'panel' | 'product'
  codigoIdentificacionUsuario?: string | null;
  codigoIdentificacionComercio?: string | null;
  plan?: string | null;
  budget?: number | null;
  productId?: string | null;

  title?: string;
  subtitle?: string;
  avatarUrl?: string;
  brandColor?: string;
  position?: "bottom-right" | "bottom-left";
  openByDefault?: boolean;

  placeholder?: string;
  sendLabel?: string;
  quickReplies?: string[];
  className?: string;
}