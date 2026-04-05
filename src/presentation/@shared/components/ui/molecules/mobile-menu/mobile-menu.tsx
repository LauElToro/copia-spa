'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Box, Avatar, Typography, IconButton, MenuItem, CircularProgress, Fade, Button } from '@mui/material'
import { Login, Person, Close as CloseIcon, Storefront, Home, ShoppingBag, QuestionAnswer, Settings, People, Diamond, BarChart, ArrowForward, Link as LinkIcon } from '@mui/icons-material'
import { X, Search, Heart, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { Link } from '../../atoms/link'
import { useProfile } from '@/presentation/@shared/hooks/use-profile'
import { useLanguage } from '@/presentation/@shared/hooks/use-language'
import { useAuth } from '@/presentation/@shared/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'
import type { ProductEntity } from '@/presentation/@shared/types/product'
import { getAvatarUrl } from '@/presentation/@shared/hooks/use-user-avatar'
import { useNavbarProductSearch } from '@/presentation/@shared/hooks/use-products'

type AccountType = 'user' | 'commerce' | 'seller';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  menuItems: Array<{ label: string; href: string }>
  onFavoritesClick?: () => void
  onCartClick?: () => void
  onLoginClick?: () => void
  products?: ProductEntity[]
  searchResults?: Array<{
    id: string
    name: string
    price: number
    discount?: number
    imageUrl?: string
  }>
  isLoading?: boolean
  onSearch?: (query: string) => void
  onProductClick?: (productId: string) => void
  userProfile?: UserProfile | null
}

