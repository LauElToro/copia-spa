import { useQuery } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';

export interface Bank {
  id: string;
  bcra: {
    entityCode: number;
    name: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'HIDDEN';
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
}

export function useBanks() {
  const listQuery = useQuery({
    queryKey: ['banks'],
    queryFn: async () => {
      const res = await axiosHelper.banks.getAll();
      const response = res.data as ApiResponse<Bank[]> | Bank[];
      const allBanks = (response as ApiResponse<Bank[]>)?.data ?? (response as Bank[]) ?? [];
      // Filtrar solo bancos activos y no eliminados
      return allBanks.filter(
        (bank: Bank) => bank.status === 'ACTIVE' && !bank.deletedAt
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  return { listQuery };
}











