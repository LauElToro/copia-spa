'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, CircularProgress, Alert, Button, Stack } from '@mui/material';
import { ArrowBack as BackIcon, ArrowForward as ForwardIcon, Payment as PaymentIcon } from '@mui/icons-material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { SellerGroupProducts } from '@/presentation/@shared/components/ui/molecules/checkout/seller-group-products';
import { ShippingMethods } from '@/presentation/@shared/components/ui/molecules/checkout/shipping-methods';
import { PaymentMethod } from '@/presentation/@shared/components/ui/molecules/checkout/payment-method';
import { SummarySellerGroupProducts } from '@/presentation/@shared/components/ui/molecules/checkout/summary-seller-group-products';
import { StoreProgressIndicator } from '@/presentation/@shared/components/ui/molecules/checkout/store-progress-indicator';
import { CryptoPaymentConfirmation } from '@/presentation/@shared/components/ui/molecules/checkout/crypto-payment-confirmation';
import { useCart } from '@/presentation/@shared/hooks/use-cart';
import { useCartStores } from '@/presentation/@shared/hooks/use-cart-stores';
import { useCheckoutStore } from '@/presentation/@shared/stores/checkout-store';
import { useAuth } from '@/presentation/@shared/hooks/use-auth';
import { useUserProfile } from '@/presentation/@shared/hooks/use-user-profile';
import { useCheckout } from '@/presentation/@shared/hooks/use-checkout';

const STEPS = {
  shipping: { label: 'Envío', value: 'shipping', step: 1 },
  payment: { label: 'Pago', value: 'payment', step: 2 },
  confirm: { label: 'Confirmar', value: 'confirm', step: 3 },
  crypto_payment: { label: 'Pago Crypto', value: 'crypto_payment', step: 4 },
};

