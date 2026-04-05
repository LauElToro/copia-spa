import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { AxiosError } from 'axios';
import { axiosHelper } from '../helpers/axios-helper';
import {
  CategoryEntity,
  ProductEntity,
  ProductEngagementStats,
  ProductMeta,
  PhotoEntity,
  ProductPricing,
} from '../types/product';
import {
  extractPhotoImageUrl,
  extractProductImageFromMeta,
  isStorageAvatarPath,
  mapProductEntityToProduct,
} from '../utils/product-mapper';

// Tipo para crear productos (basado en CreateProductEntity del ms-products)
export interface CreateProductRequest {
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
  account_id?: string; // legacy
  accountId?: string; // preferido por body
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

// Query key constants
const CATEGORIES_KEY = ['categories'];
const PRODUCTS_KEY = ['products'];
const CATEGORY_PRODUCTS_KEY = (id: string) => ['category-products', id];
const PRODUCT_KEY = (id: string) => ['product', id];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const normalizeString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback;

const normalizeOptionalString = (value: unknown): string | undefined => {
  const normalized = normalizeString(value);
  return normalized.length > 0 ? normalized : undefined;
};

const normalizePricing = (raw: unknown): ProductPricing | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }

  // Migración / ms-products: { amount, currency, crypto } sin array `values`
  const flatAmount = toNumber(raw.amount);
  if (flatAmount !== undefined && Number.isFinite(flatAmount)) {
    const currencyRaw = normalizeString(
      typeof raw.currency === 'string' ? raw.currency : 'USD',
      'USD',
    ).toUpperCase();
    const cryptoRef = normalizeString(
      typeof raw.crypto === 'string' ? raw.crypto : '',
      '',
    ).toUpperCase();
    // Legacy: a veces `currency` decía ARS pero el precio era en USDT; el campo `crypto` / referenceBase es la fuente de verdad.
    const KNOWN = new Set(['USDT', 'USD', 'USDC', 'ARS', 'EUR']);
    let canonicalCurrency = currencyRaw;
    if (cryptoRef === 'USDT' || cryptoRef === 'USDC') {
      canonicalCurrency = cryptoRef;
    } else if (cryptoRef === 'USD') {
      canonicalCurrency = 'USDT';
    } else if (cryptoRef === 'ARS') {
      canonicalCurrency = 'ARS';
    } else if (!KNOWN.has(currencyRaw)) {
      canonicalCurrency = 'USDT';
    }
    const usdPerUnit = toNumber(raw.usdPerUnit) ?? 1;
    const referenceBase = normalizeString(
      typeof raw.crypto === 'string' ? raw.crypto : canonicalCurrency,
      canonicalCurrency,
    ).toUpperCase();
    return {
      values: [
        {
          amount: flatAmount,
          currency: canonicalCurrency,
          usdPerUnit,
          note: null,
        },
      ],
      referenceAt: normalizeString(
        typeof raw.referenceAt === 'string' ? raw.referenceAt : '',
        new Date().toISOString(),
      ),
      referenceBase: referenceBase === 'USD' ? 'USDT' : referenceBase,
    };
  }

  const rawValues = Array.isArray(raw.values) ? raw.values : [];
  const values = rawValues
    .map((entry) => {
      if (!isRecord(entry)) {
        return undefined;
      }
      const amount = toNumber(entry.amount);
      const usdPerUnit = toNumber(entry.usdPerUnit);
      const currency = normalizeString(entry.currency).toUpperCase();

      if (amount === undefined || usdPerUnit === undefined || currency.length === 0) {
        return undefined;
      }

      return {
        amount,
        currency,
        usdPerUnit,
        note: typeof entry.note === 'string' ? entry.note : null,
      } satisfies ProductPricing['values'][number];
    })
    .filter((value): value is NonNullable<typeof value> => value !== undefined);

  if (values.length === 0) {
    return undefined;
  }

  return {
    values,
    referenceAt: normalizeString(raw.referenceAt, new Date().toISOString()),
    referenceBase: normalizeString(raw.referenceBase, 'USD').toUpperCase(),
  };
};

const findPricingAmount = (pricing: ProductPricing | undefined, currency: string): number | undefined => {
  if (!pricing) {
    return undefined;
  }
  const upperCurrency = currency.toUpperCase();
  return pricing.values.find((value) => value.currency.toUpperCase() === upperCurrency)?.amount;
};

const parsePhotosArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizePhotos = (value: unknown): PhotoEntity[] => {
  const rawPhotos = parsePhotosArray(value);
  return rawPhotos
    .map((photo, index) => {
      if (!isRecord(photo)) {
        return undefined;
      }

      const idSource = photo.id ?? photo.imageUrl ?? photo.image_url ?? `photo-${index}`;
      const id = normalizeString(idSource, `photo-${index}`);

      // Legacy: strings sueltos, objetos media (original/variants) y paths S3; ignorar avatar genérico.
      const extracted = extractPhotoImageUrl(photo);
      const imageUrlValue =
        extracted && !isStorageAvatarPath(extracted)
          ? extracted
          : undefined;

      return {
        id,
        image_url: imageUrlValue,
        imageUrl: imageUrlValue,
        imageUrlLg: typeof photo.imageUrlLg === 'string' ? photo.imageUrlLg : null,
        imageUrlMd: typeof photo.imageUrlMd === 'string' ? photo.imageUrlMd : null,
        imageUrlSm: typeof photo.imageUrlSm === 'string' ? photo.imageUrlSm : null,
        original_name: typeof photo.originalName === 'string' ? photo.originalName :
          (typeof photo.original_name === 'string' ? photo.original_name : undefined),
        originalName: typeof photo.originalName === 'string' ? photo.originalName : undefined,
        file_size: toNumber(photo.file_size),
        fileSize: toNumber(photo.fileSize),
        content_type: typeof photo.content_type === 'string' ? photo.content_type : undefined,
        contentType: typeof photo.contentType === 'string' ? photo.contentType : undefined,
        product_id: typeof photo.product_id === 'string' ? photo.product_id : undefined,
        productId: typeof photo.productId === 'string' ? photo.productId : undefined,
      } satisfies PhotoEntity;
    })
    .filter((photo): photo is NonNullable<typeof photo> => photo !== undefined)
    .filter(
      (photo) =>
        typeof photo.imageUrl === 'string' &&
        photo.imageUrl.length > 0 &&
        !isStorageAvatarPath(photo.imageUrl),
    );
};

const normalizeCategory = (raw: unknown): CategoryEntity | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }

  const id = normalizeString(raw.id);
  const name = normalizeString(raw.name);

  if (id.length === 0 || name.length === 0) {
    return undefined;
  }

  const description = normalizeString(raw.description);
  const parentId = normalizeOptionalString(raw.parentId ?? raw.parent_id);

  return {
    id,
    name,
    description,
    parent_id: parentId ?? null,
    parentId: parentId ?? null,
    subcategories: [],
    products: [],
  };
};

const normalizeMeta = (raw: unknown): ProductMeta | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }
  return raw as ProductMeta;
};

const normalizeEngagementStats = (
  raw: unknown
): ProductEngagementStats | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }

  const ratingRaw = isRecord(raw.rating) ? raw.rating : undefined;
  const visitsRaw = isRecord(raw.visits) ? raw.visits : undefined;
  const salesRaw = isRecord(raw.sales) ? raw.sales : undefined;

  const distribution: Record<'1' | '2' | '3' | '4' | '5', number> = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
  };

  if (ratingRaw && isRecord(ratingRaw.distribution)) {
    const distributionSource = ratingRaw.distribution as Record<string, unknown>;
    (['1', '2', '3', '4', '5'] as const).forEach((key) => {
      const value = toNumber(distributionSource[key]);
      distribution[key] = value ?? 0;
    });
  }

  const totalOpinions = toNumber(ratingRaw?.totalOpinions) ?? 0;

  return {
    rating: {
      average: toNumber(ratingRaw?.average),
      totalOpinions,
      totalWithRating: toNumber(ratingRaw?.totalWithRating) ?? totalOpinions,
      distribution,
      lastReviewAt:
        typeof ratingRaw?.lastReviewAt === 'string'
          ? ratingRaw.lastReviewAt
          : undefined,
    },
    visits: {
      total: toNumber(visitsRaw?.total) ?? 0,
      uniqueVisitors: toNumber(visitsRaw?.uniqueVisitors) ?? 0,
      lastVisitAt:
        typeof visitsRaw?.lastVisitAt === 'string'
          ? visitsRaw.lastVisitAt
          : undefined,
    },
    sales: {
      unitsSold: toNumber(salesRaw?.unitsSold) ?? 0,
    },
  };
};

