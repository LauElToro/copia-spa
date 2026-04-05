import { ProductEntity } from '../types/product';
import { getAvatarUrl } from '../hooks/use-user-avatar';

export const extractDiscount = (promotion?: string): number | undefined => {
  if (typeof promotion !== 'string') {
    return undefined;
  }
  const match = promotion.match(/(\d{1,3})%/);
  if (!match) {
    return undefined;
  }
  const parsed = Number.parseInt(match[1], 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    return undefined;
  }
  return parsed;
};

const STORAGE_BASE = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_S3_BASE_URL || process.env.NEXT_PUBLIC_MS_STORAGE_URL || 'https://prod-libertyclub.s3.us-east-2.amazonaws.com')
  : 'https://prod-libertyclub.s3.us-east-2.amazonaws.com';

/** Fallback de imagen: siempre desde S3 para evitar URLs del servidor */
export const DEFAULT_PRODUCT_IMAGE = `${STORAGE_BASE.replace(/\/$/, '')}/images/icons/avatar.png`;
const FALLBACK_LOCAL = '/images/icons/avatar.png';

/** True si la URL es placeholder (avatar genérico, nodata, o vacío). */
export function isStorageAvatarPath(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return true;
  const t = url.trim().toLowerCase();
  if (t.length === 0) return true;
  if (t.includes('/images/icons/avatar.png') || t.endsWith('avatar.png')) return true;
  if (t === 'nodata' || t.endsWith('/nodata') || t.includes('/commerces/nodata') || t.includes('/products/nodata'))
    return true;
  return false;
}

/**
 * Logo/banner legacy (migración): JSON en `informacion_comercio` o `description` con logoComercio/bannerComercio.
 */
export function parseLegacyStoreMediaFromInfo(info: unknown): { logo?: string; banner?: string } {
  const pick = (s: string | undefined): string | undefined => {
    if (!s || typeof s !== 'string') return undefined;
    const x = s.trim();
    if (!x || x.toLowerCase() === 'nodata') return undefined;
    return x;
  };

  const fromBlock = (obj: Record<string, unknown>): { logo?: string; banner?: string } => {
    const data = (obj.data as Record<string, unknown>) || obj;
    return {
      logo: pick((data.logoComercio ?? data.logo ?? obj.logoComercio) as string | undefined),
      banner: pick((data.bannerComercio ?? data.banner ?? obj.bannerComercio) as string | undefined),
    };
  };

  if (!info) return {};
  if (typeof info === 'string' && info.trim().startsWith('{')) {
    try {
      return fromBlock(JSON.parse(info) as Record<string, unknown>);
    } catch {
      return {};
    }
  }
  if (typeof info === 'object' && info !== null) {
    const i = info as Record<string, unknown>;
    const fromRoot = fromBlock(i);
    if (fromRoot.logo || fromRoot.banner) return fromRoot;
    if (typeof i.description === 'string' && i.description.trim().startsWith('{')) {
      try {
        const inner = fromBlock(JSON.parse(i.description) as Record<string, unknown>);
        if (inner.logo || inner.banner) return inner;
      } catch {
        /* ignore */
      }
    }
    return fromRoot;
  }
  return {};
}

function storageOriginMatches(url: URL): boolean {
  try {
    const base = new URL(STORAGE_BASE);
    return url.hostname === base.hostname;
  } catch {
    return false;
  }
}

