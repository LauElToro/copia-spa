'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';
import type { ProductEntity } from '../types/product';
import type { ProductCardProps } from '../components/ui/molecules/product-card/product-card';
import {
  extractDiscount,
  getPrimaryImage,
  mapProductEntityToProduct,
  parseLegacyStoreMediaFromInfo,
  resolvePublicMediaUrl,
} from '../utils/product-mapper';
import { getAvatarUrl } from './use-user-avatar';

export interface StoreProfile {
  id: string;
  accountId?: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  logoUrl?: string;
  location?: string;
  phone?: string;
  email?: string;
  plan?: string;
  kycVerified: boolean;
  kybVerified: boolean;
  storeIdentificationCode?: string;
  rating?: number;
  totalReviews?: number;
}

export interface StoresPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  offset: number;
}

export const defaultStoresPagination: StoresPagination = {
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
  offset: 0,
};

export interface StoresListParams {
  search?: string;
  plan?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

const VERIFIED_KEYWORDS = ['approved', 'verified', 'completed', 'accepted', 'green', 'approvedchecked', 'passed'];

const isUuid = (value: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

const parsePossibleJson = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

const unwrapResponseData = (payload: unknown): unknown => {
  let current = parsePossibleJson(payload);
  const visited = new Set<unknown>();
  const candidateKeys: Array<keyof Record<string, unknown>> = ['data', 'payload', 'result'];

  while (
    current &&
    typeof current === 'object' &&
    !Array.isArray(current) &&
    !visited.has(current)
  ) {
    visited.add(current);
    const record = current as Record<string, unknown>;
    let nestedFound = false;

    for (const key of candidateKeys) {
      if (key in record && record[key] !== undefined) {
        const candidateRaw = parsePossibleJson(record[key]);
        if (candidateRaw === current) {
          continue;
        }
        if (Array.isArray(candidateRaw)) {
          return candidateRaw;
        }
        if (candidateRaw && typeof candidateRaw === 'object') {
          current = candidateRaw;
          nestedFound = true;
          break;
        }
      }
    }

    if (nestedFound) {
      continue;
    }

    if ('items' in record && Array.isArray(record.items)) {
      return record;
    }

    break;
  }

  return current;
};

const collectStringValues = (value: unknown, visited = new Set<unknown>()): string[] => {
  const stack: unknown[] = [value];
  const results: string[] = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (current === null || current === undefined) {
      continue;
    }
    if (typeof current === 'string') {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        results.push(trimmed);
      }
      continue;
    }
    if (typeof current === 'object') {
      if (visited.has(current)) {
        continue;
      }
      visited.add(current);
      if (Array.isArray(current)) {
        stack.push(...current);
      } else {
        stack.push(...Object.values(current as Record<string, unknown>));
      }
    }
  }

  return results;
};

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;

/** Prioriza rutas reales en S3 (commerces/products) y penaliza avatar genérico. */
const isNodataOrAvatarPath = (c: string): boolean => {
  const t = c.toLowerCase();
  return (
    t.includes('/images/icons/avatar.png') ||
    t.endsWith('avatar.png') ||
    t === 'nodata' ||
    t.endsWith('/nodata') ||
    t.includes('/commerces/nodata') ||
    t.includes('/products/nodata')
  );
};

