import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { useScrollAnimation } from '@/presentation/@shared/hooks/use-scroll-animation';

interface AnimatedSectionProps extends Omit<BoxProps, 'ref' | 'children'> {
  children: React.ReactNode | ((isVisible: boolean) => React.ReactNode);
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  threshold?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.1,
  sx,
  ...boxProps
}) => {
  const { elementRef, isVisible } = useScrollAnimation({ threshold });

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return 'translateY(20px)';
      case 'down':
        return 'translateY(-20px)';
      case 'left':
        return 'translateX(20px)';
      case 'right':
        return 'translateX(-20px)';
      default:
        return 'none';
    }
  };

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children(isVisible);
    }
    return children;
  };

  return (
    <Box
      ref={elementRef}
      className={className}
      sx={{
        transition: `all 1000ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getTransform(),
        ...sx
      }}
      {...boxProps}
    >
      {renderChildren()}
    </Box>
  );
}; 