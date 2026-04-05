'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Stack, FormControl, Select, MenuItem, SelectChangeEvent, Alert } from '@mui/material';
import { Check as CheckIcon, Info as InfoIcon } from '@mui/icons-material';
import NextImage from 'next/image';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useCheckoutStore } from '@/presentation/@shared/stores/checkout-store';

// Interfaz para configuración de wallet
interface CryptoWalletConfig {
  enabled?: boolean;
  networks?: {
    [network: string]: {
      [currency: string]: {
        wallet: string;
        enabled: boolean;
      };
    };
  };
}

interface CryptoPaymentProps {
  onNetworkSelected?: (network: string, cryptoId: string) => void;
  cryptoWalletConfig?: CryptoWalletConfig | null;
}

// Todas las criptomonedas disponibles en el sistema
const ALL_CRYPTOS = [
  { id: 'btc', label: 'BTC', name: 'Bitcoin', icon: '/images/btc.svg' },
  { id: 'eth', label: 'ETH', name: 'Ethereum', icon: '/images/eth.svg' },
  { id: 'usdt', label: 'USDT', name: 'Tether USD', icon: '/store-vector/usdt.svg' },
  { id: 'usdc', label: 'USDC', name: 'USD Coin', icon: '/store-vector/usdt.svg' },
  { id: 'bnb', label: 'BNB', name: 'Binance Coin', icon: '/images/eth.svg' },
  { id: 'trx', label: 'TRX', name: 'Tron', icon: '/images/eth.svg' },
];

// Todas las redes disponibles en el sistema
const ALL_NETWORKS = [
  { label: 'ERC-20 (Ethereum)', value: 'erc-20', key: 'ERC-20' },
  { label: 'TRC-20 (Tron)', value: 'trc-20', key: 'TRX' },
  { label: 'BEP-20 (BSC)', value: 'bep-20', key: 'BSC' },
  { label: 'BTC (Bitcoin)', value: 'btc', key: 'BTC' },
  { label: 'Polygon', value: 'polygon', key: 'POLYGON' },
];

