import { axiosHelper } from '../helpers/axios-helper';
import {
  LoginRequest,
  LoginResponse
} from '../types/auth';
import {
  UserEntity
} from '../types/account';
import { StoreEntity, CreateStoreRequest } from '../types/store';

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

type AccountType = 'user' | 'commerce' | 'seller';

export interface IntegratedRegisterRequest {
  // Datos para ms-auth (solo credenciales)
  email: string;
  password: string;
  isActive?: boolean;

  // Datos para ms-account (información del perfil)
  name: string;
  lastName?: string;
  dni?: number;
  phone?: {
    countryCode: string;
    areaCode: string;
    number: string;
  };
  additionalInfo?: Record<string, unknown>;

  // Tipo de cuenta para asignar rol correcto
  accountType?: AccountType;
}

export interface IntegratedRegisterResponse {
  authUser: Record<string, unknown>; // Usuario creado en ms-auth
  accountUser: UserEntity; // Usuario creado en ms-account
  accountId: string;
  storeId?: string | null; // Store ID for commerce accounts
}

export class IntegratedAuthService {
  /**
   * Build store data from registration request
   * @deprecated Este método ya no se usa directamente. El BFF API maneja la creación de tiendas.
   * Se mantiene por compatibilidad o para uso futuro si es necesario.
   */
  private static buildStoreData(data: IntegratedRegisterRequest, accountId: string): CreateStoreRequest {
    const phoneData = data.phone || {
      countryCode: '+54',
      areaCode: '11',
      number: '00000000',
    };

    // Construir información base sin location (location requiere todos los campos)
    // NOTA: Usar camelCase para coincidir con los DTOs del backend
    const storeData: CreateStoreRequest = {
      name: data.name,
      email: data.email,
      plan: (data.additionalInfo?.plan as string) || 'Plan Starter',
      isActive: true,
      userId: accountId,
      accountId: accountId,
      storeIdentificationCode: `STORE-${accountId.substring(0, 8).toUpperCase()}`,
      categoryCode: (data.additionalInfo?.category as string) || 'general',
      holderInformation: {
        name: data.name,
        email: data.email,
        identityDocument: data.dni || 38000001,
        phone: {
          countryCode: phoneData.countryCode,
          areaCode: phoneData.areaCode,
          number: phoneData.number,
        },
      },
      information: {
        cuitCuil: data.dni ? String(data.dni) : '',
        description: `Tienda de ${data.name}`,
        logo: '',
        banner: '',
        phone: {
          countryCode: phoneData.countryCode,
          areaCode: phoneData.areaCode,
          number: phoneData.number,
        },
      },
    };

    // Solo incluir location si tenemos todos los campos requeridos
    const city = data.additionalInfo?.city as string;
    const state = data.additionalInfo?.state as string;
    const country = (data.additionalInfo?.country as string) || 'Argentina';
    const address = data.additionalInfo?.address as string;
    const postalCode = data.additionalInfo?.postalCode as string;

    if (city && state && address && postalCode) {
      storeData.information!.location = {
        latitude: (data.additionalInfo?.latitude as number) || 0,
        longitude: (data.additionalInfo?.longitude as number) || 0,
        address,
        city,
        state,
        country,
        postalCode: postalCode,
      };
    }

    return storeData;
  }

  /**
   * Create store for commerce account
   * @deprecated Este método ya no se usa directamente. El BFF API maneja la creación de tiendas.
   * Se mantiene por compatibilidad o para uso futuro si es necesario.
   */
  private static async createCommerceStore(
    data: IntegratedRegisterRequest,
    accountId: string
  ): Promise<string> {
    const storeData = this.buildStoreData(data, accountId);
    const storeResponse = await axiosHelper.stores.create(storeData);
    const store: StoreEntity = storeResponse.data.data;
    return store.id;
  }

  /**
   * Registro integrado: usa el BFF API para orquestar la creación completa de cuenta
   * El BFF maneja: ms-account -> ms-roles-permissions -> ms-auth -> ms-stores (si aplica)
   * Incluye rollback automático si cualquier paso falla
   */
  static async registerIntegrated(data: IntegratedRegisterRequest): Promise<IntegratedRegisterResponse> {
    try {
      // Preparar datos para el BFF API
      // El BFF espera el mismo formato que IntegratedRegisterRequest
      const bffRequest = {
        email: data.email,
        password: data.password,
        name: data.name,
        lastName: data.lastName,
        dni: data.dni,
        phone: data.phone,
        additionalInfo: data.additionalInfo,
        accountType: data.accountType ?? 'user',
        isActive: data.isActive ?? true,
      };

      // Llamar al BFF API - una sola llamada que orquesta todo
      const bffResponse = await axiosHelper.bff.register(bffRequest);
      const bffApiResponse = bffResponse.data as unknown as ApiResponse<{
        accountId: string;
        authUserId: string;
        storeId?: string | null;
        accountType: string;
      }>;
      
      const bffData = bffApiResponse.data;

      // Guardar información en localStorage si es necesario
      if (globalThis.window !== undefined) {
        const resolvedAccountType = (bffData.accountType ?? data.accountType ?? 'user') as 'user' | 'commerce' | 'seller';
        localStorage.setItem('user', JSON.stringify({
          id: bffData.accountId,
          email: data.email,
          name: data.name,
          accountType: resolvedAccountType,
        }));
        if (resolvedAccountType === 'commerce' || resolvedAccountType === 'seller') {
          localStorage.setItem('preferredAccountType', resolvedAccountType);
        }
        if (bffData.storeId) {
          localStorage.setItem('storeId', bffData.storeId);
        }
      }

      // Retornar respuesta compatible con el formato anterior
      // Nota: El BFF no retorna accountUser completo, solo IDs
      // Para compatibilidad, creamos un objeto mínimo
      return {
        authUser: {
          id: bffData.authUserId,
          email: data.email,
        },
        accountUser: {
          id: bffData.accountId,
          name: data.name,
          accountType: bffData.accountType as 'user' | 'commerce' | 'seller',
        } as UserEntity,
        accountId: bffData.accountId,
        storeId: bffData.storeId || null,
      };
    } catch (error) {
      console.error('Error in integrated registration via BFF:', error);

      // El BFF ya maneja el rollback automáticamente
      // Solo necesitamos propagar el error con un mensaje amigable
      const axiosErr = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosErr?.response?.data?.message || axiosErr?.message || 'Error al crear la cuenta';
      throw new Error(errorMessage);
    }
  }

