"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Container, Typography, TextField, Button as MuiButton, CircularProgress } from '@mui/material';
import { Inbox, Send } from '@mui/icons-material';
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import DataTable, { DataTableColumn } from "@/presentation/@shared/components/ui/atoms/table/table";
import { Stack } from "@/presentation/@shared/components/ui/molecules/stack";
import { Breadcrumb } from "@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb";
import { SearchInput } from "@/presentation/@shared/components/ui/atoms/search-input";
import { useModal } from "@/presentation/@shared/hooks/use-modal";
import { useQuestions, Question } from "@/presentation/@shared/hooks/use-questions";
import { useToast } from "@/presentation/@shared/components/ui/molecules/toast";
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

// Funciones globales para botones de tabla
declare global {
  interface Window {
    handleAnswerClick?: (id: string | number) => void;
    handleDeleteClick?: (id: string | number) => void;
  }
}

// Componente separado para el campo de texto del modal (evita re-renders)
interface ModalAnswerFieldProps {
  modalAnswerRef: React.MutableRefObject<string>;
  setModalAnswer: (value: string) => void;
  isSellerAnswering: boolean;
  isMutationPendingRef: React.MutableRefObject<boolean>;
}

function ModalAnswerField({ modalAnswerRef, setModalAnswer, isSellerAnswering, isMutationPendingRef }: ModalAnswerFieldProps) {
  const [localValue, setLocalValue] = useState(modalAnswerRef.current);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    modalAnswerRef.current = newValue;
    setModalAnswer(newValue);
  };

  return (
    <TextField
      id="modal-answer"
      name="modal-answer"
      value={localValue}
      onChange={handleChange}
      placeholder={isSellerAnswering ? "Escribe tu respuesta a la pregunta del cliente..." : "Escribe tu respuesta a la respuesta del vendedor..."}
      disabled={isMutationPendingRef.current}
      multiline
      rows={5}
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#1f2937',
          color: '#ffffff',
          borderRadius: '4px',
          fontSize: '0.875rem',
          '& fieldset': {
            borderColor: '#374151',
          },
          '&:hover fieldset': {
            borderColor: '#22c55e',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#22c55e',
            boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
          },
          '& .MuiInputBase-input': {
            fontSize: '0.875rem',
            padding: '16px',
            '&::placeholder': {
              color: '#9ca3af',
              opacity: 0.7,
              fontSize: '0.875rem',
            },
          },
          '& textarea': {
            color: '#ffffff',
            fontSize: '0.875rem',
            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            '&::placeholder': {
              color: '#9ca3af',
              opacity: 0.7,
              fontSize: '0.875rem',
            },
          },
        },
      }}
    />
  );
}

// Componente separado para los botones del modal (evita stale closures)
interface ModalActionButtonsProps {
  modalAnswerRef: React.MutableRefObject<string>;
  handleSendRef: React.MutableRefObject<() => Promise<void>>;
  isMutationPendingRef: React.MutableRefObject<boolean>;
  closeModal: () => void;
  setModalQuestion: (q: Question | null) => void;
  setModalAnswer: (v: string) => void;
  setIsSellerAnswering: (v: boolean) => void;
}

