'use client';

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Image } from '@/presentation/@shared/components/ui/atoms/image';
import { StarRating } from '@/presentation/@shared/components/ui/atoms/star-rating/star-rating';

interface CompactTestimonialCardProps {
  id: number | string;
  image: string;
  title?: string;
  description?: string;
  rating?: number;
  className?: string;
}

export const CompactTestimonialCard: React.FC<CompactTestimonialCardProps> = ({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  image,
  title,
  description,
  rating,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box 
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'row',
        gap: { xs: 2, md: 3 },
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(0, 0, 0, 0.6))',
        border: '1px solid rgba(41, 196, 128, 0.1)',
        borderRadius: '16px',
        padding: { xs: 2, md: 3 },
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        "&:hover": {
          borderColor: 'rgba(41, 196, 128, 0.4)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.7))'
        }
      }}
    >
      {/* Image Container */}
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: 60, md: 100 },
          height: { xs: 60, md: 100 },
          minWidth: { xs: 60, md: 100 },
          minHeight: { xs: 60, md: 100 },
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '1 / 1',
          '& img': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '50%',
            transition: 'transform 0.4s ease',
            transform: isHovered ? 'scale(1.2)' : 'scale(1.1)',
            display: 'block',
            margin: 0,
            padding: 0
          }
        }}
      >
        <Image 
          src={image} 
          alt={title || 'Testimonial'}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '50%',
            display: 'block',
            margin: 0,
            padding: 0,
            transform: isHovered ? 'scale(1.2)' : 'scale(1.1)',
            transition: 'transform 0.4s ease'
          }}
        />
      </Box>

      {/* Content Container */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden',
          justifyContent: 'space-between'
        }}
      >
        {description && (
          <Typography
            sx={{
              fontSize: { xs: '0.875rem', md: '0.9375rem' },
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.85)',
              display: '-webkit-box',
              WebkitLineClamp: { xs: 5, md: 4 },
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 0.5,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
              textAlign: 'left',
              flex: '0 1 auto'
            }}
          >
            {description}
          </Typography>
        )}
        {title && (
          <>
            {/* Stars Rating */}
            {rating !== undefined && (
              <Box
                sx={{
                  mb: 1,
                  mt: 'auto',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 0.5,
                    alignItems: 'center',
                    px: 1,
                    py: 0.5,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.2)'
                  }}
                >
                  <StarRating
                    rating={rating}
                    size={16}
                    align="left"
                    enableHover={true}
                  />
                </Box>
              </Box>
            )}
            <Typography
              component="h3"
              sx={{
                fontSize: { xs: '0.875rem', md: '0.9375rem' },
                fontWeight: 600,
                color: '#34d399',
                margin: 0,
                padding: 0,
                lineHeight: 1.3
              }}
            >
              {title}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};
