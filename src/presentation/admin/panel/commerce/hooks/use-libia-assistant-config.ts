'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useConfiguration } from '@/presentation/@shared/hooks/use-configuration';
import { isFrontendMockMode } from '@/presentation/@shared/mocks/frontend-mock-flag';

function getAuthHeader(): string | null {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage?.getItem('accessToken');
  return token ? `Bearer ${token}` : null;
}

export interface LibiaEmpresa {
  nombre: string;
  slogan: string;
  valores: string;
  objetivo: string;
  ubicacion: string;
  descripcion: string;
  trayectoria: string;
  tipo_producto: string;
  marca_producto: string;
  ventajasTienda: string;
}

export interface LibiaConfig {
  empresa: LibiaEmpresa;
  nombre_ia: string;
  imagen_url: string;
  politicas: Record<string, unknown>;
  logistica: Record<string, unknown>;
  pagos: Record<string, unknown>;
  personalidad: { tono: string[]; emojis: string; identidad: string };
  otros: { casosFrecuentes: string; derivarHumano: string; grupo3: string };
}

const defaultEmpresa: LibiaEmpresa = {
  nombre: '',
  slogan: '',
  valores: '',
  objetivo: '',
  ubicacion: '',
  descripcion: '',
  trayectoria: '',
  tipo_producto: '',
  marca_producto: '',
  ventajasTienda: '',
};

const defaultConfig: LibiaConfig = {
  empresa: defaultEmpresa,
  nombre_ia: '',
  imagen_url: '',
  politicas: {},
  logistica: {},
  pagos: {},
  personalidad: { tono: [], emojis: '', identidad: '' },
  otros: { casosFrecuentes: '', derivarHumano: '', grupo3: '' },
};

export function useLibiaAssistantConfig() {
  const qc = useQueryClient();
  const { storeQuery } = useConfiguration();
  const storeId = (storeQuery.data as { id?: string } | undefined)?.id;

  const configQuery = useQuery({
    queryKey: ['libia', 'comercio', 'config', storeId],
    queryFn: async () => {
      if (!storeId) return defaultConfig;
      if (isFrontendMockMode()) {
        return {
          ...defaultConfig,
          nombre_ia: 'Libia (demo)',
          empresa: { ...defaultEmpresa, nombre: 'Tienda demo', descripcion: 'Configuración simulada' },
        };
      }
      const res = await fetch(`/api/v1/libia/comercio/config?storeId=${encodeURIComponent(storeId)}`);
      if (!res.ok) return defaultConfig;
      const data = await res.json();
      return { ...defaultConfig, ...data } as LibiaConfig;
    },
    enabled: !!storeId,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<LibiaConfig> & { storeId?: string }) => {
      const id = payload.storeId ?? storeId;
      if (!id) throw new Error('Store ID requerido');
      if (isFrontendMockMode()) {
        return { ok: true, mock: true };
      }
      const res = await fetch('/api/v1/libia/comercio/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, storeId: id, codigo_identificacion_comercio: id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? 'Error al guardar');
      }
      return res.json();
    },
    onSuccess: () => {
      if (storeId) qc.invalidateQueries({ queryKey: ['libia', 'comercio', 'config', storeId] });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const fd = new FormData();
      fd.append('file', file);
      const headers: Record<string, string> = {};
      const auth = getAuthHeader();
      if (auth) headers['Authorization'] = auth;
      if (isFrontendMockMode()) {
        return `https://picsum.photos/seed/libia-logo-${Date.now()}/200/200`;
      }
      const res = await fetch('/api/v1/libia/comercio/upload-logo', {
        method: 'POST',
        body: fd,
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { message?: string }).message ?? 'Error al subir logo');
      }
      const url = (data as { url?: string }).url;
      if (!url) throw new Error('No se recibió la URL del logo');
      return url;
    },
    onSuccess: () => {
      if (storeId) qc.invalidateQueries({ queryKey: ['libia', 'comercio', 'config', storeId] });
    },
  });

  return {
    config: configQuery.data ?? defaultConfig,
    isLoading: configQuery.isLoading,
    isSaving: saveMutation.isPending,
    save: saveMutation.mutateAsync,
    uploadLogo: uploadLogoMutation.mutateAsync,
    isUploadingLogo: uploadLogoMutation.isPending,
    storeId,
  };
}
