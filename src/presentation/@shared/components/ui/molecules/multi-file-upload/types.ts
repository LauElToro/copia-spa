import { InputHTMLAttributes } from 'react';

export interface MultiFileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onError' | 'size' | 'multiple'> {
  /**
   * Tipos de archivo aceptados (MIME types o extensiones)
   * Ejemplo: "image/jpeg,image/png" o ".jpg,.png"
   */
  accept?: string;
  
  /**
   * Número máximo de archivos que se pueden cargar
   */
  maxFiles?: number;
  
  /**
   * Tamaño máximo por archivo en bytes
   */
  maxSize?: number;
  
  /**
   * Estado del componente
   */
  state?: 'default' | 'error' | 'success' | 'disabled';
  
  /**
   * Clase CSS adicional
   */
  className?: string;
  
  /**
   * Si está deshabilitado
   */
  disabled?: boolean;
  
  /**
   * Texto del placeholder del botón
   */
  placeholder?: string;
  
  /**
   * Tamaño del botón
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Callback cuando se seleccionan archivos
   */
  onFilesChange?: (files: File[]) => void;
  
  /**
   * Callback cuando hay errores
   */
  onError?: (errors: string[]) => void;
  
  /**
   * Archivos iniciales (para edición)
   */
  initialFiles?: File[];
}

