import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CheckoutStoreData {
  storeId: string;
  storeName: string;
  shippingMethod: string | null;
  shippingId: string | null;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
  } | null;
  paymentMethod: string | null;
  paymentProvider: string | null;
  cryptoNetwork: string | null;
  cryptoId: string | null;
  txHash: string | null; // Hash de transacción para pagos crypto
  bankTransferReference: string | null; // Referencia del comprobante de transferencia bancaria
  mercadoPagoReference: string | null; // Referencia de MercadoPago para tarjetas
}

interface CheckoutState {
  currentStoreIndex: number;
  completedStores: CheckoutStoreData[];
  isProcessing: boolean;
  error: string | null;
}

interface CheckoutActions {
  setShippingMethod: (method: string) => void;
  setShippingId: (id: string) => void;
  setShippingAddress: (address: CheckoutStoreData['shippingAddress']) => void;
  setPaymentMethod: (method: string, provider: string) => void;
  setCryptoNetwork: (network: string, cryptoId: string) => void;
  setTxHash: (txHash: string) => void;
  setBankTransferReference: (reference: string) => void;
  setMercadoPagoReference: (reference: string) => void;
  moveToNextStore: (totalStores: number) => boolean;
  getCurrentStoreData: () => CheckoutStoreData | undefined;
  getCompletedStoreData: (storeId: string) => CheckoutStoreData | undefined;
  initializeStore: (storeId: string, storeName: string) => void;
  resetCheckout: () => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
}

type CheckoutStore = CheckoutState & CheckoutActions;

const initialState: CheckoutState = {
  currentStoreIndex: 0,
  completedStores: [],
  isProcessing: false,
  error: null,
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeStore: (storeId: string, storeName: string) => {
        set((state) => {
          // Check if this store already exists in completed stores
          const existingStore = state.completedStores.find(s => s.storeId === storeId);

          if (existingStore) {
            // Store already processed, don't initialize again
            return state;
          }

          // Check if we need to add a new store entry
          if (state.completedStores.length === state.currentStoreIndex) {
            return {
              completedStores: [
                ...state.completedStores,
                {
                  storeId,
                  storeName,
                  shippingMethod: null,
                  shippingId: null,
                  shippingAddress: null,
                  paymentMethod: null,
                  paymentProvider: null,
                  cryptoNetwork: null,
                  cryptoId: null,
                  txHash: null,
                  bankTransferReference: null,
                  mercadoPagoReference: null,
                }
              ]
            };
          }

          return state;
        });
      },

      setShippingMethod: (method: string) => {
        set((state) => {
          const updatedStores = [...state.completedStores];
          if (updatedStores[state.currentStoreIndex]) {
            updatedStores[state.currentStoreIndex] = {
              ...updatedStores[state.currentStoreIndex],
              shippingMethod: method,
            };
          }
          return { completedStores: updatedStores };
        });
      },

      setShippingId: (id: string) => {
        set((state) => {
          const updatedStores = [...state.completedStores];
          if (updatedStores[state.currentStoreIndex]) {
            updatedStores[state.currentStoreIndex] = {
              ...updatedStores[state.currentStoreIndex],
              shippingId: id,
            };
          }
          return { completedStores: updatedStores };
        });
      },

      setShippingAddress: (address) => {
        set((state) => {
          const updatedStores = [...state.completedStores];
          if (updatedStores[state.currentStoreIndex]) {
            updatedStores[state.currentStoreIndex] = {
              ...updatedStores[state.currentStoreIndex],
              shippingAddress: address,
            };
          }
          return { completedStores: updatedStores };
        });
      },

      setPaymentMethod: (method: string, provider: string) => {
        set((state) => {
          const updatedStores = [...state.completedStores];
          if (updatedStores[state.currentStoreIndex]) {
            updatedStores[state.currentStoreIndex] = {
              ...updatedStores[state.currentStoreIndex],
              paymentMethod: method,
              paymentProvider: provider,
            };
          }
          return { completedStores: updatedStores };
        });
      },

      setCryptoNetwork: (network: string, cryptoId: string) => {
        set((state) => {
          const updatedStores = [...state.completedStores];
          if (updatedStores[state.currentStoreIndex]) {
            updatedStores[state.currentStoreIndex] = {
              ...updatedStores[state.currentStoreIndex],
              cryptoNetwork: network,
              cryptoId: cryptoId,
            };
          }
          return { completedStores: updatedStores };
        });
      },

      setTxHash: (txHash: string) => {
        set((state) => {
          const updatedStores = [...state.completedStores];
          if (updatedStores[state.currentStoreIndex]) {
            updatedStores[state.currentStoreIndex] = {
              ...updatedStores[state.currentStoreIndex],
              txHash: txHash,
            };
          }
          return { completedStores: updatedStores };
        });
      },

      setBankTransferReference: (reference: string) => {
        set((state) => {
          const updatedStores = [...state.completedStores];
          if (updatedStores[state.currentStoreIndex]) {
            updatedStores[state.currentStoreIndex] = {
              ...updatedStores[state.currentStoreIndex],
              bankTransferReference: reference,
            };
          }
          return { completedStores: updatedStores };
        });
      },

      setMercadoPagoReference: (reference: string) => {
        set((state) => {
          const updatedStores = [...state.completedStores];
          if (updatedStores[state.currentStoreIndex]) {
            updatedStores[state.currentStoreIndex] = {
              ...updatedStores[state.currentStoreIndex],
              mercadoPagoReference: reference,
            };
          }
          return { completedStores: updatedStores };
        });
      },

      moveToNextStore: (totalStores: number) => {
        const state = get();
        const nextIndex = state.currentStoreIndex + 1;

        if (nextIndex < totalStores) {
          set({ currentStoreIndex: nextIndex });
          return true; // More stores to process
        }

        return false; // All stores processed
      },

      getCurrentStoreData: () => {
        const state = get();
        return state.completedStores[state.currentStoreIndex];
      },

      getCompletedStoreData: (storeId: string) => {
        const state = get();
        return state.completedStores.find(s => s.storeId === storeId);
      },

      resetCheckout: () => {
        set(initialState);
      },

      setProcessing: (processing: boolean) => {
        set({ isProcessing: processing });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'checkout-storage',
      partialize: (state) => ({
        currentStoreIndex: state.currentStoreIndex,
        completedStores: state.completedStores,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset processing and error states on rehydration
          state.isProcessing = false;
          state.error = null;
        }
      },
    }
  )
);

