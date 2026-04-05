'use client';

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';
import {
  CreateQuestionPayload,
  QuestionAuthor,
  QuestionNode,
  QuestionsListResponse,
  AnswerNode,
} from '../types/questions';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface RawQuestionAuthor {
  id: string;
  name?: string;
  avatar_url?: string;
  account_type?: string;
}

interface RawAnswer {
  id: number | string;
  question_id: number | string;
  account_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  account?: RawQuestionAuthor | null;
}

interface RawQuestionNode {
  id: number | string;
  product_id: string;
  account_id: string;
  content: string;
  parent_question_id?: number | string | null;
  created_at: string;
  updated_at?: string;
  account?: RawQuestionAuthor | null;
  children?: RawQuestionNode[] | null;
  child_questions?: RawQuestionNode[] | null;
  answers?: RawAnswer[] | null;
}

interface RawQuestionsListResponse {
  items: RawQuestionNode[];
  pagination: QuestionsListResponse['pagination'];
}

interface UserEntity {
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  accountType?: string;
  additionalInfo?: {
    avatar_url?: string;
    [key: string]: unknown;
  };
}

interface StoreInfo {
  id: string;
  name: string;
  information?: {
    logo?: string;
  } | null;
}

// Función para obtener información de la tienda desde ms-stores
const fetchStoreInfo = async (accountId: string): Promise<{ name: string; logo?: string } | null> => {
  try {
    // Get store by accountId using the public endpoint
    const response = await axiosHelper.stores.getPublicByAccountId(accountId);
    const apiResponse = response.data as ApiResponse<StoreInfo> | StoreInfo;

    // Handle different response formats
    const store = (apiResponse as ApiResponse<StoreInfo>)?.data || (apiResponse as StoreInfo);

    if (!store || !store.name) {
      return null;
    }

    return {
      name: store.name,
      logo: store.information?.logo || undefined,
    };
  } catch (error) {
    // 404 is expected if the account doesn't have a store
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status !== 404) {
      console.error(`Error fetching store info for accountId ${accountId}:`, error);
    }
    return null;
  }
};

// Función para obtener información del usuario desde ms-account
const fetchUserInfo = async (accountId: string): Promise<QuestionAuthor | null> => {
  try {
    const response = await axiosHelper.account.getUserById(accountId);
    const apiResponse = response.data as ApiResponse<UserEntity>;
    const user = apiResponse.data;

    if (!user) {
      return null;
    }

    // Construir el nombre desde firstName/lastName o name o email
    let name = user.name ||
      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName) ||
      user.email?.split('@')[0] ||
      'Usuario';

    let avatarUrl = user.additionalInfo?.avatar_url;

    // For commerce/seller accounts, try to get store info (name and logo)
    if (user.accountType === 'commerce' || user.accountType === 'seller') {
      const storeInfo = await fetchStoreInfo(accountId);
      if (storeInfo) {
        // Use store name instead of user name
        name = storeInfo.name;
        // Use store logo if available, otherwise fall back to user avatar
        if (storeInfo.logo) {
          avatarUrl = storeInfo.logo;
        }
      }
    }

    return {
      id: user.id,
      name,
      avatarUrl,
      accountType: user.accountType,
    };
  } catch (error) {
    console.error(`Error fetching user info for accountId ${accountId}:`, error);
    return null;
  }
};

const mapAuthor = (author?: RawQuestionAuthor | null): QuestionAuthor | null => {
  if (!author) {
    return null;
  }

  return {
    id: author.id,
    name: author.name || 'Usuario',
    avatarUrl: author.avatar_url,
    accountType: author.account_type,
  };
};

const getRawChildren = (node: RawQuestionNode): RawQuestionNode[] => {
  if (Array.isArray(node.child_questions)) {
    return node.child_questions;
  }

  if (Array.isArray(node.children)) {
    return node.children;
  }

  return [];
};

const mapAnswer = (answer: RawAnswer): AnswerNode => ({
  id: String(answer.id),
  questionId: String(answer.question_id),
  accountId: answer.account_id,
  content: answer.content,
  createdAt: answer.created_at,
  updatedAt: answer.updated_at,
  author: mapAuthor(answer.account),
});

const mapQuestionNode = (node: RawQuestionNode): QuestionNode => {
  const mappedChildren = getRawChildren(node).map(mapQuestionNode);

  const sortedChildren = mappedChildren.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const mappedAnswers = Array.isArray(node.answers)
    ? node.answers.map(mapAnswer).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    : [];

  return {
    id: String(node.id),
    productId: node.product_id,
    accountId: node.account_id,
    content: node.content,
    parentQuestionId:
      node.parent_question_id !== undefined && node.parent_question_id !== null
        ? String(node.parent_question_id)
        : null,
    createdAt: node.created_at,
    updatedAt: node.updated_at,
    author: mapAuthor(node.account),
    children: sortedChildren,
    answers: mappedAnswers,
  };
};

const defaultPagination: QuestionsListResponse['pagination'] = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
  offset: 0,
};

const mapQuestionsResponse = (
  payload?: RawQuestionsListResponse | null,
): QuestionsListResponse => ({
  items: Array.isArray(payload?.items)
    ? payload.items.map(mapQuestionNode)
    : [],
  pagination: payload?.pagination ?? defaultPagination,
});

type ProductQuestionsQueryKey = ['productQuestions', string, number, number];

const getQueryKey = (productId: string, page: number, limit: number): ProductQuestionsQueryKey =>
  ['productQuestions', productId, page, limit];

interface UseProductQuestionsParams {
  page?: number;
  limit?: number;
}

