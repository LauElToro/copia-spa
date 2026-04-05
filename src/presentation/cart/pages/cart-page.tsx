'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Stack } from '@mui/material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { CartSection } from '@/presentation/@shared/components/ui/molecules/cart-section';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { useCart, useFreeShipping, useCartOperations } from '@/presentation/@shared/hooks/use-cart';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

const CartPage: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const {
    items,
    totalItems,
  } = useCart();

  const { remainingForFreeShipping, isFreeShippingEligible } = useFreeShipping();
  const { clearCart, isLoading: isClearingCart } = useCartOperations();

  const handleContinueShopping = useCallback(() => {
    router.push('/stores');
  }, [router]);

  const handleClearCart = useCallback(async () => {
    try {
      await clearCart();
      toast.success('Carrito vaciado correctamente', { position: 'bottom-center' });
    } catch (error) {
      toast.error('Error al vaciar el carrito', { position: 'bottom-center' });
      console.error('Error clearing cart:', error);
    }
  }, [clearCart, toast]);

  const handleRetry = useCallback(() => {
    // Si hay un error, simplemente recargamos la página
    window.location.reload();
  }, []);

  return (
    <MainLayout>
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          width: "100%",
          backgroundColor: '#000000',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
          <Box sx={{ px: { xs: 3, md: 0 } }}>
            <Stack spacing={3}>
              <Breadcrumb
                items={[
                  { label: t.admin?.home || 'Inicio', href: '/' },
                  { label: 'Carrito' } // TODO: Agregar traducción para "Carrito"
                ]}
              />
              <CartSection
                title="Carrito de compras"
                isLoading={false}
                isError={false}
                itemsCount={items.length}
                totalItems={totalItems}
                remainingForFreeShipping={remainingForFreeShipping}
                isFreeShippingEligible={isFreeShippingEligible}
                onRetry={handleRetry}
                onClearCart={handleClearCart}
                onContinueShopping={handleContinueShopping}
                isClearingCart={isClearingCart}
              />
            </Stack>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default CartPage;
