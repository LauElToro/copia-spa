"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type {
  LibiaChatProps,
  ChatRequestPayload,
  ChatSuccessResponse,
  ChatErrorResponse,
} from "./types";
import { ChatLauncher } from '../chat-launcher';
import { ChatMessages, ChatMessage } from '../chat-messages';
import { AiSearchInput } from '../ai-search-input/ai-search-input';
import { VoiceToggleButton } from '../voice-toggle-button';
import { LibiaLoadingBar } from '../libia-loading-bar';
import { useVoiceRecognition } from '@/presentation/@shared/hooks/use-voice-recognition';
import "./libia-chat.css";
import "../ai-search-input/ai-search-input.css";

const getCrypto = (): Crypto | undefined => {
  const c = (globalThis as unknown as { crypto?: Crypto })?.crypto;
  return typeof c === "object" ? c : undefined;
};

const genId: () => string = (() => {
  const c = getCrypto();

  if (c && typeof (c as Crypto & { randomUUID?: () => string }).randomUUID === "function") {
    return () => (c as Crypto & { randomUUID: () => string }).randomUUID();
  }

  if (c && typeof c.getRandomValues === "function") {
    return () => {
      const a = new Uint8Array(16);
      c.getRandomValues(a);
      a[6] = (a[6] & 0x0f) | 0x40;
      a[8] = (a[8] & 0x3f) | 0x80;
      const b2h = (n: number) => n.toString(16).padStart(2, "0");
      const h = Array.from(a, b2h).join("");
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    };
  }

  let counter = 0;
  return () => `msg-${Date.now().toString(36)}-${(counter++).toString(36)}`;
})();