const pickMediaCandidate = (candidates: string[]): string | undefined => {
  const cleaned = candidates
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && !isNodataOrAvatarPath(c));

  if (cleaned.length === 0) {
    return undefined;
  }

  const score = (s: string): number => {
    const lower = s.toLowerCase();
    let sc = 0;
    if (/^https?:\/\//i.test(s)) sc += 2;
    if (lower.includes('/commerces/')) sc += 6;
    if (lower.includes('/products/')) sc += 5;
    if (lower.includes('/stores/')) sc += 2;
    if (IMAGE_EXT.test(s)) sc += 3;
    if (lower.includes('avatar') || lower.includes('placeholder')) sc -= 10;
    return sc;
  };

  const sorted = [...cleaned].sort((a, b) => score(b) - score(a));
  const httpCandidate = sorted.find((candidate) => /^https?:\/\//i.test(candidate));
  if (httpCandidate) {
    return httpCandidate;
  }

  const dataCandidate = sorted.find((candidate) => candidate.startsWith('data:'));
  if (dataCandidate) {
    return dataCandidate;
  }

  return sorted[0];
};

const toSafeObject = (value: unknown): Record<string, unknown> | undefined => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

const normalizePhone = (phone: unknown): string | undefined => {
  if (!phone) {
    return undefined;
  }

  if (typeof phone === 'string') {
    return phone.trim().length > 0 ? phone.trim() : undefined;
  }

  const phoneObj = toSafeObject(phone);
  if (!phoneObj) {
    return undefined;
  }

  const parts = [
    typeof phoneObj.country_code === 'string' ? phoneObj.country_code : undefined,
    typeof phoneObj.countryCode === 'string' ? phoneObj.countryCode : undefined,
    typeof phoneObj.dialCode === 'string' ? phoneObj.dialCode : undefined,
    typeof phoneObj.area_code === 'string' ? phoneObj.area_code : undefined,
    typeof phoneObj.areaCode === 'string' ? phoneObj.areaCode : undefined,
    typeof phoneObj.number === 'string' ? phoneObj.number : undefined,
    typeof phoneObj.phoneNumber === 'string' ? phoneObj.phoneNumber : undefined,
    typeof phoneObj.value === 'string' ? phoneObj.value : undefined,
    typeof phoneObj.phone === 'string' ? phoneObj.phone : undefined,
    typeof phoneObj.full === 'string' ? phoneObj.full : undefined,
  ].filter((segment): segment is string => Boolean(segment));

  const uniqueParts = Array.from(new Set(parts));
  return uniqueParts.length > 0 ? uniqueParts.join(' ') : undefined;
};

const buildLocation = (location: unknown): string | undefined => {
  const locationObj = toSafeObject(location);
  if (!locationObj) {
    return undefined;
  }

  const parts = [
    typeof locationObj.address === 'string' ? locationObj.address : undefined,
    typeof locationObj.city === 'string' ? locationObj.city : undefined,
    typeof locationObj.state === 'string' ? locationObj.state : undefined,
    typeof locationObj.country === 'string' ? locationObj.country : undefined,
    typeof locationObj.province === 'string' ? locationObj.province : undefined,
    typeof locationObj.region === 'string' ? locationObj.region : undefined,
    typeof locationObj.postal_code === 'string' ? locationObj.postal_code : undefined,
    typeof locationObj.postalCode === 'string' ? locationObj.postalCode : undefined,
  ].filter((segment): segment is string => Boolean(segment));

  return parts.length > 0 ? parts.join(', ') : undefined;
};

const resolveVerificationStatus = (input: unknown): boolean => {
  if (typeof input === 'string') {
    const normalized = input.toLowerCase();
    return VERIFIED_KEYWORDS.some((keyword) => normalized.includes(keyword));
  }

  if (typeof input === 'boolean') {
    return input;
  }

  const data = toSafeObject(input);
  if (!data) {
    return false;
  }

  const statusCandidates: Array<unknown> = [
    data.status,
    data.reviewStatus,
    data.state,
    data.result,
    data.reviewResult && toSafeObject(data.reviewResult)?.reviewAnswer,
  ].filter(Boolean);

  return statusCandidates.some((candidate) => {
    if (typeof candidate !== 'string') {
      return false;
    }
    const normalized = candidate.toLowerCase();
    return VERIFIED_KEYWORDS.some((keyword) => normalized.includes(keyword));
  });
};

const resolveMediaUrl = (media: unknown, key: 'logo' | 'banner'): string | undefined => {
  const mediaObj = toSafeObject(media);
  if (!mediaObj) {
    return undefined;
  }

  const nested = getAvatarUrl(mediaObj[key]);
  if (nested) {
    return nested;
  }

  const directCandidates = collectStringValues(mediaObj[key]);
  const aliasCandidates = [
    collectStringValues(mediaObj[`${key}Url`]),
    collectStringValues(mediaObj[`${key}URL`]),
    collectStringValues(mediaObj[`${key}_url`]),
  ];

  const candidates = [
    ...directCandidates,
    ...aliasCandidates.flat(),
  ];

  const urlCandidate = candidates.find((candidate) => /^https?:\/\//i.test(candidate));
  return urlCandidate ?? candidates[0];
};

export const normalizeStore = (payload: unknown, fallbackId: string): StoreProfile | null => {
  if (!payload) {
    return null;
  }

  const unwrapped = unwrapResponseData(payload);
  const storeData =
    toSafeObject(unwrapped) ??
    (Array.isArray(unwrapped) ? undefined : toSafeObject(payload));

  if (!storeData) {
    return null;
  }

  const idCandidate = typeof storeData.id === 'string' ? storeData.id : fallbackId;
  const accountIdCandidate =
    typeof storeData.account_id === 'string'
      ? storeData.account_id
      : typeof storeData.accountId === 'string'
        ? storeData.accountId
        : typeof storeData.user_id === 'string'
          ? storeData.user_id
          : undefined;

  const information = toSafeObject(storeData.information ?? storeData.store_information);
  const holderInformation = toSafeObject(storeData.holder_information ?? storeData.holderInformation);
  const media = toSafeObject(storeData.media);
  const legacyMediaFromInfo = parseLegacyStoreMediaFromInfo(storeData.information ?? storeData.store_information);
  const legacyMediaFromHolder = parseLegacyStoreMediaFromInfo(storeData.holder_information ?? storeData.holderInformation);

  const descriptionCandidates: Array<string | undefined> = [
    typeof information?.description === 'string' ? information.description : undefined,
    typeof storeData.description === 'string' ? storeData.description : undefined,
    typeof storeData.information === 'string' ? storeData.information : undefined,
    typeof storeData.storeDescription === 'string' ? storeData.storeDescription : undefined,
  ];

  const description = descriptionCandidates.find((value) => value && value.trim().length > 0)?.trim();

  const bannerCandidates = [
    getAvatarUrl(information?.banner),
    typeof information?.banner === 'string' ? information.banner : undefined,
    getAvatarUrl(holderInformation?.banner),
    typeof holderInformation?.banner === 'string' ? holderInformation.banner : undefined,
    resolveMediaUrl(media, 'banner'),
    ...collectStringValues(media?.banner),
    ...collectStringValues(storeData.banner),
    ...collectStringValues(storeData.bannerUrl),
    ...collectStringValues(storeData.banner_url),
    ...collectStringValues(storeData.coverUrl),
    ...collectStringValues(storeData.cover_url),
    ...collectStringValues(storeData.coverImage),
    ...collectStringValues(storeData.cover_image),
    legacyMediaFromInfo.banner,
    legacyMediaFromHolder.banner,
  ].filter((value): value is string => Boolean(value));

  const logoCandidates = [
    getAvatarUrl(information?.logo),
    typeof information?.logo === 'string' ? information.logo : undefined,
    getAvatarUrl(holderInformation?.logo),
    typeof holderInformation?.logo === 'string' ? holderInformation.logo : undefined,
    getAvatarUrl(storeData.avatar),
    typeof storeData.avatar === 'string' ? storeData.avatar : undefined,
    resolveMediaUrl(media, 'logo'),
    ...collectStringValues(media?.logo),
    ...collectStringValues(storeData.logo),
    ...collectStringValues(storeData.logoUrl),
    ...collectStringValues(storeData.logo_url),
    ...collectStringValues(storeData.picture),
    ...collectStringValues(storeData.store_picture),
    ...collectStringValues(storeData.imageUrl),
    ...collectStringValues(storeData.image_url),
    legacyMediaFromInfo.logo,
    legacyMediaFromHolder.logo,
  ].filter((value): value is string => Boolean(value));

  const location =
    buildLocation(information?.location ?? storeData.location) ??
    buildLocation({
      address: typeof storeData.address === 'string' ? storeData.address : undefined,
      city: typeof storeData.city === 'string' ? storeData.city : undefined,
      state: typeof storeData.state === 'string' ? storeData.state : undefined,
      province: typeof storeData.province === 'string' ? storeData.province : undefined,
      country: typeof storeData.country === 'string' ? storeData.country : undefined,
      postal_code: typeof storeData.postal_code === 'string' ? storeData.postal_code : undefined,
      postalCode: typeof storeData.postalCode === 'string' ? storeData.postalCode : undefined,
    });

  const phone =
    normalizePhone(information?.phone) ??
    normalizePhone(holderInformation?.phone) ??
    normalizePhone(storeData.phone ?? storeData.businessPhone);

  const plan =
    typeof storeData.plan === 'string'
      ? storeData.plan
      : typeof storeData.plan_name === 'string'
        ? storeData.plan_name
        : typeof storeData.planType === 'string'
          ? storeData.planType
          : undefined;

  const email =
    typeof storeData.email === 'string'
      ? storeData.email
      : typeof storeData.businessEmail === 'string'
        ? storeData.businessEmail
        : undefined;

  const rating =
    typeof storeData.rating === 'number'
      ? storeData.rating
      : typeof storeData.avg_rating === 'number'
        ? storeData.avg_rating
        : typeof storeData.averageRating === 'number'
          ? storeData.averageRating
          : undefined;

  const totalReviews =
    typeof storeData.totalReviews === 'number'
      ? storeData.totalReviews
      : typeof storeData.total_reviews === 'number'
        ? storeData.total_reviews
        : typeof storeData.reviewsCount === 'number'
          ? storeData.reviewsCount
          : undefined;

  return {
    id: idCandidate,
    accountId: accountIdCandidate ?? (isUuid(fallbackId) ? fallbackId : undefined),
    name: typeof storeData.name === 'string' ? storeData.name : 'Tienda',
    description: description?.trim() || undefined,
    bannerUrl: resolvePublicMediaUrl(pickMediaCandidate(bannerCandidates), 'commerces'),
    logoUrl: resolvePublicMediaUrl(pickMediaCandidate(logoCandidates), 'commerces'),
    location,
    phone,
    email,
    plan,
    kycVerified: resolveVerificationStatus(storeData.kyc),
    kybVerified: resolveVerificationStatus(storeData.kyb),
    storeIdentificationCode:
      typeof storeData.store_identification_code === 'string'
        ? storeData.store_identification_code
        : typeof storeData.storeIdentificationCode === 'string'
          ? storeData.storeIdentificationCode
          : undefined,
    rating,
    totalReviews,
  };
};

const extractStoresFromPayload = (payload: unknown): unknown[] => {
  const unwrapped = unwrapResponseData(payload);
  if (Array.isArray(unwrapped)) {
    return unwrapped;
  }

  const record = toSafeObject(unwrapped);
  if (!record) {
    return [];
  }

  if (Array.isArray(record.items)) {
    return record.items;
  }

  if (Array.isArray(record.data)) {
    return record.data;
  }

  if ('items' in record) {
    const nested = unwrapResponseData(record.items);
    if (Array.isArray(nested)) {
      return nested;
    }
  }

  return [];
};

const extractStoresPagination = (payload: unknown): StoresPagination => {
  const unwrapped = unwrapResponseData(payload);
  const record = toSafeObject(unwrapped);
  if (!record) {
    return defaultStoresPagination;
  }

  const paginationRecord =
    toSafeObject(record.pagination) ??
    toSafeObject((record.data as Record<string, unknown> | undefined)?.pagination) ??
    toSafeObject((record.meta as Record<string, unknown> | undefined)?.pagination);

  if (!paginationRecord) {
    return defaultStoresPagination;
  }

  const readNumber = (value: unknown, fallback: number): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return fallback;
  };

  const readBoolean = (value: unknown): boolean => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') {
        return true;
      }
      if (normalized === 'false') {
        return false;
      }
    }
    return false;
  };

  const total = Math.max(0, readNumber(paginationRecord.total, defaultStoresPagination.total));
  const page = Math.max(1, readNumber(paginationRecord.page, defaultStoresPagination.page));
  const limit = Math.max(1, readNumber(paginationRecord.limit, defaultStoresPagination.limit));
  const totalPages = Math.max(
    1,
    readNumber(paginationRecord.totalPages, Math.max(1, Math.ceil(Math.max(total, 1) / limit))),
  );
  const offset = Math.max(0, readNumber(paginationRecord.offset, (page - 1) * limit));

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: readBoolean(paginationRecord.hasNextPage) || page < totalPages,
    hasPrevPage: readBoolean(paginationRecord.hasPrevPage) || page > 1,
    offset,
  };
};

