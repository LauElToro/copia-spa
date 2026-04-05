"use client";

import React from 'react';

export interface AiSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  sendLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  hideButton?: boolean;
}

export const AiSearchInput: React.FC<AiSearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = '¿En qué puedo ayudarte?',
  sendLabel = 'Enviar',
  disabled = false,
  loading = false,
  className = '',
  inputRef,
  hideButton = false,
}) => {
  return (
    <form 
      className={`ai-search-input ${className}`} 
      onSubmit={onSubmit}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled || loading}
        className={`ai-search-input-field ${hideButton ? 'full-width' : ''}`}
        aria-label={placeholder}
      />
      {!hideButton && (
        <button
          className="ai-search-input-button"
          type="submit"
          disabled={!value.trim() || loading || disabled}
          title={loading ? 'Procesando...' : sendLabel}
          aria-label={sendLabel}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ai-search-send-icon"
          >
            <path
              d="M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 5L19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </form>
  );
};

