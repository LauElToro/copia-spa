'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';

// Tipos
export interface CryptoValidationRequest {
  transactionId: string;
  txHash: string;
  network: string;
  currency: string;
  expectedAmount: number;
  storeId: string;
  orderId?: string;
}

export interface CryptoValidationResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    txHash: string;
    status: string;
    amount: string;
    currency: string;
    network: string;
    sender: string;
    receiver: string;
    timestamp: string;
    validatedAt: string;
  };
  error?: string;
}

export interface StoreWalletResponse {
  success: boolean;
  data?: {
    wallet: string;
    network: string;
    currency: string;
    storeId: string;
  };
  error?: string;
}

export interface TransactionStatusResponse {
  txHash: string;
  status: string;
  network: string;
}

export const useCryptoValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Mutation para validar transacción
  const validateTransactionMutation = useMutation({
    mutationFn: async (data: CryptoValidationRequest): Promise<CryptoValidationResponse> => {
      const response = await axiosHelper.crypto.validateTransaction(data);
      return response.data;
    },
    onMutate: () => {
      setIsValidating(true);
      setValidationError(null);
    },
    onSettled: () => {
      setIsValidating(false);
    },
    onError: (error: Error) => {
      setValidationError(error.message || 'Error al validar la transacción');
    },
  });

  // Función helper para validar
  const validateTransaction = useCallback(
    async (data: CryptoValidationRequest): Promise<CryptoValidationResponse> => {
      return validateTransactionMutation.mutateAsync(data);
    },
    [validateTransactionMutation]
  );

  // Query para obtener wallet de tienda
  const useStoreWallet = (storeId: string, network: string, currency: string, enabled = true) => {
    return useQuery({
      queryKey: ['storeWallet', storeId, network, currency],
      queryFn: async (): Promise<StoreWalletResponse> => {
        const response = await axiosHelper.crypto.getStoreWallet(storeId, network, currency);
        return response.data;
      },
      enabled: enabled && !!storeId && !!network && !!currency,
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  // Query para verificar estado de transacción
  const useTransactionStatus = (txHash: string, network: string, enabled = true) => {
    return useQuery({
      queryKey: ['transactionStatus', txHash, network],
      queryFn: async (): Promise<TransactionStatusResponse> => {
        const response = await axiosHelper.crypto.getTransactionStatus(txHash, network);
        return response.data;
      },
      enabled: enabled && !!txHash && !!network,
      refetchInterval: 10000, // Refrescar cada 10 segundos
    });
  };

  // Query para redes soportadas
  const useSupportedNetworks = () => {
    return useQuery({
      queryKey: ['supportedNetworks'],
      queryFn: async (): Promise<{ networks: string[] }> => {
        const response = await axiosHelper.crypto.getSupportedNetworks();
        return response.data;
      },
      staleTime: 60 * 60 * 1000, // 1 hora
    });
  };

  return {
    validateTransaction,
    isValidating,
    validationError,
    validationResult: validateTransactionMutation.data,
    useStoreWallet,
    useTransactionStatus,
    useSupportedNetworks,
  };
};

export default useCryptoValidation;

