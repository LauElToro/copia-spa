import React from "react";
import NextImage from "next/image";
import { Box, SxProps, Theme } from "@mui/material";

export interface ImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  onClick?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  loading?: "lazy" | "eager";
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  sx?: SxProps<Theme>;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  onClick,
  onError,
  loading = "lazy",
  objectFit = "cover",
  sx,
}) => {
  // Convertir objectFit a clase CSS
  const objectFitClass = objectFit ? `object-${objectFit}` : "";
  const combinedClassName = [className, objectFitClass].filter(Boolean).join(" ");

  // Asegurar que src sea un string válido
  const srcString = typeof src === 'string' ? src : '';
  if (!srcString) {
    // Si no hay src válido, retornar un placeholder
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
          height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
          backgroundColor: '#1a1a1a',
          ...sx,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/icons/avatar.png"
          alt={alt}
          width={width ? Number(width) : undefined}
          height={height ? Number(height) : undefined}
          onClick={onClick}
          onError={onError}
          className={combinedClassName}
          loading={loading}
          style={{
            width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
            height: height ? (typeof height === 'number' ? `${height}px` : height) : '100%',
            objectFit: objectFit,
          }}
        />
      </Box>
    );
  }

  // Detectar tipo de imagen
  const isSvg = srcString.toLowerCase().endsWith('.svg');
  const isLocalImage = srcString.startsWith('/');
  
  // Detectar si es una imagen de S3 (necesita manejo especial - sin crossOrigin)
  // Detectar antes de isRemoteImage para priorizar el manejo de S3
  const isS3Image = srcString.includes('s3.') || 
                    srcString.includes('amazonaws.com') ||
                    srcString.includes('digitaloceanspaces.com');
  
  // Detectar imágenes remotas: URLs HTTP/HTTPS, incluyendo S3, DigitalOcean Spaces, etc.
  // IMPORTANTE: Detectar correctamente URLs de S3 para evitar pasar por el optimizador de Next.js
  const isRemoteImage = srcString.startsWith('http://') || 
                        srcString.startsWith('https://') || 
                        srcString.startsWith('//') || 
                        isS3Image;
  
  // Para todas las imágenes locales (incluyendo SVG) y remotas, usar <img> directamente
  // para evitar completamente el optimizador de Next.js que causa errores 400/403
  // Esto asegura que las imágenes de S3 se carguen correctamente sin pasar por /_next/image
  // NOTA CRÍTICA: NO usar crossOrigin para imágenes de S3 - causa errores 403 si CORS no está configurado
  // El navegador hará una request simple sin preflight CORS si no hay crossOrigin
  if (isLocalImage || isSvg || isRemoteImage) {
    // Preparar props del img tag - NUNCA agregar crossOrigin para S3
    const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
      src: srcString,
      alt: alt,
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      onClick: onClick,
      onError: onError,
      className: combinedClassName,
      loading: loading,
      style: {
        width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: height ? (typeof height === 'number' ? `${height}px` : height) : '100%',
        objectFit: objectFit,
      },
    };
    
    // Solo agregar crossOrigin para imágenes remotas que NO sean de S3
    // Esto evita errores 403 cuando S3 no tiene CORS configurado
    if (!isS3Image && isRemoteImage) {
      imgProps.crossOrigin = 'anonymous';
    }
    
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
          height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
          ...sx,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...imgProps} />
      </Box>
    );
  }

  // Solo usar NextImage para imágenes que realmente necesiten optimización
  // (casos muy específicos donde la imagen no es local, remota ni SVG)
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        ...sx,
      }}
    >
      <NextImage
        src={srcString}
        alt={alt}
        width={width ? Number(width) : 500}
        height={height ? Number(height) : 300}
        loading={loading}
        onClick={onClick}
        className={combinedClassName}
        unoptimized={true}
      />
    </Box>
  );
};

export default Image;
