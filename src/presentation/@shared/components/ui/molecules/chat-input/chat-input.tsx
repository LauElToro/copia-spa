"use client";

import React from 'react';

export interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  sendLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Escribe tu mensaje...',
  sendLabel = 'Enviar',
  disabled = false,
  loading = false,
  className = '',
}) => {
  return (
    <form className={`libia-inputbar ${className}`} onSubmit={onSubmit}>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="libia-input"
        aria-label="Escribe tu mensaje"
      />
      <button
        className="libia-send"
        type="submit"
        disabled={!value.trim() || loading}
        title={loading ? 'Esperá la respuesta' : sendLabel}
      >
        {sendLabel}
      </button>
    </form>
  );
};

