import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size?: string;
  color?: string;
  storeId?: string;
  storeName?: string;
  dateAdded: Date;
  inStock?: number;
  hasVariants?: boolean;
}

interface FavoritesState {
  items: FavoriteItem[];
  totalItems: number;
}

interface FavoritesActions {
  addFavorite: (item: Omit<FavoriteItem, 'dateAdded'>) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (id: string) => boolean;
  getFavorite: (id: string) => FavoriteItem | undefined;
}

type FavoritesStore = FavoritesState & FavoritesActions;

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,

      addFavorite: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(item => 
            item.id === newItem.id && 
            item.size === newItem.size && 
            item.color === newItem.color
          );

          if (existingItem) {
            return state; // Ya existe, no hacer nada
          }

          const favoriteItem: FavoriteItem = {
            ...newItem,
            dateAdded: new Date()
          };

          const newItems = [...state.items, favoriteItem];
          
          return {
            items: newItems,
            totalItems: newItems.length
          };
        });
      },

      removeFavorite: (id: string) => {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== id);
          
          return {
            items: newItems,
            totalItems: newItems.length
          };
        });
      },

      clearFavorites: () => {
        set({
          items: [],
          totalItems: 0
        });
      },

      isFavorite: (id: string) => {
        const state = get();
        return state.items.some(item => item.id === id);
      },

      getFavorite: (id: string) => {
        const state = get();
        return state.items.find(item => item.id === id);
      }
    }),
    {
      name: 'favorites-storage',
      partialize: (state) => ({ 
        items: state.items,
        totalItems: state.totalItems
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Asegurar que totalItems nunca sea negativo
          if (state.totalItems < 0) {
            state.totalItems = state.items.length;
          }
        }
      },
    }
  )
);
