import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosHelper } from '../helpers/axios-helper';

export interface CreateBankAccountPayload {
  storeId: string;
  bankName: string;
  accountHolderName: string;
  alias?: string;
  cbu?: string;
  accountNumber?: string;
  iban?: string;
  currency: string;
  country: string;
  isDefault?: boolean;
}

interface BankAccount extends Omit<CreateBankAccountPayload, 'storeId'> {
  id: string;
}

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
}

export function useBankAccounts(storeId?: string) {
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['stores', storeId, 'bank-accounts'],
    queryFn: async () => {
      if (!storeId) return [] as BankAccount[];
      const res = await axiosHelper.stores.bankAccounts.list(storeId);
      const response = res.data as ApiResponse<BankAccount[]> | BankAccount[];
      return (response as ApiResponse<BankAccount[]>)?.data ?? (response as BankAccount[]) ?? [];
    },
    enabled: !!storeId,
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateBankAccountPayload) => {
      // Extraer storeId del payload y crear el body sin storeId (va en la URL)
      const { storeId, ...body } = payload;
      
      // Validar que storeId sea un string válido
      if (!storeId || typeof storeId !== 'string' || storeId.trim() === '') {
        throw new Error('storeId must be a valid string');
      }
      
      const validatedStoreId = storeId.trim();
      const res = await axiosHelper.stores.bankAccounts.create(validatedStoreId, body as unknown as Record<string, unknown>);
      const response = res.data as ApiResponse<BankAccount> | BankAccount;
      return (response as ApiResponse<BankAccount>)?.data ?? (response as BankAccount);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['stores', storeId, 'bank-accounts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<CreateBankAccountPayload> }) => {
      if (!storeId) throw new Error('storeId is required');
      const res = await axiosHelper.stores.bankAccounts.update(storeId, params.id, params.data as unknown as Record<string, unknown>);
      const response = res.data as ApiResponse<BankAccount> | BankAccount;
      return (response as ApiResponse<BankAccount>)?.data ?? (response as BankAccount);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['stores', storeId, 'bank-accounts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!storeId) throw new Error('storeId is required');
      return axiosHelper.stores.bankAccounts.remove(storeId, id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['stores', storeId, 'bank-accounts'] });
    },
  });

  return { listQuery, createMutation, updateMutation, deleteMutation };
}
