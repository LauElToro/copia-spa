"use client";

import React from 'react';
import { Avatar } from '../../atoms/avatar';

export interface ChatLauncherProps {
  avatarUrl: string;
  isOpen: boolean;
  onClick: () => void;
  position?: 'bottom-left' | 'bottom-right';
  className?: string;
  isAvailable?: boolean;
}

export const ChatLauncher: React.FC<ChatLauncherProps> = ({
  avatarUrl,
  isOpen,
  onClick,
  position = 'bottom-right',
  className = '',
  isAvailable = true,
}) => {
  const positionStyle = position === 'bottom-left' 
    ? { left: '24px', right: 'auto' } 
    : { right: '24px', left: 'auto' };

  return (
    <button
      type="button"
      aria-label={isOpen ? "Cerrar chat de Libia" : "Abrir chat de Libia"}
      className={`libia-launcher ${isOpen ? 'open' : ''} ${!isAvailable ? 'disabled' : ''} ${className}`}
      onClick={onClick}
      style={{ ...positionStyle, cursor: 'pointer' }}
      title={isOpen ? undefined : (isAvailable ? "Abrir chat de Libia" : "Abrir chat (el servicio puede estar cargando)")}
      tabIndex={0}
    >
      <div style={{ position: 'relative', display: 'inline-block', pointerEvents: 'none' }}>
        <Avatar
          src={avatarUrl}
          alt="Libia"
          size="lg"
          showStatus={false}
          isOnline={isAvailable}
          className="libia-launcher-avatar"
        />
        <span 
          className="libia-launcher-fallback" 
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'none',
            pointerEvents: 'none',
          }}
        >
          L
        </span>
      </div>
    </button>
  );
};

