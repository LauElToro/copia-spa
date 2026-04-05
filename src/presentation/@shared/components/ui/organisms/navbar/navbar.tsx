'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  IconButton,
  useTheme,
  useMediaQuery,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserProfile } from "../../../../hooks/use-user-profile";

// Import molecules
import LogoSection from '../../molecules/logo-section/logo-section';
import NavigationMenu from '../../molecules/navigation-menu/navigation-menu';
import SearchBar from '../../molecules/search-bar/search-bar';
import UserMenu from '../../molecules/user-menu/user-menu';
import ActionButtons from '../../molecules/action-buttons/action-buttons';
import MobileMenu from '../../molecules/mobile-menu/mobile-menu';

// Import hooks
import { useProfile } from "../../../../hooks/use-profile";
import { useLanguage } from "../../../../hooks/use-language";
import { useProducts } from "../../../../hooks/use-products";
import { useFavorites } from "../../../../hooks/use-favorites";
import { useCart } from "../../../../hooks/use-cart";
import { useInAppNotifications, InAppNotification } from "../../../../hooks/use-in-app-notifications";
import { getAvatarUrl } from "../../../../hooks/use-user-avatar";

interface NavbarProps {
  fullWidth?: boolean;
  className?: string;
  logoSrc?: string;
  brandName?: string;
  onProductClick?: (productId: string) => void;
  searchResults?: Array<{
    id: string;
    name: string;
    price: number;
    discount?: number;
    imageUrl?: string;
  }>;
  hideBorder?: boolean;
}

