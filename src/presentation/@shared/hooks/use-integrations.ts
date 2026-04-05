import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';

export interface StoreIntegrations {
  integrations: {
    mercadoPago?: {
      enabled: boolean;
      type: string;
      link?: string;
      credentials?: {
        publicKey?: string;
        accessToken?: string;
      };
      config?: {
        autoCapture?: boolean;
        currency?: string;
        notificationUrl?: string;
        sandbox?: boolean;
      };
    };
    physicalPayments?: {
      enabled: boolean;
      type: string;
      methods?: {
        rapipago?: boolean;
        pagoFacil?: boolean;
      };
    };
    virtualWallets?: {
      enabled: boolean;
      type: string;
      methods?: {
        mercadoPago?: boolean;
        uala?: boolean;
        brubank?: boolean;
        lemon?: boolean;
        naranjaX?: boolean;
      };
    };
    stripe?: Record<string, unknown>;
    kafka?: Record<string, unknown>;
    googleAuth?: Record<string, unknown>;
  };
}

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
}

export function useIntegrations(storeId?: string) {
  const qc = useQueryClient();

  const integrationsQuery = useQuery({
    queryKey: ['stores', storeId, 'integrations'],
    queryFn: async (): Promise<StoreIntegrations> => {
      if (!storeId) {
        return { integrations: {} };
      }
      const res = await axiosHelper.stores.integrations.get(storeId);
      const response = res.data as ApiResponse<StoreIntegrations> | StoreIntegrations;
      return (response as ApiResponse<StoreIntegrations>)?.data ?? (response as StoreIntegrations) ?? { integrations: {} };
    },
    enabled: !!storeId,
    staleTime: 0,
  });

  const updateMercadoPagoLinkMutation = useMutation({
    mutationFn: async (params: { storeId: string; link: string }) => {
      if (!params.storeId || typeof params.storeId !== 'string' || params.storeId.trim() === '') {
        throw new Error('storeId must be a valid string');
      }
      const validatedStoreId = params.storeId.trim();
      const res = await axiosHelper.stores.integrations.updateMercadoPagoLink(validatedStoreId, { link: params.link });
      const response = res.data as ApiResponse<StoreIntegrations> | StoreIntegrations;
      return (response as ApiResponse<StoreIntegrations>)?.data ?? (response as StoreIntegrations);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['stores', storeId, 'integrations'] });
    },
  });

  const deleteMercadoPagoLinkMutation = useMutation({
    mutationFn: async (params: { storeId: string }) => {
      if (!params.storeId || typeof params.storeId !== 'string' || params.storeId.trim() === '') {
        throw new Error('storeId must be a valid string');
      }
      const validatedStoreId = params.storeId.trim();
      const res = await axiosHelper.stores.integrations.deleteMercadoPagoLink(validatedStoreId);
      const response = res.data as ApiResponse<StoreIntegrations> | StoreIntegrations;
      return (response as ApiResponse<StoreIntegrations>)?.data ?? (response as StoreIntegrations);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['stores', storeId, 'integrations'] });
    },
  });

  const updatePhysicalPaymentsMutation = useMutation({
    mutationFn: async (params: { storeId: string; rapipago?: boolean; pagoFacil?: boolean }) => {
      if (!params.storeId || typeof params.storeId !== 'string' || params.storeId.trim() === '') {
        throw new Error('storeId must be a valid string');
      }
      const validatedStoreId = params.storeId.trim();
      const res = await axiosHelper.stores.integrations.updatePhysicalPayments(validatedStoreId, {
        rapipago: params.rapipago,
        pagoFacil: params.pagoFacil,
      });
      const response = res.data as ApiResponse<StoreIntegrations> | StoreIntegrations;
      return (response as ApiResponse<StoreIntegrations>)?.data ?? (response as StoreIntegrations);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['stores', storeId, 'integrations'] });
    },
  });

  const updateVirtualWalletsMutation = useMutation({
    mutationFn: async (params: { storeId: string; mercadoPago?: boolean; uala?: boolean; brubank?: boolean; lemon?: boolean; naranjaX?: boolean }) => {
      if (!params.storeId || typeof params.storeId !== 'string' || params.storeId.trim() === '') {
        throw new Error('storeId must be a valid string');
      }
      const validatedStoreId = params.storeId.trim();
      const res = await axiosHelper.stores.integrations.updateVirtualWallets(validatedStoreId, {
        mercadoPago: params.mercadoPago,
        uala: params.uala,
        brubank: params.brubank,
        lemon: params.lemon,
        naranjaX: params.naranjaX,
      });
      const response = res.data as ApiResponse<StoreIntegrations> | StoreIntegrations;
      return (response as ApiResponse<StoreIntegrations>)?.data ?? (response as StoreIntegrations);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['stores', storeId, 'integrations'] });
    },
  });

  return { 
    integrationsQuery, 
    updateMercadoPagoLinkMutation, 
    deleteMercadoPagoLinkMutation,
    updatePhysicalPaymentsMutation,
    updateVirtualWalletsMutation,
  };
}

