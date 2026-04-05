import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';

// Query key constants
const PRODUCT_ENGAGEMENTS_KEYS = {
  all: ['product-engagements'],
  byProduct: (productId: string) => ['product-engagements', 'product', productId],
  byId: (productId: string, engagementId: string) => ['product-engagements', productId, engagementId],
  stats: (productId: string) => ['product-engagements', 'stats', productId],
};

// Tipos para las respuestas del API
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data: T;
  correlationId?: string;
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface ProductEngagement {
  id: string;
  productId: string;
  accountId?: string;
  eventType: 'VISIT' | 'REVIEW';
  rating?: number;
  title?: string;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  eventType: 'REVIEW';
  rating: number; // 1-5
  title?: string;
  comment?: string;
  metadata?: Record<string, unknown>;
}

export const useProductEngagements = (productId?: string) => {
  const queryClient = useQueryClient();

  // 🔹 Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (payload: CreateReviewPayload): Promise<ProductEngagement> => {
      if (!productId) {
        throw new Error('Product ID is required');
      }

      // Obtener accountId desde localStorage
      let accountId: string | undefined;
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('user') : undefined;
        const user = raw ? JSON.parse(raw) : undefined;
        accountId = user?.id;
      } catch {
        // Ignorar errores de parsing
      }

      const response = await axiosHelper.products.engagements.create(productId, {
        ...payload,
        ...(accountId && { accountId }),
      });

      const apiResponse = response.data as unknown as ApiResponse<ProductEngagement>;
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error || 'Failed to create review');
      }

      const engagement = Array.isArray(apiResponse.data)
        ? apiResponse.data[0]
        : apiResponse.data;

      return engagement;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      if (productId) {
        queryClient.invalidateQueries({ queryKey: PRODUCT_ENGAGEMENTS_KEYS.byProduct(productId) });
        queryClient.invalidateQueries({ queryKey: PRODUCT_ENGAGEMENTS_KEYS.stats(productId) });
      }
    },
  });

  // 🔹 Get reviews for a product
  const getReviewsQuery = useQuery({
    queryKey: PRODUCT_ENGAGEMENTS_KEYS.byProduct(productId || ''),
    queryFn: async (): Promise<ProductEngagement[]> => {
      if (!productId) {
        return [];
      }

      const response = await axiosHelper.products.engagements.list(productId, {
        eventType: 'REVIEW',
        limit: 100, // Obtener todas las reseñas (hasta 100)
      });

      // La respuesta tiene esta estructura: { success: boolean, data: { data: [], pagination: {}, filters: {} } }
      const apiResponse = response.data as unknown as ApiResponse<{
        data: ProductEngagement[];
        pagination: unknown;
        filters: unknown;
      }>;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to fetch reviews');
      }

      // Acceder a data.data porque la estructura es { data: { data: [...], pagination: {...}, filters: {...} } }
      const responseData = apiResponse.data;
      const engagements = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
          ? responseData
          : responseData
            ? [responseData as unknown as ProductEngagement]
            : [];

      return engagements;
    },
    enabled: !!productId && typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false,
  });

  return {
    // Mutations
    createReview: createReviewMutation.mutateAsync,
    isCreatingReview: createReviewMutation.isPending,
    createReviewError: createReviewMutation.error,

    // Queries
    getReviews: getReviewsQuery,
  };
};