function ModalActionButtons({
  modalAnswerRef,
  handleSendRef,
  isMutationPendingRef,
  closeModal,
  setModalQuestion,
  setModalAnswer,
  setIsSellerAnswering
}: ModalActionButtonsProps) {
  const [, forceUpdate] = useState(0);

  // Re-render cuando el texto cambia para actualizar el estado del botón
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const isPending = isMutationPendingRef.current;
  const hasText = modalAnswerRef.current.trim().length > 0;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
      <MuiButton
        type="button"
        onClick={() => {
          closeModal();
          setModalQuestion(null);
          setModalAnswer("");
          setIsSellerAnswering(false);
        }}
        variant="outlined"
        disabled={isPending}
        sx={{
          px: 4,
          py: 1.5,
          color: '#ef4444',
          borderColor: '#ef4444',
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#dc2626',
            color: '#dc2626',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          },
          '&:disabled': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: 'rgba(255, 255, 255, 0.3)',
          }
        }}
      >
        Cancelar
      </MuiButton>
      <MuiButton
        type="button"
        onClick={() => handleSendRef.current()}
        disabled={isPending || !hasText}
        startIcon={isPending ? <CircularProgress size={20} sx={{ color: '#1e293b' }} /> : undefined}
        sx={{
          px: 4,
          py: 1.5,
          backgroundColor: isPending || !hasText ? '#374151' : '#29C480',
          color: isPending || !hasText ? 'rgba(255, 255, 255, 0.5)' : '#1e293b',
          fontWeight: 600,
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '1rem',
          transition: 'background-color 0.3s ease, color 0.3s ease',
          '&:hover': {
            backgroundColor: isPending || !hasText ? '#374151' : '#ffffff',
            color: isPending || !hasText ? 'rgba(255, 255, 255, 0.5)' : '#000000'
          },
          '&:disabled': {
            backgroundColor: '#374151',
            color: 'rgba(255, 255, 255, 0.5)',
            opacity: 0.6
          }
        }}
      >
        {isPending ? "Enviando..." : "Enviar respuesta"}
      </MuiButton>
    </Box>
  );
}

