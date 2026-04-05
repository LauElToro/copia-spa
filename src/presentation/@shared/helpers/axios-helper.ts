import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { isFrontendMockMode } from '../mocks/frontend-mock-flag';
import { mockDemoAccessToken } from '../mocks/mock-auth-tokens';
import { tryResolveAxiosMock } from '../mocks/axios-mock-resolver';
import {
  RegisterUserRequest,
  RegisterUserResponse,
  LoginRequest,
  LoginResponse,
  OtpRequest,
  OtpRequestResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  RefreshTokenResponse,
  LogoutResponse,
  HealthCheckResponse,
} from '../types/auth';

import {
  ProductEntity,
  CategoryEntity,
  CategoryWithProducts,
  PhotoEntity,
} from '../types/product';
import {
  UserEntity,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats,
  AccountApiResponse,
  PaginatedResponse,
} from '../types/account';
import {
  CreateStoreRequest,
  StoreApiResponse,
} from '../types/store';

// Tipo para crear productos (definido localmente para evitar dependencia circular)
interface CreateProductRequest {
  name: string;
  price: number;
  crypto: string;
  description?: string;
  category_identification_code: string;
  status?: string;
  promotion?: string;
  year: number;
  condition: 'new' | 'used';
  active_status: number;
  account_id?: string;
  accountId?: string;
  meta?: Record<string, unknown>;
  shipping?: {
    origin: {
      address: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    weight: number;
    content_type: string;
    declared_value: number;
    shipping_method: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}

const removeTrailingSlash = (value: string): string => {
  if (value.length <= 1) {
    return value;
  }
  return value.replace(/\/+$/, '');
};

const sanitizeServiceBaseUrl = (rawUrl: string, serviceSlug: string): string => {
  const trimmedUrl = rawUrl.trim();
  const normalizedSlug = serviceSlug.replace(/^\/+|\/+$/g, '');

  if (normalizedSlug.length === 0) {
    return removeTrailingSlash(trimmedUrl);
  }

  try {
    const url = new URL(trimmedUrl);
    const slugPath = `/${normalizedSlug}`;
    const currentPath =
      url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;

    if (currentPath === slugPath) {
      url.pathname = '/';
    }

    const serialized = `${url.origin}${url.pathname}`;
    return removeTrailingSlash(serialized);
  } catch {
    const slugPattern = new RegExp(`/${normalizedSlug}/?$`);
    const sanitized = trimmedUrl.replace(slugPattern, '');
    return sanitized.length > 0 ? removeTrailingSlash(sanitized) : sanitized;
  }
};

const getServiceBaseUrl = (
  envValue: string | undefined,
  fallback: string,
  serviceSlug: string
): string => {
  // Validar que envValue no contenga 'null' o sea inválido
  let validEnvValue = envValue;
  if (validEnvValue && (validEnvValue.includes(':null') || validEnvValue.includes('null'))) {
    console.warn(`Invalid URL detected in environment variable, using fallback: ${fallback}`);
    validEnvValue = undefined;
  }

  // Sin URL o cadena vacía = same-origin (rutas relativas), para que funcione con cualquier host (IP pública, dominio)
  if (validEnvValue == null || (typeof validEnvValue === 'string' && validEnvValue.trim() === '')) {
    return '';
  }

  const base = validEnvValue.trim() || fallback;

  // Validar que la URL base sea válida
  try {
    new URL(base);
  } catch {
    console.warn(`Invalid fallback URL, using default: ${fallback}`);
    return fallback;
  }

  const sanitized = sanitizeServiceBaseUrl(base, serviceSlug);
  const result = sanitized.length > 0 ? sanitized : removeTrailingSlash(base);

  // Validación final: asegurar que el resultado no contenga 'null'
  if (result.includes(':null') || result.includes('null')) {
    console.warn(`Sanitized URL contains 'null', using fallback: ${fallback}`);
    return fallback;
  }

  return result;
};

// Configuración base para los microservicios usando variables de entorno
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
// Asegurar que API_PREFIX tenga el formato correcto
const NORMALIZED_API_PREFIX = API_PREFIX.endsWith('/') ? API_PREFIX.slice(0, -1) : API_PREFIX;

/** Cuando true, todas las llamadas van al BFF (que proxy a cada MS). Saltea el API Gateway. */
const USE_BFF_PROXY =
  process.env.NEXT_PUBLIC_USE_BFF_PROXY === 'true' ||
  process.env.NEXT_PUBLIC_USE_BFF_PROXY === '1';

// BFF base URL - se usa como proxy único cuando USE_BFF_PROXY=true
const BFF_API_BASE_URL_RAW = getServiceBaseUrl(
  process.env.NEXT_PUBLIC_BFF_API_URL,
  'http://localhost:3005',
  ''
);

// Configuración de URLs base para microservicios
// Si USE_BFF_PROXY=true, todas apuntan al BFF (bypass del gateway)
// Los valores por defecto son para desarrollo local
const MS_AUTH_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_AUTH_URL,
      'http://localhost:3001',
      'auth'
    );
const MS_ACCOUNT_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_ACCOUNT_URL,
      'http://localhost:3002',
      'accounts'
    );
const MS_PLANS_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_PLANS_URL,
      'http://localhost:3003',
      'plans'
    );
const MS_STORAGE_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_STORAGE_URL,
      'http://localhost:3004',
      'storages'
    );
const MS_TRANSACTIONS_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_TRANSACTIONS_URL,
      'http://localhost:3006',
      'transactions'
    );
const MS_PRODUCTS_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_PRODUCTS_URL,
      'http://localhost:3007',
      'products'
    );
const MS_NOTIFICATIONS_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_NOTIFICATIONS_URL,
      'http://localhost:3008',
      'notifications'
    );
// Credenciales de servicio SPA (para endpoints públicos que requieren token técnico)
const SERVICE_SPA_EMAIL =
  process.env.NEXT_PUBLIC_SERVICE_SPA_AUTH_EMAIL ||
  'service-spa@libertyclub.io';
const SERVICE_SPA_PASSWORD =
  process.env.NEXT_PUBLIC_SERVICE_SPA_AUTH_PASSWORD ||
  'LibertyClub2024!';
const MS_ROLES_PERMISSIONS_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_ROLES_PERMISSIONS_URL,
      'http://localhost:3009',
      'roles-permissions'
    );
const MS_QUESTIONS_ANSWERS_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_QUESTIONS_ANSWERS_URL,
      'http://localhost:3010',
      'questions'
    );
const MS_STORES_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_STORES_URL,
      'http://localhost:3011',
      'stores'
    );
const MS_WALLETS_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_WALLETS_URL,
      'http://localhost:3012',
      'wallets'
    );
const MS_PAYMENTS_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_PAYMENTS_URL,
      'http://localhost:3013',
      'payments'
    );
const MS_SHIPPINGS_BASE_URL = USE_BFF_PROXY
  ? BFF_API_BASE_URL_RAW
  : getServiceBaseUrl(
      process.env.NEXT_PUBLIC_MS_SHIPPINGS_URL,
      'http://localhost:3014',
      'shippings'
    );
