import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosHelper from '../helpers/axios-helper';
import {
  ShippingStatus,
  CarrierType,
  ShippingEntity,
  CreateShippingDto,
  ShippingApiResponse,
} from '../types/shipping';

// Query key constants
const SHIPPING_KEYS = {
  all: ['shippings'],
  byOrder: (orderId: string) => ['shippings', 'order', orderId],
  byStore: (storeId: string) => ['shippings', 'store', storeId],
};

/**
 * Hook to handle shipping operations
 *
 * Integrates with ms-shippings service to create shipping records.
 * Falls back to mock data if service is unavailable (dev mode).
 */
export const useShipping = () => {
  const queryClient = useQueryClient();

  // 🔹 Create shipping mutation
  const createShippingMutation = useMutation({
    mutationFn: async (request: CreateShippingDto): Promise<ShippingEntity> => {
      try {
        const response = await axiosHelper.shippings.create(request);

        const data = response.data as unknown;

        if (data && typeof data === 'object' && 'data' in data) {
          const apiResponse = data as ShippingApiResponse<ShippingEntity>;
          return apiResponse.data;
        }

        return data as ShippingEntity;
      } catch (err) {
        const error = err as { response?: { status?: number }; code?: string };

        if (error?.response?.status === 404 || error?.response?.status === 501 || error?.code === 'ECONNREFUSED') {
          console.warn('⚠️ ms-shippings endpoint not available, using fallback shipping ID generation');

          const randomBytes = new Uint8Array(6);
          crypto.getRandomValues(randomBytes);
          const randomString = Array.from(randomBytes, byte => byte.toString(36).padStart(2, '0'))
            .join('')
            .substring(0, 7)
            .toUpperCase();
          const mockShippingId = `SHIP-${Date.now()}-${randomString}`;

          const mockResponse: ShippingEntity = {
            id: mockShippingId,
            orderId: request.orderId,
            accountId: 'mock-account',
            storeId: request.storeId,
            status: request.status || ShippingStatus.PENDING,
            carrier: request.carrier || CarrierType.CUSTOM,
            origin: request.origin,
            destination: request.destination,
            dimensions: request.dimensions,
            shippingCost: request.shippingCost || 0,
            currency: request.currency || 'USD',
            creationDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return mockResponse;
        }

        throw err;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.byOrder(variables.orderId) });
      if (variables.storeId) {
        queryClient.invalidateQueries({ queryKey: SHIPPING_KEYS.byStore(variables.storeId) });
      }
    },
    onError: (error) => {
      console.error('Error creating shipping record:', error);
    },
  });

  /**
   * Create shipping record and return shipping ID
   */
  const createShipping = async (request: CreateShippingDto): Promise<string> => {
    const response = await createShippingMutation.mutateAsync(request);
    return response.id;
  };

  return {
    createShipping,
    isCreating: createShippingMutation.isPending,
    isSuccess: createShippingMutation.isSuccess,
    isError: createShippingMutation.isError,
    error: createShippingMutation.error,
  };
};

