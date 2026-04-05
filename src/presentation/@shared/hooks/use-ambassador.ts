import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { axiosHelper } from '../helpers/axios-helper';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta: { timestamp: string; version: string };
};

export interface AmbassadorProfile {
  code: string;
  shareLink: string;
  totals: {
    month: { initialUSD: number; residualUSD: number; bonusesUSD: number };
    lifetime: { earningsUSD: number };
  };
}

export interface ReferralItem {
  id: string;
  email: string;
  name: string;
  plan: string;
  status: 'pending' | 'active' | 'cancelled';
  firstPaymentAt?: string;
  planValue?: number;
}

export interface ReferralPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  offset: number;
}

export interface ReferralListResponse {
  items: ReferralItem[];
  pagination: ReferralPagination;
}

export interface EarningsSummary {
  month: string;
  initialUSD: number;
  residualUSD: number;
  bonusesUSD: number;
  lifetimeUSD: number;
}

export interface PayoutItem {
  id: string;
  cycle: string;
  amountUSD: number;
  status: 'pending' | 'paid';
  paidAt?: string;
}

export interface WalletSummary {
  cbu?: string | null;
  alias?: string | null;
  bankName?: string | null;
  accountHolderName?: string | null;
  isVerified: boolean;
  verificationDate?: string | null;
}

type NormalizedReferralParams = {
  page: number;
  pageSize: number;
  search?: string;
};

type EarningsParams = {
  month?: number;
  year?: number;
};

const AMBASSADOR_SCOPE = 'ambassador' as const;

const DEFAULT_EARNINGS: EarningsSummary = {
  month: '',
  initialUSD: 0,
  residualUSD: 0,
  bonusesUSD: 0,
  lifetimeUSD: 0,
};

const createEmptyReferrals = (
  page: number,
  pageSize: number
): ReferralListResponse => ({
  items: [],
  pagination: {
    total: 0,
    page,
    limit: pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: page > 1,
    offset: (page - 1) * pageSize,
  },
});

