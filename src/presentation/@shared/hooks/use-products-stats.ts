import { useQuery } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';

// Tipos basados en la estructura del DTO de ms-products
export interface PriceByCurrency {
  currency: string;
  amount: number;
  usdPerUnit: number;
  note?: string;
}

export interface ProductPhoto {
  id: string;
  imageUrl?: string;
  imageUrlLg?: string;
  imageUrlMd?: string;
  imageUrlSm?: string;
  originalName?: string;
  fileSize?: number;
  contentType?: string;
  type?: string;
  productId?: string;
}

export interface MostViewedProduct {
  productId: string;
  name: string;
  views: number;
  category: string[];
  photos: ProductPhoto | null;
  stock: number;
  stockStatus: 'in_stock' | 'low' | 'out';
  ratingAverage: number;
  ratingCount: number;
  pricesByCurrency: PriceByCurrency[];
}

export interface BestSellerProduct {
  productId: string;
  name: string;
  soldUnits: number;
  category: string[];
  photos: ProductPhoto | null;
  ratingAverage: number;
  pricesByCurrency: PriceByCurrency[];
  salesAmountByCurrency: PriceByCurrency[];
}

export interface MarketplaceMostViewed {
  productId: string;
  name: string;
  views: number;
  pricesByCurrency: PriceByCurrency[];
  sellerId: string;
  stock: number;
  ratingAverage: number;
  photos: ProductPhoto | null;
}

export interface MarketplaceBestSeller {
  productId: string;
  name: string;
  soldUnits: number;
  ratingAverage: number;
  pricesByCurrency: PriceByCurrency[];
  salesAmountByCurrency: PriceByCurrency[];
  photos: ProductPhoto | null;
}

export interface TrendingCategory {
  name: string;
  percentage: number;
}

export interface RevenueByCurrency {
  currency: string;
  amount: number;
  usdPerUnit: number;
}

export interface StoreStats {
  mostViewed: MostViewedProduct[];
  bestSellers: BestSellerProduct[];
}

export interface MarketplaceStats {
  mostViewed: MarketplaceMostViewed[];
  bestSellers: MarketplaceBestSeller[];
}

export interface Metrics {
  totalProducts: number;
  productsWithLowStock: number;
  totalViews: number;
  totalSoldUnits: number;
  totalSalesAmount: number;
  totalRevenueByCurrency: RevenueByCurrency[];
  conversionRate: number;
  totalVisits: number;
  activeProducts: number;
  topRatedProducts: number;
  newProductsThisMonth: number;
  avgPrice: number;
  trendingCategories: TrendingCategory[];
}

export interface ProductsStatsResponse {
  store: StoreStats;
  marketplace: MarketplaceStats;
  metrics: Metrics;
}

// Query key
const PRODUCTS_STATS_KEY = ['products', 'stats'];

/**
 * Hook para obtener estadísticas de productos desde ms-products
 * @returns Query de React Query con las estadísticas
 */
export const useProductsStats = () => {
  return useQuery<ProductsStatsResponse>({
    queryKey: PRODUCTS_STATS_KEY,
    queryFn: async () => {
      const response = await axiosHelper.products.getStats();
      // El backend puede devolver los datos directamente o envueltos en { data: ... }
      const responseData = response.data as unknown as ProductsStatsResponse | { data: ProductsStatsResponse };
      
      if ('data' in responseData && responseData.data) {
        return responseData.data;
      }
      
      return responseData as ProductsStatsResponse;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });
};











