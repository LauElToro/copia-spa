"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  InputBase,
  Typography,
  MenuItem,
  CircularProgress,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import type { ProductEntity } from '@/presentation/@shared/types/product';
import NextLink from 'next/link';
import { useNavbarProductSearch } from '@/presentation/@shared/hooks/use-products';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onProductClick?: (productId: string) => void;
  searchResults?: Array<{
    id: string;
    name: string;
    price: number;
    discount?: number;
    imageUrl?: string;
  }>;
  products?: ProductEntity[];
  categories?: Array<{ id: string; name: string; href: string }>;
  isLoading?: boolean;
}

function SearchBar({
  placeholder,
  onSearch,
  onProductClick,
  searchResults = [],
  products = [],
  isLoading = false
}: SearchBarProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const defaultPlaceholder = placeholder || t.search.placeholder;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const {
    data: serverResults = [],
    isLoading: serverLoading,
    isFetching: serverFetching,
  } = useNavbarProductSearch(debouncedQuery);

  // Legacy: lista local solo si se pasan productos (compat); si no, búsqueda por API
  const legacyLocalProducts = useMemo(() => {
    if (products.length === 0) return [];
    return products.filter(
      (product) =>
        product.active_status === 1 &&
        typeof product.name === 'string' &&
        product.name.trim().length > 0
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const normalizedQuery = searchQuery.toLowerCase();

    if (debouncedQuery.length >= 2) {
      return serverResults.slice(0, 8);
    }

    if (legacyLocalProducts.length > 0) {
      return legacyLocalProducts
        .filter((product) => product.name.toLowerCase().includes(normalizedQuery))
        .slice(0, 8);
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
        })) as ProductEntity[];
    }

    return [];
  }, [
    searchQuery,
    debouncedQuery,
    serverResults,
    legacyLocalProducts,
    searchResults,
  ]);

  const searchBusy =
    debouncedQuery.length >= 2 && (serverLoading || serverFetching);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (searchQuery.trim()) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    // Don't close if hovering over dropdown
    if (isHoveringDropdown) {
      return;
    }
    setIsFocused(false);
    if (!filteredProducts.length && searchQuery.trim() === '') {
      setIsAnimatingOut(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimatingOut(false);
      }, 200);
    } else if (!filteredProducts.length) {
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimatingOut(false);
      }, 150);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
      inputRef.current?.blur();
    }, 200);
    onSearch?.('');
  };

  const handleProductClick = useCallback((productId: string) => {
    setIsOpen(false);
    setIsFocused(false);
    setIsHoveringDropdown(false);
    setSearchQuery('');
    router.push(`/product/${productId}`);
    onProductClick?.(productId);
  }, [router, onProductClick]);

  const formatProductPrice = useCallback((price: number, currency: string) => {
    const normalizedCurrency = currency?.toUpperCase() || 'USD';
    const safeCurrency = normalizedCurrency.length === 3 ? normalizedCurrency : 'USD';

    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: safeCurrency,
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      const fallbackPrice = Number.isFinite(price) ? price.toFixed(2) : '0.00';
      return `${fallbackPrice} ${normalizedCurrency || 'USD'}`;
    }
  }, []);

  const showDropdown = (isOpen || isFocused || isHoveringDropdown) && searchQuery.trim().length > 0;

  // Update isOpen when filteredProducts change
  useEffect(() => {
    if (searchQuery.trim() && filteredProducts.length > 0) {
      setIsOpen(true);
    }
  }, [searchQuery, filteredProducts.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        dropdownRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
    setIsOpen(false);
        setIsFocused(false);
        setIsHoveringDropdown(false);
      }
  };

    if (isOpen || showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
  };
  }, [isOpen, showDropdown]);

  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2, height: '100%', marginBottom: '6px' }}>
      <Box ref={searchContainerRef} sx={{ display: 'flex', alignItems: 'center', height: '100%', position: 'relative' }}>
        {/* Search Input */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: isOpen || isAnimatingOut ? 240 : 0,
          mr: isOpen || isAnimatingOut ? 1 : 0,
          height: '100%',
          overflow: 'hidden',
          opacity: isAnimatingOut ? 0 : 1,
          transform: isAnimatingOut ? 'translateX(-10px)' : 'translateX(0)',
          transition: isAnimatingOut ?
            'all 0.2s ease-in' :
            'width 0.2s ease, margin-right 0.2s ease, all 0.3s ease-out',
        }}
      >
        {(isOpen || isAnimatingOut) && (
          <Box
            sx={{
              width: '100%',
              animation: isAnimatingOut ?
                'none' :
                'searchInputFadeIn 0.3s ease-out',
              '@keyframes searchInputFadeIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateX(20px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateX(0)',
                },
              },
            }}
          >
            <InputBase
              inputRef={inputRef}
              placeholder={defaultPlaceholder}
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoFocus
              startAdornment={
                  isLoading || searchBusy ? (
                    <CircularProgress 
                      size={18} 
                      sx={{ 
                        color: '#29C480',
                        mr: 1
                      }} 
                    />
                  ) : (
                    <SearchIcon sx={{
                  color: 'text.secondary',
                  fontSize: '1.2rem',
                  mr: 1,
                  opacity: 0.7
                }} />
                  )
              }
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid',
                borderColor: isFocused ? 'primary.main' : 'rgba(255, 255, 255, 0.3)',
                borderRadius: 1,
                px: 2,
                py: 0.5,
                height: '100%',
                color: 'text.primary',
                fontSize: '0.875rem',
                width: '100%',
                transition: 'border-color 300ms ease',
                '& .MuiInputBase-input': {
                  py: 0.5,
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'text.secondary',
                  opacity: 1,
                },
              }}
            />

            {searchQuery && (
              <Box
                onClick={handleClear}
                sx={{
                  position: 'absolute',
                  right: 8,
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  color: 'text.secondary',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(41, 196, 128, 0.2)',
                    color: 'primary.main',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                  <CloseIcon sx={{ fontSize: 14, fontWeight: 300 }} />
              </Box>
            )}
          </Box>
        )}
        </Box>

      {/* Search Icon - Only visible when not searching */}
      {!isOpen && (
          <Box
            component="button"
            type="button"
          onClick={() => {
              setSearchQuery('');
            setIsOpen(true);
              setIsFocused(false);
              setIsHoveringDropdown(false);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          sx={{
            height: '100%',
            width: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            color: 'text.secondary',
            transition: 'all 300ms ease-in-out',
            opacity: !isOpen ? 1 : 0,
            transform: !isOpen ? 'scale(1)' : 'scale(0.8)',
            marginBottom: '-6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
            <SearchIcon />
          </Box>
      )}

        {/* Search Results Dropdown - Same style as categories dropdown */}
      {showDropdown && (
          <Fade in={showDropdown} timeout={300}>
            <Box
              ref={dropdownRef}
          sx={{
            position: 'absolute',
                left: 0,
            top: 'calc(100% + 8px)',
                width: '340px',
                maxWidth: '380px',
                background: '#111827',
                borderRadius: '0px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                border: 'none',
            zIndex: 1300,
                overflow: 'hidden',
              }}
              onMouseEnter={() => setIsHoveringDropdown(true)}
              onMouseLeave={() => setIsHoveringDropdown(false)}
            >
            <Box sx={{
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '400px',
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
                  {t.search.results}
                </Typography>
                <Typography variant="body2" sx={{
                  color: '#94a3b8',
                  fontSize: '0.9rem'
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
                    background: '#22c55e',
                  },
                },
              }}>
                {isLoading || searchBusy ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={24} sx={{ color: '#22c55e' }} />
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
                    const formattedPrice = formatProductPrice(product.price, product.crypto);
                    interface ProductWithImageUrl {
                      imageUrl?: string;
                    }
                    const imageUrl = product.image_url || (product as ProductWithImageUrl).imageUrl;

                    return (
                      <NextLink key={product.id} href={`/product/${product.id}`} passHref>
                        <MenuItem
                          component="a"
                          onClick={() => handleProductClick(product.id)}
                          sx={{
                            px: 2,
                            py: 1,
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
                              fontSize: '1rem',
                              color: '#ffffff',
                              mb: 0,
                              lineHeight: 1,
                              pb: 0,
                            }}>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" sx={{
                              color: '#94a3b8',
                              fontSize: '0.875rem',
                              mt: '-2px',
                              lineHeight: 1,
                              pt: 0,
                            }}>
                              {formattedPrice}
                        </Typography>
                          </Box>
                        </MenuItem>
                      </NextLink>
                    );
                  })
                )}
              </Box>

              {/* Go to Shop Button - Footer */}
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #374151', px: 0, pb: 2, flexShrink: 0 }}>
                <NextLink href="/shop" passHref>
                  <MenuItem
                    component="a"
                    onClick={() => {
                      setIsOpen(false);
                      setIsFocused(false);
                      setIsHoveringDropdown(false);
                      setSearchQuery('');
                    }}
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
                      {t.search.goToShop}
                        </Typography>
                  </MenuItem>
                </NextLink>
                  </Box>
                </Box>
              </Box>
          </Fade>
      )}
      </Box>
    </Box>
  );
}

export default SearchBar;