const BFF_API_BASE_URL = BFF_API_BASE_URL_RAW;

/** Máximo de reintentos en 502/503/504 (total 2 intentos = 1 retry) */
const RETRYABLE_STATUSES = [502, 503, 504];
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1500;

/** Aplica lógica de retry a una instancia axios para 502/503/504 */
function addRetryInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    async (error: Error & { config?: Record<string, unknown>; response?: { status?: number } }) => {
      const config = error.config;
      const status = error.response?.status;
      const retryCount = (config?.__retryCount as number) ?? 0;

      if (
        config &&
        status != null &&
        RETRYABLE_STATUSES.includes(status) &&
        retryCount < MAX_RETRIES
      ) {
        config.__retryCount = retryCount + 1;
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (retryCount + 1)));
        return instance(config);
      }

      return Promise.reject(error);
    }
  );
}

// Crear instancia de axios
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: MS_AUTH_BASE_URL,
    timeout: 60000, // 60s para evitar 504 prematuros en dev
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para requests - agregar token si existe
  instance.interceptors.request.use(
    (config) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const token = window.localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else if (process.env.NODE_ENV === 'development') {
            console.warn('[msAuthApi] No se encontró accessToken en localStorage para:', config.url);
          }
        }
      } catch (error) {
        console.warn('[msAuthApi] Error accediendo a localStorage:', error);
      }
      return config;
    },
    (error: Error) => Promise.reject(error)
  );

  // Interceptor para responses - manejar errores globalmente
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: Error) => {
      const axiosError = error as Error & { response?: { status?: number; data?: unknown } };

      if (axiosError.response?.status === 401) {
        if (globalThis.window !== undefined) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }

      // Preservar la estructura de error para que sea accesible en el componente
      if (axiosError.response?.status === 409) {
        console.error('Conflict error:', axiosError.response.data);
      }

      // Re-lanzar el error manteniendo toda la información de respuesta
      return Promise.reject(axiosError);
    }
  );

  addRetryInterceptor(instance);
  return instance;
};

const createProductsInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: MS_PRODUCTS_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para agregar token y account_id si existe (solo token del usuario, NO token técnico del SPA)
  instance.interceptors.request.use(
    (config) => {
      // Verificar que config existe antes de continuar
      if (!config) {
        return config;
      }

      try {
        // Verificar que window y localStorage estén disponibles
        const hasWindow = typeof window !== 'undefined';
        const hasLocalStorage = hasWindow && typeof window.localStorage !== 'undefined';

        if (hasWindow && hasLocalStorage) {
          // Solo usar 'accessToken' del usuario, NO 'serviceSpaAccessToken'
          let token: string | null = null;
          try {
            token = window.localStorage.getItem('accessToken');
          } catch (error) {
            console.warn('[msProductsApi] Error obteniendo accessToken del localStorage:', error);
          }
          if (token && config && config.headers) {
            // Asegurar que el header Authorization se envíe correctamente
            config.headers.Authorization = `Bearer ${token}`;

            // Debug: verificar que el token se está enviando (solo en desarrollo)
            // Log removido para evitar problemas de inicialización
          } else if (process.env.NODE_ENV === 'development') {
            // Debug: verificar si no hay token (solo en desarrollo)
            const url = (config && config.url) ? String(config.url) : 'unknown';
            console.warn('[msProductsApi] No se encontró accessToken en localStorage para:', url);
          }

          // Agregar account_id en el header para endpoints que lo requieren (PUT, DELETE)
          // El backend puede usar @CurrentUser() pero también acepta account_id en el header como fallback
          if (config && config.headers && (config.method === 'put' || config.method === 'delete')) {
            try {
              // Verificar que window y localStorage estén disponibles antes de acceder
              if (typeof window !== 'undefined' && window.localStorage) {
                const raw = window.localStorage.getItem('user');
                if (raw) {
                  const user = JSON.parse(raw);
                  const accountId = user && typeof user === 'object' ? user.id : undefined;
                  if (accountId && typeof accountId === 'string') {
                    config.headers['account_id'] = accountId;
                  }
                }
              }
            } catch (error) {
              // Si no se puede obtener accountId, continuar sin él
              console.warn('[msProductsApi] Error obteniendo accountId del localStorage:', error);
            }
          }

          // NO usar serviceSpaAccessToken para ms-products
        }
      } catch (error) {
        // Si hay algún error en el interceptor, continuar sin modificar la request
        console.error('[msProductsApi] Error en interceptor:', error);
      }
      return config;
    },
    (error: Error) => Promise.reject(error)
  );

  // Interceptor para responses - manejar errores 409 silenciosamente para engagements
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: Error) => {
      const axiosError = error as Error & {
        response?: { status?: number; data?: unknown };
        config?: { url?: string; method?: string }
      };

      // Para errores 409 en endpoints de engagements (POST), es un comportamiento esperado
      // (visita ya registrada) - devolver una respuesta exitosa simulada para evitar que se muestre en la consola
      if (
        axiosError.response?.status === 409 &&
        axiosError.config?.url?.includes('/engagements') &&
        axiosError.config?.method?.toLowerCase() === 'post'
      ) {
        // Devolver una respuesta exitosa simulada para que no se muestre como error
        // Esto evita que aparezca en la consola del navegador
        return Promise.resolve({
          data: {
            success: true,
            message: 'Visit already registered',
            data: null,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: axiosError.config,
        } as AxiosResponse);
      }

      // Para otros errores, preservar el comportamiento normal
      return Promise.reject(axiosError);
    }
  );

  return instance;
};

const createAccountInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: MS_ACCOUNT_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para agregar token si existe
  instance.interceptors.request.use(
    (config) => {
      // CRÍTICO: Si el data es FormData, eliminar Content-Type para que axios lo establezca automáticamente
      // con el boundary correcto para multipart/form-data
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }

      // Endpoints públicos que no requieren autenticación
      // Solo el POST a /api/v1/accounts (crear usuario) es público
      const isPublicEndpoint =
        config.url === '/api/v1/accounts' && config.method === 'post';

      if (globalThis.window !== undefined && !isPublicEndpoint) {
        try {
          const token = typeof window !== 'undefined' && window.localStorage
            ? window.localStorage.getItem('accessToken')
            : null;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // Error accediendo a localStorage
        }
      }
      return config;
    },
    (error: Error) => Promise.reject(error)
  );

  // Interceptor para responses - manejar errores globalmente
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: Error) => {
      const axiosError = error as Error & { response?: { status?: number; data?: unknown } };

      // Preservar la estructura de error para que sea accesible en el componente
      if (axiosError.response?.status === 409) {
        console.error('Conflict error in ms-account:', axiosError.response.data);
      }

      // Re-lanzar el error manteniendo toda la información de respuesta
      return Promise.reject(axiosError);
    }
  );

  return instance;
};

