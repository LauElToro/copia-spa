import { useCartStore, CartItem } from '../stores/cart-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook principal para el carrito
export const useCart = () => {
  const {
    items,
    isOpen,
    totalItems,
    subtotal,
    shipping,
    tax,
    total,
    sellerGroups,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    setShipping,
    setTax,
    getSellerGroups
  } = useCartStore();

  return {
    items,
    isOpen,
    totalItems,
    subtotal,
    shipping,
    tax,
    total,
    sellerGroups,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    setShipping,
    setTax,
    getSellerGroups
  };
};

// Hook para operaciones del carrito con TanStack Query
export const useCartOperations = () => {
  const queryClient = useQueryClient();
  const { addItem, removeItem, updateQuantity, clearCart } = useCartStore();

  // Mutación para agregar item al carrito
  const addItemMutation = useMutation({
    mutationFn: async (item: CartItem) => {
      // Aquí podrías hacer una llamada a la API si es necesario
      // Por ahora solo actualizamos el estado local
      return item;
    },
    onSuccess: (item) => {
      addItem(item);
      // Invalidar queries relacionadas si es necesario
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutación para remover item del carrito
  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      // Aquí podrías hacer una llamada a la API si es necesario
      return id;
    },
    onSuccess: (id) => {
      removeItem(id);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutación para actualizar cantidad
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      // Aquí podrías hacer una llamada a la API si es necesario
      return { id, quantity };
    },
    onSuccess: ({ id, quantity }) => {
      updateQuantity(id, quantity);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Mutación para limpiar carrito
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      // Aquí podrías hacer una llamada a la API si es necesario
      return true;
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    addItem: addItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    clearCart: clearCartMutation.mutateAsync,
    isLoading: addItemMutation.isPending || removeItemMutation.isPending || updateQuantityMutation.isPending || clearCartMutation.isPending,
    error: addItemMutation.error || removeItemMutation.error || updateQuantityMutation.error || clearCartMutation.error
  };
};

// Hook para sincronizar carrito con el servidor (opcional)
export const useCartSync = () => {
  const { items } = useCartStore();

  // Query para sincronizar el carrito con el servidor
  const { data: syncedCart, isLoading, error } = useQuery({
    queryKey: ['cart', 'sync'],
    queryFn: async () => {
      // Aquí implementarías la lógica para sincronizar con el servidor
      // Por ahora retornamos los items locales
      return items;
    },
    enabled: items.length > 0, // Solo ejecutar si hay items en el carrito
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // No reintentar si falla
  });

  return {
    syncedCart,
    isLoading,
    error
  };
};

// Hook para calcular envío gratuito
export const useFreeShipping = () => {
  const { subtotal } = useCartStore();
  
  const FREE_SHIPPING_THRESHOLD = 200; // $200 para envío gratuito
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const isFreeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
  
  return {
    remainingForFreeShipping,
    isFreeShippingEligible,
    FREE_SHIPPING_THRESHOLD
  };
};
