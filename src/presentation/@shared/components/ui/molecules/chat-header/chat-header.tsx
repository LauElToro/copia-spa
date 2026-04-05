"use client";

import React from 'react';
import { Avatar } from '../../atoms/avatar';
import { Text } from '../../atoms/text';

export interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl: string;
  onClose: () => void;
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  subtitle,
  avatarUrl,
  onClose,
  className = '',
}) => {
  return (
    <header className={`libia-header ${className}`}>
      <div className="libia-brand">
        <div className="libia-avatar-wrap">
          <Avatar 
            src={avatarUrl} 
            alt={title}
            size="md"
            showStatus={true}
            statusColor="#00ff88"
          />
        </div>
        <div className="libia-titles">
          <Text 
            variant="h6" 
            className="libia-title"
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: "'Oxanium', sans-serif",
              background: 'linear-gradient(90deg, #00ff88 0%, #00aaff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text 
              variant="body2" 
              className="libia-subtitle"
              style={{
                margin: 0,
                fontSize: '13px',
                fontFamily: "'Rajdhani', sans-serif",
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.2,
                letterSpacing: '0.01em',
              }}
            >
              {subtitle}
            </Text>
          )}
        </div>
      </div>

      <button
        type="button"
        className="libia-close"
        aria-label="Cerrar"
        title="Cerrar"
        onClick={onClose}
      >
        ✕
      </button>
    </header>
  );
};