// Crear instancia de axios para ms-roles-permissions
const createRolesPermissionsInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: MS_ROLES_PERMISSIONS_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const token = window.localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else if (process.env.NODE_ENV === 'development') {
            console.warn('[createRolesPermissionsInstance] No se encontró accessToken en localStorage para:', config.url);
          }
        }
      } catch (error) {
        console.warn('[createRolesPermissionsInstance] Error accediendo a localStorage:', error);
      }
      return config;
    },
    (error: Error) => Promise.reject(error)
  );

  addRetryInterceptor(instance);
  return instance;
};

// Crear función genérica para instancias de microservicios con autenticación
const createAuthenticatedInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const token = window.localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else if (process.env.NODE_ENV === 'development') {
            console.warn('[createAuthenticatedInstance] No se encontró accessToken en localStorage para:', config.url);
          }
        }
      } catch (error) {
        console.warn('[createAuthenticatedInstance] Error accediendo a localStorage:', error);
      }
      return config;
    },
    (error: Error) => Promise.reject(error)
  );

  addRetryInterceptor(instance);
  return instance;
};

// Manejo de token técnico del SPA para endpoints "públicos autenticados"
const SPA_TOKEN_STORAGE_KEY = 'serviceSpaAccessToken';
const SPA_TOKEN_TS_KEY = 'serviceSpaAccessTokenTs';
const SPA_TOKEN_TTL_MS = 55 * 60 * 1000; // ~55min

const getSpaServiceToken = async (authApiInstance?: AxiosInstance): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  if (isFrontendMockMode()) {
    try {
      const token = mockDemoAccessToken();
      window.localStorage.setItem(SPA_TOKEN_STORAGE_KEY, token);
      window.localStorage.setItem(SPA_TOKEN_TS_KEY, String(Date.now()));
      return token;
    } catch {
      return mockDemoAccessToken();
    }
  }

  try {
    const cached = window.localStorage.getItem(SPA_TOKEN_STORAGE_KEY);
    const tsStr = window.localStorage.getItem(SPA_TOKEN_TS_KEY);
    const ts = tsStr ? Number(tsStr) : 0;
    const fresh = cached && ts && Date.now() - ts < SPA_TOKEN_TTL_MS;
    if (fresh) {
      return cached as string;
    }
    if (!SERVICE_SPA_EMAIL || !SERVICE_SPA_PASSWORD) {
      return null;
    }
    // Usar la instancia pasada como parámetro o crear una nueva si no está disponible
    const authApi = authApiInstance || axios.create({
      baseURL: MS_AUTH_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    // Login en ms-auth
    const resp = await authApi.post(`${NORMALIZED_API_PREFIX}/auth/login`, {
      email: SERVICE_SPA_EMAIL,
      password: SERVICE_SPA_PASSWORD,
    });
    const data = resp.data as unknown as { data?: { accessToken?: string } };
    const spaToken = data?.data?.accessToken;
    if (spaToken) {
      window.localStorage.setItem(SPA_TOKEN_STORAGE_KEY, spaToken);
      window.localStorage.setItem(SPA_TOKEN_TS_KEY, String(Date.now()));
      return spaToken;
    }
  } catch (e) {
    // Si falla, no bloquear; se tratará como público sin token
    console.warn('SPA service auth failed', (e as Error)?.message);
  }
  return null;
};

// Exponer una función pública para realizar la precarga (login técnico) al iniciar la app
export const preloadServiceSpaToken = async (): Promise<void> => {
  try {
    // Crear una instancia temporal para evitar dependencia circular
    const tempAuthApi = axios.create({
      baseURL: MS_AUTH_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    await getSpaServiceToken(tempAuthApi);
  } catch {
    // Silencioso: si falla la precarga no bloquea el arranque del sitio
  }
};

// Reglas de endpoints públicos-autenticados (requieren token del SPA si el usuario no está logueado)
type PublicEndpointRule = {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string | RegExp; // relativo a baseURL (incluir API_PREFIX)
  useSpaToken: boolean;
};

// Configurable: agrega aquí nuevas rutas públicas autenticadas por servicio
const PUBLIC_AUTH_ENDPOINTS: PublicEndpointRule[] = [
  {
    method: 'post',
    // POST /api/v1/notifications
    path: new RegExp(`^${NORMALIZED_API_PREFIX}/notifications/?$`),
    useSpaToken: true,
  },
  {
    method: 'post',
    // POST /api/v1/stores (para registro de comercio)
    path: new RegExp(`^${NORMALIZED_API_PREFIX}/stores/?$`),
    useSpaToken: true,
  },
  {
    method: 'get',
    // GET /api/v1/currencies (listado de monedas - público)
    path: new RegExp(`^${NORMALIZED_API_PREFIX}/currencies/?$`),
    useSpaToken: false,
  },
  {
    method: 'get',
    // GET /api/v1/currencies/:code (obtener moneda por código - público)
    path: new RegExp(`^${NORMALIZED_API_PREFIX}/currencies/[^/]+/?$`),
    useSpaToken: false,
  },
];

const pathMatchesRule = (urlPath: string, rulePath: string | RegExp): boolean => {
  if (rulePath instanceof RegExp) return rulePath.test(urlPath);
  // Soporta coincidencia por prefijo (para flexibilidad)
  return urlPath.startsWith(rulePath);
};

// Creador genérico de instancia Axios que:
// 1) Prioriza token de usuario si existe
// 2) Para endpoints públicos-autenticados, inyecta token técnico del SPA (si no hay usuario)
const createPublicAwareInstance = (
  baseURL: string,
  publicRules: PublicEndpointRule[]
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(
    async (config) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const userToken = window.localStorage.getItem('accessToken');
          if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
            // Debug en desarrollo
            return config;
          }

          // Si no hay token de usuario, verificar si es un endpoint público-autenticado
          const path = config.url || '';
          const method = (config.method || 'get').toLowerCase();
          const matched = publicRules.find(
            (rule) => rule.method === method && pathMatchesRule(path, rule.path)
          );
          if (matched?.useSpaToken) {
            // Crear instancia temporal para evitar dependencia circular
            const authApi = axios.create({
              baseURL: MS_AUTH_BASE_URL,
              timeout: 30000,
              headers: { 'Content-Type': 'application/json' },
            });
            const spaToken = await getSpaServiceToken(authApi);
            if (spaToken) {
              config.headers.Authorization = `Bearer ${spaToken}`;
            }
          }
        }
      } catch {
        // Error en interceptor
      }
      return config;
    },
    (error: Error) => Promise.reject(error)
  );

  // Interceptor de respuesta para manejar errores 401 (token expirado o inválido)
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const axiosError = error as Error & {
        response?: { status?: number; data?: { error?: string; message?: string } };
        config?: InternalAxiosRequestConfig & { _retry?: boolean };
      };

      const originalRequest = axiosError.config;
      const status = axiosError.response?.status;
      const errorData = axiosError.response?.data;

      // No manejar errores 403 (Forbidden - falta de permisos), solo dejar que se muestren
      if (status === 403) {
        console.warn('[createPublicAwareInstance] Forbidden - insufficient permissions:', errorData);
        return Promise.reject(error);
      }

      // Solo manejar errores 401 (autenticación) y si no se ha reintentado ya
      if (
        status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        // Verificar si el error es por token inválido/expirado o por falta de token
        const errorMessage = (errorData?.message || errorData?.error || '').toLowerCase();
        const isTokenError = errorMessage.includes('token') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('expired') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('auth_unauthorized') ||
          errorMessage.includes('authorization') ||
          !errorMessage;

        if (!isTokenError) {
          // Si no es un error de token, no intentar refresh
          if (process.env.NODE_ENV === 'development') {
            console.warn('[createPublicAwareInstance] Error 401 no relacionado con token:', errorMessage);
          }
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          // Intentar refrescar el token
          const refreshToken = typeof window !== 'undefined' && window.localStorage
            ? window.localStorage.getItem('refreshToken')
            : null;

          if (refreshToken) {
            try {
              // Crear una instancia temporal de auth para evitar dependencia circular
              const authApi = axios.create({
                baseURL: MS_AUTH_BASE_URL,
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' },
              });

              const refreshResponse = await authApi.post(`${NORMALIZED_API_PREFIX}/auth/token/refresh`, {}, {
                headers: {
                  Authorization: `Bearer ${refreshToken}`,
                },
              });

              // La respuesta puede venir directamente o envuelta en { data: ... }
              const responseData = refreshResponse.data as unknown as
                | { accessToken?: string; refreshToken?: string }
                | { data?: { accessToken?: string; refreshToken?: string } };

              let newAccessToken: string | undefined;
              let newRefreshToken: string | undefined;

              if ('data' in responseData && responseData.data) {
                // Estructura envuelta: { data: { accessToken, refreshToken } }
                newAccessToken = responseData.data.accessToken;
                newRefreshToken = responseData.data.refreshToken;
              } else {
                // Estructura directa: { accessToken, refreshToken }
                newAccessToken = (responseData as { accessToken?: string }).accessToken;
                newRefreshToken = (responseData as { refreshToken?: string }).refreshToken;
              }

              if (newAccessToken && typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('accessToken', newAccessToken);
                if (newRefreshToken) {
                  window.localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Reintentar la petición original con el nuevo token
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return instance(originalRequest);
              } else {
                throw new Error('Invalid refresh response: missing tokens');
              }
            } catch (refreshError) {
              // Si falla el refresh, limpiar tokens y redirigir al login
              const errorMessage = (refreshError as { response?: { status?: number; data?: { message?: string } } })?.response?.data?.message ||
                (refreshError as Error)?.message || 'Unknown error';
              console.warn('[createPublicAwareInstance] Token refresh failed:', errorMessage);

              if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem('accessToken');
                window.localStorage.removeItem('refreshToken');
                window.localStorage.removeItem('user');

                // Disparar evento para que AuthContext se actualice
                window.dispatchEvent(new Event('auth-state-change'));

                // Redirigir al login si estamos en una ruta protegida
                if (window.location.pathname.startsWith('/admin/panel')) {
                  window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
                  return Promise.reject(error); // No continuar con el error original
                }
              }
              throw refreshError; // Re-lanzar para que se maneje el error
            }
          } else {
            // No hay refresh token, limpiar y redirigir
            console.warn('[createPublicAwareInstance] No refresh token available');
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.removeItem('accessToken');
              window.localStorage.removeItem('refreshToken');
              window.localStorage.removeItem('user');

              // Disparar evento para que AuthContext se actualice
              window.dispatchEvent(new Event('auth-state-change'));

              if (window.location.pathname.startsWith('/admin/panel')) {
                window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
                return Promise.reject(error); // No continuar con el error original
              }
            }
          }
        } catch {
          // Si hay algún error en el proceso de refresh, propagar el error original
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  addRetryInterceptor(instance);
  return instance;
};

