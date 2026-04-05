"use client";

import React, { useCallback, useMemo } from "react";
import { Box, CircularProgress, Container, Stack, Button } from "@mui/material";
import Link from "next/link";
import NextImage from "next/image";
import MainLayout from "@/presentation/@shared/components/layouts/main-layout";
import { Card } from '@/presentation/@shared/components/ui/atoms/card';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { useProductDetailPage } from "../hooks/use-product-detail-page";
import { getPrimaryImage } from '@/presentation/@shared/utils/product-mapper';
import Grill from "../components/grill/grill";
import { ProductGallery } from "../components/product-gallery/product-gallery";
import Reviews from "../components/reviews/reviews";
import Questions from "../components/questions/questions";
import "../components/reviews/reviews.css";
import Description from "../components/description/description";
import StoreData from "../components/store-data/store-data";
import ProductData from "../components/product-data/product-data";
import RelatedProducts from "../components/related-products/related-products";
import { useIsMobile } from '@/presentation/@shared/hooks/use-is-mobile';
import { PaymentIcons } from "../components/payments-data/payments-data";
import { ShippingIcons } from "../components/shipping-data/shipping-data";
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useModal } from '@/presentation/@shared/hooks/use-modal';
import { ImageModal } from '@/presentation/@shared/components/ui/molecules/image-modal';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { AnimatedSection } from '@/presentation/@shared/components/ui/atoms/animated-section';
import type { ModalProps } from '@/presentation/@shared/components/ui/atoms/modal';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb';
import { useOptionalAuthContext } from '@/presentation/@shared/contexts/auth-context';
import { useLibiaPageContext } from '@/presentation/@shared/contexts/libia-page-context';
import { ProductSectionNav } from '../components/product-section-nav/product-section-nav';

// Componente HeroBanner con efecto moderno de entrada
// const HeroBanner = ({ src }: { src: string }) => {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [imageLoaded, setImageLoaded] = useState(false);

//   useEffect(() => {
//     // Trigger animation after component mounts
//     const timer = setTimeout(() => {
//       setIsLoaded(true);
//     }, 50);
//     return () => clearTimeout(timer);
//   }, []);

//   const handleImageLoad = () => {
//     setImageLoaded(true);
//   };

//   return (
//     <>
//       {/* Global keyframes for shimmer animation */}
//       <Box
//         component="style"
//         dangerouslySetInnerHTML={{
//           __html: `
//             @keyframes heroShimmer {
//               0% {
//                 transform: translateX(-100%);
//               }
//               100% {
//                 transform: translateX(100%);
//               }
//             }
//             .hero-shimmer {
//               animation: heroShimmer 2.5s ease-in-out 0.8s;
//             }
//           `
//         }}
//       />
//       <Box
//         component="section"
//         sx={{
//           position: 'relative',
//           width: '100%',
//           height: { xs: '240px', md: '360px' },
//           overflow: 'hidden',
//           backgroundColor: '#000000',
//           '&::before': {
//             content: '""',
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)',
//             zIndex: 1,
//             opacity: isLoaded ? 1 : 0,
//             transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
//           }
//         }}
//       >
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             opacity: isLoaded && imageLoaded ? 1 : 0,
//             transform: isLoaded && imageLoaded ? 'scale(1)' : 'scale(1.1)',
//             transition: 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1), transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
//             willChange: 'opacity, transform',
//           }}
//         >
//           <NextImage
//             src={src}
//             alt="Store banner"
//             fill
//             style={{
//               objectFit: 'cover',
//               objectPosition: 'center',
//             }}
//             priority
//             unoptimized={src.startsWith('/') || src.startsWith('http') || src.includes('s3.')}
//             onLoad={handleImageLoad}
//             onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
//               const target = e.target as HTMLImageElement;
//               const defaultImage = '/images/banner-stores/banner-stores.svg';
//               if (target.src !== defaultImage) {
//                 target.src = defaultImage;
//               }
//               handleImageLoad();
//             }}
//           />
//         </Box>

