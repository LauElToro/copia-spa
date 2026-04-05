'use client';

import React, { ReactNode } from 'react';
import { useCartStore } from '../stores/cart-store';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Inicializar el store del carrito
  useCartStore();

  return <>{children}</>;
};
