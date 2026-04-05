'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Stack, IconButton } from '@mui/material';
import { ContentCopy as CopyIcon, Check as CheckIcon, ArrowBack as BackIcon, QrCode as QrIcon } from '@mui/icons-material';
import NextImage from 'next/image';
import { useCryptoValidation, CryptoValidationRequest } from '@/presentation/@shared/hooks/use-crypto-validation';
import { axiosHelper } from '@/presentation/@shared/helpers/axios-helper';

const generateQRCodeUrl = (data: string): string => {
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
};

interface CryptoPaymentConfirmationProps {
  storeId: string;
  storeName: string;
  network: string;
  currency: string;
  amount: number;
  transactionId: string;
  orderId?: string;
  onSuccess?: (result: { txHash: string; status: string }) => void;
  onError?: (error: string) => void;
  onBack?: () => void;
}

const CRYPTO_ICONS: Record<string, string> = {
  BTC: '/images/btc.svg',
  ETH: '/images/eth.svg',
  USDT: '/store-vector/usdt.svg',
  USDC: '/store-vector/usdc.svg',
  BNB: '/images/bnb.svg',
  TRX: '/images/trx.svg',
  MATIC: '/images/matic.svg',
};

const NETWORK_NAMES: Record<string, string> = {
  'ERC-20': 'Ethereum (ERC-20)',
  'TRX': 'Tron (TRC-20)',
  'BSC': 'BNB Smart Chain (BEP-20)',
  'BTC': 'Bitcoin',
  'POLYGON': 'Polygon',
};