export const useProductQuestions = (
  productId: string,
  { page = 1, limit = 20 }: UseProductQuestionsParams = {}
) => {
  const queryClient = useQueryClient();

  const questionsQuery = useQuery({
    queryKey: getQueryKey(productId, page, limit),
    queryFn: async () => {
      const response = await axiosHelper.questionsAnswers.getByProductId(productId, { page, limit });
      const apiResponse = response.data as ApiResponse<RawQuestionsListResponse | null>;

      if (!apiResponse.data || !apiResponse.data.items) {
        return mapQuestionsResponse(null);
      }

      // Recopilar todos los account_id únicos de todas las preguntas y respuestas
      const collectAccountIds = (nodes: RawQuestionNode[]): Set<string> => {
        const accountIds = new Set<string>();

        const traverse = (nodeList: RawQuestionNode[]) => {
          nodeList.forEach((node) => {
            if (node.account_id && !node.account) {
              accountIds.add(node.account_id);
            }
            // Recopilar account_ids de las respuestas (Answer)
            if (Array.isArray(node.answers)) {
              node.answers.forEach((answer) => {
                if (answer.account_id && !answer.account) {
                  accountIds.add(answer.account_id);
                }
              });
            }
            const children = getRawChildren(node);
            if (children.length > 0) {
              traverse(children);
            }
          });
        };

        traverse(nodes);
        return accountIds;
      };

      // Obtener todos los account_id únicos que necesitan enriquecimiento
      const accountIdsToFetch = Array.from(collectAccountIds(apiResponse.data.items));

      // Hacer todas las llamadas en paralelo
      const userInfoMap = new Map<string, QuestionAuthor | null>();
      await Promise.all(
        accountIdsToFetch.map(async (accountId) => {
          const userInfo = await fetchUserInfo(accountId);
          userInfoMap.set(accountId, userInfo);
        })
      );

      // Función recursiva para enriquecer todos los nodos usando el mapa
      const enrichAllNodes = (nodes: RawQuestionNode[]): RawQuestionNode[] => {
        return nodes.map((node) => {
          // Enriquecer el nodo actual si no tiene account
          let enrichedNode = node;
          if (!node.account && node.account_id) {
            const author = userInfoMap.get(node.account_id);
            if (author) {
              enrichedNode = {
                ...node,
                account: {
                  id: author.id,
                  name: author.name,
                  avatar_url: author.avatarUrl,
                  account_type: author.accountType,
                },
              };
            }
          }

          // Enriquecer respuestas (Answer) con información del autor
          if (Array.isArray(enrichedNode.answers)) {
            enrichedNode = {
              ...enrichedNode,
              answers: enrichedNode.answers.map((answer) => {
                if (!answer.account && answer.account_id) {
                  const answerAuthor = userInfoMap.get(answer.account_id);
                  if (answerAuthor) {
                    return {
                      ...answer,
                      account: {
                        id: answerAuthor.id,
                        name: answerAuthor.name,
                        avatar_url: answerAuthor.avatarUrl,
                        account_type: answerAuthor.accountType,
                      },
                    };
                  }
                }
                return answer;
              }),
            };
          }

          // Enriquecer hijos recursivamente
          const children = getRawChildren(enrichedNode);
          if (children.length > 0) {
            const enrichedChildren = enrichAllNodes(children);
            return {
              ...enrichedNode,
              child_questions: enrichedChildren,
              children: enrichedChildren,
            };
          }

          return enrichedNode;
        });
      };

      // Enriquecer todos los nodos con información del autor
      const enrichedItems = enrichAllNodes(apiResponse.data.items);

      return mapQuestionsResponse({
        ...apiResponse.data,
        items: enrichedItems,
      });
    },
    enabled: Boolean(productId),
    staleTime: 60_000,
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (payload: CreateQuestionPayload) => {
      const requestBody: Record<string, unknown> = {
        product_id: payload.productId,
        account_id: payload.accountId,
        content: payload.content,
      };

      if (payload.parentQuestionId) {
        requestBody.parent_question_id = payload.parentQuestionId;
      }

      const response = await axiosHelper.questionsAnswers.create(requestBody);
      const apiResponse = response.data as ApiResponse<RawQuestionNode>;
      return mapQuestionNode(apiResponse.data);
    },
    onSuccess: (_, variables) => {
      // Invalidar queries de preguntas del producto
      void queryClient.invalidateQueries({
        queryKey: ['productQuestions'],
        refetchType: 'active',
      });

      // Invalidar queries de preguntas realizadas y recibidas en /admin/panel/questions
      // Esto asegura que cuando el usuario vaya a esa página, vea su nueva pregunta
      void queryClient.invalidateQueries({
        queryKey: ['questions'],
        refetchType: 'active',
      });

      // También invalidar específicamente las queries de made y received para el accountId
      if (variables.accountId) {
        void queryClient.invalidateQueries({
          queryKey: ['questions', 'made', variables.accountId],
          refetchType: 'active',
        });
        void queryClient.invalidateQueries({
          queryKey: ['questions', 'received'],
          refetchType: 'active',
        });
      }
    },
  });

  const refreshQuestions = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: getQueryKey(productId, page, limit),
      refetchType: 'active',
    });
  }, [productId, page, limit, queryClient]);

  return {
    questions: questionsQuery.data?.items ?? [],
    pagination: questionsQuery.data?.pagination,
    isLoading: questionsQuery.isLoading,
    isError: questionsQuery.isError,
    error: questionsQuery.error,
    refetch: questionsQuery.refetch,
    refreshQuestions,
    createQuestion: createQuestionMutation.mutateAsync,
    createQuestionStatus: {
      isPending: createQuestionMutation.isPending,
      isError: createQuestionMutation.isError,
      error: createQuestionMutation.error,
    },
  };
};