// Instancias únicas para todos los microservicios
// Crear las instancias primero como constantes locales (sin exportar aún)
// Esto asegura que estén completamente inicializadas antes de usarlas
const _msAuthApi = createAxiosInstance();
const _msAccountApi = createAccountInstance();
const _msPlansApi = createAuthenticatedInstance(MS_PLANS_BASE_URL);
const _msStorageApi = createAuthenticatedInstance(MS_STORAGE_BASE_URL);
const _msTransactionsApi = createAuthenticatedInstance(MS_TRANSACTIONS_BASE_URL);
const _msProductsApi = createProductsInstance();
const _msNotificationsApi = createPublicAwareInstance(
  MS_NOTIFICATIONS_BASE_URL,
  PUBLIC_AUTH_ENDPOINTS
);
const _msRolesPermissionsApi = createRolesPermissionsInstance();
// Create Questions Answers instance with custom 404 handling for product questions
const createQuestionsAnswersInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: MS_QUESTIONS_ANSWERS_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const token = window.localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (error) {
        console.warn('[msQuestionsAnswersApi] Error accessing localStorage:', error);
      }
      return config;
    },
    (error: Error) => Promise.reject(error)
  );

  // Handle 404 on product questions as empty data (not an error)
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: Error) => {
      const axiosError = error as Error & {
        response?: { status?: number; data?: unknown };
        config?: { url?: string; method?: string }
      };

      // For 404 on /questions/product/{id} endpoints, return empty data
      // This is expected behavior when a product has no questions
      if (
        axiosError.response?.status === 404 &&
        axiosError.config?.url?.includes('/questions/product/') &&
        axiosError.config?.method?.toLowerCase() === 'get'
      ) {
        return Promise.resolve({
          data: {
            success: true,
            message: 'No questions found',
            data: { items: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false, offset: 0 } },
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: axiosError.config,
        } as AxiosResponse);
      }

      return Promise.reject(axiosError);
    }
  );

  addRetryInterceptor(instance);
  return instance;
};

const _msQuestionsAnswersApi = createQuestionsAnswersInstance();
const _msStoresApi = createPublicAwareInstance(
  MS_STORES_BASE_URL,
  PUBLIC_AUTH_ENDPOINTS
);
const _msWalletsApi = createAuthenticatedInstance(MS_WALLETS_BASE_URL);
const _msPaymentsApi = createPublicAwareInstance(
  MS_PAYMENTS_BASE_URL,
  PUBLIC_AUTH_ENDPOINTS
);
const _msShippingsApi = createAuthenticatedInstance(MS_SHIPPINGS_BASE_URL);
const _bffApi = createAxiosInstance();

// Configurar baseURL del BFF API
_bffApi.defaults.baseURL = BFF_API_BASE_URL;

function installFrontendMockAdapter(instance: AxiosInstance): void {
  if (!isFrontendMockMode()) return;
  const realAdapter =
    instance.defaults.adapter ??
    axios.getAdapter(typeof window !== 'undefined' ? ['xhr'] : ['http']);
  const previous = instance.defaults.adapter;
  instance.defaults.adapter = (cfg) => {
    const mocked = tryResolveAxiosMock(cfg);
    if (mocked) return Promise.resolve(mocked);
    return (previous ?? realAdapter)(cfg);
  };
}

