import React from 'react';
import { Image } from '../image';

export interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  statusColor?: string;
  onClick?: () => void;
  isOnline?: boolean;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  showStatus = false,
  statusColor = '#00ff88',
  onClick,
  isOnline = true,
}) => {
  const pixelSize = sizeMap[size];
  
  return (
    <div 
      className={`relative inline-block ${className}`}
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        pointerEvents: 'none', // El avatar no debe capturar eventos
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={pixelSize}
        height={pixelSize}
        className="rounded-full object-cover"
        style={{
          border: isOnline ? '2px solid rgba(0, 255, 136, 0.4)' : '2px solid rgba(150, 150, 150, 0.3)',
          boxShadow: isOnline ? '0 0 16px rgba(0, 255, 136, 0.3)' : 'none',
          filter: isOnline ? 'none' : 'grayscale(100%)',
          opacity: isOnline ? 1 : 0.6,
          pointerEvents: 'none', // La imagen no debe capturar eventos
        }}
      />
      {showStatus && isOnline && (
        <span
          className="absolute bottom-0 right-0 rounded-full"
          style={{
            width: size === 'sm' ? '8px' : size === 'md' ? '12px' : '16px',
            height: size === 'sm' ? '8px' : size === 'md' ? '12px' : '16px',
            background: statusColor,
            border: `2px solid #0a0a0a`,
            boxShadow: `0 0 8px ${statusColor}`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

