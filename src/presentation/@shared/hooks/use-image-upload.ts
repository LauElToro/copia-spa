import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseImageUploadProps {
  coverImage: File | string | null | undefined;
  productImages?: (File | string)[];
  onCoverImageChange: (files: File[]) => void;
  onProductImagesChange: (files: File[]) => void;
  onError: (message: string) => void;
  maxFileSize?: number;
  maxDimensions?: number;
  allowedTypes?: string[];
  maxProductImages?: number;
}

export const useImageUpload = ({
  coverImage,
  productImages,
  onCoverImageChange,
  onProductImagesChange,
  onError,
  maxFileSize = 2 * 1024 * 1024, // 2MB por defecto
  maxDimensions = 2500,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'],
  maxProductImages = 6, // Hasta 6 imágenes totales (portada + productImages)
}: UseImageUploadProps) => {
  const [dragActiveCover, setDragActiveCover] = useState(false);
  const [dragActiveProduct, setDragActiveProduct] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [productPreviews, setProductPreviews] = useState<string[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessImage = useCallback((
    file: File,
    onSuccess: (preview: string, file: File) => void,
    onErrorCallback: (message: string) => void
  ) => {
    // Validar tamaño
    if (file.size > maxFileSize) {
      onErrorCallback(`El archivo es demasiado grande. Tamaño máximo: ${Math.round(maxFileSize / 1024 / 1024)}MB.`);
      return;
    }
    
    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      onErrorCallback('Formato no válido. Use JPG o PNG.');
      return;
    }
    
    // Validar dimensiones
    const img = document.createElement('img');
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      
      if (width > maxDimensions || height > maxDimensions) {
        onErrorCallback(`La imagen es muy grande. Máximo: ${maxDimensions}×${maxDimensions}px. Actual: ${width}×${height}px.`);
        return;
      }
      
      const preview = URL.createObjectURL(file);
      onSuccess(preview, file);
    };
    img.onerror = () => {
      onErrorCallback('No se pudo cargar la imagen. Verifique el archivo.');
    };
    img.src = URL.createObjectURL(file);
  }, [maxFileSize, maxDimensions, allowedTypes]);

  // Handlers para drag and drop de portada
  const handleDragCover = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragInCover = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDragActiveCover(true);
    }
  }, []);

  const handleDragOutCover = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCover(false);
  }, []);

  const handleDropCover = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCover(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessImage(
        file,
        (preview, processedFile) => {
          setCoverPreview(preview);
          onCoverImageChange([processedFile]);
        },
        (error) => {
          onError(error);
          if (coverInputRef.current) coverInputRef.current.value = '';
        }
      );
    }
  }, [validateAndProcessImage, onCoverImageChange, onError]);

  // Handlers para drag and drop de fotos del producto
  const handleDragProduct = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragInProduct = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDragActiveProduct(true);
    }
  }, []);

  const handleDragOutProduct = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveProduct(false);
  }, []);

  const handleDropProduct = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveProduct(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const currentImages = Array.isArray(productImages) ? productImages : [];
      const remainingSlots = maxProductImages - currentImages.length;
      const filesToProcess = files.slice(0, remainingSlots);
      
      let processedCount = 0;
      const validFiles: File[] = [];
      const validPreviews: string[] = [];
      const errors: string[] = [];
      
      const processFile = (file: File) => {
        validateAndProcessImage(
          file,
          (preview, processedFile) => {
            validFiles.push(processedFile);
            validPreviews.push(preview);
            processedCount++;
            
            if (processedCount === filesToProcess.length) {
              if (errors.length > 0) {
                errors.forEach(error => onError(error));
              }
              
              if (validFiles.length > 0) {
                setProductPreviews(prev => [...prev, ...validPreviews]);
                onProductImagesChange([...currentImages, ...validFiles]);
              }
            }
          },
          (error) => {
            errors.push(error);
            processedCount++;
            
            if (processedCount === filesToProcess.length) {
              if (errors.length > 0) {
                errors.forEach(error => onError(error));
              }
              
              if (validFiles.length > 0) {
                setProductPreviews(prev => [...prev, ...validPreviews]);
                onProductImagesChange([...currentImages, ...validFiles]);
              }
            }
          }
        );
      };
      
      filesToProcess.forEach((file) => {
        processFile(file);
      });
    }
  }, [productImages, validateAndProcessImage, onProductImagesChange, onError, maxProductImages]);

  // Sincronizar previews con archivos del formulario
  useEffect(() => {
    let previewUrl: string | null = null;
    
    if (coverImage) {
      if (coverImage instanceof File) {
        previewUrl = URL.createObjectURL(coverImage);
        setCoverPreview(previewUrl);
      } else {
        setCoverPreview(coverImage as unknown as string);
      }
    } else {
      setCoverPreview(null);
    }
    
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [coverImage]);

  useEffect(() => {
    // Asegurar que productImages siempre sea un array
    const imagesArray = Array.isArray(productImages) ? productImages : [];
    const previews = imagesArray.map((img) => {
      if (img instanceof File) {
        return URL.createObjectURL(img);
      }
      return img as unknown as string;
    });
    setProductPreviews(previews);
    
    return () => {
      previews.forEach((preview) => {
        if (typeof preview === 'string' && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [productImages]);

  return {
    dragActiveCover,
    dragActiveProduct,
    coverPreview,
    productPreviews,
    coverInputRef,
    productInputRef,
    handleDragCover,
    handleDragInCover,
    handleDragOutCover,
    handleDropCover,
    handleDragProduct,
    handleDragInProduct,
    handleDragOutProduct,
    handleDropProduct,
    validateAndProcessImage,
  };
};

