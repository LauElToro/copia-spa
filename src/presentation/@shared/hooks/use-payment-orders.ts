import { useQuery } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';

// Query key constants
const PAYMENT_ORDERS_KEYS = {
  all: ['payment-orders'],
  list: (userId?: string) => ['payment-orders', 'list', userId],
  byId: (id: string) => ['payment-orders', id],
  byTransactionId: (transactionId: string) => ['payment-orders', 'transaction', transactionId],
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

interface PaymentOrderTransaction {
  transactionId: string;
  storeId: string;
  totalAmount: number;
  currency: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    currency: string;
    subtotal: number;
  }>;
  payment: {
    method: string;
    provider: string;
    status: string;
    transactionReference?: string;
    cryptoId?: string;
  };
  store?: {
    storeId: string;
    name: string;
    sellerId: string;
    contactEmail: string;
  };
  shipping?: {
    id: string;
    method: string;
    cost: number;
    estimatedDelivery: string;
  };
}

interface PaymentOrder {
  id: string;
  orderId: string;
  userId: string;
  status: string;
  transactionIds: string[];
  transactions: PaymentOrderTransaction[];
  createdAt: string;
  updatedAt: string;
}

export const usePaymentOrders = (userId?: string) => {
  // 🔹 Get all payment orders query
  const getPaymentOrdersQuery = useQuery({
    queryKey: PAYMENT_ORDERS_KEYS.list(userId),
    queryFn: async (): Promise<PaymentOrder[]> => {
      const params: Record<string, string> = {};
      if (userId) {
        params.userId = userId;
      }
      
      const response = await axiosHelper.payments.getAll(params);
      const apiResponse = response.data as unknown as ApiResponse<PaymentOrder[]>;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to fetch payment orders');
      }

      const paymentOrders = Array.isArray(apiResponse.data)
        ? apiResponse.data
        : apiResponse.data ? [apiResponse.data] : [];

      return paymentOrders;
    },
    enabled: typeof window !== 'undefined' && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: false,
  });

  // 🔹 Get payment order by ID query
  const useGetPaymentOrderByIdQuery = (id: string) =>
    useQuery({
      queryKey: PAYMENT_ORDERS_KEYS.byId(id),
      queryFn: async (): Promise<PaymentOrder> => {
        const response = await axiosHelper.payments.getById(id);
        const apiResponse = response.data as unknown as ApiResponse<PaymentOrder>;
        
        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(apiResponse.error || 'Payment order not found');
        }

        const paymentOrder = Array.isArray(apiResponse.data)
          ? apiResponse.data[0]
          : apiResponse.data;

        return paymentOrder;
      },
      enabled: !!id && typeof window !== 'undefined',
      staleTime: 5 * 60 * 1000,
      retry: false,
    });

  // 🔹 Get payment order by transaction ID (busca en todas las órdenes del usuario)
  const useGetPaymentOrderByTransactionIdQuery = (transactionId: string, userId?: string) =>
    useQuery({
      queryKey: PAYMENT_ORDERS_KEYS.byTransactionId(transactionId),
      queryFn: async (): Promise<PaymentOrderTransaction | null> => {
        if (!userId) {
          return null;
        }

        // Obtener todas las órdenes del usuario
        const params: Record<string, string> = { userId };
        const response = await axiosHelper.payments.getAll(params);
        const apiResponse = response.data as unknown as ApiResponse<PaymentOrder[]>;
        
        if (!apiResponse.success) {
          throw new Error(apiResponse.error || 'Failed to fetch payment orders');
        }

        const paymentOrders = Array.isArray(apiResponse.data)
          ? apiResponse.data
          : apiResponse.data ? [apiResponse.data] : [];

        // Buscar la transacción en todas las órdenes
        for (const order of paymentOrders) {
          if (!order.transactions || !Array.isArray(order.transactions)) {
            continue;
          }
          
          for (const t of order.transactions) {
            // ms-payments ahora retorna el data directamente después de extraerlo de ms-transactions
            // Pero por compatibilidad, también verificamos si viene envuelto
            let transactionData: unknown = t;
            if (t && typeof t === 'object' && 'data' in t && 'success' in t && t.success) {
              // Es una respuesta envuelta de ms-transactions (fallback)
              transactionData = t.data;
            }
            
            // Buscar por transactionId (business ID)
            if (transactionData && typeof transactionData === 'object' && 'transactionId' in transactionData && transactionData.transactionId === transactionId) {
              return transactionData as PaymentOrderTransaction;
            }
          }
        }

        return null;
      },
      enabled: !!transactionId && !!userId && typeof window !== 'undefined',
      staleTime: 5 * 60 * 1000,
      retry: false,
    });

  return {
    // Queries
    getPaymentOrders: getPaymentOrdersQuery,
    getPaymentOrderById: useGetPaymentOrderByIdQuery,
    getPaymentOrderByTransactionId: useGetPaymentOrderByTransactionIdQuery,
  };
};

