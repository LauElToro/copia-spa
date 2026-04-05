"use client";

import React from 'react';
import './voice-toggle-button.css';

export interface VoiceToggleButtonProps {
  enabled: boolean;
  isListening: boolean;
  onClick: () => void;
  className?: string;
}

export const VoiceToggleButton: React.FC<VoiceToggleButtonProps> = ({
  enabled,
  isListening,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={`voice-toggle-button ${enabled ? 'active' : ''} ${isListening ? 'listening' : ''} ${className}`}
      onClick={onClick}
      aria-label={enabled ? "Desactivar voz" : "Activar voz"}
      title={enabled ? "Voz activada - Di 'Hey Libia' para hablar" : "Activar reconocimiento de voz"}
    >
      {/* Microphone Icon */}
      <svg 
        className="voice-icon" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" 
          fill="currentColor"
        />
        <path 
          d="M17 11C17 14.31 14.31 17 11 17H13C16.31 17 19 14.31 19 11" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M5 11C5 14.31 7.69 17 11 17H13C9.69 17 7 14.31 7 11" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="9" y1="23" x2="15" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>

      {/* Toggle Switch */}
      <div className="voice-switch">
        <div className="voice-switch-track">
          <div className="voice-switch-thumb"></div>
        </div>
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <div className="voice-listening-indicator">
          <span className="voice-pulse"></span>
          <span className="voice-pulse"></span>
          <span className="voice-pulse"></span>
        </div>
      )}
    </button>
  );
};


