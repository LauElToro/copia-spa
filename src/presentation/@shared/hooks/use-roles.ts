import { useQuery } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';

// Tipos para las respuestas del API
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  correlationId: string;
  meta: {
    timestamp: string;
    version: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  permissions?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

export interface RolesResponse {
  roles: Role[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Query keys
const ROLES_KEYS = {
  all: ['roles'],
  list: () => [...ROLES_KEYS.all, 'list'],
  byName: (name: string) => [...ROLES_KEYS.all, 'name', name],
  byAccountType: (type: string) => [...ROLES_KEYS.all, 'accountType', type],
};

export const useRoles = () => {
  /**
   * Hook para obtener todos los roles disponibles
   */
  const useAllRoles = () => {
    return useQuery({
      queryKey: ROLES_KEYS.list(),
      queryFn: async (): Promise<Role[]> => {
        try {
          const response = await axiosHelper.rolesPermissions.getRoles({ limit: 100 });
          const apiResponse = response.data as unknown as ApiResponse<RolesResponse>;
          return apiResponse.data.roles;
        } catch (error) {
          console.error('Error fetching roles:', error);
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (cacheTime se cambió a gcTime en versiones recientes)
      retry: false, // No reintentar si falla
    });
  };

  /**
   * Hook para obtener rol por nombre
   */
  const useRoleByName = (name: string) => {
    const allRolesQuery = useAllRoles();
    
    return useQuery({
      queryKey: ROLES_KEYS.byName(name),
      queryFn: async (): Promise<Role | null> => {
        try {
          if (!allRolesQuery.data) return null;
          
          return allRolesQuery.data.find((role: Role) => role.name === name) || null;
        } catch (error) {
          console.error('Error fetching role by name:', error);
          return null;
        }
      },
      enabled: !!name && !!allRolesQuery.data,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false, // No reintentar si falla
    });
  };

  /**
   * Hook para obtener ID del rol según el tipo de cuenta
   */
  const useRoleIdByAccountType = (type: 'user' | 'commerce' | 'seller') => {
    const allRolesQuery = useAllRoles();
    
    return useQuery({
      queryKey: ROLES_KEYS.byAccountType(type),
      queryFn: async (): Promise<string | null> => {
        try {
          if (!allRolesQuery.data) return null;

          let roleName: string;
          
          switch (type) {
            case 'user':
              roleName = 'user'; // o 'customer' dependiendo de cómo estén definidos
              break;
            case 'commerce':
            case 'seller':
              roleName = 'seller'; // o 'store_owner' dependiendo de cómo estén definidos
              break;
            default:
              throw new Error(`Unknown account type: ${type}`);
          }

          const role = allRolesQuery.data.find((r: Role) => r.name === roleName);
          return role?.id || null;
        } catch (error) {
          console.error('Error getting role ID by account type:', error);
          return null;
        }
      },
      enabled: !!type && !!allRolesQuery.data,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false, // No reintentar si falla
    });
  };

  return {
    useAllRoles,
    useRoleByName,
    useRoleIdByAccountType,
  };
};
