import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';
import { TransactionEntity, TransactionResponse } from '../types/transaction';

// Query key constants
const TRANSACTIONS_KEYS = {
  all: ['transactions'],
  list: (accountId?: string) => ['transactions', 'list', accountId],
  byId: (id: string) => ['transactions', id],
};

export const useTransactions = (accountId?: string) => {
  const queryClient = useQueryClient();

  // 🔹 Get all transactions query
  const getTransactionsQuery = useQuery({
    queryKey: TRANSACTIONS_KEYS.list(accountId),
    queryFn: async (): Promise<TransactionEntity[]> => {
      // Enviar parámetros de ordenamiento: más nuevas primero (descendente por fecha)
      const params: Record<string, string> = {
        orderBy: 'date',
        order: 'desc',
      };
      
      // Si hay accountId, agregarlo como filtro
      if (accountId) {
        params.accountId = accountId;
      }
      
      const response = await axiosHelper.transactions.getAll(params);
      const apiResponse = response.data as unknown as TransactionResponse;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to fetch transactions');
      }

      // Si data es undefined o null, retornar array vacío
      if (!apiResponse.data) {
        return [];
      }

      // Normalizar a array si es un solo objeto
      const transactions = Array.isArray(apiResponse.data)
        ? apiResponse.data
        : apiResponse.data ? [apiResponse.data] : [];

      console.log('[useTransactions] Raw API response:', {
        success: apiResponse.success,
        dataLength: transactions.length,
        accountId,
        orderBy: 'date',
        order: 'desc',
      });

      // El backend ya filtra por accountId y ordena, así que retornamos directamente
      return transactions;
    },
    enabled: typeof window !== 'undefined' && !!accountId, // Solo habilitar si hay accountId
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnMount: true, // Refetch cuando se monta el componente para obtener datos actualizados
    refetchOnWindowFocus: true, // Refetch cuando la ventana recupera el foco
    retry: false,
  });

  // 🔹 Get transaction by ID query
  const useGetTransactionByIdQuery = (id: string) =>
    useQuery({
      queryKey: TRANSACTIONS_KEYS.byId(id),
      queryFn: async (): Promise<TransactionEntity> => {
        const response = await axiosHelper.transactions.getById(id);
        const apiResponse = response.data as unknown as TransactionResponse;
        
        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(apiResponse.error || 'Transaction not found');
        }

        // Normalizar a objeto único si es array
        const transaction = Array.isArray(apiResponse.data)
          ? apiResponse.data[0]
          : apiResponse.data;

        return transaction;
      },
      enabled: !!id && typeof window !== 'undefined',
      staleTime: 5 * 60 * 1000,
      retry: false,
    });

  // 🔹 Helper functions
  const refetchTransactions = () => {
    queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEYS.all });
  };

  const refetchTransaction = (id: string) => {
    queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEYS.byId(id) });
  };

  return {
    // Queries
    getTransactions: getTransactionsQuery,
    getTransactionById: useGetTransactionByIdQuery,

    // Helper functions
    refetchTransactions,
    refetchTransaction,
  };
};