const CheckoutPage: React.FC = () => {
  const [step, setStep] = useState(STEPS.shipping.step);
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [cryptoPaymentData, setCryptoPaymentData] = useState<{
    storeId: string;
    storeName: string;
    network: string;
    currency: string;
    amount: number;
    transactionId: string;
    orderId?: string;
  } | null>(null);
  const [uploadBankTransferFileFn, setUploadBankTransferFileFn] = useState<(() => Promise<void>) | null>(null);

  const router = useRouter();
  const { sellerGroups } = useCart();
  const { stores } = useCartStores();
  const { isAuthenticated } = useAuth();
  const { userProfile } = useUserProfile();
  const {
    currentStoreIndex,
    completedStores,
    initializeStore,
    getCurrentStoreData,
    moveToNextStore,
    setShippingId,
  } = useCheckoutStore();
  const { submitPaymentOrder, completeCheckout, isSubmitting, error: submitError } = useCheckout();

  const userId = userProfile?.id || null;
  const hasCryptoPayment = completedStores.some((store) => store.paymentMethod === 'Criptomonedas');

  // Obtener nombre de la tienda enriquecido por storeId
  const getStoreName = (storeId: string, fallbackName: string) => {
    // Primero intentar obtener desde stores enriquecidos (obtenidos de la API)
    const enrichedStore = stores.find(s => s.id === storeId);
    if (enrichedStore?.name && enrichedStore.name !== 'Vendedor Desconocido') {
      return enrichedStore.name;
    }
    
    // Si el fallbackName es válido y no es "Vendedor Desconocido", usarlo
    if (fallbackName && fallbackName.trim() !== '' && fallbackName !== 'Vendedor Desconocido') {
      return fallbackName;
    }
    
    // Solo como último recurso usar "Vendedor Desconocido"
    return 'Vendedor Desconocido';
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (sellerGroups.length > 0 && currentStoreIndex < sellerGroups.length) {
      const currentGroup = sellerGroups[currentStoreIndex];
      initializeStore(currentGroup.storeId, currentGroup.storeName);
      // Limpiar la función de subida cuando cambia la tienda
      setUploadBankTransferFileFn(null);
      // Resetear el step a shipping cuando cambia la tienda (si no estamos en confirm)
      if (step !== STEPS.confirm.step && step !== STEPS.crypto_payment.step) {
        setStep(STEPS.shipping.step);
      }
      // Limpiar mensajes cuando cambia la tienda
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [currentStoreIndex, sellerGroups, initializeStore]);

  const currentStore = sellerGroups[currentStoreIndex];
  const totalStores = sellerGroups.length;
  const currentStoreData = getCurrentStoreData();
  const isCryptoPayment = currentStoreData?.paymentMethod === 'Criptomonedas';

  const handleContinue = async () => {
    setErrorMessage(null);
    setIsProcessingStep(true);

    try {
      if (step === STEPS.shipping.step) {
        if (!currentStoreData?.shippingMethod) {
          setErrorMessage('Por favor selecciona un método de envío');
          setIsProcessingStep(false);
          return;
        }

        if (!userId) {
          setErrorMessage('Usuario no autenticado');
          setIsProcessingStep(false);
          return;
        }

        const tempShippingId = `TEMP-SHIP-${Date.now()}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
        setShippingId(tempShippingId);
        setStep(STEPS.payment.step);
      } else if (step === STEPS.payment.step) {
        if (!currentStoreData?.paymentMethod) {
          setErrorMessage('Por favor selecciona un método de pago');
          setIsProcessingStep(false);
          return;
        }

        // Si es pago crypto, verificar que se haya seleccionado red y criptomoneda
        if (isCryptoPayment) {
          if (!currentStoreData?.cryptoNetwork || !currentStoreData?.cryptoId) {
            setErrorMessage('Por favor selecciona una red y criptomoneda');
            setIsProcessingStep(false);
            return;
          }
        }
        
        // Validar campos adicionales según el método de pago
        if (currentStoreData?.paymentMethod === 'Transferencia Bancaria') {
          // Para transferencia bancaria, subir el archivo si existe
          if (uploadBankTransferFileFn) {
            try {
              await uploadBankTransferFileFn();
            } catch {
              setErrorMessage('Error al subir el comprobante. Por favor, intente nuevamente.');
              setIsProcessingStep(false);
              return;
            }
          }
        }
        
        if (currentStoreData?.paymentMethod === 'Tarjeta de crédito o debito') {
          // Para tarjeta, el link de MercadoPago se guarda automáticamente si está disponible
          // La validación de link se hace en PaymentMethodDetails
        }
        
        if (currentStoreData?.paymentMethod === 'Efectivo') {
          // Efectivo no requiere validaciones adicionales
        }

        const hasMoreStores = currentStoreIndex < totalStores - 1;
        if (hasMoreStores) {
          // Mostrar mensaje de éxito para la tienda completada
          const completedStoreName = getStoreName(currentStore.storeId, currentStore.storeName);
          setSuccessMessage(`¡Compra de ${completedStoreName} completada! Continuando con la siguiente tienda...`);
          
          // Avanzar a la siguiente tienda después de un breve delay para mostrar el mensaje
          setTimeout(() => {
            moveToNextStore(totalStores);
            setStep(STEPS.shipping.step);
            setSuccessMessage(null); // Limpiar mensaje de éxito
            // Scroll al inicio para mostrar la nueva tienda
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 1500);
        } else {
          setStep(STEPS.confirm.step);
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error al procesar el paso');
    } finally {
      setIsProcessingStep(false);
    }
  };

  const handleFinalizePurchase = async () => {
    if (!userId) {
      setErrorMessage('Usuario no autenticado');
      return;
    }

    if (hasCryptoPayment) {
      try {
        setIsRedirecting(true);
        setErrorMessage(null);

        // Pasar true para skipAutoRedirect - no queremos que redirija automáticamente
        const result = await submitPaymentOrder(userId, true);
        const cryptoStore = completedStores.find((store) => store.paymentMethod === 'Criptomonedas');
        const cryptoStoreGroup = sellerGroups.find((group) => group.storeId === cryptoStore?.storeId);

        if (cryptoStore && cryptoStoreGroup) {
          setCryptoPaymentData({
            storeId: cryptoStore.storeId,
            storeName: cryptoStore.storeName,
            network: cryptoStore.cryptoNetwork || 'ERC-20',
            currency: cryptoStore.cryptoId?.toUpperCase() || 'USDT',
            amount: cryptoStoreGroup.total,
            transactionId: `TXN-${Date.now()}`,
            orderId: result?.orderId,
          });

          setIsRedirecting(false);
          setStep(STEPS.crypto_payment.step);
        } else {
          setIsRedirecting(false);
          setErrorMessage('Error: No se encontró información de pago crypto');
        }
      } catch (error) {
        setIsRedirecting(false);
        setErrorMessage(error instanceof Error ? error.message : 'Error al crear la orden de pago');
      }
      return;
    }

    try {
      setIsRedirecting(true);
      setErrorMessage(null);
      await submitPaymentOrder(userId);
    } catch (error) {
      setIsRedirecting(false);
      setErrorMessage(error instanceof Error ? error.message : 'Error al finalizar la compra');
    }
  };

  const handleCryptoSuccess = () => {
    // Usar completeCheckout para limpiar el carrito y el store antes de redirigir
    completeCheckout(cryptoPaymentData?.orderId);
  };

  const handleCryptoError = (error: string) => {
    setErrorMessage(error);
  };

  const handleCryptoBack = () => {
    setStep(STEPS.confirm.step);
    setCryptoPaymentData(null);
  };

  const handleGoBack = () => {
    setErrorMessage(null);

    if (step === STEPS.shipping.step) {
      if (currentStoreIndex === 0) {
        router.push('/cart');
      }
    } else if (step === STEPS.payment.step) {
      setStep(STEPS.shipping.step);
    } else if (step === STEPS.confirm.step) {
      setStep(STEPS.payment.step);
    } else if (step === STEPS.crypto_payment.step) {
      setStep(STEPS.confirm.step);
      setCryptoPaymentData(null);
    }
  };

  // Loading state
  if (isRedirecting) {
    return (
      <MainLayout>
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
          }}
        >
          <CircularProgress size={48} sx={{ color: '#29C480', mb: 3 }} />
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: '1.125rem',
              fontWeight: 500,
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Procesando tu compra...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  // Empty cart
  if (sellerGroups.length === 0) {
    return (
      <MainLayout>
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            px: 3,
          }}
        >
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              fontWeight: 600,
              mb: 3,
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            No hay productos en el carrito
          </Typography>
          <Button
            onClick={() => router.push('/stores')}
            sx={{
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #29C480 0%, #22c55e 100%)',
              borderRadius: '10px',
              color: '#0f172a',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              '&:hover': {
                background: 'linear-gradient(135deg, #34d399 0%, #29C480 100%)',
              },
            }}
          >
            Ir a tiendas
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box
        component="section"
        sx={{
          py: { xs: 3, md: 5 },
          backgroundColor: '#000000',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 4, lg: 6 } }}>
          {/* Progress Indicator */}
          {currentStore && (
            <StoreProgressIndicator
              currentStoreIndex={currentStoreIndex}
              totalStores={totalStores}
              storeName={getStoreName(currentStore.storeId, currentStore.storeName)}
              currentStep={step === STEPS.confirm.step ? 2 : step - 1}
              totalSteps={3}
            />
          )}

          {/* Success Message */}
          {successMessage && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: '12px',
                background: 'rgba(41, 196, 128, 0.1)',
                border: '1px solid rgba(41, 196, 128, 0.3)',
                color: '#ffffff',
                '& .MuiAlert-icon': { color: '#29C480' },
              }}
            >
              {successMessage}
            </Alert>
          )}

          {/* Error Message */}
          {(errorMessage || submitError) && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ffffff',
                '& .MuiAlert-icon': { color: '#ef4444' },
              }}
            >
              {errorMessage || submitError?.message}
            </Alert>
          )}

          {/* Crypto Payment Step */}
          {step === STEPS.crypto_payment.step && cryptoPaymentData ? (
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <CryptoPaymentConfirmation
                storeId={cryptoPaymentData.storeId}
                storeName={getStoreName(cryptoPaymentData.storeId, cryptoPaymentData.storeName)}
                network={cryptoPaymentData.network}
                currency={cryptoPaymentData.currency}
                amount={cryptoPaymentData.amount}
                transactionId={cryptoPaymentData.transactionId}
                orderId={cryptoPaymentData.orderId}
                onSuccess={handleCryptoSuccess}
                onError={handleCryptoError}
                onBack={handleCryptoBack}
              />
            </Box>
          ) : step === STEPS.confirm.step ? (
            /* Confirmation Step */
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: { xs: 3, lg: 4 },
              }}
            >
              {/* Products */}
              <Box
                sx={{
                  flex: { xs: '1 1 100%', lg: '0 0 35%' },
                  p: { xs: 2, md: 3 },
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(0, 0, 0, 0.7))',
                  border: '1px solid rgba(41, 196, 128, 0.1)',
                  borderRadius: '16px',
                }}
              >
                <SellerGroupProducts />
              </Box>

              {/* Summary */}
              <Box sx={{ flex: { xs: '1 1 100%', lg: '0 0 65%' } }}>
                <Typography
                  sx={{
                    color: '#ffffff',
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    fontWeight: 600,
                    mb: 3,
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  Confirma tu compra
                </Typography>

                <SummarySellerGroupProducts />

                {/* Action Buttons */}
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ mt: 4 }}
                >
                  <Button
                    startIcon={<BackIcon />}
                    onClick={handleGoBack}
                    disabled={isSubmitting}
                    sx={{
                      px: 4,
                      py: 1.5,
                      border: '2px solid rgba(41, 196, 128, 0.5)',
                      borderRadius: '10px',
                      color: '#29C480',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      '&:hover': {
                        borderColor: '#29C480',
                        background: 'rgba(41, 196, 128, 0.1)',
                      },
                    }}
                  >
                    Volver
                  </Button>
                  <Button
                    startIcon={<PaymentIcon />}
                    onClick={handleFinalizePurchase}
                    disabled={isSubmitting}
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
                    {isSubmitting ? 'Procesando...' : 'Finalizar Compra'}
                  </Button>
                </Stack>
              </Box>
            </Box>
          ) : (
            /* Checkout Steps (Shipping, Payment, Network) */
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                alignItems: { xs: 'stretch', lg: 'flex-start' },
                gap: { xs: 3, lg: 4 },
              }}
            >
              {/* Products Sidebar */}
              <Box
                sx={{
                  flex: { xs: '1 1 100%', lg: '0 0 35%' },
                  p: { xs: 2, md: 3 },
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(0, 0, 0, 0.7))',
                  border: '1px solid rgba(41, 196, 128, 0.1)',
                  borderRadius: '16px',
                  position: { lg: 'sticky' },
                  top: { lg: '100px' },
                }}
              >
                <SellerGroupProducts />
              </Box>

              {/* Step Content */}
              <Box sx={{ flex: { xs: '1 1 100%', lg: '0 0 65%' } }}>
                {step === STEPS.shipping.step && (
                  <ShippingMethods key={`shipping-${currentStoreIndex}`} />
                )}
                {step === STEPS.payment.step && (
                  <PaymentMethod 
                    key={`payment-${currentStoreIndex}`}
                    step={step} 
                    onUploadFileReady={(uploadFn) => setUploadBankTransferFileFn(() => uploadFn)}
                  />
                )}

                {/* Navigation Buttons */}
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ mt: 4 }}
                >
                  <Button
                    startIcon={<BackIcon />}
                    onClick={handleGoBack}
                    disabled={isProcessingStep}
                    sx={{
                      px: 4,
                      py: 1.5,
                      border: '2px solid rgba(41, 196, 128, 0.5)',
                      borderRadius: '10px',
                      color: '#29C480',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      '&:hover': {
                        borderColor: '#29C480',
                        background: 'rgba(41, 196, 128, 0.1)',
                      },
                    }}
                  >
                    Volver
                  </Button>
                  <Button
                    endIcon={isProcessingStep ? <CircularProgress size={16} sx={{ color: '#0f172a' }} /> : <ForwardIcon />}
                    onClick={handleContinue}
                    disabled={isProcessingStep}
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
                        background: 'linear-gradient(135deg, #29C480 0%, #22c55e 100%)',
                        color: '#0f172a',
                        opacity: 0.7,
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    {isProcessingStep ? 'Cargando...' : 'Continuar'}
                  </Button>
                </Stack>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </MainLayout>
  );
};

export default CheckoutPage;