[
  _msAuthApi,
  _msAccountApi,
  _msPlansApi,
  _msStorageApi,
  _msTransactionsApi,
  _msProductsApi,
  _msNotificationsApi,
  _msRolesPermissionsApi,
  _msQuestionsAnswersApi,
  _msStoresApi,
  _msWalletsApi,
  _msPaymentsApi,
  _msShippingsApi,
  _bffApi,
].forEach(installFrontendMockAdapter);

// Funciones helper para obtener las instancias de API de forma lazy
// Estas funciones acceden a las constantes locales que ya están inicializadas
const getMsProductsApi = (): AxiosInstance => _msProductsApi;
const getMsAuthApi = (): AxiosInstance => _msAuthApi;
const getMsAccountApi = (): AxiosInstance => _msAccountApi;
const getMsPlansApi = (): AxiosInstance => _msPlansApi;
const getMsStorageApi = (): AxiosInstance => _msStorageApi;
const getMsTransactionsApi = (): AxiosInstance => _msTransactionsApi;
const getMsNotificationsApi = (): AxiosInstance => _msNotificationsApi;
const getMsRolesPermissionsApi = (): AxiosInstance => _msRolesPermissionsApi;
const getMsQuestionsAnswersApi = (): AxiosInstance => _msQuestionsAnswersApi;
const getMsStoresApi = (): AxiosInstance => _msStoresApi;
const getMsWalletsApi = (): AxiosInstance => _msWalletsApi;
const getMsPaymentsApi = (): AxiosInstance => _msPaymentsApi;
const getMsShippingsApi = (): AxiosInstance => _msShippingsApi;
const getBffApi = (): AxiosInstance => _bffApi;

// Exportar las instancias después de que las funciones helper estén definidas
export const msAuthApi = _msAuthApi;
export const msAccountApi = _msAccountApi;
export const msPlansApi = _msPlansApi;
export const msStorageApi = _msStorageApi;
export const msTransactionsApi = _msTransactionsApi;
export const msProductsApi = _msProductsApi;
export const msNotificationsApi = _msNotificationsApi;
export const msRolesPermissionsApi = _msRolesPermissionsApi;
export const msQuestionsAnswersApi = _msQuestionsAnswersApi;
export const msStoresApi = _msStoresApi;
export const msWalletsApi = _msWalletsApi;
export const msPaymentsApi = _msPaymentsApi;
export const msShippingsApi = _msShippingsApi;
export const bffApi = _bffApi;

