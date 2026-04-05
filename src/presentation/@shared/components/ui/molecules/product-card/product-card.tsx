"use client";

import React, { useCallback, useState, useRef } from "react";
import { Box, Chip } from "@mui/material";
import { Favorite, Share } from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Text } from "../../atoms/text/text";
import { Icon } from "../../atoms/icon/icon";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { useFavorites, useFavoritesOperations } from "@/presentation/@shared/hooks/use-favorites";
import { useProfile } from "@/presentation/@shared/hooks/use-profile";
import { useToast } from "@/presentation/@shared/components/ui/molecules/toast";
import { DEFAULT_PRODUCT_IMAGE } from "@/presentation/@shared/utils/product-mapper";

export interface ProductCardProps {
  id: string | number;
  image: string;
  title: string;
  price: number | string;
  originalPrice?: number | string;
  discount?: number;
  currency?: string;
  className?: string;
  promotion?: string;
  pesosPrice?: number;
  // Promociones para vectores de venta
  hasSecurePurchase?: boolean; // Compra segura (promoReturn === "yes")
  hasFreeShipping?: boolean; // Envío gratis
  hasInterestFreeInstallments?: boolean; // Cuotas sin interés (promoBanks === "yes")
  shippingTime?: string; // "24hs" | "48hs" para mostrar "Envío en 48 hs"
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  image,
  title,
  price,
  originalPrice,
  pesosPrice,
  discount,
  currency = "USDT",
  className = "",
  promotion,
  hasSecurePurchase = false,
  hasFreeShipping = false,
  hasInterestFreeInstallments = false,
  shippingTime,
}) => {
  const { t } = useLanguage();
  const { addFavorite, removeFavorite, isLoading: isFavoriteLoading } = useFavoritesOperations();
  const { isFavorite } = useFavorites();
  const { isAuthenticated } = useProfile();
  const router = useRouter();
  const toast = useToast();

  const firstImageUrl = image && String(image).trim().length > 0 ? image : DEFAULT_PRODUCT_IMAGE;
  const [isHovered, setIsHovered] = useState(false);
  const [isFavoriteHovered, setIsFavoriteHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const productIsFavorite = isFavorite(String(id));

  const clickStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleToggleFavorite = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevenir que el evento se propague al card
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (!isAuthenticated) {
      toast.error(t.productCard?.mustLoginToAddFavorites || "Debes iniciar sesión para agregar productos a favoritos", { duration: 3000 });
      return;
    }

    if (isFavoriteLoading) {
      return;
    }

    const priceValue = typeof price === 'string' ? parseFloat(price) : price;
    const productData = {
      id: String(id),
      name: title,
      price: priceValue || 0,
      originalPrice: originalPrice ? (typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice) : undefined,
      image: firstImageUrl,
      storeId: undefined,
      storeName: undefined
    };

    if (productIsFavorite) {
      removeFavorite({ id: String(id), name: title });
      toast.success(t.productCard?.productRemovedFromFavorites || "Producto eliminado de favoritos", { duration: 2000 });
    } else {
      addFavorite(productData);
      toast.success(t.productCard?.productAddedToFavorites || "Producto agregado a favoritos", { duration: 2000 });
    }
  }, [isAuthenticated, productIsFavorite, id, title, price, originalPrice, firstImageUrl, addFavorite, removeFavorite, toast, isFavoriteLoading, t.productCard?.mustLoginToAddFavorites, t.productCard?.productAddedToFavorites, t.productCard?.productRemovedFromFavorites]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Verificar si el clic viene de los iconos de acción
    const target = e.target as HTMLElement;
    const isActionIcon = target.closest('[data-action-icon]') !== null;

    if (isActionIcon) {
      return; // No navegar si se hace click en iconos
    }

    // Verificar si hubo movimiento significativo (drag real)
    if (clickStartRef.current) {
      const deltaX = Math.abs(e.clientX - clickStartRef.current.x);
      const deltaY = Math.abs(e.clientY - clickStartRef.current.y);
      const deltaTime = Date.now() - clickStartRef.current.time;

      if (deltaX > 30 || deltaY > 30 || deltaTime > 800) {
        clickStartRef.current = null;
        return; // No navegar si fue un drag
      }
    }

    // Navegar al producto
    router.push(`/product/${id}`);
    clickStartRef.current = null;
  }, [router, id]);

  const handleCardMouseDown = useCallback((e: React.MouseEvent) => {
    // Guardar la posición inicial para detectar si es drag o click
    const target = e.target as HTMLElement;
    const isActionIcon = target.closest('[data-action-icon]') !== null;

    if (isActionIcon) {
      e.stopPropagation();
      return;
    }

    clickStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
  }, []);

  const toNumber = (value: number | string | undefined): number | undefined => {
    const num = typeof value === "string" ? Number.parseFloat(value) : value;
    if (typeof num !== "number" || Number.isNaN(num) || !Number.isFinite(num)) {
      return undefined;
    }
    return num;
  };

  const formatPrice = (value: number | string | undefined) => {
    const numberValue = toNumber(value);
    if (numberValue === undefined || numberValue <= 0) {
      return undefined;
    }
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2}).format(numberValue);
  };

  const formatPesosPrice = (value: number | undefined) => {
    const numberValue = toNumber(value);
    if (numberValue === undefined || numberValue <= 0) {
      return undefined;
    }
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2}).format(numberValue);
  };

  const formattedPesos = formatPesosPrice(pesosPrice);
  const formattedUsd = formatPrice(price);
  const formattedOriginal = formatPrice(originalPrice);

  const cu = (currency || "USDT").toUpperCase();
  /** USDT por defecto; ARS solo en productos en pesos; USDC explícito. */
  const displayCurrency =
    cu === "ARS" ? "ARS" : cu === "USDC" ? "USDC" : "USDT";

  return (
    <Box className={`product-card-container ${className} group`} sx={{ position: 'relative', height: '100%' }}>
      <Box
        onClickCapture={(e) => {
          // Detectar tempranamente clicks en iconos de acción para prevenir navegación
          const target = e.target as HTMLElement;
          const isActionIcon = target.closest('[data-action-icon]') !== null;
          if (isActionIcon) {
            // No prevenir el evento aquí, solo marcar para que el onClick lo ignore
            return;
          }
        }}
        onClick={(e) => {
          // Verificar si el click viene de los iconos de acción
          const target = e.target as HTMLElement;
          const isActionIcon = target.closest('[data-action-icon]') !== null;
          if (isActionIcon) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }

          // Verificar si hubo drag real
          if (clickStartRef.current) {
            const deltaX = Math.abs(e.clientX - clickStartRef.current.x);
            const deltaY = Math.abs(e.clientY - clickStartRef.current.y);
            const deltaTime = Date.now() - clickStartRef.current.time;
            if (deltaX > 30 || deltaY > 30 || deltaTime > 800) {
              clickStartRef.current = null;
              return; // No navegar si fue un drag
            }
          }

          // Navegar al producto
          router.push(`/product/${id}`);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(`/product/${id}`);
          }
        }}
        role="link"
        tabIndex={0}
        sx={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          height: '100%',
          cursor: 'pointer'
        }}
      >
        <Box
          ref={cardRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseDown={handleCardMouseDown}
          onClick={handleCardClick}
          className="product-card border-glow-hover magic-card group"
          sx={{
            position: 'relative',
            minHeight: { xs: '420px', md: '450px' },
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))',
            border: '2px solid rgba(41, 196, 128, 0.1)',
            borderRadius: '24px',
            overflow: 'hidden',
            transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            cursor: 'pointer',
            // Solo aplicar transform en dispositivos con hover real (no touch)
            '@media (hover: hover) and (pointer: fine)': {
              transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
              "&:hover": {
                borderColor: 'rgba(41, 196, 128, 0.8)',
                filter: 'brightness(1.1) drop-shadow(0px 4px 12px rgba(41, 196, 128, 0.4))'
              }
            },
            // En dispositivos touch, efecto más sutil solo en active
            '@media (hover: none) or (pointer: coarse)': {
              '&:active': {
                transform: 'scale(0.98)',
                borderColor: 'rgba(41, 196, 128, 0.5)'
              }
            }
          }}
        >
          {/* Magic border effect */}
          <Box
            sx={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              borderRadius: '18px',
              background: 'linear-gradient(45deg, #29C480, #10B981, #059669, #047857, #065F46, #29C480)',
              backgroundSize: '400% 400%',
              zIndex: -1,
              opacity: 0,
              transition: 'opacity 0.4s ease',
              // Sin animación infinita en reposo: reduce parpadeo/repaints en grillas con muchas cards
              animation: isHovered ? 'magic-border 4s ease-in-out infinite' : 'none',
              pointerEvents: 'none'
            }}
            className="group-hover:opacity-100"
          />

          {/* Imagen */}
          <Box
            className="product-card-image-wrapper"
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              overflow: 'hidden',
              // Solo aplicar efectos de imagen en dispositivos con hover real
              '@media (hover: hover) and (pointer: fine)': {
                '& img': {
                  transition: 'all 1s cubic-bezier(0.19, 1, 0.22, 1)'
                },
                '.group:hover & img': {
                  transform: 'scale(1.05) rotate(1deg) translateY(-4px)',
                  filter: 'brightness(1.15) contrast(1.1) saturate(1.2)',
                  boxShadow: '0 8px 32px rgba(41, 196, 128, 0.3)'
                }
              }
            }}
          >
            <Image
              src={firstImageUrl}
              alt={title}
              fill
              draggable={false}
              className="transition-transform duration-700"
              style={{
                objectFit: "cover",
                borderRadius: "16px 16px 0 0",
                transformOrigin: "center center",
                transition: "all 1s cubic-bezier(0.19, 1, 0.22, 1)",
                transformStyle: "preserve-3d"
              }}
              unoptimized={firstImageUrl.startsWith('/') || firstImageUrl.startsWith('http') || firstImageUrl.startsWith('//') || firstImageUrl.includes('s3.')}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== DEFAULT_PRODUCT_IMAGE) {
                  target.src = DEFAULT_PRODUCT_IMAGE;
                }
              }}
            />

            {/* Gradient overlay on hover */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.4), transparent)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }}
              className="group-hover:opacity-100"
            />

            {/* Accent glow line on top */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(to right, transparent, #29C480, transparent)',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              }}
              className="group-hover:opacity-100"
            />

            {/* Discount badge */}
            {discount && discount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: '#29C480',
                  color: '#000000',
                  fontSize: '0.75rem',
                  fontWeight: 'semibold',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease',
                  zIndex: 2,
                  '&:hover': {
                    boxShadow: '0 0 10px rgba(41, 196, 128, 0.5)',
                    transform: 'scale(1.1)',
                    transformOrigin: 'left'
                  }
                }}
                className="group-hover:shadow-lg group-hover:shadow-[#29C480]/50"
              >
                {discount}% Off
              </Box>
            )}

            {/* Action Icons Container */}
            <Box sx={{
              position: 'absolute',
              top: { xs: 8, md: 12 },
              right: { xs: 8, md: 12 },
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              zIndex: 10
            }}>
              {/* Favorite icon */}
              <button
                data-action-icon="favorite"
                type="button"
                disabled={!isAuthenticated || isFavoriteLoading}
                onClick={handleToggleFavorite}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                }}
                onMouseEnter={() => setIsFavoriteHovered(true)}
                onMouseLeave={() => setIsFavoriteHovered(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: isFavoriteHovered && isAuthenticated && !isFavoriteLoading ? '#ef4444' : 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '50%',
                  border: `1px solid ${isFavoriteHovered && isAuthenticated && !isFavoriteLoading ? '#ef4444' : 'rgba(41, 196, 128, 0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isAuthenticated && !isFavoriteLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  opacity: isAuthenticated && !isFavoriteLoading ? (isFavoriteHovered ? 1 : 0.8) : 0.4,
                  boxShadow: isFavoriteHovered && isAuthenticated && !isFavoriteLoading
                    ? '0 4px 20px rgba(239, 68, 68, 0.5)'
                    : '0 2px 12px rgba(0, 0, 0, 0.3)',
                  padding: 0,
                  outline: 'none',
                  pointerEvents: isAuthenticated && !isFavoriteLoading ? 'auto' : 'none',
                  transform: isFavoriteHovered && isAuthenticated && !isFavoriteLoading ? 'scale(1.1)' : 'scale(1)',
                }}
                title={!isAuthenticated ? (t.productCard?.mustLoginToAddFavorites || "Inicia sesión para agregar a favoritos") : (productIsFavorite ? (t.productCard?.removeFromFavorites || "Quitar de favoritos") : (t.productCard?.addToFavorites || "Agregar a favoritos"))}
              >
                <Favorite
                  sx={{
                    fontSize: { xs: 18, md: 20 },
                    color: isFavoriteHovered && isAuthenticated && !isFavoriteLoading
                      ? '#ffffff'
                      : (productIsFavorite ? '#ef4444' : '#94a3b8'),
                    transition: 'color 0.3s ease',
                  }}
                />
              </button>

              {/* Share icon */}
              <Box
                data-action-icon="share"
                component="button"
                type="button"
                sx={{
                  width: { xs: 32, md: 36 },
                  height: { xs: 32, md: 36 },
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '50%',
                  border: '1px solid rgba(41, 196, 128, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  opacity: 0.8,
                  color: '#94a3b8',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
                  padding: 0,
                  '&:hover': {
                    backgroundColor: '#29C480',
                    color: '#ffffff',
                    transform: 'scale(1.1)',
                    opacity: 1,
                    borderColor: '#29C480',
                    boxShadow: '0 4px 20px rgba(41, 196, 128, 0.5)'
                  }
                }}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();

                  try {
                    const productUrl = `${window.location.origin}/product/${id}`;
                    await navigator.clipboard.writeText(productUrl);
                    toast.success(t.productCard?.productLinkCopied || "Link del producto copiado al portapapeles", { duration: 4000 });
                  } catch {
                    // Fallback para navegadores que no soportan clipboard API
                    const productUrl = `${window.location.origin}/product/${id}`;
                    const textArea = document.createElement("textarea");
                    textArea.value = productUrl;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-999999px";
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                      document.execCommand("copy");
                      toast.success(t.productCard?.productLinkCopied || "Link del producto copiado al portapapeles", { duration: 4000 });
                    } catch {
                      toast.error(t.productCard?.productLinkCopyError || "No se pudo copiar el link del producto", { duration: 5000 });
                    } finally {
                      document.body.removeChild(textArea);
                    }
                  }
                }}
                title={t.productCard?.shareProduct || "Compartir producto"}
              >
                <Share sx={{ fontSize: { xs: 18, md: 20 } }} />
              </Box>
            </Box>
          </Box>

          {/* Detalles */}
          <Box className="product-card-details" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 2 }}>
            <Text
              variant="p"
              className="product-card-title"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: { xs: '-webkit-box', md: 'block' },
                WebkitLineClamp: { xs: 2, md: 'unset' },
                WebkitBoxOrient: 'vertical',
                whiteSpace: { xs: 'normal', md: 'normal' },
                fontWeight: 700,
                marginBottom: 2,
                color: '#ffffff',
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                lineHeight: 1.4,
                letterSpacing: '-0.01em',
                fontFamily: "'Inter', sans-serif"
              }}
              title={title}
            >
              {title}
            </Text>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 2,
              paddingTop: 0.5
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {/* Contenedor de precios flat */}
                {formattedUsd && (
                  <Text
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      color: '#29C480',
                      lineHeight: 1,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {displayCurrency} {formattedUsd}
                  </Text>
                )}

                {/* Precio tachado simple */}
                {formattedOriginal && discount && (
                  <Text
                    variant="body2"
                    sx={{
                      fontSize: '1rem',
                      color: '#9ca3af',
                      textDecoration: 'line-through',
                      fontWeight: 500,
                      opacity: 0.8
                    }}
                  >
                    {displayCurrency} {formattedOriginal}
                  </Text>
                )}

                {/* Precio en pesos simple */}
                {formattedPesos && (
                  <Text
                    variant="small"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#94a3b8'
                    }}
                  >
                    {formattedPesos}
                  </Text>
                )}
              </Box>

              {/* Promotion badge */}
              {promotion && (
                <Chip
                  label={promotion}
                  size="small"
                  sx={{
                    backgroundColor: '#29C480',
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: '28px',
                    borderRadius: '6px',
                    '& .MuiChip-label': {
                      paddingX: 1
                    }
                  }}
                />
              )}
            </Box>

            {/* Etiquetas - Vectores de venta dinámicos */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 'auto', paddingTop: 1 }}>
              {/* Compra segura */}
              {hasSecurePurchase && (
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
                  <Icon name="bi-shield-check" />
                  <Text variant="small" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
                    Compra segura
                  </Text>
                </Box>
              )}

              {/* Envío gratis */}
              {hasFreeShipping && (
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
                    {t.productCard.freeShipping}
                  </Text>
                </Box>
              )}

              {/* Envío rápido / Envío en 48 hs */}
              {shippingTime && (shippingTime === "24hs" || shippingTime === "48hs") && (
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
                    {shippingTime === "24hs" ? t.productCard.fastShipping : "Envío en 48 hs"}
                  </Text>
                </Box>
              )}

              {/* Cuotas sin interés */}
              {hasInterestFreeInstallments && (
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
              )}

              {/* Págalo con Cripto - siempre visible */}
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductCard;
