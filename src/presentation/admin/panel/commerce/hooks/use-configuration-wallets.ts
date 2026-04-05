'use client';
import { useState, useCallback } from 'react';
import { useWallets } from '@/presentation/@shared/hooks/use-wallets';
import { useCurrencies } from '@/presentation/@shared/hooks/use-currencies';
import type { ToastContextType } from '@/presentation/@shared/components/ui/molecules/toast';

export const useConfigurationWallets = (toast?: ToastContextType) => {
  const { listQuery: walletsQuery, createMutation: createWallet, deleteMutation: deleteWallet } = useWallets();
  const { cryptoNetworks, getCurrenciesByNetwork } = useCurrencies();
  
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletError, setWalletError] = useState<string>('');

  const handleNetworkChange = useCallback((network: string) => {
    setSelectedNetwork(network);
    setSelectedCurrency('');
    setWalletAddress('');
    setWalletError('');
  }, []);

  const handleCurrencyChange = useCallback((currency: string) => {
    setSelectedCurrency(currency);
    setWalletAddress('');
    setWalletError('');
  }, []);

  const handleWalletAddressChange = useCallback((address: string) => {
    setWalletAddress(address);
    
    // Validar formato de wallet usando regexp de la moneda seleccionada
    if (selectedNetwork && selectedCurrency) {
      const currency = getCurrenciesByNetwork(selectedNetwork).find((c) => c.code === selectedCurrency);
      if (currency?.walletRegexp && address) {
        const regex = new RegExp(currency.walletRegexp);
        if (!regex.test(address)) {
          setWalletError('Formato de dirección inválido para esta moneda');
        } else {
          setWalletError('');
        }
      } else {
        setWalletError('');
      }
    } else {
      setWalletError('');
    }
  }, [selectedNetwork, selectedCurrency, getCurrenciesByNetwork]);

  const handleAddWallet = useCallback(async (accountId: string) => {
    if (!selectedNetwork || !selectedCurrency || !walletAddress.trim()) {
      setWalletError('Por favor complete todos los campos');
      return;
    }

    // Validar formato de wallet según la red
    const currency = getCurrenciesByNetwork(selectedNetwork).find(c => c.code === selectedCurrency);
    if (currency?.walletRegexp) {
      const regex = new RegExp(currency.walletRegexp);
      if (!regex.test(walletAddress.trim())) {
        setWalletError(`Dirección de wallet inválida para ${currency.name}`);
        return;
      }
    }

    setWalletError('');
    
    try {
      const walletData: Record<string, Record<string, { Img: string; Wallet?: string }>> = {};
      walletData[selectedNetwork] = {
        [selectedCurrency]: {
          Img: currency?.imageUrl || '',
          Wallet: walletAddress.trim(),
        },
      };

      await createWallet.mutateAsync({
        accountId,
        data: walletData,
      });

      toast?.success('Wallet agregada exitosamente');
      setSelectedNetwork('');
      setSelectedCurrency('');
      setWalletAddress('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al agregar wallet';
      setWalletError(errorMessage);
      toast?.error(errorMessage);
    }
  }, [selectedNetwork, selectedCurrency, walletAddress, getCurrenciesByNetwork, createWallet, toast]);

  const handleDeleteWallet = useCallback(async (walletId: string) => {
    console.log('[handleDeleteWallet] walletId recibido:', walletId);
    if (!walletId || walletId.trim() === '') {
      console.error('[handleDeleteWallet] ID de wallet inválido:', walletId);
      toast?.error('ID de wallet inválido');
      return;
    }
    try {
      const trimmedId = walletId.trim();
      console.log('[handleDeleteWallet] Eliminando wallet con ID:', trimmedId);
      await deleteWallet.mutateAsync(trimmedId);
      // Forzar refetch explícito para actualizar la tabla
      await walletsQuery.refetch();
      toast?.success('Wallet eliminada correctamente');
    } catch (error) {
      console.error('[handleDeleteWallet] Error al eliminar wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar wallet';
      toast?.error(errorMessage);
    }
  }, [deleteWallet, walletsQuery, toast]);

  return {
    walletsQuery,
    cryptoNetworks,
    getCurrenciesByNetwork,
    selectedNetwork,
    selectedCurrency,
    walletAddress,
    walletError,
    setSelectedNetwork: handleNetworkChange,
    setSelectedCurrency: handleCurrencyChange,
    setWalletAddress: handleWalletAddressChange,
    setWalletError,
    handleAddWallet,
    handleDeleteWallet,
  };
};

