'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import { ImageNotSupported as ImageIcon, Storefront as StoreIcon, ShoppingBag as ProductIcon } from '@mui/icons-material';
import NextImage, { ImageProps as NextImageProps } from 'next/image';

type ImageType = 'product' | 'store' | 'generic';

interface SafeImageProps extends Omit<NextImageProps, 'onError'> {
  type?: ImageType;
  fallbackIconSize?: number;
}

const FallbackIcons: Record<ImageType, React.ElementType> = {
  product: ProductIcon,
  store: StoreIcon,
  generic: ImageIcon,
};

/**
 * Componente de imagen segura con manejo de errores
 * Muestra un placeholder con icono cuando la imagen falla al cargar
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  type = 'generic',
  fallbackIconSize = 24,
  fill,
  width,
  height,
  style,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Validar que src sea una URL válida
  const srcString = typeof src === 'string' ? src : '';
  const isValidSrc = srcString && srcString.trim() !== '' && !srcString.includes('undefined') && !srcString.includes('null');

  // Check if image is remote (S3, external) to skip Next.js image optimizer
  const isRemoteImage = srcString.startsWith('http://') ||
                        srcString.startsWith('https://') ||
                        srcString.includes('s3.') ||
                        srcString.includes('amazonaws.com');

  const FallbackIcon = FallbackIcons[type];

  // Mostrar placeholder si hay error o src es inválido
  if (hasError || !isValidSrc) {
    return (
      <Box
        sx={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(41, 196, 128, 0.08), rgba(41, 196, 128, 0.02))',
          borderRadius: 'inherit',
        }}
      >
        <FallbackIcon
          sx={{
            fontSize: fallbackIconSize,
            color: 'rgba(41, 196, 128, 0.4)',
          }}
        />
      </Box>
    );
  }

  return (
    <>
      {/* Placeholder durante la carga */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(41, 196, 128, 0.05), rgba(41, 196, 128, 0.02))',
            borderRadius: 'inherit',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: fallbackIconSize * 0.8,
              height: fallbackIconSize * 0.8,
              borderRadius: '50%',
              border: '2px solid rgba(41, 196, 128, 0.2)',
              borderTopColor: '#29C480',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>
      )}
      <NextImage
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        style={{
          ...style,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.2s ease',
        }}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={isRemoteImage}
        {...props}
      />
    </>
  );
};

export default SafeImage;