const normalizeReferralResponse = (
  data: ReferralListResponse | undefined,
  params: NormalizedReferralParams
): ReferralListResponse => {
  if (!data) {
    return createEmptyReferrals(params.page, params.pageSize);
  }

  const pagination = data.pagination ?? {
    total: data.items?.length ?? 0,
    page: params.page,
    limit: params.pageSize,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: params.page > 1,
    offset: (params.page - 1) * params.pageSize,
  };

  const page = pagination.page ?? params.page;
  const limit = pagination.limit ?? params.pageSize;
  const total = pagination.total ?? data.items?.length ?? 0;
  const totalPages = Math.max(
    1,
    (pagination.totalPages ?? (Math.ceil(total / limit) || 1))
  );

  return {
    items: (data.items ?? []).map((item) => ({
      id: item.id,
      email: item.email ?? '',
      name: item.name ?? '',
      plan: item.plan,
      status: item.status,
      firstPaymentAt: item.firstPaymentAt ?? undefined,
      planValue: item.planValue ?? undefined,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage:
        pagination.hasNextPage ??
        page * limit < total,
      hasPrevPage: pagination.hasPrevPage ?? page > 1,
      offset: pagination.offset ?? (page - 1) * limit,
    },
  };
};

const normalizeEarnings = (
  data: EarningsSummary | undefined
): EarningsSummary => ({
  month: data?.month ?? DEFAULT_EARNINGS.month,
  initialUSD: data?.initialUSD ?? DEFAULT_EARNINGS.initialUSD,
  residualUSD: data?.residualUSD ?? DEFAULT_EARNINGS.residualUSD,
  bonusesUSD: data?.bonusesUSD ?? DEFAULT_EARNINGS.bonusesUSD,
  lifetimeUSD: data?.lifetimeUSD ?? DEFAULT_EARNINGS.lifetimeUSD,
});

const normalizePayouts = (items: PayoutItem[] | undefined): PayoutItem[] =>
  (items ?? []).map((item) => ({
    id: item.id,
    cycle: item.cycle,
    amountUSD: item.amountUSD ?? 0,
    status: item.status,
    paidAt: item.paidAt ?? undefined,
  }));

const normalizeWallet = (
  data: Record<string, unknown> | null | undefined
): WalletSummary | null => {
  if (!data) {
    return null;
  }

  return {
    cbu: (data.cbu as string | null | undefined) ?? null,
    alias: (data.alias as string | null | undefined) ?? null,
    bankName: (data.bankName as string | null | undefined) ?? null,
    accountHolderName:
      (data.accountHolderName as string | null | undefined) ?? null,
    isVerified: Boolean(data.isVerified),
    verificationDate:
      (data.verificationDate as string | null | undefined) ?? null,
  };
};

const isNotFoundError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

const isUnauthorizedError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 401;

const shouldRetry = (error: unknown): boolean => !isNotFoundError(error) && !isUnauthorizedError(error);

const handleNotFound = <T>(error: unknown, fallback: T): T => {
  if (isNotFoundError(error)) {
    return fallback;
  }
  throw error;
};

export const AMBASSADOR_KEYS = {
  all: [AMBASSADOR_SCOPE] as const,
  profile: [AMBASSADOR_SCOPE, 'profile'] as const,
  referralsBase: [AMBASSADOR_SCOPE, 'referrals'] as const,
  referrals: (params: NormalizedReferralParams) =>
    [
      AMBASSADOR_SCOPE,
      'referrals',
      params.page,
      params.pageSize,
      params.search ?? '',
    ] as const,
  earningsBase: [AMBASSADOR_SCOPE, 'earnings'] as const,
  earnings: (params?: EarningsParams) =>
    [
      AMBASSADOR_SCOPE,
      'earnings',
      params?.month ?? null,
      params?.year ?? null,
    ] as const,
  payouts: [AMBASSADOR_SCOPE, 'payouts'] as const,
  wallet: [AMBASSADOR_SCOPE, 'wallet'] as const,
};

export interface UseAmbassadorOptions {
  referrals?: {
    page?: number;
    pageSize?: number;
    search?: string;
  };
  earnings?: EarningsParams;
}

export const useAmbassador = (
  options: UseAmbassadorOptions = {}
) => {
  const queryClient = useQueryClient();

  const referralsParams: NormalizedReferralParams = {
    page: Math.max(1, options.referrals?.page ?? 1),
    pageSize: Math.max(1, options.referrals?.pageSize ?? 10),
    search: options.referrals?.search?.trim()
      ? options.referrals.search.trim()
      : undefined,
  };

  const earningsParams: EarningsParams = {
    month:
      typeof options.earnings?.month === 'number'
        ? options.earnings.month
        : undefined,
    year:
      typeof options.earnings?.year === 'number'
        ? options.earnings.year
        : undefined,
  };

  const activateMutation = useMutation({
    mutationFn: async (acceptTerms: boolean): Promise<AmbassadorProfile> => {
      const response = await axiosHelper.ambassadors.activate({ acceptTerms });
      const api = response.data as ApiResponse<AmbassadorProfile>;
      return api.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AMBASSADOR_KEYS.profile });
      queryClient.invalidateQueries({ queryKey: AMBASSADOR_KEYS.referralsBase });
      queryClient.invalidateQueries({ queryKey: AMBASSADOR_KEYS.earningsBase });
      queryClient.invalidateQueries({ queryKey: AMBASSADOR_KEYS.payouts });
      queryClient.invalidateQueries({ queryKey: AMBASSADOR_KEYS.wallet });
    },
  });

  const profileQuery = useQuery<AmbassadorProfile | null>({
    queryKey: AMBASSADOR_KEYS.profile,
    queryFn: async (): Promise<AmbassadorProfile | null> => {
      try {
        const response = await axiosHelper.ambassadors.me();
        // Si la respuesta es 404, el usuario no es embajador (esto es esperado, no es un error)
        if (response.status === 404) {
          return null;
        }
        const api = response.data as ApiResponse<AmbassadorProfile>;
        return api.data;
      } catch (error) {
        // Manejar 404 silenciosamente (usuario no es embajador)
        if (isNotFoundError(error)) {
          return null;
        }
        // Manejar 401 (no autenticado) - redirigir al login
        if (isUnauthorizedError(error)) {
          if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/login';
          }
          return null;
        }
        // Para otros errores, lanzar para que React Query los maneje
        throw error;
      }
    },
    retry: (failureCount, error) => shouldRetry(error) && failureCount < 1,
    staleTime: 60_000,
    // No mostrar error en consola para 404 o 401
    throwOnError: (error) => !isNotFoundError(error) && !isUnauthorizedError(error),
  });

  const referralsQuery = useQuery<ReferralListResponse>({
    queryKey: AMBASSADOR_KEYS.referrals(referralsParams),
    queryFn: async (): Promise<ReferralListResponse> => {
      try {
        const payload: Record<string, unknown> = {
          page: referralsParams.page,
          pageSize: referralsParams.pageSize,
        };
        if (referralsParams.search) {
          payload.search = referralsParams.search;
        }

        const response = await axiosHelper.ambassadors.referrals({
          ...payload,
        });
        const api = response.data as ApiResponse<ReferralListResponse>;
        return normalizeReferralResponse(api.data, referralsParams);
      } catch (error) {
        // Manejar 401 (no autenticado) - redirigir al login
        if (isUnauthorizedError(error)) {
          if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/login';
          }
          return createEmptyReferrals(referralsParams.page, referralsParams.pageSize);
        }
        return handleNotFound(
          error,
          createEmptyReferrals(referralsParams.page, referralsParams.pageSize)
        );
      }
    },
    enabled: !!profileQuery.data, // Solo fetch si el usuario es embajador
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => shouldRetry(error) && failureCount < 1,
    staleTime: 30_000,
  });

  const earningsQuery = useQuery<EarningsSummary>({
    queryKey: AMBASSADOR_KEYS.earnings(earningsParams),
    queryFn: async (): Promise<EarningsSummary> => {
      try {
        const payload: Record<string, number> = {};
        if (typeof earningsParams.month === 'number') {
          payload.month = earningsParams.month;
        }
        if (typeof earningsParams.year === 'number') {
          payload.year = earningsParams.year;
        }

        const response = await axiosHelper.ambassadors.earnings({
          ...payload,
        });
        const api = response.data as ApiResponse<EarningsSummary>;
        return normalizeEarnings(api.data);
      } catch (error) {
        // Manejar 401 (no autenticado) - redirigir al login
        if (isUnauthorizedError(error)) {
          if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/login';
          }
          return DEFAULT_EARNINGS;
        }
        return handleNotFound(error, DEFAULT_EARNINGS);
      }
    },
    enabled: !!profileQuery.data, // Solo fetch si el usuario es embajador
    retry: (failureCount, error) => shouldRetry(error) && failureCount < 1,
    staleTime: 30_000,
  });

  const payoutsQuery = useQuery<PayoutItem[]>({
    queryKey: AMBASSADOR_KEYS.payouts,
    queryFn: async (): Promise<PayoutItem[]> => {
      try {
        const response = await axiosHelper.ambassadors.payouts();
        const api = response.data as ApiResponse<PayoutItem[]>;
        return normalizePayouts(api.data);
      } catch (error) {
        // Manejar 401 (no autenticado) - redirigir al login
        if (isUnauthorizedError(error)) {
          if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/login';
          }
          return [];
        }
        return handleNotFound<PayoutItem[]>(error, []);
      }
    },
    enabled: !!profileQuery.data, // Solo fetch si el usuario es embajador
    retry: (failureCount, error) => shouldRetry(error) && failureCount < 1,
    staleTime: 30_000,
  });

  const walletQuery = useQuery<WalletSummary | null>({
    queryKey: AMBASSADOR_KEYS.wallet,
    queryFn: async (): Promise<WalletSummary | null> => {
      try {
        const response = await axiosHelper.ambassadors.getWallet();
        const api = response.data as ApiResponse<Record<string, unknown>>;
        return normalizeWallet(api.data);
      } catch (error) {
        // Manejar 401 (no autenticado) - redirigir al login
        if (isUnauthorizedError(error)) {
          if (globalThis.window !== undefined) {
            globalThis.window.location.href = '/login';
          }
          return null;
        }
        return handleNotFound<WalletSummary | null>(error, null);
      }
    },
    enabled: !!profileQuery.data, // Solo fetch si el usuario es embajador
    retry: (failureCount, error) => shouldRetry(error) && failureCount < 1,
    staleTime: 60_000,
  });

  const upsertWalletMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await axiosHelper.ambassadors.upsertWallet(data);
      return response.data as ApiResponse<Record<string, unknown>>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AMBASSADOR_KEYS.wallet });
    },
  });

  return {
    activate: activateMutation,
    upsertWallet: upsertWalletMutation,
    profile: profileQuery,
    referrals: referralsQuery,
    earnings: earningsQuery,
    payouts: payoutsQuery,
    wallet: walletQuery,
  };
};
