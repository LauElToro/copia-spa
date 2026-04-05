"use client";

import React, { useMemo } from 'react';
import { Box, CircularProgress, Button as MuiButton, Typography } from '@mui/material';
import NextImage from 'next/image';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { Stack } from '@/presentation/@shared/components/ui/molecules/stack';
import { useRouter } from 'next/navigation';
import { ProductEntity } from '@/presentation/@shared/types/product';
import Stars from '../stars/stars';
import { useQuery } from '@tanstack/react-query';
import { axiosHelper } from '@/presentation/@shared/helpers/axios-helper';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { getAvatarUrl } from '@/presentation/@shared/hooks/use-user-avatar';
import { parseLegacyStoreMediaFromInfo } from '@/presentation/@shared/utils/product-mapper';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import StoreIcon from '@mui/icons-material/Store';

interface StoreDataProps {
  product: ProductEntity;
  showSellerDesc: boolean;
  setShowSellerDesc: React.Dispatch<React.SetStateAction<boolean>>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const S3_BASE = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_S3_BASE_URL || process.env.NEXT_PUBLIC_MS_STORAGE_URL || 'https://prod-libertyclub.s3.us-east-2.amazonaws.com') : 'https://prod-libertyclub.s3.us-east-2.amazonaws.com';
const S3_AVATAR_FALLBACK = `${S3_BASE.replace(/\/$/, '')}/images/icons/avatar.png`;

/** Rutas públicas legacy en S3: commerces/ (logos/ y banners/ pueden devolver 403) */
function resolveStoreImageUrl(url: string | undefined, _type: 'logo' | 'banner' = 'logo'): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const t = url.trim();
  if (!t) return undefined;
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  const base = S3_BASE.replace(/\/$/, '');
  const key = t.startsWith('/') ? t.slice(1) : (t.includes('/') ? t : `commerces/${t}`);
  return `${base}/${key}`;
}

const extractUuid = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const match = value.match(UUID_REGEX);
  return match ? match[0] : undefined;
};