const extractProductsFromPayload = (payload: unknown): ProductEntity[] => {
  const unwrapped = unwrapResponseData(payload);
  if (Array.isArray(unwrapped)) {
    return unwrapped as ProductEntity[];
  }

  const record = toSafeObject(unwrapped);
  if (!record) {
    return [];
  }

  if (Array.isArray(record.items)) {
    return record.items as ProductEntity[];
  }

  if (Array.isArray(record.data)) {
    return record.data as ProductEntity[];
  }

  if ('items' in record) {
    const nested = unwrapResponseData(record.items);
    if (Array.isArray(nested)) {
      return nested as ProductEntity[];
    }
  }

  if ('products' in record) {
    const nested = unwrapResponseData(record.products);
    if (Array.isArray(nested)) {
      return nested as ProductEntity[];
    }
  }

  return [];
};

const normalizeProducts = (productsPayload: unknown): ProductCardProps[] => {
  const products = extractProductsFromPayload(productsPayload);
  if (products.length === 0) {
    return [];
  }

  return products.map((product) => {
    const mapped = mapProductEntityToProduct(product as ProductEntity);
    const extractedDiscount = extractDiscount((product as ProductEntity).promotion);
    const rawDiscount = typeof extractedDiscount === 'number' ? extractedDiscount : undefined;

    const hasDiscount =
      typeof rawDiscount === 'number' && Number.isFinite(rawDiscount) && rawDiscount > 0;

    // Extraer precio base (puede venir como número o como objeto)
    let basePrice: number | undefined;
    if (typeof mapped?.price === 'number' && Number.isFinite(mapped.price)) {
      basePrice = mapped.price;
    } else if (typeof mapped?.price === 'object' && mapped.price !== null) {
      // Si es objeto, usar originalUsd si existe (precio sin descuento), sino usd (precio con descuento)
      const priceObj = mapped.price as { originalUsd?: number; usd?: number };
      basePrice = priceObj.originalUsd ?? priceObj.usd;
    } else if (typeof (product as ProductEntity).price === 'number') {
      basePrice = (product as ProductEntity).price;
    } else {
      basePrice = Number((product as ProductEntity).price);
    }

    const safeBasePrice =
      typeof basePrice === 'number' && Number.isFinite(basePrice) && basePrice > 0
        ? basePrice
        : undefined;

    // Si el precio ya viene con descuento aplicado (desde mapProductEntityToProduct), usarlo directamente
    // Si no, calcular el descuento
    let finalPrice: number | undefined;
    if (typeof mapped?.price === 'object' && mapped.price !== null) {
      const priceObj = mapped.price as { usd?: number };
      finalPrice = priceObj.usd ?? safeBasePrice;
    } else {
      finalPrice = hasDiscount && safeBasePrice
        ? Number((safeBasePrice * (1 - rawDiscount! / 100)).toFixed(2))
        : safeBasePrice;
    }

    // Extraer precio ARS (puede venir del objeto o del campo directo)
    let pesosPriceRaw: number | undefined;
    if (typeof mapped?.price === 'object' && mapped.price !== null) {
      const priceObj = mapped.price as { ars?: number };
      pesosPriceRaw = priceObj.ars;
    } else if (typeof mapped?.price_ars === 'number' && Number.isFinite(mapped.price_ars)) {
      pesosPriceRaw = mapped.price_ars;
    } else if (typeof (product as ProductEntity).price_ars === 'number') {
      pesosPriceRaw = (product as ProductEntity).price_ars;
    } else if ((product as ProductEntity).price_ars) {
      pesosPriceRaw = Number((product as ProductEntity).price_ars);
    }

    const pesosPrice =
      typeof pesosPriceRaw === 'number' && Number.isFinite(pesosPriceRaw) && pesosPriceRaw > 0
        ? pesosPriceRaw
        : undefined;

    // Extraer promociones desde meta.promotions
    const meta = (product as ProductEntity).meta as { promotions?: {
      promoReturn?: string;
      promoShipping?: string;
      promoBanks?: string;
    } } | undefined;
    const promotions = meta?.promotions || {};

    return {
      id: mapped?.id ?? (product as ProductEntity).id,
      image: getPrimaryImage(product as ProductEntity),
      title: mapped?.name ?? (product as ProductEntity).name,
      price: finalPrice ?? safeBasePrice ?? 0,
      originalPrice: hasDiscount && safeBasePrice ? safeBasePrice : undefined,
      discount: hasDiscount ? Math.round(rawDiscount!) : undefined,
      currency: mapped?.crypto ?? (product as ProductEntity).crypto ?? 'USD',
      pesosPrice,
      // Promociones para vectores de venta
      hasSecurePurchase: promotions.promoReturn === "yes",
      hasFreeShipping: false, // Se puede agregar si viene de otro lugar
      hasInterestFreeInstallments: promotions.promoBanks === "yes",
      shippingTime: promotions.promoShipping === "24hs" || promotions.promoShipping === "48hs" 
        ? promotions.promoShipping 
        : undefined,
    };
  });
};

