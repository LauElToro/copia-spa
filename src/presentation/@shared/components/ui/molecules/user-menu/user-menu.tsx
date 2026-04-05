import React, { useState, useMemo } from 'react';
import { Image } from '@/presentation/@shared/components/ui/atoms/image';
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import { Person, KeyboardArrowDown, Login, PersonAdd, AccountCircle, Settings, ExitToApp, Storefront, Home, ShoppingBag, QuestionAnswer, People, BarChart, Diamond, Link, Language } from '@mui/icons-material';
import NextLink from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { useAuth } from '@/presentation/@shared/hooks/use-auth';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { DropdownButton } from '../dropdown-button';
import type { DropdownButtonOption } from '../dropdown-button/types';
import type { Language as LanguageType } from '@/presentation/@shared/i18n/types';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

type AccountType = 'user' | 'commerce' | 'seller';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
  roles: Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
}

interface UserMenuProps {
  user?: User | null;
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  userProfile?: UserProfile | null;
  anchorEl?: HTMLElement | null;
  onAnchorChange?: (anchor: HTMLElement | null) => void;
}

export function UserMenu({
  user = null,
  isAuthenticated = false,
  onLoginClick,
  onRegisterClick,
  userProfile = null,
  anchorEl: externalAnchorEl,
  onAnchorChange,
}: UserMenuProps) {
  const [internalAnchorEl, setInternalAnchorEl] = useState<null | HTMLElement>(null);
  const anchorEl = externalAnchorEl !== undefined ? externalAnchorEl : internalAnchorEl;
  const { t, language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  
  // Language options
  const languageOptions: DropdownButtonOption[] = [
    { value: 'es', label: 'Español', native: 'Español' },
    { value: 'en', label: 'English', native: 'English' },
  ];
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = useMemo(() => {
    // Definir menús según el tipo de usuario
    const getMenuItems = (accountType: AccountType) => {
      const isSellerOrCommerce = accountType === 'commerce' || accountType === 'seller';

      if (isSellerOrCommerce) {
        // Menú para vendedores/comercios
        return [
          {
            href: "/admin/panel/home",
            icon: Home,
            label: t.admin?.home || "Inicio"
          },
          {
            href: "/admin/panel/products",
            icon: Storefront,
            label: t.admin?.products || t.menu?.products || "Productos"
          },
          {
            href: "/admin/panel/configuration-subscription",
            icon: Diamond,
            label: t.admin?.subscription || "Suscripción"
          },
          {
            href: "/admin/panel/transactions",
            icon: ShoppingBag,
            label: t.admin?.transactions || "Transacciones"
          },
          {
            href: "/admin/panel/questions",
            icon: QuestionAnswer,
            label: t.admin?.questions || "Preguntas"
          },
          {
            href: "/admin/panel/configuration",
            icon: Settings,
            label: t.admin?.settings || "Ajustes"
          },
          {
            href: "/admin/panel/payment-methods",
            icon: Link,
            label: "Medios de cobro"
          },
          {
            href: "/admin/panel/ambassador",
            icon: People,
            label: t.admin?.referrals || "Referidos"
          },
          {
            href: "/admin/panel/panel-proliberter",
            icon: BarChart,
            label: "Métricas e IA"
          }
        ];
      } else {
        // Menú para usuarios/compradores
        return [
          {
            href: "/admin/panel/home",
            icon: Home,
            label: t.admin?.home || "Inicio"
          },
          {
            href: "/admin/panel/transactions",
            icon: ShoppingBag,
            label: "Mis Compras"
          },
          {
            href: "/admin/panel/questions",
            icon: QuestionAnswer,
            label: t.admin?.questionsAndAnswers || "Preguntas y respuestas"
          },
          {
            href: "/admin/panel/configuration",
            icon: Settings,
            label: t.admin?.settings || "Ajustes"
          },
          {
            href: "/admin/panel/ambassador",
            icon: People,
            label: t.admin?.referrals || "Referidos"
          }
        ];
      }
    };

    let items = userProfile ? getMenuItems(userProfile.accountType) : [];

    // Override de menú para página de métricas
    if (pathname?.startsWith('/admin/panel/metrics')) {
      items = [
        { href: '/admin/panel/metrics', icon: BarChart, label: t.admin?.analytics || 'Analíticas' },
        { href: '/admin/panel/panel-proliberter/assistant/mark', icon: Person, label: t.admin?.aiAssistant || 'Asistente AI' },
        { href: '/admin/panel/home', icon: Storefront, label: t.menu?.back || 'Volver' },
      ];
    }

    return items;
  }, [userProfile, pathname, t.admin?.aiAssistant, t.admin?.analytics, t.admin?.messaging, t.menu?.back, t.admin?.home, t.menu?.products, t.admin?.subscription, t.admin?.transactions, t.admin?.questions, t.admin?.settings, t.admin?.referrals, t.admin?.questionsAndAnswers]);

  // Encontrar el item activo basado en el pathname
  // Ordenar los items por longitud de href (más largos primero) para evitar coincidencias incorrectas
  const sortedMenuItems = useMemo(() => [...menuItems].sort((a, b) => b.href.length - a.href.length), [menuItems]);

  const activeMenuItem = useMemo(() => {
    return sortedMenuItems.find(item => {
      if (!pathname) return false;
      // Normalizar las rutas eliminando barras finales
      const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
      const normalizedHref = item.href.endsWith('/') && item.href !== '/' ? item.href.slice(0, -1) : item.href;

      // Si el href es exactamente igual al pathname
      if (normalizedPathname === normalizedHref) return true;
      // Si el pathname empieza con el href seguido de '/' (para rutas anidadas)
      // Pero no para rutas que son prefijos de otras (ej: /admin/panel/home no debe coincidir con /admin/panel/homepage)
      if (normalizedPathname.startsWith(normalizedHref + '/')) return true;
      return false;
    });
  }, [pathname, sortedMenuItems]);

  // Determinar el texto del botón
  const getButtonText = () => {
    let text = '';

    // Priorizar mostrar el label del item activo si existe
    if (activeMenuItem) {
      text = activeMenuItem.label;
    } else if (!isAuthenticated || !user) {
      // Si no está autenticado o no hay usuario, mostrar "Mi cuenta"
      text = t.menu?.myAccount || 'Mi cuenta';
    } else {
      // Si no hay item activo pero hay usuario, mostrar el nombre del usuario
      text = user.name;
    }

    // Truncar a 10 caracteres y agregar "..." si es más largo
    if (text.length > 10) {
      return text.substring(0, 10) + '...';
    }

    return text;
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newAnchor = event.currentTarget;
    if (onAnchorChange) {
      onAnchorChange(newAnchor);
    } else {
      setInternalAnchorEl(newAnchor);
    }
  };

  const handleClose = () => {
    if (onAnchorChange) {
      onAnchorChange(null);
    } else {
      setInternalAnchorEl(null);
    }
  };

  const handleMenuItemClick = (callback?: () => void) => {
    handleClose();
    callback?.();
  };

  const handleLogout = async () => {
    try {
      handleClose();
      await logout.mutateAsync();
      // Redirigir al home después del logout exitoso
      // Usamos window.location.href para forzar una recarga completa de la página
      if (globalThis.window !== undefined) {
        globalThis.window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Aún así redirigir al home en caso de error
      if (globalThis.window !== undefined) {
        globalThis.window.location.href = '/';
      }
    }
  };

  return (
    <Box sx={{ height: '100%', position: 'relative', zIndex: 1500 }}>
      <Button
        variant="primary"
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          minWidth: 'auto',
          width: 'auto',
          color: '#000000 !important',
          height: '44px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textShadow: 'none !important',
          '&:hover': {
            color: '#000000 !important',
            backgroundColor: '#ffffff !important',
            textShadow: 'none !important',
          },
        }}
      >
        <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {getButtonText()}
        </Typography>
        <KeyboardArrowDown
          style={{
            transition: 'transform 500ms ease',
            transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '1rem',
            marginLeft: '4px'
          }}
        />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          zIndex: 1500, // Mismo z-index que el dropdown de Categories para que aparezca por encima
          '& .MuiPaper-root': {
            background: '#111827',
            borderRadius: '0px',
            mt: 0.5,
            minWidth: 340,
            maxWidth: 380,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
            border: 'none',
            zIndex: 1500, // Asegurar que el Paper también tenga el z-index correcto
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {!isAuthenticated ? (
          /* Guest User Menu - Modern Clean Design */
          <Box>
            <Box sx={{
              p: 0,
              maxHeight: '400px',
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
              {/* Welcome Header */}
              <Box sx={{ textAlign: 'center', mb: 3, px: 2, pt: 2 }}>
                <Typography variant="h5" sx={{
                  fontWeight: 700,
                  color: '#ffffff',
                  mb: 1,
                  fontSize: '1.5rem',
                }}>
                  {t.userMenu?.welcome}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#94a3b8',
                  fontSize: '0.9rem'
                }}>
                  {t.userMenu?.guestSubtitle}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <NextLink href="/login" passHref>
                  <MenuItem
                    component="a"
                    onClick={() => handleMenuItemClick(onLoginClick)}
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
                      '&:hover': {
                        backgroundColor: '#374151',
                        borderLeftColor: '#22c55e',
                      },
                    }}
                  >
                    <Login sx={{ fontSize: '1.4rem' }} />
                    <Typography variant="body2" sx={{
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {t.userMenu?.signIn}
                    </Typography>
                  </MenuItem>
                </NextLink>

                <NextLink href="/register?type=user" passHref>
                  <MenuItem
                    component="a"
                    onClick={() => handleMenuItemClick(onRegisterClick)}
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
                      '&:hover': {
                        backgroundColor: '#374151',
                        borderLeftColor: '#22c55e',
                      },
                    }}
                  >
                    <PersonAdd sx={{ fontSize: '1.4rem' }} />
                    <Typography variant="body2" sx={{
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {t.userMenu?.createUserAccount}
                    </Typography>
                  </MenuItem>
                </NextLink>

                <NextLink href="/register?type=seller" passHref>
                  <MenuItem
                    component="a"
                    onClick={() => handleMenuItemClick(onRegisterClick)}
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
                      '&:hover': {
                        backgroundColor: '#374151',
                        borderLeftColor: '#22c55e',
                      },
                    }}
                  >
                    <Storefront sx={{ fontSize: '1.4rem' }} />
                    <Typography variant="body2" sx={{
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {t.userMenu?.createSellerAccount}
                    </Typography>
                  </MenuItem>
                </NextLink>
              </Box>

              {/* Language Selector Section for Guest Users */}
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #374151', px: 2, pb: 2, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Language sx={{ fontSize: '1.4rem', color: '#94a3b8' }} />
                  <Typography variant="body2" sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: '#94a3b8',
                    flex: 1
                  }}>
                    {t.footer?.language || 'Idioma'}
                  </Typography>
                </Box>
                <Box sx={{ px: 0.5 }}>
                  <DropdownButton
                    options={languageOptions}
                    value={language}
                    onChange={(option: DropdownButtonOption) => {
                      if (option.value !== 'select') {
                        setLanguage(option.value as LanguageType);
                      }
                    }}
                    placeholder={t.footer?.selectLanguage || "Seleccionar idioma"}
                    searchable={false}
                    renderValue={(option) => option.native}
                  />
                </Box>
              </Box>

            </Box>
          </Box>
        ) : (
          /* Authenticated User Menu - Modern Design */
          <Box sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '600px',
          }}>
            {/* User Profile Section - Fixed Header */}
            <Box sx={{ textAlign: 'center', mb: 3, px: 2, pt: 2, flexShrink: 0 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#000000',
                  border: '3px solid #29C480',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  boxShadow: '0 4px 16px rgba(41, 196, 128, 0.3)',
                  '& img': {
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                  }
                }}
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user?.name || userProfile?.name || 'User'}
                    width={60}
                    height={60}
                    objectFit="cover"
                    sx={{
                      borderRadius: '50%',
                    }}
                  />
                ) : (
                  <Person sx={{ fontSize: 24, color: '#ffffff' }} />
                )}
              </Avatar>

              <Typography variant="h6" sx={{
                fontWeight: 700,
                color: '#ffffff',
                mb: 0.5,
                fontSize: '1.3rem',
              }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" sx={{
                color: '#94a3b8',
                fontSize: '0.9rem'
              }}>
                {user?.email}
              </Typography>
            </Box>

            {/* Menu Items - Scrollable Area */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0,
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
                {menuItems.length > 0 ? (
                  menuItems.map((item, idx) => {
                    const IconComponent = item.icon;
                    const isActive = activeMenuItem?.href === item.href;
                    return (
                      <MenuItem
                        key={`${item.href}-${idx}`}
                        component={NextLink}
                        href={item.href}
                        onClick={() => handleClose()}
                        sx={{
                          px: 2,
                          py: 2,
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          borderLeft: '3px solid transparent',
                          cursor: 'pointer',
                          color: isActive ? '#22c55e' : '#ffffff',
                          backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                          borderLeftColor: isActive ? '#22c55e' : 'transparent',
                          '&:hover': {
                            backgroundColor: isActive ? 'rgba(34, 197, 94, 0.15)' : '#374151',
                            borderLeftColor: '#22c55e',
                          },
                        }}
                      >
                        <IconComponent sx={{
                          fontSize: '1.4rem',
                          color: isActive ? '#22c55e' : 'inherit'
                        }} />
                        <Typography variant="body2" sx={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '1rem'
                        }}>
                          {item.label}
                        </Typography>
                      </MenuItem>
                    );
                  })
                ) : (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        router.push('/admin/panel/configuration');
                      }}
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
                        '&:hover': {
                          backgroundColor: '#374151',
                          borderLeftColor: '#22c55e',
                        },
                      }}
                    >
                      <AccountCircle sx={{
                        fontSize: '1.4rem'
                      }} />
                      <Typography variant="body2" sx={{
                        fontWeight: 500,
                        fontSize: '1rem'
                      }}>
                        {t.userMenu?.myAccount}
                      </Typography>
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        handleClose();
                        router.push('/admin/panel/home');
                      }}
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
                        '&:hover': {
                          backgroundColor: '#374151',
                          borderLeftColor: '#22c55e',
                        },
                      }}
                    >
                      <Settings sx={{
                        fontSize: '1.4rem'
                      }} />
                      <Typography variant="body2" sx={{
                        fontWeight: 500,
                        fontSize: '1rem'
                      }}>
                        {t.userMenu?.panel}
                      </Typography>
                    </MenuItem>
                  </>
                )}
              </Box>

              {/* Language Selector Section */}
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #374151', px: 2, pb: 2, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Language sx={{ fontSize: '1.4rem', color: '#94a3b8' }} />
                  <Typography variant="body2" sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: '#94a3b8',
                    flex: 1
                  }}>
                    {t.footer?.language || 'Idioma'}
                  </Typography>
                </Box>
                <Box sx={{ px: 0.5 }}>
                  <DropdownButton
                    options={languageOptions}
                    value={language}
                    onChange={(option: DropdownButtonOption) => {
                      if (option.value !== 'select') {
                        setLanguage(option.value as LanguageType);
                      }
                    }}
                    placeholder={t.footer?.selectLanguage || "Seleccionar idioma"}
                    searchable={false}
                    renderValue={(option) => option.native}
                  />
                </Box>
              </Box>

              {/* Logout Section - Fixed Footer */}
              <Box sx={{ pt: 2, borderTop: '1px solid #374151', px: 0, pb: 2, flexShrink: 0 }}>
                <MenuItem
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  sx={{
                    px: 2,
                    py: 2,
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    borderLeft: '3px solid transparent',
                    cursor: logout.isPending ? 'wait' : 'pointer',
                    color: '#dc2626',
                    opacity: logout.isPending ? 0.6 : 1,
                    '&:hover:not(:disabled)': {
                      backgroundColor: '#374151',
                      borderLeftColor: '#dc2626',
                    },
                  }}
                >
                  <ExitToApp sx={{ fontSize: '1.4rem' }} />
                  <Typography variant="body2" sx={{
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    {logout.isPending ? 'Cerrando sesión...' : (t.userMenu?.signOut || 'Cerrar sesión')}
                  </Typography>
                </MenuItem>
              </Box>
            </Box>
        )}
      </Menu>
    </Box>
  );
}

export default UserMenu;
