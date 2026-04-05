import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCart } from './use-cart';
import { useCheckoutStore } from '../stores/checkout-store';
import axiosHelper from '../helpers/axios-helper';
import {
  CreatePaymentOrderDto,
  CreateTransactionDto,
  CreateOrderItemDto,
  PaymentMethod,
  PaymentOrderResponse,
  PaymentsApiResponse,
} from '../types/payment';

/**
 * Generate a cryptographically secure random string
 */
const generateSecureRandomString = (length: number): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(36).padStart(2, '0'))
    .join('')
    .substring(0, length)
    .toUpperCase();
};

/**
 * Generate a unique order ID using crypto API
 */
const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = generateSecureRandomString(8);
  return `ORD-${timestamp}-${random}`;
};

/**
 * Generate a unique transaction ID using crypto API
 */
const generateTransactionId = (index: number): string => {
  const timestamp = Date.now();
  const random = generateSecureRandomString(6);
  return `TXN-${timestamp}-${index}-${random}`;
};

/**
 * Generate correlation ID for tracking using crypto API
 */
const generateCorrelationId = (): string => {
  const random = generateSecureRandomString(12);
  return `${Date.now()}-${random}`;
};

/**
 * Map frontend payment method to backend enum
 */
const mapPaymentMethod = (method: string): PaymentMethod => {
  const mapping: Record<string, PaymentMethod> = {
    'Criptomonedas': PaymentMethod.CRYPTO,
    'Tarjeta de crédito o debito': PaymentMethod.CREDIT_CARD,
    'Transferencia Bancaria': PaymentMethod.BANK_TRANSFER,
    'Efectivo': PaymentMethod.CASH,
  };

  return mapping[method] || PaymentMethod.CREDIT_CARD;
};

/**
 * Hook to handle checkout submission and payment order creation
 *
 * Integrates with ms-payments service to create payment orders.
 * Automatically handles:
 * - Building payment order payload from cart and checkout state
 * - Unwrapping API responses
 * - Clearing cart and checkout state on success
 * - Redirecting to success page with order ID
 * - Fallback to mock response if service is unavailable (dev mode)
 *
 * @returns {Object} Checkout operations
 * @returns {Function} submitPaymentOrder - Submit payment order with user ID
 * @returns {boolean} isSubmitting - Whether submission is in progress
 * @returns {boolean} isSuccess - Whether submission succeeded
 * @returns {boolean} isError - Whether submission failed
 * @returns {Error | null} error - Error object if submission failed
 * @returns {PaymentOrderResponse | undefined} data - Payment order response data
 */
