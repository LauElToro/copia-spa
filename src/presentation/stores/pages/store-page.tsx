"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Stack, CircularProgress, Typography } from '@mui/material';
import NextImage from 'next/image';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { Card } from '@/presentation/@shared/components/ui/atoms/card';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import { NotificationBanner } from '@/presentation/@shared/components/ui/atoms/notification-banner';
import { ProductCarousel } from '@/presentation/@shared/components/ui/molecules/product-carousel';
import type { ProductCardProps } from '@/presentation/@shared/components/ui/molecules/product-card/product-card';
import { useStoreProfile, StoreProfile } from '@/presentation/@shared/hooks/use-store';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import Stars from '@/presentation/shop/components/stars/stars';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useModal } from '@/presentation/@shared/hooks/use-modal';
import { ImageModal } from '@/presentation/@shared/components/ui/molecules/image-modal';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { Icon } from '@/presentation/@shared/components/ui/atoms/icon';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb';
import { AnimatedSection } from '@/presentation/@shared/components/ui/atoms/animated-section';
import './store-page.css';

// Componente HeroBanner con efecto moderno de entrada
const HeroBanner = ({ src, onClick }: { src: string; onClick?: () => void }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <>
      {/* Global keyframes for shimmer animation */}
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes heroShimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
            .hero-shimmer {
              animation: heroShimmer 2.5s ease-in-out 0.8s;
            }
          `
        }}
      />
      <Box
        component="section"
        onClick={onClick}
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '240px', md: '360px' },
          overflow: 'hidden',
          backgroundColor: '#000000',
          cursor: onClick ? 'zoom-in' : 'default',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)',
            zIndex: 1,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: isLoaded && imageLoaded ? 1 : 0,
            transform: isLoaded && imageLoaded ? 'scale(1)' : 'scale(1.1)',
            transition: 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1), transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'opacity, transform',
          }}
        >
          <NextImage
            src={src}
            alt="Store banner"
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            priority
            unoptimized={src.startsWith('/') || src.startsWith('http') || src.includes('s3.')}
            onLoad={handleImageLoad}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement;
              const defaultImage = '/images/banner-stores/banner-stores.svg';
              if (target.src !== defaultImage) {
                target.src = defaultImage;
              }
              handleImageLoad();
            }}
          />
        </Box>

        {/* Shimmer effect overlay */}
        {isLoaded && imageLoaded && (
          <Box
            className="hero-shimmer"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
    </>
  );
};

export const mockStores: Record<string, MockStore> = {
  '1': {
    id: '1',
    name: 'FacuLatute',
    description:
      'Tu tienda de confianza para productos de calidad. Especialistas en moda y accesorios con años de experiencia en el mercado.',
    imageUrl:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.8,
    totalReviews: 156,
    location: 'Buenos Aires, Argentina',
    phone: '+54 11 1234-5678',
    email: 'contacto@faculatute.com',
    kyb: true,
    kyc: true,
    plan: 'Pro Liberty',
    verified: true,
    products: [
      {
        id: 'p1',
        name: 'Camiseta Deportiva Premium',
        price: 29.99,
        image:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80',
      },
      {
        id: 'p2',
        name: 'Pantalón Deportivo',
        price: 45.5,
        image:
          'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=300&q=80',
      },
    ],
  },
};

type MockStore = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  profileImage: string;
  rating: number;
  totalReviews: number;
  location: string;
  phone: string;
  email: string;
  kyb: boolean;
  kyc: boolean;
  plan: string;
  verified: boolean;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
};

type StorePageProps = { storeId: string };

const StorePage: React.FC<StorePageProps> = ({ storeId }) => {
  const { t } = useLanguage();
  const { openModal } = useModal();
  const [itemsPerSlide, setItemsPerSlide] = useState<number>(() => {
    if (globalThis.window === undefined) return 1;
    const width = window.innerWidth;
    if (width < 576) return 1;
    if (width < 768) return 2;
    if (width < 992) return 3;
    if (width < 1200) return 4;
    return 5;
  });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 576) setItemsPerSlide(1);
      else if (w < 768) setItemsPerSlide(2);
      else if (w < 992) setItemsPerSlide(3);
      else if (w < 1200) setItemsPerSlide(4);
      else setItemsPerSlide(5);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const {
    store,
    products,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    hasValidIdentifier,
  } = useStoreProfile(storeId);

  const fallback = useMemo(() => {
    const candidate = mockStores[storeId];
    if (!candidate) {
      return null;
    }

    const profile: StoreProfile = {
      id: candidate.id,
      name: candidate.name,
      description: candidate.description,
      bannerUrl: candidate.imageUrl,
      logoUrl: candidate.profileImage,
      location: candidate.location,
      phone: candidate.phone,
      email: candidate.email,
      plan: candidate.plan,
      kycVerified: candidate.kyc,
      kybVerified: candidate.kyb,
      rating: candidate.rating,
      totalReviews: candidate.totalReviews,
    };

    const fallbackProducts: ProductCardProps[] = candidate.products.map((product) => ({
      id: product.id,
      image: product.image,
      title: product.name,
      price: product.price,
      currency: 'USD',
    }));

    return { profile, products: fallbackProducts };
  }, [storeId]);

  const effectiveStore = store ?? fallback?.profile ?? null;
  const effectiveProducts = store ? products : fallback?.products ?? [];
  const usingFallback = !store && Boolean(fallback);

  if (isLoading && !effectiveStore) {
    return (
      <MainLayout>
        <Box
          sx={{
            minHeight: '50vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: '#000000',
          }}
        >
          <CircularProgress sx={{ color: '#29C480' }} size="large" />
        </Box>
      </MainLayout>
    );
  }

  const bannerSrc = effectiveStore?.bannerUrl ?? '/images/banner-stores/banner-stores.svg';
  const logoSrc = effectiveStore?.logoUrl ?? '/images/icons/avatar.png';

  return (
    <MainLayout>
      {/* Hero con banner de la tienda */}
      {bannerSrc && (
        <HeroBanner
          src={bannerSrc}
          onClick={() => {
            openModal(
              <ImageModal
                images={[bannerSrc]}
                initialIndex={0}
                alt={`Banner de ${effectiveStore?.name || 'tienda'}`}
              />,
              {
                maxWidth: false,
                fullWidth: true
              }
            );
          }}
        />
      )}

      <Box
        component="section"
        sx={{
          py: { xs: 3, md: 4 },
          backgroundColor: '#000000',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0, lg: 0 } }}>
          <Box sx={{ px: { xs: 3, md: 4 } }}>
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: t.admin?.home || 'Inicio', href: '/' },
                { label: t.menu?.stores || 'Tiendas', href: '/stores' },
                { label: effectiveStore?.name || 'Tienda' }
              ]}
            />

        {!hasValidIdentifier && !store && (
          <NotificationBanner
            variant="warning"
            title="Identificador de tienda no válido"
            description="Ingresá el UUID de la tienda para poder visualizarla."
          />
        )}

        {isError && !usingFallback && (
          <NotificationBanner
            variant="danger"
            title="No pudimos cargar la tienda"
            description={
              error instanceof Error
                ? error.message
                : 'Ocurrió un error inesperado al intentar obtener la tienda.'
            }
            action={{
              label: 'Reintentar',
              onClick: () => {
                void refetch();
              },
            }}
          />
        )}

        {isFetching && usingFallback && (
          <NotificationBanner
            variant="info"
            title="Mostrando datos temporales"
            description="Estamos actualizando la información real de la tienda."
          />
        )}

        {effectiveStore ? (
              <Stack spacing={2}>

                {/* Store Info Card */}
                <Card
                  className="card-product"
                  sx={{
                    padding: { xs: 1.5, md: 2 },
                    borderRadius: 2,
                    background: 'transparent',
                    border: 'none',
                    marginTop: 0,
                  }}
                >
                  <Stack spacing={2}>
                    {/* Store Name and Rating */}
                    <AnimatedSection delay={0} direction="up" threshold={0.1}>
                      <Box>
                        {/* Logo y Título en una sola línea */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: effectiveStore.description ? 1 : 0.5 }}>
                          {/* Logo de la tienda */}
                          {logoSrc && (
                            <Box
                              onClick={() => {
                                openModal(
                                  <ImageModal
                                    images={[logoSrc]}
                                    initialIndex={0}
                                    alt={`Logo de ${effectiveStore.name}`}
                                  />,
                                  {
                                    maxWidth: false,
                                    fullWidth: true
                                  }
                                );
                              }}
                              sx={{
                                position: 'relative',
                                width: { xs: 56, md: 80 },
                                height: { xs: 56, md: 80 },
                                borderRadius: '50%',
                                border: '2px solid #29C480',
                                overflow: 'hidden',
                                backgroundColor: '#000000',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                            >
                              <NextImage
                                src={logoSrc}
                                alt={`Logo de ${effectiveStore.name}`}
                                fill
                                style={{
                                  objectFit: 'cover',
                                  objectPosition: 'center',
                                  borderRadius: '50%',
                                }}
                                sizes="(max-width: 768px) 56px, 80px"
                                unoptimized={logoSrc.startsWith('/') || logoSrc.startsWith('http') || logoSrc.includes('s3.')}
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                  const target = e.target as HTMLImageElement;
                                  const defaultImage = '/images/icons/avatar.png';
                                  if (target.src !== defaultImage) {
                                    target.src = defaultImage;
                                  }
                                }}
                              />
                            </Box>
                          )}
                          <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                              fontSize: { xs: '1.25rem', md: '1.5rem' },
                              fontWeight: 700,
                              color: '#ffffff',
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                            }}
                            style={{ color: '#ffffff' }}
                          >
                            {effectiveStore.name}
                          </Typography>
                        </Box>

                        {/* Descripción debajo del logo y título */}
                        {effectiveStore.description && (
                          <Typography
                            sx={{
                              fontSize: { xs: "0.875rem", md: "1rem" },
                              lineHeight: 1.5,
                              color: "rgba(255, 255, 255, 0.7)",
                              mb: effectiveStore.rating !== undefined ? 1 : 0,
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                              '& p': {
                                margin: 0,
                                marginBottom: '0.5rem',
                                '&:last-child': {
                                  marginBottom: 0
                                }
                              },
                              '& ul, & ol': {
                                margin: 0,
                                paddingLeft: '1.5rem',
                                marginBottom: '0.5rem'
                              },
                              '& h1, & h2, & h3, & h4, & h5, & h6': {
                                margin: 0,
                                marginBottom: '0.5rem',
                                fontWeight: 600
                              },
                              '& strong, & b': {
                                fontWeight: 600
                              },
                              '& em, & i': {
                                fontStyle: 'italic'
                              },
                              '& a': {
                                color: '#29C480',
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }
                            }}
                            dangerouslySetInnerHTML={{ __html: effectiveStore.description }}
                          />
                        )}

                        {/* Rating */}
                        {effectiveStore.rating !== undefined && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Stars rating={effectiveStore.rating} size={18} />
                            <Text
                              sx={{
                                color: '#ffffff',
                                fontWeight: 600,
                                ml: 0.5,
                                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                              }}
                            >
                              {effectiveStore.rating.toFixed(1)}
                            </Text>
                            <Text
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                              }}
                            >
                              ({effectiveStore.totalReviews ?? 0} {t.shop.reviews})
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </AnimatedSection>

                    {/* Shipping Badges - Like in product card, always shown */}
                    <AnimatedSection delay={100} direction="up" threshold={0.1}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          gap: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          color: '#94a3b8',
                          fontSize: { xs: '0.8rem', md: '0.875rem' },
                          fontWeight: 500,
                          backgroundColor: 'rgba(148, 163, 184, 0.05)',
                          padding: '6px 10px',
                          borderRadius: '12px',
                          border: '1px solid rgba(148, 163, 184, 0.1)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(41, 196, 128, 0.08)',
                            borderColor: 'rgba(41, 196, 128, 0.2)',
                            color: '#29C480'
                          }
                        }}
                      >
                        <Icon name="bi-truck" />
                        <Text variant="small" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
                          {t.productCard.fastShipping}
                        </Text>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          color: '#94a3b8',
                          fontSize: { xs: '0.8rem', md: '0.875rem' },
                          fontWeight: 500,
                          backgroundColor: 'rgba(148, 163, 184, 0.05)',
                          padding: '6px 10px',
                          borderRadius: '12px',
                          border: '1px solid rgba(148, 163, 184, 0.1)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(41, 196, 128, 0.08)',
                            borderColor: 'rgba(41, 196, 128, 0.2)',
                            color: '#29C480'
                          }
                        }}
                      >
                        <Icon name="bi-credit-card" />
                        <Text variant="small" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
                          {t.productCard.interestFreeInstallments}
                        </Text>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          color: '#94a3b8',
                          fontSize: { xs: '0.8rem', md: '0.875rem' },
                          fontWeight: 500,
                          backgroundColor: 'rgba(148, 163, 184, 0.05)',
                          padding: '6px 10px',
                          borderRadius: '12px',
                          border: '1px solid rgba(148, 163, 184, 0.1)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(41, 196, 128, 0.08)',
                            borderColor: 'rgba(41, 196, 128, 0.2)',
                            color: '#29C480'
                          }
                        }}
                      >
                        <Icon name="bi-currency-bitcoin" />
                        <Text variant="small" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
                          {t.productCard.payWithCrypto}
                        </Text>
                      </Box>
                    </Box>
                    </AnimatedSection>

                    {/* Verification Badges and Contact Info */}
                    <AnimatedSection delay={200} direction="up" threshold={0.1}>
                      <Box>
                      {/* Títulos en una fila */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                          gap: 1.5,
                          mb: 1.5
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: { xs: '1.25rem', md: '1.5rem' },
                            fontWeight: 700,
                            color: '#34d399',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Verificación
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: { xs: '1.25rem', md: '1.5rem' },
                            fontWeight: 700,
                            color: '#34d399',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            textAlign: 'left'
                          }}
                        >
                          Información de contacto
                        </Typography>
                      </Box>

                      {/* Contenido en una fila */}
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'flex-start', md: 'flex-start' }}
                        justifyContent="space-between"
                      >
                        {/* Verification Badges - Like Benefits List */}
                        <Box sx={{ flex: 1 }}>
                          <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <Box
                              component="li"
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: 1,
                                "&:last-child": { mb: 0 },
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  color: effectiveStore.kybVerified ? "#34d399" : "rgba(255, 255, 255, 0.4)",
                                  fontSize: "1.125rem",
                                  mr: 1,
                                  mt: 0.25,
                                  flexShrink: 0,
                                  lineHeight: 1,
                                }}
                              >
                                {effectiveStore.kybVerified ? "✓" : "✗"}
                              </Box>
                              <Typography
                                sx={{
                                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                                  lineHeight: 1.6,
                                  color: "#ffffff",
                                  opacity: 0.9,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                              >
                                {effectiveStore.kybVerified ? t.shop.storeVerified : t.shop.storeNotVerified}
                              </Typography>
                            </Box>
                            <Box
                              component="li"
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: 1,
                                "&:last-child": { mb: 0 },
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  color: effectiveStore.kycVerified ? "#34d399" : "rgba(255, 255, 255, 0.4)",
                                  fontSize: "1.125rem",
                                  mr: 1,
                                  mt: 0.25,
                                  flexShrink: 0,
                                  lineHeight: 1,
                                }}
                              >
                                {effectiveStore.kycVerified ? "✓" : "✗"}
                              </Box>
                              <Typography
                                sx={{
                                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                                  lineHeight: 1.6,
                                  color: "#ffffff",
                                  opacity: 0.9,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                              >
                                {effectiveStore.kycVerified ? t.shop.personalDataVerified : t.shop.personalDataMissing}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Contact Information */}
                        <Box sx={{ flex: 1 }}>
                          <Stack
                            spacing={0.75}
                            sx={{
                              alignItems: 'flex-start',
                              width: '100%'
                            }}
                          >
                          {effectiveStore.phone && (
                            <Box
                              component="a"
                              href={`tel:${effectiveStore.phone.replace(/\s/g, '')}`}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                border: '1px solid #313639',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#29C480',
                                  backgroundColor: 'rgba(41, 196, 128, 0.05)'
                                }
                              }}
                            >
                              <FaPhone style={{ color: '#29C480', fontSize: '14px' }} />
                              <Text
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '0.875rem',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                              >
                                {effectiveStore.phone}
                              </Text>
                            </Box>
                            )}
                          {effectiveStore.location && (
                            <Box
                              component="a"
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(effectiveStore.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                border: '1px solid #313639',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#29C480',
                                  backgroundColor: 'rgba(41, 196, 128, 0.05)'
                                }
                              }}
                            >
                              <FaMapMarkerAlt style={{ color: '#29C480', fontSize: '14px' }} />
                              <Text
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '0.875rem',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                              >
                                {effectiveStore.location}
                              </Text>
                            </Box>
                          )}
                          {effectiveStore.email && (
                            <Box
                              component="a"
                              href={`mailto:${effectiveStore.email}`}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                border: '1px solid #313639',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#29C480',
                                  backgroundColor: 'rgba(41, 196, 128, 0.05)'
                                }
                              }}
                            >
                              <FaEnvelope style={{ color: '#29C480', fontSize: '14px' }} />
                              <Text
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '0.875rem',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                              >
                                {effectiveStore.email}
                              </Text>
                            </Box>
                          )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                    </AnimatedSection>
                  </Stack>
                </Card>
              </Stack>
        ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '50vh',
                }}
              >
                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 700,
                    color: '#34d399',
                    textAlign: 'center',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  No encontramos la tienda solicitada.
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Products Section with same style as "Ideal for your business" - Full Width */}
      {effectiveStore && (
        <AnimatedSection delay={300} direction="up" threshold={0.1}>
          <Box sx={{ width: "100%", position: "relative" }}>
          {/* Línea separadora verde arriba */}
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
            sx={{
              py: { xs: 5, md: 20 },
              pt: { xs: 8, md: 24 },
              backgroundColor: '#000000',
              position: 'relative',
              borderTop: "1px solid rgba(41, 196, 128, 0.05)",
              overflow: 'hidden',
              width: '100%',
              background: `
                radial-gradient(ellipse 1400px 800px at 50% 30%, #0a2820 0%, #000000 70%),
                radial-gradient(circle at 15% 80%, #1a1a1a 0%, #000000 60%),
                radial-gradient(ellipse 900px 700px at 85% 60%, #0a1a15 0%, #000000 65%)
              `,
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
                    <Container maxWidth="xl" sx={{ px: { xs: 3, md: 4 }, position: "relative", zIndex: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          mb: 4,
                          gap: 2
                        }}
                      >
                        <Typography
                          component="h2"
                          sx={{
                            fontSize: { xs: "2.25rem", md: "3rem" },
                            fontWeight: 700,
                            color: "#34d399",
                            margin: 0,
                            marginBottom: { xs: 2, md: 3 },
                            padding: 0,
                            lineHeight: 1.2,
                            textAlign: 'center',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                {`Productos de ${effectiveStore.name}`}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "1.125rem", md: "1.25rem" },
                            fontWeight: 400,
                            color: "#ffffff",
                            margin: 0,
                            padding: 0,
                            lineHeight: 1.4,
                            maxWidth: "600px",
                            mx: "auto",
                            opacity: 0.9,
                            textAlign: 'center',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          Descubrí nuestra selección de productos exclusivos
                        </Typography>
                      </Box>
              {effectiveProducts.length > 0 ? (
                <ProductCarousel
                  products={effectiveProducts}
                  itemsPerSlide={itemsPerSlide}
                  showArrows
                  sectionDelay={100}
                  isSectionVisible
                />
              ) : (
                        <EmptyState
                          title="No hay productos disponibles"
                          message="La tienda todavía no cargó productos."
                        />
              )}
                    </Container>
                  </Box>
                </Box>
          </AnimatedSection>
      )}
    </MainLayout>
  );
};

export default StorePage;
