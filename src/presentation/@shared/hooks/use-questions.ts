'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';
import { useProducts } from './use-products';

// Tipos para las respuestas del API
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  correlationId?: string;
  meta?: {
    timestamp: string;
    version: string;
  };
}

interface RawQuestion {
  id: number;
  product_id: string;
  account_id: string;
  content: string;
  parent_question_id?: number | null;
  created_at: string;
  updated_at?: string;
  child_questions?: RawQuestion[];
  answers?: RawAnswer[];
}

interface RawAnswer {
  id: number;
  question_id: number;
  account_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

interface QuestionsListResponse {
  items: RawQuestion[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    offset: number;
  };
}

export interface Question {
  id: number;
  question: string;
  product: string;
  productId: string;
  answer: string;
  date: string;
  accountId: string;
  hasAnswer: boolean;
  answerId?: number; // ID de la respuesta del vendedor (Answer)
  originalQuestionId: number; // ID de la pregunta original (Question)
}

// Query key constants
const QUESTIONS_KEYS = {
  all: ['questions'],
  byProduct: (productId: string) => ['questions', 'product', productId],
  received: (accountId: string) => ['questions', 'received', accountId],
  made: (accountId: string) => ['questions', 'made', accountId],
};

const mapQuestionToTableFormat = (
  question: RawQuestion,
  productName: string
): Question => {
  // Obtener la primera respuesta (si existe)
  const firstAnswer = question.answers && question.answers.length > 0
    ? question.answers[0].content
    : 'Sin responder';

  const firstAnswerId = question.answers && question.answers.length > 0
    ? question.answers[0].id
    : undefined;

  return {
    id: question.id,
    question: question.content,
    product: productName,
    productId: question.product_id,
    answer: firstAnswer,
    date: new Date(question.created_at).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    accountId: question.account_id,
    hasAnswer: !!(question.answers && question.answers.length > 0),
    answerId: firstAnswerId,
    originalQuestionId: question.id, // La pregunta original es esta misma
  };
};

export const useQuestions = (accountId?: string) => {
  const queryClient = useQueryClient();
  const { useProductsByAccountId } = useProducts();

  // Obtener productos del seller (para preguntas recibidas)
  const productsQuery = useProductsByAccountId(accountId || '');

  // 🔹 Obtener preguntas recibidas (preguntas sobre productos del seller)
  const receivedQuestionsQuery = useQuery({
    queryKey: QUESTIONS_KEYS.received(accountId || ''),
    queryFn: async (): Promise<Question[]> => {
      if (!accountId) {
        return [];
      }

      const products = productsQuery.data || [];

      if (products.length === 0) {
        return [];
      }

      // Obtener preguntas de todos los productos
      const questionsPromises = products.map(async (product) => {
        try {
          const response = await axiosHelper.questionsAnswers.getByProductId(
            product.id,
            { page: 1, limit: 100 } // Obtener todas las preguntas
          );
          const apiResponse = response.data as ApiResponse<QuestionsListResponse>;

          if (!apiResponse.data || !apiResponse.data.items) {
            return [];
          }

          // Mapear preguntas al formato de tabla
          return apiResponse.data.items.map((q) =>
            mapQuestionToTableFormat(q, product.name || 'Producto sin nombre')
          );
        } catch {
          // Silently handle errors (404 is expected when no questions exist)
          return [];
        }
      });

      const questionsArrays = await Promise.all(questionsPromises);
      const flatQuestions = questionsArrays.flat();

      return flatQuestions;
    },
    enabled: typeof window !== 'undefined' && !!accountId && (productsQuery.isSuccess || productsQuery.isFetched),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // 🔹 Preguntas realizadas por el usuario (GET /questions?account_id= — ms-questions-answers)
  const madeQuestionsQuery = useQuery({
    queryKey: QUESTIONS_KEYS.made(accountId || ''),
    queryFn: async (): Promise<Question[]> => {
      if (!accountId) {
        return [];
      }

      try {
        const response = await axiosHelper.questionsAnswers.getAll({
          account_id: accountId,
          page: 1,
          limit: 200,
        });
        const raw = response.data as
          | ApiResponse<QuestionsListResponse>
          | QuestionsListResponse;
        const payload =
          raw &&
          typeof raw === 'object' &&
          'data' in raw &&
          raw.data &&
          typeof raw.data === 'object' &&
          'items' in raw.data
            ? raw.data
            : (raw as QuestionsListResponse);
        const items = payload?.items ?? [];

        return items.map((q) =>
          mapQuestionToTableFormat(
            q as RawQuestion,
            (q as { product_name?: string }).product_name || 'Producto'
          )
        );
      } catch {
        return [];
      }
    },
    enabled: typeof window !== 'undefined' && !!accountId,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // 🔹 Responder a una pregunta (commerce/seller crea un Answer)
  const answerQuestionMutation = useMutation({
    mutationFn: async ({
      questionId,
      content,
    }: {
      questionId: number;
      content: string;
    }) => {
      if (!accountId) {
        throw new Error('Account ID is required to answer a question');
      }

      // Crear una respuesta (Answer) a la pregunta
      const response = await axiosHelper.questionsAnswers.answer(String(questionId), {
        account_id: accountId,
        content: content,
      });
      return response.data;
    },
    onSuccess: async () => {
      // Invalidar queries de preguntas y forzar refetch
      if (accountId) {
        await queryClient.invalidateQueries({
          queryKey: QUESTIONS_KEYS.received(accountId),
          refetchType: 'active',
        });
        await queryClient.invalidateQueries({
          queryKey: QUESTIONS_KEYS.made(accountId),
          refetchType: 'active',
        });
      }
      // Invalidar todas las queries de preguntas por producto
      await queryClient.invalidateQueries({
        queryKey: ['questions', 'product'],
        refetchType: 'active',
      });
    },
  });

  // 🔹 Crear respuesta a la respuesta del vendedor (crear pregunta anidada)
  const createAnswerMutation = useMutation({
    mutationFn: async ({
      originalQuestionId,
      productId,
      content,
    }: {
      originalQuestionId: number;
      productId: string;
      content: string;
    }) => {
      if (!accountId) {
        throw new Error('Account ID is required to create an answer');
      }

      // Crear una pregunta anidada (child question) que responda a la pregunta original
      // Esto permite que el usuario responda a la respuesta del vendedor
      const response = await axiosHelper.questionsAnswers.create({
        product_id: productId,
        account_id: accountId,
        content: content,
        parent_question_id: originalQuestionId,
      });
      return response.data;
    },
    onSuccess: async () => {
      // Invalidar queries de preguntas y forzar refetch
      if (accountId) {
        await queryClient.invalidateQueries({
          queryKey: QUESTIONS_KEYS.received(accountId),
          refetchType: 'active',
        });
        await queryClient.invalidateQueries({
          queryKey: QUESTIONS_KEYS.made(accountId),
          refetchType: 'active',
        });
      }
      // Invalidar todas las queries de preguntas por producto
      await queryClient.invalidateQueries({
        queryKey: ['questions', 'product'],
        refetchType: 'active',
      });
    },
  });

  // 🔹 Eliminar pregunta
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      if (!accountId) {
        throw new Error('Account ID is required to delete a question');
      }

      const response = await axiosHelper.questionsAnswers.delete(
        String(questionId),
        accountId
      );
      return response.data;
    },
    onSuccess: async () => {
      if (accountId) {
        // Invalidar y refetch inmediatamente para actualizar la UI
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: QUESTIONS_KEYS.received(accountId),
          }),
          queryClient.invalidateQueries({
            queryKey: QUESTIONS_KEYS.made(accountId),
          }),
          queryClient.invalidateQueries({
            queryKey: ['questions', 'product'],
          }),
        ]);

        // Forzar refetch inmediato
        await Promise.all([
          queryClient.refetchQueries({
            queryKey: QUESTIONS_KEYS.received(accountId),
          }),
          queryClient.refetchQueries({
            queryKey: QUESTIONS_KEYS.made(accountId),
          }),
        ]);
      }
    },
  });

  return {
    // Queries
    receivedQuestions: {
      data: receivedQuestionsQuery.data || [],
      isLoading: receivedQuestionsQuery.isLoading || productsQuery.isLoading,
      isError: receivedQuestionsQuery.isError || productsQuery.isError,
      error: receivedQuestionsQuery.error || productsQuery.error,
      refetch: () => {
        productsQuery.refetch();
        receivedQuestionsQuery.refetch();
      },
    },
    madeQuestions: {
      data: madeQuestionsQuery.data || [],
      isLoading: madeQuestionsQuery.isLoading || productsQuery.isLoading,
      isError: madeQuestionsQuery.isError || productsQuery.isError,
      error: madeQuestionsQuery.error || productsQuery.error,
      refetch: () => {
        productsQuery.refetch();
        madeQuestionsQuery.refetch();
      },
    },

    // Mutations
    answerQuestion: answerQuestionMutation,
    createAnswer: createAnswerMutation,
    deleteQuestion: deleteQuestionMutation,
  };
};

