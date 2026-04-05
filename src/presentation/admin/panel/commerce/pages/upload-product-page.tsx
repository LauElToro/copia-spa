"use client";

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Box, Container, Grid, IconButton, Typography, Switch as MuiSwitch, useTheme, useMediaQuery, Select, MenuItem } from "@mui/material";
import { AttachMoney, Close as CloseIcon, CloudUpload as CloudUploadIcon, PhotoCamera as PhotoCameraIcon, Description, Build, LocalOffer, CheckCircle, ArrowForward, NavigateNext, NavigateBefore } from "@mui/icons-material";
import { Input } from "@/presentation/@shared/components/ui/atoms/input";
import { CurrencyInput } from "@/presentation/@shared/components/ui/atoms/currency-input";
import { DropdownButton } from "@/presentation/@shared/components/ui/molecules/dropdown-button";
import type { DropdownButtonOption } from "@/presentation/@shared/components/ui/molecules/dropdown-button/types";
import { Radio } from "@/presentation/@shared/components/ui/atoms/radio";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { Stack } from "@/presentation/@shared/components/ui/molecules/stack";
import { Image } from '@/presentation/@shared/components/ui/atoms/image';
import { Breadcrumb } from '@/presentation/@shared/components/ui/molecules/breadcrumb/breadcrumb';
import { useUploadProduct } from '@/presentation/@shared/hooks/use-upload-product';
import { useProducts } from '@/presentation/@shared/hooks/use-products';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { useProductFormSteps } from '@/presentation/@shared/hooks/use-product-form-steps';
import { useImageUpload } from '@/presentation/@shared/hooks/use-image-upload';
import { StepIndicator } from '@/presentation/@shared/components/ui/atoms/step-indicator';
import { InfoBanner } from '@/presentation/@shared/components/ui/atoms/info-banner';
import { DynamicAttributes } from '@/presentation/@shared/components/ui/molecules/dynamic-attributes';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';

// Categorías dinámicas desde ms-products (fallback local para estado inicial)
const categoriesFallback = [ "Seleccionar categoría" ];
const promotions = [
  "Ninguna",
  ...Array.from({ length: 19 }, (_, i) => `Descuento ${ (i + 1) * 5 }%`)
];
const conditions = [ "Nuevo", "Usado", "Reacondicionado" ];

// Valores mock para edición (reservados para uso futuro en testing)
// const mockProduct = {
//   id: "2",
//   name: "MacBook Pro A1502 13.3",
//   description: "Laptop Apple en excelente estado, poco uso, incluye cargador original.",
//   promotion: "Descuento 10%",
//   category: "Electrónica",
//   condition: "Usado",
//   year: "2022",
//   images: [ null, null, null, null ] as ( File | null )[],
//   shipping: true,
//   priceUSDT: 12,
//   priceARS: 1200,
//   crypto: [ cryptos[ 0 ].id ],
//   stock: 3,
//   shippingWeight: 1,
//   shippingHeight: 1,
//   shippingWidth: 1,
//   shippingLength: 1,
//   promoReturn: "yes",
//   promoReturnInfo: "Información adicional de devolución",
//   promoShipping: "24hs",
//   promoShippingTime: "",
//   promoShippingInfo: "Información adicional de envio",
//   promoBanks: "yes",
//   promoBanksInfo: "Información adicional bancaria",
// };

