'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Button as MuiButton, CircularProgress } from "@mui/material";
import { ShoppingCart, ShoppingBag, Favorite, FavoriteBorder, Share } from "@mui/icons-material";
import QuantityInput from '../quantity-input';
import { useOptionalAuthContext } from "@/presentation/@shared/contexts/auth-context";
import { NotificationBanner } from "@/presentation/@shared/components/ui/atoms/notification-banner";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import "./add-to-cart-section.css";

export interface AddToCartSectionProps {
  onAddToCart: (quantity: number) => void;
  onToggleFavorite?: () => void;
  isLoading?: boolean;
  isFavorite?: boolean;
  className?: string;
  minQuantity?: number;
  maxQuantity?: number;
  initialQuantity?: number;
  stock?: number;
  isProductOwner?: boolean;
  isAuthenticated?: boolean;
}

const AddToCartSection: React.FC<AddToCartSectionProps> = ({
  onAddToCart,
  onToggleFavorite,
  isLoading = false,
  isFavorite = false,
  className = '',
  minQuantity = 1,
  initialQuantity = 1,
  stock = 0,
  isProductOwner = false,
  isAuthenticated: isAuthenticatedProp
}) => {
  const { t } = useLanguage();
  // Si no hay stock, mostrar 0 y disabled. Si hay stock, iniciar en 1
  // Manejar explícitamente undefined, null y 0
  const effectiveStock = stock !== undefined && stock !== null ? stock : 0;
  const hasStock = effectiveStock > 0;
  const maxAllowed = hasStock ? effectiveStock : 0;

  const [quantity, setQuantity] = useState(() => {
    // Si hay stock, iniciar en 1 (o el valor inicial si es mayor)
    if (hasStock && maxAllowed > 0) {
      return Math.max(minQuantity, Math.min(initialQuantity || 1, maxAllowed));
    }
    return 0;
  });

  // Debug: Log del stock para verificar qué está recibiendo (después de definir quantity)
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[AddToCartSection] Stock values:', {
        stock,
        effectiveStock,
        hasStock,
        maxAllowed,
        quantity
      });
    }
  }, [stock, effectiveStock, hasStock, maxAllowed, quantity]);

  const authContext = useOptionalAuthContext();
  // Use prop if provided (from parent), otherwise fallback to context
  // This prevents race conditions and hydration mismatches
  const isAuthenticated = isAuthenticatedProp ?? authContext?.isAuthenticated ?? false;
  const authLoading = authContext?.isLoading ?? (!authContext); // Treat undefined context as loading
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  // Debug: Log auth state to diagnose issues
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[AddToCartSection] Auth Debug:', {
        isAuthenticatedProp,
        contextIsAuthenticated: authContext?.isAuthenticated,
        contextIsLoading: authContext?.isLoading,
        contextUser: authContext?.user,
        finalIsAuthenticated: isAuthenticated,
        authLoading,
        isProductOwner,
        hasLocalStorageToken: !!localStorage.getItem('accessToken'),
        hasLocalStorageUser: !!localStorage.getItem('user')
      });
    }
  }, [isAuthenticatedProp, authContext?.isAuthenticated, authContext?.isLoading, authContext?.user, isAuthenticated, authLoading, isProductOwner]);

  // FIX: Prevent hydration mismatch - wait for client-side mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Actualizar cantidad cuando cambie el stock
  useEffect(() => {
    if (hasStock && effectiveStock > 0) {
      // Asegurar que la cantidad esté entre minQuantity y maxAllowed, por defecto 1
      const newQuantity = Math.max(minQuantity, Math.min(initialQuantity || 1, maxAllowed));
      setQuantity(newQuantity);
    } else {
      setQuantity(0);
    }
  }, [hasStock, effectiveStock, maxAllowed, minQuantity, initialQuantity]);

  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  const renderAuthBanner = () => (
    <NotificationBanner
      variant="success"
      className="add-to-cart-auth-banner"
      title={t.shop.mustLoginToBuy}
      description={t.shop.loginToContinuePurchase}
      iconName="user"
      action={{
        label: t.shop.login,
        onClick: handleLoginRedirect,
      }}
      layout="horizontal"
    />
  );

  const renderOwnerBanner = () => (
    <NotificationBanner
      variant="info"
      className="add-to-cart-owner-banner"
      title={t.shop.cannotBuyOwnProduct || "No puedes comprar tu propio producto"}
      description={t.shop.cannotBuyOwnProductDescription || "Este producto pertenece a tu tienda"}
      iconName="store"
      layout="horizontal"
    />
  );

  const handleQuantityChange = (newQuantity: number) => {
    if (!hasStock) return;
    if (newQuantity >= minQuantity && newQuantity <= maxAllowed) {
    setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(quantity);
  };

  const handleBuyNow = () => {
    // Agregar producto al carrito
    onAddToCart(quantity);
    // Navegar al checkout después de un pequeño delay para que el carrito se actualice
    setTimeout(() => {
      router.push('/checkout');
    }, 300);
  };

  const handleShare = async () => {
    try {
      const productUrl = `${window.location.origin}${pathname}`;
      await navigator.clipboard.writeText(productUrl);
      toast.success('Link copiado al portapapeles', { duration: 4000 });
    } catch {
      // Fallback para navegadores que no soportan clipboard API
      try {
        const productUrl = `${window.location.origin}${pathname}`;
        const textArea = document.createElement("textarea");
        textArea.value = productUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success('Link copiado al portapapeles', { duration: 4000 });
      } catch {
        toast.error('No se pudo copiar el link', { duration: 5000 });
      }
    }
  };


  return (
    <div className={`add-to-cart-section ${className}`}>
      {(!isMounted || authLoading) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} sx={{ color: "#29C480" }} />
        </Box>
      ) : (
        <>
          {isAuthenticated && isProductOwner && renderOwnerBanner()}
          {isAuthenticated && !isProductOwner && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: { xs: 'stretch', md: 'flex-end' },
                  width: '100%'
                }}
              >
                {/* Input de Cantidad */}
                <Box sx={{
                  width: { xs: '100%', md: 'auto' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'stretch', md: 'flex-end' }
                }}>
                  <QuantityInput
                    value={quantity}
                    onChange={handleQuantityChange}
                    min={hasStock ? minQuantity : 0}
                    max={maxAllowed}
                    label={t.shop.quantity}
                    showLabel={true}
                    disabled={isLoading || !hasStock}
                    isLoading={isLoading}
                    showStockFormat={hasStock}
                    totalStock={effectiveStock}
                  />
                </Box>

                {/* Botones */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                  width: { xs: '100%', md: 'auto' },
                  justifyContent: { xs: 'stretch', md: 'flex-end' },
                  flexWrap: { xs: 'nowrap', md: 'nowrap' }
                }}>
                  {/* Botón Buy */}
                  <MuiButton
                    onClick={handleBuyNow}
                    disabled={isLoading || !hasStock || quantity < minQuantity}
                    className="buy-button"
                    sx={{
                      px: { xs: 4, md: 2.5 },
                      py: 1.5,
                      height: '48px',
                      backgroundColor: "#29C480",
                      color: "#1e293b",
                      fontWeight: 600,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "0.9375rem",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                      flex: { xs: '1 1 100%', md: '0 0 auto' },
                      minWidth: { md: '100px' },
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      "&:hover:not(:disabled)": {
                        backgroundColor: "#ffffff",
                        color: "#000000"
                      },
                      "&:disabled": {
                        backgroundColor: "#29C480",
                        color: "#1e293b",
                        opacity: 0.6
                      },
                      "& .MuiButton-endIcon .MuiSvgIcon-root": {
                        transition: "transform 0.3s ease"
                      },
                      "&:hover:not(:disabled) .MuiButton-endIcon .MuiSvgIcon-root": {
                        transform: "translateX(4px)"
                      }
                    }}
                    endIcon={
                      isLoading ? (
                        <CircularProgress size={18} sx={{ color: "#1e293b" }} />
                      ) : (
                        <ShoppingBag sx={{ fontSize: 18 }} />
                      )
                    }
                  >
                    {t.shop.buy}
                  </MuiButton>

                  {/* Botón Add to Cart */}
                  <MuiButton
                    onClick={handleAddToCart}
                    disabled={isLoading || !hasStock || quantity < minQuantity}
                    variant="outlined"
                    className="add-to-cart-button"
                    sx={{
                      px: { xs: 4, md: 2.5 },
                      py: 1.5,
                      height: '48px',
                      color: "#29C480",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "0.9375rem",
                      transition: "all 0.3s ease",
                      borderColor: "#29C480",
                      flex: { xs: '1 1 100%', md: '0 0 auto' },
                      minWidth: { md: '120px' },
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      "&:hover:not(:disabled)": {
                        borderColor: "#29C480",
                        backgroundColor: "rgba(41, 196, 128, 0.1)"
                      },
                      "&:disabled": {
                        borderColor: "#29C480",
                        color: "#29C480",
                        opacity: 0.6
                      },
                      "& .MuiButton-endIcon .MuiSvgIcon-root": {
                        fontSize: 18,
                        transition: "transform 0.3s ease"
                      },
                      "&:hover:not(:disabled) .MuiButton-endIcon .MuiSvgIcon-root": {
                        transform: "scale(1.1)"
                      }
                    }}
                    endIcon={
                      isLoading ? (
                        <CircularProgress size={18} sx={{ color: "#29C480" }} />
                      ) : (
                        <ShoppingCart sx={{ fontSize: 18 }} />
                      )
                    }
                  >
                    {t.shop.addToCart}
                  </MuiButton>

                  {/* Botón Favoritos */}
                {onToggleFavorite && (
                    <MuiButton
                      onClick={onToggleFavorite}
                      disabled={isLoading}
                      variant="outlined"
                      className="add-to-favorites-button"
                      sx={{
                        px: { xs: 4, md: 2.5 },
                        py: 1.5,
                        height: '48px',
                        color: isFavorite ? "#ef4444" : "#29C480",
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "0.9375rem",
                        transition: "all 0.3s ease",
                        borderColor: isFavorite ? "#ef4444" : "#29C480",
                        flex: { xs: '1 1 100%', md: '0 0 auto' },
                        minWidth: { md: '130px' },
                        maxWidth: { md: '180px' },
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        "&:hover:not(:disabled)": {
                          borderColor: "#ef4444",
                          backgroundColor: isFavorite ? "rgba(239, 68, 68, 0.1)" : "rgba(41, 196, 128, 0.1)",
                          color: "#ef4444"
                        },
                        "&:disabled": {
                          borderColor: isFavorite ? "#ef4444" : "#29C480",
                          color: isFavorite ? "#ef4444" : "#29C480",
                          opacity: 0.6
                        },
                        "& .MuiButton-endIcon .MuiSvgIcon-root": {
                          fontSize: 18,
                          transition: "transform 0.3s ease"
                        },
                        "&:hover:not(:disabled) .MuiButton-endIcon .MuiSvgIcon-root": {
                          transform: "scale(1.1)"
                        }
                      }}
                      endIcon={
                        isFavorite ? (
                          <Favorite sx={{ fontSize: 18, color: "#ef4444" }} />
                        ) : (
                          <FavoriteBorder sx={{ fontSize: 18 }} />
                        )
                      }
                    >
                      {isFavorite ? "Quitar" : "Favoritos"}
                    </MuiButton>
                )}

                  {/* Botón Compartir */}
                  <MuiButton
                    onClick={handleShare}
                    disabled={isLoading}
                    variant="outlined"
                    className="share-button"
                    sx={{
                      px: { xs: 4, md: 2.5 },
                      py: 1.5,
                      height: '48px',
                      color: "#29C480",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "0.9375rem",
                      transition: "all 0.3s ease",
                      borderColor: "#29C480",
                      flex: { xs: '1 1 100%', md: '0 0 auto' },
                      minWidth: { md: '120px' },
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      "&:hover:not(:disabled)": {
                        borderColor: "#29C480",
                        backgroundColor: "rgba(41, 196, 128, 0.1)"
                      },
                      "&:disabled": {
                        borderColor: "#29C480",
                        color: "#29C480",
                        opacity: 0.6
                      },
                      "& .MuiButton-endIcon .MuiSvgIcon-root": {
                        fontSize: 18,
                        transition: "transform 0.3s ease"
                      },
                      "&:hover:not(:disabled) .MuiButton-endIcon .MuiSvgIcon-root": {
                        transform: "scale(1.1)"
                      }
                    }}
                    endIcon={<Share sx={{ fontSize: 18 }} />}
                  >
                    Compartir
                  </MuiButton>
                </Box>
              </Box>
            </>
          )}
          {!isAuthenticated && renderAuthBanner()}
        </>
      )}

      <style>{`
        .add-to-cart-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default AddToCartSection;