// Crear axiosHelper como un objeto que se inicializa después de que todas las instancias estén listas
// Usamos una función que retorna el objeto para asegurar que todo esté inicializado
const createAxiosHelper = () => {
  return {
    getInstance: () => getMsAuthApi(),

    // Health check
    healthCheck: () => getMsAuthApi().get<HealthCheckResponse>('/health'),

    // BFF API endpoints - Orquestador de microservicios
    bff: {
      register: (data: Record<string, unknown>) => getBffApi().post(`${NORMALIZED_API_PREFIX}/bff/accounts/register`, data),
      healthCheck: () => getBffApi().get('/health'),
    },

    // Auth endpoints
    auth: {
      register: (data: RegisterUserRequest) => getMsAuthApi().post<RegisterUserResponse>(`${NORMALIZED_API_PREFIX}/auth/register`, data),
      login: (data: LoginRequest) => getMsAuthApi().post<LoginResponse>(`${NORMALIZED_API_PREFIX}/auth/login`, data),
      logout: () => getMsAuthApi().post<LogoutResponse>(`${NORMALIZED_API_PREFIX}/auth/logout`),
      refreshToken: (token: string) => getMsAuthApi().post<RefreshTokenResponse>(`${NORMALIZED_API_PREFIX}/auth/token/refresh`, { token }),
      requestOtp: (data: OtpRequest) => getMsAuthApi().post<OtpRequestResponse>(`${NORMALIZED_API_PREFIX}/auth/request-otp`, data),
      verifyOtp: (data: OtpVerifyRequest) => getMsAuthApi().post<OtpVerifyResponse>(`${NORMALIZED_API_PREFIX}/auth/verify-otp`, data),
      validateToken: () => getMsAuthApi().post(`${NORMALIZED_API_PREFIX}/auth/validate-token`),
      updateEmail: (accountId: string, email: string) => getMsAuthApi().put(`${NORMALIZED_API_PREFIX}/auth/users/${accountId}/email`, { email }),
    },

    // Products endpoints
    products: {
      getAll: (params?: Record<string, unknown>) => getMsProductsApi().get<ProductEntity[]>(`${NORMALIZED_API_PREFIX}/products`, { params }),
      getById: (productId: string) => getMsProductsApi().get<ProductEntity>(`${NORMALIZED_API_PREFIX}/products/${productId}`),
      create: (data: CreateProductRequest | FormData) => {
        // Obtener accountId desde localStorage si está disponible
        let accountId: string | undefined;
        try {
          const raw = typeof window !== 'undefined' ? window.localStorage.getItem('user') : undefined;
          const user = raw ? JSON.parse(raw) : undefined;
          accountId = user?.id;
        } catch { }

        if (data instanceof FormData) {
          if (accountId && !data.has('accountId')) {
            data.append('accountId', accountId);
          }
          return getMsProductsApi().post<ProductEntity>(`${NORMALIZED_API_PREFIX}/products`, data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
        const payload = accountId ? { ...(data as unknown as Record<string, unknown>), accountId } : data;
        return getMsProductsApi().post<ProductEntity>(`${NORMALIZED_API_PREFIX}/products`, payload);
      },
      bulkCreate: (rows: Record<string, unknown>[], accountId?: string) => getMsProductsApi().post(`${NORMALIZED_API_PREFIX}/products/bulk`, { rows, accountId }),
      update: (productId: string, data: Partial<ProductEntity> | FormData) => {
        if (data instanceof FormData) {
          // Obtener accountId desde localStorage si está disponible
          let accountId: string | undefined;
          try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem('user') : undefined;
            const user = raw ? JSON.parse(raw) : undefined;
            accountId = user?.id;
          } catch { }

          if (accountId && !data.has('accountId')) {
            data.append('accountId', accountId);
          }
          return getMsProductsApi().put<ProductEntity>(`${NORMALIZED_API_PREFIX}/products/${productId}`, data, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
        return getMsProductsApi().put<ProductEntity>(`${NORMALIZED_API_PREFIX}/products/${productId}`, data);
      },
      delete: (productId: string) => getMsProductsApi().delete(`${NORMALIZED_API_PREFIX}/products/${productId}`),
      getAllCategories: () => getMsProductsApi().get<CategoryEntity[]>(`${NORMALIZED_API_PREFIX}/products/categories`),
      getByCategoryId: (categoryId: string) =>
        getMsProductsApi().get<CategoryWithProducts>(`${NORMALIZED_API_PREFIX}/products/categories/${categoryId}`),
      getPhotosByProductId: (productId: string) =>
        getMsProductsApi().get<PhotoEntity[]>(`${NORMALIZED_API_PREFIX}/products/${productId}/photos`),
      engagements: {
        create: (
          productId: string,
          payload: {
            eventType: 'VISIT' | 'REVIEW';
            sessionId?: string;
            referrer?: string;
            userAgent?: string;
            rating?: number;
            title?: string;
            comment?: string;
            accountId?: string; // Permitir accountId en el payload como fallback
            metadata?: Record<string, unknown>;
          }
        ) =>
          getMsProductsApi().post(`${NORMALIZED_API_PREFIX}/products/${productId}/engagements`, payload),
        list: (productId: string, params?: Record<string, unknown>) =>
          getMsProductsApi().get(`${NORMALIZED_API_PREFIX}/products/${productId}/engagements`, { params }),
        getById: (productId: string, engagementId: string) =>
          getMsProductsApi().get(`${NORMALIZED_API_PREFIX}/products/${productId}/engagements/${engagementId}`),
        update: (
          productId: string,
          engagementId: string,
          payload: Partial<{
            eventType: 'VISIT' | 'REVIEW';
            sessionId?: string;
            rating?: number;
            title?: string;
            comment?: string;
            metadata?: Record<string, unknown>;
          }>
        ) =>
          getMsProductsApi().put(
            `${NORMALIZED_API_PREFIX}/products/${productId}/engagements/${engagementId}`,
            payload
          ),
        delete: (productId: string, engagementId: string) =>
          getMsProductsApi().delete(
            `${NORMALIZED_API_PREFIX}/products/${productId}/engagements/${engagementId}`
          ),
        stats: (productId: string) =>
          getMsProductsApi().get(`${NORMALIZED_API_PREFIX}/products/${productId}/engagements/stats`),
      },
      getStats: () => getMsProductsApi().get(`${NORMALIZED_API_PREFIX}/products/stats`),
    },

    // Account endpoints
    account: {
      createUser: (data: CreateUserRequest) => getMsAccountApi().post<AccountApiResponse<UserEntity>>(`${NORMALIZED_API_PREFIX}/accounts`, data),
      getUsers: (params?: Record<string, unknown>) => getMsAccountApi().get<PaginatedResponse<UserEntity>>(`${NORMALIZED_API_PREFIX}/accounts/users`, { params }),
      getUserById: (id: string) => getMsAccountApi().get<AccountApiResponse<UserEntity>>(`${NORMALIZED_API_PREFIX}/accounts/users?id=${id}`),
      getUserByEmail: (email: string) => getMsAccountApi().get<AccountApiResponse<UserEntity>>(`${NORMALIZED_API_PREFIX}/accounts/users?email=${email}`),
      updateUser: (id: string, data: UpdateUserRequest) => getMsAccountApi().put<AccountApiResponse<UserEntity>>(`${NORMALIZED_API_PREFIX}/accounts/users/${id}`, data),
      deleteUser: (id: string) => getMsAccountApi().delete<AccountApiResponse<{ message: string }>>(`${NORMALIZED_API_PREFIX}/accounts/users/${id}`),
      getUserStats: () => getMsAccountApi().get<AccountApiResponse<UserStats>>(`${NORMALIZED_API_PREFIX}/accounts/users/stats`),
      getStore: (accountId: string) =>
        getMsAccountApi().get(`${NORMALIZED_API_PREFIX}/accounts/store`, {
          params: { accountId },
        }),
      updateStore: (id: string, data: Record<string, unknown> | FormData) =>
        getMsAccountApi().put(`${NORMALIZED_API_PREFIX}/accounts/store/${id}`, data),
      healthCheck: () => getMsAccountApi().get('/health'),
    },

    // Roles-Permissions endpoints
    rolesPermissions: {
      getRoles: (params?: Record<string, unknown>) => getMsRolesPermissionsApi().get(`${NORMALIZED_API_PREFIX}/roles-permissions/roles`, { params }),
      getRoleById: (id: string) => getMsRolesPermissionsApi().get(`${NORMALIZED_API_PREFIX}/roles-permissions/roles/${id}`),
      createRole: (data: Record<string, unknown>) => getMsRolesPermissionsApi().post(`${NORMALIZED_API_PREFIX}/roles-permissions/roles`, data),
      updateRole: (id: string, data: Record<string, unknown>) => getMsRolesPermissionsApi().put(`${NORMALIZED_API_PREFIX}/roles-permissions/roles/${id}`, data),
      deleteRole: (id: string) => getMsRolesPermissionsApi().delete(`${NORMALIZED_API_PREFIX}/roles-permissions/roles/${id}`),
      assignRole: (data: { account_id: string; role_id: string }) => getMsRolesPermissionsApi().post(`${NORMALIZED_API_PREFIX}/roles-permissions/assign-role`, data),
      healthCheck: () => getMsRolesPermissionsApi().get('/health'),
    },

    // Plans endpoints
    plans: {
      getAll: (params?: Record<string, unknown>) => getMsPlansApi().get(`${NORMALIZED_API_PREFIX}/plans`, { params }),
      getById: (id: string) => getMsPlansApi().get(`${NORMALIZED_API_PREFIX}/plans/${id}`),
      getByName: (name: string) => getMsPlansApi().get(`${NORMALIZED_API_PREFIX}/plans`, { params: { name } }),
      create: (data: Record<string, unknown>) => getMsPlansApi().post(`${NORMALIZED_API_PREFIX}/plans`, data),
      update: (id: string, data: Record<string, unknown>) => getMsPlansApi().put(`${NORMALIZED_API_PREFIX}/plans/${id}`, data),
      delete: (id: string) => getMsPlansApi().delete(`${NORMALIZED_API_PREFIX}/plans/${id}`),
      healthCheck: () => getMsPlansApi().get('/health'),
    },

    // Subscriptions endpoints (ms-plans)
    subscriptions: {
      getByAccountId: (accountId: string) =>
        getMsPlansApi().get(`${NORMALIZED_API_PREFIX}/subscriptions/account/${accountId}`),
      downgrade: (accountId: string) =>
        getMsPlansApi().post(`${NORMALIZED_API_PREFIX}/subscriptions/downgrade`, { accountId }),
    },

    // Storage endpoints
    storage: {
      upload: (formData: FormData) => getMsStorageApi().post(`${NORMALIZED_API_PREFIX}/storages/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      getFile: (fileId: string) => getMsStorageApi().get(`${NORMALIZED_API_PREFIX}/storages/files/${fileId}`),
      deleteFile: (fileId: string) => getMsStorageApi().delete(`${NORMALIZED_API_PREFIX}/storages/files/${fileId}`),
      healthCheck: () => getMsStorageApi().get('/health'),
    },

    // Transactions endpoints
    transactions: {
      getAll: (params?: Record<string, unknown>) => getMsTransactionsApi().get(`${NORMALIZED_API_PREFIX}/transactions`, { params }),
      getById: (id: string) => getMsTransactionsApi().get(`${NORMALIZED_API_PREFIX}/transactions/${id}`),
      create: (data: Record<string, unknown>) => getMsTransactionsApi().post(`${NORMALIZED_API_PREFIX}/transactions`, data),
      healthCheck: () => getMsTransactionsApi().get('/health'),
    },

    // Notifications endpoints
    notifications: {
      getAll: (params?: Record<string, unknown>) => getMsNotificationsApi().get(`${NORMALIZED_API_PREFIX}/notifications`, { params }),
      getById: (id: string) => getMsNotificationsApi().get(`${NORMALIZED_API_PREFIX}/notifications/${id}`),
      // Según README de ms-notifications, el envío se realiza con POST /api/v1/notifications
      send: (data: Record<string, unknown>) => getMsNotificationsApi().post(`${NORMALIZED_API_PREFIX}/notifications`, data),
      getInAppByAccount: (accountId: string) => getMsNotificationsApi().get(`${NORMALIZED_API_PREFIX}/notifications/in-app/account/${accountId}`),
      markAsRead: (id: string) => getMsNotificationsApi().patch(`${NORMALIZED_API_PREFIX}/notifications/in-app/${id}/mark-as-read`),
      markAllAsRead: (accountId: string) => getMsNotificationsApi().patch(`${NORMALIZED_API_PREFIX}/notifications/in-app/account/${accountId}/mark-all-as-read`),
      healthCheck: () => getMsNotificationsApi().get('/health'),
    },

    // Questions & Answers endpoints
    questionsAnswers: {
      getAll: (params?: Record<string, unknown>) => getMsQuestionsAnswersApi().get(`${NORMALIZED_API_PREFIX}/questions`, { params }),
      getById: (id: string) => getMsQuestionsAnswersApi().get(`${NORMALIZED_API_PREFIX}/questions/${id}`),
      getByProductId: (productId: string, params?: Record<string, unknown>) =>
        getMsQuestionsAnswersApi().get(`${NORMALIZED_API_PREFIX}/questions/product/${productId}`, { params }),
      create: (data: Record<string, unknown>) => getMsQuestionsAnswersApi().post(`${NORMALIZED_API_PREFIX}/questions`, data),
      answer: (id: string, data: Record<string, unknown>) => getMsQuestionsAnswersApi().post(`${NORMALIZED_API_PREFIX}/questions/${id}/answer`, data),
      delete: (id: string, accountId: string) => getMsQuestionsAnswersApi().delete(`${NORMALIZED_API_PREFIX}/questions/${id}?account_id=${accountId}`),
      healthCheck: () => getMsQuestionsAnswersApi().get('/health'),
    },

    // Stores endpoints (ms-stores)
    stores: {
      list: (params?: Record<string, unknown>) =>
        getMsStoresApi().get(`${NORMALIZED_API_PREFIX}/stores/list`, { params }),
      getPublic: (id: string) =>
        getMsStoresApi().get(`${NORMALIZED_API_PREFIX}/stores/public/${id}`),
      getPublicByAccountId: (accountId: string) =>
        getMsStoresApi().get(`${NORMALIZED_API_PREFIX}/stores/public/by-account/${accountId}`),
      create: (data: CreateStoreRequest) => getMsStoresApi().post<StoreApiResponse>(`${NORMALIZED_API_PREFIX}/stores`, data),
      getById: (id: string) => getMsStoresApi().get<StoreApiResponse>(`${NORMALIZED_API_PREFIX}/stores/${id}`),
      update: (id: string, data: Partial<CreateStoreRequest>) => getMsStoresApi().put<StoreApiResponse>(`${NORMALIZED_API_PREFIX}/stores/${id}`, data),
      delete: (id: string) => getMsStoresApi().delete(`${NORMALIZED_API_PREFIX}/stores/${id}`),
      // Bank accounts nested under store
      bankAccounts: {
        list: (storeId: string) => getMsStoresApi().get(`${NORMALIZED_API_PREFIX}/stores/${storeId}/bank-accounts`),
        getById: (storeId: string, id: string) => getMsStoresApi().get(`${NORMALIZED_API_PREFIX}/stores/${storeId}/bank-accounts/${id}`),
        create: (storeId: string, data: Record<string, unknown>) => getMsStoresApi().post(`${NORMALIZED_API_PREFIX}/stores/${storeId}/bank-accounts`, data),
        update: (storeId: string, id: string, data: Record<string, unknown>) => getMsStoresApi().put(`${NORMALIZED_API_PREFIX}/stores/${storeId}/bank-accounts/${id}`, data),
        remove: (storeId: string, id: string) => getMsStoresApi().delete(`${NORMALIZED_API_PREFIX}/stores/${storeId}/bank-accounts/${id}`),
      },
      // Integrations nested under store
      integrations: {
        get: (storeId: string) => getMsStoresApi().get(`${NORMALIZED_API_PREFIX}/stores/${storeId}/integrations`),
        updateMercadoPagoLink: (storeId: string, data: { link: string }) => getMsStoresApi().put(`${NORMALIZED_API_PREFIX}/stores/${storeId}/integrations/mercado-pago/link`, data),
        deleteMercadoPagoLink: (storeId: string) => getMsStoresApi().delete(`${NORMALIZED_API_PREFIX}/stores/${storeId}/integrations/mercado-pago/link`),
        updatePhysicalPayments: (storeId: string, data: { rapipago?: boolean; pagoFacil?: boolean }) => getMsStoresApi().put(`${NORMALIZED_API_PREFIX}/stores/${storeId}/integrations/physical-payments`, data),
        updateVirtualWallets: (storeId: string, data: { mercadoPago?: boolean; uala?: boolean; brubank?: boolean; lemon?: boolean; naranjaX?: boolean }) => getMsStoresApi().put(`${NORMALIZED_API_PREFIX}/stores/${storeId}/integrations/virtual-wallets`, data),
      },
      healthCheck: () => getMsStoresApi().get('/health'),
    },

    // Wallets endpoints
    wallets: {
      getAll: (params?: Record<string, unknown>) => getMsWalletsApi().get(`${NORMALIZED_API_PREFIX}/wallets`, { params }),
      getById: (id: string) => getMsWalletsApi().get(`${NORMALIZED_API_PREFIX}/wallets/${id}`),
      // Nota: El backend no tiene endpoint /wallets/account/:id
      // Usar getAll() y filtrar por accountId en el frontend
      create: (data: Record<string, unknown>) => getMsWalletsApi().post(`${NORMALIZED_API_PREFIX}/wallets`, data),
      update: (id: string, data: Record<string, unknown>) => getMsWalletsApi().put(`${NORMALIZED_API_PREFIX}/wallets/${id}`, data),
      remove: (id: string) => getMsWalletsApi().delete(`${NORMALIZED_API_PREFIX}/wallets/${id}`),
      healthCheck: () => getMsWalletsApi().get('/health'),
    },

    // Ambassadors (ms-account) endpoints
    ambassadors: {
      // Activar embajador (aceptación TyC)
      activate: (payload: { acceptTerms: boolean }) => getMsAccountApi().post(`${NORMALIZED_API_PREFIX}/accounts/ambassadors/activate`, payload),
      // Datos del embajador autenticado (código, link, métricas)
      // Nota: 404 es esperado si el usuario no es embajador, no es un error
      me: () => getMsAccountApi().get(`${NORMALIZED_API_PREFIX}/accounts/ambassadors/me`, {
        validateStatus: (status) => (status >= 200 && status < 300) || status === 404
      }),
      // Referidos del embajador autenticado
      referrals: (params?: Record<string, unknown>) => getMsAccountApi().get(`${NORMALIZED_API_PREFIX}/accounts/ambassadors/referrals`, { params }),
      // Ganancias (mensual y acumulado)
      earnings: (params?: { month?: number; year?: number }) => getMsAccountApi().get(`${NORMALIZED_API_PREFIX}/accounts/ambassadors/earnings`, { params }),
      // Historial de liberaciones
      payouts: () => getMsAccountApi().get(`${NORMALIZED_API_PREFIX}/accounts/ambassadors/payouts`),
      // Gestión de wallet del embajador
      getWallet: () => getMsAccountApi().get(`${NORMALIZED_API_PREFIX}/accounts/ambassadors/wallet`),
      upsertWallet: (data: Record<string, unknown>) => getMsAccountApi().put(`${NORMALIZED_API_PREFIX}/accounts/ambassadors/wallet`, data),
    },

    // KYC (Know Your Customer) endpoints (ms-stores)
    kyc: {
      initiate: (data: Record<string, unknown>) => getMsStoresApi().post(`${NORMALIZED_API_PREFIX}/stores/kyc/initiate`, data),
      getToken: (storeId: string) => getMsStoresApi().post(`${NORMALIZED_API_PREFIX}/stores/kyc/token`, { storeId }),
      getStatus: (storeId: string) => getMsStoresApi().get(`${NORMALIZED_API_PREFIX}/stores/kyc/status/${storeId}`),
    },

    // KYB (Know Your Business) endpoints (ms-stores)
    kyb: {
      initiate: (data: Record<string, unknown>) => getMsStoresApi().post(`${NORMALIZED_API_PREFIX}/stores/kyb/initiate`, data),
      getToken: (storeId: string) => getMsStoresApi().post(`${NORMALIZED_API_PREFIX}/stores/kyb/token`, { storeId }),
      getStatus: (storeId: string) => getMsStoresApi().get(`${NORMALIZED_API_PREFIX}/stores/kyb/status/${storeId}`),
    },

    // Payments endpoints - all under /payments/* (ms-payments service)
    payments: {
      getAll: (params?: Record<string, unknown>) => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/payment-orders`, { params }),
      getById: (id: string) => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/payment-orders/${id}`),
      create: (data: Record<string, unknown>) => getMsPaymentsApi().post(`${NORMALIZED_API_PREFIX}/payments/payment-orders`, data),
      processPayment: (id: string, data: Record<string, unknown>) => getMsPaymentsApi().post(`${NORMALIZED_API_PREFIX}/payments/payment-orders/${id}/process`, data),
      healthCheck: () => getMsPaymentsApi().get('/health'),
      // Uala payment endpoints
      createUalaCheckout: (data: Record<string, unknown>) => getMsPaymentsApi().post(`${NORMALIZED_API_PREFIX}/payments/uala-payments/checkout`, data),
      getUalaPaymentByCheckoutId: (checkoutId: string) => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/uala-payments/checkout/${checkoutId}`),
      getUalaPaymentByOrderId: (orderId: string) => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/uala-payments/order/${orderId}`),
      getUalaPaymentsByUserId: (userId: string) => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/uala-payments/user/${userId}`),
      checkUalaPaymentStatus: (checkoutId: string) => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/uala-payments/status/${checkoutId}`),
      checkUalaPaymentApproved: (userId: string, planId: string) => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/uala-payments/user/${userId}/plan/${planId}/approved`),
    },

    // Currencies endpoints (ms-payments service)
    currencies: {
      getAll: () => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/currencies`),
      getByCode: (code: string) => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/currencies/${code}`),
    },

    // Banks endpoints (ms-payments service)
    banks: {
      getAll: () => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/banks`),
      getById: (id: string) => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/banks/${id}`),
    },

    // Shippings endpoints
    shippings: {
      getAll: (params?: Record<string, unknown>) => getMsShippingsApi().get(`${NORMALIZED_API_PREFIX}/shippings`, { params }),
      getById: (id: string) => getMsShippingsApi().get(`${NORMALIZED_API_PREFIX}/shippings/${id}`),
      create: (data: Record<string, unknown>) => getMsShippingsApi().post(`${NORMALIZED_API_PREFIX}/shippings`, data),
      update: (id: string, data: Record<string, unknown>) => getMsShippingsApi().put(`${NORMALIZED_API_PREFIX}/shippings/${id}`, data),
      trackShipment: (id: string) => getMsShippingsApi().get(`${NORMALIZED_API_PREFIX}/shippings/${id}/track`),
      healthCheck: () => getMsShippingsApi().get('/health'),
    },

    // Crypto validation endpoints (ms-payments)
    crypto: {
      validateTransaction: (data: {
        transactionId: string;
        txHash: string;
        network: string;
        currency: string;
        expectedAmount: number;
        storeId: string;
        orderId?: string;
      }) => getMsPaymentsApi().post(`${NORMALIZED_API_PREFIX}/payments/crypto/validate`, data),
      getTransactionStatus: (txHash: string, network: string) =>
        getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/crypto/status/${txHash}`, { params: { network } }),
      getStoreWallet: (storeId: string, network: string, currency: string) =>
        getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/crypto/wallet/${storeId}/${network}/${currency}`),
      getSupportedNetworks: () => getMsPaymentsApi().get(`${NORMALIZED_API_PREFIX}/payments/crypto/networks`),
    },

    // Store crypto wallets endpoints (ms-stores)
    storeCryptoWallets: {
      get: (storeId: string) => getMsStoresApi().get(`${NORMALIZED_API_PREFIX}/stores/${storeId}/integrations/crypto-wallets`),
      update: (storeId: string, data: Record<string, unknown>) =>
        getMsStoresApi().put(`${NORMALIZED_API_PREFIX}/stores/${storeId}/integrations/crypto-wallets`, data),
      getWalletForPayment: (storeId: string, network: string, token: string) =>
        getMsStoresApi().get(`${NORMALIZED_API_PREFIX}/stores/${storeId}/integrations/crypto-wallets/${network}/${token}`),
    }
  };
};

// Exportar axiosHelper después de que todas las instancias estén inicializadas
// Todas las funciones helper y constantes ya están definidas en este punto
export const axiosHelper = createAxiosHelper();

export default axiosHelper;