export default function MobileMenu({ 
  isOpen, 
  onClose, 
  menuItems,
  onFavoritesClick,
  onCartClick,
  onLoginClick,
  products = [],
  searchResults = [],
  isLoading = false,
  onSearch,
  onProductClick,
  userProfile = null
}: MobileMenuProps) {
  const { profile, isAuthenticated } = useProfile()
  const { t } = useLanguage()
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350)
    return () => clearTimeout(t)
  }, [searchQuery])

  const {
    data: serverResults = [],
    isLoading: serverLoading,
    isFetching: serverFetching,
  } = useNavbarProductSearch(debouncedQuery)

  const legacyLocalProducts = useMemo(() => {
    if (products.length === 0) return []
    return products.filter(
      (product) =>
        product.active_status === 1 &&
        typeof product.name === 'string' &&
        product.name.trim().length > 0
    )
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }
    const normalizedQuery = searchQuery.toLowerCase()

    if (debouncedQuery.length >= 2) {
      return serverResults.slice(0, 8)
    }

    if (legacyLocalProducts.length > 0) {
      return legacyLocalProducts
        .filter((product) => product.name.toLowerCase().includes(normalizedQuery))
        .slice(0, 8)
    }

    if (searchResults.length > 0) {
      return searchResults
        .filter((r) => r.name.toLowerCase().includes(normalizedQuery))
        .slice(0, 8)
        .map((result) => ({
          id: result.id,
          name: result.name,
          price: result.price,
          crypto: 'USD',
          category_identification_code: '',
          image_url: result.imageUrl,
          active_status: 1,
        })) as ProductEntity[]
    }

    return []
  }, [searchQuery, debouncedQuery, serverResults, legacyLocalProducts, searchResults])

  const searchBusy =
    debouncedQuery.length >= 2 && (serverLoading || serverFetching)

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    // Don't close if hovering over dropdown
    if (isHoveringDropdown) {
      return
    }
    setIsFocused(false)
  }

  const handleClear = () => {
    setSearchQuery('')
    setIsFocused(false)
    setIsHoveringDropdown(false)
    inputRef.current?.blur()
    onSearch?.('')
  }

  const handleProductClick = useCallback((productId: string) => {
    setIsFocused(false)
    setIsHoveringDropdown(false)
    setSearchQuery('')
    onClose()
    router.push(`/product/${productId}`)
    onProductClick?.(productId)
  }, [router, onProductClick, onClose])

  const formatProductPrice = useCallback((price: number, currency: string) => {
    const normalizedCurrency = currency?.toUpperCase() || 'USD'
    const safeCurrency = normalizedCurrency.length === 3 ? normalizedCurrency : 'USD'

    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: safeCurrency,
        maximumFractionDigits: 2,
      }).format(price)
    } catch {
      const fallbackPrice = Number.isFinite(price) ? price.toFixed(2) : '0.00'
      return `${fallbackPrice} ${normalizedCurrency || 'USD'}`
    }
  }, [])

  const showDropdown = (isFocused || isHoveringDropdown) && searchQuery.trim().length > 0

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        dropdownRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
        setIsHoveringDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const profileData = profile as { 
    name?: string; 
    email?: string; 
    avatar?: string;
    additionalInfo?: {
      avatar?: string | Record<string, unknown>;
      avatar_url?: string;
      [key: string]: unknown;
    };
  } | null
  const userName = profileData?.name || t.common?.user || 'Usuario'
  const userRole = isAuthenticated ? (t.admin?.member || 'Miembro') : (t.admin?.guest || 'Invitado')
  
  // Extraer la URL del avatar usando la función helper que maneja objetos media completos
  type ProfileDataType = {
    avatar?: string | { variants?: { sm?: { url?: string }; md?: { url?: string }; lg?: { url?: string } }; url?: string; smUrl?: string };
    additionalInfo?: {
      avatar?: string | { variants?: { sm?: { url?: string }; md?: { url?: string }; lg?: { url?: string } }; url?: string; smUrl?: string };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  } | null;
  const extractAvatarFromProfile = (profileData: ProfileDataType): string | undefined => {
    if (!profileData) return undefined;
    
    // Primero intentar desde avatar directo (string)
    if (profileData.avatar && typeof profileData.avatar === 'string') {
      return profileData.avatar;
    }
    
    // Luego intentar desde additionalInfo.avatar (puede ser string o objeto media completo)
    if (profileData.additionalInfo?.avatar) {
      const avatarUrl = getAvatarUrl(profileData.additionalInfo.avatar);
      if (avatarUrl) return avatarUrl;
    }
    
    // Finalmente intentar desde additionalInfo.avatar_url (compatibilidad hacia atrás)
    if (profileData.additionalInfo?.avatar_url && typeof profileData.additionalInfo.avatar_url === 'string') {
      return profileData.additionalInfo.avatar_url;
    }
    
    return undefined;
  };
  
  const userAvatar = extractAvatarFromProfile(profileData)

  const handleLoginClick = () => {
    onClose()
    if (onLoginClick) {
      onLoginClick()
    } else {
      router.push('/login')
    }
  }

  const handleRegisterUserClick = () => {
    onClose()
    router.push('/register?type=user')
  }

  const handleRegisterSellerClick = () => {
    onClose()
    router.push('/register?type=seller')
  }

  const handleLogout = async () => {
    try {
      onClose()
      await logout.mutateAsync()
      // Redirigir al home después del logout exitoso
      if (globalThis.window !== undefined) {
        globalThis.window.location.href = '/'
      }
    } catch (error) {
      console.error('Error during logout:', error)
      // Aún así redirigir al home en caso de error
      if (globalThis.window !== undefined) {
        globalThis.window.location.href = '/'
      }
    }
  }

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
          label: t.menu?.products || "Productos"
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
          icon: LinkIcon,
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

  let accountMenuItems = userProfile ? getMenuItems(userProfile.accountType) : [];

  // Override de menú para página de métricas
  if (pathname?.startsWith('/admin/panel/metrics')) {
    accountMenuItems = [
      { href: '/admin/panel/metrics', icon: BarChart, label: t.admin?.analytics || 'Analíticas' },
      { href: '/admin/panel/panel-proliberter/assistant/mark', icon: Person, label: t.admin?.aiAssistant || 'Asistente AI' },
      { href: '/admin/panel/home', icon: Storefront, label: t.menu?.back || 'Volver' },
    ];
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: '#1f2937',
        zIndex: 1500,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        '@keyframes slideUp': {
          from: {
            transform: 'translateY(100%)',
            opacity: 0,
          },
          to: {
            transform: 'translateY(0)',
            opacity: 1,
          },
        },
      }}
    >
      {/* Header with Logo and Close Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: '#1f2937',
        }}
      >
        <Box
          component="a"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            router.push('/');
            onClose();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          <Image
            src="/images/logo-full.svg"
            alt="Liberty Club logo"
            width={150}
            height={100}
            style={{
              objectFit: 'contain',
              height: 'auto',
            }}
            unoptimized={true}
          />
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          aria-label={t.menu?.closeMenu || "Cerrar menú"}
        >
          <X size={24} />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Box
        ref={searchContainerRef}
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#111827',
            borderRadius: '8px',
            px: 2,
            py: 1,
            border: '1px solid',
            borderColor: isFocused ? '#29C480' : 'rgba(255, 255, 255, 0.1)',
            transition: 'border-color 300ms ease',
            position: 'relative',
          }}
        >
          {isLoading || searchBusy ? (
            <CircularProgress 
              size={18} 
              sx={{ 
                color: '#29C480',
              }} 
            />
          ) : (
            <Search size={20} color="#9ca3af" />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder={t.search?.placeholder || "Buscar productos..."}
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '1rem',
            }}
          />
          {searchQuery && (
            <IconButton
              onClick={handleClear}
              sx={{
                p: 0.5,
                color: '#9ca3af',
                '&:hover': {
                  backgroundColor: 'rgba(41, 196, 128, 0.2)',
                  color: '#29C480',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <Fade in={showDropdown} timeout={300}>
            <Box
              ref={dropdownRef}
              sx={{
                position: 'absolute',
                left: 24,
                right: 24,
                top: 'calc(100% + 8px)',
                background: '#111827',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 1400,
                overflow: 'hidden',
                maxHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={() => setIsHoveringDropdown(true)}
              onMouseLeave={() => setIsHoveringDropdown(false)}
            >
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 2, px: 2, pt: 2, flexShrink: 0 }}>
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  color: '#ffffff',
                  mb: 1,
                  fontSize: '1.25rem',
                }}>
                  {t.search.results}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#94a3b8',
                  fontSize: '0.875rem'
                }}>
                  {isLoading || searchBusy
                    ? t.search.searching
                    : filteredProducts.length > 0 
                      ? (filteredProducts.length === 1
                        ? t.search.productsFound.replace('{count}', filteredProducts.length.toString())
                        : t.search.productsFoundPlural.replace('{count}', filteredProducts.length.toString()))
                      : t.search.noResultsMessage}
                </Typography>
              </Box>

              {/* Products List - Scrollable */}
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
                    background: '#29C480',
                  },
                },
              }}>
                {isLoading || searchBusy ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={24} sx={{ color: '#29C480' }} />
                    <Typography variant="body2" sx={{ ml: 2, color: '#94a3b8' }}>
                      {t.search.searching}
                    </Typography>
                  </Box>
                ) : filteredProducts.length === 0 ? (
                  <Box
                    sx={{
                      px: 3,
                      py: 3,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.875rem',
                      mb: 1,
                    }}>
                      {t.search.noResultsMessage}
                    </Typography>
                    <Typography variant="caption" sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.75rem',
                    }}>
                      {searchQuery && t.search.forQuery.replace('{query}', searchQuery)}
                    </Typography>
                  </Box>
                ) : (
                  filteredProducts.map((product) => {
                    const formattedPrice = formatProductPrice(product.price, product.crypto)
                    interface ProductWithImageUrl {
                      imageUrl?: string;
                    }
                    const imageUrl = product.image_url || (product as ProductWithImageUrl).imageUrl

                    return (
                      <NextLink key={product.id} href={`/product/${product.id}`} passHref>
                        <MenuItem
                          component="a"
                          onClick={() => handleProductClick(product.id)}
                          sx={{
                            px: 2,
                            py: 1.5,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            borderLeft: '3px solid transparent',
                            cursor: 'pointer',
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: '#374151',
                              borderLeftColor: '#29C480',
                            },
                          }}
                        >
                          {imageUrl && (
                            <Box
                              component="img"
                              src={imageUrl}
                              alt={product.name}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '4px',
                                objectFit: 'cover',
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{
                              fontWeight: 600,
                              fontSize: '0.9375rem',
                              color: '#ffffff',
                              mb: 0.25,
                              lineHeight: 1.2,
                            }}>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" sx={{
                              color: '#94a3b8',
                              fontSize: '0.8125rem',
                              lineHeight: 1.2,
                            }}>
                              {formattedPrice}
                            </Typography>
                          </Box>
                        </MenuItem>
                      </NextLink>
                    )
                  })
                )}
              </Box>

              {/* Go to Shop Button - Footer */}
              {filteredProducts.length > 0 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #374151', px: 0, pb: 2, flexShrink: 0 }}>
                  <NextLink href="/shop" passHref>
                    <MenuItem
                      component="a"
                      onClick={() => {
                        setIsFocused(false)
                        setIsHoveringDropdown(false)
                        setSearchQuery('')
                        onClose()
                      }}
                      sx={{
                        px: 2,
                        py: 1.5,
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        borderLeft: '3px solid transparent',
                        cursor: 'pointer',
                        color: '#29C480',
                        '&:hover': {
                          backgroundColor: '#374151',
                          borderLeftColor: '#29C480',
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{
                        fontWeight: 600,
                        fontSize: '0.9375rem'
                      }}>
                        {t.search.goToShop}
                      </Typography>
                    </MenuItem>
                  </NextLink>
                </Box>
              )}
            </Box>
          </Fade>
        )}
      </Box>

      {/* Action Icons Row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <IconButton
          onClick={() => {
            onClose()
            onFavoritesClick?.()
          }}
          sx={{
            color: '#ffffff',
            flexDirection: 'column',
            gap: 0.5,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Heart size={24} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            {t.tooltips?.favorites || 'Favoritos'}
          </Typography>
        </IconButton>

        <IconButton
          onClick={() => {
            onClose()
            onCartClick?.()
          }}
          sx={{
            color: '#ffffff',
            flexDirection: 'column',
            gap: 0.5,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <ShoppingCart size={24} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            {t.tooltips?.cart || 'Carrito'}
          </Typography>
        </IconButton>
      </Box>
      {/* Profile Section or Login Button */}
      <Box
        sx={{
          pt: 4,
          pb: 3,
          px: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {isAuthenticated && (
          <>
            {/* Avatar */}
            <Box
              sx={{
                position: 'relative',
                mb: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#000000',
                  border: '3px solid #29C480',
                  boxShadow: '0 4px 16px rgba(41, 196, 128, 0.3)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  '& img': {
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                  }
                }}
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={80}
                    height={80}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      display: 'block'
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: '2rem',
                      color: '#ffffff',
                    }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </Typography>
                )}
              </Avatar>
            </Box>

            {/* Name */}
            <Typography
              sx={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#ffffff',
                mb: 0.5,
                textAlign: 'center',
              }}
            >
              {userName}
            </Typography>

            {/* Role */}
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
              }}
            >
              {userRole}
            </Typography>
          </>
        )}
      </Box>

      {/* Navigation Items */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 4,
          py: 2,
          position: 'relative',
          zIndex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
          },
        }}
      >
        {/* Account Menu Items - Solo visible si el usuario está autenticado */}
        {isAuthenticated && accountMenuItems.length > 0 && (
          <>
            <Box
              sx={{
                mb: 1,
                px: 2,
              }}
            >
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Mi Cuenta
              </Typography>
            </Box>
            {accountMenuItems.map((item) => {
              return (
                <Box
                  key={item.href}
                  component="div"
                  sx={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Box
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .mobile-menu-link': {
                          paddingLeft: '1.5rem',
                        },
                      },
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      variant="text"
                      className="mobile-menu-link"
                      style={{
                        display: 'block',
                        padding: '1rem',
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: 400,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </Link>
                  </Box>
                </Box>
              );
            })}
          </>
        )}

        {/* Mi Cuenta - Solo visible si el usuario NO está autenticado */}
        {!isAuthenticated && (
          <>
            <Box
              sx={{
                mt: 1.5,
                mb: 1,
                px: 2,
              }}
            >
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Mi Cuenta
              </Typography>
            </Box>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Button
                component={NextLink}
                href="/login"
                onClick={() => {
                  handleLoginClick()
                  onClose()
                }}
                sx={{
                  px: 4,
                  py: 1.5,
                  backgroundColor: '#29C480',
                  color: '#1e293b',
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  width: '100%',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    color: '#000000'
                  },
                  '& .MuiSvgIcon-root': {
                    transition: 'transform 0.3s ease'
                  },
                  '&:hover .MuiSvgIcon-root': {
                    transform: 'translateX(4px)'
                  }
                }}
              >
                {t.userMenu?.signIn || 'Iniciar sesión'}
                <Login sx={{ fontSize: 18, ml: 0.5 }} />
              </Button>
            </Box>
            <Box
              key="create-user-account"
              component="div"
              sx={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <Box
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .mobile-menu-link': {
                      paddingLeft: '1.5rem',
                    },
                  },
                }}
              >
                <Link
                  href="/register?type=user"
                  onClick={() => {
                    handleRegisterUserClick()
                    onClose()
                  }}
                  variant="text"
                  className="mobile-menu-link"
                  style={{
                    display: 'block',
                    padding: '1rem',
                    color: '#ffffff',
                    fontSize: '1.125rem',
                    fontWeight: 400,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t.userMenu?.createUserAccount || 'Crear cuenta de usuario'}
                </Link>
              </Box>
            </Box>
            <Box
              key="create-seller-account"
              component="div"
              sx={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <Box
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .mobile-menu-link': {
                      paddingLeft: '1.5rem',
                    },
                  },
                }}
              >
                <Link
                  href="/register?type=seller"
                  onClick={() => {
                    handleRegisterSellerClick()
                    onClose()
                  }}
                  variant="text"
                  className="mobile-menu-link"
                  style={{
                    display: 'block',
                    padding: '1rem',
                    color: '#ffffff',
                    fontSize: '1.125rem',
                    fontWeight: 400,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t.userMenu?.createSellerAccount || 'Crear cuenta de vendedor'}
                </Link>
              </Box>
            </Box>
          </>
        )}

        {/* Menu Principal */}
        <Box
          sx={{
            mt: isAuthenticated && accountMenuItems.length > 0 ? 3 : (!isAuthenticated ? 3 : 0),
            mb: 1,
            px: 2,
          }}
        >
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Menu principal
          </Typography>
        </Box>
        {menuItems.map((item) => (
          <Box
            key={item.href}
            component="div"
            sx={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '&:last-child': {
                borderBottom: 'none',
              },
            }}
          >
            <Box
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .mobile-menu-link': {
                    paddingLeft: '1.5rem',
                  },
                },
              }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                variant="text"
                className="mobile-menu-link"
                style={{
                  display: 'block',
                  padding: '1rem',
                  color: '#ffffff',
                  fontSize: '1.125rem',
                  fontWeight: 400,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </Link>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer con botón de logout - Solo visible si el usuario está autenticado */}
      {isAuthenticated && (
        <Box
          sx={{
            px: 4,
            py: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            flexShrink: 0,
            backgroundColor: '#1f2937',
          }}
        >
          <Button
            onClick={handleLogout}
            disabled={logout.isPending}
            sx={{
              width: '100%',
              px: 4,
              py: 1.5,
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'background-color 0.3s ease, color 0.3s ease',
              opacity: logout.isPending ? 0.6 : 1,
              cursor: logout.isPending ? 'wait' : 'pointer',
              '&:hover': {
                backgroundColor: '#b91c1c',
                color: '#ffffff',
              },
              '&:disabled': {
                backgroundColor: '#dc2626',
                opacity: 0.6,
              },
              '& .MuiSvgIcon-root': {
                transition: 'transform 0.3s ease',
              },
              '&:hover:not(:disabled) .MuiSvgIcon-root': {
                transform: 'translateX(4px)',
              },
            }}
          >
            {logout.isPending ? (t.menu?.loggingOut || 'Cerrando sesión...') : (t.userMenu?.signOut || 'Cerrar sesión')}
            <ArrowForward sx={{ fontSize: 18, ml: 0.5 }} />
          </Button>
        </Box>
      )}

    </Box>
    </>
  )
}

