"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Text } from '../../atoms/text';
import { Image } from '../../atoms/image';
import { Box } from '@mui/material';
import { Close, Image as ImageIcon } from '@mui/icons-material';
import { MultiFileUploadProps } from './types';
import { defaultTheme as textTheme } from '../../atoms/text/theme';
import { defaultTheme as globalTheme } from '../../theme.default';

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  accept = 'image/jpeg,image/png,image/jpg',
  maxFiles = 4,
  maxSize = 2 * 1024 * 1024, // 2MB por defecto
  className = '',
  disabled = false,
  placeholder = 'Elegir archivo (JPG/PNG, máx 2MB)',
  onFilesChange,
  onError,
  initialFiles = []}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar archivos iniciales cuando cambian
  useEffect(() => {
    // Comparar por nombre y tamaño para evitar actualizaciones innecesarias
    const currentFileKeys = selectedFiles.map(f => `${f.name}-${f.size}`).sort().join('|');
    const initialFileKeys = initialFiles.map(f => `${f.name}-${f.size}`).sort().join('|');
    
    if (currentFileKeys !== initialFileKeys) {
      setSelectedFiles(initialFiles);
      onFilesChange?.(initialFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiles]);

  const matchesAccept = (file: File, pattern: string): boolean => {
    const p = pattern.trim();
    if (p === '*' || p === '') return true;
    
    // Soporte por extensión (.jpg, .png)
    if (p.startsWith('.')) {
      return file.name.toLowerCase().endsWith(p.toLowerCase());
    }
    
    // Soporte MIME type (image/jpeg, image/png)
    if (file.type) {
      // MIME exacto
      if (file.type === p) return true;
      // MIME con comodín (image/*)
      if (p.endsWith('/*')) {
        const baseType = p.slice(0, -2);
        return file.type.startsWith(baseType);
      }
    }
    
    return false;
  };

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    if (file.size > maxSize) {
      return `El archivo "${file.name}" excede el tamaño máximo permitido (${(maxSize / 1024 / 1024).toFixed(0)}MB)`;
    }

    // Validar tipo
    if (accept !== '*') {
      const acceptList = accept.split(',').map((t) => t.trim()).filter(Boolean);
      const isAccepted = acceptList.some((pat) => matchesAccept(file, pat));
      if (!isAccepted) {
        return `El archivo "${file.name}" no es del tipo permitido. Solo se permiten imágenes (JPG, PNG, JPEG)`;
      }
    }

    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      return `El archivo "${file.name}" no es una imagen válida`;
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Verificar límite de archivos
    const remainingSlots = maxFiles - selectedFiles.length;
    if (fileArray.length > remainingSlots) {
      errors.push(`Solo puedes cargar ${remainingSlots} archivo(s) más. Máximo ${maxFiles} archivos permitidos.`);
    }

    for (const file of fileArray) {
      // Verificar límite
      if (validFiles.length >= remainingSlots) {
        errors.push(`Se alcanzó el límite de ${maxFiles} archivos. Algunos archivos no se agregaron.`);
        break;
      }

      // Validar archivo
      const error = validateFile(file);
      if (error) {
        errors.push(error);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      onError?.(errors);
    }

    if (validFiles.length > 0) {
      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);
      onFilesChange?.(newFiles);
    }

    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const canAddMore = selectedFiles.length < maxFiles;

  // Etiquetas y descripciones dinámicas según el contexto
  const getImageLabels = (): string[] => {
    if (maxFiles === 1) {
      return ['Portada'];
    }
    // Para fotos del producto (hasta 5)
    return Array.from({ length: maxFiles }, (_, i) => `Imagen ${i + 1}`);
  };

  const getImageDescriptions = (index: number): string => {
    if (maxFiles === 1) {
      return 'OBLIGATORIO';
    }
    // Para fotos del producto
    const descriptions = [
      'Se recomienda introducir imagen con ejemplo de uso del producto.',
      'Se recomienda introducir imagen con todo el contenido del producto.',
      'Se recomienda introducir imagen o video de uso del producto.',
      'Se recomienda introducir imagen adicional del producto.',
      'Se recomienda introducir imagen adicional del producto.'
    ];
    return descriptions[index] || `Se recomienda introducir imagen ${index + 1}`;
  };

  const imageLabels = getImageLabels();

  return (
    <div className={`multi-file-upload ${className}`}>
      {/* Grid de archivos cargados */}
      <div className="row g-4 mb-4">
        {selectedFiles.map((file, index) => (
          <div className="col-md-3" key={`${file.name}-${index}`}>
            <Box
              className="multi-file-upload-card p-4 text-center h-100 d-flex flex-column align-items-center justify-content-between position-relative"
              sx={{
                background: 'var(--bs-font-color-neutral-7)',
                borderRadius: globalTheme.borderRadius.md
              }}
              style={{ transition: 'all 0.3s ease' }}
            >
              {/* Botón eliminar mejorado */}
              <button
                type="button"
                className="multi-file-upload-remove-btn position-absolute top-0 end-0 m-2 border-0 rounded-circle d-flex align-items-center justify-content-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                disabled={disabled}
                aria-label={`Eliminar ${file.name}`}
                title="Eliminar imagen"
              >
                <Close sx={{ color: 'white' }} />
              </button>

              {/* Vista previa con mejor estilo */}
              <div className="multi-file-upload-preview mb-3">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Vista previa ${index + 1}`}
                  width={225}
                  height={200}
                  objectFit="cover"
                  className="multi-file-upload-image"
                />
              </div>

              {/* Información del archivo con etiquetas */}
              <div className="w-100">
                <Text variant="h6" align="center" weight="semibold" className="mb-1">
                  {imageLabels[index] || `Imagen ${index + 1}`}
                </Text>
                <Text
                  align="center"
                  weight={maxFiles === 1 || index === 0 ? "bold" : "normal"}
                  theme={{
                    ...textTheme,
                    variants: {
                      ...textTheme.variants,
                      p: {
                        ...textTheme.variants.p,
                        fontSize: (maxFiles === 1 || index === 0) ? "1rem" : "0.75rem",
                        color: (maxFiles === 1 || index === 0) ? "#ff4444" : "#A3A4CC",
                        lineHeight: '1.4'
                      }
                    }
                  }}
                  className="mb-2"
                >
                  {getImageDescriptions(index)}
                </Text>
              </div>
            </Box>
          </div>
        ))}

        {/* Slot vacío para agregar más archivos */}
        {canAddMore && (
          <div className="col-md-3">
            <Box
              className={`multi-file-upload-add-card p-4 text-center h-100 d-flex flex-column align-items-center justify-content-between ${
                dragActive ? 'multi-file-upload-drag-active' : ''
              }`}
              sx={{
                background: 'var(--bs-font-color-neutral-7)',
                borderRadius: globalTheme.borderRadius.md
              }}
              style={{
                border: dragActive ? '2px dashed var(--bs-primary)' : '2px dashed rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'}}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="multi-file-upload-icon-wrapper mb-3">
                <ImageIcon sx={{ fontSize: '3rem', color: 'rgba(255, 255, 255, 0.5)' }} />
              </div>
              
              <div className="w-100 mb-3">
                <Text variant="h6" align="center" weight="semibold" className="mb-1">
                  {imageLabels[selectedFiles.length] || `Imagen ${selectedFiles.length + 1}`}
                </Text>
                <Text
                  align="center"
                  theme={{
                    ...textTheme,
                    variants: {
                      ...textTheme.variants,
                      p: {
                        ...textTheme.variants.p,
                        fontSize: (maxFiles === 1 || selectedFiles.length === 0) ? "1rem" : "0.75rem",
                        color: (maxFiles === 1 || selectedFiles.length === 0) ? "#ff4444" : "#A3A4CC",
                        lineHeight: '1.4'
                      }
                    }
                  }}
                  className="mb-3"
                >
                  {getImageDescriptions(selectedFiles.length)}
                </Text>
              </div>

              <div className="file-input-atom w-100">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={true}
                  disabled={disabled}
                  onChange={handleInputChange}
                  className="file-input-hidden"
                />
                <button
                  type="button"
                  className="multi-file-upload-trigger btn btn-outline-success border-0 mt-3 w-100"
                  disabled={disabled}
                  onClick={handleButtonClick}
                  style={{ fontSize: '12px' }}
                >
                  {placeholder}
                </button>
              </div>
            </Box>
          </div>
        )}
      </div>

      {/* Información adicional */}
      {selectedFiles.length > 0 && (
        <Text
          align="center"
          weight="bold"
          theme={{
            ...textTheme,
            variants: {
              ...textTheme.variants,
              p: {
                ...textTheme.variants.p,
                fontSize: '0.875rem'
              }
            }
          }}
        >
          {selectedFiles.length} archivo(s) cargado(s) de {maxFiles} máximo
        </Text>
      )}
    </div>
  );
};

