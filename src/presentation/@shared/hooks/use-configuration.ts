'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { axiosHelper } from '../helpers/axios-helper';

interface StoreData {
  id?: string;
  [key: string]: unknown;
}

interface UserData {
  id?: string;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
}

export function useConfiguration() {
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
    } catch {
      setAccountId(undefined);
      setIsCommerce(false);
    }
  }, []);

  const storeQuery = useQuery({
    queryKey: ['account', 'store', accountId],
    queryFn: async () => {
      if (!accountId) return undefined;
      try {
        // Verificar que axiosHelper esté inicializado de forma segura
        let helper: typeof axiosHelper;
        try {
          helper = axiosHelper;
        } catch {
          return undefined;
        }

        if (!helper || !helper.account || typeof helper.account.getStore !== 'function') {
          return undefined;
        }

        const res = await helper.account.getStore(accountId);
        const response = res.data as unknown as ApiResponse<StoreData> | StoreData;
        return (response as ApiResponse<StoreData>)?.data ?? (response as StoreData);
      } catch (error) {
        // Si el store no existe, retornar undefined en lugar de lanzar error
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError?.response?.status === 400 || axiosError?.response?.status === 404) {
          return undefined;
        }
        // Re-lanzar otros errores
        throw error;
      }
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
    enabled: !!accountId && isCommerce,
  });

  const userQuery = useQuery({
    queryKey: ['account', 'user'],
    queryFn: async () => {
      if (!accountId) return undefined;

      // Verificar que axiosHelper esté inicializado de forma segura
      let helper: typeof axiosHelper;
      try {
        helper = axiosHelper;
      } catch {
        return undefined;
      }

      if (!helper || !helper.account || typeof helper.account.getUserById !== 'function') {
        return undefined;
      }

      const res = await helper.account.getUserById(accountId);
      const response = res.data as unknown as ApiResponse<UserData> | UserData;
      return (response as ApiResponse<UserData>)?.data ?? (response as UserData);
    },
    retry: false,
    staleTime: 0,
    enabled: !!accountId,
  });

  const updateStoreMutation = useMutation({
    mutationFn: async (payload: { id: string; data: Record<string, unknown> }) => {
      let helper: typeof axiosHelper;
      try {
        helper = axiosHelper;
      } catch (error) {
        throw new Error('Error accediendo a axiosHelper: ' + (error instanceof Error ? error.message : String(error)));
      }

      if (!helper || !helper.account || typeof helper.account.updateStore !== 'function') {
        throw new Error('axiosHelper.account.updateStore no está disponible');
      }

      const res = await helper.account.updateStore(payload.id, payload.data);

      // Verificar el status HTTP primero
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(`Error al actualizar tienda: ${res.status}`);
      }

      // Si el status es 200/201, considerar la operación exitosa
      // La respuesta puede venir en diferentes formatos, manejarlos todos
      let storeData: StoreData | undefined;

      // Intentar extraer datos de la respuesta
      const response = res.data;

      // Caso 1: ApiResponse con success y data
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        const apiResponse = response as ApiResponse<StoreData>;
        // Solo lanzar error si success es explícitamente false
        if (apiResponse.success === false) {
          throw new Error((apiResponse as { error?: string; message?: string }).error || (apiResponse as { error?: string; message?: string }).message || 'Error al actualizar tienda');
        }
        // Si hay data, usarlo
        if (apiResponse.data) {
          storeData = apiResponse.data;
        }
      }

      // Caso 2: StoreData directamente (sin wrapper ApiResponse)
      if (!storeData && response && typeof response === 'object') {
        // Verificar si tiene campos típicos de Store
        const responseObj = response as Record<string, unknown>;
        if ('id' in responseObj || ('name' in responseObj && 'email' in responseObj)) {
          storeData = responseObj as unknown as StoreData;
        }
      }

      // Si no pudimos extraer datos pero el status es 200, crear un objeto básico para evitar error
      if (!storeData) {
        // Retornar el payload original como fallback
        storeData = { id: payload.id, ...payload.data } as unknown as StoreData;
      }

      return storeData;
    },
    onSuccess: (data) => {
      // Update cache and invalidate to trigger refetch
      const storeAccountId = accountId;
      if (storeAccountId) {
        qc.setQueryData(['account', 'store', storeAccountId], data);
      }
      void qc.invalidateQueries({ queryKey: ['account', 'store'] });
    },
    onError: (error) => {
      console.error('[updateStoreMutation] Error:', error instanceof Error ? error.message : String(error));
    },
  });

  // Función auxiliar para subir archivos (reservada para uso futuro)
  // const uploadFile = async (file: File) => {
  //   const fd = new FormData();
  //   fd.append('file', file);
  //   const res = await axiosHelper.storage.upload(fd);
  //   const data = (res.data as any)?.data ?? res.data;
  //   return data?.id || data?.fileId || data; // tolerante a diferentes formatos
  // };

  const uploadLogoMutation = useMutation({
    mutationFn: async (params: { storeId: string; file: File }) => {
      let helper: typeof axiosHelper;
      try {
        helper = axiosHelper;
      } catch (error) {
        throw new Error('Error accediendo a axiosHelper: ' + (error instanceof Error ? error.message : String(error)));
      }

      if (!helper || !helper.account || typeof helper.account.updateStore !== 'function') {
        throw new Error('axiosHelper.account.updateStore no está disponible');
      }

      const fd = new FormData();
      fd.append('logo', params.file);
      // Pasar FormData directamente - axios detectará automáticamente que es FormData
      await helper.account.updateStore(params.storeId, fd);
      return qc.invalidateQueries({ queryKey: ['account', 'store'] });
    },
  });

  const uploadBannerMutation = useMutation({
    mutationFn: async (params: { storeId: string; file: File }) => {
      let helper: typeof axiosHelper;
      try {
        helper = axiosHelper;
      } catch (error) {
        throw new Error('Error accediendo a axiosHelper: ' + (error instanceof Error ? error.message : String(error)));
      }

      if (!helper || !helper.account || typeof helper.account.updateStore !== 'function') {
        throw new Error('axiosHelper.account.updateStore no está disponible');
      }

      const fd = new FormData();
      fd.append('banner', params.file);
      // Pasar FormData directamente - axios detectará automáticamente que es FormData
      await helper.account.updateStore(params.storeId, fd);
      return qc.invalidateQueries({ queryKey: ['account', 'store'] });
    },
  });

  // Función para forzar refetch sin cache
  const forceRefetchStore = () => {
    setCacheBuster(Date.now());
  };

  return { storeQuery, userQuery, updateStoreMutation, uploadLogoMutation, uploadBannerMutation, forceRefetchStore };
}