  /**
   * Login integrado: autentica y obtiene información completa del usuario
   */
  static async loginIntegrated(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // 1. Autenticar en ms-auth
      const authResponse = await axiosHelper.auth.login(credentials);
      const authApiResponse = authResponse.data as unknown as ApiResponse<Record<string, unknown>>;
      const authData = authApiResponse.data;

      // 2. Obtener información completa del usuario desde ms-account usando el accountId
      const accountId = authData.accountId as string; // El accountId viene en la respuesta de ms-auth

      let accountUser;
      if (accountId) {
        const accountResponse = await axiosHelper.account.getUserById(accountId);
        const accountApiResponse = accountResponse.data as unknown as ApiResponse<UserEntity>;
        accountUser = accountApiResponse.data;
      }

      return {
        accessToken: authData.accessToken as string,
        refreshToken: authData.refreshToken as string,
        user: {
          id: accountUser?.id || accountId,
          email: credentials.email, // El email viene del login request
          name: accountUser?.name || '',
        },
        accountId: accountUser?.id || accountId,
      };
    } catch (error) {
      console.error('Error in integrated login:', error);
      throw error;
    }
  }

  /**
   * Verificar si un email ya existe en ms-auth
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Verificar en ms-auth usando el endpoint de validate-token o un endpoint específico
      // Por ahora, intentamos hacer login para verificar si existe
      await axiosHelper.auth.login({ email, password: 'dummy' });
      return true; // Si no hay error de "usuario no encontrado", el usuario existe
    } catch (error: unknown) {
      const axiosError = error as Error & {
        response?: {
          status?: number;
          data?: { message?: string }
        }
      };

      if (axiosError?.response?.status === 401 && axiosError?.response?.data?.message?.includes('Invalid credentials')) {
        return true; // Usuario existe pero credenciales incorrectas
      }
      if (axiosError?.response?.status === 404 || axiosError?.response?.data?.message?.includes('User not found')) {
        return false; // Usuario no existe
      }
      throw error; // Otro tipo de error
    }
  }

  /**
   * Actualizar información del usuario en ambos microservicios
   */
  static async updateUserIntegrated(accountId: string, updateData: Record<string, unknown>): Promise<void> {
    try {
      // Actualizar en ms-account
      await axiosHelper.account.updateUser(accountId, updateData);

      // Si es necesario, también actualizar en ms-auth
      // (dependiendo de qué campos se actualicen)
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Get role ID for account type
   * @deprecated Este método ya no se usa directamente. El BFF API maneja la asignación de roles.
   * Se mantiene por compatibilidad o para uso futuro si es necesario.
   */
  private static async getRoleId(accountType?: string): Promise<string | null> {
    if (!accountType) return null;

    try {
      const rolesResponse = await axiosHelper.rolesPermissions.getRoles({ limit: 100 });
      const rolesApiResponse = rolesResponse.data as unknown as ApiResponse<{ roles: Array<{ id: string; name: string }> }>;
      const roles = rolesApiResponse.data.roles;

      const roleName = this.getRoleName(accountType);
      const role = roles.find(r => r.name === roleName);

      if (role) {
        return role.id;
      } else {
        console.warn(`Role not found for account type: ${accountType}`);
        return null;
      }
    } catch (roleError) {
      console.warn('Error fetching roles, proceeding without role assignment:', roleError);
      return null;
    }
  }

  /**
   * Get role name for account type
   * @deprecated Este método ya no se usa directamente. El BFF API maneja la asignación de roles.
   * Se mantiene por compatibilidad o para uso futuro si es necesario.
   */
  private static getRoleName(accountType: string): string {
    switch (accountType) {
      case 'user':
        return 'user';
      case 'commerce':
      case 'seller':
        return 'seller';
      default:
        console.warn(`Unknown account type: ${accountType}`);
        return '';
    }
  }
}