const normalizeProductEntity = (raw: unknown, index = 0): ProductEntity => {
  if (!isRecord(raw)) {
    const fallbackId = `unknown-${index}`;
    return {
      id: fallbackId,
      name: 'Producto',
      price: 0,
      crypto: 'USDT',
      description: '',
      category_identification_code: '',
      creation_date: new Date().toISOString(),
      status: 'inactive',
      visits: 0,
      sales: 0,
      stock: 0,
      year: new Date().getFullYear(),
      condition: 'new',
      active_status: 0,
      account_id: '',
      photos: [],
    };
  }

  const pricing = normalizePricing(raw.pricing);
  const rawRecord = raw as Record<string, unknown>;

  // Moneda principal: referenceBase del JSON si cuadra con un valor; si no, USDT > USD/USDC > ARS > primera
  let baseCurrency = 'USDT';
  if (pricing?.values && pricing.values.length > 0) {
    const ref = (pricing.referenceBase || '').toUpperCase();
    const refNorm = ref === 'USD' ? 'USDT' : ref;
    const pick = (c: string) => findPricingAmount(pricing, c);

    if (refNorm === 'USDT' && pick('USDT') !== undefined) {
      baseCurrency = 'USDT';
    } else if (ref === 'ARS' && pick('ARS') !== undefined && pick('USDT') === undefined && pick('USD') === undefined) {
      baseCurrency = 'ARS';
    } else if (pick('USDT') !== undefined) {
      baseCurrency = 'USDT';
    } else if (pick('USD') !== undefined) {
      baseCurrency = 'USD';
    } else if (pick('USDC') !== undefined) {
      baseCurrency = 'USDC';
    } else if (pick('ARS') !== undefined) {
      baseCurrency = 'ARS';
    } else {
      const usdtValue = pricing.values.find((v) => v.currency?.toUpperCase() === 'USDT');
      const usdValue = pricing.values.find((v) => v.currency?.toUpperCase() === 'USD');
      baseCurrency = (
        usdtValue?.currency ??
        usdValue?.currency ??
        pricing.values[0]?.currency ??
        'USDT'
      ).toUpperCase();
    }
  } else {
    baseCurrency = normalizeString(
      raw.crypto,
      pricing?.referenceBase ?? 'USDT',
    ).toUpperCase();
    if (baseCurrency === 'USD') baseCurrency = 'USDT';
  }

  const basePrice =
    findPricingAmount(pricing, baseCurrency) ??
    (baseCurrency === 'USDT'
      ? findPricingAmount(pricing, 'USD')
      : undefined) ??
    findPricingAmount(pricing, 'USDT') ??
    findPricingAmount(pricing, 'USD') ??
    (pricing?.values?.[0]?.amount) ??
    toNumber(raw.price) ??
    0;

  const arsPrice =
    findPricingAmount(pricing, 'ARS') ??
    toNumber(rawRecord.price_ars) ??
    toNumber(rawRecord.priceArs);

  // Etiqueta unificada: USD legacy → USDT en UI
  const cryptoOut = baseCurrency === 'USD' ? 'USDT' : baseCurrency;

  const photos = normalizePhotos(raw.photos);
  const fromMetaTop = extractProductImageFromMeta(raw.meta);
  const rawImg =
    typeof raw.image_url === 'string' && !isStorageAvatarPath(raw.image_url)
      ? raw.image_url
      : typeof raw.imageUrl === 'string' && !isStorageAvatarPath(raw.imageUrl)
        ? raw.imageUrl
        : undefined;
  const firstPhotoUrl = photos.find(
    (p) => p.imageUrl && !isStorageAvatarPath(p.imageUrl),
  )?.imageUrl;
  const image_url =
    rawImg ??
    firstPhotoUrl ??
    (fromMetaTop && !isStorageAvatarPath(fromMetaTop) ? fromMetaTop : undefined);

  const promotion = typeof raw.promotion === 'string' && raw.promotion.trim().length > 0
    ? raw.promotion
    : undefined;

  const stats = normalizeEngagementStats(raw.engagementStats ?? raw.stats);
  const visitsFromStats = stats?.visits?.total;
  const salesFromStats = stats?.sales?.unitsSold;

  // Extraer storeId del producto
  const storeId = normalizeOptionalString(raw.store_id ?? raw.storeId);

  return {
    id: normalizeString(raw.id, `unknown-${index}`),
    name: normalizeString(raw.name, 'Producto'),
    price: Number.isFinite(basePrice) ? basePrice : 0,
    price_ars: arsPrice,
    crypto: cryptoOut,
    description: normalizeString(raw.description),
    category_identification_code: normalizeString(
      raw.category_identification_code ?? raw.categoryIdentificationCode ?? ''
    ),
    creation_date: normalizeString(
      raw.creation_date ?? raw.creationDate,
      new Date().toISOString()
    ),
    status: normalizeString(raw.status, 'inactive'),
    visits: visitsFromStats ?? toNumber(raw.visits) ?? 0,
    sales: salesFromStats ?? toNumber(raw.sales) ?? 0,
    // Normalizar stock: puede venir como stock, availableStock, o en diferentes formatos
    stock: (() => {
      const rawRecord = raw as Record<string, unknown>;

      // Intentar obtener el stock de diferentes campos posibles y formatos
      let stockValue: number | undefined = undefined;

      // 1. Intentar directamente como número
      if (typeof raw.stock === 'number' && Number.isFinite(raw.stock)) {
        stockValue = raw.stock;
      }
      // 2. Intentar como string numérico
      else if (typeof raw.stock === 'string') {
        const parsed = Number.parseFloat(raw.stock);
        if (!Number.isNaN(parsed)) {
          stockValue = parsed;
        }
      }
      // 3. Intentar con toNumber helper
      else {
        stockValue = toNumber(raw.stock);
      }

      // 4. Si aún no tenemos valor, intentar availableStock
      if (stockValue === undefined) {
        if (typeof rawRecord.availableStock === 'number' && Number.isFinite(rawRecord.availableStock)) {
          stockValue = rawRecord.availableStock as number;
        } else {
          stockValue = toNumber(rawRecord.availableStock);
        }
      }

      // 5. Si aún no tenemos valor, intentar cualquier variante de stock
      if (stockValue === undefined) {
        const stockVariants = ['stock', 'Stock', 'STOCK', 'availableStock', 'available_stock'];
        for (const variant of stockVariants) {
          const value = rawRecord[variant];
          if (typeof value === 'number' && Number.isFinite(value)) {
            stockValue = value;
            break;
          } else {
            const parsed = toNumber(value);
            if (parsed !== undefined) {
              stockValue = parsed;
              break;
            }
          }
        }
      }

      // Asegurar que sea un número entero no negativo
      const finalStock = stockValue !== undefined && stockValue !== null
        ? Math.max(0, Math.floor(stockValue))
        : 0;

      return finalStock;
    })(),
    promotion,
    shipping_id: normalizeOptionalString(raw.shipping_id ?? raw.shippingId),
    year: toNumber(raw.year) ?? new Date().getFullYear(),
    condition: raw.condition === 'used' ? 'used' : 'new',
    active_status: toNumber(raw.active_status ?? raw.activeStatus) ?? 0,
    location_id: normalizeOptionalString(raw.location_id ?? raw.locationId),
    account_id: normalizeString(raw.account_id ?? raw.accountId ?? ''),
    store_id: storeId,
    storeId,
    image_url,
    photos,
    category: normalizeCategory(raw.category),
    location: undefined,
    shipping: undefined,
    meta: normalizeMeta(raw.meta),
    pricing,
    engagementStats: stats,
  };
};

