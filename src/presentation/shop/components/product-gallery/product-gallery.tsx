'use client';

import React, { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { PlayArrow, Image as ImageIcon } from '@mui/icons-material';
import NextImage from 'next/image';
import { ProductEntity } from '@/presentation/@shared/types/product';
import { resolveImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/presentation/@shared/utils/product-mapper';
import { ImageModal } from '@/presentation/@shared/components/ui/molecules/image-modal';
import type { ModalProps } from '@/presentation/@shared/components/ui/atoms/modal';

interface ProductGalleryProps {
  product: ProductEntity;
  openModal: (content: React.ReactNode | (() => React.ReactNode), props?: Omit<ModalProps, 'open' | 'children' | 'onClose'>) => void;
  stopAll: (e: React.SyntheticEvent) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ product, openModal, stopAll }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Obtener todas las imágenes y videos del producto
  const getAllMedia = (): Array<{ url: string; type: 'image' | 'video'; contentType?: string }> => {
    const media: Array<{ url: string; type: 'image' | 'video'; contentType?: string }> = [];

    if (product.photos && product.photos.length > 0) {
      product.photos.forEach((photo) => {
        const rawUrl = photo.imageUrl || photo.image_url;
        const imageUrl = rawUrl ? resolveImageUrl(rawUrl) : undefined;
        if (imageUrl) {
          const contentType = photo.contentType || photo.content_type;
          const isVideo = contentType?.startsWith('video/') || imageUrl.match(/\.(mp4|webm|ogg|mov)$/i);
          media.push({
            url: imageUrl,
            type: isVideo ? 'video' : 'image',
            contentType: contentType
          });
        }
      });
    }

    // Si no hay fotos, usar la imagen principal
    if (media.length === 0 && product.image_url) {
      media.push({
        url: resolveImageUrl(product.image_url),
        type: 'image'
      });
    }

    // Si aún no hay imágenes, usar fallback desde S3 (no del servidor)
    if (media.length === 0) {
      media.push({ url: DEFAULT_PRODUCT_IMAGE, type: 'image' });
    }

    return media;
  };

  const mediaItems = getAllMedia();
  const selectedMedia = mediaItems[selectedIndex] || mediaItems[0];
  const totalMedia = mediaItems.length;
  const hasMultipleMedia = totalMedia > 1;

  // Obtener la mejor calidad de imagen disponible
  const getBestImageUrl = (index: number): string => {
    if (product.photos && product.photos[index]) {
      const photo = product.photos[index];
      const raw = photo.imageUrlLg || photo.imageUrlMd || photo.imageUrl || photo.image_url;
      if (raw) return resolveImageUrl(raw);
    }
    return mediaItems[index]?.url || DEFAULT_PRODUCT_IMAGE;
  };

  const getThumbnailUrl = (index: number): string => {
    if (product.photos && product.photos[index]) {
      const photo = product.photos[index];
      const raw = photo.imageUrlSm || photo.imageUrlMd || photo.imageUrl || photo.image_url;
      if (raw) return resolveImageUrl(raw);
    }
    return mediaItems[index]?.url || DEFAULT_PRODUCT_IMAGE;
  };

  const handleThumbnailClick = (index: number, e: React.SyntheticEvent) => {
    stopAll(e);
    setSelectedIndex(index);
  };

  const handleMainImageClick = (e: React.SyntheticEvent) => {
    stopAll(e);
    const imageUrls = mediaItems.map(m => m.url);
    openModal(
      <ImageModal
        images={imageUrls}
        initialIndex={selectedIndex}
        alt={product.name}
      />,
      {
        maxWidth: false as const,
        fullWidth: true
      }
    );
  };

  // Detectar si la imagen es local o remota
  const isLocalImage = selectedMedia.url.startsWith('/');
  const isRemoteImage = selectedMedia.url.startsWith('http') || selectedMedia.url.startsWith('//') || selectedMedia.url.includes('s3.');
  const shouldUnoptimize = isLocalImage || isRemoteImage;

  // Obtener URL de mejor calidad para la imagen principal
  const mainImageUrl = getBestImageUrl(selectedIndex);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'flex-start' } }}>
      {/* Thumbnails - Solo mostrar si hay más de 1 media */}
      {hasMultipleMedia && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            gap: 1,
            order: { xs: 2, md: 1 },
            maxWidth: { xs: '100%', md: '80px' },
            width: { xs: '100%', md: '80px' },
            flexShrink: 0,
            overflowX: { xs: 'auto', md: 'visible' },
            overflowY: { md: 'auto' },
            maxHeight: { md: '600px' },
            alignSelf: { md: 'flex-start' },
            '&::-webkit-scrollbar': {
              width: '4px',
              height: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(41, 196, 128, 0.3)',
              borderRadius: '2px',
              '&:hover': {
                background: 'rgba(41, 196, 128, 0.5)',
              },
            },
          }}
        >
          {mediaItems.map((item, index) => {
            const thumbnailUrl = getThumbnailUrl(index);

            return (
              <Box
                key={index}
                onClick={(e) => handleThumbnailClick(index, e)}
                sx={{
                  position: 'relative',
                  width: { xs: '80px', md: '80px' },
                  height: { xs: '80px', md: '80px' },
                  minWidth: { xs: '80px', md: '80px' },
                  minHeight: { xs: '80px', md: '80px' },
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedIndex === index ? '2px solid #29C480' : '2px solid transparent',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: selectedIndex === index ? '#29C480' : 'rgba(41, 196, 128, 0.5)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {item.type === 'video' ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }}
                  >
                    <PlayArrow sx={{ fontSize: 32, color: '#29C480' }} />
                  </Box>
                ) : (
                  <NextImage
                    src={thumbnailUrl}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    quality={85}
                    unoptimized={shouldUnoptimize}
                    sizes="80px"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== DEFAULT_PRODUCT_IMAGE && !target.src.includes('avatar.png')) {
                        target.src = DEFAULT_PRODUCT_IMAGE;
                      }
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Main Image */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          minHeight: { xs: '400px', md: '600px' },
          width: { xs: '100%', md: 'auto' },
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'transparent',
          cursor: 'zoom-in',
          order: { xs: 1, md: 2 },
          alignSelf: { md: 'flex-start' },
        }}
        onClick={handleMainImageClick}
        onMouseDownCapture={stopAll}
        onTouchStartCapture={stopAll}
        onPointerDownCapture={stopAll}
      >
        {selectedMedia.type === 'video' ? (
          <Box
            component="video"
            src={selectedMedia.url}
            controls
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#000000',
            }}
            onMouseDownCapture={stopAll}
            onTouchStartCapture={stopAll}
            onPointerDownCapture={stopAll}
          />
        ) : (
          <NextImage
            src={mainImageUrl}
            alt={product.name}
            fill
            style={{
              objectFit: 'contain',
              objectPosition: 'center',
            }}
            quality={95}
            unoptimized={shouldUnoptimize}
            priority={selectedIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== DEFAULT_PRODUCT_IMAGE && !target.src.includes('avatar.png')) {
                target.src = DEFAULT_PRODUCT_IMAGE;
              }
            }}
          />
        )}

        {/* Indicador de cantidad de imágenes/videos */}
        {hasMultipleMedia && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              borderRadius: '20px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid rgba(41, 196, 128, 0.3)',
              zIndex: 2,
            }}
          >
            <ImageIcon sx={{ fontSize: 18, color: '#29C480' }} />
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              }}
            >
              {selectedIndex + 1} / {totalMedia}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
