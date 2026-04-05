import React, { useRef } from 'react';
import { FileInputProps } from './types';

export const FileInput: React.FC<FileInputProps> = ({
  accept = '*',
  multiple = false,
  state = 'default',
  className = '',
  disabled = false,
  button,
  onChange,
  ...props
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseClasses = 'file-input-atom';
  const stateClass = state === 'default' ? '' : `file-input-${state}`;
  const disabledClass = disabled ? 'file-input-disabled' : '';

  const containerClasses = [baseClasses, stateClass, disabledClass, className]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  return (
    <div className={containerClasses}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={onChange}
        className="file-input-hidden"
        {...props}
      />
        
      <button 
        type="button"
        className="file-input-trigger border-0"
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {button}
      </button>
    </div>
  );
}; 