export const CryptoPaymentConfirmation: React.FC<CryptoPaymentConfirmationProps> = ({
  storeId,
  storeName,
  network,
  currency,
  amount,
  transactionId,
  orderId,
  onSuccess,
  onError,
  onBack,
}) => {
  const { validateTransaction, isValidating, validationError } = useCryptoValidation();

  const [txHash, setTxHash] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      setIsLoadingWallet(true);
      setWalletError(null);
      try {
        const response = await axiosHelper.crypto.getStoreWallet(storeId, network, currency);
        if (response.data?.success && response.data?.data?.wallet) {
          setWalletAddress(response.data.data.wallet);
        } else {
          setWalletError(response.data?.error || 'No se encontró la wallet configurada');
        }
      } catch (error) {
        setWalletError('Error al obtener la wallet de la tienda');
        console.error('Error fetching wallet:', error);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    if (storeId && network && currency) {
      fetchWallet();
    }
  }, [storeId, network, currency]);

  useEffect(() => {
    if (walletAddress) {
      setQrCodeUrl(generateQRCodeUrl(walletAddress));
    }
  }, [walletAddress]);

  const handleCopyWallet = useCallback(async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  }, [walletAddress]);

  const handlePasteHash = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTxHash(text.trim());
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
    }
  }, []);

  const handleValidate = useCallback(async () => {
    if (!txHash.trim()) {
      setLocalError('Por favor ingresa el hash de la transacción');
      return;
    }

    setLocalError(null);

    const validationData: CryptoValidationRequest = {
      transactionId,
      txHash: txHash.trim(),
      network,
      currency,
      expectedAmount: amount,
      storeId,
      orderId,
    };

    try {
      const result = await validateTransaction(validationData);

      if (result.success && result.data) {
        onSuccess?.({
          txHash: result.data.txHash,
          status: result.data.status,
        });
      } else {
        const errorMsg = result.error || 'La validación de la transacción falló';
        setLocalError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al validar la transacción';
      setLocalError(errorMsg);
      onError?.(errorMsg);
    }
  }, [txHash, transactionId, network, currency, amount, storeId, orderId, validateTransaction, onSuccess, onError]);

  const displayError = localError || validationError;
  const networkName = NETWORK_NAMES[network.toUpperCase()] || network;
  const cryptoIcon = CRYPTO_ICONS[currency.toUpperCase()];

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(0, 0, 0, 0.95) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(41, 196, 128, 0.2)',
        p: { xs: 2.5, md: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          sx={{
            color: '#ffffff',
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          Pago con Criptomonedas
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.875rem',
            mt: 0.5,
            fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          Tienda: {storeName}
        </Typography>
      </Box>

      {/* Loading */}
      {isLoadingWallet && (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={40} sx={{ color: '#29C480' }} />
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 2 }}>
            Cargando información de pago...
          </Typography>
        </Box>
      )}

      {/* Wallet error */}
      {walletError && !isLoadingWallet && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
          {walletError}
        </Alert>
      )}

      {/* Payment info */}
      {walletAddress && !isLoadingWallet && (
        <>
          {/* Monto y red */}
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              background: 'rgba(41, 196, 128, 0.08)',
              border: '1px solid rgba(41, 196, 128, 0.2)',
              borderRadius: '12px',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {cryptoIcon && (
                  <NextImage src={cryptoIcon} alt={currency} width={40} height={40} />
                )}
                <Box>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                    Total a pagar
                  </Typography>
                  <Typography
                    sx={{
                      color: '#ffffff',
                      fontSize: { xs: '1.5rem', md: '1.75rem' },
                      fontWeight: 700,
                      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    {amount} {currency}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
                Red: {networkName}
              </Typography>
            </Box>
          </Box>

          {/* QR Code */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
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
            {qrCodeUrl && (
              <Box
                component="img"
                src={qrCodeUrl}
                alt="QR Code"
                sx={{
                  width: 180,
                  height: 180,
                  borderRadius: '12px',
                  background: '#fff',
                  p: 1,
                }}
              />
            )}
          </Box>

          {/* Wallet address */}
          <Box
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(41, 196, 128, 0.15)',
              borderRadius: '12px',
              mb: 3,
            }}
          >
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem', mb: 1 }}>
              Dirección de wallet
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  wordBreak: 'break-all',
                  flex: 1,
                  fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                {walletAddress}
              </Typography>
              <IconButton
                onClick={handleCopyWallet}
                sx={{
                  color: copied ? '#29C480' : 'rgba(255, 255, 255, 0.5)',
                  background: copied ? 'rgba(41, 196, 128, 0.1)' : 'transparent',
                  '&:hover': {
                    background: 'rgba(41, 196, 128, 0.1)',
                  },
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Transaction hash input */}
          <Box
            sx={{
              p: 2,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(41, 196, 128, 0.15)',
              borderRadius: '12px',
              mb: 3,
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                mb: 1.5,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Ingresa el hash de la transacción
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(41, 196, 128, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(41, 196, 128, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#29C480' },
                  },
                }}
              />
              <Button
                onClick={handlePasteHash}
                sx={{
                  background: '#29C480',
                  color: '#0f172a',
                  fontWeight: 600,
                  px: 2,
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': { background: '#34d399' },
                }}
              >
                Pegar
              </Button>
            </Box>
          </Box>

          {/* Error */}
          {displayError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
              {displayError}
            </Alert>
          )}

          {/* Action buttons */}
          <Stack direction="row" spacing={2} justifyContent="center">
            {onBack && (
              <Button
                startIcon={<BackIcon />}
                onClick={onBack}
                sx={{
                  px: 3,
                  py: 1.5,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Volver
              </Button>
            )}
            <Button
              onClick={handleValidate}
              disabled={isValidating || !txHash.trim()}
              sx={{
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #29C480 0%, #22c55e 100%)',
                borderRadius: '10px',
                color: '#0f172a',
                textTransform: 'none',
                fontWeight: 700,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                boxShadow: '0 4px 14px rgba(41, 196, 128, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #34d399 0%, #29C480 100%)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {isValidating ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: 'inherit' }} />
                  Validando...
                </Box>
              ) : (
                'Validar y Finalizar'
              )}
            </Button>
          </Stack>

          {/* Instructions */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              background: 'rgba(41, 196, 128, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(41, 196, 128, 0.1)',
            }}
          >
            <Typography
              sx={{
                color: '#29C480',
                fontSize: '0.875rem',
                fontWeight: 600,
                mb: 1,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Instrucciones:
            </Typography>
            <Box
              component="ol"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.8rem',
                pl: 2.5,
                m: 0,
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                '& li': { mb: 0.5 },
              }}
            >
              <li>Escanea el QR o copia la dirección de wallet</li>
              <li>Realiza la transferencia del monto exacto desde tu wallet</li>
              <li>Copia el hash de la transacción una vez confirmada</li>
              <li>Pega el hash en el campo de arriba y presiona &quot;Validar&quot;</li>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CryptoPaymentConfirmation;
