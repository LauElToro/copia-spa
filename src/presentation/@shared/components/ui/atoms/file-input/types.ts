import { InputHTMLAttributes } from 'react';
import { FormFieldTheme } from '../shared/form-field-theme';

export type FileInputState = 'default' | 'error' | 'success' | 'disabled';

export interface FileInputTheme extends FormFieldTheme {
  states: {
    default: FormFieldTheme['states']['default'];
    error: FormFieldTheme['states']['error'];
    success: FormFieldTheme['states']['success'];
    disabled: FormFieldTheme['states']['disabled'];
    ghost: FormFieldTheme['states']['ghost'];
  };
}

export interface FileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  accept?: string;
  multiple?: boolean;
  state?: FileInputState;
  className?: string;
  disabled?: boolean;
  button?: React.ReactNode;
} 