'use client';

import React, { useMemo, useEffect, useCallback } from 'react';
import { Box, Container, Stack } from '@mui/material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import FavoritesSection from '@/presentation/@shared/components/ui/molecules/favorites-section/favorites-section';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import { useFavorites, useFavoritesOperations } from '@/presentation/@shared/hooks/use-favorites';
import { FavoriteItem } from '@/presentation/@shared/stores/favorites-store';
import { useModal } from '@/presentation/@shared/hooks/use-modal';
import { ImageModal } from '@/presentation/@shared/components/ui/molecules/image-modal';

declare global {
  interface Window {
    handleImageClick?: (imageUrl: string, productName: string) => void;
    handleRemoveFavorite?: (productId: string, productName: string) => void;
  }
}

const FavoritesPage: React.FC = () => {
  const { items } = useFavorites();
  const { clearFavorites, removeFavorite, isLoading } = useFavoritesOperations();
  const { openModal } = useModal();

  const handleClearFavorites = () => {
    clearFavorites();
  };

  // Función para abrir el modal de imagen
  const handleImageModal = useCallback((imageUrl: string, productName: string) => {
    openModal(
      <ImageModal 
        images={[imageUrl]} 
        initialIndex={0}
        alt={productName} 
      />,
      {
        maxWidth: false,
        fullWidth: true
      }
    );
  }, [openModal]);

  // Función para eliminar de favoritos
  const handleRemoveFavoriteClick = useCallback((productId: string, productName: string) => {
    removeFavorite({ id: productId, name: productName });
  }, [removeFavorite]);

  // Configurar funciones globales para que el HTML renderizado pueda llamarlas
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.handleImageClick = (imageUrl: string, productName: string) => {
        handleImageModal(imageUrl, productName);
      };
      window.handleRemoveFavorite = (productId: string, productName: string) => {
        handleRemoveFavoriteClick(productId, productName);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete window.handleImageClick;
        delete window.handleRemoveFavorite;
      }
    };
  }, [handleImageModal, handleRemoveFavoriteClick]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  // Columnas para la tabla de favoritos
  const favoritesColumns: DataTableColumn[] = useMemo(() => [
    {
      title: 'IMAGEN',
      data: 'image',
      responsivePriority: 1,
      type: 'html',
      orderable: false,
      searchable: false,
      render: function(data: unknown, type: string, row: Record<string, unknown>) {
        if (type === 'display') {
          const image = String(data || '');
          const name = String(row.name || '');
          const imageUrl = image.replace(/'/g, "\\'");
          const productName = name.replace(/'/g, "\\'");
          return `
            <div style="display: flex; align-items: center; justify-content: center;">
              <img 
                src="${image}" 
                alt="${name}"
                onclick="if (window.handleImageClick) { window.handleImageClick('${imageUrl}', '${productName}'); }"
                style="
                  width: 80px;
                  height: 80px;
                  object-fit: cover;
                  border-radius: 8px;
                  cursor: pointer;
                  transition: transform 0.2s ease;
                "
                onmouseover="this.style.transform='scale(1.05)'"
                onmouseout="this.style.transform='scale(1)'"
              />
            </div>
          `;
        }
        return data as string;
      },
    },
    {
      title: 'PRODUCTO',
      data: 'name',
      responsivePriority: 1,
      searchable: true,
      type: 'html',
      render: function(data: unknown, type: string, row: Record<string, unknown>) {
        if (type === 'display') {
          const name = String(data || '');
          const id = String(row.id || '');
          return `
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <a 
                href="/product/${id}"
                style="
                  color: #34d399;
                  text-decoration: none;
                  font-weight: 600;
                  font-size: 1rem;
                  transition: color 0.2s ease;
                "
                onmouseover="this.style.color='#ffffff'"
                onmouseout="this.style.color='#34d399'"
              >
                ${name}
              </a>
              ${row.storeName ? `
                <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
                  ${row.storeName}
                </span>
              ` : ''}
            </div>
          `;
        }
        return data as string;
      },
    },
    {
      title: 'PRECIO',
      data: 'price',
      responsivePriority: 1,
      type: 'html',
      render: function(data: unknown, type: string, row: Record<string, unknown>) {
        if (type === 'display') {
          const price = Number(data || 0);
          const originalPrice = row.originalPrice ? Number(row.originalPrice) : null;
          const formattedPrice = formatPrice(price);
          const formattedOriginalPrice = originalPrice ? formatPrice(originalPrice) : '';
          
          return `
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${originalPrice && originalPrice > price ? `
                <span style="
                  text-decoration: line-through;
                  color: rgba(255, 255, 255, 0.5);
                  font-size: 0.875rem;
                ">
                  ${formattedOriginalPrice}
                </span>
              ` : ''}
              <span style="
                color: #34d399;
                font-weight: 600;
                font-size: 1.1rem;
              ">
                ${formattedPrice}
              </span>
            </div>
          `;
        }
        return data as string;
      },
    },
    {
      title: 'AGREGADO',
      data: 'dateAdded',
      responsivePriority: 2,
      searchable: false,
      type: 'html',
      render: function(data: unknown, type: string) {
        if (type === 'display') {
          const date = data instanceof Date ? data : new Date(String(data || ''));
          const formattedDate = formatDate(date);
          return `
            <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">
              ${formattedDate}
            </span>
          `;
        }
        return data as string;
      },
    },
    {
      title: 'STOCK',
      data: 'inStock',
      responsivePriority: 3,
      searchable: false,
      type: 'html',
      render: function(data: unknown, type: string) {
        if (type === 'display') {
          const stock = data !== undefined && data !== null ? Number(data) : null;
          if (stock === null) {
            return '<span style="color: rgba(255, 255, 255, 0.5);">-</span>';
          }
          const stockColor = stock > 0 ? '#29C480' : '#ef4444';
          return `
            <span style="
              color: ${stockColor};
              font-weight: 600;
              font-size: 0.875rem;
            ">
              ${stock} unidades
            </span>
          `;
        }
        return data as string;
      },
    },
    {
      title: 'ACCIONES',
      data: 'id',
      orderable: false,
      searchable: false,
      type: 'html',
      render: function (data: unknown, type: string, row: Record<string, unknown>) {
        if (type === 'display') {
          const productId = String(row.id || '');
          const productName = String(row.name || '').replace(/'/g, "\\'");
          const hasVariants = row.hasVariants === true;
          
          if (hasVariants) {
            return `
              <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end;">
                <a 
                  href="/product/${productId}"
                  style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 32px;
                    background-color: #29C480;
                    color: #1e293b;
                    font-weight: 600;
                    border-radius: 8px;
                    text-transform: none;
                    font-size: 1rem;
                    text-decoration: none;
                    transition: background-color 0.3s ease, color 0.3s ease;
                    min-width: 100px;
                  "
                  onmouseover="this.style.backgroundColor='#ffffff'; this.style.color='#000000'"
                  onmouseout="this.style.backgroundColor='#29C480'; this.style.color='#1e293b'"
                >
                  Ver Opciones
                </a>
                <button 
                  onclick="if (window.handleRemoveFavorite) { window.handleRemoveFavorite('${productId}', '${productName}'); }"
                  style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 32px;
                    background-color: #ef4444;
                    color: #ffffff;
                    font-weight: 600;
                    border-radius: 8px;
                    text-transform: none;
                    font-size: 1rem;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.3s ease, color 0.3s ease;
                    min-width: 100px;
                  "
                  onmouseover="this.style.backgroundColor='#dc2626'; this.style.color='#ffffff'"
                  onmouseout="this.style.backgroundColor='#ef4444'; this.style.color='#ffffff'"
                >
                  Eliminar
                </button>
              </div>
            `;
          }
          
          return `
            <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end;">
              <a 
                href="/product/${productId}"
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  padding: 12px 32px;
                  background-color: #29C480;
                  color: #1e293b;
                  font-weight: 600;
                  border-radius: 8px;
                  text-transform: none;
                  font-size: 1rem;
                  text-decoration: none;
                  transition: background-color 0.3s ease, color 0.3s ease;
                  min-width: 100px;
                "
                onmouseover="this.style.backgroundColor='#ffffff'; this.style.color='#000000'"
                onmouseout="this.style.backgroundColor='#29C480'; this.style.color='#1e293b'"
              >
                Ver Producto
              </a>
              <button 
                onclick="if (window.handleRemoveFavorite) { window.handleRemoveFavorite('${productId}', '${productName}'); }"
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  padding: 12px 32px;
                  background-color: #ef4444;
                  color: #ffffff;
                  font-weight: 600;
                  border-radius: 8px;
                  text-transform: none;
                  font-size: 1rem;
                  border: none;
                  cursor: pointer;
                  transition: background-color 0.3s ease, color 0.3s ease;
                  min-width: 100px;
                "
                onmouseover="this.style.backgroundColor='#dc2626'; this.style.color='#ffffff'"
                onmouseout="this.style.backgroundColor='#ef4444'; this.style.color='#ffffff'"
              >
                Eliminar
              </button>
            </div>
          `;
        }
        return data as string;
      },
      responsivePriority: 1
    }
  ], []);

  // Adaptar datos de favoritos al formato de DataTable
  const favoritesData = useMemo(() => {
    return items.map((item: FavoriteItem) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      storeName: item.storeName,
      dateAdded: item.dateAdded,
      inStock: item.inStock,
      hasVariants: item.hasVariants,
      size: item.size,
      color: item.color,
    }));
  }, [items]);

  return (
    <MainLayout>
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          width: "100%",
          backgroundColor: '#000000',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
          <Box sx={{ px: { xs: 3, md: 0 } }}>
            <Stack spacing={3}>
              <Breadcrumb
                items={[
                  { label: 'Inicio', href: '/' },
                  { label: 'Favoritos' }
                ]}
              />
              <FavoritesSection
                title="Favoritos"
                isLoading={false}
                favoritesData={favoritesData}
                columns={favoritesColumns}
                onClearFavorites={handleClearFavorites}
                isClearing={isLoading}
              />
            </Stack>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default FavoritesPage;
