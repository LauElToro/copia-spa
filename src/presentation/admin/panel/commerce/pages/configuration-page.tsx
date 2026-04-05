"use client";
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { Box, Container, Grid, Typography } from "@mui/material";

import { Image } from '@/presentation/@shared/components/ui/atoms/image';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { Input } from '@/presentation/@shared/components/ui/atoms/input';
import { Stack } from '@/presentation/@shared/components/ui/molecules/stack';
import { IconButton } from '@/presentation/@shared/components/ui/atoms/icon-button';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { DropdownButton } from '@/presentation/@shared/components/ui/molecules/dropdown-button';
import { useConfigurationForm } from '@/presentation/@shared/hooks/use-configuration-form';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { DocumentType } from '@/presentation/@shared/types/login';
import { getDocumentInputType, getDocumentPlaceholder, formatDocumentNumber } from '@/presentation/@shared/helpers/document-validators';
import { WebsiteInput } from '@/presentation/@shared/components/ui/molecules/website-input';
import { useQuery } from '@tanstack/react-query';
import { axiosHelper } from '@/presentation/@shared/helpers/axios-helper';
import countries from '@/data/paises.json';

const ConfigurationPage: React.FC = () => {
  const { t } = useLanguage();
  const toast = useToast();
  const [isSavingHolderInfo, setIsSavingHolderInfo] = useState(false);
  const [isSavingCommerce, setIsSavingCommerce] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveBanner, setDragActiveBanner] = useState(false);

  // Opciones de código de país (igual que en /help)
  const countryCodeOptions = [
    { value: '+54', label: '+54', native: t.contact?.countries?.argentina || 'Argentina (+54)' },
    { value: '+56', label: '+56', native: t.contact?.countries?.chile || 'Chile (+56)' },
    { value: '+57', label: '+57', native: t.contact?.countries?.colombia || 'Colombia (+57)' },
    { value: '+52', label: '+52', native: t.contact?.countries?.mexico || 'México (+52)' },
    { value: '+51', label: '+51', native: t.contact?.countries?.peru || 'Perú (+51)' },
    { value: '+598', label: '+598', native: t.contact?.countries?.uruguay || 'Uruguay (+598)' },
    { value: '+58', label: '+58', native: t.contact?.countries?.venezuela || 'Venezuela (+58)' },
    { value: '+1', label: '+1', native: t.contact?.countries?.usa || 'Estados Unidos (+1)' },
    { value: '+34', label: '+34', native: t.contact?.countries?.spain || 'España (+34)' },
  ];

  // Opciones de países (para el select de país)
  const countryOptions = countries.map((c) => ({
    value: c.name,
    label: c.name,
    native: c.name,
  }));

  // Opciones de tipo de documento para Cuit/Cuil (solo CUIT y CUIL) - para comercio
  const cuitCuilTypeOptions = [
    { value: 'CUIT', label: 'CUIT', native: 'CUIT' },
    { value: 'CUIL', label: 'CUIL', native: 'CUIL' },
  ];

  // Opciones completas de tipo de documento - para titular
  const allDocumentTypeOptions = [
    { value: 'DNI', label: 'DNI', native: 'DNI' },
    { value: 'LC', label: 'LC (Libreta Cívica)', native: 'LC (Libreta Cívica)' },
    { value: 'LE', label: 'LE (Libreta de Enrolamiento)', native: 'LE (Libreta de Enrolamiento)' },
    { value: 'PASAPORTE', label: 'Pasaporte', native: 'Pasaporte' },
    { value: 'CUIL', label: 'CUIL', native: 'CUIL' },
    { value: 'CUIT', label: 'CUIT', native: 'CUIT' },
  ];

  const {
    form,
    setForm,
    errors,
    isCommerce,
    storeData,
    storeQuery,
    userQuery,
    handleSaveGeneral,
    handleChange,
    logoPreview,
    setLogoPreview,
    bannerPreview,
    setBannerPreview,
    avatarPreview,
    setAvatarPreview,
    avatarFile,
    setAvatarFile,
    logoFile,
    setLogoFile,
    bannerFile,
    setBannerFile,
    logoInputRef,
    bannerInputRef,
    avatarInputRef,
    avatarCancelled,
    setAvatarCancelled,
    logoCancelled,
    setLogoCancelled,
    bannerCancelled,
    setBannerCancelled,
    uploadAvatar,
    isUploadingAvatar,
    getErrorMessage,
    uploadLogoMutation,
    uploadBannerMutation,
    accountId} = useConfigurationForm(toast);

  // Validar disponibilidad del nombre de tienda usando el endpoint directo de ms-stores
  const storeId = storeQuery.data?.id as string | undefined;
  const trimmedStoreName = form.storeName?.trim();

  const storeNameValidationQuery = useQuery({
    queryKey: ['store-name-validation', trimmedStoreName, storeId],
    queryFn: async () => {
      if (!trimmedStoreName || trimmedStoreName.length === 0) {
        return { available: true, stores: [] };
      }

      try {
        // Llamar directamente al endpoint de ms-stores para buscar por nombre
        const response = await axiosHelper.stores.list({ name: trimmedStoreName });

        // Extraer las tiendas de la respuesta
        const data = response.data as
          | { data?: Array<{ id?: string; name?: string }> }
          | { items?: Array<{ id?: string; name?: string }> }
          | Array<{ id?: string; name?: string }>
          | undefined;

        let stores: Array<{ id?: string; name?: string }> = [];

        if (Array.isArray(data)) {
          stores = data;
        } else if (data && typeof data === 'object') {
          if ('data' in data && Array.isArray(data.data)) {
            stores = data.data;
          } else if ('items' in data && Array.isArray(data.items)) {
            stores = data.items;
          }
        }

        // Filtrar por nombre exacto (case-insensitive) y excluir la tienda actual
        const matchingStores = stores.filter(
          (store) =>
            store.name?.toLowerCase().trim() === trimmedStoreName.toLowerCase().trim() &&
            (!storeId || store.id !== storeId)
        );

        return {
          available: matchingStores.length === 0,
          stores: matchingStores,
        };
      } catch (error) {
        // Si hay un error, asumir que está disponible para no bloquear al usuario
        console.warn('[storeNameValidation] Error validando nombre:', error);
        return { available: true, stores: [] };
      }
    },
    enabled: isCommerce && !!trimmedStoreName && trimmedStoreName.length > 0,
    staleTime: 1000, // Cache por 1 segundo para evitar demasiadas peticiones
    gcTime: 5000, // Mantener en cache por 5 segundos
  });

  // Verificar si el nombre está disponible
  const storeNameValidation = useMemo(() => {
    if (!trimmedStoreName || trimmedStoreName.length === 0) {
      return { available: true, message: undefined };
    }

    if (storeNameValidationQuery.isLoading || storeNameValidationQuery.isFetching) {
      return { available: true, message: undefined }; // Mientras carga, asumir disponible
    }

    const validationData = storeNameValidationQuery.data;
    if (!validationData) {
      return { available: true, message: undefined };
    }

    return {
      available: validationData.available,
      message: !validationData.available ? 'Este nombre de tienda ya está en uso' : undefined,
    };
  }, [trimmedStoreName, storeNameValidationQuery.data, storeNameValidationQuery.isLoading, storeNameValidationQuery.isFetching]);

  // Determinar si el nombre de tienda tiene error
  const storeNameError =
    !storeNameValidation.available &&
    trimmedStoreName &&
    trimmedStoreName.length > 0
      ? storeNameValidation.message || 'Este nombre de tienda ya está en uso'
      : errors.storeName;

  // Función para guardar solo la información del titular
  const handleSaveHolderInfo = async () => {
    if (isSavingHolderInfo) return;
    setIsSavingHolderInfo(true);

    try {
      // Guardar solo los campos de información del titular
      // Para usuarios normales: name, dni, phone, email
      // Para comercios: holderInformation, phone, dni, email
      await handleSaveGeneral();
    } catch {
      toast.error('Error al guardar la información. Por favor, intenta nuevamente.');
    } finally {
      setIsSavingHolderInfo(false);
    }
  };

  // Función para guardar solo la información del comercio
  const handleSaveCommerceInfo = async () => {
    if (isSavingCommerce) return;
    setIsSavingCommerce(true);

    try {
      // CRÍTICO: Asegurar que el CUIT se capture correctamente antes de guardar
      // Buscar el input del CUIT directamente por su posición en el DOM
      const cuitInput = document.querySelector('input[type="text"][placeholder*="CUIT"], input[type="text"][placeholder*="CUIL"]') as HTMLInputElement;

      if (cuitInput && cuitInput.value && cuitInput.value.trim() !== '') {
        const inputValue = cuitInput.value.trim();

        // Si el valor del input es diferente al del formulario, actualizarlo
        if (inputValue !== form.cuit) {
          console.log('[handleSaveCommerceInfo] Sincronizando CUIT desde input:', {
            inputValue,
            formCuit: form.cuit,
          });

          // Actualizar el estado del formulario con el valor del input
          setForm((prev) => ({ ...prev, cuit: inputValue }));

          // Usar flushSync para asegurar que React actualice el estado inmediatamente
          // No necesitamos esperar, React actualizará el estado de forma síncrona
        }
      }

      // Ahora guardar con el valor actualizado
      await handleSaveGeneral();
    } catch {
      toast.error('Error al guardar la información del comercio. Por favor, intenta nuevamente.');
    } finally {
      setIsSavingCommerce(false);
    }
  };

  // Determinar si se está procesando alguna carga
  const isProcessingUpload = isUploadingAvatar || uploadLogoMutation.isPending || uploadBannerMutation.isPending;

  // Función helper para validar y procesar archivos de imagen
  const validateAndProcessImage = useCallback((
    file: File,
    onSuccess: (preview: string, file: File) => void,
    onError: (message: string) => void
  ) => {
    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      onError('El archivo es demasiado grande. Tamaño máximo: 2MB.');
      return;
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      onError('Formato no válido. Use JPG, PNG, WebP o SVG.');
      return;
    }

    // Validar dimensiones (solo para imágenes raster, no SVG)
    if (file.type !== 'image/svg+xml') {
      const img = document.createElement('img');
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // Validar resolución mínima (300x300px)
        if (width < 300 || height < 300) {
          onError(`La imagen es muy pequeña. Mínimo: 300×300px. Actual: ${width}×${height}px.`);
          return;
        }

        // Validar resolución máxima (2000x2000px)
        if (width > 2000 || height > 2000) {
          onError(`La imagen es muy grande. Máximo: 2000×2000px. Actual: ${width}×${height}px.`);
          return;
        }

        // Validar relación de aspecto 1:1 (cuadrada)
        const aspectRatio = width / height;
        if (Math.abs(aspectRatio - 1) > 0.1) {
          toast.warning(`Recomendamos una imagen cuadrada (1:1). Actual: ${width}×${height}px.`);
        }

        // Validar tamaño recomendado (200-400KB)
        if (file.size < 200 * 1024) {
          toast.info('Recomendamos un tamaño entre 200-400KB para mejor rendimiento.');
        } else if (file.size > 400 * 1024) {
          toast.info('Recomendamos comprimir la imagen a 200-400KB para mejor rendimiento.');
        }

        const preview = URL.createObjectURL(file);
        onSuccess(preview, file);
      };
      img.onerror = () => {
        onError('No se pudo cargar la imagen. Verifique el archivo.');
      };
      img.src = URL.createObjectURL(file);
    } else {
      // Para SVG, solo validar tamaño
      const preview = URL.createObjectURL(file);
      onSuccess(preview, file);
    }
  }, [toast]);

  // Handlers para drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent, isBanner = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (isBanner) {
        setDragActiveBanner(true);
      } else {
        setDragActive(true);
      }
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent, isBanner = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBanner) {
      setDragActiveBanner(false);
    } else {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, isBanner = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBanner) {
      setDragActiveBanner(false);
    } else {
      setDragActive(false);
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      if (isBanner) {
        if (file) {
          const preview = URL.createObjectURL(file);
          setBannerPreview(preview);
          setBannerFile(file);
            setBannerCancelled(false);
        }
      } else if (isCommerce) {
        validateAndProcessImage(
          file,
          (preview, processedFile) => {
            setLogoPreview(preview);
            setLogoFile(processedFile);
            // También establecer avatarFile para que se pueda subir el avatar
            setAvatarPreview(preview);
            setAvatarFile(processedFile);
              setLogoCancelled(false);
            setAvatarCancelled(false);
          },
          (error) => {
            toast.error(error);
            setLogoFile(null);
          }
        );
      } else {
        validateAndProcessImage(
          file,
          (preview, processedFile) => {
            setAvatarPreview(preview);
            setAvatarFile(processedFile);
            setAvatarCancelled(false); // Reset cancelled state when selecting new file
          },
          (error) => {
            toast.error(error);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
          }
        );
      }
    }
    },
    [isCommerce, validateAndProcessImage, toast, avatarInputRef, setBannerPreview, setBannerFile, setBannerCancelled, setLogoPreview, setLogoFile, setAvatarPreview, setAvatarFile, setLogoCancelled, setAvatarCancelled]
  );

  // Variables auxiliares para simplificar las expresiones condicionales
  const getExistingLogo = () => {
    if (!isCommerce) return undefined;
    // Intentar obtener el logo de múltiples fuentes
    const fromStoreData = storeData?.media?.logo?.smUrl ||
      (storeData?.information && typeof storeData.information === 'object' && !Array.isArray(storeData.information)
        ? (storeData.information as Record<string, unknown>)?.logo as string | undefined
        : undefined);

    const fromStoreQuery = storeQuery.data && typeof storeQuery.data === 'object' && 'information' in storeQuery.data &&
      storeQuery.data.information && typeof storeQuery.data.information === 'object' &&
      !Array.isArray(storeQuery.data.information)
      ? (storeQuery.data.information as Record<string, unknown>)?.logo as string | undefined
      : undefined;

    // También intentar desde userQuery si es comercio (puede tener avatar que se usa como logo)
    const fromUserQuery = isCommerce
      ? (userQuery.data?.additionalInfo as Record<string, unknown> | undefined)?.avatar as string | undefined
      : undefined;

    return fromStoreData || fromStoreQuery || fromUserQuery;
  };

  const getExistingAvatar = () => {
    // Función helper para extraer URL del avatar
    const extractAvatarUrl = (avatar: unknown): string | undefined => {
      if (!avatar) return undefined;
      if (typeof avatar === 'string') return avatar;
      if (typeof avatar === 'object' && avatar !== null) {
        const obj = avatar as Record<string, unknown>;
        if (obj.original && typeof obj.original === 'object') {
          const original = obj.original as Record<string, unknown>;
          if (typeof original.url === 'string') return original.url;
        }
        if (typeof obj.url === 'string') return obj.url;
        if (obj.variants && typeof obj.variants === 'object') {
          const variants = obj.variants as Record<string, unknown>;
          const variantKeys = ['lg', 'md', 'sm'];
          for (const key of variantKeys) {
            if (variants[key] && typeof variants[key] === 'object') {
              const variant = variants[key] as Record<string, unknown>;
              if (typeof variant.url === 'string') return variant.url;
            }
          }
        }
      }
      return undefined;
    };

    if (isCommerce) {
      // Para comercios, el avatar puede venir del logo del store o del avatar del usuario
      const fromStore = getExistingLogo();
      const userAvatar = (userQuery.data?.additionalInfo as Record<string, unknown> | undefined)?.avatar;
      const fromUser = extractAvatarUrl(userAvatar);
      return fromStore || fromUser;
    }
    const userAvatar = (userQuery.data?.additionalInfo as Record<string, unknown> | undefined)?.avatar;
    return extractAvatarUrl(userAvatar);
  };

  const getExistingBanner = () => {
    if (!isCommerce) return undefined;

    // Función helper para obtener banner de diferentes estructuras
    const getBannerFromMedia = (media: unknown): string | undefined => {
      if (!media || typeof media !== 'object') return undefined;
      const mediaObj = media as Record<string, unknown>;
      const banner = mediaObj.banner;

      if (!banner || typeof banner !== 'object') return undefined;
      const bannerObj = banner as Record<string, unknown>;

      // Estructura nueva: media.banner.variants.mobile.url (o tablet, desktop)
      if (bannerObj.variants && typeof bannerObj.variants === 'object') {
        const variants = bannerObj.variants as Record<string, unknown>;
        // Intentar en orden: mobile, tablet, desktop
        for (const size of ['mobile', 'tablet', 'desktop']) {
          const variant = variants[size];
          if (variant && typeof variant === 'object') {
            const variantObj = variant as Record<string, unknown>;
            if (typeof variantObj.url === 'string') {
              return variantObj.url;
            }
          }
        }
        // También intentar mobileUrl directamente en variants (compatibilidad)
        if (typeof variants.mobileUrl === 'string') {
          return variants.mobileUrl as string;
        }
      }

      // Estructura antigua: media.banner.mobileUrl
      if (typeof bannerObj.mobileUrl === 'string') {
        return bannerObj.mobileUrl;
      }

      // Si tiene url directamente
      if (typeof bannerObj.url === 'string') {
        return bannerObj.url;
      }

      return undefined;
    };

    // Intentar obtener el banner de múltiples fuentes
    const fromStoreData = getBannerFromMedia(storeData?.media) ||
      (storeData?.information && typeof storeData.information === 'object' && !Array.isArray(storeData.information)
        ? (storeData.information as Record<string, unknown>)?.banner as string | undefined
        : undefined);

    const fromStoreQuery = storeQuery.data && typeof storeQuery.data === 'object' && 'media' in storeQuery.data
      ? getBannerFromMedia((storeQuery.data as Record<string, unknown>).media)
      : (storeQuery.data && typeof storeQuery.data === 'object' && 'information' in storeQuery.data &&
          storeQuery.data.information && typeof storeQuery.data.information === 'object' &&
          !Array.isArray(storeQuery.data.information)
          ? (storeQuery.data.information as Record<string, unknown>)?.banner as string | undefined
          : undefined);

    return fromStoreData || fromStoreQuery;
  };

  const existingLogo = getExistingLogo();
  const existingAvatar = getExistingAvatar();
  const existingBanner = getExistingBanner();

  // Cargar imágenes existentes cuando se cargan los datos (especialmente después de F5 o acceso directo)
  useEffect(() => {
    // No hacer nada si no hay accountId
    if (!accountId) return;

    // Recalcular las imágenes existentes usando las funciones helper que ya consideran múltiples fuentes
    // Usar existingLogo, existingAvatar, existingBanner que ya se calculan arriba
    const currentExistingLogo = existingLogo;
    const currentExistingAvatar = existingAvatar;
    const currentExistingBanner = existingBanner;

    // Cargar logo/avatar para comercios - actualizar siempre que haya un logo disponible y no haya archivo seleccionado
    if (isCommerce && currentExistingLogo && !logoFile && !logoCancelled && !avatarCancelled) {
      // Actualizar si el preview está vacío o es diferente del logo existente (y no es un blob URL de una nueva selección)
      // CRÍTICO: No sobrescribir si hay un blob URL (nueva selección del usuario)
      const isBlobUrl = typeof logoPreview === 'string' && logoPreview.startsWith('blob:');
      const shouldUpdate = !logoPreview ||
        (logoPreview !== currentExistingLogo && !isBlobUrl);
      if (shouldUpdate) {
        setLogoPreview(currentExistingLogo);
        setAvatarPreview(currentExistingLogo);
      }
    }

    // Cargar avatar para usuarios normales - actualizar siempre que haya un avatar disponible y no haya archivo seleccionado
    // CRÍTICO: No ejecutar si hay un avatarFile seleccionado (el usuario acaba de seleccionar una nueva imagen)
    if (!isCommerce && currentExistingAvatar && !avatarFile && !avatarCancelled) {
      // Actualizar si el preview está vacío o es diferente del avatar existente (y no es un blob URL de una nueva selección)
      // CRÍTICO: No sobrescribir si hay un blob URL (nueva selección del usuario)
      const isBlobUrl = typeof avatarPreview === 'string' && avatarPreview.startsWith('blob:');
      const shouldUpdate = !avatarPreview ||
        (avatarPreview !== currentExistingAvatar && !isBlobUrl);
      if (shouldUpdate) {
        setAvatarPreview(currentExistingAvatar);
      }
    }

    // Cargar banner para comercios - actualizar siempre que haya un banner disponible y no haya archivo seleccionado
    if (isCommerce && currentExistingBanner && !bannerFile && !bannerCancelled) {
      // Actualizar si el preview está vacío o es diferente del banner existente (y no es un blob URL de una nueva selección)
      // CRÍTICO: No sobrescribir si hay un blob URL (nueva selección del usuario)
      const isBlobUrl = typeof bannerPreview === 'string' && bannerPreview.startsWith('blob:');
      const shouldUpdate = !bannerPreview ||
        (bannerPreview !== currentExistingBanner && !isBlobUrl);
      if (shouldUpdate) {
        setBannerPreview(currentExistingBanner);
      }
    }
  }, [isCommerce, accountId, logoFile, logoCancelled, avatarFile, avatarCancelled, bannerFile, bannerCancelled, existingLogo, existingAvatar, existingBanner, storeData, storeQuery.data, storeQuery.isSuccess, userQuery.data, userQuery.isSuccess, logoPreview, avatarPreview, bannerPreview, setLogoPreview, setAvatarPreview, setBannerPreview]);

  // Recalcular hasLogoOrAvatar y hasBanner usando useMemo para que se actualicen cuando cambien los datos
  // También incluir storeQuery.isSuccess y userQuery.isSuccess para forzar recálculo cuando las queries se completen
  const hasLogoOrAvatar = useMemo(() => {
    const result = logoPreview || avatarPreview ||
      ((!logoCancelled && !avatarCancelled) && (existingLogo || existingAvatar));
    return result;
  }, [logoPreview, avatarPreview, logoCancelled, avatarCancelled, existingLogo, existingAvatar]);

  const hasBanner = useMemo(() => {
    const result = bannerPreview || (!bannerCancelled && existingBanner);
    return result;
  }, [bannerPreview, bannerCancelled, existingBanner]);

  // Funciones para manejar el click en los botones de cancelar
  const handleCancelLogo = useCallback(() => {
    if (isCommerce) {
      // Verificar si el logo actual es el mismo que el de la BD
      const isExistingLogo = existingLogo && (logoPreview === existingLogo || (!logoPreview && existingLogo));

      if (isExistingLogo) {
        // Si es el logo de la BD, marcar como cancelado
        setLogoCancelled(true);
      }
      setLogoPreview('');
      setLogoFile(null);
      setAvatarPreview('');
      setAvatarFile(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    } else {
      // Verificar si el avatar actual es el mismo que el de la BD
      const isExistingAvatar = existingAvatar && (avatarPreview === existingAvatar || (!avatarPreview && existingAvatar));

      if (isExistingAvatar) {
        // Si es el avatar de la BD, marcar como cancelado
        setAvatarCancelled(true);
      }
      setAvatarPreview('');
      setAvatarFile(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  }, [isCommerce, existingLogo, existingAvatar, logoPreview, avatarPreview, setLogoCancelled, setLogoPreview, setLogoFile, setAvatarPreview, setAvatarFile, setAvatarCancelled, logoInputRef, avatarInputRef]);

  const handleCancelBanner = useCallback(() => {
    // Verificar si el banner actual es el mismo que el de la BD
    const isExistingBanner = existingBanner && (bannerPreview === existingBanner || (!bannerPreview && existingBanner));

    if (isExistingBanner) {
      // Si es el banner de la BD, marcar como cancelado
      setBannerCancelled(true);
    }
    setBannerPreview('');
    setBannerFile(null);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  }, [existingBanner, bannerPreview, setBannerCancelled, setBannerPreview, setBannerFile, bannerInputRef]);

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: '100%',
        backgroundColor: '#000000',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: t.admin?.settings || 'Configuración' }
              ]}
            />

            {/* Content */}
              <Grid container spacing={4}>
                  {/* Card 1: Multimedia - Primera columna */}
                  <Grid size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                      border: "2px solid rgba(41, 196, 128, 0.1)",
                      borderRadius: "24px",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "default",
                      "&:hover": {
                        backgroundColor: "rgba(41, 196, 128, 0.08)",
                        borderColor: "rgba(41, 196, 128, 0.4)",
                      },
                      padding: { xs: 3, md: 4 },
                      gap: 3,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Multimedia
                    </Typography>
                <Grid container spacing={4} alignItems="center">
                  <Grid size={{ xs: 12, md: 12 }}>
                    <Stack spacing={3} sx={{ width: '100%' }}>
                      {/* Área de carga moderna con drag and drop - Siempre visible */}
                          <Box
                            component="label"
                            onDragEnter={(e) => !isProcessingUpload && handleDragIn(e, false)}
                            onDragLeave={(e) => !isProcessingUpload && handleDragOut(e, false)}
                            onDragOver={(e) => !isProcessingUpload && handleDrag(e)}
                            onDrop={(e) => !isProcessingUpload && handleDrop(e, false)}
                            sx={{
                              width: '100%',
                              maxWidth: '100%',
                              minHeight: 200,
                              boxSizing: 'border-box',
                              border: '2px dashed',
                              borderColor: dragActive ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                              borderRadius: 2,
                              backgroundColor: dragActive ? 'rgba(52, 211, 153, 0.05)' : 'rgba(0, 0, 0, 0.2)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 2,
                              padding: 4,
                              cursor: isProcessingUpload ? 'not-allowed' : 'pointer',
                              opacity: isProcessingUpload ? 0.5 : 1,
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden',
                              pointerEvents: isProcessingUpload ? 'none' : 'auto',
                              '&:hover': !isProcessingUpload ? {
                                borderColor: '#34d399',
                                backgroundColor: 'rgba(52, 211, 153, 0.05)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(52, 211, 153, 0.2)',
                              } : {},
                              '&::before': dragActive ? {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.1), transparent)',
                                animation: 'shimmer 1.5s infinite',
                                '@keyframes shimmer': {
                                  '0%': { left: '-100%' },
                                  '100%': { left: '100%' },
                                },
                              } : {},
                            }}
                          >
                            <input
                              ref={isCommerce ? logoInputRef : avatarInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                              hidden
                              disabled={isProcessingUpload}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (isCommerce) {
                                    validateAndProcessImage(
                                      file,
                                      (preview, processedFile) => {
                                        setLogoPreview(preview);
                                        setLogoFile(processedFile);
                                        // También establecer avatarFile para que se pueda subir el avatar
                                        setAvatarPreview(preview);
                                        setAvatarFile(processedFile);
                                    setLogoCancelled(false);
                                        setAvatarCancelled(false);
                                      },
                                      (error) => {
                                        toast.error(error);
                                        setLogoFile(null);
                                        if (logoInputRef.current) logoInputRef.current.value = '';
                                      }
                                    );
                                  } else {
                                    validateAndProcessImage(
                                      file,
                                      (preview, processedFile) => {
                                        setAvatarPreview(preview);
                                        setAvatarFile(processedFile);
                                        setAvatarCancelled(false); // Reset cancelled state when selecting new file
                                      },
                                      (error) => {
                                        toast.error(error);
                                        if (avatarInputRef.current) avatarInputRef.current.value = '';
                                      }
                                    );
                                  }
                                }
                              }}
                            />
                        {/* Preview de imagen con animación - Se muestra dentro del área de carga */}
                        {hasLogoOrAvatar ? (
                          <Box
                            sx={{
                              position: 'relative',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '100%',
                              animation: 'fadeInScale 0.3s ease-out',
                              '@keyframes fadeInScale': {
                                '0%': {
                                  opacity: 0,
                                  transform: 'scale(0.9)',
                                },
                                '100%': {
                                  opacity: 1,
                                  transform: 'scale(1)',
                                },
                              },
                            }}
                          >
                            <Box
                              sx={{
                                position: 'relative',
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '3px solid',
                                borderColor: '#34d399',
                                boxShadow: '0 4px 20px rgba(52, 211, 153, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 6px 25px rgba(52, 211, 153, 0.5)',
                                },
                              }}
                            >
                              <Image
                                src={
                                  // Priorizar previews de archivos seleccionados (blob URLs o URLs de preview)
                                  // Para comercios: logoPreview tiene prioridad
                                  // Para usuarios: avatarPreview tiene prioridad
                                  isCommerce
                                    ? (logoPreview || avatarPreview || ((!logoCancelled && !avatarCancelled) && existingLogo) || '')
                                    : (avatarPreview || ((!avatarCancelled) && existingAvatar) || '')
                                }
                                alt={isCommerce ? "logo" : "foto de perfil"}
                                width={120}
                                height={120}
                                sx={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
                              />
                            </Box>
                            <Box
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              sx={{ position: 'absolute', top: -8, right: 'calc(50% - 41px)', zIndex: 10 }}
                            >
                              <IconButton
                                onClick={handleCancelLogo}
                                sx={{
                                  backgroundColor: '#ef4444',
                                  color: '#fff',
                                  width: 32,
                                  height: 32,
                                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: '#dc2626',
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.6)',
                                  },
                                }}
                                size="small"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                zIndex: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 64,
                                  height: 64,
                                  borderRadius: '50%',
                                  backgroundColor: dragActive ? 'rgba(52, 211, 153, 0.2)' : 'rgba(52, 211, 153, 0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.3s ease',
                                  transform: dragActive ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                                }}
                              >
                                {dragActive ? (
                                  <CloudUploadIcon sx={{ fontSize: 32, color: '#34d399' }} />
                                ) : (
                                  <PhotoCameraIcon sx={{ fontSize: 32, color: '#34d399' }} />
                                )}
                              </Box>
                              <Typography
                                sx={{
                                  fontSize: '1rem',
                                  fontWeight: 600,
                                  color: '#fff',
                                  textAlign: 'center',
                                }}
                              >
                                {isCommerce ? 'Subir logo' : 'Seleccionar foto de perfil'}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: '0.875rem',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  textAlign: 'center',
                                }}
                              >
                                {dragActive ? 'Suelta la imagen aquí' : 'Arrastra y suelta o haz clic para seleccionar'}
                              </Typography>
                            </Box>
                        )}
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.875rem',
                              color: 'rgba(255, 255, 255, 0.6)',
                              textAlign: 'center',
                              width: '100%',
                            }}
                          >
                            Formatos: JPG, PNG, WebP o SVG. Máximo 2MB. Recomendado: 512×512px cuadrada.
                          </Typography>
                    </Stack>
                  </Grid>

                  {isCommerce && (
                    <Grid size={{ xs: 12, md: 12 }}>
                      <Stack spacing={3} sx={{ width: '100%' }}>
                        {/* Área de carga moderna con drag and drop para banner - Siempre visible */}
                          <Box
                          component="label"
                          onDragEnter={(e) => !isProcessingUpload && handleDragIn(e, true)}
                          onDragLeave={(e) => !isProcessingUpload && handleDragOut(e, true)}
                          onDragOver={(e) => !isProcessingUpload && handleDrag(e)}
                          onDrop={(e) => !isProcessingUpload && handleDrop(e, true)}
                            sx={{
                            width: '100%',
                            minHeight: 200,
                            border: '2px dashed',
                            borderColor: dragActiveBanner ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                            borderRadius: 2,
                            backgroundColor: dragActiveBanner ? 'rgba(52, 211, 153, 0.05)' : 'rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            padding: 4,
                            cursor: isProcessingUpload ? 'not-allowed' : 'pointer',
                            opacity: isProcessingUpload ? 0.5 : 1,
                            transition: 'all 0.3s ease',
                              position: 'relative',
                            overflow: 'hidden',
                            pointerEvents: isProcessingUpload ? 'none' : 'auto',
                            '&:hover': !isProcessingUpload ? {
                              borderColor: '#34d399',
                              backgroundColor: 'rgba(52, 211, 153, 0.05)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 20px rgba(52, 211, 153, 0.2)',
                            } : {},
                            '&::before': dragActiveBanner ? {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.1), transparent)',
                              animation: 'shimmer 1.5s infinite',
                              '@keyframes shimmer': {
                                '0%': { left: '-100%' },
                                '100%': { left: '100%' },
                              },
                            } : {},
                          }}
                        >
                          <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            disabled={isProcessingUpload}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const preview = URL.createObjectURL(file);
                                setBannerPreview(preview);
                                setBannerFile(file);
                                setBannerCancelled(false);
                              }
                            }}
                          />
                          {/* Preview de banner con animación - Se muestra dentro del área de carga */}
                          {hasBanner ? (
                            <Box
                              sx={{
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                              animation: 'fadeInScale 0.3s ease-out',
                              '@keyframes fadeInScale': {
                                '0%': {
                                  opacity: 0,
                                  transform: 'scale(0.9)',
                                },
                                '100%': {
                                  opacity: 1,
                                  transform: 'scale(1)',
                                },
                              },
                            }}
                          >
                            <Box
                              sx={{
                                position: 'relative',
                                width: 200,
                                height: 120,
                                borderRadius: 2,
                                overflow: 'visible',
                                border: '3px solid',
                                borderColor: '#34d399',
                                boxShadow: '0 4px 20px rgba(52, 211, 153, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                  boxShadow: '0 6px 25px rgba(52, 211, 153, 0.5)',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                }}
                              >
                                <Image
                                    src={typeof bannerPreview === 'string' ? bannerPreview :
                                         typeof existingBanner === 'string' ? existingBanner : ''}
                                  alt="banner"
                                  width={200}
                                  height={120}
                                  sx={{ borderRadius: 2, objectFit: 'cover', width: '100%', height: '100%' }}
                                />
                              </Box>
                                <Box
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  sx={{ position: 'absolute', top: -8, right: -8, zIndex: 10 }}
                                >
                                <IconButton
                                    onClick={handleCancelBanner}
                                  sx={{
                                    backgroundColor: '#ef4444',
                                    color: '#fff',
                                    width: 32,
                                    height: 32,
                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      backgroundColor: '#dc2626',
                                      transform: 'scale(1.1)',
                                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.6)',
                                    },
                                  }}
                                  size="small"
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                          </Box>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 2,
                                  zIndex: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    backgroundColor: dragActiveBanner ? 'rgba(52, 211, 153, 0.2)' : 'rgba(52, 211, 153, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    transform: dragActiveBanner ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                                  }}
                                >
                                  {dragActiveBanner ? (
                                    <CloudUploadIcon sx={{ fontSize: 32, color: '#34d399' }} />
                                  ) : (
                                    <PhotoCameraIcon sx={{ fontSize: 32, color: '#34d399' }} />
                                  )}
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: '#fff',
                                    textAlign: 'center',
                                  }}
                                >
                                  Subir banner
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: '0.875rem',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    textAlign: 'center',
                                  }}
                                >
                                  {dragActiveBanner ? 'Suelta la imagen aquí' : 'Arrastra y suelta o haz clic para seleccionar'}
                                </Typography>
                              </Box>
                          )}
                            </Box>

                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.6)',
                                textAlign: 'center',
                                width: '100%',
                              }}
                            >
                              Permitimos PNG, JPG o JPEG. Tamaño máximo 10 MB medidas 1500px X 450px
                            </Typography>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
                <Stack direction="row" justifyContent="flex-start" sx={{ mt: 4 }}>
                  {!isCommerce && (
                    <Button
                      sx={{ px: 5 }}
                      onClick={() => {
                        if (avatarFile && accountId) {
                          uploadAvatar({
                            accountId,
                            file: avatarFile,
                            currentAdditionalInfo: userQuery.data?.additionalInfo as Record<string, unknown> | undefined})
                            .then(async () => {
                              toast.success('Foto de perfil actualizada correctamente.');
                              // Refetch para obtener la URL actualizada del avatar
                              const refetchedData = await userQuery.refetch();
                              // Actualizar avatarPreview con la nueva URL del avatar
                              const updatedUser = refetchedData.data;
                              const avatarData = (updatedUser?.additionalInfo as Record<string, unknown> | undefined)?.avatar;
                              // Extraer URL del avatar (puede ser string o objeto)
                              const updatedAvatarUrl = typeof avatarData === 'string'
                                ? avatarData
                                : (avatarData && typeof avatarData === 'object' && 'url' in avatarData && typeof avatarData.url === 'string')
                                  ? avatarData.url
                                  : (avatarData && typeof avatarData === 'object' && 'original' in avatarData &&
                                     avatarData.original && typeof avatarData.original === 'object' &&
                                     'url' in avatarData.original && typeof avatarData.original.url === 'string')
                                    ? avatarData.original.url
                                    : undefined;
                              if (updatedAvatarUrl) {
                                setAvatarPreview(updatedAvatarUrl);
                                setAvatarCancelled(false); // Reset cancelled state after successful upload
                              }
                              setAvatarFile(null);
                              if (avatarInputRef.current) {
                                avatarInputRef.current.value = '';
                              }
                            })
                            .catch((error: unknown) => {
                              const errorMessage = getErrorMessage(error);
                              toast.error(errorMessage);
                            });
                        }
                      }}
                      disabled={!avatarFile || isUploadingAvatar}
                      isLoading={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  )}
                  {isCommerce && (
                    <Button
                      sx={{ px: 5 }}
                      onClick={async () => {
                        try {
                          let hasUploads = false;

                          // Subir avatar si hay archivo seleccionado (se sube primero si está presente)
                          if (avatarFile) {
                            if (!accountId) {
                              toast.error('No se pudo obtener el ID de la cuenta. Por favor, recarga la página.');
                              return;
                            }

                            try {
                              await uploadAvatar({
                                accountId,
                                file: avatarFile,
                                currentAdditionalInfo: userQuery.data?.additionalInfo as Record<string, unknown> | undefined
                              });
                              toast.success('Foto de perfil actualizada correctamente.');
                              const refetchedData = await userQuery.refetch();
                              const updatedUser = refetchedData.data;
                              const avatarData = (updatedUser?.additionalInfo as Record<string, unknown> | undefined)?.avatar;
                              // Extraer URL del avatar (puede ser string o objeto)
                              const updatedAvatar = typeof avatarData === 'string'
                                ? avatarData
                                : (avatarData && typeof avatarData === 'object' && 'url' in avatarData && typeof avatarData.url === 'string')
                                  ? avatarData.url
                                  : (avatarData && typeof avatarData === 'object' && 'original' in avatarData &&
                                     avatarData.original && typeof avatarData.original === 'object' &&
                                     'url' in avatarData.original && typeof avatarData.original.url === 'string')
                                    ? avatarData.original.url
                                    : undefined;
                              if (updatedAvatar) {
                                setAvatarPreview(updatedAvatar);
                                setAvatarCancelled(false);
                              }
                              setAvatarFile(null);
                              if (avatarInputRef.current) {
                                avatarInputRef.current.value = '';
                              }
                              hasUploads = true;
                            } catch (error: unknown) {
                              const errorMessage = getErrorMessage(error);
                              toast.error(errorMessage);
                            }
                          }

                          // Subir logo y banner solo si hay storeId (para cuentas commerce)
                          const storeId = storeQuery.data?.id;
                          if (storeId) {
                            // Convertir storeId a string para asegurar que sea del tipo correcto
                            const storeIdString = String(storeId);

                            // Subir logo si hay archivo (usar logoFile del estado o del input ref como fallback)
                            const logoFileToUpload = logoFile || logoInputRef.current?.files?.[0];
                            if (logoPreview && logoFileToUpload) {
                              await uploadLogoMutation.mutateAsync({ storeId: storeIdString, file: logoFileToUpload });
                              toast.success('Logo actualizado correctamente.');
                              setLogoPreview('');
                              setLogoFile(null);
                              if (logoInputRef.current) logoInputRef.current.value = '';
                              // Refetch del store para cargar el logo actualizado
                              await storeQuery.refetch();
                              hasUploads = true;
                            }

                            // Subir banner si hay archivo (usar bannerFile del estado o del input ref como fallback)
                            const bannerFileToUpload = bannerFile || bannerInputRef.current?.files?.[0];
                            if (bannerPreview && bannerFileToUpload) {
                              await uploadBannerMutation.mutateAsync({ storeId: storeIdString, file: bannerFileToUpload });
                              // Limpiar estados locales para permitir que se cargue desde el servidor
                              setBannerPreview('');
                              setBannerFile(null);
                              if (bannerInputRef.current) bannerInputRef.current.value = '';
                              // Refetch del store para cargar el banner actualizado
                              const refetchedData = await storeQuery.refetch();
                              // Actualizar el preview con el banner del servidor después del refetch
                              const updatedStore = refetchedData.data as typeof storeQuery.data;
                              if (updatedStore) {
                                // Función helper para obtener banner de diferentes estructuras
                                const getBannerFromMedia = (media: unknown): string | undefined => {
                                  if (!media || typeof media !== 'object') return undefined;
                                  const mediaObj = media as Record<string, unknown>;
                                  const banner = mediaObj.banner;

                                  if (!banner || typeof banner !== 'object') return undefined;
                                  const bannerObj = banner as Record<string, unknown>;

                                  // Estructura nueva: media.banner.variants.mobile.url
                                  if (bannerObj.variants && typeof bannerObj.variants === 'object') {
                                    const variants = bannerObj.variants as Record<string, unknown>;
                                    const mobile = variants.mobile;
                                    if (mobile && typeof mobile === 'object') {
                                      const mobileObj = mobile as Record<string, unknown>;
                                      if (typeof mobileObj.url === 'string') {
                                        return mobileObj.url;
                                      }
                                    }
                                    // También intentar mobileUrl directamente en variants
                                    if (typeof variants.mobileUrl === 'string') {
                                      return variants.mobileUrl as string;
                                    }
                                  }

                                  // Estructura antigua: media.banner.mobileUrl
                                  if (typeof bannerObj.mobileUrl === 'string') {
                                    return bannerObj.mobileUrl;
                                  }

                                  return undefined;
                                };

                                const newBanner = getBannerFromMedia(updatedStore.media) ||
                                  (updatedStore.information && typeof updatedStore.information === 'object' && !Array.isArray(updatedStore.information)
                                    ? (updatedStore.information as Record<string, unknown>)?.banner as string | undefined
                                    : undefined);

                                if (newBanner) {
                                  setBannerPreview(newBanner);
                                }
                              }
                              toast.success('Banner actualizado correctamente.');
                              hasUploads = true;
                            }
                          }

                          // Solo mostrar advertencia si realmente no hay ningún archivo seleccionado
                          if (!hasUploads && !avatarFile && !avatarPreview && !logoFile && !logoPreview && !bannerFile && !bannerPreview) {
                            toast.warning('No hay archivos seleccionados para subir.');
                          }
                        } catch (error) {
                          const errorMessage = error instanceof Error ? error.message : 'No se pudo subir la imagen. Inténtalo nuevamente.';
                          toast.error(errorMessage);
                        }
                      }}
                      disabled={
                        // Deshabilitar si no hay ningún archivo o preview seleccionado
                        (!logoFile && !logoPreview && !bannerFile && !bannerPreview && !avatarFile && !avatarPreview) ||
                        // Deshabilitar avatar si no hay accountId
                        (avatarFile && !accountId) ||
                        // Para logo y banner: habilitar si hay archivo seleccionado (el onClick validará el storeId)
                        // Solo deshabilitar si hay preview pero no hay archivo ni storeId (caso edge)
                        (isCommerce && logoPreview && !logoFile && !storeQuery.data?.id) ||
                        (isCommerce && bannerPreview && !bannerFile && !storeQuery.data?.id) ||
                        // Deshabilitar durante las subidas
                        uploadLogoMutation.isPending ||
                        uploadBannerMutation.isPending ||
                        isUploadingAvatar
                      }
                      isLoading={uploadLogoMutation.isPending || uploadBannerMutation.isPending || isUploadingAvatar}
                    >
                      {(uploadLogoMutation.isPending || uploadBannerMutation.isPending || isUploadingAvatar) ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  )}
                </Stack>
                  </Box>
                  </Grid>

                  {/* Segunda columna: Información del titular e Información del comercio */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={4}>
                  {/* Card 2: Información del titular */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                      border: "2px solid rgba(41, 196, 128, 0.1)",
                      borderRadius: "24px",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "default",
                      "&:hover": {
                        backgroundColor: "rgba(41, 196, 128, 0.08)",
                        borderColor: "rgba(41, 196, 128, 0.4)",
                      },
                      padding: { xs: 3, md: 4 },
                      gap: 3,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Información del titular
                    </Typography>
                <Grid container spacing={3}>
                  {/* Nombre, Apellido y País - 3 campos en una fila */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Nombre
                    </Typography>
                    <Input
                      value={form.name || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
                      state="modern"
                      fullWidth
                      placeholder="Nombre"
                      error={!!errors.name}
                    />
                    {errors.name && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.name}</Text>}
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Apellido
                    </Typography>
                    <Input
                      value={form.lastName || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('lastName', e.target.value)}
                      state="modern"
                      fullWidth
                      placeholder="Apellido"
                      error={!!errors.lastName}
                    />
                    {errors.lastName && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.lastName}</Text>}
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      País
                    </Typography>
                    <DropdownButton
                      options={countryOptions}
                      value={form.country || ''}
                      onChange={(option) => {
                        const selectedCountry = countries.find((c) => c.name === option.value);
                        if (selectedCountry) {
                          handleChange('country', selectedCountry.name);
                          handleChange('phoneCountryCode', `+${selectedCountry.phone_code}`);
                        }
                      }}
                      placeholder="Seleccionar país..."
                      renderValue={(option) => option ? option.label : ''}
                      fullWidth={true}
                      searchable={true}
                      sx={{
                        width: '100%',
                        '& button': {
                          height: '56px',
                          minHeight: '56px',
                          alignItems: 'center',
                          display: 'flex',
                          '& .MuiTypography-root': {
                            fontSize: '0.875rem !important',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            lineHeight: '1.5',
                          }
                        }
                      }}
                    />
                    {errors.country && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.country}</Text>}
                  </Grid>

                  {/* Teléfono - 3 campos */}
                  <Grid size={{ xs: 12 }}>
                    <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
                      <Grid size={{ xs: 4, md: 3 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          {t.contact?.countryCode || 'Código de país'}
                        </Typography>
                        <DropdownButton
                          options={countryCodeOptions}
                          value={form.phoneCountryCode || ''}
                          onChange={(option) => handleChange('phoneCountryCode', option.value)}
                          placeholder={t.contact?.selectCountry || 'Seleccionar país'}
                          renderValue={(option) => option ? option.value : ''}
                          fullWidth={true}
                          searchable={true}
                          sx={{
                            width: '100%',
                            '& button': {
                              height: '56px',
                              minHeight: '56px',
                              alignItems: 'center',
                              display: 'flex',
                              '& .MuiTypography-root': {
                                fontSize: '0.875rem !important',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                lineHeight: '1.5',
                              }
                            }
                          }}
                        />
                        {errors.phoneCountryCode && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.phoneCountryCode}</Text>}
                      </Grid>
                      <Grid size={{ xs: 4, md: 3 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          {t.contact?.areaCode || 'Código de área'}
                        </Typography>
                        <Input
                          value={form.phoneAreaCode || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phoneAreaCode', e.target.value)}
                          state="modern"
                          fullWidth
                          placeholder="Código de área"
                          type="number"
                          error={!!errors.phoneAreaCode}
                          inputProps={{
                            min: 1,
                            max: 9999
                          }}
                        />
                        {errors.phoneAreaCode && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.phoneAreaCode}</Text>}
                      </Grid>
                      <Grid size={{ xs: 4, md: 6 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          {t.contact?.phoneNumber || 'Teléfono'}
                        </Typography>
                        <Input
                          value={form.phoneNumber || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('phoneNumber', e.target.value)}
                          state="modern"
                          fullWidth
                          placeholder="Número de teléfono"
                          type="number"
                          error={!!errors.phoneNumber}
                          inputProps={{
                            min: 1,
                            max: 99999999
                          }}
                        />
                        {errors.phoneNumber && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.phoneNumber}</Text>}
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* ID, Number y E-mail - 3 campos alineados verticalmente */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      ID
                    </Typography>
                    <DropdownButton
                      options={[
                        { value: '', label: 'Tipo', native: 'Tipo' },
                        ...allDocumentTypeOptions
                      ]}
                      value={form.documentType || ''}
                      onChange={(option) => {
                        const newType = option.value;
                        handleChange('documentType', newType);
                        if (form.documentNumber) {
                          handleChange('documentNumber', '');
                        }
                      }}
                      placeholder="Tipo"
                      renderValue={(option) => option ? option.label : ''}
                      fullWidth={true}
                      searchable={true}
                      sx={{
                        width: '100%',
                        '& button': {
                          height: '56px',
                          minHeight: '56px',
                          alignItems: 'center',
                          display: 'flex',
                          '& .MuiTypography-root': {
                            fontSize: '0.875rem !important',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            lineHeight: '1.5',
                          }
                        }
                      }}
                    />
                    {errors.documentType && (
                      <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>
                        {errors.documentType}
                      </Text>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Number
                    </Typography>
                    <Input
                      value={form.documentNumber || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        let value = e.target.value;
                        // Formatear automáticamente para CUIL/CUIT mientras el usuario escribe
                        if (form.documentType === 'CUIL' || form.documentType === 'CUIT') {
                          value = formatDocumentNumber(form.documentType as DocumentType, value);
                        }
                        handleChange('documentNumber', value);
                      }}
                      state="modern"
                      fullWidth
                      placeholder={getDocumentPlaceholder(form.documentType as DocumentType)}
                      type={getDocumentInputType(form.documentType as DocumentType)}
                      disabled={!form.documentType}
                      error={!!errors.documentNumber}
                    />
                    {errors.documentNumber && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.documentNumber}</Text>}
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      E-mail
                    </Typography>
                    <Input
                      value={form.email || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
                      state="modern"
                      fullWidth
                      placeholder="E-mail"
                      type="email"
                      error={!!errors.email}
                    />
                    {errors.email && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.email}</Text>}
                  </Grid>
                </Grid>
                <Stack direction="row" justifyContent="flex-start" sx={{ mt: 4 }}>
                  <Button
                    sx={{ px: 5 }}
                    onClick={handleSaveHolderInfo}
                    disabled={isSavingHolderInfo}
                    isLoading={isSavingHolderInfo}
                  >
                    Guardar cambios
                  </Button>
                </Stack>
                  </Box>

                {/* Card 3: Información del comercio */}
                {isCommerce && (
                  <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                        border: "2px solid rgba(41, 196, 128, 0.1)",
                        borderRadius: "24px",
                        overflow: "hidden",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "default",
                        "&:hover": {
                          backgroundColor: "rgba(41, 196, 128, 0.08)",
                          borderColor: "rgba(41, 196, 128, 0.4)",
                        },
                        padding: { xs: 3, md: 4 },
                        gap: 3,
                      }}
                    >
                    <Typography
                        variant="h3"
                      sx={{
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Información del comercio
                    </Typography>
                    <Grid container spacing={3}>
                      {/* Fila 1: Información básica del comercio - 2 columnas */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Nombre de la tienda
                        </Typography>
                        <Input
                          value={form.storeName || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('storeName', e.target.value)}
                          state="modern"
                          fullWidth
                          placeholder="Mi Tienda"
                          error={!!storeNameError}
                        />
                        {storeNameError && (
                          <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>
                            {storeNameError}
                          </Text>
                        )}
                        {errors.storeName && !storeNameError && (
                          <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>
                            {errors.storeName}
                          </Text>
                        )}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          ID
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                          <Box sx={{ flex: '0 0 40%', minWidth: 0 }}>
                            <DropdownButton
                              options={cuitCuilTypeOptions}
                              value={form.commerceDocumentType || ''}
                              onChange={(option) => {
                                // Solo limpiar el CUIT si cambia el tipo de documento
                                // Preservar el valor si el tipo es el mismo
                                setForm(f => ({
                                  ...f,
                                  commerceDocumentType: option.value,
                                  // Solo limpiar si cambia el tipo, no si es el mismo
                                  ...(f.commerceDocumentType !== option.value ? { cuit: '' } : {})
                                }));
                              }}
                              placeholder="Tipo"
                              renderValue={(option) => option ? option.label : ''}
                              fullWidth={true}
                              searchable={false}
                              sx={{
                                width: '100%',
                                '& button': {
                                  height: '56px',
                                  minHeight: '56px',
                                  alignItems: 'center',
                                  display: 'flex',
                                  '& .MuiTypography-root': {
                                    fontSize: '0.875rem !important',
                                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    lineHeight: '1.5',
                                  }
                                }
                              }}
                            />
                          </Box>
                          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                            <Input
                              type="text"
                              value={form.cuit || ''}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                // CRÍTICO: Capturar el valor directamente sin ningún procesamiento
                                // Permitir que el usuario escriba libremente, incluyendo guiones
                                const inputValue = e.target.value;

                                // Actualizar el estado inmediatamente con el valor exacto que el usuario ingresa
                                setForm((f) => {
                                  const updated = { ...f, cuit: inputValue };
                                  return updated;
                                });
                              }}
                              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                // Formatear solo cuando el usuario termina de escribir (onBlur)
                                // Esto evita interferir con la escritura
                                if (form.commerceDocumentType === 'CUIL' || form.commerceDocumentType === 'CUIT') {
                                  const currentValue = e.target.value;
                                  const formatted = formatDocumentNumber(form.commerceDocumentType as DocumentType, currentValue);
                                  // Solo actualizar si el formato cambió
                                  if (formatted !== currentValue && formatted) {
                                    setForm((f) => ({ ...f, cuit: formatted }));
                                  }
                                }
                              }}
                              state="modern"
                              fullWidth
                              placeholder={getDocumentPlaceholder(form.commerceDocumentType as DocumentType)}
                              disabled={!form.commerceDocumentType}
                              error={!!errors.cuit}
                            />
                          </Box>
                        </Box>
                        {errors.cuit && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.cuit}</Text>}
                      </Grid>

                      {/* Fila 2: Ubicación geográfica (de general a específica) - 3 columnas */}
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          País
                        </Typography>
                        <DropdownButton
                          options={countryOptions}
                          value={form.country || ''}
                          onChange={(option) => {
                            const selectedCountry = countries.find((c) => c.name === option.value);
                            if (selectedCountry) {
                              handleChange('country', selectedCountry.name);
                            }
                          }}
                          placeholder="Seleccionar país..."
                          renderValue={(option) => option ? option.label : ''}
                          fullWidth={true}
                          searchable={true}
                          sx={{
                            width: '100%',
                            '& button': {
                              height: '56px',
                              minHeight: '56px',
                              alignItems: 'center',
                              display: 'flex',
                              '& .MuiTypography-root': {
                                fontSize: '0.875rem !important',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                lineHeight: '1.5',
                              }
                            }
                          }}
                        />
                        {errors.country && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.country}</Text>}
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Provincia
                        </Typography>
                        <DropdownButton
                          options={[
                            { value: '', label: 'Seleccionar', native: 'Seleccionar' },
                            { value: 'Buenos Aires', label: 'Buenos Aires', native: 'Buenos Aires' },
                            { value: 'CABA', label: 'CABA', native: 'CABA' },
                            { value: 'Catamarca', label: 'Catamarca', native: 'Catamarca' },
                            { value: 'Chaco', label: 'Chaco', native: 'Chaco' },
                            { value: 'Chubut', label: 'Chubut', native: 'Chubut' },
                            { value: 'Córdoba', label: 'Córdoba', native: 'Córdoba' },
                            { value: 'Corrientes', label: 'Corrientes', native: 'Corrientes' },
                            { value: 'Entre Ríos', label: 'Entre Ríos', native: 'Entre Ríos' },
                            { value: 'Formosa', label: 'Formosa', native: 'Formosa' },
                            { value: 'Jujuy', label: 'Jujuy', native: 'Jujuy' },
                            { value: 'La Pampa', label: 'La Pampa', native: 'La Pampa' },
                            { value: 'La Rioja', label: 'La Rioja', native: 'La Rioja' },
                            { value: 'Mendoza', label: 'Mendoza', native: 'Mendoza' },
                            { value: 'Misiones', label: 'Misiones', native: 'Misiones' },
                            { value: 'Neuquén', label: 'Neuquén', native: 'Neuquén' },
                            { value: 'Río Negro', label: 'Río Negro', native: 'Río Negro' },
                            { value: 'Salta', label: 'Salta', native: 'Salta' },
                            { value: 'San Juan', label: 'San Juan', native: 'San Juan' },
                            { value: 'San Luis', label: 'San Luis', native: 'San Luis' },
                            { value: 'Santa Cruz', label: 'Santa Cruz', native: 'Santa Cruz' },
                            { value: 'Santa Fe', label: 'Santa Fe', native: 'Santa Fe' },
                            { value: 'Santiago del Estero', label: 'Santiago del Estero', native: 'Santiago del Estero' },
                            { value: 'Tierra del Fuego', label: 'Tierra del Fuego', native: 'Tierra del Fuego' },
                            { value: 'Tucumán', label: 'Tucumán', native: 'Tucumán' },
                          ]}
                          value={form.province || ''}
                          onChange={(option) => handleChange('province', option.value)}
                          placeholder="Seleccionar provincia..."
                          renderValue={(option) => option ? option.label : ''}
                          fullWidth={true}
                          searchable={true}
                          sx={{
                            width: '100%',
                            '& button': {
                              height: '56px',
                              minHeight: '56px',
                              alignItems: 'center',
                              display: 'flex',
                              '& .MuiTypography-root': {
                                fontSize: '0.875rem !important',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                lineHeight: '1.5',
                              }
                            }
                          }}
                        />
                        {errors.province && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.province}</Text>}
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Código postal
                        </Typography>
                        <Input
                          value={form.postalCode || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('postalCode', e.target.value)}
                          state="modern"
                          fullWidth
                          placeholder="C1234ABC"
                        />
                        {errors.postalCode && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.postalCode}</Text>}
                      </Grid>

                      {/* Fila 3: Dirección completa - ancho completo */}
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Dirección del comercio
                        </Typography>
                        <Input
                          value={form.address || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('address', e.target.value)}
                          state="modern"
                          fullWidth
                          placeholder="Av. Corrientes 1234, Depto 5B, Palermo"
                        />
                        {errors.address && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.address}</Text>}
                        <Text variant="small" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          introducir calle, número, Depto, barrio y/o localidad.
                        </Text>
                      </Grid>

                      {/* Fila 4: Información de contacto */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          E-mail del comercio
                        </Typography>
                        <Input
                          type="email"
                          value={form.businessEmail || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('businessEmail', e.target.value)}
                          state="modern"
                          fullWidth
                          placeholder="contacto@mitienda.com"
                          error={!!errors.businessEmail}
                        />
                        {errors.businessEmail && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.businessEmail}</Text>}
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <WebsiteInput
                          value={form.website || ''}
                          onChange={(value) => handleChange('website', value)}
                          placeholder="ejemplo.com"
                          error={!!errors.website}
                          label="Sitio web (opcional)"
                        />
                        {errors.website && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.website}</Text>}
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                      <Typography
                        component="label"
                        htmlFor="description"
                        sx={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#ffffff',
                          mb: 1,
                          fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                        }}
                      >
                        Descripción de la tienda
                      </Typography>
                      <Input
                        value={form.description || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange('description', e.target.value)}
                        state="modern"
                        id="description"
                        name="description"
                        placeholder="Write your message..."
                        multiline
                        rows={4}
                        fullWidth
                        advancedMode={true}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            minHeight: 'auto',
                            height: 'auto',
                            maxHeight: '224px',
                            alignItems: 'flex-start',
                            paddingTop: '16px',
                            paddingBottom: '16px',
                            backgroundColor: '#1f2937',
                            '& fieldset': {
                              borderColor: '#374151',
                            },
                            '&:hover fieldset': {
                              borderColor: '#22c55e',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#22c55e',
                              boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
                            },
                            '& textarea': {
                              padding: '0 16px',
                              fontSize: '0.875rem',
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                              lineHeight: '1.5',
                              maxHeight: '192px',
                              overflowY: 'auto',
                              color: '#ffffff',
                            },
                          },
                        }}
                      />
                      {errors.description && <Text variant="span" color="error" sx={{ fontSize: '0.875rem', mt: 0.5, display: 'block' }}>{errors.description}</Text>}
                    </Box>
                    <Stack direction="row" justifyContent="flex-start" sx={{ mt: 4 }}>
                      <Button
                        sx={{ px: 5 }}
                        onClick={handleSaveCommerceInfo}
                        disabled={isSavingCommerce}
                        isLoading={isSavingCommerce}
                      >
                        Guardar cambios
                      </Button>
                    </Stack>
                  </Box>
                )}
                  </Stack>
                  </Grid>
              </Grid>

          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ConfigurationPage;