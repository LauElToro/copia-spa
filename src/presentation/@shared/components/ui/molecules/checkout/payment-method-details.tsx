'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Grid, CircularProgress, Link, IconButton } from '@mui/material';
import { CheckCircle, Payment as PaymentIcon, CurrencyBitcoin as CryptoIcon, ContentCopy, AccountBalance, Payments as CashIcon, QrCode as QrIcon } from '@mui/icons-material';
import { useIntegrations } from '@/presentation/@shared/hooks/use-integrations';
import { useCurrencies } from '@/presentation/@shared/hooks/use-currencies';
import { useCryptoValidation } from '@/presentation/@shared/hooks/use-crypto-validation';
import { useCheckoutStore } from '@/presentation/@shared/stores/checkout-store';
import { DropdownButton } from '@/presentation/@shared/components/ui/molecules/dropdown-button';
import axiosHelper from '@/presentation/@shared/helpers/axios-helper';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { Image } from '@/presentation/@shared/components/ui/atoms/image';
import { TransactionHashInput } from './transaction-hash-input';

interface PaymentMethodDetailsProps {
  storeId: string;
  paymentMethod: string;
  onUploadFile?: (uploadFn: () => Promise<void>) => void;
}

interface BankAccount {
  id: string;
  bankName: string;
  cbu?: string | null;
  alias?: string | null;
  accountHolderName?: string;
  currency?: string;
}

