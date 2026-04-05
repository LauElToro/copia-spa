// Tipos para las estructuras de datos del ms-products

export interface ProductPricingValue {
  amount: number;
  currency: string;
  usdPerUnit: number;
  note?: string | null;
}

export interface ProductPricing {
  values: ProductPricingValue[];
  referenceAt: string;
  referenceBase: string;
}

// Producto
export interface ProductEngagementRatingStats {
  average?: number;
  totalOpinions: number;
  totalWithRating?: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
  lastReviewAt?: string;
}

export interface ProductEngagementVisitsStats {
  total: number;
  uniqueVisitors: number;
  lastVisitAt?: string;
}

export interface ProductEngagementSalesStats {
  unitsSold: number;
}

export interface ProductEngagementStats {
  rating: ProductEngagementRatingStats;
  visits: ProductEngagementVisitsStats;
  sales: ProductEngagementSalesStats;
}

export interface ProductEntity {
  id: string;
  name: string;
  price: number;
  /** Precio adicional normalizado en ARS cuando está disponible */
  price_ars?: number;
  crypto: string;
  description: string;
  category_identification_code: string;
  creation_date: string;
  status: string;
  visits: number;
  sales: number;
  stock: number;
  promotion?: string;
  shipping_id?: string;
  year: number;
  condition: 'new' | 'used';
  active_status: number;
  location_id?: string;
  account_id: string;
  accountId?: string;
  store_id?: string;
  storeId?: string;
  pricingRaw?: {
    referenceBase?: string;
    values?: Array<{
      currency?: string;
      amount?: number;
      usdPerUnit?: number;
    }>;
  };
  image_url?: string; // Simplificación para facilitar rendering front-end
  photos?: PhotoEntity[]; // Fotos del producto
  category?: CategoryEntity; // Categoría del producto
  location?: LocationEntity; // Ubicación del producto
  shipping?: ShippingOfProductEntity; // Información de envío
  meta?: ProductMeta; // Información adicional (ficha técnica)
  pricing?: ProductPricing; // Información de precios multi-moneda
  engagementStats?: ProductEngagementStats;
}

// Ubicación (si se necesitara expandir en UI)
export interface LocationEntity {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  postalCode?: string;
}

// Foto del producto
export interface PhotoEntity {
  id: string;
  image_url?: string;
  imageUrl?: string;
  imageUrlLg?: string | null;
  imageUrlMd?: string | null;
  imageUrlSm?: string | null;
  original_name?: string;
  originalName?: string;
  file_size?: number;
  fileSize?: number;
  content_type?: string;
  contentType?: string;
  type?: string;
  product_id?: string;
  productId?: string;
}

// Envío
export interface ShippingOfProductEntity {
  id: string;
  origin_id: string;
  dimensions_id: string;
  weight: number;
  content_type: string;
  declared_value: number;
  shipping_method: string;
  originId?: string;
  dimensionsId?: string;
  contentType?: string;
  declaredValue?: number;
  shippingMethod?: string;
}

// Metadata para ficha técnica y otros datos adicionales
export interface ProductMeta {
  technicalSheet?: {
    brand?: string;
    model?: string;
    specs?: Record<string, unknown>;
    origin?: {
      country?: string;
      certifications?: string[];
    };
    warranty?: {
      duration?: number;
      unit?: string;
    };
  };
  [key: string]: unknown;
}

// Categoría
export interface CategoryEntity {
  id: string;
  name: string;
  description: string;
  parent_id?: string | null;
  parentId?: string | null;
  subcategories?: CategoryEntity[];
  products?: ProductEntity[];
}

// Categoría extendida con productos y subcategorías (para detalle)
export interface CategoryWithProducts extends CategoryEntity {
  subcategories: CategoryEntity[];
  products: ProductEntity[];
}

// Para usar en hooks react-query
export interface UseProductsResult {
  data?: ProductEntity[];
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface UseCategoriesResult {
  data?: CategoryEntity[];
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface UseCategoryWithProductsResult {
  data?: CategoryWithProducts;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}