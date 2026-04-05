'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { CurrencyBitcoin as CryptoIcon, CreditCard as CardIcon, AccountBalance as BankIcon, Payments as CashIcon } from '@mui/icons-material';
import { RadioCard } from '../radio-card';
import { PaymentMethodDetails } from './payment-method-details';
import { useCheckoutStore } from '@/presentation/@shared/stores/checkout-store';
import { useCart } from '@/presentation/@shared/hooks/use-cart';


interface PaymentMethodProps {
  step: number;
  onPaymentSelected?: (method: string, provider: string) => void;
  onNetworkSelected?: (network: string, cryptoId: string) => void;
  onUploadFileReady?: (uploadFn: () => Promise<void>) => void;
}

const PAYMENT_METHODS_VALUES = {
  crypto: 'Criptomonedas',
  card: 'Tarjeta de crédito o debito',
  transfer: 'Transferencia Bancaria',
  cash: 'Efectivo',
} as const;

const PAYMENT_METHODS = [
  {
    title: 'Criptomonedas',
    description: 'Bitcoin, Ethereum, USDT y más',
    id: 'crypto-pay',
    value: PAYMENT_METHODS_VALUES['crypto'],
    provider: 'CRYPTO_NETWORK',
    icon: <CryptoIcon />,
  },
  {
    title: 'Tarjeta de crédito o débito',
    description: 'Visa, Mastercard, American Express',
    id: 'card-pay',
    value: PAYMENT_METHODS_VALUES['card'],
    provider: 'VISA',
    icon: <CardIcon />,
  },
  {
    title: 'Transferencia Bancaria',
    description: 'Pago directo desde tu banco',
    id: 'transfer',
    value: PAYMENT_METHODS_VALUES['transfer'],
    provider: 'BANK',
    icon: <BankIcon />,
  },
  {
    title: 'Efectivo',
    description: 'Paga en efectivo al recibir',
    id: 'cash',
    value: PAYMENT_METHODS_VALUES['cash'],
    provider: 'CASH',
    icon: <CashIcon />,
  },
];

export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  step,
  onPaymentSelected,
  onUploadFileReady,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const { setPaymentMethod, getCurrentStoreData, currentStoreIndex } = useCheckoutStore();
  const { sellerGroups } = useCart();

  // Obtener storeId actual
  const currentStoreId = useMemo(() => {
    return sellerGroups[currentStoreIndex]?.storeId || null;
  }, [sellerGroups, currentStoreIndex]);

  useEffect(() => {
    const currentData = getCurrentStoreData();
    if (currentData?.paymentMethod) {
      setSelectedPaymentMethod(currentData.paymentMethod);
    } else {
      // Resetear cuando cambia la tienda y no hay método de pago seleccionado
      setSelectedPaymentMethod(null);
    }
  }, [getCurrentStoreData, currentStoreIndex]);

  // Mostrar siempre todos los métodos de pago
  // La disponibilidad se verifica cuando se selecciona el método
  const availablePaymentMethods = useMemo(() => {
    return PAYMENT_METHODS;
  }, []);

  const handleMethodSelected = (value: string) => {
    const method = PAYMENT_METHODS.find((m) => m.value === value);
    if (method) {
      setSelectedPaymentMethod(value);
      setPaymentMethod(value, method.provider);
      onPaymentSelected?.(value, method.provider);
    }
  };

  return (
    <Box>
      {step === 2 && (
        <>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: { xs: '1rem', md: '1.125rem' },
              fontWeight: 600,
              mb: 3,
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Selecciona tu método de pago
          </Typography>

          <Stack spacing={2}>
            {availablePaymentMethods.map((method) => (
              <RadioCard
                key={method.id}
                option={method}
                name="payment-method"
                isSelected={selectedPaymentMethod === method.value}
                onChange={handleMethodSelected}
              />
            ))}
          </Stack>
          
          {/* Mostrar detalles del método de pago seleccionado */}
          {selectedPaymentMethod && currentStoreId && (
            <PaymentMethodDetails
              storeId={currentStoreId}
              paymentMethod={selectedPaymentMethod}
              onUploadFile={onUploadFileReady}
            />
          )}
        </>
      )}

    </Box>
  );
};