export const PaymentMethodDetails: React.FC<PaymentMethodDetailsProps> = ({
  storeId,
  paymentMethod,
  onUploadFile,
}) => {
  // Usar el hook de integraciones existente
  const { integrationsQuery } = useIntegrations(storeId);
  const integrations = integrationsQuery.data;
  const { setCryptoNetwork, getCurrentStoreData, setTxHash: setStoreTxHash, setBankTransferReference, setMercadoPagoReference } = useCheckoutStore();
  const { cryptoCurrencies } = useCurrencies();
  const { useSupportedNetworks } = useCryptoValidation();
  const { data: supportedNetworksData, isLoading: isLoadingSupportedNetworks } = useSupportedNetworks();
  const supportedNetworks = useMemo(() => supportedNetworksData?.networks || [], [supportedNetworksData?.networks]);
  const toast = useToast();

  // Obtener datos de la tienda para conseguir el accountId
  const storeQuery = useQuery({
    queryKey: ['store', storeId, 'public'],
    queryFn: async () => {
      if (!storeId) return null;
      try {
        const response = await axiosHelper.stores.getPublic(storeId);
        const data = response.data?.data || response.data;
        return data;
      } catch (error) {
        console.error('[PaymentMethodDetails] Error fetching store:', error);
        return null;
      }
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  const storeData = storeQuery.data;
  const storeAccountId = storeData?.accountId || storeData?.user_id || storeData?.userId;

  // Obtener wallets del account de la tienda desde ms-wallets
  const walletsQuery = useQuery({
    queryKey: ['wallets', 'account', storeAccountId],
    queryFn: async () => {
      if (!storeAccountId) return [];
      try {
        const response = await axiosHelper.wallets.getAll();
        const responseData = response.data;
        // La respuesta puede venir como { data: [...] } o directamente como array
        const allWallets = (responseData as { data?: unknown[] })?.data ?? (responseData as unknown[]) ?? [];
        // Filtrar wallets por accountId de la tienda
        const storeWallets = (allWallets as Array<{ accountId: string; data: Record<string, Record<string, { Img: string; Wallet?: string }>> }>)
          .filter((wallet) => wallet.accountId === storeAccountId);
        console.log('[PaymentMethodDetails] Store wallets:', storeWallets);
        return storeWallets;
      } catch (error) {
        console.error('[PaymentMethodDetails] Error fetching wallets:', error);
        return [];
      }
    },
    enabled: !!storeAccountId,
    staleTime: 5 * 60 * 1000,
  });

  const storeWallets = useMemo(() => walletsQuery.data || [], [walletsQuery.data]);

  // Cargar cuentas bancarias usando React Query
  const bankAccountsQuery = useQuery({
    queryKey: ['stores', storeId, 'bank-accounts'],
    queryFn: async () => {
      if (!storeId || paymentMethod !== 'Transferencia Bancaria') return [];
      const response = await axiosHelper.stores.bankAccounts.list(storeId);
      return (response.data?.data || response.data || []) as BankAccount[];
    },
    enabled: !!storeId && paymentMethod === 'Transferencia Bancaria',
  });

  const bankAccounts = bankAccountsQuery.data || [];

  // Métodos de pago físico habilitados
  const physicalPayments = React.useMemo(() => {
    if (!integrations?.integrations?.physicalPayments?.methods) return [];
    const methods: string[] = [];
    if (integrations.integrations.physicalPayments.methods.rapipago) {
      methods.push('rapipago');
    }
    if (integrations.integrations.physicalPayments.methods.pagoFacil) {
      methods.push('pago-facil');
    }
    return methods;
  }, [integrations]);

  // Función para normalizar nombres de red (reutilizable)
  const normalizeNetwork = React.useCallback((network: string): string => {
    const normalized = network.toUpperCase().trim();
    const networkMap: Record<string, string> = {
      'ERC-20': 'ERC-20',
      'ERC20': 'ERC-20',
      'TRC-20': 'TRC-20',
      'TRC20': 'TRC-20',
      'TRX': 'TRC-20',
      'BEP-20': 'BEP-20',
      'BEP20': 'BEP-20',
      'BSC': 'BEP-20',
      'BTC': 'BTC',
      'POLYGON': 'POLYGON',
    };
    return networkMap[normalized] || normalized;
  }, []);


  // Función para generar QR code
  const generateQRCodeUrl = React.useCallback((data: string): string => {
    const encoded = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
  }, []);

  // Estado para la red seleccionada (debe estar antes de cualquier condición)
  const [selectedNetwork, setSelectedNetwork] = React.useState<string>('');
  
  // Estado para el hash de transacción
  const [txHash, setTxHash] = React.useState<string>('');
  
  // Estado para el QR code
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
  
  // Estado para el comprobante de transferencia bancaria
  const [bankTransferFile, setBankTransferFile] = React.useState<File | null>(null);
  const [bankTransferPreview, setBankTransferPreview] = React.useState<string | null>(null);
  const [dragActiveTransfer, setDragActiveTransfer] = React.useState(false);
  const [isUploadingTransferFile, setIsUploadingTransferFile] = React.useState(false);
  const transferInputRef = React.useRef<HTMLInputElement>(null);
  const uploadingFileRef = React.useRef<File | null>(null);
  
  // Función para validar y procesar el archivo de comprobante
  const validateAndProcessTransferFile = React.useCallback((
    file: File,
    onSuccess: (preview: string | null, file: File) => void,
    onError: (message: string) => void
  ) => {
    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('El archivo es demasiado grande. Tamaño máximo: 10MB.');
      return;
    }
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      onError('Formato no válido. Use JPG, PNG o PDF.');
      return;
    }
    
    // Si es una imagen, crear preview
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.onload = () => {
        const preview = URL.createObjectURL(file);
        onSuccess(preview, file);
      };
      img.onerror = () => {
        onError('No se pudo cargar la imagen. Verifique el archivo.');
      };
      img.src = URL.createObjectURL(file);
    } else {
      // Si es PDF, no hay preview pero se acepta
      onSuccess(null, file);
    }
  }, []);
  
  // Handlers para drag and drop
  const handleDragTransfer = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDragInTransfer = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDragActiveTransfer(true);
    }
  }, []);
  
  const handleDragOutTransfer = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveTransfer(false);
  }, []);
  
  const handleDropTransfer = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveTransfer(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessTransferFile(
        file,
        (preview, processedFile) => {
          setBankTransferPreview(preview);
          setBankTransferFile(processedFile);
        },
        (error) => {
          toast.error(error);
        }
      );
    }
  }, [validateAndProcessTransferFile, toast]);
  
  const handleCancelTransfer = React.useCallback(() => {
    if (bankTransferPreview) {
      URL.revokeObjectURL(bankTransferPreview);
    }
    setBankTransferFile(null);
    setBankTransferPreview(null);
    setIsUploadingTransferFile(false);
    uploadingFileRef.current = null;
    // Limpiar también la referencia en el store
    setBankTransferReference('');
    if (transferInputRef.current) {
      transferInputRef.current.value = '';
    }
  }, [bankTransferPreview, setBankTransferReference]);
  
  // Guardar txHash en el store cuando cambia y el método de pago es crypto
  React.useEffect(() => {
    const currentData = getCurrentStoreData();
    if (currentData && currentData.paymentMethod === 'Criptomonedas' && txHash && txHash.trim()) {
      setStoreTxHash(txHash.trim());
    }
  }, [txHash, getCurrentStoreData, setStoreTxHash]);
  
  // Guardar mercadoPagoLink en el store cuando está disponible
  React.useEffect(() => {
    const currentData = getCurrentStoreData();
    const mercadoPagoLink = integrations?.integrations?.mercadoPago?.link;
    if (currentData && currentData.paymentMethod === 'Tarjeta de crédito o debito' && mercadoPagoLink) {
      setMercadoPagoReference(mercadoPagoLink);
    }
  }, [integrations, getCurrentStoreData, setMercadoPagoReference]);
  
  // Función para subir el archivo a ms-storage (se llama desde checkout-page)
  const uploadFileToStorage = React.useCallback(async (): Promise<void> => {
    const currentData = getCurrentStoreData();
    if (!currentData || currentData.paymentMethod !== 'Transferencia Bancaria' || !bankTransferFile) {
      // Si no hay archivo, no hacer nada (el archivo es opcional)
      return;
    }

    // Evitar subir el mismo archivo múltiples veces
    if (uploadingFileRef.current === bankTransferFile || isUploadingTransferFile) {
      return;
    }

    uploadingFileRef.current = bankTransferFile;
    setIsUploadingTransferFile(true);

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', bankTransferFile);

      // Subir el archivo a ms-storage
      const response = await axiosHelper.storage.upload(formData);
      
      // La respuesta puede venir en diferentes formatos según el backend
      // Intentar obtener la URL de diferentes formas
      let fileUrl: string | null = null;
      
      if (response.data) {
        const data = response.data.data || response.data;
        
        // Intentar obtener la URL de diferentes campos posibles
        fileUrl = data.url || data.location || data.cdnUrl;
        
        // Si no hay URL directa, construirla usando el ID
        if (!fileUrl && data.id) {
          // Construir la URL usando el ID (similar a como lo hace ms-account)
          const storageBase = process.env.NEXT_PUBLIC_MS_STORAGE_URL || 'http://localhost:3004';
          const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
          fileUrl = `${storageBase}${apiPrefix}/files/${data.id}`;
        }
      }

      if (!fileUrl) {
        throw new Error('No se pudo obtener la URL del archivo subido');
      }

      // Guardar la URL en el store
      setBankTransferReference(fileUrl);
    } catch (error) {
      console.error('[PaymentMethodDetails] Error al subir archivo a ms-storage:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error al subir el comprobante. Por favor, intente nuevamente.';
      toast.error(errorMessage, { duration: 5000 });
      
      // Limpiar el archivo en caso de error
      setBankTransferFile(null);
      if (bankTransferPreview) {
        URL.revokeObjectURL(bankTransferPreview);
      }
      setBankTransferPreview(null);
      if (transferInputRef.current) {
        transferInputRef.current.value = '';
      }
      // Limpiar también la referencia en el store
      setBankTransferReference('');
      uploadingFileRef.current = null;
      throw error; // Re-lanzar el error para que checkout-page lo maneje
    } finally {
      setIsUploadingTransferFile(false);
    }
  }, [bankTransferFile, getCurrentStoreData, setBankTransferReference, isUploadingTransferFile, bankTransferPreview, toast]);

  // Exponer la función de subida al componente padre
  React.useEffect(() => {
    if (onUploadFile) {
      onUploadFile(uploadFileToStorage);
    }
  }, [onUploadFile, uploadFileToStorage]);

  // Resetear todos los estados cuando cambia el método de pago
  React.useEffect(() => {
    // Limpiar estados de cripto
    setSelectedNetwork('');
    setLocalCryptoSelection('');
    setTxHash('');
    setQrCodeUrl(null);
    
    // Limpiar estados de transferencia bancaria
    if (bankTransferPreview) {
      URL.revokeObjectURL(bankTransferPreview);
    }
    setBankTransferFile(null);
    setBankTransferPreview(null);
    setDragActiveTransfer(false);
    setIsUploadingTransferFile(false);
    uploadingFileRef.current = null;
    if (transferInputRef.current) {
      transferInputRef.current.value = '';
    }
    
    // Limpiar selección de crypto en el store
    setCryptoNetwork('', '');
    setStoreTxHash('');
    setBankTransferReference('');
    setMercadoPagoReference('');
  }, [paymentMethod, bankTransferPreview, setCryptoNetwork, setStoreTxHash, setBankTransferReference, setMercadoPagoReference]);

  // Obtener valor seleccionado actual
  // Usar un estado local para mantener la selección actual mientras se actualiza el store
  const [localCryptoSelection, setLocalCryptoSelection] = React.useState<string>('');
  
  const currentCryptoSelection = React.useMemo(() => {
    // Si hay una selección local, usarla primero
    if (localCryptoSelection) {
      return localCryptoSelection;
    }
    // Si no, obtener del store
    const currentData = getCurrentStoreData();
    if (currentData?.cryptoNetwork && currentData?.cryptoId) {
      const normalizedNetwork = normalizeNetwork(currentData.cryptoNetwork);
      return `${normalizedNetwork}:${currentData.cryptoId}`;
    }
    return '';
  }, [getCurrentStoreData, normalizeNetwork, localCryptoSelection]);
  
  // Sincronizar con el store cuando cambia
  React.useEffect(() => {
    const currentData = getCurrentStoreData();
    if (currentData?.cryptoNetwork && currentData?.cryptoId) {
      const normalizedNetwork = normalizeNetwork(currentData.cryptoNetwork);
      const storeValue = `${normalizedNetwork}:${currentData.cryptoId}`;
      if (storeValue !== localCryptoSelection) {
        setLocalCryptoSelection(storeValue);
      }
    } else if (localCryptoSelection && !currentData?.cryptoNetwork) {
      // Limpiar selección local si se limpia en el store
      setLocalCryptoSelection('');
    }
  }, [getCurrentStoreData, normalizeNetwork, localCryptoSelection]);

  // Inicializar red seleccionada si hay una selección previa
  React.useEffect(() => {
    const currentData = getCurrentStoreData();
    if (currentData?.cryptoNetwork && !selectedNetwork) {
      const normalized = normalizeNetwork(currentData.cryptoNetwork);
      setSelectedNetwork(normalized);
    }
  }, [getCurrentStoreData, normalizeNetwork, selectedNetwork]);

  // Construir opciones de criptomonedas desde las wallets de la tienda (ms-wallets)
  const cryptoOptions = React.useMemo(() => {
    if (!storeWallets || storeWallets.length === 0 || !cryptoCurrencies || cryptoCurrencies.length === 0) {
      console.log('[PaymentMethodDetails] No wallets or currencies available:', {
        walletsCount: storeWallets?.length || 0,
        currenciesCount: cryptoCurrencies?.length || 0,
      });
      return [];
    }

    const options: Array<{
      value: string;
      label: string;
      native?: string;
      network: string;
      currency: string;
    }> = [];

    const normalizedSupportedNetworks = supportedNetworks.map(n => normalizeNetwork(n));

    // Iterar sobre todas las wallets de la tienda
    storeWallets.forEach((wallet) => {
      if (!wallet.data) return;

      // Iterar sobre las redes en cada wallet
      Object.entries(wallet.data).forEach(([storeNetworkKey, networkTokens]) => {
        const normalizedStoreNetwork = normalizeNetwork(storeNetworkKey);
        
        // Si hay redes soportadas definidas, verificar que la red esté soportada
        // Si no hay redes soportadas (aún cargando), permitir todas las redes de las wallets
        const isNetworkSupported = normalizedSupportedNetworks.length === 0 || 
          normalizedSupportedNetworks.some(
            (supportedNetwork) => normalizeNetwork(supportedNetwork) === normalizedStoreNetwork
          );

        if (!isNetworkSupported && normalizedSupportedNetworks.length > 0) {
          console.log('[PaymentMethodDetails] Network not supported:', {
            storeNetwork: storeNetworkKey,
            normalized: normalizedStoreNetwork,
            supported: normalizedSupportedNetworks,
          });
          return; // Saltar si la red no está soportada (solo si hay redes soportadas definidas)
        }
        
        // Iterar sobre los tokens en esta red
        Object.entries(networkTokens).forEach(([currencyKey, tokenData]) => {
          // Solo incluir si tiene wallet configurada
          if (tokenData?.Wallet) {
            // Buscar la moneda en la lista de monedas disponibles
            // Normalizar currencyKey (puede venir como "BNB-BSC", "BNB", etc.)
            const normalizedCurrencyKey = currencyKey.toUpperCase().trim();
            // Extraer el código base si viene con formato "CODE-NETWORK" o "CODE_NETWORK"
            const baseCurrencyCode = normalizedCurrencyKey.split('-')[0].split('_')[0];
            
            // Primero intentar match exacto por code/symbol con network
            let currency = cryptoCurrencies.find(
              (c) => {
                if (!c.network) return false;
                const currencyNetworkNormalized = normalizeNetwork(c.network);
                const currencyNetworkMatch = currencyNetworkNormalized === normalizedStoreNetwork;
                const currencyCodeMatch = c.code?.toUpperCase() === normalizedCurrencyKey ||
                                         c.symbol?.toUpperCase() === normalizedCurrencyKey ||
                                         c.code?.toUpperCase() === baseCurrencyCode ||
                                         c.symbol?.toUpperCase() === baseCurrencyCode;
                return currencyNetworkMatch && currencyCodeMatch;
              }
            );

            // Si no se encuentra con network, intentar solo por code/symbol (base)
            if (!currency) {
              currency = cryptoCurrencies.find(
                (c) => c.code?.toUpperCase() === normalizedCurrencyKey ||
                       c.symbol?.toUpperCase() === normalizedCurrencyKey ||
                       c.code?.toUpperCase() === baseCurrencyCode ||
                       c.symbol?.toUpperCase() === baseCurrencyCode
              );
            }

            if (currency) {
              const networkDisplay = normalizedStoreNetwork;
              const label = `${currency.symbol} - ${currency.name} (${networkDisplay})`;
              const value = `${normalizedStoreNetwork}:${currency.code}`;
              options.push({
                value,
                label,
                native: label,
                network: normalizedStoreNetwork,
                currency: currency.code,
              });
              console.log('[PaymentMethodDetails] Added option from wallet:', { label, network: normalizedStoreNetwork, currency: currency.code });
            } else {
              console.log('[PaymentMethodDetails] Currency not found:', {
                currencyKey,
                network: normalizedStoreNetwork,
                availableCurrencies: cryptoCurrencies.map(c => ({ code: c.code, symbol: c.symbol, network: c.network })),
              });
            }
          }
        });
      });
    });

    console.log('[PaymentMethodDetails] Final options from wallets:', options.length);
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [storeWallets, cryptoCurrencies, supportedNetworks, normalizeNetwork]);

  // Obtener redes disponibles: usar todas las redes soportadas y filtrar por las que tiene la tienda
  const availableStoreNetworks = React.useMemo(() => {
    console.log('[PaymentMethodDetails] Building availableStoreNetworks:', {
      supportedNetworksCount: supportedNetworks.length,
      supportedNetworks,
      storeWalletsCount: storeWallets.length,
      storeWallets: storeWallets,
    });
    
    // Si no hay wallets, retornar vacío
    if (!storeWallets || storeWallets.length === 0) {
      console.log('[PaymentMethodDetails] No wallets found for store');
      return [];
    }
    
    // Extraer todas las redes únicas que tiene la tienda en sus wallets
    const storeNetworkSet = new Set<string>();
    storeWallets.forEach((wallet) => {
      if (wallet.data) {
        Object.keys(wallet.data).forEach((networkKey) => {
          // Verificar que la red tenga al menos un token con wallet configurada
          const networkTokens = wallet.data[networkKey];
          const hasWallet = Object.values(networkTokens).some(token => token?.Wallet);
          if (hasWallet) {
            const normalized = normalizeNetwork(networkKey);
            storeNetworkSet.add(normalized);
            // También agregar la clave original para matching
            storeNetworkSet.add(networkKey.toUpperCase());
            storeNetworkSet.add(networkKey);
          }
        });
      }
    });
    
    console.log('[PaymentMethodDetails] Store networks from wallets:', Array.from(storeNetworkSet));
    
    // Si hay redes soportadas, filtrar por las que tiene la tienda
    // Si no hay redes soportadas (aún cargando), mostrar todas las redes de las wallets
    let networksToFilter: string[] = [];
    if (supportedNetworks && supportedNetworks.length > 0) {
      networksToFilter = supportedNetworks;
    } else {
      // Si no hay redes soportadas, usar las redes de las wallets directamente
      networksToFilter = Array.from(storeNetworkSet);
    }
    
    // Usar un Map para evitar duplicados basándose en la red normalizada
    const networkMap = new Map<string, { key: string; normalized: string; label: string }>();
    
    networksToFilter.forEach((network) => {
      const normalizedNetwork = normalizeNetwork(network);
      const hasNetwork = storeNetworkSet.has(normalizedNetwork) || 
                        storeNetworkSet.has(network.toUpperCase()) ||
                        storeNetworkSet.has(network);
      
      console.log('[PaymentMethodDetails] Checking network:', {
        network,
        normalizedNetwork,
        hasNetwork,
        storeNetworks: Array.from(storeNetworkSet),
      });
      
      if (hasNetwork) {
        // Solo agregar si no existe ya una red con la misma normalización
        if (!networkMap.has(normalizedNetwork)) {
          networkMap.set(normalizedNetwork, {
            key: network,
            normalized: normalizedNetwork,
            label: normalizedNetwork,
          });
        }
      }
    });
    
    const filteredNetworks = Array.from(networkMap.values());
    console.log('[PaymentMethodDetails] Final availableStoreNetworks:', filteredNetworks);
    return filteredNetworks;
  }, [supportedNetworks, storeWallets, normalizeNetwork]);

  // Obtener la dirección de la wallet para la red y moneda seleccionadas
  const selectedWalletAddress = React.useMemo(() => {
    if (!selectedNetwork || !currentCryptoSelection) {
      console.log('[PaymentMethodDetails] No wallet address - missing selection:', {
        selectedNetwork,
        currentCryptoSelection,
      });
      return '';
    }
    
    const [network, currency] = currentCryptoSelection.split(':');
    if (!network || !currency) {
      console.log('[PaymentMethodDetails] No wallet address - invalid selection format:', {
        currentCryptoSelection,
        network,
        currency,
      });
      return '';
    }
    
    console.log('[PaymentMethodDetails] Looking for wallet address:', {
      network,
      currency,
      storeWalletsCount: storeWallets.length,
    });
    
    // Buscar la wallet en las wallets de la tienda
    for (const wallet of storeWallets) {
      if (!wallet.data) continue;
      
      // Buscar en todas las redes (puede que la red original sea diferente a la normalizada)
      for (const [networkKey, networkTokens] of Object.entries(wallet.data)) {
        const normalizedNetworkKey = normalizeNetwork(networkKey);
        console.log('[PaymentMethodDetails] Checking network:', {
          networkKey,
          normalizedNetworkKey,
          targetNetwork: network,
          matches: normalizedNetworkKey === network,
        });
        
        if (normalizedNetworkKey === network) {
          // Buscar el token que coincida con la moneda
          // El currency puede venir como "ETH-ERC20" pero en las wallets puede ser "ETH"
          const normalizedTargetCurrency = currency.toUpperCase().trim();
          const targetBaseCurrency = normalizedTargetCurrency.split('-')[0].split('_')[0];
          
          for (const [currencyKey, tokenData] of Object.entries(networkTokens)) {
            const normalizedCurrencyKey = currencyKey.toUpperCase().trim();
            const baseCurrencyCode = normalizedCurrencyKey.split('-')[0].split('_')[0];
            
            console.log('[PaymentMethodDetails] Checking currency:', {
              currencyKey,
              normalizedCurrencyKey,
              baseCurrencyCode,
              targetCurrency: normalizedTargetCurrency,
              targetBaseCurrency,
              exactMatch: normalizedCurrencyKey === normalizedTargetCurrency,
              baseMatch: baseCurrencyCode === normalizedTargetCurrency || baseCurrencyCode === targetBaseCurrency,
              reverseMatch: normalizedCurrencyKey === targetBaseCurrency,
              hasWallet: !!tokenData?.Wallet,
            });
            
            // Comparar de múltiples formas:
            // 1. Match exacto: "ETH-ERC20" === "ETH-ERC20"
            // 2. Match por código base: "ETH" === "ETH" (cuando currency es "ETH-ERC20" y currencyKey es "ETH")
            // 3. Match inverso: "ETH-ERC20" === "ETH" (cuando currency es "ETH" y currencyKey es "ETH-ERC20")
            const matches = 
              normalizedCurrencyKey === normalizedTargetCurrency || 
              baseCurrencyCode === normalizedTargetCurrency ||
              baseCurrencyCode === targetBaseCurrency ||
              normalizedCurrencyKey === targetBaseCurrency ||
              currencyKey.toUpperCase() === normalizedTargetCurrency ||
              currencyKey.toUpperCase() === targetBaseCurrency;
            
            if (matches) {
              if (tokenData?.Wallet) {
                console.log('[PaymentMethodDetails] Found wallet address:', {
                  network,
                  currency,
                  currencyKey,
                  walletAddress: tokenData.Wallet,
                  matchType: normalizedCurrencyKey === normalizedTargetCurrency ? 'exact' : 
                            baseCurrencyCode === normalizedTargetCurrency ? 'base' :
                            normalizedCurrencyKey === targetBaseCurrency ? 'reverse' : 'other',
                });
                return tokenData.Wallet;
              } else {
                console.log('[PaymentMethodDetails] Currency matches but no wallet address:', {
                  currencyKey,
                  tokenData,
                });
              }
            }
          }
        }
      }
    }
    
    console.log('[PaymentMethodDetails] Wallet address not found for:', {
      network,
      currency,
    });
    return '';
  }, [selectedNetwork, currentCryptoSelection, storeWallets, normalizeNetwork]);

  // Generar QR code cuando cambia la dirección de la wallet
  React.useEffect(() => {
    if (selectedWalletAddress) {
      const qrUrl = generateQRCodeUrl(selectedWalletAddress);
      setQrCodeUrl(qrUrl);
    } else {
      setQrCodeUrl(null);
    }
  }, [selectedWalletAddress, generateQRCodeUrl]);

  // Limpiar el hash de transacción cuando cambia la red o moneda
  React.useEffect(() => {
    setTxHash('');
  }, [selectedNetwork, currentCryptoSelection]);

  // Filtrar opciones por red seleccionada
  const filteredCryptoOptions = React.useMemo(() => {
    if (!selectedNetwork) return [];
    return cryptoOptions.filter(opt => opt.network === selectedNetwork);
  }, [cryptoOptions, selectedNetwork]);

  // Handler para seleccionar criptomoneda
  const handleCryptoSelect = (option: { value: string; label: string; native?: string }) => {
    console.log('[PaymentMethodDetails] Crypto selected:', option);
    // Actualizar selección local inmediatamente para feedback visual
    setLocalCryptoSelection(option.value);
    
    // Buscar en filteredCryptoOptions primero (las opciones visibles), luego en cryptoOptions
    const selectedOption = filteredCryptoOptions.find(opt => opt.value === option.value) ||
                          cryptoOptions.find(opt => opt.value === option.value);
    if (selectedOption) {
      console.log('[PaymentMethodDetails] Setting crypto network:', {
        network: selectedOption.network,
        currency: selectedOption.currency,
        value: selectedOption.value,
      });
      setCryptoNetwork(selectedOption.network, selectedOption.currency);
    } else {
      console.log('[PaymentMethodDetails] Selected option not found:', {
        optionValue: option.value,
        filteredOptions: filteredCryptoOptions.map(opt => opt.value),
        allOptions: cryptoOptions.map(opt => opt.value),
      });
      // Si no se encuentra, limpiar selección local
      setLocalCryptoSelection('');
    }
  };

  if (integrationsQuery.isLoading || bankAccountsQuery.isLoading || storeQuery.isLoading || walletsQuery.isLoading || isLoadingSupportedNetworks) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, mt: 3 }}>
        <CircularProgress size={24} sx={{ color: '#29C480' }} />
      </Box>
    );
  }

  // Mostrar cuentas bancarias para Transferencia Bancaria
  if (paymentMethod === 'Transferencia Bancaria') {
    // Si no hay cuentas bancarias, mostrar mensaje informativo
    if (bankAccounts.length === 0) {
      return (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                mb: 1,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Método de pago no disponible
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.875rem',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Esta tienda no tiene cuentas bancarias configuradas. Por favor, selecciona otro método de pago.
            </Typography>
          </Box>
        </Box>
      );
    }
    
    // Si hay cuentas bancarias, mostrar el componente
    return (
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
            border: '1px solid rgba(41, 196, 128, 0.15)',
            borderRadius: '12px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(41, 196, 128, 0.15)',
                borderRadius: '8px',
              }}
            >
              <AccountBalance sx={{ fontSize: 18, color: '#29C480' }} />
            </Box>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Cuentas bancarias disponibles
            </Typography>
          </Box>
          <Stack spacing={2}>
            {bankAccounts.map((account) => {
              const handleCopyBankInfo = async () => {
                const bankInfo = [
                  account.bankName || 'Banco',
                  account.cbu ? `CBU/CVU: ${account.cbu}` : account.alias ? `Alias: ${account.alias}` : '',
                  account.accountHolderName ? `Titular: ${account.accountHolderName}` : '',
                  `Moneda: ${account.currency || 'ARS'}`,
                ].filter(Boolean).join('\n');
                
                try {
                  await navigator.clipboard.writeText(bankInfo);
                  toast.success('Información bancaria copiada al portapapeles', { duration: 4000 });
                } catch {
                  // Fallback para navegadores que no soportan clipboard API
                  try {
                    const textArea = document.createElement("textarea");
                    textArea.value = bankInfo;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                    toast.success('Información bancaria copiada al portapapeles', { duration: 4000 });
                  } catch {
                    toast.error('No se pudo copiar la información bancaria', { duration: 5000 });
                  }
                }
              };
              
              return (
                <Box
                  key={account.id}
                  sx={{
                    p: 2,
                    backgroundColor: '#1f2937',
                    borderRadius: '4px',
                    border: '1px solid #374151',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        color: '#34d399',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      {account.bankName || '-'}
                    </Typography>
                    {(account.cbu || account.alias) && (
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          mb: 0.5,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {account.cbu ? `CBU/CVU: ${account.cbu}` : account.alias ? `Alias: ${account.alias}` : ''}
                      </Typography>
                    )}
                    {account.accountHolderName && (
                      <Typography
                        sx={{
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          mb: 0.5,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        Titular: {account.accountHolderName}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      Moneda: {account.currency || 'ARS'}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleCopyBankInfo}
                    size="small"
                    sx={{
                      color: '#34d399',
                      '&:hover': {
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        color: '#22c55e',
                      },
                      transition: 'all 0.2s ease',
                      alignSelf: 'flex-start',
                      mt: 0.5,
                    }}
                    title="Copiar información bancaria"
                  >
                    <ContentCopy sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Box>
              );
            })}
          </Stack>
          
          {/* Componente de carga de comprobante */}
          <Box sx={{ mt: 3 }}>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                mb: 2,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Comprobante de transferencia
            </Typography>
            <Box
              component="label"
              onDragEnter={handleDragInTransfer}
              onDragLeave={handleDragOutTransfer}
              onDragOver={handleDragTransfer}
              onDrop={handleDropTransfer}
              sx={{
                width: '100%',
                minHeight: 200,
                boxSizing: 'border-box',
                border: '2px dashed',
                borderColor: dragActiveTransfer ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                borderRadius: 2,
                backgroundColor: dragActiveTransfer ? 'rgba(52, 211, 153, 0.05)' : 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: 4,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: '#34d399',
                  backgroundColor: 'rgba(52, 211, 153, 0.05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(52, 211, 153, 0.2)',
                },
                '&::before': dragActiveTransfer ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.1), transparent)',
                  animation: 'shimmer 1.5s infinite',
                  '@keyframes shimmer': {
                    '0%': { left: '-100%' },
                    '100%': { left: '100%' },
                  },
                } : {},
              }}
            >
              <input
                ref={transferInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    validateAndProcessTransferFile(
                      file,
                      (preview, processedFile) => {
                        setBankTransferPreview(preview);
                        setBankTransferFile(processedFile);
                      },
                      (error) => {
                        toast.error(error);
                        if (transferInputRef.current) transferInputRef.current.value = '';
                      }
                    );
                  }
                }}
              />
              
              {/* Preview de archivo */}
              {bankTransferFile ? (
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    animation: 'fadeInScale 0.3s ease-out',
                    '@keyframes fadeInScale': {
                      '0%': {
                        opacity: 0,
                        transform: 'scale(0.9)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'scale(1)',
                      },
                    },
                  }}
                >
                  {bankTransferPreview ? (
                    <Box
                      sx={{
                        position: 'relative',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid',
                        borderColor: '#34d399',
                        boxShadow: '0 4px 20px rgba(52, 211, 153, 0.3)',
                        mb: 2,
                      }}
                    >
                      <Image
                        src={bankTransferPreview}
                        alt="Comprobante"
                        width={120}
                        height={120}
                        sx={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        border: '3px solid',
                        borderColor: '#34d399',
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 48, color: '#34d399' }} />
                    </Box>
                  )}
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      mb: 1,
                    }}
                  >
                    {bankTransferFile.name}
                  </Typography>
                  <Box
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    sx={{ position: 'absolute', top: -8, right: 'calc(50% - 41px)', zIndex: 10 }}
                  >
                    <IconButton
                      onClick={handleCancelTransfer}
                      sx={{
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        width: 32,
                        height: 32,
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#dc2626',
                          transform: 'scale(1.1)',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.6)',
                        },
                      }}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    zIndex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: dragActiveTransfer ? 'rgba(52, 211, 153, 0.2)' : 'rgba(52, 211, 153, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 32, color: '#34d399' }} />
                  </Box>
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textAlign: 'center',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Arrastra y suelta el comprobante aquí
                    <br />
                    o haz clic para seleccionar
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.75rem',
                      textAlign: 'center',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Formatos: JPG, PNG o PDF. Máximo 10MB.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Obtener link de MercadoPago
  const mercadoPagoLink = integrations?.integrations?.mercadoPago?.link;

  // Mostrar link de MercadoPago para Tarjeta de crédito o débito
  if (paymentMethod === 'Tarjeta de crédito o debito') {
    // Si no hay link de MercadoPago, mostrar mensaje informativo
    if (!mercadoPagoLink) {
      return (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                mb: 1,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Método de pago no disponible
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.875rem',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Esta tienda no tiene configurado el pago con tarjeta. Por favor, selecciona otro método de pago.
            </Typography>
          </Box>
        </Box>
      );
    }
    
    // Si hay link de MercadoPago, mostrar el componente
    return (
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
            border: '1px solid rgba(41, 196, 128, 0.15)',
            borderRadius: '12px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(41, 196, 128, 0.15)',
                borderRadius: '8px',
              }}
            >
              <PaymentIcon sx={{ fontSize: 18, color: '#29C480' }} />
            </Box>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Link de MercadoPago
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              backgroundColor: '#1f2937',
              borderRadius: '4px',
              border: '1px solid #374151',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Link
              href={mercadoPagoLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#34d399',
                fontSize: '0.875rem',
                textDecoration: 'none',
                flex: 1,
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#22c55e',
                },
              }}
            >
              Pagar con MercadoPago
            </Link>
            <IconButton
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(mercadoPagoLink);
                  toast.success('Link de MercadoPago copiado al portapapeles', { duration: 4000 });
                } catch {
                  // Fallback para navegadores que no soportan clipboard API
                  try {
                    const textArea = document.createElement("textarea");
                    textArea.value = mercadoPagoLink;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                    toast.success('Link de MercadoPago copiado al portapapeles', { duration: 4000 });
                  } catch {
                    toast.error('No se pudo copiar el link de MercadoPago', { duration: 5000 });
                  }
                }
              }}
              size="small"
              sx={{
                color: '#34d399',
                '&:hover': {
                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                  color: '#22c55e',
                },
                transition: 'all 0.2s ease',
              }}
              title="Copiar link de MercadoPago"
            >
              <ContentCopy sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  }

  // Mostrar selector de criptomonedas para Criptomonedas
  if (paymentMethod === 'Criptomonedas') {
    // Si está cargando, mostrar spinner
    if (storeQuery.isLoading || walletsQuery.isLoading || isLoadingSupportedNetworks) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, mt: 3 }}>
          <CircularProgress size={24} sx={{ color: '#29C480' }} />
        </Box>
      );
    }

    // Debug: mostrar información de las wallets
    console.log('[PaymentMethodDetails] Crypto payment check:', {
      storeWalletsCount: storeWallets.length,
      storeWallets: storeWallets,
      availableNetworksCount: availableStoreNetworks.length,
      availableNetworks: availableStoreNetworks,
      cryptoOptionsCount: cryptoOptions.length,
      supportedNetworksCount: supportedNetworks.length,
      walletsQueryLoading: walletsQuery.isLoading,
      walletsQueryError: walletsQuery.error,
      storeQueryLoading: storeQuery.isLoading,
      isLoadingSupportedNetworks,
    });

    // Si no hay wallets, no hay redes disponibles, o no hay opciones de criptomonedas, mostrar mensaje
    // Pero solo si ya terminó de cargar todo
    const isLoading = walletsQuery.isLoading || storeQuery.isLoading || isLoadingSupportedNetworks;
    const hasWallets = storeWallets.length > 0;
    const hasNetworks = availableStoreNetworks.length > 0;
    const hasCryptoOptions = cryptoOptions.length > 0;
    
    console.log('[PaymentMethodDetails] Crypto availability check:', {
      isLoading,
      hasWallets,
      hasNetworks,
      hasCryptoOptions,
      shouldShowMessage: !isLoading && (!hasWallets || (!hasNetworks && !hasCryptoOptions)),
    });
    
    // Solo mostrar el mensaje si no está cargando Y (no hay wallets O (no hay redes Y no hay opciones))
    if (!isLoading && (!hasWallets || (!hasNetworks && !hasCryptoOptions))) {
      return (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                mb: 1,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              No hay criptomonedas disponibles
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.875rem',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Esta tienda no tiene criptomonedas configuradas.
            </Typography>
          </Box>
        </Box>
      );
    }

    // Mostrar selector de red y luego de criptomoneda
    return (
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
            border: '1px solid rgba(41, 196, 128, 0.15)',
            borderRadius: '12px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(41, 196, 128, 0.15)',
                borderRadius: '8px',
              }}
            >
              <CryptoIcon sx={{ fontSize: 18, color: '#29C480' }} />
            </Box>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Selecciona la red y criptomoneda
            </Typography>
          </Box>

          {/* Si no hay red seleccionada, mostrar solo el selector de red */}
          {!selectedNetwork ? (
            <Box sx={{ mb: 3 }}>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#ffffff',
                  mb: 1,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                Red
              </Typography>
              <DropdownButton
                options={availableStoreNetworks.map(net => ({
                  value: net.normalized,
                  label: net.label,
                  native: net.label,
                }))}
                value={selectedNetwork}
                onChange={(option) => {
                  console.log('[PaymentMethodDetails] Network selected:', option.value);
                  setSelectedNetwork(option.value);
                  // Limpiar selección de crypto cuando cambia la red
                  const currentData = getCurrentStoreData();
                  if (currentData?.cryptoNetwork && currentData.cryptoNetwork !== option.value) {
                    setCryptoNetwork('', '');
                    setLocalCryptoSelection(''); // Limpiar también la selección local
                  }
                }}
                placeholder="Seleccionar red..."
                renderValue={(option) => option ? option.label : ''}
                fullWidth={true}
                searchable={true}
                sx={{ 
                  width: '100%',
                  '& button': {
                    height: '56px',
                    minHeight: '56px',
                    alignItems: 'center',
                    display: 'flex',
                    '& .MuiTypography-root': {
                      fontSize: '0.875rem !important',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      lineHeight: '1.5',
                    }
                  }
                }}
              />
            </Box>
          ) : (
            <>
              {/* Cuando hay red seleccionada, mostrar layout en dos columnas */}
              <Grid container spacing={3}>
                {/* Columna 1: Red, Moneda, Dirección de Wallet */}
                <Grid size={{ xs: 12, md: selectedWalletAddress && qrCodeUrl ? 6 : 12 }}>
                  <Stack spacing={3}>
                    {/* Selector de red */}
                    <Box>
                      <Typography
                        component="label"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        Red
                      </Typography>
                      <DropdownButton
                        options={availableStoreNetworks.map(net => ({
                          value: net.normalized,
                          label: net.label,
                          native: net.label,
                        }))}
                        value={selectedNetwork}
                        onChange={(option) => {
                          console.log('[PaymentMethodDetails] Network selected:', option.value);
                          setSelectedNetwork(option.value);
                          // Limpiar selección de crypto cuando cambia la red
                          const currentData = getCurrentStoreData();
                          if (currentData?.cryptoNetwork && currentData.cryptoNetwork !== option.value) {
                            setCryptoNetwork('', '');
                            setLocalCryptoSelection(''); // Limpiar también la selección local
                          }
                        }}
                        placeholder="Seleccionar red..."
                        renderValue={(option) => option ? option.label : ''}
                        fullWidth={true}
                        searchable={true}
                        sx={{ 
                          width: '100%',
                          '& button': {
                            height: '56px',
                            minHeight: '56px',
                            alignItems: 'center',
                            display: 'flex',
                            '& .MuiTypography-root': {
                              fontSize: '0.875rem !important',
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                              lineHeight: '1.5',
                            }
                          }
                        }}
                      />
                    </Box>

                    {/* Selector de criptomoneda */}
                    <Box>
                      <Typography
                        component="label"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        Moneda
                      </Typography>
                      {filteredCryptoOptions.length > 0 ? (
                        <DropdownButton
                          options={filteredCryptoOptions}
                          value={currentCryptoSelection}
                          onChange={handleCryptoSelect}
                          placeholder="Seleccionar criptomoneda..."
                          renderValue={(option) => option ? option.label : ''}
                          fullWidth={true}
                          searchable={true}
                          sx={{ 
                            width: '100%',
                            '& button': {
                              height: '56px',
                              minHeight: '56px',
                              alignItems: 'center',
                              display: 'flex',
                              '& .MuiTypography-root': {
                                fontSize: '0.875rem !important',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                lineHeight: '1.5',
                              }
                            }
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            p: 2,
                            backgroundColor: '#1f2937',
                            borderRadius: '4px',
                            border: '1px solid #374151',
                          }}
                        >
                          <Typography
                            sx={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.875rem',
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}
                          >
                            No hay criptomonedas disponibles para esta red.
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Dirección de la Wallet */}
                    {(() => {
                      const handleCopyWallet = async () => {
                        if (!selectedWalletAddress) return;
                        
                        try {
                          await navigator.clipboard.writeText(selectedWalletAddress);
                          toast.success('Dirección de la wallet copiada al portapapeles', { duration: 4000 });
                        } catch {
                          // Fallback para navegadores que no soportan clipboard API
                          try {
                            const textArea = document.createElement("textarea");
                            textArea.value = selectedWalletAddress;
                            textArea.style.position = "fixed";
                            textArea.style.left = "-999999px";
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand("copy");
                            document.body.removeChild(textArea);
                            toast.success('Dirección de la wallet copiada al portapapeles', { duration: 4000 });
                          } catch {
                            toast.error('No se pudo copiar la dirección de la wallet', { duration: 5000 });
                          }
                        }
                      };

                      return selectedWalletAddress ? (
                        <Box>
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              mb: 1,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                          >
                            Dirección de la Wallet
                          </Typography>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: '#1f2937',
                              borderRadius: '4px',
                              border: '1px solid #374151',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                color: '#34d399',
                                fontSize: '0.875rem',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                wordBreak: 'break-all',
                                flex: 1,
                              }}
                            >
                              {selectedWalletAddress}
                            </Typography>
                            <IconButton
                              onClick={handleCopyWallet}
                              size="small"
                              sx={{
                                color: '#34d399',
                                '&:hover': {
                                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                                  color: '#22c55e',
                                },
                                transition: 'all 0.2s ease',
                              }}
                              title="Copiar dirección de la wallet"
                            >
                              <ContentCopy sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          </Box>
                        </Box>
                      ) : null;
                    })()}
                  </Stack>
                </Grid>

                {/* Columna 2: QR Code (solo si hay dirección de wallet) */}
                {selectedWalletAddress && qrCodeUrl && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <QrIcon sx={{ color: '#29C480', fontSize: 20 }} />
                        <Typography
                          sx={{
                            color: '#29C480',
                            fontSize: '1rem',
                            fontWeight: 600,
                            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                          }}
                        >
                          Escanea para pagar
                        </Typography>
                      </Box>
                      <Box
                        component="img"
                        src={qrCodeUrl}
                        alt="QR Code"
                        sx={{
                          width: 200,
                          height: 200,
                          borderRadius: '12px',
                          background: '#fff',
                          p: 1,
                        }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Hash de transacción (fila completa abajo) */}
              {selectedWalletAddress && (
                <Box sx={{ mt: 3 }}>
                  <TransactionHashInput
                    value={txHash}
                    onChange={(value) => {
                      setTxHash(value);
                    }}
                    onBlur={() => {
                      // Guardar en el store al perder el foco
                      if (txHash && txHash.trim()) {
                        setStoreTxHash(txHash.trim());
                      }
                    }}
                    onPaste={(value) => {
                      if (value) {
                        setStoreTxHash(value);
                      }
                      toast.success('Hash pegado desde el portapapeles', { duration: 4000 });
                    }}
                    helperText="Una vez realizada la transacción en la red marcada, pegue el hash de transacción para validar y confirmar la misma."
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    );
  }

  // Mostrar métodos de pago físico para Efectivo
  if (paymentMethod === 'Efectivo') {
    // Si no hay métodos físicos configurados, mostrar mensaje informativo
    if (physicalPayments.length === 0) {
      return (
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
              border: '1px solid rgba(41, 196, 128, 0.15)',
              borderRadius: '12px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(41, 196, 128, 0.15)',
                  borderRadius: '8px',
                }}
              >
                <CashIcon sx={{ fontSize: 18, color: '#29C480' }} />
              </Box>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  fontWeight: 600,
                  fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                Pago en efectivo
              </Typography>
            </Box>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.875rem',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              Pagarás en efectivo al recibir tu pedido.
            </Typography>
          </Box>
        </Box>
      );
    }
    
    // Si hay métodos físicos, mostrar la lista
    return (
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
            border: '1px solid rgba(41, 196, 128, 0.15)',
            borderRadius: '12px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(41, 196, 128, 0.15)',
                borderRadius: '8px',
              }}
            >
              <CashIcon sx={{ fontSize: 18, color: '#29C480' }} />
            </Box>
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '0.95rem', md: '1rem' },
                fontWeight: 600,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Medios de pago disponibles
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {physicalPayments.map((method) => {
              const methodName = method === 'rapipago' ? 'Rapipago' : 'Pago Fácil';
              const imageSrc = method === 'rapipago' 
                ? '/images/means-of-payment/rapipago.svg'
                : '/images/means-of-payment/pago-facil.svg';

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={method}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      minHeight: '56px',
                      py: 1.5,
                      px: 2,
                      borderRadius: '4px',
                      background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)',
                      border: '1px solid #34d399',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Imagen de fondo */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(10deg)',
                        width: '300px',
                        height: '300px',
                        opacity: 0.5,
                        zIndex: 0,
                        pointerEvents: 'none',
                      }}
                    >
                      <Box
                        component="img"
                        src={imageSrc}
                        alt=""
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                    
                    {/* Contenido */}
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#34d399',
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          flex: 1,
                        }}
                      >
                        {methodName}
                      </Typography>
                      <CheckCircle
                        sx={{
                          fontSize: '1.125rem',
                          color: '#34d399',
                          ml: 1,
                          flexShrink: 0,
                          filter: 'drop-shadow(0 2px 4px rgba(52, 211, 153, 0.4))',
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    );
  }

  return null;
};
