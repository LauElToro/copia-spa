"use client";

import React from 'react';
import './libia-loading-bar.css';

export interface LibiaLoadingBarProps {
  isLoading: boolean;
  className?: string;
}

export const LibiaLoadingBar: React.FC<LibiaLoadingBarProps> = ({
  isLoading,
  className = '',
}) => {
  if (!isLoading) return null;

  return (
    <div className={`libia-loading-bar ${className}`} role="status" aria-label="Cargando respuesta">
      <div className="libia-loading-bar-track">
        <div className="libia-loading-bar-fill" />
        <div className="libia-loading-bar-shimmer" />
      </div>
    </div>
  );
};