const normalizeProductCollection = (raw: unknown): ProductEntity[] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item, index) => normalizeProductEntity(item, index));
};

export const useProducts = () => {
  const queryClient = useQueryClient();

  // 🔹 Fetch all categories
  const categories = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: async (): Promise<CategoryEntity[]> => {
      const response = await axiosHelper.products.getAllCategories();
      const apiResponse = response.data as unknown as ApiResponse<CategoryEntity[]>;
      const data = apiResponse?.data;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
    retry: false, // No reintentar si falla
  });

  // Catálogo completo ya no se carga en cliente: shop/categorías/ofertas usan getAll paginado.
  // Se mantiene la query deshabilitada con lista vacía para compatibilidad con código legacy.
  const products = useQuery({
    queryKey: [...PRODUCTS_KEY, 'legacy-empty'],
    queryFn: async () => [] as ProductEntity[],
    enabled: false,
    initialData: [],
    staleTime: Infinity,
  });

  // 🔹 Hook para obtener productos por account ID
  const useProductsByAccountId = (accountId: string) => {
    return useQuery({
      queryKey: [...PRODUCTS_KEY, 'byAccount', accountId],
      queryFn: async (): Promise<ProductEntity[]> => {
        if (!accountId) return [];

        const response = await axiosHelper.products.getAll({
          account_id: accountId,
          page: 1,
          limit: 500,
        });
        const apiResponse = response.data as unknown as ApiResponse<{
          data: unknown[];
          pagination: unknown;
          filters: unknown;
        }>;
        return normalizeProductCollection(apiResponse.data.data);
      },
      enabled: !!accountId,
      staleTime: 5 * 60 * 1000,
      retry: false, // No reintentar si falla
    });
  };

  // 🔹 Nested hook to fetch products by category
  const useProductsByCategory = (categoryId: string) =>
    useQuery({
      queryKey: [...CATEGORY_PRODUCTS_KEY(categoryId), 'p1', 24],
      queryFn: async () => {
        const response = await axiosHelper.products.getAll({
          category_identification_code: categoryId,
          include_subcategories: true,
          page: 1,
          limit: 24,
          status: 'approved',
          active_status: 1,
          sortBy: 'creation_date',
          sortOrder: 'desc',
        });
        const apiResponse = response.data as unknown as ApiResponse<{
          data: unknown[];
          pagination: unknown;
          filters: unknown;
        }>;
        return normalizeProductCollection(apiResponse.data.data);
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!categoryId,
      retry: false, // No reintentar si falla
    });

  const offersQuery = useQuery({
    queryKey: [...PRODUCTS_KEY, 'offers-home'],
    queryFn: async () => {
      const response = await axiosHelper.products.getAll({
        page: 1,
        limit: 48,
        has_promotion: true,
        active_status: 1,
        status: 'approved',
        sortBy: 'creation_date',
        sortOrder: 'desc',
      });
      const apiResponse = response.data as unknown as ApiResponse<{
        data: unknown[];
        pagination: unknown;
        filters: unknown;
      }>;
      return normalizeProductCollection(apiResponse.data.data);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: typeof window !== 'undefined',
  });

  const offers = useMemo(
    () => ({
      data: offersQuery.data ?? [],
      isLoading: offersQuery.isLoading,
      isError: offersQuery.isError,
      error: offersQuery.error,
      isSuccess: offersQuery.isSuccess,
      refetch: offersQuery.refetch,
    }),
    [
      offersQuery.data,
      offersQuery.isLoading,
      offersQuery.isError,
      offersQuery.error,
      offersQuery.isSuccess,
      offersQuery.refetch,
    ],
  );

  // 🔹 Nested hook to fetch a single product by ID
  const useProductById = (productId: string) =>
    useQuery({
      queryKey: PRODUCT_KEY(productId),
      queryFn: async () => {
        const response = await axiosHelper.products.getById(productId);
        const apiResponse = response.data as unknown as ApiResponse<unknown>;
        const normalized = normalizeProductEntity(apiResponse.data);
        // Debug: Log del stock para verificar qué está recibiendo
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log('[useProductById] Product stock:', {
            raw: (apiResponse.data as Record<string, unknown>)?.stock,
            normalized: normalized.stock,
            productId
          });
        }
        return normalized;
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!productId,
      retry: false, // No reintentar si falla
    });

  // 🔹 Get navbar categories (top categories for dropdown) - solo raíz, deduplicadas por id Y por nombre
  const getNavbarCategories = (): Array<{ id: string; name: string; href: string }> => {
    if (!categories.data || !Array.isArray(categories.data)) return [];

    const roots = categories.data.filter(
      (c: CategoryEntity) => !c.parentId && !c.parent_id
    );
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const unique = roots.filter((c: CategoryEntity) => {
      if (seenIds.has(c.id)) return false;
      const nameKey = (c.name || '').trim().toLowerCase();
      if (nameKey && seenNames.has(nameKey)) return false;
      seenIds.add(c.id);
      if (nameKey) seenNames.add(nameKey);
      return true;
    });

    const preferredOrder = ['Inversiones', 'Deportes', 'Moda', 'Electronica', 'Vehículos', 'Libros'];
    return unique
      .map((category: CategoryEntity) => ({
        id: category.id,
        name: category.name,
        href: `/categories/${category.id}`,
      }))
      .sort((a: { name: string }, b: { name: string }) => {
        const idxA = preferredOrder.indexOf(a.name);
        const idxB = preferredOrder.indexOf(b.name);
        if (idxA >= 0 && idxB >= 0) return idxA - idxB;
        if (idxA >= 0) return -1;
        if (idxB >= 0) return 1;
        return a.name.localeCompare(b.name);
      });
  };

  // 🔹 Create product mutation (soporta JSON y FormData)
  const createProductMutation = useMutation({
    mutationFn: async (productData: CreateProductRequest | FormData): Promise<{ product: ProductEntity; photosWarning?: string }> => {
      const response = await axiosHelper.products.create(productData);
      const apiResponse = response.data as unknown as ApiResponse<unknown>;

      // Verificar si el backend retornó success: false (aunque el HTTP status sea 200)
      if (apiResponse.success === false) {
        const apiResponseWithError = apiResponse as ApiResponse<unknown> & { error?: string };
        const errorMessage = apiResponseWithError.message || apiResponseWithError.error || 'Error al crear el producto';
        // Crear un error con estructura que pueda ser capturada por el catch del componente
        const error = new Error(errorMessage) as Error & { response?: { data?: { message?: string; detail?: string; error?: string } } };
        error.response = {
          data: {
            message: apiResponseWithError.message,
            error: apiResponseWithError.error,
          },
        };
        throw error;
      }

      // Read warning header if exists (indicates photos could not be uploaded)
      const photosWarning = response.headers?.['x-photos-upload-warning'] || undefined;

      const normalized = normalizeProductEntity(apiResponse.data);

      return { product: normalized, photosWarning };
    },
    onSuccess: async (result) => {
      const { product: newProduct, photosWarning } = result;

      // Si hay una advertencia sobre las fotos, mostrarla pero continuar con el flujo normal
      if (photosWarning) {
        // Importar notificationService dinámicamente para evitar dependencias circulares
        const { notificationService } = await import('../providers/toast-provider');
        notificationService.warning(photosWarning, { autoClose: 10000 });
      }

      await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });

      if (newProduct.account_id) {
        const byAccountKey = [...PRODUCTS_KEY, 'byAccount', newProduct.account_id];
        await queryClient.invalidateQueries({ queryKey: byAccountKey });
        await queryClient.refetchQueries({ queryKey: byAccountKey });
      }

      await queryClient.invalidateQueries({ queryKey: [...PRODUCTS_KEY, 'offers-home'] });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      // El error se propaga automáticamente para que sea capturado por el catch del componente
    },
  });

  // 🔹 Update product mutation (soporta JSON y FormData)
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductEntity> | FormData }): Promise<ProductEntity> => {
      const response = await axiosHelper.products.update(id, data);
      const apiResponse = response.data as unknown as ApiResponse<unknown>;
      return normalizeProductEntity(apiResponse.data);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_KEY, 'offers-home'] });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEY(updated.id) });
      const accountId = updated.account_id;
      if (accountId) {
        queryClient.invalidateQueries({ queryKey: [...PRODUCTS_KEY, 'byAccount', accountId] });
      }
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    },
  });

  // 🔹 Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axiosHelper.products.delete(id);
    },
    onSuccess: async (_data, id) => {
      // Invalidar todas las queries de productos, incluyendo las específicas por accountId
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
        queryClient.invalidateQueries({
          queryKey: PRODUCTS_KEY,
          exact: false // Invalidar todas las queries que empiecen con PRODUCTS_KEY
        }),
        queryClient.invalidateQueries({ queryKey: [...PRODUCTS_KEY, 'offers-home'] }),
      ]);
      queryClient.removeQueries({ queryKey: PRODUCT_KEY(id) });

      // Refetch explícito para asegurar que la UI se actualiza
      await queryClient.refetchQueries({
        queryKey: PRODUCTS_KEY,
        type: 'active' // Solo refetch queries activas
      });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });

  // 🔹 Pause/Resume product helper (toggle active_status)
  const togglePauseProduct = async (id: string, paused: boolean): Promise<ProductEntity> => {
    const newStatus = paused ? 1 : 0;
    const response = await axiosHelper.products.update(id, { active_status: newStatus });
    const apiResponse = response.data as unknown as ApiResponse<unknown>;
    const updated = normalizeProductEntity(apiResponse.data);

    console.log('[togglePauseProduct] Updated product:', { id, paused, newStatus, updatedActiveStatus: updated.active_status });

    const accountId = updated.account_id;

    // Invalidar todas las queries relacionadas
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_KEY, 'offers-home'] }),
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEY(id) }),
      accountId ? queryClient.invalidateQueries({ queryKey: [...PRODUCTS_KEY, 'byAccount', accountId] }) : Promise.resolve(),
    ]);

    // Refetch explícito de la query específica del accountId
    if (accountId) {
      await queryClient.refetchQueries({
        queryKey: [...PRODUCTS_KEY, 'byAccount', accountId],
        type: 'active' // Solo refetch queries activas
      });
    }

    // También refetch la query general de productos
    await queryClient.refetchQueries({
      queryKey: PRODUCTS_KEY,
      type: 'active' // Solo refetch queries activas
    });

    return updated;
  };

  const registerProductVisit = async ({
    productId,
    sessionId,
    referrer,
    metadata,
  }: {
    productId: string;
    sessionId?: string;
    referrer?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> => {
    try {
      await axiosHelper.products.engagements.create(productId, {
        eventType: 'VISIT',
        sessionId,
        referrer,
        metadata,
      });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEY(productId) });
    } catch (error) {
      // Si la visita ya existe (409 Conflict), es un comportamiento esperado
      // No queremos registrar múltiples visitas del mismo usuario/sesión para el mismo producto
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 409) {
        // Silenciar el error - la visita ya está registrada
        return;
      }
      // Para otros errores, lanzar la excepción
      throw error;
    }
  };

  // 🔹 Hook para obtener detalle de producto mapeado
  const useProductDetail = (productId: string) => {
    const { data: realProduct, isLoading, isError, error } = useProductById(productId);

    // Mapear datos reales usando la función de utilidad
    const product = mapProductEntityToProduct(realProduct);

    return {
      product,
      isLoading,
      isError,
      error,
      isRealData: !!realProduct,
    };
  };

  return {
    // Data
    categories,
    products,
    offers,

    // Nested hooks (safe to call at top-level)
    useProductsByCategory,
    useProductById,
    useProductsByAccountId,
    useProductDetail,

    // Mutations
    createProduct: createProductMutation,
    updateProduct: updateProductMutation,
    deleteProduct: deleteProductMutation,
    togglePauseProduct,
    registerProductVisit,

    // 🔹 Hook para obtener productos con filtros avanzados
    useProductsWithFilters: (filters: Record<string, unknown>, enabled: boolean = true) => {
      return useQuery({
        queryKey: [...PRODUCTS_KEY, 'filtered', filters],
        queryFn: async () => {
          const response = await axiosHelper.products.getAll(filters);
          const apiResponse = response.data as unknown as ApiResponse<{
            data: unknown[];
            pagination: unknown;
            filters: unknown;
          }>;
          return {
            data: normalizeProductCollection(apiResponse.data.data),
            pagination: apiResponse.data.pagination,
            filters: apiResponse.data.filters,
          };
        },
        enabled,
        staleTime: 5 * 60 * 1000,
        retry: false,
      });
    },

    // Navbar helpers
    getNavbarCategories,

    // Refetch helpers
    refetchCategories: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
    refetchProducts: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
    refetchOffers: () =>
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_KEY, 'offers-home'] }),
    refetchProductsByCategory: (id: string) =>
      queryClient.invalidateQueries({ queryKey: CATEGORY_PRODUCTS_KEY(id) }),
    refetchProductById: (id: string) =>
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEY(id) }),
  };
};

/** Búsqueda del navbar vía API (sin cargar todo el catálogo en memoria) */
export function useNavbarProductSearch(debouncedQuery: string) {
  const q = debouncedQuery.trim();
  return useQuery({
    queryKey: [...PRODUCTS_KEY, 'navbar-search', q],
    queryFn: async () => {
      const response = await axiosHelper.products.getAll({
        search: q,
        page: 1,
        limit: 12,
        status: 'approved',
        active_status: 1,
      });
      const apiResponse = response.data as unknown as ApiResponse<{
        data: unknown[];
        pagination: unknown;
        filters: unknown;
      }>;
      return normalizeProductCollection(apiResponse.data.data);
    },
    enabled: q.length >= 2,
    staleTime: 30 * 1000,
    retry: false,
  });
}