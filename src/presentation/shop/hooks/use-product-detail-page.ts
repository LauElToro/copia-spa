'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useProducts } from '@/presentation/@shared/hooks/use-products';
import { useAddToCart } from '@/presentation/@shared/hooks/use-add-to-cart';
import { useFavorites, useFavoritesOperations } from '@/presentation/@shared/hooks/use-favorites';
import { ProductEntity } from '@/presentation/@shared/types/product';
import { getPrimaryImage } from '@/presentation/@shared/utils/product-mapper';
import { AxiosError } from 'axios';

interface AddToCartSuccessData {
  productName: string;
  quantity: number;
}

export const useProductDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;

  const [showSellerDesc, setShowSellerDesc] = useState(false);
  const [showProductDesc, setShowProductDesc] = useState(false);
  const hasRegisteredVisit = useRef(false);

  const { addToCart, isLoading: isAddToCartLoading } = useAddToCart();
  const { addFavorite, removeFavorite, isLoading: isFavoriteLoading } = useFavoritesOperations();
  const { isFavorite } = useFavorites();
  const { useProductDetail, registerProductVisit } = useProducts();
  const { product, isLoading: isProductLoading, isError: isProductError } = useProductDetail(id);

  // Registrar visita al producto
  useEffect(() => {
    if (!id || !product || hasRegisteredVisit.current) {
      return;
    }

    const sessionStorageKey = 'lc_session_id';
    const generateSessionId = (): string | undefined => {
      if (typeof window === 'undefined') {
        return undefined;
      }

      const existing = window.localStorage.getItem(sessionStorageKey);
      if (existing && existing.length > 0) {
        return existing;
      }

      const newId =
        typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      window.localStorage.setItem(sessionStorageKey, newId);
      return newId;
    };

    const referrer =
      typeof document !== 'undefined' && document.referrer.length > 0
        ? document.referrer
        : undefined;

    const sessionId = generateSessionId();

    registerProductVisit({
      productId: id,
      sessionId,
      referrer,
    }).catch((error) => {
      // Solo loggear errores que no sean 409 (visita ya existe)
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status !== 409) {
        console.error('Error registering product visit', error);
      }
    });

    hasRegisteredVisit.current = true;
  }, [id, product, registerProductVisit]);

  // Calcular propiedades derivadas del producto
  const productSpecs = (product as ProductEntity & { productSpecs?: Array<{ label: string; value: string }> })?.productSpecs;
  const hasProductSpecs = Array.isArray(productSpecs) && productSpecs.length > 0;
  const hasDescription = typeof product?.description === "string" && product.description.trim().length > 0;
  const related = (product as ProductEntity & { related?: ProductEntity[] })?.related;
  const hasRelatedProducts = Array.isArray(related) && related.length > 0;
  const shippingOptions = (product as ProductEntity & { seller?: { shippingOptions?: { andreani?: boolean; oca?: boolean; correoArgentino?: boolean; particular?: boolean } } })?.seller?.shippingOptions;
  const hasShippingOptions = Boolean(
    shippingOptions && Object.values(shippingOptions).some((value) => Boolean(value))
  );
  const paymentOptions = (product as ProductEntity & { seller?: { paymentOptions?: { crypto: boolean; virtualWallets?: { mercadoPago?: boolean; lemon?: boolean; brubank?: boolean; naranjaX?: boolean }; bankCards?: { visa?: boolean; mastercard?: boolean; amex?: boolean; maestro?: boolean; visacred?: boolean }; cash?: { pagoFacil?: boolean; rapipago?: boolean } } } })?.seller?.paymentOptions;
  const hasPaymentOptions = Boolean(
    paymentOptions && (
      paymentOptions.crypto ||
      (paymentOptions.virtualWallets && Object.values(paymentOptions.virtualWallets).some(Boolean)) ||
      (paymentOptions.bankCards && Object.values(paymentOptions.bankCards).some(Boolean)) ||
      (paymentOptions.cash && Object.values(paymentOptions.cash).some(Boolean))
    )
  );

  const stopAll = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent?.stopImmediatePropagation) e.nativeEvent.stopImmediatePropagation();
  }, []);

  const handleAddToCart = useCallback((quantity: number, onSuccess?: (data: AddToCartSuccessData) => void) => {
    if (!product) return;

    // Extraer storeId del producto (puede venir como storeId o store_id)
    const productStoreId = product.storeId || product.store_id;
    // Obtener imagen principal del producto
    const productImage = getPrimaryImage(product);

    // Calcular el precio correcto para el carrito (precio con descuento aplicado)
    let cartPrice = 0;
    
    // Intentar obtener el precio del producto mapeado
    if (typeof product.price === 'number') {
      cartPrice = product.price > 0 ? product.price : 0;
    } else if (typeof product.price === 'object' && product.price !== null) {
      // El precio usd en el objeto ya viene con descuento aplicado
      const priceObj = product.price as { usd?: number; originalUsd?: number };
      // Priorizar usd (precio con descuento), luego originalUsd (precio sin descuento)
      cartPrice = (priceObj.usd && priceObj.usd > 0) 
        ? priceObj.usd 
        : (priceObj.originalUsd && priceObj.originalUsd > 0 ? priceObj.originalUsd : 0);
    }
    
    // Si el precio sigue siendo 0, intentar obtenerlo directamente del producto
    // (puede que el mapeo no haya funcionado correctamente)
    if (cartPrice === 0 || !cartPrice) {
      // Intentar desde pricing.values si existe
      const pricing = (product as { pricing?: { values?: Array<{ currency?: string; amount?: number }> } })?.pricing;
      if (pricing?.values && Array.isArray(pricing.values) && pricing.values.length > 0) {
        const usdtValue = pricing.values.find(v => v.currency?.toUpperCase() === 'USDT');
        const usdValue = pricing.values.find(v => v.currency?.toUpperCase() === 'USD');
        const firstValue = pricing.values[0];
        cartPrice = usdtValue?.amount ?? usdValue?.amount ?? firstValue?.amount ?? 0;
      }
      
      // Si aún es 0, usar el precio directo del producto (legacy)
      if ((cartPrice === 0 || !cartPrice) && (product as ProductEntity).price) {
        const directPrice = (product as ProductEntity).price;
        if (typeof directPrice === 'number' && directPrice > 0) {
          cartPrice = directPrice;
        }
      }
    }
    
    // Validación final: si el precio sigue siendo 0, mostrar error
    if (cartPrice === 0 || !cartPrice) {
      console.error('[use-product-detail-page] No se pudo determinar el precio del producto:', product);
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: cartPrice,
        image: productImage,
        size: undefined,
        color: undefined,
        storeId: productStoreId,
        storeName: '' // Se obtiene dinámicamente desde useCartStores
      });
    }

    // Notificar éxito si se proporciona callback
    if (onSuccess) {
      onSuccess({ productName: product.name, quantity });
    }
  }, [product, addToCart]);

  const handleToggleFavorite = useCallback(() => {
    if (!product) return;

    // Extraer storeId del producto
    const productStoreId = product.storeId || product.store_id;

    const productData = {
      id: product.id,
      name: product.name,
      price: typeof product.price === 'number' ? product.price : 0,
      image: getPrimaryImage(product),
      size: undefined,
      color: undefined,
      storeId: productStoreId,
      storeName: '' // Se obtiene dinámicamente
    };

    if (isFavorite(product.id)) {
      removeFavorite({ id: product.id, name: product.name });
    } else {
      addFavorite(productData);
    }
  }, [product, isFavorite, addFavorite, removeFavorite]);

  return {
    // Data
    product,
    productSpecs,
    related,
    shippingOptions,
    paymentOptions,

    // Loading & Error states
    // Note: isLoading only reflects product fetching, not cart/favorite operations
    // This prevents the page from showing a full loading spinner during cart operations
    isLoading: isProductLoading,
    isAddingToCart: isAddToCartLoading,
    isFavoriteLoading: isFavoriteLoading,
    isError: isProductError,

    // UI States
    showSellerDesc,
    setShowSellerDesc,
    showProductDesc,
    setShowProductDesc,

    // Flags
    hasProductSpecs,
    hasDescription,
    hasRelatedProducts,
    hasShippingOptions,
    hasPaymentOptions,

    // Handlers
    handleAddToCart,
    handleToggleFavorite,
    isFavorite: (id: string) => isFavorite(id),

    // Utils
    stopAll,
  };
};

