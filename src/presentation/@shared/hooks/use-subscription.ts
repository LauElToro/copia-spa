import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  currency: string;
  isFree: boolean;
}

export interface SubscriptionData {
  id?: number;
  accountId: string;
  planId: number;
  startDate: string;
  endDate: string;
  period: 'monthly' | 'annual';
  status: string;
  cost?: number;
  currency?: string;
  plan?: SubscriptionPlan;
}

export const useSubscription = (accountId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subscription', accountId],
    queryFn: async () => {
      if (!accountId) return null;
      const response = await axiosHelper.subscriptions.getByAccountId(accountId);
      const data = (response.data as { data?: SubscriptionData })?.data;
      return data ?? null;
    },
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000,
  });

  const downgradeMutation = useMutation({
    mutationFn: async (accountId: string) => {
      await axiosHelper.subscriptions.downgrade(accountId);
    },
    onSuccess: (_, accountId) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', accountId] });
    },
  });

  return {
    subscription: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    downgrade: downgradeMutation.mutateAsync,
    isDowngrading: downgradeMutation.isPending,
  };
};
