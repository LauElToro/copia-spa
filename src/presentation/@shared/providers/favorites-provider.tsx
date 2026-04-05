'use client';

import React, { ReactNode } from 'react';
import { useFavoritesStore } from '../stores/favorites-store';

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  // Inicializar el store de favoritos
  useFavoritesStore();

  return <>{children}</>;
};
