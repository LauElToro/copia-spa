import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { axiosHelper } from '../helpers/axios-helper';

export interface CreateWalletPayload {
  accountId: string;
  data: Record<string, Record<string, { Img: string; Wallet?: string }>>;
}

interface Wallet {
  id: string;
  accountId: string;
  data: Record<string, Record<string, { Img: string; Wallet?: string }>>;
}

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
}

export function useWallets() {
  const qc = useQueryClient();
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [isCommerce, setIsCommerce] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('user');
        if (raw) {
          const user = JSON.parse(raw) as { id?: string; accountType?: string };
      setAccountId(user?.id);
      setIsCommerce(user?.accountType === 'commerce' || user?.accountType === 'seller');
        } else {
          setAccountId(undefined);
          setIsCommerce(false);
        }
      } else {
        setAccountId(undefined);
        setIsCommerce(false);
      }
    } catch (error) {
      console.warn('[useWallets] Error leyendo perfil de localStorage:', error);
      setAccountId(undefined);
      setIsCommerce(false);
    }
  }, []);

  const listQuery = useQuery({
    queryKey: ['wallets', 'account', accountId],
    queryFn: async () => {
      if (!accountId) return [] as Wallet[];
      // El backend no tiene endpoint /wallets/account/:id, usar getAll y filtrar por accountId
      const res = await axiosHelper.wallets.getAll();
      const response = res.data as ApiResponse<Wallet[]> | Wallet[];
      const allWallets = (response as ApiResponse<Wallet[]>)?.data ?? (response as Wallet[]) ?? [];
      // Filtrar wallets por accountId
      return allWallets.filter((wallet: Wallet) => wallet.accountId === accountId);
    },
    enabled: !!accountId && isCommerce, // Solo ejecutar si es comercio
    staleTime: 0,
    retry: false, // No reintentar si falla (evitar errores 404 repetidos)
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateWalletPayload) => {
      const res = await axiosHelper.wallets.create(payload as unknown as Record<string, unknown>);
      const response = res.data as ApiResponse<Wallet> | Wallet;
      return (response as ApiResponse<Wallet>)?.data ?? (response as Wallet);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['wallets', 'account', accountId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<CreateWalletPayload> }) => {
      const res = await axiosHelper.wallets.update(params.id, params.data as unknown as Record<string, unknown>);
      const response = res.data as ApiResponse<Wallet> | Wallet;
      return (response as ApiResponse<Wallet>)?.data ?? (response as Wallet);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['wallets', 'account', accountId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('[deleteMutation] Eliminando wallet con ID:', id);
      if (!id || id.trim() === '') {
        throw new Error('ID de wallet inválido');
      }
      const response = await axiosHelper.wallets.remove(id.trim());
      return response;
    },
    onSuccess: async () => {
      // Invalidar todas las queries de wallets para asegurar que se actualicen
      await qc.invalidateQueries({ queryKey: ['wallets'] });
      // También invalidar específicamente la query del account
      if (accountId) {
      await qc.invalidateQueries({ queryKey: ['wallets', 'account', accountId] });
      }
    },
  });

  return { accountId, listQuery, createMutation, updateMutation, deleteMutation };
}
