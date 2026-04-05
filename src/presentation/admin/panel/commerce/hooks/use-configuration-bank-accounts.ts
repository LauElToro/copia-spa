'use client';
import { useState, useCallback, useMemo } from 'react';
import { useBankAccounts } from '@/presentation/@shared/hooks/use-bank-accounts';
import { useBanks } from '@/presentation/@shared/hooks/use-banks';
import { useConfiguration } from '@/presentation/@shared/hooks/use-configuration';
import type { ToastContextType } from '@/presentation/@shared/components/ui/molecules/toast';

/**
 * Valida el formato de CBU/CVU
 * CBU y CVU tienen 22 dígitos numéricos
 */
const validateCbuCvu = (value: string): boolean => {
  // Eliminar espacios y guiones
  const cleaned = value.replace(/\s|-/g, '');
  // Debe tener exactamente 22 dígitos numéricos
  return /^\d{22}$/.test(cleaned);
};

export const useConfigurationBankAccounts = (toast?: ToastContextType) => {
  const { storeQuery } = useConfiguration();
  // Asegurar que storeId sea siempre un string válido o undefined
  const storeId = useMemo(() => {
    const id = storeQuery.data?.id;
    if (!id) return undefined;
    // Convertir a string si es un número
    const idString = typeof id === 'string' ? id : String(id);
    // Validar que no sea 'null' o 'undefined' como string
    if (idString === 'null' || idString === 'undefined' || idString.trim() === '') {
      return undefined;
    }
    return idString;
  }, [storeQuery.data?.id]);
  const { listQuery: banksQuery } = useBanks();
  const { listQuery: bankAccountsQuery, createMutation, deleteMutation } = useBankAccounts(storeId);

  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [cbuCvu, setCbuCvu] = useState<string>('');
  const [cbuCvuError, setCbuCvuError] = useState<string>('');
  const [alias, setAlias] = useState<string>('');
  const [aliasError, setAliasError] = useState<string>('');
  const [accountHolderFirstName, setAccountHolderFirstName] = useState<string>('');
  const [accountHolderFirstNameError, setAccountHolderFirstNameError] = useState<string>('');
  const [accountHolderLastName, setAccountHolderLastName] = useState<string>('');
  const [accountHolderLastNameError, setAccountHolderLastNameError] = useState<string>('');
  const [currency, setCurrency] = useState<string>('ARS');

  const handleBankChange = useCallback((bankId: string) => {
    setSelectedBankId(bankId);
    setCbuCvu('');
    setCbuCvuError('');
    setAlias('');
    setAliasError('');
    setAccountHolderFirstName('');
    setAccountHolderFirstNameError('');
    setAccountHolderLastName('');
    setAccountHolderLastNameError('');
    setCurrency('ARS');
  }, []);

  const handleCbuCvuChange = useCallback((value: string) => {
    // Permitir solo números, espacios y guiones para formato
    const cleaned = value.replace(/[^\d\s-]/g, '');
    setCbuCvu(cleaned);

    if (cleaned.trim() === '') {
      setCbuCvuError('');
      return;
    }

    // Validar formato
    if (!validateCbuCvu(cleaned)) {
      setCbuCvuError('El CBU/CVU debe tener 22 dígitos numéricos');
    } else {
      setCbuCvuError('');
    }
  }, []);

  const handleAliasChange = useCallback((value: string) => {
    // Permitir letras, números, puntos y guiones para alias
    const cleaned = value.replace(/[^a-zA-Z0-9.\-]/g, '');
    setAlias(cleaned);
    setAliasError('');
  }, []);

  const handleAccountHolderFirstNameChange = useCallback((value: string) => {
    // Permitir letras, espacios y algunos caracteres especiales comunes en nombres
    const cleaned = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ' -]/g, '');
    setAccountHolderFirstName(cleaned);
    setAccountHolderFirstNameError('');
  }, []);

  const handleAccountHolderLastNameChange = useCallback((value: string) => {
    // Permitir letras, espacios y algunos caracteres especiales comunes en nombres
    const cleaned = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ' -]/g, '');
    setAccountHolderLastName(cleaned);
    setAccountHolderLastNameError('');
  }, []);

  const handleAddBankAccount = useCallback(async () => {
    if (!storeId || (typeof storeId !== 'string' && typeof storeId !== 'number')) {
      toast?.error('No se encontró la tienda');
      return;
    }

    // Validar que se haya seleccionado un banco
    if (!selectedBankId) {
      toast?.error('Por favor seleccione un banco');
      return;
    }

    // Validar que se haya ingresado CBU/CVU o alias (al menos uno)
    const hasCbuCvu = cbuCvu.trim() !== '';
    const hasAlias = alias.trim() !== '';

    if (!hasCbuCvu && !hasAlias) {
      setCbuCvuError('Debe ingresar CBU/CVU o Alias');
      setAliasError('Debe ingresar CBU/CVU o Alias');
      return;
    }

    // Si se ingresó CBU/CVU, validar formato
    if (hasCbuCvu && !validateCbuCvu(cbuCvu.trim())) {
      setCbuCvuError('El CBU/CVU debe tener 22 dígitos numéricos');
      return;
    }

    // Validar nombre y apellido del titular
    if (!accountHolderFirstName.trim()) {
      setAccountHolderFirstNameError('El nombre del titular es obligatorio');
      return;
    }
    if (!accountHolderLastName.trim()) {
      setAccountHolderLastNameError('El apellido del titular es obligatorio');
      return;
    }

    // Obtener el banco seleccionado
    const banks = banksQuery.data || [];
    const selectedBank = banks.find((b) => b.id === selectedBankId);

    if (!selectedBank) {
      toast?.error('Banco seleccionado no válido');
      return;
    }

    setCbuCvuError('');
    setAliasError('');
    setAccountHolderFirstNameError('');
    setAccountHolderLastNameError('');

    try {
      // Limpiar el CBU/CVU (solo números) si existe
      const cleanedCbuCvu = hasCbuCvu ? cbuCvu.replace(/\s|-/g, '') : undefined;
      const cleanedAlias = hasAlias ? alias.trim() : undefined;
      const fullName = `${accountHolderFirstName.trim()} ${accountHolderLastName.trim()}`.trim();

      // Preparar el payload - el storeId se pasa como parámetro en la URL, no en el body
      const payload: {
        bankName: string;
        accountHolderName: string;
        currency: string;
        country: string;
        isDefault: boolean;
        cbu?: string;
        alias?: string;
      } = {
        bankName: selectedBank.bcra.name,
        accountHolderName: fullName,
        currency: currency,
        country: 'AR',
        isDefault: false,
      };

      // Solo agregar cbu o alias si tienen valor (no enviar undefined)
      if (cleanedCbuCvu) {
        payload.cbu = cleanedCbuCvu;
      }
      if (cleanedAlias) {
        payload.alias = cleanedAlias;
      }

      // Asegurar que storeId sea un string válido
      const storeIdString = typeof storeId === 'string' ? storeId : String(storeId);

      if (!storeIdString || storeIdString === 'null' || storeIdString === 'undefined') {
        toast?.error('ID de tienda inválido');
        return;
      }

      await createMutation.mutateAsync({
        storeId: storeIdString,
        ...payload,
      });

      toast?.success('Cuenta bancaria agregada exitosamente');
      setSelectedBankId('');
      setCbuCvu('');
      setAlias('');
      setAccountHolderFirstName('');
      setAccountHolderLastName('');
      setCurrency('ARS');
    } catch (error) {
      // Extraer mensaje de error de la respuesta del backend
      let errorMessage = 'Error al agregar cuenta bancaria';

      if (error && typeof error === 'object') {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string | string[];
              errors?: Array<{ message?: string; field?: string }>;
            }
          };
          message?: string;
        };

        // Intentar obtener el mensaje del backend
        const responseMessage = axiosError?.response?.data?.message;
        if (responseMessage) {
          // Si es un array, tomar el primer mensaje
          errorMessage = Array.isArray(responseMessage)
            ? responseMessage[0]
            : responseMessage;
        } else if (axiosError?.response?.data?.errors && Array.isArray(axiosError.response.data.errors) && axiosError.response.data.errors.length > 0) {
          // Si hay errores estructurados, usar el primer error
          errorMessage = axiosError.response.data.errors[0].message || errorMessage;
        } else if (axiosError?.message) {
          errorMessage = axiosError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Limpiar errores previos
      setCbuCvuError('');
      setAliasError('');
      setAccountHolderFirstNameError('');
      setAccountHolderLastNameError('');

      // Si el error menciona CBU o alias, mostrar solo en ese campo
      const errorLower = errorMessage.toLowerCase();
      if (errorLower.includes('cbu')) {
        setCbuCvuError(errorMessage);
      } else if (errorLower.includes('alias')) {
        setAliasError(errorMessage);
      } else {
        // Si no es específico, mostrar en todos los campos
        setCbuCvuError(errorMessage);
        setAliasError(errorMessage);
        setAccountHolderFirstNameError(errorMessage);
        setAccountHolderLastNameError(errorMessage);
      }

      toast?.error(errorMessage);
    }
  }, [storeId, selectedBankId, cbuCvu, alias, accountHolderFirstName, accountHolderLastName, currency, banksQuery.data, createMutation, toast]);

  const handleDeleteBankAccount = useCallback(async (bankAccountId: string) => {
    if (!storeId) {
      toast?.error('No se encontró la tienda');
      return;
    }

    try {
      await deleteMutation.mutateAsync(bankAccountId);
      await bankAccountsQuery.refetch();
      toast?.success('Cuenta bancaria eliminada correctamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar cuenta bancaria';
      toast?.error(errorMessage);
    }
  }, [storeId, deleteMutation, bankAccountsQuery, toast]);

  return {
    storeId,
    banksQuery,
    bankAccountsQuery,
    createMutation,
    selectedBankId,
    cbuCvu,
    cbuCvuError,
    alias,
    aliasError,
    accountHolderFirstName,
    accountHolderFirstNameError,
    accountHolderLastName,
    accountHolderLastNameError,
    currency,
    setSelectedBankId: handleBankChange,
    setCbuCvu: handleCbuCvuChange,
    setCbuCvuError,
    setAlias: handleAliasChange,
    setAliasError,
    setAccountHolderFirstName: handleAccountHolderFirstNameChange,
    setAccountHolderFirstNameError,
    setAccountHolderLastName: handleAccountHolderLastNameChange,
    setAccountHolderLastNameError,
    setCurrency,
    handleAddBankAccount,
    handleDeleteBankAccount,
  };
};

