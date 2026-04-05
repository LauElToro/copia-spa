'use client';
import { useQuery } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';

export interface Currency {
  id?: string;
  code: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  usdPerUnit: number;
  isBase?: boolean;
  type?: 'FIAT' | 'CRYPTO';
  network?: string;
  walletRegexp?: string;
  lastUpdated?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
}

export function useCurrencies() {
  const currenciesQuery = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      try {
        const res = await axiosHelper.currencies.getAll();
        // El interceptor de ms-payments puede devolver los datos directamente o envueltos
        const response = res.data;
        
        // Si viene envuelto en un objeto con 'data'
        if (response && typeof response === 'object' && 'data' in response) {
          const apiResponse = response as ApiResponse<Currency[]>;
          return apiResponse.data ?? [];
        }
        
        // Si viene como array directo
        if (Array.isArray(response)) {
          return response as Currency[];
        }
        
        // Si viene envuelto en otro formato (items, etc.)
        if (response && typeof response === 'object' && 'items' in response) {
          const paginatedResponse = response as { items: Currency[] };
          return paginatedResponse.items ?? [];
        }
        
        return [];
      } catch (error) {
        console.error('[useCurrencies] Error fetching currencies:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1,
  });

  // Helper para obtener solo monedas cripto
  const cryptoCurrencies = currenciesQuery.data?.filter((c) => c.type === 'CRYPTO') ?? [];

  // Helper para obtener redes únicas de monedas cripto
  const cryptoNetworks = Array.from(
    new Set(cryptoCurrencies.map((c) => c.network).filter((n): n is string => !!n))
  ).sort();

  // Helper para obtener monedas por red
  const getCurrenciesByNetwork = (network: string): Currency[] => {
    return cryptoCurrencies.filter((c) => c.network === network);
  };

  return {
    currenciesQuery,
    currencies: currenciesQuery.data ?? [],
    cryptoCurrencies,
    cryptoNetworks,
    getCurrenciesByNetwork,
  };
}

