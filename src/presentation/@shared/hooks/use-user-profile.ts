import { useQuery } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';
import type { AccountApiResponse, UserEntity } from '../types/account';

interface RemotePermission {
  id?: string;
  name: string;
  description?: string;
}

interface RemoteRole {
  id: string;
  name: string;
  description?: string;
  permissions?: RemotePermission[];
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

type AccountType = 'user' | 'commerce' | 'seller';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
  roles: UserRole[];
}

type AdditionalInfo = Record<string, unknown> | undefined;

const USER_PROFILE_KEY = ['user-profile'];

const normalizeAccountType = (value: unknown): AccountType => {
  if (typeof value !== 'string') {
    return 'user';
  }

  const normalized = value.trim().toLowerCase();

  const sellerSynonyms = new Set([
    'seller',
    'seller_account',
    'seller-account',
    'sellerpro',
    'seller_pro',
    'commerce_seller',
    'pro_seller',
  ]);

  const commerceSynonyms = new Set([
    'commerce',
    'commercial',
    'commerce_account',
    'commerce-account',
    'store',
    'store_owner',
    'commerce_owner',
    'commerce_store',
  ]);

  if (sellerSynonyms.has(normalized)) {
    return 'seller';
  }

  if (commerceSynonyms.has(normalized)) {
    return 'commerce';
  }

  return normalized === 'seller' ? 'seller' : 'user';
};

const buildDefaultRoles = (accountType: AccountType): UserRole[] => {
  if (accountType === 'commerce' || accountType === 'seller') {
    return [
      {
        id: 'seller-role',
        name: 'seller',
        permissions: [
          'manage_products',
          'view_analytics',
          'manage_orders',
          'manage_store',
        ],
      },
    ];
  }

  return [
    {
      id: 'user-role',
      name: 'user',
      permissions: [
        'view_products',
        'make_purchases',
        'view_orders',
        'manage_profile',
      ],
    },
  ];
};

const extractAccountTypeFromAdditionalInfo = (
  additionalInfo: AdditionalInfo,
): AccountType | null => {
  if (!additionalInfo || typeof additionalInfo !== 'object') {
    return null;
  }

  const candidates = ['type', 'accountType', 'account_type'];

  for (const key of candidates) {
    if (key in additionalInfo) {
      return normalizeAccountType(
        (additionalInfo as Record<string, unknown>)[key],
      );
    }
  }

  return null;
};

const deriveAccountType = ({
  explicitType,
  additionalInfo,
  remoteRoles,
  fallbackType,
  storeExists,
}: {
  explicitType?: AccountType;
  additionalInfo: AdditionalInfo;
  remoteRoles?: RemoteRole[];
  fallbackType?: AccountType;
  storeExists?: boolean;
}): AccountType => {
  if (explicitType) {
    return explicitType;
  }

  const fromAdditionalInfo = extractAccountTypeFromAdditionalInfo(
    additionalInfo,
  );
  if (fromAdditionalInfo) {
    return fromAdditionalInfo;
  }

  const roleNames =
    remoteRoles?.map((role) => role.name?.trim().toLowerCase()).filter(Boolean) ??
    [];

  if (
    roleNames.some((name) =>
      ['seller', 'commerce_seller', 'pro_seller'].includes(name),
    )
  ) {
    return 'seller';
  }

  if (
    roleNames.some((name) =>
      ['commerce', 'store_owner', 'commerce_owner'].includes(name),
    )
  ) {
    return 'commerce';
  }

  if (roleNames.some((name) => ['admin', 'administrator'].includes(name))) {
    return 'seller';
  }

  if (storeExists) {
    return 'seller';
  }

  if (fallbackType) {
    return fallbackType;
  }

  return 'user';
};

const mapRemoteRoles = (
  remoteRoles: RemoteRole[] | undefined,
  fallbackType: AccountType,
): UserRole[] => {
  if (remoteRoles && remoteRoles.length > 0) {
    return remoteRoles.map((role) => ({
      id: role.id,
      name: role.name,
      permissions:
        role.permissions?.map((permission) => permission.name).filter(Boolean) ??
        [],
    }));
  }

  return buildDefaultRoles(fallbackType);
};

