'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type LibiaPageContextType = 
  | { type: 'user' }
  | { type: 'seller' | 'panel'; storeId?: string }
  | { type: 'product'; storeId: string; productId: string };

interface LibiaPageContextValue {
  context: LibiaPageContextType;
  setProductContext: (storeId: string, productId: string) => void;
  clearProductContext: () => void;
}

const LibiaPageContext = createContext<LibiaPageContextValue | undefined>(undefined);

export function LibiaPageProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<LibiaPageContextType>({ type: 'user' });

  const setProductContext = useCallback((storeId: string, productId: string) => {
    setContext({ type: 'product', storeId, productId });
  }, []);

  const clearProductContext = useCallback(() => {
    setContext({ type: 'user' });
  }, []);

  return (
    <LibiaPageContext.Provider value={{ context, setProductContext, clearProductContext }}>
      {children}
    </LibiaPageContext.Provider>
  );
}

export function useLibiaPageContext() {
  return useContext(LibiaPageContext);
}
