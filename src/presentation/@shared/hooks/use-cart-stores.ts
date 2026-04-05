import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useCart } from './use-cart';
import { axiosHelper } from '../helpers/axios-helper';
import { mockStores } from '@/presentation/stores/pages/store-page';

// Array vacío constante para evitar recreaciones
const EMPTY_QUERIES_ARRAY: never[] = [];

/**
 * Enriched store data with full details
 */
export interface StoreAddress {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

export interface EnrichedStore {
    id: string;
    name: string;
    imageUrl?: string;
    rating?: number;
    totalReviews?: number;
    verified?: boolean;
    kyc?: boolean;
    kyb?: boolean;
    location?: string;
    address?: StoreAddress;
    phone?: string;
    email?: string;
    // Cart-specific data
    itemCount: number;
    subtotal: number;
}

/**
 * Store data from ms-stores API
 */
interface StoreApiResponse {
    id: string;
    name: string;
    description?: string;
    media?: {
        logo?: {
            smUrl?: string;
            url?: string;
            variants?: {
                sm?: { url?: string };
                md?: { url?: string };
                lg?: { url?: string };
            };
        };
    };
    information?: {
        logo?: string;
        location?: {
            address?: string;
            city?: string;
            state?: string;
            country?: string;
            postalCode?: string;
            postal_code?: string;
        };
    };
    rating?: number;
    totalReviews?: number;
    verified?: boolean;
    kyc?: boolean;
    kyb?: boolean;
    location?: string;
    phone?: string;
    email?: string;
}

export const useCartStores = () => {
    const { sellerGroups } = useCart();

    // Estabilizar sellerGroups para evitar cambios de referencia innecesarios
    const stableSellerGroups = useMemo(() => {
        if (!sellerGroups || sellerGroups.length === 0) {
            return [];
        }
        return sellerGroups;
    }, [sellerGroups]);

    const storeIds = useMemo(() => {
        if (stableSellerGroups.length === 0) {
            return [];
        }
        return stableSellerGroups.map(group => group.storeId).filter(id => id && id !== 'unknown');
    }, [stableSellerGroups]);

    // Crear queries de forma estable - usar la clave estable en lugar de storeIds
    const queries = useMemo(() => {
        // Si no hay storeIds, retornar array vacío constante
        if (storeIds.length === 0) {
            return EMPTY_QUERIES_ARRAY;
        }
        
        return storeIds.map((storeId) => ({
            queryKey: ['store', storeId] as const,
            queryFn: async (): Promise<StoreApiResponse | null> => {
                try {
                    // Usar endpoint público para evitar errores de autenticación
                    const response = await axiosHelper.stores.getPublic(storeId);
                    const data = response.data?.data || response.data;
                    return data;
                } catch (error) {
                    console.error('Error fetching store:', error);
                    const mockStore = mockStores[storeId as keyof typeof mockStores];
                    if (mockStore) {
                        // Mapear mockStore a la estructura correcta del backend
                        const logoUrl = mockStore.profileImage || mockStore.imageUrl;
                        return {
                            id: mockStore.id,
                            name: mockStore.name,
                            media: logoUrl ? {
                                logo: {
                                    variants: {
                                        sm: { url: logoUrl },
                                        md: { url: logoUrl },
                                        lg: { url: logoUrl },
                                    },
                                },
                            } : undefined,
                            rating: mockStore.rating,
                            totalReviews: mockStore.totalReviews,
                            verified: mockStore.verified,
                            kyc: mockStore.kyc,
                            kyb: mockStore.kyb,
                            location: mockStore.location,
                            phone: mockStore.phone,
                            email: mockStore.email,
                        };
                    }
                    return null;
                }
            },
            enabled: !!storeId,
            staleTime: 5 * 60 * 1000,
            retry: 1,
        }));
    }, [storeIds]);

    // useQueries siempre debe ser llamado de forma incondicional
    // React Query v5 maneja arrays dinámicos internamente
    // Usar una clave estable basada en la longitud para ayudar a React Query
    const storeQueries = useQueries({
        queries,
        // Asegurar que la referencia del objeto sea estable
    });

    const isLoading = storeQueries.some(query => query.isLoading);

    const stores = useMemo<EnrichedStore[]>(() => {
        if (!stableSellerGroups || stableSellerGroups.length === 0) {
            return [];
        }

        return stableSellerGroups.map((group) => {
            const storeIndex = storeIds.indexOf(group.storeId);
            const storeData = storeIndex >= 0 ? storeQueries[storeIndex]?.data : null;

            if (storeData) {
                // Función helper para extraer URL del logo
                const getLogoUrl = (): string | undefined => {
                    // Intentar desde media.logo (estructura nueva)
                    if (storeData.media?.logo) {
                        const logo = storeData.media.logo;
                        // Estructura nueva: media.logo.variants.sm.url
                        if (logo.variants) {
                            if (logo.variants.sm?.url) return logo.variants.sm.url;
                            if (logo.variants.md?.url) return logo.variants.md.url;
                            if (logo.variants.lg?.url) return logo.variants.lg.url;
                        }
                        // Estructura antigua: media.logo.smUrl
                        if (logo.smUrl) return logo.smUrl;
                        if (logo.url) return logo.url;
                    }
                    
                    // Intentar desde information.logo (compatibilidad hacia atrás)
                    if (storeData.information?.logo) {
                        return storeData.information.logo;
                    }
                    
                    return undefined;
                };

                // Extraer información de dirección
                const locationData = storeData.information?.location;
                const address: StoreAddress | undefined = locationData ? {
                    address: locationData.address,
                    city: locationData.city,
                    state: locationData.state,
                    country: locationData.country,
                    postalCode: locationData.postalCode || locationData.postal_code,
                } : undefined;

                return {
                    id: group.storeId,
                    name: storeData.name || group.storeName,
                    imageUrl: getLogoUrl(),
                    rating: storeData.rating,
                    totalReviews: storeData.totalReviews,
                    verified: storeData.verified,
                    kyc: storeData.kyc,
                    kyb: storeData.kyb,
                    location: storeData.location,
                    address,
                    phone: storeData.phone,
                    email: storeData.email,
                    itemCount: group.items.length,
                    subtotal: group.subtotal,
                };
            }

            return {
                id: group.storeId,
                name: group.storeName,
                imageUrl: '/images/store-placeholder.png',
                rating: 0,
                totalReviews: 0,
                verified: false,
                kyc: false,
                kyb: false,
                itemCount: group.items.length,
                subtotal: group.subtotal,
            };
        });
    }, [stableSellerGroups, storeQueries, storeIds]);

    return {
        stores,
        isLoading,
        isEmpty: stores.length === 0,
    };
};

/**
 * Hook to get a single store's enriched data by ID
 * Useful for store detail pages or individual store displays
 */
export const useStoreById = (storeId: string) => {
    const { stores } = useCartStores();

    const store = useMemo(() => {
        return stores.find(s => s.id === storeId);
    }, [stores, storeId]);

    return {
        store,
        isLoading: false,
        notFound: !store,
    };
};

