import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, MenuItem, Fade, CircularProgress } from '@mui/material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useProducts } from '../../../../hooks/use-products';
import { useLanguage } from '../../../../hooks/use-language';

interface NavigationMenuItem {
  label: string;
  href: string;
  key?: string;
}

interface NavigationMenuProps {
  items: NavigationMenuItem[];
  className?: string;
  isCategoriesOpen?: boolean;
  onCategoriesToggle?: (open: boolean) => void;
}

export function NavigationMenu({ items, className, isCategoriesOpen: externalIsCategoriesOpen, onCategoriesToggle }: NavigationMenuProps) {
  const [internalIsCategoriesOpen, setInternalIsCategoriesOpen] = useState(false);
  const isCategoriesOpen = externalIsCategoriesOpen !== undefined ? externalIsCategoriesOpen : internalIsCategoriesOpen;
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { getNavbarCategories } = useProducts();
  const { t } = useLanguage();
  const navbarCategories = getNavbarCategories();
  const pathname = usePathname();
  
  // Obtener el ID de la categoría actual desde la URL
  // La URL es /categories/[categoryId], así que extraemos el ID
  const currentCategoryId = React.useMemo(() => {
    if (pathname?.startsWith('/categories/')) {
      const parts = pathname.split('/');
      const categoryId = parts[2]; // /categories/[id]
      return categoryId;
    }
    return null;
  }, [pathname]);

  const setIsCategoriesOpen = useCallback((open: boolean) => {
    if (onCategoriesToggle) {
      onCategoriesToggle(open);
    } else {
      setInternalIsCategoriesOpen(open);
    }
  }, [onCategoriesToggle]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    if (isCategoriesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoriesOpen, setIsCategoriesOpen]);

  return (
    <Box component="nav" sx={{ display: 'flex', gap: 6, alignItems: 'center', height: '100%', justifyContent: 'flex-start' }}>
      {items.map((item) => {
        const isCategories = item.href === "/categories" || item.key === 'categories';
        
        if (isCategories) {
          return (
            <Box
              key={item.href}
              ref={categoriesRef}
              sx={{
                position: 'relative',
                height: '100%',
                zIndex: 1500 // Asegurar que el contenedor del dropdown esté por encima
              }}
            >
              <Box
                component="button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCategoriesOpen(!isCategoriesOpen);
                }}
                sx={{
                  color: '#fff',
                  textDecoration: 'none',
                  position: 'relative',
                  transition: 'color 0.2s ease',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderBottom: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(0, 0, 0, 0.25)',
                  '&:hover': {
                    color: '#19e97c',
                  },
                }}
                className={className}
              >
                {item.label}
                <ChevronDown 
                  size={16} 
                  style={{ 
                    color: 'inherit',
                    transition: 'transform 500ms ease',
                    transform: isCategoriesOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} 
                />
              </Box>

              {isCategoriesOpen && (
                <Fade in={isCategoriesOpen} timeout={300}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: '100%',
                      mt: 2,
                      width: '340px',
                      maxWidth: '380px',
                      background: '#111827',
                      borderRadius: '0px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                      zIndex: 1500, // Mayor que el menú 2 (1000) y la línea verde (1001) para que esté por encima
                      overflow: 'hidden',
                    }}
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
                        {t.menu.categories}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: '#94a3b8',
                        fontSize: '0.9rem'
                      }}>
                        {t.menu.categoriesSubtitle}
                      </Typography>
                    </Box>

                    {/* Categories List - Scrollable */}
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
                      {navbarCategories.length > 0 ? (
                        navbarCategories.map((category) => {
                          // Verificar si esta categoría es la actual
                          const isCurrentCategory = currentCategoryId === category.id;
                          
                          return (
                            <NextLink 
                              key={category.id} 
                              href={isCurrentCategory ? '#' : category.href} 
                              style={{ textDecoration: 'none' }}
                              onClick={(e) => {
                                // Prevenir navegación si es la categoría actual
                                if (isCurrentCategory) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <MenuItem
                                onClick={() => setIsCategoriesOpen(false)}
                                disabled={isCurrentCategory}
                                sx={{
                                  px: 2,
                                  py: 2,
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  borderLeft: isCurrentCategory ? '3px solid #22c55e' : '3px solid transparent',
                                  cursor: isCurrentCategory ? 'not-allowed' : 'pointer',
                                  color: isCurrentCategory ? '#22c55e' : '#ffffff',
                                  backgroundColor: isCurrentCategory ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                  opacity: isCurrentCategory ? 1 : 1,
                                  '&:hover': {
                                    backgroundColor: isCurrentCategory ? 'rgba(34, 197, 94, 0.15)' : '#374151',
                                    borderLeftColor: '#22c55e',
                                  },
                                  '&.Mui-disabled': {
                                    opacity: 1,
                                    color: '#22c55e',
                                  },
                                }}
                              >
                                <Typography variant="body2" sx={{
                                  fontWeight: isCurrentCategory ? 700 : 600,
                                  fontSize: '1rem'
                                }}>
                                  {category.name}
                                </Typography>
                              </MenuItem>
                            </NextLink>
                          );
                        })
                      ) : (
                        <Box
                          sx={{
                            px: 3,
                            py: 2,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <CircularProgress size={24} sx={{ color: '#29C480' }} />
                        </Box>
                      )}

                    </Box>
                  </Box>

                  {/* Todas las categorías - Footer */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #374151', px: 0, pb: 2, flexShrink: 0 }}>
                    <NextLink href="/categories" style={{ textDecoration: 'none' }}>
                      <MenuItem
                        onClick={() => setIsCategoriesOpen(false)}
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
                              {t.menu.allCategories}
                            </Typography>
                      </MenuItem>
                    </NextLink>
                  </Box>
                </Box>
              </Fade>
              )}
            </Box>
          );
        }

        return (
        <NextLink
          key={item.href}
          href={item.href}
          onClick={() => setIsCategoriesOpen(false)}
          style={{ textDecoration: 'none' }}
        >
          <Box
            component="span"
            sx={{
              color: '#fff',
              textDecoration: 'none',
              position: 'relative',
              transition: 'color 0.2s ease',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderBottom: 'none',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.35), 0 1px 0 rgba(0, 0, 0, 0.25)',
              '&:hover': {
                color: '#19e97c',
              },
            }}
            className={className}
          >
            {item.label}
          </Box>
        </NextLink>
        );
      })}
    </Box>
  );
}

export default NavigationMenu;
