"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useProducts } from "@/presentation/@shared/hooks/use-products";
import { ProductEntity } from "@/presentation/@shared/types/product";
import { useParams } from "next/navigation";

export enum ProductFetcherState {
  INITIAL,
  LOADING,
  SUCCESS,
  ERROR}

interface ProductFetcherContextType {
  product: ProductEntity | null;
  state: ProductFetcherState;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const ProductFetcherContext = createContext<
  ProductFetcherContextType | undefined
>(undefined);

export const ProductFetcherProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const params = useParams();
  const productId = params.id as string;
  const { useProductById } = useProducts();
  const productQuery = useProductById(productId);

  // Determinar el estado basado en el query
  const getState = useCallback((): ProductFetcherState => {
    if (productQuery.isLoading) return ProductFetcherState.LOADING;
    if (productQuery.isError) return ProductFetcherState.ERROR;
    if (productQuery.data) return ProductFetcherState.SUCCESS;
    return ProductFetcherState.INITIAL;
  }, [productQuery.isLoading, productQuery.isError, productQuery.data]);

  const contextValue = useMemo(() => ({
    product: productQuery.data || null,
    state: getState(),
    isLoading: productQuery.isLoading,
    isError: productQuery.isError,
    error: productQuery.error}), [productQuery.data, productQuery.isLoading, productQuery.isError, productQuery.error, getState]);

  return (
    <ProductFetcherContext.Provider value={contextValue}>
      {children}
    </ProductFetcherContext.Provider>
  );
};

export function useProductFetcher() {
  const context = useContext(ProductFetcherContext);
  if (context === undefined) {
    throw new Error(
      "useProductFetcher debe ser usado dentro de un ProductFetcherProvider",
    );
  }
  return context;
}

export default ProductFetcherContext;
