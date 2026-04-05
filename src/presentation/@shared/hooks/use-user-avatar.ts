'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';
import { UpdateUserRequest } from '../types/account';

/**
 * Extrae la URL del avatar desde additionalInfo.avatar
 * Soporta tanto string (compatibilidad hacia atrás) como objeto media completo
 */
export function getAvatarUrl(avatar: unknown): string | undefined {
  if (!avatar) return undefined;
  
  // Si es string, retornarlo directamente (compatibilidad hacia atrás)
  if (typeof avatar === 'string') {
    return avatar;
  }
  
  // Si es objeto, intentar extraer la URL
  if (typeof avatar === 'object' && avatar !== null) {
    const avatarObj = avatar as Record<string, unknown>;
    
    // Si tiene original.url (respuesta con variantes)
    if (avatarObj.original && typeof avatarObj.original === 'object') {
      const original = avatarObj.original as Record<string, unknown>;
      if (typeof original.url === 'string') {
        return original.url;
      }
    }
    
    // Si tiene url directamente
    if (typeof avatarObj.url === 'string') {
      return avatarObj.url;
    }
    
    // Si tiene variants, usar la primera disponible
    if (avatarObj.variants && typeof avatarObj.variants === 'object') {
      const variants = avatarObj.variants as Record<string, unknown>;
      const variantKeys = ['lg', 'md', 'sm'];
      for (const key of variantKeys) {
        if (variants[key] && typeof variants[key] === 'object') {
          const variant = variants[key] as Record<string, unknown>;
          if (typeof variant.url === 'string') {
            return variant.url;
          }
        }
      }
    }
  }
  
  return undefined;
}

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

export const useUserAvatar = () => {
  const queryClient = useQueryClient();

  // Mutation para subir avatar de usuario
  const uploadAvatarMutation = useMutation({
    mutationFn: async (params: { accountId: string; file: File; currentAdditionalInfo?: Record<string, unknown> }) => {
      // 1. Subir el archivo a ms-storage
      const storageFd = new FormData();
      storageFd.append('file', params.file);

      // Usar axiosHelper para subir el archivo
      const uploadResponse = await axiosHelper.storage.upload(storageFd);
      const uploadData = uploadResponse.data as unknown as ApiResponse<{
        url?: string;
        location?: string;
        cdnUrl?: string;
        id?: string;
        original?: {
          id?: string;
          filename?: string;
          url?: string;
          size?: number;
          mimetype?: string;
          createdAt?: string;
        };
        variants?: {
          lg?: {
            id?: string;
            filename?: string;
            url?: string;
            size?: number;
            mimetype?: string;
            createdAt?: string;
          };
          md?: {
            id?: string;
            filename?: string;
            url?: string;
            size?: number;
            mimetype?: string;
            createdAt?: string;
          };
          sm?: {
            id?: string;
            filename?: string;
            url?: string;
            size?: number;
            mimetype?: string;
            createdAt?: string;
          };
        };
      }> | {
        data?: {
          url?: string;
          location?: string;
          cdnUrl?: string;
          id?: string;
          original?: {
            id?: string;
            filename?: string;
            url?: string;
            size?: number;
            mimetype?: string;
            createdAt?: string;
          };
          variants?: {
            lg?: {
              id?: string;
              filename?: string;
              url?: string;
              size?: number;
              mimetype?: string;
              createdAt?: string;
            };
            md?: {
              id?: string;
              filename?: string;
              url?: string;
              size?: number;
              mimetype?: string;
              createdAt?: string;
            };
            sm?: {
              id?: string;
              filename?: string;
              url?: string;
              size?: number;
              mimetype?: string;
              createdAt?: string;
            };
          };
        };
        url?: string;
        location?: string;
        cdnUrl?: string;
      };

      // Extraer el objeto data completo de la respuesta
      const responseData = (uploadData as ApiResponse<unknown>)?.data || uploadData;
      
      // Si la respuesta tiene original y variants, guardar el objeto completo
      // Si solo tiene url/location/cdnUrl, guardar un objeto con la URL principal
      let avatarMedia: Record<string, unknown>;
      
      if (responseData && typeof responseData === 'object' && 'original' in responseData) {
        // Respuesta con variantes - guardar el objeto completo
        avatarMedia = responseData as Record<string, unknown>;
      } else {
        // Respuesta simple - construir objeto con la URL principal
        const avatarUrl = 
          (responseData as { url?: string; location?: string; cdnUrl?: string })?.url ||
          (responseData as { url?: string; location?: string; cdnUrl?: string })?.location ||
          (responseData as { url?: string; location?: string; cdnUrl?: string })?.cdnUrl ||
          (uploadData as { url?: string; location?: string; cdnUrl?: string })?.url ||
          (uploadData as { url?: string; location?: string; cdnUrl?: string })?.location ||
          (uploadData as { url?: string; location?: string; cdnUrl?: string })?.cdnUrl;

        if (!avatarUrl) {
          throw new Error('No se pudo obtener la URL del archivo subido');
        }

        // Construir objeto media simple con la URL
        avatarMedia = {
          url: avatarUrl,
          id: (responseData as { id?: string })?.id,
        };
      }

      // 2. Actualizar el usuario con el objeto media completo en additionalInfo.avatar
      const userData: UpdateUserRequest = {
        additionalInfo: {
          ...(params.currentAdditionalInfo || {}),
          avatar: avatarMedia,
        },
      };

      const response = await axiosHelper.account.updateUser(params.accountId, userData);
      const apiResponse = response.data as unknown as ApiResponse<unknown>;
      
      return apiResponse.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas con el usuario
      queryClient.invalidateQueries({ queryKey: ['account', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['account', 'user', variables.accountId] });
    },
    onError: (error: Error) => {
      console.error('Error uploading avatar:', error);
    },
  });

  return {
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    uploadAvatarError: uploadAvatarMutation.error,
    getErrorMessage: (error: unknown): string => {
      // Intentar extraer el mensaje del error de la respuesta del servidor
      if (error && typeof error === 'object') {
        const axiosError = error as { response?: { data?: { message?: string; error?: string; detail?: string } } };
        const errorMessage = 
          axiosError?.response?.data?.message ||
          axiosError?.response?.data?.error ||
          axiosError?.response?.data?.detail;
        
        if (errorMessage) {
          return errorMessage;
        }
      }
      
      // Fallback a mensaje genérico
      return 'No se pudo subir la foto de perfil. Inténtalo nuevamente.';
    },
  };
};

