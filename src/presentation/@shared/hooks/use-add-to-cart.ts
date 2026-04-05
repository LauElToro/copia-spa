import { useCartOperations } from './use-cart';
import { CartItem } from '../stores/cart-store';

export const useAddToCart = () => {
  const { addItem, isLoading, error } = useCartOperations();

  const addToCart = (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    size?: string;
    color?: string;
    storeId?: string;
    storeName?: string;
  }) => {
    const cartItem: CartItem = {
      ...product,
      quantity: 1,
    };

    addItem(cartItem);
  };

  return {
    addToCart,
    isLoading,
    error,
  };
};
