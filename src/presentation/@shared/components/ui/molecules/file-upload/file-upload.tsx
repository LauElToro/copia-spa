import React, { useState } from 'react';
import { FileInput } from '../../atoms/file-input';
import { Button } from '../../atoms/button';
import { Text } from '../../atoms/text';
import { FileUploadProps } from './types';
import { defaultTheme as textTheme } from '../../atoms/text/theme';

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  state = 'default',
  className = '',
  disabled = false,
  placeholder = 'Seleccionar archivo',
  size = 'sm',
  onFileSelect,
  onFileRemove,
  onError,
  ...props
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const matchesAccept = (file: File, pattern: string): boolean => {
    const p = pattern.trim();
    if (p === '*' || p === '') return true;
    // Soporte por extensión (.xlsx)
    if (p.startsWith('.')) return file.name.toLowerCase().endsWith(p.toLowerCase());
    // Soporte comodín MIME (image/*) o MIME exacto
    const regex = new RegExp('^' + p.replaceAll('*', '.*') + '$');
    return regex.test(file.type);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    const acceptList = accept.split(',').map((t) => t.trim()).filter(Boolean);

    for (const file of fileArray) {
      // Validar tamaño
      if (file.size > maxSize) {
        errors.push(`El archivo "${file.name}" excede el tamaño máximo permitido`);
        continue;
      }

      // Validar tipo/extension
      if (accept !== '*') {
        const isAccepted = acceptList.some((pat) => matchesAccept(file, pat));
        if (!isAccepted) {
          errors.push(`El archivo "${file.name}" no es del tipo permitido`);
          continue;
        }
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      onError?.(errors);
      return;
    }

    const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
    setSelectedFiles(newFiles);
    onFileSelect?.(newFiles);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // limpiar el valor para que seleccionar el mismo archivo dispare change nuevamente
    try { e.target.value = ''; } catch {}
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

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileRemove?.(selectedFiles[index], index);
    onFileSelect?.(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`file-upload-molecule ${className}`}>
      <label
        className={`file-upload-dropzone ${dragActive ? 'file-upload-drag-active' : ''}`}
        htmlFor="file-upload-input"
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <FileInput
          id="file-upload-input"
          accept={accept}
          multiple={multiple}
          state={state}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleInputChange}
          button={
            <Button variant="primary" size={size}>
              {placeholder}
            </Button>
          }
          {...props}
        />
      </label>

      {/* Lista de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="file-upload-files">
          {selectedFiles.map((file, index) => (
            <div key={file.name} className="file-upload-file-item">
              <div className="file-upload-file-info">
                <div className="file-upload-file-details">
                  <Text
                    className="file-upload-file-name"
                    theme={{
                      ...textTheme,
                      variants: {
                        ...textTheme.variants,
                        p: {
                          ...textTheme.variants.p,
                          fontSize: "10px",
                        }
                      }
                    }}
                  >
                    {file.name}
                    ({formatFileSize(file.size)})
                  </Text>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemoveFile(index)}
                className="file-upload-remove-btn"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
