import { useFavoritesOperations } from './use-favorites';
import { FavoriteItem } from '../stores/favorites-store';

export const useAddToFavorites = () => {
  const { addFavorite, isLoading, error } = useFavoritesOperations();

  const addToFavorites = (product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    size?: string;
    color?: string;
    storeId?: string;
    storeName?: string;
    inStock?: number;
    hasVariants?: boolean;
  }) => {
    const favoriteItem: Omit<FavoriteItem, 'dateAdded'> = {
      ...product,
    };

    addFavorite(favoriteItem);
  };

  return {
    addToFavorites,
    isLoading,
    error,
  };
};