export default function QuestionsPage() {
  const { t } = useLanguage();
  // Query params para deep linking desde notificaciones
  const searchParams = useSearchParams();
  const questionIdFromUrl = searchParams.get('questionId');
  const actionFromUrl = searchParams.get('action');
  // Guardar el último questionId procesado para detectar cambios
  const lastProcessedQuestionId = useRef<string | null>(null);

  // Estado para el perfil y accountId
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [accountType, setAccountType] = useState<string | undefined>(undefined);

  // Leer perfil del usuario desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userProfile = JSON.parse(userStr);
          setAccountId(userProfile?.id);
          setAccountType(userProfile?.accountType);
        }
      } catch (error) {
        console.error("Error reading user from localStorage:", error);
        setAccountId(undefined);
        setAccountType(undefined);
      }
    }
  }, []);

  const isSeller = accountType === "commerce" || accountType === "seller";
  const showReceivedTab = isSeller; // solo commerce / seller
  const showMadeTab = accountType === "user" || isSeller; // user o commerce/seller

  const [tab, setTab] = useState<string>("made"); // Valor por defecto seguro
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);
  const [modalAnswer, setModalAnswer] = useState("");
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { openModal, closeModal, updateModalContent, updateModalProps, isOpen } = useModal();

  // Actualizar el tab cuando el perfil esté disponible (solo una vez)
  const hasSetInitialTab = useRef(false);
  useEffect(() => {
    if (accountType !== undefined && !hasSetInitialTab.current) {
      hasSetInitialTab.current = true;
      const newInitialTab = isSeller ? "received" : "made";
      setTab(newInitialTab);
    }
  }, [accountType, isSeller]);

  // Usar el hook de preguntas
  const {
    receivedQuestions,
    madeQuestions,
    answerQuestion,
    createAnswer,
    deleteQuestion} = useQuestions(accountId);
  const toast = useToast();

  // Estado para distinguir si el modal es para responder una pregunta (seller) o responder a una respuesta (user)
  const [isSellerAnswering, setIsSellerAnswering] = useState(false);

  // Deep link: abrir modal automáticamente si hay questionId en la URL
  useEffect(() => {
    // No hay questionId en la URL
    if (!questionIdFromUrl) {
      lastProcessedQuestionId.current = null;
      return;
    }

    // Ya procesamos este questionId específico
    if (lastProcessedQuestionId.current === questionIdFromUrl) return;

    // Esperar a que los datos estén cargados
    if (!receivedQuestions.data || receivedQuestions.isLoading) return;

    const questionId = parseInt(questionIdFromUrl, 10);
    if (isNaN(questionId)) return;

    // Buscar la pregunta en las preguntas recibidas
    const question = receivedQuestions.data.find(q => q.id === questionId);
    if (!question) return;

    // Marcar este questionId como procesado
    lastProcessedQuestionId.current = questionIdFromUrl;

    // Usar setTimeout para evitar actualizaciones síncronas en cascada
    setTimeout(() => {
      // Asegurar que estamos en el tab "received" para sellers
      if (isSeller) {
        setTab("received");
      }

      // Abrir el modal para responder
      setModalQuestion(question);
      setModalAnswer("");
      setIsSellerAnswering(actionFromUrl === "answer" && !question.hasAnswer);

      openModal(
        () => null,
        {
          title: actionFromUrl === "answer" && !question.hasAnswer
            ? "Responder pregunta"
            : "Ver pregunta",
          maxWidth: "sm"
        }
      );

      // Limpiar los query params de la URL
      window.history.replaceState({}, '', '/admin/panel/questions');
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIdFromUrl, receivedQuestions.data, receivedQuestions.isLoading]);

  const handleSend = useCallback(async () => {
    if (!modalQuestion || !modalAnswer.trim()) return;

    try {
      if (isSellerAnswering) {
        // Seller respondiendo a una pregunta (crear Answer)
        await answerQuestion.mutateAsync({
          questionId: modalQuestion.id,
          content: modalAnswer.trim()
        });
        toast.success("Respuesta enviada correctamente");
      } else {
        // User respondiendo a la respuesta del vendedor (crear pregunta anidada)
        await createAnswer.mutateAsync({
          originalQuestionId: modalQuestion.originalQuestionId,
          productId: modalQuestion.productId,
          content: modalAnswer.trim()
        });
        toast.success("Respuesta enviada correctamente");
      }

      closeModal();
      setModalQuestion(null);
      setModalAnswer("");
      setIsSellerAnswering(false);
    } catch (error) {
      console.error("Error al enviar respuesta:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Error al enviar la respuesta. Por favor, intenta nuevamente.";
      toast.error(errorMessage);
    }
  }, [modalQuestion, modalAnswer, isSellerAnswering, answerQuestion, createAnswer, closeModal, toast]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!questionToDelete) return;

    try {
      await deleteQuestion.mutateAsync(questionToDelete.id);
      toast.success("Pregunta eliminada correctamente");
      closeModal();
      setQuestionToDelete(null);
    } catch (error) {
      console.error("Error al eliminar pregunta:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Error al eliminar la pregunta. Por favor, intenta nuevamente.";
      toast.error(errorMessage);
    }
  }, [questionToDelete, deleteQuestion, closeModal, toast]);

  // Determinar qué datos mostrar según el tab activo
  // Agregar información del tab a cada pregunta para el render
  const data = useMemo(() => {
    const questions = tab === "received"
      ? receivedQuestions.data || []
      : madeQuestions.data || [];

    // Agregar información del tab a cada pregunta para que el render pueda acceder
    return questions.map(q => ({
      ...q,
      _currentTab: tab, // Agregar tab actual para el render
    }));
  }, [tab, receivedQuestions.data, madeQuestions.data]);

  // Key única para forzar remount del DataTable cuando cambian los datos
  const tableKey = useMemo(() => {
    const dataLength = data.length;
    const dataIds = data.map(d => d.id).join(',');
    return `questions-table-${tab}-${dataLength}-${dataIds}`;
  }, [data, tab]);

  const isLoading = tab === "received"
    ? receivedQuestions.isLoading
    : madeQuestions.isLoading;

  const isError = tab === "received"
    ? receivedQuestions.isError
    : madeQuestions.isError;

  // Determinar si la mutación está pendiente
  const isMutationPending = isSellerAnswering ? answerQuestion.isPending : createAnswer.isPending;

  // Refs para evitar re-renders innecesarios del modal
  const modalAnswerRef = useRef(modalAnswer);
  const handleSendRef = useRef(handleSend);
  const isMutationPendingRef = useRef(isMutationPending);

  // Mantener refs actualizados
  useEffect(() => {
    modalAnswerRef.current = modalAnswer;
  }, [modalAnswer]);

  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  useEffect(() => {
    isMutationPendingRef.current = isMutationPending;
  }, [isMutationPending]);

  // Actualizar el contenido del modal solo cuando cambia la pregunta o el modo
  useEffect(() => {
    if (modalQuestion) {
      const getModalContent = () => (
        <Box
          sx={{
            width: "100%",
            maxHeight: "80vh",
            overflowY: "auto",
            color: "#fff",
            py: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              px: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {/* Título */}
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 700,
                color: '#34d399',
                mb: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}
            >
              {isSellerAnswering ? "Responder pregunta" : "Responder a la respuesta del vendedor"}
            </Typography>

            {/* Producto Section */}
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  color: "rgba(255, 255, 255, 0.6)",
                  fontWeight: 500,
                  mb: 1,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                PRODUCTO
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.875rem", md: "1rem" },
                  lineHeight: 1.6,
                  color: "#ffffff",
                  fontWeight: 600,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {modalQuestion.product}
              </Typography>
            </Box>

            {/* Pregunta Section */}
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  color: "rgba(255, 255, 255, 0.6)",
                  fontWeight: 500,
                  mb: 1,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {isSellerAnswering ? "PREGUNTA DEL CLIENTE" : "TU PREGUNTA"}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.875rem", md: "1rem" },
                  lineHeight: 1.6,
                  color: "#ffffff",
                  fontWeight: 600,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                &quot;{modalQuestion.question}&quot;
              </Typography>
            </Box>

            {/* Respuesta del Vendedor Section - solo mostrar si no es seller respondiendo */}
            {!isSellerAnswering && (
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: "0.8125rem", md: "0.875rem" },
                    color: "rgba(255, 255, 255, 0.6)",
                    fontWeight: 500,
                    mb: 1,
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  RESPUESTA DEL VENDEDOR
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    lineHeight: 1.6,
                    color: "#34d399",
                    fontWeight: 600,
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  &quot;{modalQuestion.answer}&quot;
                </Typography>
              </Box>
            )}

            {/* Tu Respuesta Section */}
            <Box>
              <Typography
                component="label"
                htmlFor="modal-answer"
                sx={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#ffffff',
                  mb: 1,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                TU RESPUESTA
              </Typography>
              <ModalAnswerField
                modalAnswerRef={modalAnswerRef}
                setModalAnswer={setModalAnswer}
                isSellerAnswering={isSellerAnswering}
                isMutationPendingRef={isMutationPendingRef}
              />
            </Box>

            {/* Action Buttons Section */}
            <ModalActionButtons
              modalAnswerRef={modalAnswerRef}
              handleSendRef={handleSendRef}
              isMutationPendingRef={isMutationPendingRef}
              closeModal={closeModal}
              setModalQuestion={setModalQuestion}
              setModalAnswer={setModalAnswer}
              setIsSellerAnswering={setIsSellerAnswering}
            />
          </Box>
        </Box>
      );

      updateModalContent(getModalContent);
      updateModalProps({
        title: undefined,
        maxWidth: "sm",
        actions: undefined
      });
    }
  // Solo actualizar cuando cambia la pregunta o el modo de respuesta
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalQuestion, isSellerAnswering]);

  // Actualizar el contenido del modal de eliminación cuando cambia questionToDelete
  useEffect(() => {
    if (questionToDelete) {
      const getModalContent = () => (
        <Box
          sx={{
            width: "100%",
            maxHeight: "80vh",
            overflowY: "auto",
            color: "#fff",
            py: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              px: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {/* Título */}
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 700,
                color: '#34d399',
                mb: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              }}
            >
              Eliminar pregunta
            </Typography>

            {/* Producto Section */}
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  color: "rgba(255, 255, 255, 0.6)",
                  fontWeight: 500,
                  mb: 1,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                PRODUCTO
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.875rem", md: "1rem" },
                  lineHeight: 1.6,
                  color: "#34d399",
                  fontWeight: 600,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                {questionToDelete.product}
              </Typography>
            </Box>

            {/* Pregunta Section */}
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  color: "rgba(255, 255, 255, 0.6)",
                  fontWeight: 500,
                  mb: 1,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                PREGUNTA
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.875rem", md: "1rem" },
                  lineHeight: 1.6,
                  color: "#ffffff",
                  fontWeight: 500,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                &quot;{questionToDelete.question}&quot;
              </Typography>
            </Box>

            {/* Mensaje de confirmación */}
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "0.875rem", md: "1rem" },
                  lineHeight: 1.6,
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 500,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                ¿Desea eliminar esta pregunta? Esta acción no se puede deshacer.
              </Typography>
            </Box>

            {/* Action Buttons Section */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
              <MuiButton
                type="button"
                onClick={() => {
                  closeModal();
                  setQuestionToDelete(null);
                }}
                variant="outlined"
                disabled={deleteQuestion.isPending}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderWidth: '2px !important',
                  borderColor: '#ef4444 !important',
                  borderStyle: 'solid !important',
                  color: '#ef4444 !important',
                  backgroundColor: 'transparent !important',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: 'none !important',
                  '& fieldset': {
                    borderWidth: '2px !important',
                    borderColor: '#ef4444 !important',
                    borderStyle: 'solid !important',
                  },
                  '&:hover': {
                    borderWidth: '2px !important',
                    borderColor: '#ef4444 !important',
                    borderStyle: 'solid !important',
                    backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
                    boxShadow: 'none !important',
                    '& fieldset': {
                      borderWidth: '2px !important',
                      borderColor: '#ef4444 !important',
                      borderStyle: 'solid !important',
                    },
                  },
                  '&:disabled': {
                    borderColor: 'rgba(255, 255, 255, 0.3) !important',
                    color: 'rgba(255, 255, 255, 0.3) !important',
                    '& fieldset': {
                      borderWidth: '2px !important',
                      borderColor: 'rgba(255, 255, 255, 0.3) !important',
                      borderStyle: 'solid !important',
                    },
                  },
                }}
              >
                Cancelar
              </MuiButton>
              <MuiButton
                type="button"
                onClick={handleDeleteConfirm}
                variant="contained"
                disabled={deleteQuestion.isPending}
                sx={{
                  px: 4,
                  py: 1.5,
                  backgroundColor: deleteQuestion.isPending ? '#374151' : '#ef4444',
                  color: '#ffffff',
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  '&:hover': {
                    backgroundColor: deleteQuestion.isPending ? '#374151' : '#dc2626',
                    color: '#ffffff'
                  },
                  '&:disabled': {
                    backgroundColor: '#374151',
                    color: 'rgba(255, 255, 255, 0.5)',
                    opacity: 0.6
                  }
                }}
              >
                {deleteQuestion.isPending ? "Eliminando..." : "Eliminar"}
              </MuiButton>
            </Box>
          </Box>
        </Box>
      );

      updateModalContent(getModalContent);
      updateModalProps({
        title: undefined, // No usar título del modal, lo agregamos dentro del contenido
        maxWidth: "sm",
        actions: undefined // No usar acciones del modal, usar los botones dentro del contenido
      });
    }
  }, [questionToDelete, deleteQuestion.isPending, updateModalContent, updateModalProps, closeModal, handleDeleteConfirm]);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      if (modalQuestion) {
        setModalQuestion(null);
        setModalAnswer("");
        setIsSellerAnswering(false);
      }
      if (questionToDelete) {
        setQuestionToDelete(null);
      }
    }
  }, [isOpen, modalQuestion, questionToDelete]);

  useEffect(() => {
    if (globalThis.window !== undefined) {
      globalThis.window.handleAnswerClick = (id: string | number) => {
        const q = data.find(d => d.id === Number(id));
        if (q) {
          // Determinar si es seller respondiendo pregunta o user respondiendo a respuesta
          const currentTab = (q as Question & { _currentTab?: string })._currentTab || "received";
          const hasAnswer = q.answer !== "Sin responder";
          const sellerAnswering = currentTab === "received" && !hasAnswer;

          setModalQuestion(q);
          setModalAnswer("");
          setIsSellerAnswering(sellerAnswering);

          // Abrir modal usando el hook centralizado
          openModal(
            () => null,
            {
              title: sellerAnswering ? "Responder pregunta" : "Responder a la respuesta del vendedor",
              maxWidth: "sm"
            }
          );
        }
      };
      globalThis.window.handleDeleteClick = (id: string | number) => {
        const questionId = Number(id);
        const question = data.find(d => d.id === questionId);

        if (!question) {
          toast.error("No se pudo encontrar la pregunta.");
          return;
        }

        // Establecer la pregunta a eliminar y abrir el modal
        setQuestionToDelete(question);
        openModal(
          () => null, // El contenido se actualizará en el useEffect
          {
            title: undefined, // No usar título del modal, lo agregamos dentro del contenido
            maxWidth: "sm"
          }
        );
      };
    }
  }, [data, tab, deleteQuestion, receivedQuestions, madeQuestions, modalAnswer, createAnswer, openModal, closeModal, updateModalContent, updateModalProps, toast]);

  // Memoizar columnas para evitar re-renders innecesarios
  const columns: DataTableColumn[] = useMemo(() => [
    { title: "PREGUNTA", data: "question", responsivePriority: 1 },
    { title: "PRODUCTO", data: "product", responsivePriority: 2 },
    { title: "RESPUESTA", data: "answer", responsivePriority: 3 },
    { title: "FECHA", data: "date", responsivePriority: 4 },
    {
      title: "ACCIONES",
      data: "id",
      type: "html",
      orderable: false,
      searchable: false,
      render: (_idData: string, _type: string, row: Record<string, unknown>) => {
        const answerValue = row.answer as string || '';
        const hasAnswer = answerValue !== "Sin responder" && answerValue !== '';
        const rowId = row.id || row.originalQuestionId || '';

        const showAnswerButton =
          (tab === "received" && !hasAnswer) ||
          (tab === "made" && hasAnswer);

        let html = '<div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end;">';

        if (showAnswerButton) {
          html += `<button onclick="handleAnswerClick(${rowId})" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 32px; background-color: #29C480; color: #1e293b; font-weight: 600; border-radius: 8px; text-transform: none; font-size: 1rem; border: none; cursor: pointer; transition: background-color 0.3s ease, color 0.3s ease; min-width: 100px;" onmouseover="this.style.backgroundColor='#ffffff'; this.style.color='#000000'" onmouseout="this.style.backgroundColor='#29C480'; this.style.color='#1e293b'">Responder</button>`;
        }

        html += `<button onclick="handleDeleteClick(${rowId})" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 32px; background-color: #ef4444; color: #ffffff; font-weight: 600; border-radius: 8px; text-transform: none; font-size: 1rem; border: none; cursor: pointer; transition: background-color 0.3s ease, color 0.3s ease; min-width: 100px;" onmouseover="this.style.backgroundColor='#dc2626'; this.style.color='#ffffff'" onmouseout="this.style.backgroundColor='#ef4444'; this.style.color='#ffffff'">Eliminar</button>`;

        html += '</div>';

        return html;
      },
      responsivePriority: 1
    }
  ], [tab]);

  const switchTab = (t: string) => {
    setTab(t);
  };

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
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: t.admin?.questions || 'Preguntas' }
              ]}
            />

            <Box
              sx={{
                position: "relative",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                border: "2px solid rgba(41, 196, 128, 0.1)",
                borderRadius: "24px",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "default",
                "&:hover": {
                  backgroundColor: "rgba(41, 196, 128, 0.08)",
                  borderColor: "rgba(41, 196, 128, 0.4)",
                },
                padding: { xs: 3, md: 4 },
                gap: 3,
              }}
            >
              {/* Título y botones */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: 2,
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    fontWeight: 700,
                    color: '#34d399',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                  }}
                >
                  {tab === "received" ? "Preguntas recibidas" : "Preguntas realizadas"}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'center' },
                    gap: 2,
                    flex: { md: '0 0 auto' }
                  }}
                >
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ alignItems: 'center' }}>
                    {showReceivedTab && (
                      <MuiButton
                        onClick={() => switchTab("received")}
                        endIcon={<Inbox sx={{ fontSize: '1rem' }} />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          minHeight: '56px',
                          backgroundColor: tab === "received" ? "#29C480" : "transparent",
                          color: tab === "received" ? "#1e293b" : "#29C480",
                          fontWeight: 600,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "1rem",
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          border: tab === "received" ? "none" : "1px solid",
                          borderColor: "#29C480",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          "&:hover": {
                            backgroundColor: tab === "received" ? "#ffffff" : "rgba(41, 196, 128, 0.1)",
                            color: tab === "received" ? "#000000" : "#29C480",
                          },
                          "& .MuiSvgIcon-root": {
                            transition: "transform 0.3s ease"
                          },
                          "&:hover .MuiSvgIcon-root": {
                            transform: "translateX(4px)"
                          }
                        }}
                      >
                        Recibidas
                      </MuiButton>
                    )}
                    {showMadeTab && (
                      <MuiButton
                        onClick={() => switchTab("made")}
                        endIcon={<Send sx={{ fontSize: '1rem' }} />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          minHeight: '56px',
                          backgroundColor: tab === "made" ? "#29C480" : "transparent",
                          color: tab === "made" ? "#1e293b" : "#29C480",
                          fontWeight: 600,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "1rem",
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          border: tab === "made" ? "none" : "1px solid",
                          borderColor: "#29C480",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          "&:hover": {
                            backgroundColor: tab === "made" ? "#ffffff" : "rgba(41, 196, 128, 0.1)",
                            color: tab === "made" ? "#000000" : "#29C480",
                          },
                          "& .MuiSvgIcon-root": {
                            transition: "transform 0.3s ease"
                          },
                          "&:hover .MuiSvgIcon-root": {
                            transform: "translateX(4px)"
                          }
                        }}
                      >
                        Realizadas
                      </MuiButton>
                    )}
                  </Stack>
                  <Box sx={{ flex: { md: '0 0 auto' }, maxWidth: { xs: '100%', md: '360px' }, width: { xs: '100%', md: 'auto' } }}>
                    <SearchInput
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Buscar preguntas..."
                      debounceMs={0}
                    />
                  </Box>
                </Box>
              </Box>
              {isLoading && (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <CircularProgress sx={{ color: '#29C480' }} size="large" />
                </Box>
              )}

              {isError && (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Text
                    variant="body2"
                    sx={{
                      color: '#ef4444',
                      mb: 3,
                      fontSize: '0.875rem'
                    }}
                  >
                    Error al cargar las preguntas. Por favor, intenta nuevamente.
                  </Text>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (tab === "received") {
                        receivedQuestions.refetch();
                      } else {
                        madeQuestions.refetch();
                      }
                    }}
                  >
                    Reintentar
                  </Button>
                </Box>
              )}

              {!isLoading && !isError && (
                <DataTable
                  key={tableKey}
                  id="questions-table"
                  columns={columns}
                  data={data}
                  className="shadow-lg"
                  pageLength={7}
                  searching={false}
                  externalSearchTerm={searchTerm}
                />
              )}
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