const readProfileFromLocalStorage = (): UserProfile | null => {
  if (globalThis.window === undefined) {
    return null;
  }

  const raw = localStorage.getItem('user');
  if (!raw || raw === 'null') {
    return null;
  }

  try {
    const user = JSON.parse(raw) as {
      id?: string;
      name?: string;
      email?: string;
      accountType?: unknown;
      type?: unknown;
    };

    if (!user?.id) {
      return null;
    }

    const accountType = normalizeAccountType(
      user.accountType ?? user.type ?? 'user',
    );

    return {
      id: user.id,
      name: user.name || 'Usuario',
      email: user.email || 'usuario@ejemplo.com',
      accountType,
      roles: buildDefaultRoles(accountType),
    };
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const hasStoreForAccount = async (accountId: string): Promise<boolean> => {
  if (!accountId || accountId.trim().length === 0) {
    return false;
  }

  try {
    const response = await axiosHelper.account.getStore(accountId);
    const payload = response.data;

    if (payload === null || payload === undefined) {
      return false;
    }

    if (Array.isArray(payload) && payload.length > 0) {
      return true;
    }

    if (typeof payload === 'object') {
      const record = payload as Record<string, unknown>;

      if ('items' in record && Array.isArray((record as { items: unknown }).items)) {
        return ((record as { items: unknown[] }).items ?? []).length > 0;
      }

      if ('data' in record) {
        const data = record.data;
        if (Array.isArray(data)) {
          return data.length > 0;
        }
        if (data && typeof data === 'object') {
          return true;
        }
        if (typeof data === 'string' && data.trim().length > 0) {
          return true;
        }
      }

      const candidateKeys = ['id', 'storeId', 'store_id', 'accountId', 'account_id', 'userId', 'user_id'];
      if (candidateKeys.some((key) => typeof record[key] === 'string' && (record[key] as string).trim().length > 0)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    const axiosError = error as {
      response?: { status?: number };
    };

    if (axiosError?.response?.status === 404) {
      return false;
    }

    console.warn('No se pudo verificar tienda para account:', accountId, error);
    return false;
  }
};

export const useUserProfile = () => {
  const userProfile = useQuery({
    queryKey: USER_PROFILE_KEY,
    queryFn: async (): Promise<UserProfile | null> => {
      if (globalThis.window === undefined) {
        return null;
      }

      const fallbackProfile = readProfileFromLocalStorage();

      if (!localStorage.getItem('accessToken')) {
        return fallbackProfile;
      }

      try {
        const validateTokenResponse = await axiosHelper.auth.validateToken();
        const validatePayload = validateTokenResponse.data as {
          account_id?: string;
          user?: {
            id?: string;
            email?: string;
            name?: string;
            roles?: string[];
          };
          roles?: RemoteRole[];
        } | null;

        const accountId = validatePayload?.account_id;

        if (!accountId) {
          return fallbackProfile;
        }

        const accountResponse = await axiosHelper.account.getUserById(accountId);
        const accountPayload = (
          accountResponse.data as AccountApiResponse<UserEntity>
        ).data;

        const explicitAccountType = accountPayload?.accountType
          ? normalizeAccountType(accountPayload.accountType)
          : undefined;

        const storeExists = await hasStoreForAccount(accountId);

        const accountType = deriveAccountType({
          explicitType: explicitAccountType,
          additionalInfo: accountPayload?.additionalInfo,
          remoteRoles: validatePayload.roles,
          fallbackType: fallbackProfile?.accountType,
          storeExists,
        });

        const resolvedProfile: UserProfile = {
          id:
            accountPayload?.id ??
            fallbackProfile?.id ??
            accountId,
          name: accountPayload?.name ?? fallbackProfile?.name ?? 'Usuario',
          email:
            validatePayload?.user?.email ??
            fallbackProfile?.email ??
            'usuario@ejemplo.com',
          accountType,
          roles: mapRemoteRoles(validatePayload.roles, accountType),
        };

        try {
          localStorage.setItem(
            'user',
            JSON.stringify({
              id: resolvedProfile.id,
              name: resolvedProfile.name,
              email: resolvedProfile.email,
              accountType: resolvedProfile.accountType,
            }),
          );
        } catch (storageError) {
          console.warn(
            'No se pudo persistir el perfil actualizado en localStorage:',
            storageError,
          );
        }

        return resolvedProfile;
      } catch (error) {
        console.error('Error fetching user profile from services:', error);
        return fallbackProfile;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: globalThis.window !== undefined && !!localStorage.getItem('accessToken'),
    retry: false, // No reintentar si falla
  });

  return {
    userProfile: userProfile.data,
    isLoading: userProfile.isLoading,
    isError: userProfile.isError,
    error: userProfile.error,
  };
};
