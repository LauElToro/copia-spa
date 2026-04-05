'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Storefront as StoreIcon, Handshake as HandshakeIcon, LocalShipping as ShippingIcon } from '@mui/icons-material';
import { RadioCard } from '../radio-card';
import { HomeDelivery } from './home-delivery';
import { StorePickup } from './store-pickup';
import { useCheckoutStore } from '@/presentation/@shared/stores/checkout-store';
import { useCartStores } from '@/presentation/@shared/hooks/use-cart-stores';

interface ShippingMethodsProps {
  onShippingSelected?: (method: string) => void;
}

const SHIPPING_METHODS_VALUES = {
  'store-pickup': 'Retiro en sucursal',
  'seller-coordinate': 'Coordinar con el vendedor',
  'home-delivery': 'Envío a domicilio',
} as const;

const SHIPPING_METHODS = [
  {
    title: 'Retiro en sucursal',
    description: 'Retira tu pedido directamente en la tienda',
    id: 'store-pickup',
    value: SHIPPING_METHODS_VALUES['store-pickup'],
    icon: <StoreIcon />,
  },
  {
    title: 'Coordinar con el vendedor',
    description: 'Acuerda la entrega directamente con el vendedor',
    id: 'seller-coordinate',
    value: SHIPPING_METHODS_VALUES['seller-coordinate'],
    icon: <HandshakeIcon />,
  },
  {
    title: 'Envío a domicilio',
    description: 'Recibe tu pedido en la dirección que indiques',
    id: 'home-delivery',
    value: SHIPPING_METHODS_VALUES['home-delivery'],
    icon: <ShippingIcon />,
    hasComponent: true,
  },
];

export const ShippingMethods: React.FC<ShippingMethodsProps> = ({ onShippingSelected }) => {
  const [shippingMethod, setShippingMethod] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'Argentina',
  });

  const { setShippingMethod: setCheckoutShippingMethod, getCurrentStoreData, currentStoreIndex } = useCheckoutStore();
  const { stores } = useCartStores();

  useEffect(() => {
    const currentData = getCurrentStoreData();
    if (currentData?.shippingMethod) {
      setShippingMethod(currentData.shippingMethod);
    } else {
      // Resetear cuando cambia la tienda y no hay método seleccionado
      setShippingMethod(null);
      setShippingAddress({
        street: '',
        city: '',
        postalCode: '',
        province: '',
        country: 'Argentina',
      });
    }
  }, [getCurrentStoreData, currentStoreIndex]);

  const handleShippingMethod = (method: string) => {
    setShippingMethod(method);
    setCheckoutShippingMethod(method);
    onShippingSelected?.(method);
  };

  const handleAddressChange = (field: string, value: string) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showHomeDelivery = shippingMethod === SHIPPING_METHODS_VALUES['home-delivery'];
  const showStorePickup = shippingMethod === SHIPPING_METHODS_VALUES['store-pickup'];

  // Obtener la dirección completa de la tienda actual
  const currentStoreAddress = useMemo(() => {
    const currentData = getCurrentStoreData();
    const currentStoreId = currentData?.storeId;
    
    if (!currentStoreId) return '';
    
    const store = stores.find(s => s.id === currentStoreId);
    if (!store) return '';
    
    // Si hay información de dirección estructurada, construir la dirección completa
    if (store.address) {
      const parts: string[] = [];
      
      if (store.address.address) {
        parts.push(store.address.address);
      }
      
      // Evitar duplicados: si city y state son iguales, solo mostrar uno
      const city = store.address.city?.trim();
      const state = store.address.state?.trim();
      
      if (city && state && city.toLowerCase() === state.toLowerCase()) {
        // Si son iguales, mostrar solo uno (preferir state si está disponible)
        parts.push(state);
      } else {
        // Si son diferentes, mostrar ambos
        if (city) {
          parts.push(city);
        }
        if (state) {
          parts.push(state);
        }
      }
      
      if (store.address.postalCode) {
        parts.push(store.address.postalCode);
      }
      
      if (store.address.country) {
        parts.push(store.address.country);
      }
      
      return parts.length > 0 ? parts.join(', ') : '';
    }
    
    // Fallback al campo location si existe
    return store.location || '';
  }, [getCurrentStoreData, stores]);

  return (
    <Box>
      <Typography
        sx={{
          color: '#ffffff',
          fontSize: { xs: '1rem', md: '1.125rem' },
          fontWeight: 600,
          mb: 3,
          fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        Selecciona el método de envío
      </Typography>

      <Stack spacing={2}>
        {SHIPPING_METHODS.map((method) => (
          <RadioCard
            key={method.id}
            option={method}
            name="shipping-method"
            isSelected={shippingMethod === method.value}
            onChange={handleShippingMethod}
          />
        ))}
      </Stack>

      {showHomeDelivery && (
        <Box sx={{ mt: 3 }}>
          <HomeDelivery address={shippingAddress} onAddressChange={handleAddressChange} />
        </Box>
      )}

      {showStorePickup && (
        <Box sx={{ mt: 3 }}>
          <StorePickup storeAddress={currentStoreAddress} />
        </Box>
      )}
    </Box>
  );
};
