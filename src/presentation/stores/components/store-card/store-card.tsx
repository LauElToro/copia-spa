"use client";

import React, { useState, useRef, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { Image } from "@/presentation/@shared/components/ui/atoms/image";
import { useLanguage } from "@/presentation/@shared/hooks/use-language";
import { useModal } from "@/presentation/@shared/hooks/use-modal";
import { ProductImageModal } from "@/presentation/shop/components/product-image-modal";
import { resolvePublicMediaUrl } from "@/presentation/@shared/utils/product-mapper";

export interface StoreCardProps {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  profileImage?: string;
  rating?: number;
  plan?: string;
  className?: string;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  id,
  name,
  description,
  imageUrl,
  profileImage,
  rating,
  plan,
  className = "",
}) => {
  const router = useRouter();
  const { t } = useLanguage();
  const { openModal } = useModal();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const bannerSrc =
    resolvePublicMediaUrl(imageUrl, "commerces") ??
    "/images/landing/landing-banner1.png";
  const logoSrc =
    resolvePublicMediaUrl(profileImage, "commerces") ??
    "/images/icons/avatar.png";

  const handleVisitStore = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent?.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation();
    }
    router.push(`/stores/${id}`);
  }, [router, id]);

  return (
    <Box className={`store-card-container ${className} group`} sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <Box
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="store-card group"
        sx={{
          position: 'relative',
          minHeight: { xs: '280px', md: '300px' },
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(0, 0, 0, 0.6))',
          border: '1px solid rgba(41, 196, 128, 0.1)',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'default',
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          "&:hover": {
            borderColor: 'rgba(41, 196, 128, 0.4)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.7))',
          }
        }}
      >

        {/* Banner Image Wrapper */}
        <Box
          sx={{ 
            position: 'relative', 
            width: '100%',
            paddingBottom: '32px', // Space for profile image
          }}
        >
          <Box
            className="store-card-image-wrapper"
            sx={{ 
              touchAction: "manipulation",
              position: 'relative', 
              width: '100%', 
              paddingTop: '70%',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              overflow: 'hidden',
              borderRadius: "16px 16px 0 0",
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              openModal(
                <ProductImageModal 
                  images={[bannerSrc]} 
                  initialIndex={0}
                  alt={name} 
                />,
                {
                  maxWidth: false,
                  fullWidth: true
                }
              );
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openModal(
                  <ProductImageModal 
                    images={[bannerSrc]} 
                    initialIndex={0}
                    alt={name} 
                  />,
                  {
                    maxWidth: false,
                    fullWidth: true
                  }
                );
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${bannerSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: isHovered ? "scale(1.03)" : "scale(1)",
                transformOrigin: "center center",
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            
            {/* Gradient overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3), transparent)',
                pointerEvents: 'none'
              }}
            />
          </Box>

          {/* Profile Image Overlay - Positioned relative to banner wrapper */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 3,
              width: 80,
              height: 80,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '2px solid #29C480',
                overflow: 'hidden',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                transition: 'transform 0.3s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  component="img"
                  src={logoSrc}
                  alt={name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    borderRadius: '50%',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Store Details */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: 1.5,
            paddingTop: 3,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          {/* Store Name and Plan Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                marginBottom: 0,
                color: '#ffffff',
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                lineHeight: 1.4,
                letterSpacing: '-0.01em',
                fontFamily: "'Inter', sans-serif",
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}
              title={name}
            >
              {name}
            </Typography>
            
            {/* Plan Badge */}
            {plan === "Liberty" && (
              <Image 
                src="/images/icons/check-azul.svg" 
                alt={t.stores.plan.replace('{plan}', 'Liberty')} 
                width={18} 
                height={18} 
              />
            )}
            {plan === "Pro Liberty" && (
              <Image 
                src="/images/icons/check-verde.svg" 
                alt={t.stores.plan.replace('{plan}', 'Pro Liberty')} 
                width={18} 
                height={18} 
              />
            )}
            {plan === "Experiencia Liberty" && (
              <Image 
                src="/images/icons/check-dorado.svg" 
                alt={t.stores.plan.replace('{plan}', 'Experiencia Liberty')} 
                width={18} 
                height={18} 
              />
            )}
          </Box>

          {/* Rating */}
          {rating && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                ⭐ {rating}
              </Typography>
            </Box>
          )}

          {/* Description */}
          {description && (
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.875rem',
                color: '#94a3b8',
                textAlign: 'center',
                mb: 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.5,
                '& p': {
                  margin: 0,
                  marginBottom: '0.5rem',
                  '&:last-child': {
                    marginBottom: 0
                  }
                },
                '& ul, & ol': {
                  margin: 0,
                  paddingLeft: '1.5rem',
                  marginBottom: '0.5rem'
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  margin: 0,
                  marginBottom: '0.5rem',
                  fontWeight: 600
                },
                '& strong, & b': {
                  fontWeight: 600
                },
                '& em, & i': {
                  fontStyle: 'italic'
                },
                '& a': {
                  color: '#29C480',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }
              }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}

          {/* Visit Store Button */}
          <Box sx={{ marginTop: 'auto', paddingTop: 1.5 }}>
            <button
              type="button"
              onClick={handleVisitStore}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                backgroundColor: "#29C480",
                color: "#1e293b",
                fontWeight: 600,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "1rem",
                border: 'none',
                cursor: 'pointer',
                transition: "background-color 0.3s ease, color 0.3s ease",
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.color = "#000000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#29C480";
                e.currentTarget.style.color = "#1e293b";
              }}
            >
              {t.stores.visitStore}
            </button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StoreCard;