export function Navbar({
  fullWidth = false,
  className = "",
  logoSrc,
  brandName = "Liberty Club",
  onProductClick,
  searchResults = [],
  hideBorder = false
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const { t } = useLanguage();
  const { profile, isAuthenticated } = useProfile();
  const { getNavbarCategories } = useProducts();
  const { totalItems: favoritesCount } = useFavorites();
  const { totalItems: cartCount } = useCart();
  const router = useRouter();
  const { userProfile } = useUserProfile();
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Hook de notificaciones en tiempo real
  const {
    notifications,
    unreadCount,
    isLoading: isLoadingNotifications,
    isWebSocketConnected,
    markAsRead
  } = useInAppNotifications();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _navbarCategories = getNavbarCategories();

  // Obtener notificaciones no leídas para el dropdown
  const unseenNotifications = useMemo(() => {
    return notifications
      .filter((n: InAppNotification) => !n.metadata?.read)
      .slice(0, 5);
  }, [notifications]);

  const navigationItems = useMemo(() => [
    { key: 'shop', label: t.menu?.products || 'Market', href: "/shop" },
    { key: 'stores', label: t.menu?.stores || 'Stores', href: "/stores" },
    { key: 'categories', label: t.menu?.categories || 'Categories', href: "/categories" },
    { key: 'offers', label: t.menu?.offers || 'Offers', href: "/ofertas" },
    { key: 'sell', label: t.menu?.sell || 'Sell', href: "/sellers" },
    { key: 'contact', label: t.menu?.contact || 'Contact', href: "/help" }
  ], [t.menu]);

  const handleSearch = useCallback((query: string) => {
    console.log('Searching for:', query);
  }, []);

  const handleProductClick = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
    onProductClick?.(productId);
  }, [router, onProductClick]);

  interface Profile {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    additionalInfo?: {
      avatar?: string | Record<string, unknown>;
      avatar_url?: string;
      [key: string]: unknown;
    };
  }

  // Extraer la URL del avatar usando la función helper que maneja objetos media completos
  const extractAvatarFromProfile = (profile: Profile): string => {
    // Primero intentar desde avatar directo (string)
    if (profile.avatar && typeof profile.avatar === 'string') {
      return profile.avatar;
    }
    
    // Luego intentar desde additionalInfo.avatar (puede ser string o objeto media completo)
    if (profile.additionalInfo?.avatar) {
      const avatarUrl = getAvatarUrl(profile.additionalInfo.avatar);
      if (avatarUrl) return avatarUrl;
    }
    
    // Finalmente intentar desde additionalInfo.avatar_url (compatibilidad hacia atrás)
    if (profile.additionalInfo?.avatar_url && typeof profile.additionalInfo.avatar_url === 'string') {
      return profile.additionalInfo.avatar_url;
    }
    
    return '';
  };

  const user = profile ? {
    id: (profile as Profile).id || '',
    name: (profile as Profile).name || '',
    email: (profile as Profile).email || '',
    avatar: extractAvatarFromProfile(profile as Profile)
  } : null;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleRegisterClick = () => {
    router.push('/register');
  };

  const handleFavoritesClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login-required?redirect=${encodeURIComponent('/favorites')}`);
      return;
    }
    router.push('/favorites');
  }, [isAuthenticated, router]);

  const handleCartClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/login-required?redirect=/cart');
      return;
    }
    router.push('/cart');
  }, [isAuthenticated, router]);

  // Manejar clic en una notificación
  const handleNotificationClick = useCallback(async (notification: InAppNotification) => {
    setNotificationsAnchor(null);

    // Marcar como leída si tiene ID y no está leída
    if (notification.id && !notification.metadata?.read) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        // No bloquear la navegación si falla marcar como leída
        console.error('Error marking notification as read:', error);
      }
    }

    // Navegar a la URL de acción si existe
    if (notification.metadata?.actionUrl) {
      router.push(notification.metadata.actionUrl);
    }
  }, [router, markAsRead]);

  return (
    <>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1400,
        }}
      >
        <Box
          component="header"
          sx={{
            borderBottom: hideBorder ? 'none' : '1px solid #29C480',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            py: 0,
          }}
          className={className}
        >
          <Container
            maxWidth={fullWidth ? false : "xl"}
            sx={{
              px: { xs: 2, sm: 3, lg: 4 },
              py: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '80px',
              }}
            >
              {/* Logo Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <LogoSection
                  logoSrc={logoSrc}
                  brandName={brandName}
                  href="/"
                />
              </Box>

              {/* Desktop Navigation */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', flex: 1 }}>
                  <NavigationMenu
                    items={navigationItems}
                    isCategoriesOpen={categoriesOpen}
                    onCategoriesToggle={(open) => {
                      setUserMenuAnchor(null);
                      setNotificationsAnchor(null);
                      setCategoriesOpen(open);
                    }}
                  />
                </Box>
              )}

              {/* Desktop Right Section */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
                  <SearchBar
                    placeholder={t.search?.placeholder || "Search products..."}
                    onSearch={handleSearch}
                    onProductClick={handleProductClick}
                    searchResults={searchResults}
                  />

                  <ActionButtons
                    favoritesCount={favoritesCount}
                    cartCount={cartCount}
                    onFavoritesClick={handleFavoritesClick}
                    onCartClick={handleCartClick}
                  />

                  {/* Notificaciones - Solo visible cuando hay cuenta logueada */}
                  {isAuthenticated && (
                    <>
                      <IconButton
                        onClick={(e) => {
                          setUserMenuAnchor(null);
                          setCategoriesOpen(false);
                          setNotificationsAnchor(e.currentTarget);
                        }}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                          },
                          transition: 'color 300ms ease',
                        }}
                      >
                        <Badge
                          badgeContent={unreadCount || undefined}
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText',
                              minWidth: 18,
                              height: 18,
                              borderRadius: '50%',
                              fontSize: '0.75rem',
                            },
                          }}
                        >
                          <NotificationsIcon sx={{ fontSize: 20 }} />
                        </Badge>
                      </IconButton>
                      <Menu
                        anchorEl={notificationsAnchor}
                        open={Boolean(notificationsAnchor)}
                        onClose={() => setNotificationsAnchor(null)}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        sx={{
                          '& .MuiPaper-root': {
                            background: '#111827',
                            borderRadius: '0px',
                            mt: 2,
                            minWidth: 340,
                            maxWidth: 380,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                            border: 'none',
                          },
                        }}
                        MenuListProps={{
                          sx: {
                            p: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                          }
                        }}
                      >
                        <Box sx={{
                          p: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          maxHeight: '600px',
                          overflow: 'hidden',
                        }}>
                          {/* Header */}
                          <Box sx={{ textAlign: 'center', mb: 3, px: 2, pt: 2, flexShrink: 0 }}>
                            <Typography variant="h5" sx={{
                              fontWeight: 700,
                              color: '#ffffff',
                              mb: 1,
                              fontSize: '1.5rem',
                            }}>
                              {'Notificaciones'}
                            </Typography>
                            <Typography variant="body2" sx={{
                              color: '#94a3b8',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                            }}>
                              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Sin notificaciones nuevas'}
                              {isWebSocketConnected && (
                                <Box
                                  component="span"
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#22c55e',
                                    display: 'inline-block',
                                  }}
                                  title="Conectado en tiempo real"
                                />
                              )}
                            </Typography>
                          </Box>

                          {/* Notifications List - Scrollable */}
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0,
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            '&::-webkit-scrollbar': {
                              width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                              background: '#1f2937',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: '#374151',
                              borderRadius: '3px',
                              '&:hover': {
                                background: '#22c55e',
                              },
                            },
                          }}>
                            {isLoadingNotifications ? (
                              <Box
                                sx={{
                                  px: 3,
                                  py: 4,
                                  display: 'flex',
                                  justifyContent: 'center',
                                }}
                              >
                                <CircularProgress size={24} sx={{ color: '#22c55e' }} />
                              </Box>
                            ) : unseenNotifications.length === 0 ? (
                              <Box
                                sx={{
                                  px: 3,
                                  py: 2,
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  fontSize: '0.875rem',
                                  textAlign: 'center',
                                }}
                              >
                                No tienes notificaciones nuevas.
                              </Box>
                            ) : (
                              unseenNotifications.map((n: InAppNotification, index: number) => (
                                <MenuItem
                                  key={n.id || `notif-${index}`}
                                  onClick={() => handleNotificationClick(n)}
                                  sx={{
                                    px: 2,
                                    py: 2,
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    borderLeft: '3px solid transparent',
                                    cursor: 'pointer',
                                    color: '#ffffff',
                                    backgroundColor: 'transparent',
                                    whiteSpace: 'normal',
                                    overflow: 'visible',
                                    '&:hover': {
                                      backgroundColor: '#374151',
                                      borderLeftColor: '#22c55e',
                                    },
                                    '& .MuiListItemText-root': {
                                      margin: 0,
                                      flex: 1,
                                    },
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 'auto', marginRight: 0 }}>
                                    <NotificationsIcon sx={{ color: '#22c55e', fontSize: '1rem' }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={n.message}
                                    primaryTypographyProps={{
                                      sx: {
                                        color: '#ffffff',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        whiteSpace: 'normal',
                                        wordBreak: 'break-word',
                                        overflow: 'visible',
                                        lineHeight: 1.5,
                                      }
                                    }}
                                  />
                                </MenuItem>
                              ))
                            )}
                          </Box>
                        </Box>

                        {/* Ver todas - Footer */}
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #374151', px: 0, pb: 2, flexShrink: 0 }}>
                          <MenuItem
                            component={NextLink}
                            href="/admin/panel/notifications"
                            onClick={() => setNotificationsAnchor(null)}
                            sx={{
                              px: 2,
                              py: 2,
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1.5,
                              borderLeft: '3px solid transparent',
                              cursor: 'pointer',
                              color: '#22c55e',
                              '&:hover': {
                                backgroundColor: '#374151',
                                borderLeftColor: '#22c55e',
                              },
                            }}
                          >
                            <Typography variant="body2" sx={{
                              fontWeight: 600,
                              fontSize: '1rem'
                            }}>
                              {'Ver todas'}
                            </Typography>
                          </MenuItem>
                        </Box>
                      </Menu>
                    </>
                  )}

                  <UserMenu
                    user={user}
                    isAuthenticated={isAuthenticated}
                    onLoginClick={handleLoginClick}
                    onRegisterClick={handleRegisterClick}
                    userProfile={userProfile}
                    anchorEl={userMenuAnchor}
                    onAnchorChange={(anchor) => {
                      setNotificationsAnchor(null);
                      setCategoriesOpen(false);
                      setUserMenuAnchor(anchor);
                    }}
                  />
                </Box>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  onClick={toggleMobileMenu}
                  sx={{
                    color: 'primary.main',
                    ml: 'auto',
                  }}
                  aria-label="Toggle mobile menu"
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        menuItems={navigationItems}
        onFavoritesClick={handleFavoritesClick}
        onCartClick={handleCartClick}
        onLoginClick={handleLoginClick}
        searchResults={searchResults}
        onSearch={handleSearch}
        onProductClick={handleProductClick}
        userProfile={userProfile}
      />
    </>
  );
}

export default Navbar;
