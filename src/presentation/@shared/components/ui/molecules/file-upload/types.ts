import { InputHTMLAttributes } from 'react';

export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onError' | 'size'> {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en bytes
  state?: 'default' | 'error' | 'success' | 'disabled';
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  showPreview?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (file: File, index: number) => void;
  onError?: (errors: string[]) => void;
} 