export const useStoreProfile = (storeId: string) => {
  const storeQuery = useQuery({
    queryKey: ['store-profile', storeId],
    queryFn: async () => {
      const response = await axiosHelper.stores.getPublic(storeId);
      return response.data;
    },
    enabled: Boolean(storeId),
    staleTime: 60_000,
  });

  const store = useMemo(() => normalizeStore(storeQuery.data, storeId), [storeQuery.data, storeId]);

  const productsQuery = useQuery({
    queryKey: ['store-products', storeId],
    queryFn: async () => {
      const response = await axiosHelper.products.getAll({
        storeId,
        limit: 10000,
        page: 1,
      });
      return response.data;
    },
    enabled: Boolean(storeId),
    staleTime: 60_000,
  });

  const products = useMemo(
    () => normalizeProducts(productsQuery.data),
    [productsQuery.data],
  );

  const isLoading = storeQuery.isLoading || productsQuery.isLoading;
  const isFetching = storeQuery.isFetching || productsQuery.isFetching;
  const isError = storeQuery.isError || productsQuery.isError;
  const error = storeQuery.error ?? productsQuery.error ?? null;

  const refetch = async () => {
    const results = await Promise.all([storeQuery.refetch(), productsQuery.refetch()]);
    return results;
  };

  return {
    store,
    products,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    hasValidIdentifier: isUuid(storeId),
  };
};

