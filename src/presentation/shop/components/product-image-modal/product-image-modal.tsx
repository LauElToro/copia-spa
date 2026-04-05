import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import NextImage from 'next/image';

interface ProductImageModalProps {
  images: string[];
  initialIndex?: number;
  alt: string;
}

export const ProductImageModal: React.FC<ProductImageModalProps> = ({ 
  images, 
  initialIndex = 0, 
  alt 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentImage = images[currentIndex] || images[0] || '';
  const totalImages = images.length;
  const hasMultipleImages = totalImages > 1;

  useEffect(() => {
    // Reset loading state when image changes
    setIsLoading(true);
    setImageLoaded(false);
  }, [currentIndex]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setTimeout(() => {
      setImageLoaded(true);
    }, 50);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: '70vh', md: '80vh' },
        minHeight: { xs: '400px', md: '500px' },
        maxHeight: { xs: '90vh', md: '95vh' },
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        overflow: 'hidden'
      }}
    >
      {/* Navigation Arrows */}
      {hasMultipleImages && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: { xs: 8, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              color: '#29C480',
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              border: '1px solid rgba(41, 196, 128, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(41, 196, 128, 0.2)',
                borderColor: '#29C480',
                transform: 'translateY(-50%) scale(1.1)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <ChevronLeft sx={{ fontSize: { xs: 28, md: 32 } }} />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: { xs: 8, md: 16 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              color: '#29C480',
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              border: '1px solid rgba(41, 196, 128, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(41, 196, 128, 0.2)',
                borderColor: '#29C480',
                transform: 'translateY(-50%) scale(1.1)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <ChevronRight sx={{ fontSize: { xs: 28, md: 32 } }} />
          </IconButton>
        </>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            transition: 'opacity 0.3s ease-out',
            opacity: isLoading ? 1 : 0,
            pointerEvents: isLoading ? 'auto' : 'none'
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: '#29C480',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
        </Box>
      )}

      {/* Image Container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: imageLoaded ? 1 : 0,
          transform: imageLoaded ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      >
        <NextImage
          src={currentImage}
          alt={`${alt} - ${currentIndex + 1} de ${totalImages}`}
          fill
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadingComplete={handleImageLoad}
          style={{
            objectFit: 'contain',
            objectPosition: 'center'
          }}
          sizes="(max-width: 768px) 100vw, 95vw"
          priority
          unoptimized={currentImage.startsWith('/') || currentImage.startsWith('http') || currentImage.startsWith('//') || currentImage.includes('s3.')}
        />
      </Box>

      {/* Image Counter Indicator */}
      {hasMultipleImages && (
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 16, md: 24 },
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            padding: { xs: '8px 16px', md: '10px 20px' },
            border: '1px solid rgba(41, 196, 128, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(41, 196, 128, 0.2)',
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: { xs: '0.875rem', md: '1rem' },
              fontWeight: 600,
              color: '#29C480',
              letterSpacing: '0.5px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {currentIndex + 1} / {totalImages}
          </Box>
        </Box>
      )}
    </Box>
  );
};

