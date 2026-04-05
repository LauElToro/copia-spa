"use client";

import { useEffect, useMemo, useState } from "react";
import { useStoresList, defaultStoresPagination, type StoreProfile } from "@/presentation/@shared/hooks/use-store";
import { type GridStore } from "../components/stores-grid/stores-grid";

const STORES_PAGE_SIZE = 12;
const BANNER_FALLBACK = "/images/landing/landing-banner1.png";
const LOGO_FALLBACK = "/images/icons/avatar.png";

const mapStoreProfileToGrid = (store: StoreProfile): GridStore => ({
  id: store.id,
  name: store.name,
  description: store.description,
  imageUrl: store.bannerUrl ?? BANNER_FALLBACK,
  profileImage: store.logoUrl ?? LOGO_FALLBACK,
  rating: store.rating,
  location: store.location,
  phone: store.phone,
  plan: store.plan,
  kybVerified: store.kybVerified,
  kycVerified: store.kycVerified,
});

export const useStoresPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // Fetch recommended stores (first 4 stores, no search, no pagination)
  const { stores: recommendedStores } = useStoresList({
    page: 1,
    limit: 4,
    isActive: true,
  });

  // Fetch stores data
  const { stores, pagination, isLoading, isFetching } = useStoresList({
    search: searchTerm,
    page,
    limit: STORES_PAGE_SIZE,
    isActive: true,
  });

  // Validar página cuando cambia el total de páginas
  useEffect(() => {
    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value.trim());
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  // Valores derivados
  const gridStores = useMemo(() => stores.map(mapStoreProfileToGrid), [stores]);
  const recommendedGridStores = useMemo(() => recommendedStores.map(mapStoreProfileToGrid), [recommendedStores]);
  const effectivePagination = pagination.total > 0 ? pagination : defaultStoresPagination;
  const showingFrom = gridStores.length > 0 ? (effectivePagination.page - 1) * effectivePagination.limit + 1 : 0;
  const showingTo = gridStores.length > 0 ? showingFrom + gridStores.length - 1 : 0;
  const isInitialLoading = isLoading && gridStores.length === 0;

  return {
    // Data
    gridStores,
    recommendedGridStores,
    effectivePagination,
    showingFrom,
    showingTo,
    
    // State
    searchTerm,
    page,
    isLoading,
    isFetching,
    isInitialLoading,
    
    // Handlers
    handleSearchChange,
    handlePageChange,
  };
};