async function fetchJson<T>(url: string, opts: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const { timeoutMs = 30000, ...init } = opts;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: init.method ?? "POST",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
      body: init.body,
      credentials: "omit",
      cache: "no-store",
    });

    let data: unknown = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await res.json().catch(() => ({}));
    } else {
      const text = await res.text().catch(() => "");
      data = { response: text };
    }

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`) as Error & { data?: unknown; status?: number };
      err.data = data;
      err.status = res.status;
      throw err;
    }

    return data as T;
  } finally {
    clearTimeout(t);
  }
}

export default function LibiaChat({
  endpoint,
  streamEndpoint,
  userType,
  codigoIdentificacionUsuario,
  codigoIdentificacionComercio,
  plan,
  budget,
  productId,
  title = "Libia",
  subtitle = "Asistente de LibertyClub",
  avatarUrl = "/images/libia-avatar.svg",
  position = "bottom-right",
  openByDefault = false,
  sendLabel = "Enviar",
  quickReplies = [
    "¿Cómo configuro mis wallets?",
    "¿Cómo configurar la cotización de mis productos?",
    "¿Por qué me conviene pagar en criptos?",
    "¿Qué garantías tengo por mi compra?",
    "¿Cómo creo mi tienda?",
    "¿Qué plan me recomiendan?",
    "¿Cómo cargar un producto?",
  ],
  className,
  onOpenChange,
}: LibiaChatProps & { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(openByDefault);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showFAQ] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false); // Always false by default
  const [showConfigView, setShowConfigView] = useState(false);
  const [configVoiceEnabled, setConfigVoiceEnabled] = useState<boolean>(false);
  const [configAutoActions, setConfigAutoActions] = useState<boolean>(false);
  const scrollPositionRef = useRef<number>(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spokenMessageIdsRef = useRef<Set<string>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "greet",
      role: "assistant",
      html: "<p>👋 ¡Hola! Soy Libia, la IA de LibertyClub. ¿En qué puedo ayudarte?</p>",
      timestamp: Date.now(),
    },
  ]);

  // Voice is always disabled on page load for privacy and security
  // User must manually activate it each session

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('libia-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setConfigVoiceEnabled(config.voiceEnabled || false);
        setConfigAutoActions(config.autoActions || false);
      } catch (error) {
        console.warn('Error loading Libia config:', error);
      }
    }
  }, []);

  // Load voices when component mounts (some browsers need this)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Trigger voices to load
      window.speechSynthesis.getVoices();

      // Some browsers fire voiceschanged event
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };

      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  // Verifica si LIBIA (libia.libertyclub.io) está disponible vía proxy
  const checkAvailability = useCallback(async () => {
    try {
      const { isFrontendMockMode } = await import('@/presentation/@shared/mocks/frontend-mock-flag');
      if (isFrontendMockMode()) {
        setIsAvailable(true);
        return;
      }
      const res = await fetch('/api/v1/libia/health', {
        method: 'GET',
        credentials: 'omit',
        cache: 'no-store',
      });
      if (!res.ok) return setIsAvailable(false);
      const data = await res.json();
      setIsAvailable(data?.status === 'healthy' || data?.status === 'degraded');
    } catch {
      setIsAvailable(false);
    }
  }, []);

  useEffect(() => {
    checkAvailability();
    const interval = setInterval(checkAvailability, 30000); // 30s para no saturar cuando Libia está down
    return () => clearInterval(interval);
  }, [checkAvailability]);

  // Voice Recognition
  const {
    isListening,
    startListening,
    stopListening,
  } = useVoiceRecognition({
    wakeWord: 'hey libia',
    enabled: voiceEnabled,
    requireWakeWord: !open, // Only require "Hey Libia" when modal is closed
    onWakeWordDetected: () => {
      console.log('🎤 onWakeWordDetected called, open:', open);

      // Open modal if closed
      if (!open) {
        console.log('🎤 Opening modal...');
        setOpen(true);
        onOpenChange?.(true);

        // Add Libia's response message after a short delay to ensure modal is open
        setTimeout(() => {
          const libiaResponse: ChatMessage = {
            id: `libia-response-${Date.now()}`,
            role: 'assistant',
            html: '<p>¿En qué puedo ayudarte?</p>',
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, libiaResponse]);
          console.log('🎤 Libia response added to messages');
        }, 100);
      } else {
        // Modal already open, just add response
        console.log('🎤 Modal already open, adding response...');
        const libiaResponse: ChatMessage = {
          id: `libia-response-${Date.now()}`,
          role: 'assistant',
          html: '<p>¿En qué puedo ayudarte?</p>',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, libiaResponse]);
      }
    },
    onTranscriptComplete: (transcript: string) => {
      // Set input and submit
      setInput(transcript);
      // Auto-submit after a short delay
      setTimeout(() => {
        if (transcript.trim()) {
          sendMessage(transcript);
        }
      }, 100);
    },
    onListening: (listening) => {
      // Visual feedback
      console.log('Listening:', listening);
    },
  });

  // Toggle voice
  const toggleVoice = useCallback(async () => {
    const newState = !voiceEnabled;

    if (newState) {
      // Try to start listening (will request permission if needed)
      const started = await startListening();

      // Only update state if successfully started or permission was granted
      if (started) {
        setVoiceEnabled(true);
        // Note: We don't save to localStorage anymore
        // Voice must be manually enabled each session for privacy
      }
    } else {
      // Stop listening
      stopListening();
      setVoiceEnabled(false);
    }
  }, [voiceEnabled, startListening, stopListening]);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (!listRef.current) return;

    const doScroll = () => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    };

    // Immediate scroll
    doScroll();

    // Backup scrolls with delays
    setTimeout(doScroll, 50);
    setTimeout(doScroll, 150);
    setTimeout(doScroll, 300);
  }, []);

  // Scroll to bottom whenever messages change (incl. streaming updates)
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Save scroll position when opening modal and prevent body scroll
  useEffect(() => {
    if (open) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
    } else {
      // Restore body scroll and position
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Auto-focus input when returning from config view
  useEffect(() => {
    if (!showConfigView && open) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [showConfigView, open]);

  // Helper function to extract text from HTML
  const extractTextFromHtml = useCallback((html: string | undefined): string => {
    if (!html) return '';
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // Get text content and clean it up
    return tempDiv.textContent || tempDiv.innerText || '';
  }, []);

  // Function to speak text using Web Speech API
  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Helper function to get voices (may need to wait for them to load)
    const getVoices = (): SpeechSynthesisVoice[] => {
      let voices = window.speechSynthesis.getVoices();
      // If no voices available, wait a bit and try again
      if (voices.length === 0) {
        // Trigger voiceschanged event to load voices
        window.speechSynthesis.getVoices();
        voices = window.speechSynthesis.getVoices();
      }
      return voices;
    };

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Configure voice settings for a subtle female voice
    utterance.lang = 'es-ES'; // Spanish
    utterance.rate = 0.9; // Slightly slower for a more subtle, calm voice
    utterance.pitch = 1.1; // Slightly higher pitch for a more feminine voice
    utterance.volume = 0.85; // Slightly lower volume for subtlety

    // Try to find a Spanish female voice
    const voices = getVoices();
    if (voices.length > 0) {
      // Filtrar voces femeninas por nombre o por "female" en la metadata
      let femaleVoices = voices.filter(v => {
        const name = v.name.toLowerCase();
        const voiceURI = (v.voiceURI || '').toLowerCase();
        return (
          name.includes("female") ||
          name.includes("woman") ||
          voiceURI.includes("female") ||
          (v.lang.startsWith("es") && name.includes("female"))
        );
      });

      // Si no encuentra, usa cualquiera en español con tono femenino conocido
      if (femaleVoices.length === 0) {
        femaleVoices = voices.filter(v => {
          const name = v.name;
          return (
            v.lang.startsWith("es") && (
              name.includes("Camila") ||
              name.includes("Luciana") ||
              name.includes("Paulina") ||
              name.includes("María") ||
              name.includes("Mónica") ||
              name.includes("Monica") ||
              name.includes("Samantha") ||
              name.includes("Victoria") ||
              name.includes("Linda")
            )
          );
        });
      }

      // Si aún no encuentra, buscar cualquier voz en español que no sea explícitamente masculina
      if (femaleVoices.length === 0) {
        femaleVoices = voices.filter(v => {
          const name = v.name.toLowerCase();
          return (
            v.lang.startsWith("es") &&
            !name.includes("male") &&
            !name.includes("hombre") &&
            !name.includes("jorge") &&
            !name.includes("diego") &&
            !name.includes("carlos") &&
            !name.includes("juan")
          );
        });
      }

      // Seleccionar la primera voz femenina encontrada
      if (femaleVoices.length > 0) {
        utterance.voice = femaleVoices[0];
      }
    }

    // Speak
    window.speechSynthesis.speak(utterance);
  }, []);

  // Speak assistant messages when voice is enabled (prevents duplicates)
  useEffect(() => {
    if (!configVoiceEnabled) return;

    // Get the last message
    const lastMessage = messages[messages.length - 1];

    // Only speak if it's an assistant message and hasn't been spoken yet
    if (lastMessage &&
        lastMessage.role === 'assistant' &&
        !spokenMessageIdsRef.current.has(lastMessage.id)) {

      const textToSpeak = lastMessage.text || extractTextFromHtml(lastMessage.html);

      if (textToSpeak && textToSpeak.trim()) {
        // Mark as spoken to prevent duplicates
        spokenMessageIdsRef.current.add(lastMessage.id);

        // Small delay to ensure message is rendered
        setTimeout(() => {
          speakText(textToSpeak);
        }, 300);
      }
    }
  }, [messages, configVoiceEnabled, extractTextFromHtml, speakText]);

  const append = useCallback(
    (role: ChatMessage["role"], content: { text?: string; html?: string; raw?: unknown } = {}) => {
      setMessages((prev) => {
        const newMessage = {
          id: `${role}-${prev.length}-${genId()}`,
          role,
          text: content.text,
          html: content.html,
          raw: content.raw,
          timestamp: Date.now(),
        };

        return [...prev, newMessage];
      });
    },
    []
  );

  const sendMessage = useCallback(
    async (maybeText?: string) => {
      const text = (maybeText ?? input).trim();
      if (!text || loading) return;

      // Si el health dice que no está disponible, intentamos enviar igual (por si Libia arrancó tarde).
      // Si falla, el catch mostrará el mensaje con el comando para levantar Libia.

      append("user", { text });
      setInput("");
      setLoading(true);

      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Show loading indicator after a minimum delay (300ms) to ensure it's visible
      loadingTimeoutRef.current = setTimeout(() => {
        setShowLoading(true);
      }, 300);

      const buildPayload = (msgText: string): ChatRequestPayload => ({
        question: msgText,
        userType: userType,
        budget: typeof budget === "number" ? budget : null,
        codigoIdentificacionUsuario:
          (codigoIdentificacionUsuario ?? "").trim() !== "" ? (codigoIdentificacionUsuario as string) : null,
        codigoIdentificacionComercio:
          (codigoIdentificacionComercio ?? "").trim() !== "" ? (codigoIdentificacionComercio as string) : null,
        plan: plan ?? null,
        productId: (productId ?? "").trim() !== "" ? (productId as string) : null,
      });

      const startTime = Date.now();
      const minLoadingTime = 800;

      // LIBIA usa solo HTTP POST (fetch), no streaming. Enviamos al proxy /api/v1/libia/ask
      // Si seller/panel/product devuelve error (404/500), fallback a user para mostrar respuesta genérica
      const runRequest = async (): Promise<ChatSuccessResponse & ChatErrorResponse> => {
        const { isFrontendMockMode } = await import('@/presentation/@shared/mocks/frontend-mock-flag');
        const { libiaMockReply } = await import('@/presentation/@shared/mocks/libia-frontend-mock');
        if (isFrontendMockMode()) {
          return libiaMockReply(600);
        }
        const p = buildPayload(text);
        const doFetch = (ut: string) =>
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...p, userType: ut }),
            credentials: "omit",
            signal: AbortSignal.timeout(60000),
          });
        const res = await doFetch(userType);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.response) return data;
        if (res.ok) return data;
        if (["seller", "panel", "product"].includes(userType)) {
          const fb = await doFetch("user");
          const fbData = await fb.json().catch(() => ({}));
          if (fb.ok && fbData?.response) return fbData;
        }
        const err = new Error(String(data?.detail ?? data?.error ?? `HTTP ${res.status}`)) as Error & { status?: number; data?: unknown };
        err.status = res.status;
        err.data = data;
        throw err;
      };

      try {
        let data: ChatSuccessResponse & ChatErrorResponse;
        try {
          data = await runRequest();
        } catch (e) {
          if (["seller", "panel", "product"].includes(userType)) {
            try {
              const p = buildPayload(text);
              const fb = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...p, userType: "user" }),
                credentials: "omit",
                signal: AbortSignal.timeout(60000),
              });
              const fbData = await fb.json().catch(() => ({}));
              if (fb.ok && fbData?.response) data = fbData;
              else throw e;
            } catch {
              throw e;
            }
          } else throw e;
        }
        const elapsed = Date.now() - startTime;
        await new Promise((r) => setTimeout(r, Math.max(0, minLoadingTime - elapsed)));
        if (data?.response) {
          // Añadir referrerpolicy a img para que S3 cargue las imágenes (evita bloqueo por Referer)
          const html = String(data.response).replace(/<img /gi, '<img referrerpolicy="no-referrer" ');
          append("assistant", { html, raw: data });
        } else {
          const serverMsg = (data?.detail as string) || (data?.error as string) || `Error al procesar tu mensaje.`;
          append("assistant", {
            html: `<p style="color:var(--libia-error)">Lo siento, no puedo responder en este momento.</p><small>${serverMsg}</small>`,
            raw: data,
          });
        }
      } catch (err) {
        const error = err as Error & { status?: number; data?: { detail?: string; error?: string }; name?: string };
        const status = error?.status ? ` (HTTP ${error.status})` : "";
        const rawMsg = error?.data?.detail || error?.data?.error || error?.message || "Error desconocido";
        let serverMsg =
          error?.name === "AbortError"
            ? "Tiempo de espera agotado. Inténtalo de nuevo en un momento."
            : /Request timeout|timeout/i.test(String(rawMsg))
              ? "La respuesta está tardando más de lo habitual. Inténtalo de nuevo en un momento."
              : /socket hang up|ECONNRESET|connection closed/i.test(String(rawMsg))
                ? "La conexión con LIBIA se cerró. Verifica tu conexión a libia.libertyclub.io."
                : rawMsg;
        if (/socket hang up|ECONNRESET|ECONNREFUSED|8090/i.test(String(serverMsg))) {
          serverMsg = "LIBIA (libia.libertyclub.io) no está disponible. Verifica tu conexión.";
        }

        // Calculate remaining time to meet minimum loading duration
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);

        // Wait for minimum loading time before hiding
        await new Promise(resolve => setTimeout(resolve, remainingTime));

        append("assistant", {
          html: `<p style="color:var(--libia-error)">Lo siento, no puedo responder en este momento${status}.</p><small>${serverMsg}</small>`,
        });
      } finally {
        // Clear timeout if still pending
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

        // Hide loading indicator
        setShowLoading(false);
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [append, budget, codigoIdentificacionComercio, codigoIdentificacionUsuario, endpoint, input, loading, plan, productId, userType]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage();
  };

  const handleQuick = (q: string) => setInput(q);


  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      onOpenChange?.(next);
      if (next) {
        checkAvailability(); // Re-check status al abrir por si Libia ya está lista
        scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
      return next;
    });
  };

  const resetChat = () => {
    // Reset messages to initial state
    setMessages([
      {
        id: "greet",
        role: "assistant",
        html: "<p>👋 ¡Hola! Soy Libia, la IA de LibertyClub. ¿En qué puedo ayudarte?</p>",
        timestamp: Date.now(),
      },
    ]);
    // Clear input
    setInput("");
    // Reset loading state
    setLoading(false);
    // Disable voice
    if (voiceEnabled) {
      stopListening();
      setVoiceEnabled(false);
    }
    // Focus input
    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom();
    }, 100);
  };

  const downloadChat = () => {
    // Filter out the greeting message and format the conversation
    const conversation = messages
      .filter(msg => msg.id !== "greet")
      .map(msg => {
        const date = new Date(msg.timestamp);
        const formattedDate = date.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const role = msg.role === 'assistant' ? 'Libia IA' : 'Usuario';

        // Strip HTML tags from message
        const text = msg.html
          ? msg.html.replace(/<[^>]*>/g, '').trim()
          : msg.text || '';

        return `[${formattedDate}] ${role}:\n${text}\n`;
      })
      .join('\n');

    if (conversation.trim() === '') {
      alert('No hay conversación para descargar');
      return;
    }

    const header = `Conversación con Libia IA - Asistente de LibertyClub\n`;
    const footer = `\n\n--- Fin de la conversación ---`;
    const fullContent = header + `Fecha de descarga: ${new Date().toLocaleString('es-ES')}\n\n` + conversation + footer;

    // Create blob and download
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `libia-conversacion-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Auto-focus when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [open]);

  return (
    <>
      {/* Loading Bar - Top of screen */}
      <LibiaLoadingBar isLoading={loading} />

      {/* Launcher Button (Molecule) */}
      <ChatLauncher
        avatarUrl={avatarUrl}
        isOpen={open}
        onClick={toggle}
        position={position}
        className={className}
        isAvailable={isAvailable}
      />

      {/* Fullscreen Modal - GenAI Style */}
      {open && (
        <div
          className="libia-modal-overlay"
          onClick={toggle}
          role="dialog"
          aria-modal="true"
          aria-label="Chat con Libia"
        >
          <div
            className="libia-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Version Badge - Bottom Right */}
            <div className="libia-version-badge">LIBIA</div>

            {/* Centered Content Container */}
            <div className="libia-modal-center">
              {/* Black Card Container */}
              <div className="libia-modal-card">
                {/* Close Button - Top Right - Same style as sellers modal */}
                <IconButton
                  onClick={toggle}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    color: '#aaa',
                    '&:hover': {
                      color: '#fff',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  size="small"
                  aria-label="Cerrar"
                >
                  <CloseIcon />
                </IconButton>

                {/* Conditional Content: Chat View or Config View */}
                {showConfigView ? (
                  /* Configuration View */
                  <div className="libia-config-view">
                    <h2 className="libia-config-title">Configurar IA</h2>

                    {/* Voice Switch */}
                    <div className="libia-config-switch-container">
                      <label className="libia-config-switch-label">
                        <span className="libia-config-switch-text">Activar la voz a la IA</span>
                        <div className="libia-config-switch-wrapper">
                          <input
                            type="checkbox"
                            className="libia-config-switch"
                            checked={configVoiceEnabled}
                            onChange={(e) => setConfigVoiceEnabled(e.target.checked)}
                          />
                          <span className="libia-config-switch-slider"></span>
                        </div>
                      </label>
                    </div>

                    {/* Auto Actions Switch */}
                    <div className="libia-config-switch-container">
                      <label className="libia-config-switch-label libia-config-switch-disabled">
                        <span className="libia-config-switch-text">Ejecutar acciones automáticas dentro de Liberty</span>
                        <div className="libia-config-switch-wrapper">
                          <input
                            type="checkbox"
                            className="libia-config-switch"
                            checked={configAutoActions}
                            onChange={(e) => setConfigAutoActions(e.target.checked)}
                            disabled
                          />
                          <span className="libia-config-switch-slider"></span>
                        </div>
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="libia-config-buttons">
                      <button
                        type="button"
                        className="libia-config-btn libia-config-btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConfigView(false);
                        }}
                      >
                        Volver
                      </button>
                      <button
                        type="button"
                        className="libia-config-btn libia-config-btn-primary"
                        onClick={() => {
                          const config = {
                            voiceEnabled: configVoiceEnabled,
                            autoActions: configAutoActions,
                          };
                          localStorage.setItem('libia-config', JSON.stringify(config));
                          setShowConfigView(false);
                        }}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Chat View */
                  <>
                {/* Title Section with AI Icon - Original Style */}
                <div className="libia-modal-hero">
                  <h1 className="libia-modal-title">
                    {title}
                    <svg className="libia-title-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00ff88"/>
                          <stop offset="100%" stopColor="#00aaff"/>
                        </linearGradient>
                      </defs>
                      {/* Chip/Processor outline */}
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="url(#aiGradient)" strokeWidth="2" fill="none"/>
                      {/* Circuit lines */}
                      <line x1="8" y1="8" x2="16" y2="8" stroke="url(#aiGradient)" strokeWidth="1.5"/>
                      <line x1="8" y1="12" x2="16" y2="12" stroke="url(#aiGradient)" strokeWidth="1.5"/>
                      <line x1="8" y1="16" x2="16" y2="16" stroke="url(#aiGradient)" strokeWidth="1.5"/>
                      {/* Center dot/core */}
                      <circle cx="12" cy="12" r="1.5" fill="url(#aiGradient)"/>
                      {/* Connection pins */}
                      <line x1="4" y1="8" x2="2" y2="8" stroke="url(#aiGradient)" strokeWidth="1.5"/>
                      <line x1="4" y1="12" x2="2" y2="12" stroke="url(#aiGradient)" strokeWidth="1.5"/>
                      <line x1="4" y1="16" x2="2" y2="16" stroke="url(#aiGradient)" strokeWidth="1.5"/>
                      <line x1="20" y1="8" x2="22" y2="8" stroke="url(#aiGradient)" strokeWidth="1.5"/>
                      <line x1="20" y1="12" x2="22" y2="12" stroke="url(#aiGradient)" strokeWidth="1.5"/>
                      <line x1="20" y1="16" x2="22" y2="16" stroke="url(#aiGradient)" strokeWidth="1.5"/>
                    </svg>
                  </h1>
                  <div className="libia-modal-subtitle-container">
                    {subtitle && (
                      <p className="libia-modal-subtitle">
                        {subtitle}
                        {voiceEnabled && <span className="libia-voice-hint">, di Hey Libia!</span>}
                      </p>
                    )}
                    <p className="libia-modal-ai-hint">
                      No soy un simple chatbot, soy una IA compleja para ayudarte
                    </p>
                  </div>
                </div>

              {/* Messages Area - Hidden initially, shows conversation */}
              {messages.length > 1 && (
                <div className="libia-modal-messages">
                  <ChatMessages
                    messages={messages.slice(1)} // Skip greeting message
                    loading={showLoading}
                    containerRef={listRef}
                  />
                </div>
              )}

              {/* Input Section with Quick Replies */}
              <div className="libia-modal-input-section">
                {/* Quick Replies */}
                {showFAQ && quickReplies?.length > 0 && messages.length === 1 && (
                  <div className="libia-modal-quick-replies">
                    {quickReplies.slice(0, 4).map((q) => (
                      <button
                        key={q}
                        type="button"
                        className="libia-quick-pill"
                        onClick={() => handleQuick(q)}
                        disabled={loading}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Input + Voice Toggle */}
                <div className="libia-input-controls">
                  <AiSearchInput
                    inputRef={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onSubmit={onSubmit}
                    placeholder="¿En qué puedo ayudarte?"
                    sendLabel={sendLabel}
                    loading={loading}
                    hideButton={voiceEnabled}
                  />
                  <VoiceToggleButton
                    enabled={voiceEnabled}
                    isListening={isListening}
                    onClick={toggleVoice}
                  />
                </div>

                {/* Reset Chat Link */}
                <div className="libia-reset-container">
                  <button
                    type="button"
                    className="libia-reset-link"
                    onClick={resetChat}
                    disabled={loading}
                  >
                    <span className="libia-reset-icon">↻</span>
                    <span>Reiniciar conversación</span>
                  </button>
                  <button
                    type="button"
                    className="libia-reset-link"
                    onClick={downloadChat}
                    disabled={loading || messages.length <= 1}
                  >
                    <span className="libia-reset-icon">↓</span>
                    <span>Descargar conversación</span>
                  </button>
                  <button
                    type="button"
                    className="libia-reset-link"
                    onClick={() => setShowConfigView(true)}
                    disabled={loading}
                  >
                    <span className="libia-reset-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                        <circle cx="6" cy="6" r="2"/>
                        <circle cx="6" cy="12" r="2"/>
                        <circle cx="6" cy="18" r="2"/>
                      </svg>
                    </span>
                    <span>Configurar IA</span>
                  </button>
                </div>
              </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