const StoreData: React.FC<StoreDataProps> = ({ product }) => {
  const router = useRouter();
  const { t } = useLanguage();

  // Intentar obtener seller del producto, o usar storeId/store_id directamente
  const seller = (product as ProductEntity & { seller?: { storeId?: string; storeSlug?: string; bannerUrl?: string; avatar?: string; name?: string; rating?: number; kycVerified?: boolean; kybVerified?: boolean; description?: string; address?: string; phone?: string; email?: string } }).seller;
  
  // Si no hay seller, obtener storeId directamente del producto
  const productStoreId = product.storeId || product.store_id;
  const rawStoreId = seller?.storeId?.trim() || productStoreId?.trim();
  const rawStoreSlug = seller?.storeSlug?.trim();

  const initialUuid = extractUuid(rawStoreId);
  const candidate = initialUuid ? undefined : (rawStoreId && rawStoreId.length > 0 ? rawStoreId : rawStoreSlug);

  const resolverQuery = useQuery({
    queryKey: ['store-identifier', candidate],
    queryFn: async () => {
      if (!candidate) {
        return undefined;
      }
      try {
        const response = await axiosHelper.account.getStore(candidate);
        const payload = response.data as unknown;
        if (!payload || typeof payload !== 'object') {
          return undefined;
        }
        const raw = payload as Record<string, unknown>;
        const data =
          raw.data && typeof raw.data === 'object'
            ? (raw.data as Record<string, unknown>)
            : raw;
        const possible = [
          data.id,
          data.account_id,
          data.accountId,
          data.storeId,
        ].find((value): value is string => typeof value === 'string');
        return extractUuid(possible);
      } catch (error) {
        console.warn('No se pudo resolver el UUID de la tienda:', error);
        return undefined;
      }
    },
    enabled: Boolean(candidate),
    staleTime: 5 * 60 * 1000,
    retry: false});

  const normalizedSlug = typeof rawStoreSlug === 'string' && rawStoreSlug.length > 0 ? rawStoreSlug : undefined;

  const storeUuid = initialUuid ?? resolverQuery.data ?? undefined;
  const fallbackSlug = !storeUuid ? normalizedSlug : undefined;

  // Siempre pedir la tienda pública cuando hay storeId: el producto puede traer `seller`
  // incompleto (sin avatar) y antes no se cargaba el logo real desde ms-stores.
  const finalStoreId = storeUuid || productStoreId;
  const storeQuery = useQuery({
    queryKey: ['store-public', finalStoreId],
    queryFn: async () => {
      if (!finalStoreId) return null;
      try {
        const response = await axiosHelper.stores.getPublic(finalStoreId);
        const data = response.data?.data || response.data;
        return data;
      } catch (error) {
        console.warn('[StoreData] No se pudo obtener información de la tienda:', error);
        return null;
      }
    },
    enabled: Boolean(finalStoreId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Parsea información legacy (JSON string) de la migración - evita mostrar raw JSON
  const parseLegacyStoreInfo = (info: unknown): { description?: string; name?: string; logo?: string; banner?: string; address?: string; phone?: string; email?: string } => {
    if (!info) return {};
    let obj: Record<string, unknown> | null = null;
    if (typeof info === 'string' && info.trim().startsWith('{')) {
      try {
        obj = JSON.parse(info) as Record<string, unknown>;
      } catch {
        return {};
      }
    } else if (typeof info === 'object' && info !== null) {
      const i = info as Record<string, unknown>;
      if (typeof i.description === 'string' && i.description.trim().startsWith('{')) {
        try {
          obj = JSON.parse(i.description) as Record<string, unknown>;
        } catch {
          return {};
        }
      } else {
        obj = i;
      }
    }
    if (!obj) return {};
    const data = (obj.data as Record<string, unknown>) || obj;
    const desc = (data.descripcionTienda ?? data.descripcion ?? obj.descripcionTienda) as string | undefined;
    return {
      description: desc && !String(desc).trim().startsWith('{') ? desc : undefined,
      name: (data.nombreComercio ?? obj.nombreComercio) as string | undefined,
      logo: (data.logoComercio ?? data.logo ?? obj.logoComercio) as string | undefined,
      banner: (data.bannerComercio ?? data.banner ?? obj.bannerComercio) as string | undefined,
      address: (data.direccionComercio ?? data.direccion ?? obj.direccionComercio) as string | undefined,
      phone: (data.telefonoComercio ?? data.telefono ?? obj.telefonoComercio) as string | undefined,
      email: (data.emailComercio ?? data.email ?? obj.emailComercio) as string | undefined,
    };
  };

  // Nunca mostrar description que parezca JSON crudo
  const safeDescription = (d: string | undefined): string | undefined => {
    if (!d || typeof d !== 'string') return undefined;
    const t = d.trim();
    if (!t || t.startsWith('{') || t.startsWith('[')) return undefined;
    return t;
  };

  // Construir seller desde ms-stores y fusionar con seller del producto (meta) si existe
  const enrichedSeller = useMemo(() => {
    let fromStore: {
      storeId?: string;
      name: string;
      avatar?: string;
      bannerUrl?: string;
      description?: string;
      address?: string;
      phone?: string;
      email?: string;
      kycVerified?: boolean;
      kybVerified?: boolean;
      rating?: number;
    } | null = null;

    if (storeQuery.data) {
      const storeData = storeQuery.data as Record<string, unknown>;
      const information = storeData.information as Record<string, unknown> | string | undefined;
      const media = storeData.media as Record<string, unknown> | undefined;
      const holderInfo = storeData.holder_information ?? storeData.holderInformation;

      let description: string | undefined;
      let avatarUrl: string | undefined;
      let bannerUrl: string | undefined;
      let address: string | undefined;
      let phone: string | undefined;
      let infoEmail: string | undefined;

      const infoObj = typeof information === 'object' && information !== null ? information : undefined;
      const infoStr = typeof information === 'string' ? information : (infoObj?.description as string);
      const legacy = parseLegacyStoreInfo(information ?? infoStr);
      const legacyMedia = parseLegacyStoreMediaFromInfo(information);

      if (legacy.description && !String(legacy.description).trim().startsWith('{')) {
        description = legacy.description;
      } else if (infoObj?.description && typeof infoObj.description === 'string' && !infoObj.description.trim().startsWith('{')) {
        description = infoObj.description as string;
      }

      const rawAvatar =
        getAvatarUrl(media?.logo) ??
        (infoObj?.logo as string) ??
        legacy.logo ??
        legacyMedia.logo;
      const rawBanner =
        getAvatarUrl(media?.banner) ??
        (infoObj?.banner as string) ??
        legacy.banner ??
        legacyMedia.banner;
      avatarUrl = rawAvatar ? (resolveStoreImageUrl(rawAvatar, 'logo') ?? rawAvatar) : undefined;
      bannerUrl = rawBanner ? (resolveStoreImageUrl(rawBanner, 'banner') ?? rawBanner) : undefined;
      address = (infoObj?.location as Record<string, unknown>)?.address as string ?? legacy.address;
      phone = (infoObj?.phone as Record<string, unknown>)?.number as string ?? legacy.phone;
      infoEmail = (infoObj?.email ?? legacy.email) as string | undefined;

      const holderObj = typeof holderInfo === 'object' && holderInfo !== null ? holderInfo as Record<string, unknown> : null;
      const holderLegacy = parseLegacyStoreInfo(holderInfo);

      fromStore = {
        storeId: finalStoreId,
        name: (storeData.name as string) || legacy.name || 'Vendedor',
        avatar: avatarUrl,
        bannerUrl,
        description,
        address: address ?? holderLegacy.address,
        phone: phone ?? (holderObj?.phone as Record<string, unknown>)?.number ?? holderLegacy.phone,
        email: (storeData.email as string) || infoEmail || holderLegacy.email || undefined,
        kycVerified: Boolean(storeData.kyc),
        kybVerified: Boolean(storeData.kyb),
        rating: (storeData.rating as number) || undefined,
      };
    }

    if (seller) {
      const s = seller as {
        avatar?: string;
        bannerUrl?: string;
        description?: string;
        name?: string;
        storeId?: string;
        address?: string;
        phone?: string;
        email?: string;
        kycVerified?: boolean;
        kybVerified?: boolean;
        rating?: number;
        [key: string]: unknown;
      };
      const avatarFromSeller = s.avatar?.trim()
        ? (resolveStoreImageUrl(s.avatar) ?? s.avatar)
        : undefined;
      const mergedAvatar = avatarFromSeller ?? fromStore?.avatar;
      const mergedBanner = s.bannerUrl ?? fromStore?.bannerUrl;
      return {
        ...s,
        name: s.name || fromStore?.name || 'Vendedor',
        description: safeDescription(s.description) || fromStore?.description,
        avatar: mergedAvatar,
        bannerUrl: mergedBanner,
        address: s.address || fromStore?.address,
        phone: s.phone || fromStore?.phone,
        email: s.email || fromStore?.email,
        storeId: s.storeId || fromStore?.storeId,
        kycVerified: s.kycVerified ?? fromStore?.kycVerified,
        kybVerified: s.kybVerified ?? fromStore?.kybVerified,
        rating: s.rating ?? fromStore?.rating,
      };
    }

    if (fromStore) return fromStore;
    return null;
  }, [seller, storeQuery.data, finalStoreId]);

  const handleVisitStore = () => {
    if (storeUuid) {
      router.push(`/stores/${storeUuid}`);
      return;
    }

    if (fallbackSlug) {
      router.push(`/stores/${fallbackSlug}`);
      return;
    }

    router.push('/stores');
  };

  const avatarSrc: string = useMemo((): string => {
    if (!enrichedSeller) return S3_AVATAR_FALLBACK;
    const raw = typeof enrichedSeller.avatar === 'string' ? enrichedSeller.avatar.trim() : '';
    if (raw.length > 0) {
      const resolved = resolveStoreImageUrl(raw) ?? raw;
      return resolved;
    }
    return S3_AVATAR_FALLBACK;
  }, [enrichedSeller]);

  // Mover hooks antes del return condicional para cumplir con las reglas de hooks
  const hasDescription = useMemo(() => {
    const d = enrichedSeller?.description;
    if (!d || typeof d !== 'string') return false;
    const t = d.trim();
    return t.length > 0 && !t.startsWith('{') && !t.startsWith('[');
  }, [enrichedSeller?.description]);

  if (!enrichedSeller) {
    if (storeQuery.isLoading) {
      return (
        <Stack spacing={2}>
          <Text 
            variant="h5" 
            sx={{ 
              fontSize: { xs: '1rem', md: '1.125rem' }, 
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            {t.shop.sellerStore}
          </Text>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#29C480' }} />
          </Box>
        </Stack>
      );
    }
    return null;
  }

  return (
    <Stack spacing={3}>
      {/* Información de la tienda */}
      <Box>
        <Stack spacing={2.5}>
          {/* Nombre y Rating */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              {/* Logo de la tienda */}
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 48, md: 64 },
                  height: { xs: 48, md: 64 },
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid #29C480',
                  backgroundColor: '#000000',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                  flexShrink: 0,
                }}
              >
                <NextImage
                  src={avatarSrc}
                  alt={enrichedSeller.name || ''}
                  fill
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                  unoptimized={avatarSrc.startsWith('/') || avatarSrc.startsWith('http') || avatarSrc.includes('s3.')}
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== S3_AVATAR_FALLBACK) {
                      target.src = S3_AVATAR_FALLBACK;
                    }
                  }}
                />
              </Box>
              {/* Nombre de la tienda */}
              <Box sx={{ flex: 1 }}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontSize: { xs: '1.125rem', md: '1.25rem' },
                  fontWeight: 700,
                  color: '#ffffff',
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
                style={{ color: '#ffffff' }}
              >
                {enrichedSeller.name}
              </Typography>
              </Box>
            </Box>
            {hasDescription && (
              <Typography
                sx={{
                  fontSize: { xs: "0.875rem", md: "1rem" },
                  lineHeight: 1.5,
                  color: "rgba(255, 255, 255, 0.7)",
                  mb: 1.5,
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                {enrichedSeller.description?.replace(/<[^>]*>/g, '')}
              </Typography>
            )}
            {enrichedSeller.rating !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Stars rating={enrichedSeller.rating} size={18} />
              </Box>
            )}
          </Box>

          {/* Verificación e Información de contacto en una fila */}
          <Box>
            {/* Títulos en una fila */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                mb: 2
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  fontWeight: 700,
                  color: '#34d399',
                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                }}
              >
                Verificación
              </Typography>
              {(enrichedSeller.address || enrichedSeller.phone) && (
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    fontWeight: 700,
                    color: '#34d399',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    textAlign: 'left'
                  }}
                >
                  Información de contacto
                </Typography>
              )}
            </Box>

            {/* Contenido en una fila */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'flex-start' }}
              justifyContent="space-between"
            >
              {/* Verificación - Estilo como Beneficios del modal */}
              <Box sx={{ flex: 1 }}>
                <Box component="ul" sx={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <Box
                component="li"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: 1.5,
                  "&:last-child": { mb: 0 },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: enrichedSeller.kybVerified ? "#34d399" : "rgba(255, 255, 255, 0.4)",
                    fontSize: "1.125rem",
                    mr: 1.5,
                    mt: 0.25,
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {enrichedSeller.kybVerified ? "✓" : "✗"}
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
                  {enrichedSeller.kybVerified ? t.shop.storeVerified : t.shop.storeNotVerified}
                </Typography>
              </Box>
              <Box
                component="li"
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: 1.5,
                  "&:last-child": { mb: 0 },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: enrichedSeller.kycVerified ? "#34d399" : "rgba(255, 255, 255, 0.4)",
                    fontSize: "1.125rem",
                    mr: 1.5,
                    mt: 0.25,
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {enrichedSeller.kycVerified ? "✓" : "✗"}
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
                  {enrichedSeller.kycVerified ? t.shop.personalDataVerified : t.shop.personalDataMissing}
                </Typography>
              </Box>
            </Box>
              </Box>

              {/* Información de contacto */}
              {(enrichedSeller.address || enrichedSeller.phone || (enrichedSeller as { email?: string }).email) && (
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={1.5} sx={{ width: '100%', alignItems: 'flex-start' }}>
              {enrichedSeller.address && (
                <Box 
                  component="a"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enrichedSeller.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1.5,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                >
                  <LocationOnIcon 
                    sx={{ 
                      fontSize: 18, 
                      color: 'rgba(255, 255, 255, 0.6)',
                      mt: 0.25,
                      flexShrink: 0
                    }} 
                  />
                  <Text 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: '0.875rem', md: '0.9375rem' },
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.5,
                      flex: 1
                    }}
                  >
                    {enrichedSeller.address}
                  </Text>
                </Box>
              )}
              {enrichedSeller.phone && (
                <Box 
                  component="a"
                  href={`tel:${enrichedSeller.phone.replace(/\s/g, '')}`}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1.5,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                >
                  <PhoneIcon 
                    sx={{ 
                      fontSize: 18, 
                      color: 'rgba(255, 255, 255, 0.6)',
                      mt: 0.25,
                      flexShrink: 0
                    }} 
                  />
                  <Text 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: '0.875rem', md: '0.9375rem' },
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.5,
                      flex: 1
                    }}
                  >
                    {enrichedSeller.phone}
                  </Text>
                </Box>
              )}
              {(enrichedSeller as { email?: string }).email && (
                <Box 
                  component="a"
                  href={`mailto:${(enrichedSeller as { email?: string }).email}`}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1.5,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                >
                  <EmailIcon 
                    sx={{ 
                      fontSize: 18, 
                      color: 'rgba(255, 255, 255, 0.6)',
                      mt: 0.25,
                      flexShrink: 0
                    }} 
                  />
                  <Text 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: '0.875rem', md: '0.9375rem' },
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.5,
                      flex: 1
                    }}
                  >
                    {(enrichedSeller as { email?: string }).email}
                  </Text>
                </Box>
              )}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Botón de visitar tienda - Estilo consistente con el resto del sitio */}
          <Box sx={{ pt: 0.5 }}>
            <MuiButton
              onClick={handleVisitStore}
              variant="outlined"
              sx={{
                width: { xs: '100%', md: 'auto' },
                minWidth: { md: 160 },
                height: '48px',
                px: { xs: 3, md: 2.5 },
                py: 1.5,
                color: '#29C480',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.9375rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                borderColor: '#29C480',
                '&:hover': {
                  borderColor: '#29C480',
                  backgroundColor: 'rgba(41, 196, 128, 0.1)',
                  color: '#29C480'
                },
                '& .MuiButton-endIcon': {
                  marginLeft: 1
                }
              }}
              endIcon={<StoreIcon sx={{ fontSize: 18 }} />}
            >
              {t.shop.visitStore}
            </MuiButton>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};

export default StoreData;
