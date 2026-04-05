import ProductDetailPage from '@/presentation/shop/pages/product-detail-page';
import { ProductFetcherProvider } from '@/application/shop/contexts/product-fetcher-context';

export default function Page() {
  return (
    <ProductFetcherProvider>
      <ProductDetailPage />
    </ProductFetcherProvider>
  );
} 