export default function UploadProductPage( { id }: { readonly id: string; } ) {
  const { t } = useLanguage();
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    tabs,
    showInfo,
    form,
    technicalSheet,
    extraAttributes,
    loading,
    cryptos,
    createProduct,
    updateProduct,
    handleChange,
    handleSwitch,
    handleCryptoSelect,
    // handleDaysSelect,
    handleCloseInfo,
    addTechnicalAttribute,
    deleteTechnicalAttribute,
    handleChangeTechnicalAttribute,
    handleCoverImageChange,
    handleProductImagesChange,
    handleTabClick,
    handleSubmit,
    setTechnicalSheet,
    isFormValid,
  } = useUploadProduct(id);

  const { categories: categoriesQuery } = useProducts();

  // Configuración de archivos desde variables de entorno
  const ALLOWED_IMAGE_FORMATS = process.env.NEXT_PUBLIC_ALLOWED_IMAGE_FORMATS || 'image/jpeg,image/png';

  // Hook para manejar los pasos del formulario
  const {
    currentStep,
    prevStep,
    tab1Steps,
    handleNextStep,
    handlePrevStep,
    handleStepClick,
    isStepComplete,
    isStepIncomplete,
  } = useProductFormSteps({ tabs, form });

  // Hook para manejar la carga de imágenes
  const imageUpload = useImageUpload({
    coverImage: form.coverImage,
    productImages: form.productImages,
    onCoverImageChange: handleCoverImageChange,
    onProductImagesChange: handleProductImagesChange,
    onError: (message) => toast.error(message),
    maxProductImages: 6, // Hasta 6 imágenes totales
  });

  // Estado de envío del formulario
  const isSubmitting = loading || createProduct.isPending || (updateProduct?.isPending ?? false);

  /** Misma altura y tipografía que `Input` state="modern" (56px, 0.875rem) */
  const technicalUnitSelectSx = {
    width: '100%',
    height: '56px',
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderRadius: '4px',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#374151',
      borderWidth: '1px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#29C480',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#29C480',
      boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
    },
    '& .MuiSelect-select': {
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      lineHeight: 1.25,
      fontSize: '0.875rem',
      minHeight: 'unset',
    },
    '& .MuiSvgIcon-root': {
      color: '#ffffff',
      fontSize: '1.25rem',
    },
  } as const;

  // Estado para rastrear el tab activo anterior (para animaciones)
  const [prevActiveTab, setPrevActiveTab] = useState<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState<{ [key: string]: boolean }>({});
  const activeTabId = tabs.find(tab => tab.isActive)?.id || null;

  useEffect(() => {
    if (activeTabId && activeTabId !== prevActiveTab) {
      // Activar animación para el nuevo tab
      setShouldAnimate(prev => ({ ...prev, [activeTabId]: true }));
      // Resetear después de la animación
      setTimeout(() => {
        setShouldAnimate(prev => ({ ...prev, [activeTabId]: false }));
      }, 300);
      setPrevActiveTab(activeTabId);
    }
  }, [activeTabId, prevActiveTab]);

  // Notificaciones cuando se inicia la creación/actualización
  const prevIsSubmittingRef = useRef(false);
  useEffect(() => {
    // Solo mostrar notificación cuando cambia de false a true (inicio)
    if (isSubmitting && !prevIsSubmittingRef.current) {
      toast.info(id ? 'Actualizando producto...' : 'Creando producto...');
    }
    prevIsSubmittingRef.current = isSubmitting;
  }, [isSubmitting, id, toast]);

  // Notificaciones cuando se completa la creación del producto
  useEffect(() => {
    if (createProduct.isSuccess && createProduct.data) {
      const response = createProduct.data;
      let message = '¡Producto creado exitosamente!';

      // Si hay advertencia sobre las fotos, incluirla en el mensaje
      if (response.photosWarning) {
        message = `¡Producto creado exitosamente! ${response.photosWarning}`;
      }

      toast.success(message);
      createProduct.reset();
    }
  }, [createProduct.isSuccess, createProduct.data, toast, createProduct]);

  // Notificaciones cuando falla la creación del producto
  useEffect(() => {
    if (createProduct.isError && createProduct.error) {
      let errorMessage = 'Error al crear el producto. Intenta nuevamente.';

      // Extraer el mensaje del backend si está disponible
      const error = createProduct.error as {
        response?: {
          data?: {
            message?: string;
            detail?: string;
            error?: string;
          }
        };
        message?: string;
      };

      // Priorizar message, luego detail, luego error, luego el mensaje del error
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message;

      if (backendMessage) {
        errorMessage = backendMessage;
      }

      toast.error(errorMessage);
      createProduct.reset();
    }
  }, [createProduct.isError, createProduct.error, toast, createProduct]);

  // Notificaciones cuando se completa la actualización del producto
  useEffect(() => {
    if (updateProduct?.isSuccess) {
      toast.success('¡Producto actualizado exitosamente!');
      updateProduct.reset();
    }
  }, [updateProduct?.isSuccess, toast, updateProduct]);

  // Notificaciones cuando falla la actualización del producto
  useEffect(() => {
    if (updateProduct?.isError && updateProduct.error) {
      let errorMessage = 'Error al actualizar el producto. Intenta nuevamente.';

      // Extraer el mensaje del backend si está disponible
      const error = updateProduct.error as {
        response?: {
          data?: {
            message?: string;
            detail?: string;
            error?: string;
          }
        };
        message?: string;
      };

      // Priorizar message, luego detail, luego error, luego el mensaje del error
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message;

      if (backendMessage) {
        errorMessage = backendMessage;
      }

      toast.error(errorMessage);
      updateProduct.reset();
    }
  }, [updateProduct?.isError, updateProduct?.error, toast, updateProduct]);

  // Handlers para switches de promociones
  const handlePromoReturnSwitch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked ? "yes" : "no";
    const syntheticEvent = {
      target: {
        name: 'promoReturn',
        value: value,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(syntheticEvent);
  }, [handleChange]);

  const handlePromoBanksSwitch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked ? "yes" : "no";
    const syntheticEvent = {
      target: {
        name: 'promoBanks',
        value: value,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    handleChange(syntheticEvent);
  }, [handleChange]);

  // Handler para campos numéricos de envío (permite números y decimales)
  const handleNumericChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const fieldName = e.target.name;
    
    // Permitir números, punto decimal y un solo punto
    let numericValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    
    // Crear evento sintético con el valor filtrado
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: fieldName,
        value: numericValue,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    
    // Usar handleChange del hook
    handleChange(syntheticEvent);
  }, [handleChange]);

  // Estados locales para los campos numéricos (para mejor control)
  const [stockValue, setStockValue] = useState<string>(form.stock !== undefined && form.stock !== null ? String(form.stock) : '');
  const [yearValue, setYearValue] = useState<string>(form.year || '');

  // Sincronizar estados locales con el formulario
  useEffect(() => {
    // Manejar el caso cuando stock es 0 (que es un valor válido pero falsy)
    if (form.stock !== undefined && form.stock !== null) {
      setStockValue(String(form.stock));
    } else {
      setStockValue('');
    }
  }, [form.stock]);

  useEffect(() => {
    setYearValue(form.year || '');
  }, [form.year]);

  // Handler para stock (convierte a número)
  const handleStockChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');
    setStockValue(numericValue);

    // Actualizar el formulario
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'stock',
        value: numericValue,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    handleChange(syntheticEvent);
  }, [handleChange]);

  // Handler para year (mantiene como string)
  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');
    setYearValue(numericValue);

    // Actualizar el formulario
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'year',
        value: numericValue,
      },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    handleChange(syntheticEvent);
  }, [handleChange]);

  // Handler para campos numéricos de ficha técnica (dimensiones y peso)
  const handleTechnicalNumericChange = useCallback((field: string) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      // Determinar si se permiten decimales según la unidad
      const allowDecimals = 
        (field === 'weightValue' && (technicalSheet?.weightUnit === 'kg')) ||
        (field.startsWith('dimensions') && (technicalSheet?.dimensionsUnit === 'mts'));
      
      let numericValue: string;
      if (allowDecimals) {
        // Permitir números y punto decimal (un solo punto)
        numericValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      } else {
        // Solo números enteros
        numericValue = value.replace(/[^0-9]/g, '');
      }
      
      // Actualizar directamente el estado
      setTechnicalSheet((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: numericValue };
      });
    };
  }, [technicalSheet?.weightUnit, technicalSheet?.dimensionsUnit]);

  // Referencia para el contenedor del formulario (para scroll automático)
  const formContainerRef = useRef<HTMLFormElement>(null);

  // Función para hacer scroll al inicio del formulario
  const scrollToFormTop = useCallback(() => {
    if (formContainerRef.current) {
      const formTop = formContainerRef.current.offsetTop;
      const offset = 100; // Offset para dejar espacio arriba
      window.scrollTo({
        top: formTop - offset,
        behavior: 'smooth',
      });
    }
  }, []);

  // Función para validar si la solapa 2 (Ficha técnica) está completa
  const isTechnicalSheetComplete = useCallback((): boolean => {
    // Verificar si el tab 2 está habilitado (si está deshabilitado, no está completo)
    const tab2 = tabs.find(tab => tab.id === '2');
    if (tab2?.disabled) {
      return false;
    }
    // Si está habilitado, considerarlo completo
    return true;
  }, [tabs]);

  // Wrappers para las funciones de navegación con scroll
  const handleNextStepWithScroll = useCallback(() => {
    handleNextStep();
    setTimeout(() => {
      scrollToFormTop();
    }, 100);
  }, [handleNextStep, scrollToFormTop]);

  const handlePrevStepWithScroll = useCallback(() => {
    handlePrevStep();
    setTimeout(() => {
      scrollToFormTop();
    }, 100);
  }, [handlePrevStep, scrollToFormTop]);

  const handleStepClickWithScroll = useCallback((stepIndex: number) => {
    handleStepClick(stepIndex);
    setTimeout(() => {
      scrollToFormTop();
    }, 100);
  }, [handleStepClick, scrollToFormTop]);

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        width: "100%",
        backgroundColor: '#000000',
      }}
      id="uploadProduct"
    >
      {/* Global keyframes for animations */}
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInScale {
              0% {
                opacity: 0;
                transform: scale(0.8);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
            @keyframes shimmer {
              0% {
                left: -100%;
              }
              100% {
                left: 100%;
              }
            }
            @keyframes slideInRight {
              0% {
                transform: translateX(100%);
                opacity: 0;
              }
              100% {
                transform: translateX(0);
                opacity: 1;
              }
            }
            @keyframes slideOutLeft {
              0% {
                transform: translateX(0);
                opacity: 1;
              }
              100% {
                transform: translateX(-100%);
                opacity: 0;
              }
            }
            @keyframes slideInLeft {
              0% {
                transform: translateX(-100%);
                opacity: 0;
              }
              100% {
                transform: translateX(0);
                opacity: 1;
              }
            }
            @keyframes slideOutRight {
              0% {
                transform: translateX(0);
                opacity: 1;
              }
              100% {
                transform: translateX(100%);
                opacity: 0;
              }
            }
          `
        }}
      />
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 6, lg: 8 } }}>
        <Box sx={{ px: { xs: 3, md: 0 } }}>
          <Stack spacing={3}>
            <Breadcrumb
              items={[
                { label: t.admin?.panel || 'Panel', href: '/admin/panel/home' },
                { label: id ? 'Editar Producto' : 'Subir Producto' }
              ]}
            />

            {/* Tabs modernos */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 1 : 0,
                mb: 4,
                alignItems: 'center',
                flexWrap: 'nowrap',
                width: isMobile ? '100%' : 'auto',
                overflowX: isMobile ? 'auto' : 'visible',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              {tabs.map((tab, index) => (
                <RenderTabs
                  key={`tab-${tab.id}`}
                  id={tab.id}
                  label={tab.label}
                  isActive={tab.isActive}
                  onClick={() => handleTabClick(tab.id)}
                  disabled={isSubmitting} // Solo deshabilitar durante el envío, no por validaciones
                  isFirst={index === 0}
                  isLast={index === tabs.length - 1}
                  isMobile={isMobile}
                />
              ))}
            </Box>

            <form
              ref={formContainerRef}
              onSubmit={ handleSubmit }
            >
          {/* Características principales */}
          {tabs[0].isActive && (
            <Box sx={{ opacity: isSubmitting ? 0.6 : 1, pointerEvents: isSubmitting ? 'none' : 'auto' }}>
              {/* Indicador de progreso */}
              <StepIndicator
                steps={tab1Steps}
                currentStep={currentStep}
                onStepClick={handleStepClickWithScroll}
                isStepComplete={isStepComplete}
                isStepIncomplete={isStepIncomplete}
              />

              {showInfo && currentStep === 0 && (
                <InfoBanner
                  title="Importante"
                  description="Hola 👋 Completar esta ficha no es un trámite: es la clave para que vendas más en Liberty Club."
                  items={[
                    { text: 'Vas a aparecer más en las búsquedas.' },
                    { text: 'Vas a conseguir más clics y visitas.' },
                    { text: 'Vas a convertir más en ventas.' },
                  ]}
                  tip="¿Dudas? Libia (tu IA en el panel) organiza y optimiza la ficha por vos."
                  onClose={handleCloseInfo}
                  show={showInfo}
                />
              )}

              {/* Card de Características principales - Paso 0 */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                }}
              >
                {(currentStep === 0 || prevStep === 0) && (
                  <Box
                    sx={{
                      position: currentStep === 0 ? 'relative' : 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      zIndex: currentStep === 0 ? 2 : 1,
                      transform: prevStep === 0 && currentStep !== 0
                        ? 'scale(0.8)'
                        : currentStep === 0 && prevStep !== null
                        ? 'scale(1)'
                        : currentStep === 0
                        ? 'scale(1)'
                        : 'scale(0.8)',
                      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out',
                      opacity: currentStep === 0 ? 1 : (prevStep === 0 ? 0 : 0),
                      animation: currentStep === 0
                        ? 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        : 'none',
                    }}
                  >
            <Box
                  sx={{
                    position: 'relative',
                    mb: 0,
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                  backgroundColor: "rgba(41, 196, 128, 0.08)",
                  border: "2px solid rgba(41, 196, 128, 0.2)",
                borderRadius: "24px",
                padding: { xs: 3, md: 4 },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(41, 196, 128, 0.12)",
                    borderColor: "rgba(41, 196, 128, 0.4)",
                  },
              }}
            >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Características principales
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                {/* Fila 1: Información básica del producto */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography
                    component="label"
                    htmlFor="name"
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
                    type="text"
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    state="modern"
                    required
                    placeholder="Nombre del producto"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography
                    component="label"
                    htmlFor="category"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Categoría
                  </Typography>
                  <DropdownButton
                    options={(() => {
                      const categories = categoriesQuery.data?.length
                        ? categoriesQuery.data.map((c: { name: string }) => ({ value: c.name, label: c.name, native: c.name }))
                        : categoriesFallback.map(c => ({ value: c, label: c, native: c }));

                      // Asegurar que "Seleccionar categoría" esté siempre presente como primera opción
                      // pero solo si no está ya en las opciones
                      const hasDefaultOption = categories.some(c => c.value === 'Seleccionar categoría');
                      const finalCategories = hasDefaultOption
                        ? categories
                        : [{ value: 'Seleccionar categoría', label: 'Seleccionar categoría', native: 'Seleccionar categoría' }, ...categories];

                      return finalCategories;
                    })()}
                    value={form.category || ''}
                    onChange={(option: DropdownButtonOption) => {
                      const syntheticEvent = {
                        target: {
                          value: option.value,
                          name: 'category',
                        },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleChange(syntheticEvent);
                    }}
                    placeholder="Seleccionar categoría"
                    renderValue={(option) => option ? option.label : ''}
                    fullWidth={true}
                    searchable={true}
                    sx={{
                      width: '100%',
                      '& button': {
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        height: '56px',
                        minHeight: '56px',
                        fontSize: '0.875rem',
                        color: '#ffffff',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#22c55e',
                        },
                        '&:focus': {
                          borderColor: '#22c55e',
                          boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography
                    component="label"
                    htmlFor="condition"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Condición
                  </Typography>
                  <DropdownButton
                    options={conditions.map(c => ({ value: c, label: c, native: c }))}
                    value={form.condition || ''}
                    onChange={(option: DropdownButtonOption) => {
                      const syntheticEvent = {
                        target: {
                          value: option.value,
                          name: 'condition',
                        },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleChange(syntheticEvent);
                    }}
                    placeholder="Seleccionar condición"
                    renderValue={(option) => option ? option.label : ''}
                    fullWidth={true}
                    searchable={true}
                    sx={{
                      width: '100%',
                      '& button': {
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        height: '56px',
                        minHeight: '56px',
                        fontSize: '0.875rem',
                        color: '#ffffff',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#22c55e',
                        },
                        '&:focus': {
                          borderColor: '#22c55e',
                          boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Fila 2: Descripción (ocupa todo el ancho) */}
                <Grid size={{ xs: 12 }}>
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
                    Descripción
                  </Typography>
                  <Input
                  value={ form.description }
                  onChange={ handleChange }
                    state="modern"
                  id="description"
                  name="description"
                    placeholder="Describe tu producto"
                    required
                    multiline
                    rows={4}
                    fullWidth
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
                </Grid>

                {/* Fila 3: Inventario y año */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    component="label"
                    htmlFor="stock"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Cantidad
                  </Typography>
                  <Input
                    type="text"
                      name="stock"
                      id="stock"
                      value={stockValue}
                    onChange={handleStockChange}
                    inputProps={{
                      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                        // Permitir números, teclas de control y navegación
                        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                        const isNumber = /[0-9]/.test(e.key);
                        const isAllowedKey = allowedKeys.includes(e.key);
                        const isControlKey = e.ctrlKey || e.metaKey;

                        if (!isNumber && !isAllowedKey && !isControlKey) {
                          e.preventDefault();
                        }
                      },
                      onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        const numericOnly = pastedText.replace(/[^0-9]/g, '');
                        if (numericOnly) {
                          setStockValue(numericOnly);
                          const syntheticEvent = {
                            target: {
                              name: 'stock',
                              value: numericOnly,
                            },
                          } as React.ChangeEvent<HTMLInputElement>;
                          handleChange(syntheticEvent);
                        }
                      },
                    }}
                    state="modern"
                      required
                    placeholder="Escribe la cantidad de tu producto"
                    fullWidth
                    inputMode="numeric"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    component="label"
                    htmlFor="year"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Año del producto
                  </Typography>
                  <Input
                    type="text"
                    name="year"
                    id="year"
                    value={yearValue}
                    onChange={handleYearChange}
                    inputProps={{
                      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                        // Permitir números, teclas de control y navegación
                        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                        const isNumber = /[0-9]/.test(e.key);
                        const isAllowedKey = allowedKeys.includes(e.key);
                        const isControlKey = e.ctrlKey || e.metaKey;

                        if (!isNumber && !isAllowedKey && !isControlKey) {
                          e.preventDefault();
                        }
                      },
                      onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        const numericOnly = pastedText.replace(/[^0-9]/g, '');
                        if (numericOnly) {
                          setYearValue(numericOnly);
                          const syntheticEvent = {
                            target: {
                              name: 'year',
                              value: numericOnly,
                            },
                          } as React.ChangeEvent<HTMLInputElement>;
                          handleChange(syntheticEvent);
                        }
                      },
                    }}
                    state="modern"
                    required
                    placeholder="Ingresar el año de producción del producto"
                    fullWidth
                    inputMode="numeric"
                  />
                </Grid>

                {/* Fila 4: Promoción (opcional) */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography
                    component="label"
                    htmlFor="promotion"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Promoción (Opcional)
                  </Typography>
                  <DropdownButton
                    options={promotions.map(p => ({ value: p, label: p, native: p }))}
                    value={form.promotion || ''}
                    onChange={(option: DropdownButtonOption) => {
                      const syntheticEvent = {
                        target: {
                          value: option.value,
                          name: 'promotion',
                        },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleChange(syntheticEvent);
                    }}
                    placeholder="Seleccionar promoción"
                    renderValue={(option) => option ? option.label : ''}
                    fullWidth={true}
                    searchable={true}
                    sx={{
                      width: '100%',
                      '& button': {
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        height: '56px',
                        minHeight: '56px',
                        fontSize: '0.875rem',
                        color: '#ffffff',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#22c55e',
                        },
                        '&:focus': {
                          borderColor: '#22c55e',
                          boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
              </Box>
            </Box>
                )}
              </Box>

              {/* Card de Imágenes - Paso 1 */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                }}
              >
                {(currentStep === 1 || prevStep === 1) && (
                  <Box
                    sx={{
                      position: currentStep === 1 ? 'relative' : 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      zIndex: currentStep === 1 ? 2 : 1,
                      transform: prevStep === 1 && currentStep !== 1
                        ? 'scale(0.8)'
                        : currentStep === 1 && prevStep !== null
                        ? 'scale(1)'
                        : currentStep === 1
                        ? 'scale(1)'
                        : 'scale(0.8)',
                      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out',
                      opacity: currentStep === 1 ? 1 : (prevStep === 1 ? 0 : 0),
                      animation: (currentStep === 1 && prevStep !== null)
                        ? 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        : 'none',
                    }}
                  >
              <Box
                sx={{
                  position: 'relative',
                  mb: 0,
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                  backgroundColor: "rgba(41, 196, 128, 0.08)",
                  border: "2px solid rgba(41, 196, 128, 0.2)",
                  borderRadius: "24px",
                  padding: { xs: 3, md: 4 },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(41, 196, 128, 0.12)",
                    borderColor: "rgba(41, 196, 128, 0.4)",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    fontWeight: 700,
                    color: '#34d399',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    mb: 3,
                  }}
                >
                  Imágenes
                </Typography>

              <Grid container spacing={3}>
                {/* Grid unificado para todas las imágenes/videos */}
                <Grid size={{ xs: 12 }}>
              {/* Fotos del producto (hasta 6 imágenes O 5 imágenes + 1 video, mínimo 1 imagen o 1 video) */}
              <Box>
                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#ffffff',
                    mb: 3,
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Fotos del producto
                </Typography>
                
                {/* Combinar portada y productImages en un solo array para mostrar */}
                {(() => {
                  const allPreviews: string[] = [];
                  const allFiles: (File | null)[] = [];
                  
                  // Agregar portada si existe
                  if (imageUpload.coverPreview) {
                    allPreviews.push(imageUpload.coverPreview);
                    allFiles.push(form.coverImage instanceof File ? form.coverImage : null);
                  }
                  
                  // Agregar productImages (asegurar que productPreviews sea un array)
                  const productPreviews = Array.isArray(imageUpload.productPreviews) ? imageUpload.productPreviews : [];
                  const productImages = Array.isArray(form.productImages) ? form.productImages : [];
                  productPreviews.forEach((preview, idx) => {
                    allPreviews.push(preview);
                    allFiles.push(productImages[idx] || null);
                  });
                  
                  const maxItems = 6; // Hasta 6 imágenes
                  const currentCount = allPreviews.length;
                  
                  return (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {/* Mostrar todas las imágenes/videos */}
                      {allPreviews.map((preview: string, index: number) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`media-preview-${index}`}>
                          <Box
                            sx={{
                              position: 'relative',
                              width: '100%',
                              paddingTop: '100%',
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '3px solid',
                              borderColor: index === 0 ? '#34d399' : '#22c55e', // Primera imagen (portada) con borde más destacado
                              boxShadow: index === 0 ? '0 4px 20px rgba(52, 211, 153, 0.3)' : '0 2px 10px rgba(34, 197, 94, 0.2)',
                            }}
                          >
                            <Image
                              src={preview}
                              alt={index === 0 ? 'Portada' : `Producto ${index}`}
                              width={200}
                              height={200}
                              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {index === 0 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  left: 4,
                                  backgroundColor: '#34d399',
                                  color: '#000',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  zIndex: 2,
                                }}
                              >
                                Portada
                              </Box>
                            )}
                            <IconButton
                              onClick={() => {
                                // Liberar URL del objeto antes de eliminar
                                if (preview && preview.startsWith('blob:')) {
                                  URL.revokeObjectURL(preview);
                                }
                                
                                if (index === 0) {
                                  // Eliminar portada
                                  handleCoverImageChange([]);
                                  if (imageUpload.coverInputRef.current) imageUpload.coverInputRef.current.value = '';
                                } else {
                                  // Eliminar imagen de producto (ajustar índice porque portada no está en productImages)
                                  const productIndex = index - (form.coverImage ? 1 : 0);
                                  const currentImages = Array.isArray(form.productImages) ? form.productImages : [];
                                  const newFiles = currentImages.filter((_, i) => i !== productIndex);
                                  handleProductImagesChange(newFiles);
                                }
                              }}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                width: 28,
                                height: 28,
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                                '&:hover': {
                                  backgroundColor: '#dc2626',
                                  transform: 'scale(1.1)',
                                },
                              }}
                              size="small"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                      
                      {/* Botón para agregar más (si hay espacio) */}
                      {currentCount < maxItems && (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                          <Box
                            component="label"
                            onDragEnter={imageUpload.handleDragInProduct}
                            onDragLeave={imageUpload.handleDragOutProduct}
                            onDragOver={imageUpload.handleDragProduct}
                            onDrop={imageUpload.handleDropProduct}
                            sx={{
                              width: '100%',
                              paddingTop: '100%',
                              position: 'relative',
                              border: '2px dashed',
                              borderColor: imageUpload.dragActiveProduct ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                              borderRadius: 2,
                              backgroundColor: imageUpload.dragActiveProduct ? 'rgba(52, 211, 153, 0.05)' : 'rgba(0, 0, 0, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: '#34d399',
                                backgroundColor: 'rgba(52, 211, 153, 0.05)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 20px rgba(52, 211, 153, 0.2)',
                              },
                            }}
                          >
                            <input
                              ref={currentCount === 0 ? imageUpload.coverInputRef : imageUpload.productInputRef}
                              type="file"
                              accept={ALLOWED_IMAGE_FORMATS}
                              multiple={currentCount > 0}
                              hidden
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                
                                if (currentCount === 0) {
                                  // Si no hay imágenes, la primera es la portada
                                  const file = files[0];
                                  if (file) {
                                    imageUpload.validateAndProcessImage(
                                      file,
                                      (preview: string, processedFile: File) => {
                                        handleCoverImageChange([processedFile]);
                                      },
                                      (error: string) => {
                                        toast.error(error);
                                        if (imageUpload.coverInputRef.current) imageUpload.coverInputRef.current.value = '';
                                      }
                                    );
                                  }
                                } else {
                                  // Agregar a productImages
                                  const remainingSlots = maxItems - currentCount;
                                  const filesToProcess = files.slice(0, remainingSlots);
                                  const currentImages = Array.isArray(form.productImages) ? form.productImages : [];

                                  let processedCount = 0;
                                  const validFiles: File[] = [];
                                  const validPreviews: string[] = [];
                                  const errors: string[] = [];

                                  const processFile = (file: File) => {
                                    imageUpload.validateAndProcessImage(
                                      file,
                                      (preview, processedFile) => {
                                        validFiles.push(processedFile);
                                        validPreviews.push(preview);
                                        processedCount++;

                                        if (processedCount === filesToProcess.length) {
                                          if (errors.length > 0) {
                                            errors.forEach(error => toast.error(error));
                                          }

                                          if (validFiles.length > 0) {
                                            handleProductImagesChange([...currentImages, ...validFiles]);
                                          }
                                        }
                                      },
                                      (error) => {
                                        errors.push(error);
                                        processedCount++;

                                        if (processedCount === filesToProcess.length) {
                                          if (errors.length > 0) {
                                            errors.forEach(error => toast.error(error));
                                          }

                                          if (validFiles.length > 0) {
                                            handleProductImagesChange([...currentImages, ...validFiles]);
                                          }
                                        }
                                      }
                                    );
                                  };

                                  filesToProcess.forEach((file) => {
                                    processFile(file);
                                  });
                                }
                                
                                if (currentCount === 0 && imageUpload.coverInputRef.current) {
                                  imageUpload.coverInputRef.current.value = '';
                                } else if (imageUpload.productInputRef.current) {
                                  imageUpload.productInputRef.current.value = '';
                                }
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              {imageUpload.dragActiveProduct ? (
                                <CloudUploadIcon sx={{ fontSize: 32, color: '#34d399' }} />
                              ) : (
                                <PhotoCameraIcon sx={{ fontSize: 32, color: '#34d399' }} />
                              )}
                              <Typography
                                sx={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  textAlign: 'center',
                                }}
                              >
                                {imageUpload.dragActiveProduct ? 'Soltar' : 'Agregar'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  );
                })()}
                
                <Typography
                  component="p"
                  sx={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textAlign: 'center',
                    width: '100%',
                    mt: 2,
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Formatos: JPG o PNG. Máximo 2MB por imagen. Dimensiones máximas 2500×2500px. Máximo 6 imágenes. La primera imagen será la portada.
                </Typography>
              </Box>
                </Grid>
              </Grid>
              </Box>
                  </Box>
                )}
              </Box>

              {/* Card de Precio - Paso 2 */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                }}
              >
                {(currentStep === 2 || prevStep === 2) && (
                  <Box
                    sx={{
                      position: currentStep === 2 ? 'relative' : 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      zIndex: currentStep === 2 ? 2 : 1,
                      transform: prevStep === 2 && currentStep !== 2
                        ? 'scale(0.8)'
                        : currentStep === 2 && prevStep !== null
                        ? 'scale(1)'
                        : currentStep === 2
                        ? 'scale(1)'
                        : 'scale(0.8)',
                      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out',
                      opacity: currentStep === 2 ? 1 : (prevStep === 2 ? 0 : 0),
                      animation: (currentStep === 2 && prevStep !== null)
                        ? 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        : 'none',
                    }}
                  >
              <Box
                sx={{
                  position: 'relative',
                  mb: 0,
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                  backgroundColor: "rgba(41, 196, 128, 0.08)",
                  border: "2px solid rgba(41, 196, 128, 0.2)",
                  borderRadius: "24px",
                  padding: { xs: 3, md: 4 },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(41, 196, 128, 0.12)",
                    borderColor: "rgba(41, 196, 128, 0.4)",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    fontWeight: 700,
                    color: '#34d399',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    mb: 3,
                  }}
                >
                  Establecer precio del producto
                </Typography>

              <Grid container spacing={3}>
                {/* Primera columna: Seleccionar moneda */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography
                    component="label"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 2,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Seleccionar moneda
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {cryptos.map(c => {
                      const isSelected = form.crypto.includes(c.id);
                      const isDisabled = c.id === 1; // USDT siempre está seleccionado
                      return (
                        <Box
                          key={c.label}
                          onClick={() => !isDisabled && handleCryptoSelect(c.id)}
                          sx={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            flex: 1,
                            minHeight: '56px',
                            py: 1.5,
                            px: 2,
                            borderRadius: '4px',
                            background: isSelected
                              ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)'
                              : 'rgba(255, 255, 255, 0.05)',
                            border: isSelected
                              ? '1px solid #34d399'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: isDisabled ? 'default' : 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: isDisabled ? 0.6 : 1,
                            '&:hover': !isDisabled ? {
                              background: isSelected
                                ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.25) 0%, rgba(52, 211, 153, 0.15) 100%)'
                                : 'rgba(255, 255, 255, 0.08)',
                              borderColor: isSelected ? '#34d399' : 'rgba(255, 255, 255, 0.2)',
                            } : {},
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '8px',
                              background: isSelected
                                ? 'rgba(52, 211, 153, 0.15)'
                                : 'rgba(255, 255, 255, 0.05)',
                              mr: 1.5,
                              flexShrink: 0,
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {c.id === 1 ? (
                              <Box
                                component="img"
                                src="/store-vector/usdt.svg"
                                alt="USDT"
                                sx={{
                                  width: 20,
                                  height: 20,
                                  filter: isSelected ? 'none' : 'opacity(0.7)',
                                  transition: 'filter 0.3s ease',
                                  display: 'block',
                                  objectFit: 'contain',
                                  margin: 0,
                                  padding: 0,
                                }}
                              />
                            ) : (
                              <AttachMoney
                                sx={{
                                  fontSize: '1.25rem',
                                  color: isSelected ? '#34d399' : 'rgba(255, 255, 255, 0.7)',
                                  transition: 'color 0.3s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  lineHeight: 1,
                                }}
                              />
                            )}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: isSelected ? '#34d399' : '#ffffff',
                              fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                              transition: 'color 0.3s ease',
                              flex: 1,
                            }}
                          >
                            {c.label}
                          </Typography>
                          {isSelected && (
                            <CheckCircle
                              sx={{
                                fontSize: '1.125rem',
                                color: '#34d399',
                                ml: 1,
                                flexShrink: 0,
                                filter: 'drop-shadow(0 2px 4px rgba(52, 211, 153, 0.4))',
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
              </Stack>
                </Grid>

                {/* Segunda columna: Precio en USDT */}
                <Grid size={{ xs: 12, md: form.crypto.includes(2) ? 4 : 8 }}>
                  <Typography
                    component="label"
                    htmlFor="priceUSDT"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#ffffff',
                      mb: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                    }}
                  >
                    Precio en USDT
                  </Typography>
                  <CurrencyInput
                    name="priceUSDT"
                    id="priceUSDT"
                    value={form.priceUSDT}
                    onChange={handleChange}
                    state="modern"
                    required
                    placeholder="Establece el precio de tu producto en USDT..."
                    fullWidth
                  />
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      mt: 1,
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                Este valor es el precio principal en cripto y se guarda como USDT.
                  </Typography>
                </Grid>

                {/* Tercera columna: Precio en ARS - Solo se muestra si ARS está habilitado */}
              {form.crypto.includes(2) && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography
                      component="label"
                      htmlFor="priceARS"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Precio en ARS
                    </Typography>
                    <CurrencyInput
                      name="priceARS"
                      id="priceARS"
                      value={form.priceARS}
                      onChange={handleChange}
                      state="modern"
                      required
                      placeholder="Establece el precio de tu producto en ARS..."
                      fullWidth
                    />
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        mt: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                    Este valor es el precio principal en Fiat y se guarda como AR$.
                    </Typography>
                  </Grid>
              )}
              </Grid>
              </Box>
                </Box>
              )}
              </Box>

              {/* Card de Envío a domicilio - Paso 3 */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                }}
              >
                {(currentStep === 3 || prevStep === 3) && (
                  <Box
                    sx={{
                      position: currentStep === 3 ? 'relative' : 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      zIndex: currentStep === 3 ? 2 : 1,
                      transform: prevStep === 3 && currentStep !== 3
                        ? 'scale(0.8)'
                        : currentStep === 3 && prevStep !== null
                        ? 'scale(1)'
                        : currentStep === 3
                        ? 'scale(1)'
                        : 'scale(0.8)',
                      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out',
                      opacity: currentStep === 3 ? 1 : (prevStep === 3 ? 0 : 0),
                      animation: (currentStep === 3 && prevStep !== null)
                        ? 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        : 'none',
                    }}
                  >
              <Box
                sx={{
                  position: 'relative',
                  mb: 0,
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                  backgroundColor: "rgba(41, 196, 128, 0.08)",
                  border: "2px solid rgba(41, 196, 128, 0.2)",
                  borderRadius: "24px",
                  padding: { xs: 3, md: 4 },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(41, 196, 128, 0.12)",
                    borderColor: "rgba(41, 196, 128, 0.4)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'flex-start' },
                    gap: 2,
                    mb: form.shipping ? 4 : 0,
                  }}
                >
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        fontWeight: 700,
                        color: '#34d399',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      Envío a domicilio (Opcional)
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                    Al habilitarlo, este producto recibirá envíos.
                    </Typography>
                </Stack>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      pt: { xs: 0, md: 0.5 },
                    }}
                  >
                    <MuiSwitch
                      checked={form.shipping}
                      onChange={handleSwitch}
                      id="shippingSwitch"
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase': {
                          '&.Mui-checked': {
                            color: '#fff',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#34d399',
                              opacity: 1,
                              border: 0,
                            },
                            '& .MuiSwitch-thumb': {
                              backgroundColor: '#fff',
                            },
                          },
                        },
                        '& .MuiSwitch-thumb': {
                          backgroundColor: '#fff',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        },
                        '& .MuiSwitch-track': {
                          borderRadius: 12,
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          opacity: 1,
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        },
                      }}
                    />
                  </Box>
                </Box>

              {form.shipping && (
                <Grid container spacing={3} sx={{ mt: 3 }}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography
                      component="label"
                      htmlFor="shippingWeight"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Peso del paquete (kg)
                    </Typography>
                    <Input
                      type="text"
                      name="shippingWeight"
                      id="shippingWeight"
                      value={typeof form.shippingWeight === 'string' ? form.shippingWeight : (form.shippingWeight ? String(form.shippingWeight) : '')}
                      onChange={handleNumericChange}
                      state="modern"
                      required
                      placeholder="Peso del paquete (kg)"
                      fullWidth
                      inputMode="decimal"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography
                      component="label"
                      htmlFor="shippingHeight"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Altura del paquete (cm)
                    </Typography>
                    <Input
                      type="text"
                      name="shippingHeight"
                      id="shippingHeight"
                      value={typeof form.shippingHeight === 'string' ? form.shippingHeight : (form.shippingHeight ? String(form.shippingHeight) : '')}
                      onChange={handleNumericChange}
                      state="modern"
                      required
                      placeholder="Altura del paquete (cm)"
                      fullWidth
                      inputMode="decimal"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography
                      component="label"
                      htmlFor="shippingWidth"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Ancho del paquete (cm)
                    </Typography>
                    <Input
                      type="text"
                      name="shippingWidth"
                      id="shippingWidth"
                      value={typeof form.shippingWidth === 'string' ? form.shippingWidth : (form.shippingWidth ? String(form.shippingWidth) : '')}
                      onChange={handleNumericChange}
                      state="modern"
                      required
                      placeholder="Ancho del paquete (cm)"
                      fullWidth
                      inputMode="decimal"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography
                      component="label"
                      htmlFor="shippingLength"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Largo del paquete (cm)
                    </Typography>
                    <Input
                      type="text"
                      name="shippingLength"
                      id="shippingLength"
                      value={typeof form.shippingLength === 'string' ? form.shippingLength : (form.shippingLength ? String(form.shippingLength) : '')}
                      onChange={handleNumericChange}
                      state="modern"
                      required
                      placeholder="Largo del paquete (cm)"
                      fullWidth
                      inputMode="decimal"
                    />
                  </Grid>
                </Grid>
              )}
              </Box>
            </Box>
                )}

              {/* Controlador de navegación - Siempre visible */}
              <Box
                sx={{
                  position: 'relative',
                  mt: 3,
                  mb: 3,
                }}
              >
                <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    {currentStep !== 0 && (
                      <Button
                        onClick={handlePrevStepWithScroll}
                        sx={{
                          width: { xs: '100%', sm: 'auto' },
                          minWidth: { xs: '100%', sm: 150 },
                          maxWidth: { xs: '100%', sm: 150 },
                          px: 4,
                          py: 1.5,
                          backgroundColor: "#29C480",
                          color: "#1e293b",
                          fontWeight: 600,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "1rem",
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          '&:hover:not(:disabled)': {
                            backgroundColor: "#ffffff",
                            color: "#000000",
                            '& .MuiSvgIcon-root': {
                              transform: "translateX(-4px)",
                            },
                          },
                          '& .MuiSvgIcon-root': {
                            transition: "transform 0.3s ease",
                            color: "#1e293b",
                          },
                        }}
                      >
                        <NavigateBefore sx={{ mr: 0.5, fontSize: 18 }} />
                        Anterior
                      </Button>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: currentStep === 0 ? 'flex-start' : 'center',
                        flex: currentStep === 0 ? '0 0 auto' : 1,
                        gap: { xs: 1, sm: 2 },
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      }}
                    >
                      {tab1Steps.map((step, index) => {
                        const isActive = index === currentStep;
                        const stepComplete = isStepComplete(index);
                        const stepIncomplete = isStepIncomplete(index);

                        return (
                          <React.Fragment key={step.id}>
                            <Box
                              onClick={() => handleStepClickWithScroll(index)}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                                gap: 1,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  '& .step-icon': {
                                    backgroundColor: isActive ? '#29C480' : '#ffffff',
                                    borderColor: isActive ? '#29C480' : '#ffffff',
                                    '& .step-number, & .step-check': {
                                      color: isActive ? '#1e293b' : '#000000',
                                    },
                                  },
                                  '& .step-label': {
                                    color: isActive ? '#29C480' : '#ffffff',
                                  },
                                },
                              }}
                            >
                              {/* Icono circular del paso */}
                              <Box
                                className="step-icon"
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: isActive
                                    ? '#29C480'
                                    : stepComplete
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : stepIncomplete
                                    ? 'rgba(255, 255, 255, 0.15)'
                                    : 'rgba(255, 255, 255, 0.3)',
                                  border: isActive
                                    ? '2px solid #29C480'
                                    : stepComplete
                                    ? '2px solid rgba(255, 255, 255, 0.1)'
                                    : '2px solid rgba(255, 255, 255, 0.3)',
                                  transition: 'all 0.3s ease',
                                  boxShadow: isActive
                                    ? '0 0 12px rgba(41, 196, 128, 0.5)'
                                    : 'none',
                                }}
                              >
                                {stepComplete ? (
                                  <CheckCircle
                                    className="step-check"
                                    sx={{
                                      color: 'rgba(255, 255, 255, 0.6)',
                                      fontSize: 20,
                                      transition: 'color 0.3s ease',
                                    }}
                                  />
                                ) : (
                                  <Typography
                                    className="step-number"
                                    sx={{
                                      color: isActive ? '#1e293b' : stepIncomplete ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                                      fontSize: '0.875rem',
                                      fontWeight: 600,
                                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                      transition: 'color 0.3s ease',
                                    }}
                                  >
                                    {index + 1}
                                  </Typography>
                                )}
                              </Box>

                              {/* Label del paso */}
                              <Typography
                                className="step-label"
                                sx={{
                                  fontSize: '0.75rem',
                                  color: isActive
                                    ? '#29C480'
                                    : stepComplete
                                    ? 'rgba(255, 255, 255, 0.4)'
                                    : 'rgba(255, 255, 255, 0.7)',
                                  fontWeight: isActive ? 600 : 400,
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                  transition: 'color 0.3s ease',
                                  textAlign: 'center',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {step.label}
                              </Typography>
                            </Box>

                            {/* Línea conectora */}
                            {index < tab1Steps.length - 1 && (
                              <Box
                                sx={{
                                  width: { xs: 0, sm: 40 },
                                  height: { xs: 20, sm: 2 },
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  transition: 'all 0.3s ease',
                                  borderRadius: 1,
                                  mx: { xs: 0, sm: 0.5 },
                                }}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </Box>

                    {currentStep < tab1Steps.length - 1 ? (
                      <Button
                        onClick={handleNextStepWithScroll}
                        sx={{
                          width: { xs: '100%', sm: 'auto' },
                          minWidth: { xs: '100%', sm: 150 },
                          maxWidth: { xs: '100%', sm: 150 },
                          px: 4,
                          py: 1.5,
                          backgroundColor: "#29C480",
                          color: "#1e293b",
                          fontWeight: 600,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "1rem",
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          '&:hover': {
                            backgroundColor: "#ffffff",
                            color: "#000000",
                            '& .MuiSvgIcon-root': {
                              transform: "translateX(4px)",
                            },
                          },
                          '& .MuiSvgIcon-root': {
                            transition: "transform 0.3s ease",
                          },
                        }}
                      >
                        Siguiente
                        <NavigateNext sx={{ ml: 0.5, fontSize: 18 }} />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        isLoading={isSubmitting}
                        disabled={isSubmitting || !isFormValid()}
                        sx={{
                          width: { xs: '100%', sm: 'auto' },
                          minWidth: { xs: '100%', sm: 200 },
                          maxWidth: { xs: '100%', sm: 200 },
                          px: 4,
                          py: 1.5,
                          backgroundColor: "#29C480",
                          color: "#1e293b",
                          fontWeight: 600,
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "1rem",
                          transition: "background-color 0.3s ease, color 0.3s ease",
                          '&:hover:not(:disabled)': {
                            backgroundColor: "#ffffff",
                            color: "#000000",
                            '& .MuiSvgIcon-root': {
                              transform: "translateX(4px)",
                            },
                          },
                          '& .MuiSvgIcon-root': {
                            transition: "transform 0.3s ease",
                          },
                        }}
                      >
                        Continuar
                        <ArrowForward sx={{ ml: 0.5, fontSize: 18 }} />
                      </Button>
                    )}
                  </Box>
              </Box>
            </Box>
            </Box>
          )}

          {/* Ficha técnica */}
          {tabs[1].isActive && (
            <Box sx={{ opacity: isSubmitting ? 0.6 : 1, pointerEvents: isSubmitting ? 'none' : 'auto' }}>
              <Box
                sx={{
                  position: 'relative',
                  mb: 0,
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                  backgroundColor: "rgba(41, 196, 128, 0.08)",
                  border: "2px solid rgba(41, 196, 128, 0.2)",
                  borderRadius: "24px",
                  padding: { xs: 3, md: 4 },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: shouldAnimate['2']
                    ? 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    : 'none',
                  "&:hover": {
                    backgroundColor: "rgba(41, 196, 128, 0.12)",
                    borderColor: "rgba(41, 196, 128, 0.4)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Ficha técnica
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Marca */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      component="label"
                      htmlFor="marca_value"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Marca
                    </Typography>
                    <Input
                      type="text"
                      placeholder="Ej: Samsung"
                      value={technicalSheet?.brand || ''}
                      id="marca_value"
                      name="marca_value"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTechnicalSheet({ ...technicalSheet, brand: e.target.value })}
                      state="modern"
                      fullWidth
                    />
                  </Grid>

                  {/* Modelo */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      component="label"
                      htmlFor="modelo_value"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Modelo
                    </Typography>
                    <Input
                      type="text"
                      placeholder="Introduce el modelo"
                      value={technicalSheet?.model || ''}
                      id="modelo_value"
                      name="modelo_value"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTechnicalSheet({ ...technicalSheet, model: e.target.value })}
                      state="modern"
                      fullWidth
                    />
                  </Grid>

                  {/* Condición */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      component="label"
                      htmlFor="condition"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Condición
                    </Typography>
                    <Input
                      type="text"
                      name="condition"
                      id="condition"
                      placeholder="Nuevo/Usado"
                      value={technicalSheet?.condition || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTechnicalSheet({ ...technicalSheet, condition: e.target.value })}
                      state="modern"
                      fullWidth
                    />
                  </Grid>

                  {/* Categoría */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      component="label"
                      htmlFor="category"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Categoría
                    </Typography>
                    <Input
                      type="text"
                      name="category"
                      id="category"
                      placeholder="Categoría del producto"
                      value={technicalSheet?.category || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTechnicalSheet({ ...technicalSheet, category: e.target.value })}
                      state="modern"
                      fullWidth
                    />
                  </Grid>

                  {/* Dimensiones */}
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
                      Dimensiones
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography
                          component="label"
                          htmlFor="dimensions_width"
                          sx={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#94a3b8',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Ancho
                        </Typography>
                        <Input
                          type="text"
                          placeholder="Ancho"
                          value={technicalSheet?.dimensionsWidth || ''}
                          id="dimensions_width"
                          name="dimensions_width"
                          onChange={handleTechnicalNumericChange('dimensionsWidth')}
                          state="modern"
                          fullWidth
                          inputMode={technicalSheet?.dimensionsUnit === 'mts' ? 'decimal' : 'numeric'}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography
                          component="label"
                          htmlFor="dimensions_height"
                          sx={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#94a3b8',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Alto
                        </Typography>
                        <Input
                          type="text"
                          placeholder="Alto"
                          value={technicalSheet?.dimensionsHeight || ''}
                          id="dimensions_height"
                          name="dimensions_height"
                          onChange={handleTechnicalNumericChange('dimensionsHeight')}
                          state="modern"
                          fullWidth
                          inputMode={technicalSheet?.dimensionsUnit === 'mts' ? 'decimal' : 'numeric'}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography
                          component="label"
                          htmlFor="dimensions_depth"
                          sx={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#94a3b8',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Profundidad
                        </Typography>
                        <Input
                          type="text"
                          placeholder="Profundidad"
                          value={technicalSheet?.dimensionsDepth || ''}
                          id="dimensions_depth"
                          name="dimensions_depth"
                          onChange={handleTechnicalNumericChange('dimensionsDepth')}
                          state="modern"
                          fullWidth
                          inputMode={technicalSheet?.dimensionsUnit === 'mts' ? 'decimal' : 'numeric'}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography
                          component="label"
                          htmlFor="dimensions_unit"
                          sx={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#94a3b8',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Unidad
                        </Typography>
                        <Select
                          id="dimensions_unit"
                          value={technicalSheet?.dimensionsUnit || 'cm'}
                          onChange={(e) => {
                            setTechnicalSheet((prev) => ({ ...prev, dimensionsUnit: e.target.value }));
                          }}
                          variant="outlined"
                          displayEmpty
                          fullWidth
                          sx={technicalUnitSelectSx}
                        >
                          <MenuItem value="cm">cm</MenuItem>
                          <MenuItem value="mts">mts</MenuItem>
                        </Select>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Peso */}
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
                      Peso
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography
                          component="label"
                          htmlFor="weight_value"
                          sx={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#94a3b8',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Valor
                        </Typography>
                        <Input
                          type="text"
                          placeholder="Valor"
                          value={technicalSheet?.weightValue || ''}
                          id="weight_value"
                          name="weight_value"
                          onChange={handleTechnicalNumericChange('weightValue')}
                          state="modern"
                          fullWidth
                          inputMode={technicalSheet?.weightUnit === 'kg' ? 'decimal' : 'numeric'}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography
                          component="label"
                          htmlFor="weight_unit"
                          sx={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#94a3b8',
                            mb: 1,
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                          }}
                        >
                          Unidad
                        </Typography>
                        <Select
                          id="weight_unit"
                          value={technicalSheet?.weightUnit || 'g'}
                          onChange={(e) => {
                            setTechnicalSheet((prev) => ({ ...prev, weightUnit: e.target.value }));
                          }}
                          variant="outlined"
                          displayEmpty
                          fullWidth
                          sx={technicalUnitSelectSx}
                        >
                          <MenuItem value="g">g</MenuItem>
                          <MenuItem value="kg">kg</MenuItem>
                        </Select>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Atributos extra */}
                  <Grid size={{ xs: 12 }}>
                    <DynamicAttributes
                      attributes={extraAttributes}
                      onAdd={addTechnicalAttribute}
                      onDelete={deleteTechnicalAttribute}
                      onChange={handleChangeTechnicalAttribute}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Controlador de navegación - Ficha técnica */}
              <Box
                sx={{
                  position: 'relative',
                  mt: 3,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    width: '100%',
                  }}
                >
                  <Button
                    onClick={() => {
                      handleTabClick('1');
                      setTimeout(() => scrollToFormTop(), 100);
                    }}
                    sx={{
                      minWidth: { xs: '100%', sm: 150 },
                      px: 4,
                      py: 1.5,
                      backgroundColor: "#29C480",
                      color: "#1e293b",
                      fontWeight: 600,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "1rem",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                      '&:hover:not(:disabled)': {
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        '& .MuiSvgIcon-root': {
                          transform: "translateX(-4px)",
                        },
                      },
                      '& .MuiSvgIcon-root': {
                        transition: "transform 0.3s ease",
                        color: "#1e293b",
                      },
                    }}
                  >
                    <NavigateBefore sx={{ mr: 0.5, fontSize: 18 }} />
                    Anterior
                  </Button>

                  <Button
                    onClick={() => {
                      handleTabClick('3');
                      setTimeout(() => scrollToFormTop(), 100);
                    }}
                    sx={{
                      minWidth: { xs: '100%', sm: 150 },
                      px: 4,
                      py: 1.5,
                      backgroundColor: "#29C480",
                      color: "#1e293b",
                      fontWeight: 600,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "1rem",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                      '&:hover:not(:disabled)': {
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        '& .MuiSvgIcon-root': {
                          transform: "translateX(4px)",
                        },
                      },
                      '& .MuiSvgIcon-root': {
                        transition: "transform 0.3s ease",
                      },
                    }}
                  >
                    Siguiente
                    <NavigateNext sx={{ ml: 0.5, fontSize: 18 }} />
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Configuración de promoción */}
          {tabs[2].isActive && (
            <Box sx={{ opacity: isSubmitting ? 0.6 : 1, pointerEvents: isSubmitting ? 'none' : 'auto' }}>
              <Box
                sx={{
                  position: 'relative',
                  mb: 0,
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.8))",
                  backgroundColor: "rgba(41, 196, 128, 0.08)",
                  border: "2px solid rgba(41, 196, 128, 0.2)",
                  borderRadius: "24px",
                  padding: { xs: 3, md: 4 },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: shouldAnimate['3']
                    ? 'fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    : 'none',
                  "&:hover": {
                    backgroundColor: "rgba(41, 196, 128, 0.12)",
                    borderColor: "rgba(41, 196, 128, 0.4)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: '#34d399',
                      fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Promociones
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Compra segura */}
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        mb: 2,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Compra segura
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        gap: 2,
                        mb: 3,
                      }}
                    >
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          ¿Tu producto cuenta con devolución?
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          Seleccionando que si, tus productos tendrá la insignia liberty de compra segura aumentando la confianza de usuarios al ver su descripción.
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          pt: { xs: 0, md: 0.5 },
                        }}
                      >
                        <MuiSwitch
                          checked={form.promoReturn === "yes"}
                          onChange={handlePromoReturnSwitch}
                          id="promoReturnSwitch"
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase': {
                              '&.Mui-checked': {
                                color: '#fff',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: '#34d399',
                                  opacity: 1,
                                  border: 0,
                                },
                                '& .MuiSwitch-thumb': {
                                  backgroundColor: '#fff',
                                },
                              },
                            },
                            '& .MuiSwitch-thumb': {
                              backgroundColor: '#fff',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            },
                            '& .MuiSwitch-track': {
                              borderRadius: 12,
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              opacity: 1,
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography
                      component="label"
                      htmlFor="promoReturnInfo"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Información adicional
                    </Typography>
                    <Input
                      value={form.promoReturnInfo}
                      onChange={handleChange}
                      state="modern"
                      id="promoReturnInfo"
                      name="promoReturnInfo"
                      placeholder="Información adicional (opcional)"
                      multiline
                      rows={2}
                      fullWidth
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
                  </Grid>

                  {/* Envíos */}
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        mb: 2,
                        mt: 4,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Envíos
                    </Typography>
                    <Typography
                      component="label"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 2,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      ¿Cuánto tiempo tarda tu marca en entregar un pedido?
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 'auto' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              height: '56px',
                              px: 2,
                              py: 1,
                              borderRadius: '8px',
                              backgroundColor: form.promoShipping === "" ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                              border: form.promoShipping === "" ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: form.promoShipping === "" ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                borderColor: form.promoShipping === "" ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Limpiar el input de días
                              const clearDaysEvent = {
                                target: {
                                  name: 'promoShippingTime',
                                  value: '',
                                },
                              } as React.ChangeEvent<HTMLInputElement>;
                              handleChange(clearDaysEvent);

                              // Toggle: si ya está seleccionado, deseleccionar (usar "none"), sino seleccionar
                              const newValue = form.promoShipping === "" ? "none" : "";
                              const syntheticEvent = {
                                target: {
                                  name: 'promoShipping',
                                  value: newValue,
                                },
                              } as React.ChangeEvent<HTMLInputElement>;
                              handleChange(syntheticEvent);
                            }}
                          >
                            <Box
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                '& .MuiFormControlLabel-label': {
                                  color: '#ffffff !important',
                                  fontSize: '0.875rem !important',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                },
                                '& .MuiRadio-root': {
                                  color: '#9ca3af !important',
                                  '&.Mui-checked': {
                                    color: '#34d399 !important',
                                  },
                                },
                              }}
                            >
                              <Radio
                                label="No"
                                name="promoShipping"
                                value=""
                                id="promoShippingNo"
                                checked={form.promoShipping === ""}
                                onChange={(e) => {
                                  // Limpiar el input de días
                                  const clearDaysEvent = {
                                    target: {
                                      name: 'promoShippingTime',
                                      value: '',
                                    },
                                  } as React.ChangeEvent<HTMLInputElement>;
                                  handleChange(clearDaysEvent);
                                  // Actualizar el valor del radio
                                  handleChange(e);
                                }}
                                state={form.promoShipping === "" ? "checked" : "default"}
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 'auto' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              height: '56px',
                              px: 2,
                              py: 1,
                              borderRadius: '8px',
                              backgroundColor: form.promoShipping === "24hs" ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                              border: form.promoShipping === "24hs" ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: form.promoShipping === "24hs" ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                borderColor: form.promoShipping === "24hs" ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Limpiar el input de días
                              const clearDaysEvent = {
                                target: {
                                  name: 'promoShippingTime',
                                  value: '',
                                },
                              } as React.ChangeEvent<HTMLInputElement>;
                              handleChange(clearDaysEvent);

                              // Toggle: si ya está seleccionado, deseleccionar (usar "none"), sino seleccionar
                              const newValue = form.promoShipping === "24hs" ? "none" : "24hs";
                              const syntheticEvent = {
                                target: {
                                  name: 'promoShipping',
                                  value: newValue,
                                },
                              } as React.ChangeEvent<HTMLInputElement>;
                              handleChange(syntheticEvent);
                            }}
                          >
                            <Box
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                '& .MuiFormControlLabel-label': {
                                  color: '#ffffff !important',
                                  fontSize: '0.875rem !important',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                },
                                '& .MuiRadio-root': {
                                  color: '#9ca3af !important',
                                  '&.Mui-checked': {
                                    color: '#34d399 !important',
                                  },
                                },
                              }}
                            >
                              <Radio
                                label="24hs"
                                name="promoShipping"
                                value="24hs"
                                id="promoShipping24hs"
                                checked={form.promoShipping === "24hs"}
                                onChange={(e) => {
                                  // Limpiar el input de días
                                  const clearDaysEvent = {
                                    target: {
                                      name: 'promoShippingTime',
                                      value: '',
                                    },
                                  } as React.ChangeEvent<HTMLInputElement>;
                                  handleChange(clearDaysEvent);
                                  // Actualizar el valor del radio
                                  handleChange(e);
                                }}
                                state={form.promoShipping === "24hs" ? "checked" : "default"}
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 'auto' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              height: '56px',
                              px: 2,
                              py: 1,
                              borderRadius: '8px',
                              backgroundColor: form.promoShipping === "48hs" ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                              border: form.promoShipping === "48hs" ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: form.promoShipping === "48hs" ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                borderColor: form.promoShipping === "48hs" ? 'rgba(52, 211, 153, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Limpiar el input de días
                              const clearDaysEvent = {
                                target: {
                                  name: 'promoShippingTime',
                                  value: '',
                                },
                              } as React.ChangeEvent<HTMLInputElement>;
                              handleChange(clearDaysEvent);

                              // Toggle: si ya está seleccionado, deseleccionar (usar "none"), sino seleccionar
                              const newValue = form.promoShipping === "48hs" ? "none" : "48hs";
                              const syntheticEvent = {
                                target: {
                                  name: 'promoShipping',
                                  value: newValue,
                                },
                              } as React.ChangeEvent<HTMLInputElement>;
                              handleChange(syntheticEvent);
                            }}
                          >
                            <Box
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                '& .MuiFormControlLabel-label': {
                                  color: '#ffffff !important',
                                  fontSize: '0.875rem !important',
                                  fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                },
                                '& .MuiRadio-root': {
                                  color: '#9ca3af !important',
                                  '&.Mui-checked': {
                                    color: '#34d399 !important',
                                  },
                                },
                              }}
                            >
                              <Radio
                                label="48hs"
                                name="promoShipping"
                                value="48hs"
                                id="promoShipping48hs"
                                checked={form.promoShipping === "48hs"}
                                onChange={(e) => {
                                  // Limpiar el input de días
                                  const clearDaysEvent = {
                                    target: {
                                      name: 'promoShippingTime',
                                      value: '',
                                    },
                                  } as React.ChangeEvent<HTMLInputElement>;
                                  handleChange(clearDaysEvent);
                                  // Actualizar el valor del radio
                                  handleChange(e);
                                }}
                                state={form.promoShipping === "48hs" ? "checked" : "default"}
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 'auto' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Input
                              type="text"
                              name="promoShippingTime"
                              value={form.promoShippingTime || ''}
                              onChange={(e) => {
                                // Limpiar la selección de promoShipping cuando se escribe en el input
                                const clearShippingEvent = {
                                  target: {
                                    name: 'promoShipping',
                                    value: 'none',
                                  },
                                } as React.ChangeEvent<HTMLInputElement>;
                                handleChange(clearShippingEvent);

                                // Actualizar el valor del input de días (solo números)
                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                const syntheticEvent = {
                                  target: {
                                    name: 'promoShippingTime',
                                    value: numericValue,
                                  },
                                } as React.ChangeEvent<HTMLInputElement>;
                                handleChange(syntheticEvent);
                              }}
                              placeholder="Ej: 3"
                              state="modern"
                              inputMode="numeric"
                              sx={{
                                width: 100,
                                '& .MuiOutlinedInput-root': {
                                  height: '56px',
                                  minHeight: '56px',
                                  backgroundColor: '#1f2937',
                                  '& fieldset': {
                                    borderColor: '#374151',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#22c55e', // Hover verde
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#22c55e',
                                    boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.2)',
                                  },
                                  '& input': {
                                    padding: '12px 14px',
                                    fontSize: '0.875rem',
                                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    color: '#ffffff',
                                  },
                                },
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: '0.875rem',
                                color: '#ffffff',
                                whiteSpace: 'nowrap',
                                fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                              }}
                            >
                              Días
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                    <Typography
                      component="label"
                      htmlFor="promoShippingInfo"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Información adicional
                    </Typography>
                    <Input
                      value={form.promoShippingInfo}
                      onChange={handleChange}
                      state="modern"
                      id="promoShippingInfo"
                      name="promoShippingInfo"
                      placeholder="Información adicional (opcional)"
                      multiline
                      rows={2}
                      fullWidth
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
                    <Typography
                      component="span"
                      sx={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        mt: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Esta información sirve para tus usuarios vean condiciones especiales de envio y otras políticas que tenga tu marca al gestionar entregas.
                    </Typography>
                  </Grid>

                  {/* Cuotas bancarias */}
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        mb: 2,
                        mt: 4,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Cuotas bancarias
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        gap: 2,
                        mb: 3,
                      }}
                    >
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Typography
                          component="label"
                          sx={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#ffffff',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          ¿Tu producto cuenta con Cuotas sin interes?
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          Esta información sirve para tus usuarios vean condiciones especiales de Cuotas y otras políticas que tenga tu marca al respecto. ejemplo: &quot;En productos seleccionados&quot;.
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          pt: { xs: 0, md: 0.5 },
                        }}
                      >
                        <MuiSwitch
                          checked={form.promoBanks === "yes"}
                          onChange={handlePromoBanksSwitch}
                          id="promoBanksSwitch"
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase': {
                              '&.Mui-checked': {
                                color: '#fff',
                                '& + .MuiSwitch-track': {
                                  backgroundColor: '#34d399',
                                  opacity: 1,
                                  border: 0,
                                },
                                '& .MuiSwitch-thumb': {
                                  backgroundColor: '#fff',
                                },
                              },
                            },
                            '& .MuiSwitch-thumb': {
                              backgroundColor: '#fff',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                            },
                            '& .MuiSwitch-track': {
                              borderRadius: 12,
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              opacity: 1,
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography
                      component="label"
                      htmlFor="promoBanksInfo"
                      sx={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ffffff',
                        mb: 1,
                        fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      Información adicional
                    </Typography>
                    <Input
                      value={form.promoBanksInfo}
                      onChange={handleChange}
                      state="modern"
                      id="promoBanksInfo"
                      name="promoBanksInfo"
                      placeholder="Información adicional (opcional)"
                      multiline
                      rows={2}
                      fullWidth
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
                  </Grid>
                </Grid>
              </Box>

              {/* Controlador de navegación - Promociones */}
              <Box
                sx={{
                  position: 'relative',
                  mt: 3,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    width: '100%',
                  }}
                >
                  <Button
                    onClick={() => {
                      // Si la solapa 2 no está completa, ir directamente a la solapa 1
                      const targetTab = isTechnicalSheetComplete() ? '2' : '1';
                      handleTabClick(targetTab);
                      setTimeout(() => scrollToFormTop(), 100);
                    }}
                    sx={{
                      minWidth: { xs: '100%', sm: 150 },
                      px: 4,
                      py: 1.5,
                      backgroundColor: "#29C480",
                      color: "#1e293b",
                      fontWeight: 600,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "1rem",
                      transition: "background-color 0.3s ease, color 0.3s ease",
                      '&:hover:not(:disabled)': {
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        '& .MuiSvgIcon-root': {
                          transform: "translateX(-4px)",
                        },
                      },
                      '& .MuiSvgIcon-root': {
                        transition: "transform 0.3s ease",
                        color: "#1e293b",
                      },
                    }}
                  >
                    <NavigateBefore sx={{ mr: 0.5, fontSize: 18 }} />
                    Anterior
                  </Button>

                  <Button
                    sx={{
                      minWidth: { xs: '100%', sm: 150 },
                      px: 5,
                      py: 1.5,
                    }}
                    type="submit"
                    size="md"
                    isLoading={isSubmitting}
                    disabled={isSubmitting || !isFormValid()}
                  >
                    {id ? 'Actualizar producto' : 'Crear producto'}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          </form>
        </Stack>
        </Box>
      </Container>
    </Box>
  );
}

// const RenderTextArea = ({ info, value, handleChange, name, id, rows = 4 }: { info: string, value: string, handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void, name: string, id: string, rows?: number }) => {
//   return (
//     <Stack spacing={2} sx={{ mt: 5 }}>
//       <Textarea
//         rows={rows}
//         label="Información para usuario adicional"
//         placeholder="Información adicional (opcional)"
//         value={value}
//         onChange={handleChange}
//         state="transparent"
//         id={id}
//         name={name}
//       />
//       <Text variant="span" weight="light" sx={{ fontSize: "14px", lineHeight: "1.5" }}>
//         {info}
//       </Text>
//     </Stack>
//   );
// };

const RenderTabs = ({ id, label, isActive, disabled, onClick, isFirst, isLast, isMobile }: { id: string, label: string, isActive: boolean, disabled: boolean, onClick: () => void; isFirst?: boolean; isLast?: boolean; isMobile?: boolean; }) => {
  // Mapear iconos según el id del tab
  const getIcon = () => {
    const iconSize = isMobile ? '1.75rem' : '1.25rem';
    if (id === '1') return <Description sx={{ fontSize: iconSize }} />;
    if (id === '2') return <Build sx={{ fontSize: iconSize }} />;
    if (id === '3') return <LocalOffer sx={{ fontSize: iconSize }} />;
    return null;
  };

  // Calcular border-radius para que los botones estén pegados
  const getBorderRadius = () => {
    // En mobile, cada tab tiene border-radius completo
    if (isMobile) {
      return '12px';
    }
    // En desktop, mantener la lógica original
    if (isActive) {
      if (isFirst) return { xs: '16px 0 0 16px', sm: '16px 0 0 16px' };
      if (isLast) return { xs: '0 16px 16px 0', sm: '0 16px 16px 0' };
      return '0';
    }
    if (isFirst) return { xs: '16px 0 0 16px', sm: '16px 0 0 16px' };
    if (isLast) return { xs: '0 16px 16px 0', sm: '0 16px 16px 0' };
    return '0';
  };

  // Calcular bordes para que se vean pegados
  const getBorderStyles = () => {
    const baseBorder = isActive
      ? "2px solid rgba(41, 196, 128, 0.4)"
      : "2px solid rgba(71, 85, 105, 0.3)";

    // En mobile, cada tab tiene todos los bordes
    if (isMobile) {
      return {
        borderTop: baseBorder,
        borderRight: baseBorder,
        borderBottom: baseBorder,
        borderLeft: baseBorder,
      };
    }

    // En desktop, mantener la lógica original
    if (isActive) {
      return {
        borderTop: baseBorder,
        borderRight: baseBorder,
        borderBottom: baseBorder,
        borderLeft: baseBorder,
      };
    }

    if (isFirst) {
      return {
        borderTop: baseBorder,
        borderRight: 'none',
        borderBottom: baseBorder,
        borderLeft: baseBorder,
      };
    }
    if (isLast) {
      return {
        borderTop: baseBorder,
        borderRight: baseBorder,
        borderBottom: baseBorder,
        borderLeft: 'none',
      };
    }
    return {
      borderTop: baseBorder,
      borderRight: 'none',
      borderBottom: baseBorder,
      borderLeft: 'none',
    };
  };

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMobile ? (isActive ? 'space-between' : 'center') : 'flex-start',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        borderRadius: getBorderRadius(),
        ...getBorderStyles(),
        // Efecto acordeón horizontal en mobile
        ...(isMobile
          ? {
              width: isActive ? 'auto' : '56px',
              minWidth: isActive ? '180px' : '56px',
              minHeight: '56px',
              padding: isActive ? '1rem 1.5rem' : '1rem',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              position: 'relative',
              flexShrink: isActive ? 1 : 0,
              flexGrow: isActive ? 1 : 0,
              ...(isActive
                ? {
                    backgroundColor: "rgba(41, 196, 128, 0.1)",
                    color: '#34d399',
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#34d399',
                      marginLeft: 'auto',
                      flexShrink: 0,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                  }
                : {
                    backgroundColor: "rgba(30, 41, 59, 0.4)",
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: '1rem',
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#94a3b8',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    '&:hover': {
                      backgroundColor: "rgba(30, 41, 59, 0.6)",
                      transform: 'scale(1.05)',
                      '& svg': {
                        color: '#cbd5e1',
                        transform: 'scale(1.1)',
                      },
                    },
                  }),
            }
          : {
              // Desktop: mantener comportamiento original
              width: 'auto',
              minHeight: 'auto',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(isActive
                ? {
                    backgroundColor: "rgba(41, 196, 128, 0.1)",
                    padding: { xs: '0.875rem 1.5rem', md: '1rem 2rem' },
                    color: '#34d399',
                    fontWeight: 600,
                    fontSize: { xs: '0.9375rem', md: '1rem' },
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#34d399',
                      ml: 1,
                    },
                  }
                : {
                    backgroundColor: "rgba(30, 41, 59, 0.4)",
                    padding: { xs: '0.875rem 1.5rem', md: '1rem 2rem' },
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontSize: { xs: '0.9375rem', md: '1rem' },
                    fontFamily: "'Geist', 'Geist Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    '& svg': {
                      color: '#94a3b8',
                      ml: 1,
                    },
                    '&:hover': {
                      backgroundColor: "rgba(30, 41, 59, 0.6)",
                      color: '#cbd5e1',
                      '& svg': {
                        color: '#cbd5e1',
                      },
                    },
                  }),
            }),
        ...(disabled && {
          opacity: 0.5,
        }),
      }}
    >
      <Typography
        component="span"
        sx={{
          fontWeight: 'inherit',
          fontSize: 'inherit',
          color: 'inherit',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          flex: isMobile && isActive ? 1 : 'none',
          textAlign: isMobile && isActive ? 'left' : 'inherit',
          ...(isMobile && {
            opacity: isActive ? 1 : 0,
            width: isActive ? 'auto' : 0,
            overflow: 'hidden',
            transition: isActive
              ? 'opacity 0.3s ease-in 0.1s, width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'opacity 0.2s ease-out, width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }),
        }}
      >
        {label}
      </Typography>
      {getIcon()}
    </Box>
  );
};