import { useFavoritesStore, FavoriteItem } from '../stores/favorites-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../components/ui/molecules/toast';

// Hook principal para favoritos
export const useFavorites = () => {
  const {
    items,
    totalItems,
    addFavorite,
    removeFavorite,
    clearFavorites,
    isFavorite,
    getFavorite
  } = useFavoritesStore();

  return {
    items,
    totalItems,
    addFavorite,
    removeFavorite,
    clearFavorites,
    isFavorite,
    getFavorite
  };
};

// Hook para operaciones de favoritos con TanStack Query
export const useFavoritesOperations = () => {
  const queryClient = useQueryClient();
  const { addFavorite, removeFavorite, clearFavorites } = useFavoritesStore();
  const toast = useToast();

  // Mutación para agregar a favoritos
  const addFavoriteMutation = useMutation({
    mutationFn: async (item: Omit<FavoriteItem, 'dateAdded'>) => {
      // Aquí podrías hacer una llamada a la API si es necesario
      return item;
    },
    onSuccess: (item) => {
      addFavorite(item);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(`"${item.name}" agregado a favoritos exitosamente`, { duration: 3000, position: "bottom-center" });
    },
  });

  // Mutación para remover de favoritos
  const removeFavoriteMutation = useMutation({
    mutationFn: async (data: { id: string; name?: string }) => {
      // Aquí podrías hacer una llamada a la API si es necesario
      return data;
    },
    onSuccess: (data) => {
      removeFavorite(data.id);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      if (data.name) {
        toast.success(`"${data.name}" removido de favoritos`, { duration: 3000, position: "bottom-center" });
      }
    },
  });

  // Mutación para limpiar favoritos
  const clearFavoritesMutation = useMutation({
    mutationFn: async () => {
      // Aquí podrías hacer una llamada a la API si es necesario
      return true;
    },
    onSuccess: () => {
      clearFavorites();
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return {
    addFavorite: addFavoriteMutation.mutate,
    removeFavorite: removeFavoriteMutation.mutate,
    clearFavorites: clearFavoritesMutation.mutate,
    isLoading: addFavoriteMutation.isPending || removeFavoriteMutation.isPending || clearFavoritesMutation.isPending,
    error: addFavoriteMutation.error || removeFavoriteMutation.error || clearFavoritesMutation.error
  };
};

// Hook para sincronizar favoritos con el servidor (opcional)
export const useFavoritesSync = () => {
  const { items } = useFavoritesStore();

  const { data: syncedFavorites, isLoading, error } = useQuery({
    queryKey: ['favorites', 'sync'],
    queryFn: async () => {
      // Aquí implementarías la lógica para sincronizar con el servidor
      // Por ahora retornamos los items locales
      return items;
    },
    enabled: items.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    syncedFavorites,
    isLoading,
    error
  };
};

// Hook para toggle de favoritos
export const useToggleFavorite = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();

  const toggleFavorite = (item: Omit<FavoriteItem, 'dateAdded'>) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  return {
    toggleFavorite,
    isFavorite
  };
};