export function resolveImageUrl(url: string | undefined): string {
  if (!url || url === FALLBACK_LOCAL || isStorageAvatarPath(url)) return DEFAULT_PRODUCT_IMAGE;
  if (url.startsWith('data:')) return url;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const u = new URL(url);
      if (u.pathname === '/images/icons/avatar.png' || u.pathname.endsWith('/images/icons/avatar.png')) {
        return DEFAULT_PRODUCT_IMAGE;
      }
      if (u.pathname.endsWith('/nodata') || u.pathname.includes('/nodata')) {
        return DEFAULT_PRODUCT_IMAGE;
      }
      // Ya es el bucket configurado
      if (storageOriginMatches(u)) {
        return url;
      }
      // Evitar que el front (IP/dominio) sirva rutas de media: apuntar al bucket S3
      let path = u.pathname;
      if (path.startsWith('/stores/')) {
        path = `/commerces/${path.slice('/stores/'.length)}`;
      }
      if (path.startsWith('/commerces/') || path.startsWith('/products/')) {
        return `${STORAGE_BASE.replace(/\/$/, '')}${path}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  const base = STORAGE_BASE.replace(/\/$/, '');
  let key = url.startsWith('/')
    ? url.slice(1)
    : url.includes('/')
      ? url
      : `commerces/${url}`;
  // Legacy: algunas keys usaban prefijo stores/; en S3 el prefijo correcto es commerces/
  if (key.startsWith('stores/')) {
    key = `commerces/${key.slice('stores/'.length)}`;
  }
  return `${base}/${key}`;
}

/**
 * URLs de medios públicos (comercio/tienda, banners) que vienen como key S3 o ruta sin dominio.
 * Prefijo por defecto: commerces (no stores).
 */
export function resolvePublicMediaUrl(
  url: string | undefined,
  subfolder: 'commerces' | 'products' = 'commerces',
): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.toLowerCase() === 'nodata' || isStorageAvatarPath(trimmed)) return undefined;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const u = new URL(trimmed);
      if (storageOriginMatches(u)) return trimmed;
      let path = u.pathname;
      if (path.startsWith('/stores/')) {
        path = `/commerces/${path.slice('/stores/'.length)}`;
      }
      if (path.startsWith('/commerces/') || path.startsWith('/products/')) {
        return `${STORAGE_BASE.replace(/\/$/, '')}${path}`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }
  if (trimmed.startsWith('data:')) return trimmed;
  const base = STORAGE_BASE.replace(/\/$/, '');
  let key = trimmed.startsWith('/')
    ? trimmed.slice(1)
    : trimmed.includes('/')
      ? trimmed
      : `${subfolder}/${trimmed}`;
  if (key.startsWith('stores/')) {
    key = `commerces/${key.slice('stores/'.length)}`;
  }
  return `${base}/${key}`;
}

/** Extrae URL de un ítem de foto (legacy: distintas formas y objetos anidados). */
export function extractPhotoImageUrl(photo: Record<string, unknown>): string | undefined {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const direct =
    str(photo.imageUrl) ||
    str(photo.image_url) ||
    str(photo.url) ||
    str(photo.src) ||
    str(photo.key);
  if (direct && !isStorageAvatarPath(direct)) return direct;

  const nestedCandidates = [
    getAvatarUrl(photo.imageUrl),
    getAvatarUrl(photo.image_url),
    getAvatarUrl(photo.url),
    getAvatarUrl(photo.original),
    getAvatarUrl(photo.media),
    getAvatarUrl(photo),
  ];
  const nested = nestedCandidates.find((u) => u && !isStorageAvatarPath(u));
  if (nested) return nested;

  for (const k of ['imageUrlLg', 'imageUrlMd', 'imageUrlSm', 'image_url_lg', 'thumbnail', 'thumb'] as const) {
    const v = photo[k];
    if (typeof v === 'string' && v.trim() && !isStorageAvatarPath(v)) return v.trim();
    const nestedUrl = getAvatarUrl(v);
    if (nestedUrl && !isStorageAvatarPath(nestedUrl)) return nestedUrl;
  }
  return undefined;
}

/** Formato legacy marketplace: `imagenes` como JSON `{ imagen_1: "file.jpg" }` o array. */
function extractFirstUrlFromLegacyImagenes(raw: unknown): string | undefined {
  if (raw == null) return undefined;
  if (typeof raw === 'string') {
    try {
      return extractFirstUrlFromLegacyImagenes(JSON.parse(raw) as unknown);
    } catch {
      const t = raw.trim();
      return t && t !== 'ninguna' && !isStorageAvatarPath(t) ? t : undefined;
    }
  }
  if (Array.isArray(raw)) {
    for (const v of raw) {
      const s =
        typeof v === 'string'
          ? v
          : v && typeof v === 'object' && 'url' in v
            ? String((v as { url?: string }).url ?? '')
            : '';
      if (s && s !== 'ninguna' && !isStorageAvatarPath(s)) return s;
    }
    return undefined;
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    for (const v of Object.values(raw)) {
      if (typeof v === 'string' && v && v !== 'ninguna' && !isStorageAvatarPath(v)) return v;
    }
  }
  return undefined;
}

export function extractProductImageFromMeta(meta: unknown): string | undefined {
  if (!meta || typeof meta !== 'object') return undefined;
  const m = meta as Record<string, unknown>;
  const candidates = [
    m.image,
    m.coverImage,
    m.coverImageUrl,
    m.mainImage,
    m.thumbnail,
    m.photo,
    m.imageUrl,
    Array.isArray(m.images) ? m.images[0] : undefined,
    Array.isArray(m.photoUrls) ? m.photoUrls[0] : undefined,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim() && !isStorageAvatarPath(c)) return c.trim();
    const u = getAvatarUrl(c);
    if (u && !isStorageAvatarPath(u)) return u;
    if (c && typeof c === 'object' && !Array.isArray(c)) {
      const u2 = extractPhotoImageUrl(c as Record<string, unknown>);
      if (u2 && !isStorageAvatarPath(u2)) return u2;
    }
  }
  const imagenes = m.imagenes ?? m.legacyImages ?? m['legacy_imagenes'];
  const fromImagenes = extractFirstUrlFromLegacyImagenes(imagenes);
  if (fromImagenes) return fromImagenes.trim();
  return undefined;
}

export const getPrimaryImage = (product: ProductEntity): string => {
  const p = product as ProductEntity & { imageUrl?: string };

  if (product.photos && product.photos.length > 0) {
    for (const ph of product.photos) {
      const raw = ph as unknown as Record<string, unknown>;
      const url = extractPhotoImageUrl(raw);
      if (url && !isStorageAvatarPath(url)) {
        return resolveImageUrl(url);
      }
    }
  }

  const topLevel =
    (typeof p.imageUrl === 'string' && p.imageUrl.trim()) ||
    (typeof product.image_url === 'string' && product.image_url.trim()) ||
    undefined;
  if (topLevel && !isStorageAvatarPath(topLevel)) return resolveImageUrl(topLevel);

  const fromMeta = extractProductImageFromMeta(product.meta);
  if (fromMeta && !isStorageAvatarPath(fromMeta)) return resolveImageUrl(fromMeta);

  return DEFAULT_PRODUCT_IMAGE;
};

/**
 * Retorna un ProductEntity directamente sin transformaciones
 * @param realProduct - Producto real de la API
 * @returns ProductEntity o null si no hay datos
 */
export const mapProductEntityToProduct = (realProduct: ProductEntity | null | undefined): ProductEntity | null => {
  if (!realProduct) return null;
  
  // Construir productSpecs desde meta.technicalSheet.specs
  const meta = realProduct.meta as { technicalSheet?: { specs?: Record<string, unknown> } } | undefined;
  const specs = meta?.technicalSheet?.specs;
  
  const productSpecs: Array<{ label: string; value: string }> = [];
  
  // Agregar dimensiones si existen
  if (specs?.dimensions && typeof specs.dimensions === 'object') {
    const dimensions = specs.dimensions as { width?: number; height?: number; depth?: number; unit?: string };
    const unit = dimensions.unit || 'cm';
    const parts: string[] = [];
    
    if (dimensions.width && dimensions.width > 0) {
      parts.push(`${dimensions.width}${unit === 'mts' ? ' m' : ' cm'}`);
    }
    if (dimensions.height && dimensions.height > 0) {
      parts.push(`${dimensions.height}${unit === 'mts' ? ' m' : ' cm'}`);
    }
    if (dimensions.depth && dimensions.depth > 0) {
      parts.push(`${dimensions.depth}${unit === 'mts' ? ' m' : ' cm'}`);
    }
    
    if (parts.length > 0) {
      productSpecs.push({
        label: 'Dimensiones',
        value: `${parts.join(' × ')}`
      });
    }
  }
  
  // Agregar peso si existe
  if (specs?.weight && typeof specs.weight === 'object') {
    const weight = specs.weight as { value?: number; unit?: string };
    if (weight.value && weight.value > 0) {
      const unit = weight.unit || 'g';
      const unitLabel = unit === 'kg' ? ' kg' : ' g';
      productSpecs.push({
        label: 'Peso',
        value: `${weight.value}${unitLabel}`
      });
    }
  }
  
  // Agregar otros atributos de specs (excluyendo dimensions y weight que ya se agregaron)
  if (specs && typeof specs === 'object') {
    Object.entries(specs).forEach(([key, value]) => {
      if (key !== 'dimensions' && key !== 'weight' && value) {
        productSpecs.push({
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          value: String(value)
        });
      }
    });
  }
  
  // Precios: confiar en normalizeProductEntity (price, price_ars, crypto) — evita USDT=0 que tapaba ARS
  const promotion = realProduct.promotion;
  const discountPct = extractDiscount(promotion);

  const baseMain = Number(realProduct.price) || 0;
  const baseArsPrice = realProduct.price_ars;
  const cryptoUpper = (realProduct.crypto || 'USDT').toUpperCase();

  const applyDiscount = (n: number) =>
    discountPct && n > 0 ? Number((n * (1 - discountPct / 100)).toFixed(2)) : n;

  let mappedPrice:
    | number
    | {
        usd?: number;
        ars?: number;
        originalUsd?: number;
        originalArs?: number;
        discountPct?: number;
      };

  if (discountPct && (baseMain > 0 || (baseArsPrice !== undefined && baseArsPrice > 0))) {
    if (cryptoUpper === 'ARS') {
      mappedPrice = {
        usd: 0,
        ars: applyDiscount(baseMain),
        originalArs: baseMain,
        discountPct,
      };
    } else {
      mappedPrice = {
        usd: applyDiscount(baseMain),
        originalUsd: baseMain,
        discountPct,
        ...(baseArsPrice !== undefined && baseArsPrice > 0
          ? { ars: applyDiscount(baseArsPrice), originalArs: baseArsPrice }
          : {}),
      };
    }
  } else if (
    baseArsPrice !== undefined &&
    baseArsPrice > 0 &&
    cryptoUpper !== 'ARS' &&
    baseMain > 0
  ) {
    // Dual: USDT/USD principal + referencia ARS
    mappedPrice = { usd: baseMain, ars: baseArsPrice };
  } else {
    mappedPrice = baseMain > 0 ? baseMain : 0;
  }
  
  return {
    ...realProduct,
    price: mappedPrice,
    productSpecs: productSpecs.length > 0 ? productSpecs : undefined
  } as ProductEntity & { productSpecs?: Array<{ label: string; value: string }> };
};

/**
 * Mapea un array de ProductEntity a un array de ProductEntity
 * @param realProducts - Array de productos reales de la API
 * @returns Array de productos mapeados
 */
export const mapProductEntitiesToProducts = (realProducts: ProductEntity[]): ProductEntity[] => {
  return realProducts
    .map(mapProductEntityToProduct)
    .filter((product): product is ProductEntity => product !== null);
};
