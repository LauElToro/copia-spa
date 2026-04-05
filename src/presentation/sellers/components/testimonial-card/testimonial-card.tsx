'use client';

import React, { useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Image } from '@/presentation/@shared/components/ui/atoms/image';

interface TestimonialCardProps {
  id: number | string;
  image: string;
  title?: string;
  description?: string;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  id: _id, // eslint-disable-line @typescript-eslint/no-unused-vars
  image,
  title,
  description,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <Box className={`testimonial-card-container ${className} group`} sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <Box
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="testimonial-card border-glow-hover magic-card group"
        sx={{
          position: 'relative',
          minHeight: { xs: '400px', md: '450px' },
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))',
          border: '2px solid rgba(41, 196, 128, 0.1)',
          borderRadius: '24px',
          overflow: 'hidden',
          transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          cursor: 'default',
          transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
          "&:hover": {
            borderColor: 'rgba(41, 196, 128, 0.8)',
            filter: 'brightness(1.1) drop-shadow(0px 4px 12px rgba(41, 196, 128, 0.4))'
          }
        }}
      >
        {/* Magic border effect */}
        <Box
          sx={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            borderRadius: '24px',
            background: 'linear-gradient(45deg, #29C480, #10B981, #059669, #047857, #065F46, #29C480)',
            backgroundSize: '400% 400%',
            zIndex: -1,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.4s ease',
            animation: 'magic-border 4s ease-in-out infinite',
            pointerEvents: 'none'
          }}
        />

        {/* Image Container */}
        <Box
          sx={{
            width: '100%',
            paddingTop: { xs: '60%', md: '50%' },
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            '& img': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }
          }}
        >
          <Image src={image} alt={title || 'Testimonial'} />
        </Box>

        {/* Content Container */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: { xs: 3, md: 4 },
            gap: 2
          }}
        >
          {description && (
            <Typography
              sx={{
                fontSize: { xs: '0.95rem', md: '1rem' },
                lineHeight: 1.6,
                color: '#ffffff',
                opacity: 0.9,
                flex: 1,
                display: '-webkit-box',
                WebkitLineClamp: 6,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {description}
            </Typography>
          )}
          {title && (
            <Typography
              component="h3"
              sx={{
                fontSize: { xs: '1rem', md: '1.125rem' },
                fontWeight: 600,
                color: '#34d399',
                margin: 0,
                padding: 0,
                lineHeight: 1.3
              }}
            >
              {title}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