export const CryptoPayment: React.FC<CryptoPaymentProps> = ({ onNetworkSelected, cryptoWalletConfig }) => {
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');

  const { t } = useLanguage();
  const { setCryptoNetwork, getCurrentStoreData } = useCheckoutStore();

  // Filtrar redes disponibles según configuración de la tienda
  const availableNetworks = useMemo(() => {
    if (!cryptoWalletConfig?.networks) return [];

    const storeNetworks = Object.keys(cryptoWalletConfig.networks);

    return ALL_NETWORKS.filter((network) => {
      // Buscar si la red está configurada (case-insensitive)
      const configKey = storeNetworks.find(
        (k) => k.toLowerCase() === network.key.toLowerCase() ||
               k.toLowerCase() === network.value.toLowerCase()
      );

      if (!configKey) return false;

      // Verificar que hay al menos una moneda habilitada en esta red
      const networkWallets = cryptoWalletConfig.networks![configKey];
      return Object.values(networkWallets).some(
        (wallet) => wallet?.enabled && wallet?.wallet
      );
    });
  }, [cryptoWalletConfig]);

  // Filtrar criptomonedas disponibles según la red seleccionada
  const availableCryptos = useMemo(() => {
    if (!selectedNetwork || !cryptoWalletConfig?.networks) return [];

    // Encontrar la key correcta en la configuración
    const storeNetworks = Object.keys(cryptoWalletConfig.networks);
    const networkConfig = ALL_NETWORKS.find((n) => n.value === selectedNetwork);

    if (!networkConfig) return [];

    const configKey = storeNetworks.find(
      (k) => k.toLowerCase() === networkConfig.key.toLowerCase() ||
             k.toLowerCase() === selectedNetwork.toLowerCase()
    );

    if (!configKey) return [];

    const networkWallets = cryptoWalletConfig.networks[configKey];

    return ALL_CRYPTOS.filter((crypto) => {
      // Buscar si la moneda está configurada (case-insensitive)
      const walletKey = Object.keys(networkWallets).find(
        (k) => k.toLowerCase() === crypto.label.toLowerCase() ||
               k.toLowerCase() === crypto.id.toLowerCase()
      );

      if (!walletKey) return false;

      return networkWallets[walletKey]?.enabled && networkWallets[walletKey]?.wallet;
    });
  }, [selectedNetwork, cryptoWalletConfig]);

  // Construir lista de redes para el select
  const NETWORKS = useMemo(() => {
    const placeholder = { label: t.checkout?.selectNetworkPlaceholder || 'Seleccionar red', value: '' };
    return [placeholder, ...availableNetworks];
  }, [availableNetworks, t.checkout?.selectNetworkPlaceholder]);

  useEffect(() => {
    const currentData = getCurrentStoreData();
    if (currentData?.cryptoNetwork) {
      setSelectedNetwork(currentData.cryptoNetwork);
    }
    if (currentData?.cryptoId) {
      setSelectedCrypto(currentData.cryptoId);
    }
  }, [getCurrentStoreData]);

  // Resetear crypto seleccionado cuando cambia la red
  useEffect(() => {
    if (selectedNetwork && selectedCrypto) {
      // Verificar si el crypto seleccionado está disponible en la nueva red
      const isAvailable = availableCryptos.some((c) => c.id === selectedCrypto);
      if (!isAvailable) {
        setSelectedCrypto('');
      }
    }
  }, [selectedNetwork, selectedCrypto, availableCryptos]);

  const handleSelectNetwork = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedNetwork(value);
    if (value && selectedCrypto) {
      setCryptoNetwork(value, selectedCrypto);
      onNetworkSelected?.(value, selectedCrypto);
    }
  };

  const handleSelectCrypto = (cryptoId: string) => {
    setSelectedCrypto(cryptoId);
    if (cryptoId && selectedNetwork) {
      setCryptoNetwork(selectedNetwork, cryptoId);
      onNetworkSelected?.(selectedNetwork, cryptoId);
    }
  };

  const selectedCryptoData = ALL_CRYPTOS.find((c) => c.id === selectedCrypto);

  return (
    <Box>
      {/* Título */}
      <Typography
        sx={{
          color: '#ffffff',
          fontSize: { xs: '1rem', md: '1.125rem' },
          fontWeight: 600,
          mb: 3,
          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {t.checkout?.selectNetwork || 'Selecciona la Red'}
      </Typography>

      {/* Selector de red */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <Select
          value={selectedNetwork}
          onChange={handleSelectNetwork}
          displayEmpty
          sx={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: { xs: '0.9rem', md: '0.95rem' },
            height: { xs: 48, md: 52 },
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(41, 196, 128, 0.2)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(41, 196, 128, 0.4)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#29C480',
              borderWidth: '2px',
            },
            '& .MuiSvgIcon-root': {
              color: '#29C480',
              fontSize: '1.25rem',
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(0, 0, 0, 0.98))',
                border: '1px solid rgba(41, 196, 128, 0.2)',
                borderRadius: '12px',
                mt: 0.5,
                '& .MuiMenuItem-root': {
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  py: 1.25,
                  fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  '&:hover': {
                    background: 'rgba(41, 196, 128, 0.1)',
                  },
                  '&.Mui-selected': {
                    background: 'rgba(41, 196, 128, 0.15)',
                    '&:hover': {
                      background: 'rgba(41, 196, 128, 0.2)',
                    },
                  },
                },
              },
            },
          }}
        >
          {NETWORKS.map((network) => (
            <MenuItem key={network.value} value={network.value}>
              {network.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Selección de criptomoneda */}
      {selectedNetwork && (
        <Box>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '0.9rem', md: '0.95rem' },
              mb: 2,
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {t.checkout?.selectCrypto || 'Selecciona la criptomoneda'}
          </Typography>

          {availableCryptos.length === 0 ? (
            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{
                background: 'rgba(41, 196, 128, 0.1)',
                border: '1px solid rgba(41, 196, 128, 0.2)',
                color: '#ffffff',
                '& .MuiAlert-icon': { color: '#29C480' },
              }}
            >
              No hay criptomonedas disponibles para esta red
            </Alert>
          ) : (
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(0, 0, 0, 0.7))',
              border: '1px solid rgba(41, 196, 128, 0.15)',
              borderRadius: '12px',
            }}
          >
            <Stack spacing={1.5}>
              {availableCryptos.map((crypto) => {
                const isSelected = selectedCrypto === crypto.id;
                return (
                  <Box
                    key={crypto.id}
                    onClick={() => handleSelectCrypto(crypto.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: { xs: 1.5, md: 2 },
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(41, 196, 128, 0.15) 0%, rgba(41, 196, 128, 0.05) 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '2px solid #29C480' : '2px solid transparent',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(41, 196, 128, 0.15) 0%, rgba(41, 196, 128, 0.05) 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isSelected ? '#29C480' : 'rgba(41, 196, 128, 0.3)',
                      },
                    }}
                  >
                    {/* Icono */}
                    <Box
                      sx={{
                        width: { xs: 40, md: 48 },
                        height: { xs: 40, md: 48 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected ? 'rgba(41, 196, 128, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px',
                        flexShrink: 0,
                      }}
                    >
                      <NextImage src={crypto.icon} alt={crypto.label} width={28} height={28} />
                    </Box>

                    {/* Info */}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          color: isSelected ? '#29C480' : '#ffffff',
                          fontSize: { xs: '0.95rem', md: '1rem' },
                          fontWeight: 600,
                          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        }}
                      >
                        {crypto.label}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.8rem',
                          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        }}
                      >
                        {crypto.name}
                      </Typography>
                    </Box>

                    {/* Check */}
                    {isSelected && (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#29C480',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 16, color: '#0f172a' }} />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Stack>

            {/* Resumen de selección */}
            {selectedCrypto && (
              <Box
                sx={{
                  mt: 2.5,
                  pt: 2.5,
                  borderTop: '1px solid rgba(41, 196, 128, 0.15)',
                }}
              >
                <Box
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    background: 'rgba(41, 196, 128, 0.08)',
                    border: '1px solid rgba(41, 196, 128, 0.2)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(41, 196, 128, 0.15)',
                      borderRadius: '8px',
                    }}
                  >
                    {selectedCryptoData && (
                      <NextImage
                        src={selectedCryptoData.icon}
                        alt={selectedCryptoData.label}
                        width={24}
                        height={24}
                      />
                    )}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem',
                        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      {t.checkout?.selectedCrypto || 'Criptomoneda seleccionada'}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#ffffff',
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        fontWeight: 600,
                        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      }}
                    >
                      {selectedCryptoData?.label} en {selectedNetwork.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