//         {/* Shimmer effect overlay */}
//         {isLoaded && imageLoaded && (
//           <Box
//             className="hero-shimmer"
//             sx={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               width: '100%',
//               height: '100%',
//               background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
//               zIndex: 2,
//               pointerEvents: 'none',
//             }}
//           />
//         )}
//       </Box>
//     </>
//   );
// };

const ProductDetailPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const { openModal } = useModal();
  const toast = useToast();
  const authContext = useOptionalAuthContext();
  const libiaPage = useLibiaPageContext();
  const currentUserId = authContext?.user?.id;
  // Only pass isAuthenticated if context is loaded (not loading)
  // If still loading, pass undefined so child can handle its own loading state
  const isAuthenticated = authContext?.isLoading ? undefined : (authContext?.isAuthenticated ?? false);

  const {
    product,
    shippingOptions,
    paymentOptions,
    isLoading,
    isAddingToCart,
    isFavoriteLoading,
    isError,
    showSellerDesc,
    setShowSellerDesc,
    showProductDesc,
    setShowProductDesc,
    hasProductSpecs,
    hasDescription,
    hasRelatedProducts,
    hasShippingOptions,
    hasPaymentOptions,
    handleAddToCart,
    handleToggleFavorite,
    isFavorite,
    stopAll,
  } = useProductDetailPage();

  // Loading state for buttons only (not full page)
  const isButtonLoading = isAddingToCart || isFavoriteLoading;

  // Check if the current user is the product owner (store owner)
  const productOwnerId = product?.account_id || product?.accountId;
  const isProductOwner = Boolean(currentUserId && productOwnerId && currentUserId === productOwnerId);

  // Contexto LIBIA producto: usa endpoint /chat/seller/plan/product cuando se ve un producto
  React.useEffect(() => {
    if (!libiaPage || !product) return;
    const storeId = (product as { store_id?: string; storeId?: string }).store_id || (product as { store_id?: string; storeId?: string }).storeId;
    const productId = product.id;
    if (storeId && productId) {
      libiaPage.setProductContext(storeId, productId);
      return () => libiaPage.clearProductContext();
    }
  }, [libiaPage, product]);

  // Debug: Log product owner calculation
  React.useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && product) {
      console.log('[ProductDetailPage] Auth & Owner Debug:', {
        contextIsAuthenticated: authContext?.isAuthenticated,
        contextIsLoading: authContext?.isLoading,
        contextUserId: currentUserId,
        productAccountId: product?.account_id,
        productAccountIdAlt: product?.accountId,
        productOwnerId,
        isProductOwner,
        passedIsAuthenticated: isAuthenticated,
        hasLocalStorageToken: !!localStorage.getItem('accessToken'),
        hasLocalStorageUser: !!localStorage.getItem('user'),
        localStorageUser: localStorage.getItem('user')
      });
    }
  }, [authContext?.isAuthenticated, authContext?.isLoading, currentUserId, product, productOwnerId, isProductOwner, isAuthenticated]);

  // DISABLED: Store hero banner removed from product detail page
  // Commenting out to avoid unnecessary API calls
  /*
  const productStoreId = product?.storeId || product?.store_id;
  const seller = (product as { seller?: { storeId?: string; bannerUrl?: string; avatar?: string; name?: string } })?.seller;
  const storeId = seller?.storeId || productStoreId;

  const storeQuery = useQuery({
    queryKey: ['store-hero', storeId],
    queryFn: async () => {
      if (!storeId) return null;
      try {
        const response = await axiosHelper.stores.getPublic(storeId);
        const data = response.data?.data || response.data;
        return data;
      } catch {
        return null;
      }
    },
    enabled: Boolean(storeId) && !seller,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const storeData = storeQuery.data as Record<string, unknown> | null;
  const information = storeData?.information as Record<string, unknown> | undefined;
  const media = storeData?.media as Record<string, unknown> | undefined;

  const bannerSrc = useMemo(() => {
    if (seller?.bannerUrl) return seller.bannerUrl;
    if (storeData) {
      const bannerUrl = getAvatarUrl(media?.banner) || (information?.banner as string | undefined);
      if (bannerUrl) return bannerUrl;
    }
    return null;
  }, [seller, storeData, media, information]);
  */

  // Construir items del breadcrumb (antes de early returns)
  const breadcrumbItems = useMemo(() => {
    if (!product) return [{ label: t.categories?.backToHome || 'Inicio', href: '/' }];

    const items: Array<{ label: string; href?: string }> = [
      { label: t.categories?.backToHome || 'Inicio', href: '/' }
    ];

    // Agregar categoría si existe
    const category = (product as { category?: { id?: string; name?: string } })?.category;
    if (category?.id && category?.name) {
      items.push({
        label: category.name,
        href: `/categories/${category.id}`
      });
    }

    // Agregar nombre del producto (último item, sin href)
    if (product.name) {
      items.push({
        label: product.name
      });
    }

    return items;
  }, [product, t.categories?.backToHome]);

  const sectionScrollSx = useMemo(
    () => ({ scrollMarginTop: { xs: '108px', md: '96px' } }) as const,
    [],
  );

  const sectionNavItems = useMemo(() => {
    const shop = t.shop as Record<string, string | undefined>;
    const items: { id: string; label: string }[] = [
      { id: 'product-section-gallery', label: shop.sectionNavPhotos ?? 'Fotos' },
      { id: 'product-section-buy', label: shop.sectionNavBuy ?? 'Comprar' },
    ];
    if (hasProductSpecs) {
      items.push({ id: 'product-section-specs', label: shop.sectionNavSpecs ?? 'Ficha' });
    }
    items.push({ id: 'product-section-store', label: shop.sectionNavStore ?? 'Tienda' });
    if (hasShippingOptions) {
      items.push({ id: 'product-section-shipping', label: shop.sectionNavShipping ?? 'Envíos' });
    }
    if (hasPaymentOptions) {
      items.push({ id: 'product-section-payment', label: shop.sectionNavPayment ?? 'Pago' });
    }
    if (hasRelatedProducts) {
      items.push({ id: 'product-section-related', label: shop.sectionNavRelated ?? 'Similares' });
    }
    if (hasDescription) {
      items.push({ id: 'product-section-description', label: shop.sectionNavDescription ?? 'Descripción' });
    }
    items.push({ id: 'product-section-qa', label: shop.sectionNavReviews ?? 'Opiniones' });
    return items;
  }, [
    t.shop,
    hasProductSpecs,
    hasShippingOptions,
    hasPaymentOptions,
    hasRelatedProducts,
    hasDescription,
  ]);

  // Wrapper para agregar al carrito con toast del nuevo sistema
  const handleAddToCartWithToast = useCallback((quantity: number) => {
    handleAddToCart(quantity, ({ productName, quantity: qty }) => {
      toast.success(
        `¡Producto agregado! ${qty} ${qty === 1 ? 'unidad' : 'unidades'} de "${productName}"`,
        { duration: 4000 }
      );
    });
  }, [handleAddToCart, toast]);

  // Mostrar loading mientras se cargan los datos del producto
  if (isLoading) {
    return (
      <MainLayout>
        <Box
          component="section"
          sx={{
            py: { xs: 4, md: 6 },
            backgroundColor: '#000000',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#29C480' }} size="large" />
            </Box>
          </Container>
        </Box>
      </MainLayout>
    );
  }

  // Si no hay producto válido o hay error, mostrar EmptyState
  if (!product || isError) {
    return (
      <MainLayout>
        <Box
          component="section"
          sx={{
            py: { xs: 4, md: 6 },
            backgroundColor: '#000000',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Container maxWidth="xl">
            <EmptyState
              title={t.shop.productNotFound}
              message={t.shop.productNotFoundMessage}
              action={
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <Button
                    sx={{
                      px: 4,
                      py: 1.5,
                      backgroundColor: '#29C480',
                      color: '#1e293b',
                      fontWeight: 600,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        backgroundColor: '#22c55e',
                      }
                    }}
                  >
                    {t.categories.backToHome}
                  </Button>
                </Link>
              }
            />
          </Container>
        </Box>
      </MainLayout>
    );
  }


  return (
    <MainLayout>
      {/* Hero con banner de la tienda - DISABLED: Remove store banner from product detail page
      {bannerSrc && (
        <HeroBanner src={bannerSrc} />
      )}
      */}

      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          backgroundColor: '#000000',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 0,
          paddingBottom: 0,
          pb: 0,
          mb: 0
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0, lg: 0 }, position: 'relative', overflow: 'visible' }}>
          <Box sx={{ px: { xs: 3, md: 4 }, position: 'relative' }}>
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />
            <ProductSectionNav items={sectionNavItems} />
            {isMobile ? (
              <Stack spacing={3}>
                <AnimatedSection delay={0} direction="up" threshold={0.1}>
                  <Box id="product-section-gallery" sx={sectionScrollSx}>
                    <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                      <ProductGallery
                        product={product}
                        openModal={openModal}
                        stopAll={stopAll}
                      />
                    </Card>
                  </Box>
                </AnimatedSection>

                <AnimatedSection delay={100} direction="up" threshold={0.1}>
                  <Box id="product-section-buy" sx={sectionScrollSx}>
                    <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                    <ProductData
                      product={product}
                      handleAddToCart={handleAddToCartWithToast}
                      handleToggleFavorite={handleToggleFavorite}
                      isLoading={isButtonLoading}
                      isFavorite={isFavorite}
                      isProductOwner={isProductOwner}
                      isAuthenticated={isAuthenticated}
                    />
                    </Card>
                  </Box>
                </AnimatedSection>

                {hasProductSpecs && (
                  <AnimatedSection delay={200} direction="up" threshold={0.1}>
                    <Box id="product-section-specs" sx={sectionScrollSx}>
                      <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                        <Grill product={product} />
                      </Card>
                    </Box>
                  </AnimatedSection>
                )}

                <AnimatedSection delay={300} direction="up" threshold={0.1}>
                  <Box id="product-section-store" sx={sectionScrollSx}>
                    <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                      <StoreData product={product} showSellerDesc={showSellerDesc} setShowSellerDesc={setShowSellerDesc} />
                    </Card>
                  </Box>
                </AnimatedSection>

                {hasShippingOptions && (
                  <AnimatedSection delay={400} direction="up" threshold={0.1}>
                    <Box id="product-section-shipping" sx={sectionScrollSx}>
                      <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                        <ShippingIcons shippingOptions={shippingOptions} />
                      </Card>
                    </Box>
                  </AnimatedSection>
                )}

                {hasPaymentOptions && (
                  <AnimatedSection delay={500} direction="up" threshold={0.1}>
                    <Box id="product-section-payment" sx={sectionScrollSx}>
                      <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                        <PaymentIcons paymentOptions={paymentOptions!} />
                      </Card>
                    </Box>
                  </AnimatedSection>
                )}
              </Stack>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
                <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
                  <Stack spacing={3}>
                    <AnimatedSection delay={0} direction="right" threshold={0.1}>
                      <Box id="product-section-gallery" sx={sectionScrollSx}>
                        <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                          <ProductGallery
                            product={product}
                            openModal={openModal}
                            stopAll={stopAll}
                          />
                        </Card>
                      </Box>
                    </AnimatedSection>

                    {hasProductSpecs && (
                      <AnimatedSection delay={150} direction="right" threshold={0.1}>
                        <Box id="product-section-specs" sx={sectionScrollSx}>
                          <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                            <Grill product={product} />
                          </Card>
                        </Box>
                      </AnimatedSection>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
                  <Stack spacing={3}>
                    <AnimatedSection delay={100} direction="left" threshold={0.1}>
                      <Box id="product-section-buy" sx={sectionScrollSx}>
                        <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                        <ProductData
                          product={product}
                          handleAddToCart={handleAddToCartWithToast}
                          handleToggleFavorite={handleToggleFavorite}
                          isLoading={isButtonLoading}
                          isFavorite={isFavorite}
                          isProductOwner={isProductOwner}
                          isAuthenticated={isAuthenticated}
                        />
                        </Card>
                      </Box>
                    </AnimatedSection>

                    <AnimatedSection delay={250} direction="left" threshold={0.1}>
                      <Box id="product-section-store" sx={sectionScrollSx}>
                        <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                          <StoreData product={product} showSellerDesc={showSellerDesc} setShowSellerDesc={setShowSellerDesc} />
                        </Card>
                      </Box>
                    </AnimatedSection>

                    {hasShippingOptions && (
                      <AnimatedSection delay={350} direction="left" threshold={0.1}>
                        <Box id="product-section-shipping" sx={sectionScrollSx}>
                          <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                            <ShippingIcons shippingOptions={shippingOptions} />
                          </Card>
                        </Box>
                      </AnimatedSection>
                    )}

                    {hasPaymentOptions && (
                      <AnimatedSection delay={450} direction="left" threshold={0.1}>
                        <Box id="product-section-payment" sx={sectionScrollSx}>
                          <Card className="card-product" sx={{ padding: 2, borderRadius: 2, background: 'transparent', border: 'none' }}>
                            <PaymentIcons paymentOptions={paymentOptions!} />
                          </Card>
                        </Box>
                      </AnimatedSection>
                    )}
                  </Stack>
                </Box>
              </Box>
            )}

            {hasRelatedProducts && (
              <AnimatedSection delay={550} direction="up" threshold={0.1}>
                <Box id="product-section-related" sx={{ marginTop: 4, ...sectionScrollSx }}>
                  <Card className="card-product" sx={{ borderRadius: 2, padding: 2, background: 'transparent', border: 'none' }}>
                    <RelatedProducts product={product} />
                  </Card>
                </Box>
              </AnimatedSection>
            )}

            {hasDescription && (
              <AnimatedSection delay={600} direction="up" threshold={0.1}>
                <Box
                  id="product-section-description"
                  className="card-description"
                  sx={{ marginTop: { xs: 2, md: 2.5 }, ...sectionScrollSx }}
                >
                  <Card className="card-product" sx={{ borderRadius: 2, padding: 2, background: 'transparent', border: 'none' }}>
                    <Description
                      product={product}
                      showProductDesc={showProductDesc}
                      setShowProductDesc={setShowProductDesc}
                    />
                  </Card>
                </Box>
              </AnimatedSection>
            )}
          </Box>
        </Container>
      </Box>

      {/* Sección de Preguntas con background de fibra de carbono */}
      <AnimatedSection delay={650} direction="up" threshold={0.1}>
        <Box sx={{ width: "100%", position: "relative" }}>
            {/* Línea separadora verde arriba - 100% del ancho de la pantalla */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: 'linear-gradient(90deg, transparent 0%, transparent 5%, #29C480 25%, #29C480 75%, transparent 95%, transparent 100%)',
                boxShadow: '0 0 20px rgba(41, 196, 128, 0.5), 0 0 40px rgba(41, 196, 128, 0.2), inset 0 0 15px rgba(41, 196, 128, 0.15)',
                borderRadius: '9999px',
                zIndex: 10
              }}
            />
            <Box
              component="section"
              id="product-section-qa"
              className="card-questions"
            sx={{
              scrollMarginTop: { xs: '108px', md: '96px' },
              py: { xs: 5, md: 20 },
              pt: { xs: 8, md: 24 },
              pb: 0,
              px: 0,
              background: `
                radial-gradient(ellipse 1400px 800px at 50% 30%, #0a2820 0%, #000000 70%),
                radial-gradient(circle at 15% 80%, #1a1a1a 0%, #000000 60%),
                radial-gradient(ellipse 900px 700px at 85% 60%, #0a1a15 0%, #000000 65%)
              `,
              width: "100%",
              position: 'relative',
              borderTop: "1px solid rgba(41, 196, 128, 0.05)",
              overflow: 'hidden',
              '&.card-questions': {
                paddingBottom: '0 !important',
                '@media (min-width: 992px)': {
                  paddingBottom: '0 !important'
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    rgba(0, 0, 0, 0.25) 0px,
                    rgba(0, 0, 0, 0.25) 1px,
                    transparent 1px,
                    transparent 2px,
                    rgba(10, 40, 32, 0.3) 2px,
                    rgba(10, 40, 32, 0.3) 3px,
                    transparent 3px,
                    transparent 4px
                  ),
                  repeating-linear-gradient(
                    -45deg,
                    rgba(0, 0, 0, 0.25) 0px,
                    rgba(0, 0, 0, 0.25) 1px,
                    transparent 1px,
                    transparent 2px,
                    rgba(10, 40, 32, 0.3) 2px,
                    rgba(10, 40, 32, 0.3) 3px,
                    transparent 3px,
                    transparent 4px
                  )
                `,
                backgroundSize: '6px 6px, 6px 6px',
                opacity: 0.9,
                zIndex: 1,
                pointerEvents: 'none'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    rgba(0, 0, 0, 0.15) 0px,
                    rgba(0, 0, 0, 0.15) 1px,
                    transparent 1px,
                    transparent 2px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    rgba(0, 0, 0, 0.15) 0px,
                    rgba(0, 0, 0, 0.15) 1px,
                    transparent 1px,
                    transparent 2px
                  )
                `,
                backgroundSize: '3px 3px',
                opacity: 0.7,
                zIndex: 1,
                pointerEvents: 'none',
                mixBlendMode: 'overlay'
              }
            }}
          >
            <Box sx={{
              width: "100%",
              mx: "auto",
              position: "relative",
              zIndex: 2
            }}>
              <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0, lg: 0 }, position: 'relative', zIndex: 2, pb: 0, marginBottom: 0 }}>
                <Box sx={{
                  px: { xs: 3, sm: 3.5, md: 4 },
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  maxWidth: '100%',
                  pb: 0,
                  marginBottom: 0
                }}>
                  <Box sx={{ marginBottom: { xs: 3, sm: 4, md: 4 } }}>
                    <Text
                      variant="h5"
                      sx={{
                        fontSize: { xs: '1rem', sm: '1.0625rem', md: '1.125rem' },
                        fontWeight: 700,
                        color: '#ffffff',
                        marginBottom: { xs: 2, sm: 2.5, md: 3 },
                        marginTop: 0
                      }}
                    >
                      {t.shop.questionsAboutProduct}
                    </Text>
                    <Box className="card-reviews" sx={{ width: '100%' }}>
                      <Box
                        sx={{
                          padding: { xs: 2, md: 3 },
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(0, 0, 0, 0.6))',
                          border: '1px solid rgba(41, 196, 128, 0.1)',
                          width: '100%',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                          boxShadow: 'none !important',
                          filter: 'none !important',
                          outline: 'none !important',
                          WebkitBoxShadow: 'none !important',
                          MozBoxShadow: 'none !important',
                          textShadow: 'none !important',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&::before': {
                            display: 'none !important'
                          },
                          '&::after': {
                            display: 'none !important'
                          },
                          '&:hover': {
                            borderColor: 'rgba(41, 196, 128, 0.4)',
                            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.7))',
                            boxShadow: 'none !important',
                            filter: 'none !important',
                            outline: 'none !important',
                            WebkitBoxShadow: 'none !important',
                            MozBoxShadow: 'none !important',
                            textShadow: 'none !important',
                            '&::before': {
                              display: 'none !important'
                            },
                            '&::after': {
                              display: 'none !important'
                            }
                          }
                        }}
                      >
                        <Questions product={product} />
                      </Box>
                    </Box>
                  </Box>

                  {/* User Reviews debajo del árbol de preguntas */}
                  <Box className="card-reviews" sx={{ marginTop: { xs: 3, sm: 4, md: 4 }, marginBottom: { xs: 6, sm: 7, md: 8 }, width: '100%', maxWidth: '100%', pb: 0 }}>
                    <Reviews product={product} />
                  </Box>
                </Box>
              </Container>
            </Box>
          </Box>
        </Box>
      </AnimatedSection>
    </MainLayout>
  );
};

export default ProductDetailPage;