export const useCheckout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { sellerGroups, clearCart } = useCart();
  const { completedStores, resetCheckout } = useCheckoutStore();

  // Variable para controlar si el redirect debe ser automático
  const skipAutoRedirectRef = React.useRef(false);

  // Mutation to submit payment order
  const submitPaymentOrderMutation = useMutation({
    mutationFn: async (userId: string): Promise<PaymentOrderResponse> => {
      if (completedStores.length === 0) {
        throw new Error('No checkout data found. Please complete the checkout process.');
      }

      if (sellerGroups.length === 0) {
        throw new Error('No items in cart. Please add items before checkout.');
      }

      const transactions: CreateTransactionDto[] = sellerGroups.map((group, index) => {
        let storeData = completedStores.find(s => s.storeId === group.storeId);

        if (!storeData && completedStores[index]) {
          storeData = completedStores[index];
        }

        if (!storeData) {
          throw new Error(`Missing checkout data for store: ${group.storeName}. Please complete all checkout steps.`);
        }

        if (!storeData.shippingId) {
          throw new Error(`Missing shipping information for store: ${group.storeName}. Please select a shipping method.`);
        }

        if (!storeData.paymentMethod) {
          throw new Error(`Missing payment method for store: ${group.storeName}. Please select a payment method.`);
        }
        
        // Validar campos específicos según el método de pago
        const paymentMethod = mapPaymentMethod(storeData.paymentMethod);
        if (paymentMethod === PaymentMethod.CRYPTO) {
          if (!storeData.cryptoNetwork || !storeData.cryptoId) {
            throw new Error(`Missing crypto payment details for store: ${group.storeName}. Please select a network and cryptocurrency.`);
          }
        }

        const items: CreateOrderItemDto[] = group.items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          currency: 'USDT',
          subtotal: item.price * item.quantity,
        }));

        // Determinar transactionReference según el método de pago
        let transactionReference: string | undefined;
        if (paymentMethod === PaymentMethod.CRYPTO && storeData.txHash) {
          transactionReference = storeData.txHash;
        } else if (paymentMethod === PaymentMethod.BANK_TRANSFER && storeData.bankTransferReference) {
          transactionReference = storeData.bankTransferReference;
        } else if (paymentMethod === PaymentMethod.CREDIT_CARD && storeData.mercadoPagoReference) {
          transactionReference = storeData.mercadoPagoReference;
        }
        
        // Determinar provider según el método de pago
        let provider = storeData.paymentProvider || 'PLATFORM';
        if (paymentMethod === PaymentMethod.CRYPTO && storeData.cryptoNetwork) {
          provider = storeData.cryptoNetwork; // Ej: ERC-20, BEP-20, etc.
        } else if (paymentMethod === PaymentMethod.CREDIT_CARD) {
          provider = 'MERCADOPAGO';
        } else if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
          provider = 'BANK_TRANSFER';
        } else if (paymentMethod === PaymentMethod.CASH) {
          provider = 'CASH';
        }

        const transaction: CreateTransactionDto = {
          transactionId: generateTransactionId(index),
          storeId: group.storeId,
          currency: 'USDT',
          totalAmount: group.total,
          shippingId: storeData.shippingId,
          items,
          payment: {
            method: paymentMethod,
            provider: provider,
            status: 'pending',
            ...(storeData.cryptoId && { cryptoId: storeData.cryptoId }),
            ...(transactionReference && { transactionReference }),
          },
        };

        return transaction;
      });

      const paymentOrder: CreatePaymentOrderDto = {
        orderId: generateOrderId(),
        userId,
        transactions,
        meta: {
          correlationId: generateCorrelationId(),
          source: 'frontend-checkout',
          version: '1.0',
        },
      };

      try {
        const response = await axiosHelper.payments.create(paymentOrder);

        if (!response.data) {
          throw new Error('No data received from payment service');
        }

        const apiResponse = response.data as PaymentsApiResponse<PaymentOrderResponse>;

        if ('data' in apiResponse && typeof apiResponse.data === 'object') {
          return (apiResponse as PaymentsApiResponse<PaymentOrderResponse>).data;
        }

        return apiResponse as unknown as PaymentOrderResponse;
      } catch (err) {
        const error = err as { response?: { status?: number; data?: unknown }; code?: string; message?: string };

        console.error('Payment API Error:', {
          status: error?.response?.status,
          code: error?.code,
          message: error?.message,
          data: error?.response?.data,
        });

        // Extraer mensaje detallado del servidor
        let errorMessage = 'Error al procesar el pago. Por favor, intenta nuevamente.';

        if (error?.response?.data && typeof error?.response?.data === 'object') {
          const errorData = error.response.data as { detail?: string; message?: string; error?: string };
          // Priorizar 'detail' (formato RFC 7807), luego 'message', luego 'error'
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        }

        // Si no hay mensaje del servidor, usar mensajes genéricos según el código de estado
        if (errorMessage === 'Error al procesar el pago. Por favor, intenta nuevamente.') {
          if (error?.response?.status === 404) {
            errorMessage = 'El servicio de pagos no está disponible. Por favor, intenta nuevamente más tarde.';
          } else if (error?.response?.status === 400) {
            errorMessage = error?.message || 'Datos inválidos. Por favor, verifica la información e intenta nuevamente.';
          } else if (error?.response?.status === 500 || error?.response?.status === 502) {
            errorMessage = 'Error del servidor al procesar el pago. Por favor, intenta nuevamente más tarde.';
          } else if (error?.code === 'ECONNREFUSED') {
            errorMessage = 'No se pudo conectar con el servicio de pagos. Por favor, verifica tu conexión e intenta nuevamente.';
          } else if (error?.message) {
            errorMessage = error.message;
          }
        }

        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      const orderIdToUse = data.orderId || data.id;

      if (!orderIdToUse) {
        console.error('No order ID found in payment response');
      }

      // Invalidar cache de transacciones para que se actualicen automáticamente
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      // Si skipAutoRedirect está activo (para pagos crypto), no hacer redirect automático
      if (skipAutoRedirectRef.current) {
        skipAutoRedirectRef.current = false;
        return;
      }

      clearCart();
      resetCheckout();
      router.push(`/checkout/success?orderId=${orderIdToUse || 'pending'}`);
    },
    onError: (error: Error) => {
      console.error('Error creating payment order:', error);
      // Error will be handled by the component
    },
  });

  /**
   * Submit the payment order
   * @param userId - User ID
   * @param skipAutoRedirect - If true, don't auto-redirect to success (for crypto payments)
   */
  const submitPaymentOrder = async (userId: string, skipAutoRedirect = false) => {
    skipAutoRedirectRef.current = skipAutoRedirect;
    return submitPaymentOrderMutation.mutateAsync(userId);
  };

  /**
   * Completa el checkout manualmente (usado después de validar pago crypto)
   */
  const completeCheckout = (orderId?: string) => {
    clearCart();
    resetCheckout();
    router.push(`/checkout/success?orderId=${orderId || 'pending'}`);
  };

  return {
    submitPaymentOrder,
    completeCheckout,
    isSubmitting: submitPaymentOrderMutation.isPending,
    isSuccess: submitPaymentOrderMutation.isSuccess,
    isError: submitPaymentOrderMutation.isError,
    error: submitPaymentOrderMutation.error,
    data: submitPaymentOrderMutation.data,
  };
};

