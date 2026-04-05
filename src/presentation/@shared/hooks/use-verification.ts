/**
 * useVerification Hook
 *
 * Generic hook for managing KYC/KYB verification flows.
 * Uses TanStack Query for server state management.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosHelper from '../helpers/axios-helper';
import {
  InitiateKycDto,
  InitiateKybDto,
  AccessTokenResponse,
  KycStatusResponseDto,
  KybStatusResponseDto,
  VerificationApiResponse,
  VerificationType,
  VerificationStatus,
} from '../types/verification';

// Query key factory
const getQueryKeys = (type: VerificationType, storeId: string) => ({
  all: [type] as const,
  status: [type, 'status', storeId] as const,
  token: [type, 'token', storeId] as const,
});

// API helper factory
const getApiHelper = (type: VerificationType) =>
  type === 'kyc' ? axiosHelper.kyc : axiosHelper.kyb;

// Determinar intervalo de polling basado en el estado actual
const getPollingInterval = (status?: VerificationStatus): number | false => {
  if (!status) return false;

  switch (status) {
    case VerificationStatus.REVIEW:
      // Polling agresivo durante revisión: cada 5 segundos
      return 5000;
    case VerificationStatus.PENDING:
      // Polling moderado cuando está pendiente: cada 10 segundos
      return 10000;
    case VerificationStatus.VERIFIED:
    case VerificationStatus.REJECTED:
      // Sin polling cuando está verificado o rechazado
      return false;
    default:
      return false;
  }
};

/**
 * Generic verification hook
 */
export const useVerification = (type: VerificationType, storeId?: string) => {
  const queryClient = useQueryClient();
  const apiHelper = getApiHelper(type);
  const queryKeys = getQueryKeys(type, storeId || '');

  /**
   * Mutation: Initiate verification
   */
  const initiateMutation = useMutation({
    mutationFn: async (data: InitiateKycDto | InitiateKybDto) => {
      const response = await apiHelper.initiate(data);
      return response.data as VerificationApiResponse<{
        id: string;
        storeId: string;
        status: string;
        applicantId: string;
      }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.status
      });
    },
  });

  /**
   * Mutation: Get access token for Sumsub WebSDK
   */
  const getTokenMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiHelper.getToken(id);
      return response.data as VerificationApiResponse<AccessTokenResponse>;
    },
  });

  /**
   * Query: Get verification status con smart polling silencioso
   */
  const statusQuery = useQuery({
    queryKey: queryKeys.status,
    queryFn: async () => {
      if (!storeId) {
        throw new Error(`Store ID is required to fetch ${type.toUpperCase()} status`);
      }
      const response = await apiHelper.getStatus(storeId);
      return response.data as VerificationApiResponse<KycStatusResponseDto | KybStatusResponseDto>;
    },
    enabled: !!storeId,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Smart polling: ajusta automáticamente según el estado
    refetchInterval: (query) => {
      const data = query.state.data as VerificationApiResponse<KycStatusResponseDto | KybStatusResponseDto> | undefined;
      return getPollingInterval(data?.data?.status);
    },
    refetchIntervalInBackground: false,
    // Evitar clipping: mantener datos previos durante refetch
    placeholderData: (previousData) => previousData,
    // Solo notificar cambios en los datos, no en loading states
    notifyOnChangeProps: ['data', 'error'],
    // No reintentar automáticamente en 404
    retry: (failureCount, error) => {
      // Si es 404, no reintentar (significa que no hay registro aún)
      const axiosError = error as { response?: { status?: number } };
      if (axiosError?.response?.status === 404) {
        return false;
      }
      // Para otros errores, reintentar hasta 2 veces
      return failureCount < 2;
    },
    // Suprimir logs de error para 404 (es esperado cuando no hay registro)
    meta: {
      errorMessage: (error: unknown) => {
        const axiosError = error as { response?: { status?: number } };
        // No mostrar error en consola si es 404
        if (axiosError?.response?.status === 404) {
          return null;
        }
        return error;
      },
    },
  });

  /**
   * Refresh status manually
   */
  const refreshStatus = () => {
    if (storeId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.status });
    }
  };

  return {
    // Mutations
    initiate: initiateMutation.mutate,
    initiateAsync: initiateMutation.mutateAsync,
    isInitiating: initiateMutation.isPending,
    initiateError: initiateMutation.error,

    getToken: getTokenMutation.mutate,
    getTokenAsync: getTokenMutation.mutateAsync,
    isGettingToken: getTokenMutation.isPending,
    tokenError: getTokenMutation.error,
    tokenData: getTokenMutation.data,

    // Queries
    status: statusQuery.data?.data,
    isLoadingStatus: statusQuery.isLoading,
    isFetchingStatus: statusQuery.isFetching,
    statusError: statusQuery.error,

    // Actions
    refreshStatus,
  };
};

/**
 * Type-safe wrappers for backward compatibility
 */
export const useKycVerification = (storeId?: string) =>
  useVerification('kyc', storeId);

export const useKybVerification = (storeId?: string) =>
  useVerification('kyb', storeId);

// Export query key factories for external use
export const KYC_QUERY_KEYS = {
  all: ['kyc'] as const,
  status: (storeId: string) => ['kyc', 'status', storeId] as const,
  token: (storeId: string) => ['kyc', 'token', storeId] as const,
};

export const KYB_QUERY_KEYS = {
  all: ['kyb'] as const,
  status: (storeId: string) => ['kyb', 'status', storeId] as const,
  token: (storeId: string) => ['kyb', 'token', storeId] as const,
};

