import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  storeId?: string;
  storeName?: string;
}

export interface SellerGroup {
  storeId: string;
  storeName: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  sellerGroups: SellerGroup[];
}

interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setShipping: (shipping: number) => void;
  setTax: (tax: number) => void;
  getSellerGroups: () => SellerGroup[];
}

type CartStore = CartState & CartActions;

const calculateTotals = (items: CartItem[], shipping: number, tax: number) => {
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = subtotal + shipping + tax;

  return {
    subtotal,
    total,
    totalItems: items.reduce((total, item) => total + item.quantity, 0)
  };
};

const groupItemsBySeller = (items: CartItem[]): SellerGroup[] => {
  const groups: { [key: string]: SellerGroup } = {};

  for (const item of items) {
    const storeId = item.storeId || 'unknown';
    // Solo usar 'Vendedor Desconocido' si storeName es undefined o null, no si es string vacío
    // Esto permite que useCartStores pueda obtener el nombre desde la API
    const storeName = (item.storeName && item.storeName.trim() !== '')
      ? item.storeName
      : 'Vendedor Desconocido';

    if (!groups[storeId]) {
      groups[storeId] = {
        storeId,
        storeName,
        items: [],
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0
      };
    }

    groups[storeId].items.push(item);
  }

  // Calcular totales por vendedor
  // Note: shipping and tax are NOT calculated here - they should be determined
  // by the checkout flow based on selected shipping method and actual tax rules
  for (const group of Object.values(groups)) {
    const { subtotal } = calculateTotals(group.items, 0, 0);

    group.subtotal = subtotal;
    group.shipping = 0; // Determined by checkout flow
    group.tax = 0; // Determined by checkout flow
    group.total = subtotal; // Just subtotal until shipping/payment step
  }

  return Object.values(groups);
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      totalItems: 0,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      sellerGroups: [],

      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(item =>
            item.id === newItem.id &&
            item.size === newItem.size &&
            item.color === newItem.color
          );

          let newItems: CartItem[];

          if (existingItemIndex >= 0) {
            newItems = state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            );
          } else {
            newItems = [...state.items, newItem];
          }

          const { subtotal, total, totalItems } = calculateTotals(newItems, state.shipping, state.tax);
          const sellerGroups = groupItemsBySeller(newItems);

          return {
            items: newItems,
            subtotal,
            total,
            totalItems,
            sellerGroups
          };
        });
      },

      removeItem: (id: string) => {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== id);
          const { subtotal, total, totalItems } = calculateTotals(newItems, state.shipping, state.tax);
          const sellerGroups = groupItemsBySeller(newItems);

          return {
            items: newItems,
            subtotal,
            total,
            totalItems,
            sellerGroups
          };
        });
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => {
          const newItems = state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          );

          const { subtotal, total, totalItems } = calculateTotals(newItems, state.shipping, state.tax);
          const sellerGroups = groupItemsBySeller(newItems);

          return {
            items: newItems,
            subtotal,
            total,
            totalItems,
            sellerGroups
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          total: 0,
          totalItems: 0,
          sellerGroups: []
        });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setShipping: (shipping: number) => {
        set((state) => {
          const { total } = calculateTotals(state.items, shipping, state.tax);
          return { shipping, total };
        });
      },

      setTax: (tax: number) => {
        set((state) => {
          const { total } = calculateTotals(state.items, state.shipping, tax);
          return { tax, total };
        });
      },

      getSellerGroups: () => {
        const state = get();
        return groupItemsBySeller(state.items);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        shipping: state.shipping,
        tax: state.tax,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
        total: state.total
      }),
      onRehydrateStorage: () => (state) => {
        // Recalcular totales cuando se rehidrata desde localStorage
        if (state && state.items.length > 0) {
          const { subtotal, total, totalItems } = calculateTotals(state.items, state.shipping, state.tax);
          const sellerGroups = groupItemsBySeller(state.items);
          state.subtotal = subtotal;
          state.total = total;
          state.totalItems = totalItems;
          state.sellerGroups = sellerGroups;
        }
      },
    }
  )
);