export const useStoresList = (params: StoresListParams = {}) => {
  const sanitizedParams = useMemo(() => {
    const query: Record<string, unknown> = {};
    if (typeof params.isActive === 'boolean') {
      query.isActive = params.isActive;
    }
    if (params.plan) {
      query.plan = params.plan;
    }
    if (params.page && params.page > 0) {
      query.page = params.page;
    }
    if (params.limit && params.limit > 0) {
      query.limit = params.limit;
    }
    const trimmedSearch = params.search?.trim();
    if (trimmedSearch) {
      query.search = trimmedSearch;
    }
    return query;
  }, [params.isActive, params.plan, params.page, params.limit, params.search]);

  const listQuery = useQuery({
    queryKey: ['stores-list', sanitizedParams],
    queryFn: async () => {
      const response = await axiosHelper.stores.list(sanitizedParams);
      return response.data;
    },
    staleTime: 30_000,
  });

  const stores = useMemo(() => {
    const rawItems = extractStoresFromPayload(listQuery.data);
    return rawItems
      .map((item) => normalizeStore(item, (toSafeObject(item)?.id as string | undefined) ?? ''))
      .filter((store): store is StoreProfile => Boolean(store && store.id));
  }, [listQuery.data]);

  const pagination = useMemo(
    () => extractStoresPagination(listQuery.data),
    [listQuery.data],
  );

  return {
    stores,
    pagination,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,
    error: listQuery.error,
    refetch: listQuery.refetch,
  };
};


