import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useProducts } from './use-products';
import { useProfile } from './use-profile';
import { useConfiguration } from './use-configuration';
import { mapUploadFormToFormData, validateUploadFormData, UploadProductFormData, buildProductMeta } from '../helpers/product-mappers';
import { validateMainFeatures, ProductFormState } from '../../admin/panel/commerce/pages/upload-product-validations';
import { notificationService } from '../providers/toast-provider';
import { ProductEntity } from '../types/product';

const cryptos = [
  { id: 1, label: "USDT", currency: "USDT", icon: "/icons/usdt.svg" },
  { id: 2, label: "ARS", currency: "ARS", icon: "/icons/ars.svg" },
];

// Tipo para media del producto (imágenes o videos)
export type ProductMedia = {
  file: File;
  type: 'image' | 'video';
  preview?: string;
};

export interface UploadProductForm {
  name: string;
  description: string;
  promotion: string;
  category: string;
  condition: string;
  year: string;
  /** Portada: archivo nuevo o URL al editar */
  coverImage?: File | string | null;
  /** Galería: archivos nuevos o URLs al editar */
  productImages?: (File | string)[];
  productMedia: ProductMedia[]; // Hasta 6 imágenes O 5 imágenes + 1 video, mínimo 1
  shipping: boolean;
  priceUSDT: number;
  priceARS: number;
  crypto: number[];
  stock: number;
  shippingWeight: number | string;
  shippingHeight: number | string;
  shippingWidth: number | string;
  shippingLength: number | string;
  promoReturn: string;
  promoReturnInfo: string;
  promoShipping: string;
  promoShippingTime: string;
  promoShippingInfo: string;
  promoBanks: string;
  promoBanksInfo: string;
}

export interface TechnicalSheet {
  brand: string;
  model: string;
  condition: string;
  category: string;
  dimensionsWidth: string;
  dimensionsHeight: string;
  dimensionsDepth: string;
  dimensionsUnit: string;
  weightValue: string;
  weightUnit: string;
}

export interface ExtraAttribute {
  name: string;
  value: string;
  temporalId: number;
}

export interface Tab {
  id: string;
  label: string;
  disabled: boolean;
  isActive: boolean;
}

const initialForm: UploadProductForm = {
  name: "",
  description: "",
  promotion: "",
  category: "Seleccionar categoría",
  condition: "Nuevo",
  year: "",
  coverImage: null,
  productImages: [],
  productMedia: [],
  shipping: false,
  priceUSDT: 0,
  priceARS: 0,
  crypto: [cryptos[0].id],
  stock: 0,
  shippingWeight: '',
  shippingHeight: '',
  shippingWidth: '',
  shippingLength: '',
  promoReturn: "",
  promoReturnInfo: "",
  promoShipping: "",
  promoShippingTime: "",
  promoShippingInfo: "",
  promoBanks: "",
  promoBanksInfo: "",
};

const initialTechnicalSheet: TechnicalSheet = {
  brand: "",
  model: "",
  condition: "Nuevo",
  category: "",
  dimensionsWidth: "",
  dimensionsHeight: "",
  dimensionsDepth: "",
  dimensionsUnit: "cm",
  weightValue: "",
  weightUnit: "g"
};

export const useUploadProduct = (productId?: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { createProduct, useProductById, updateProduct } = useProducts();
  const { profile: profileData } = useProfile();
  const { storeQuery } = useConfiguration(); // Obtener storeId desde la configuración

  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', label: "Datos principales", disabled: false, isActive: true },
    { id: '2', label: "Ficha técnica", disabled: true, isActive: false }, // Deshabilitado hasta completar Datos principales
    { id: '3', label: "Promociones", disabled: true, isActive: false } // Deshabilitado hasta completar Datos principales y Ficha técnica
  ]);
  // Leer de localStorage si el usuario ya cerró la card anteriormente
  const [showInfo, setShowInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('upload-product-info-dismissed');
      return dismissed !== 'true';
    }
    return true;
  });
  const [form, setForm] = useState<UploadProductForm>(initialForm);
  const [technicalSheet, setTechnicalSheet] = useState<TechnicalSheet>(initialTechnicalSheet);
  const [extraAttributes, setExtraAttributes] = useState<ExtraAttribute[]>([]);
  const [loading, setLoading] = useState(false);

  const productQuery = useProductById(productId || '');
  const { categories: categoriesQuery } = useProducts();

  // Sincronizar el valor de la categoría cuando se cargan las opciones
  // Solo sincronizar si NO estamos en modo de edición o si el producto aún no se ha cargado
  useEffect(() => {
    if (categoriesQuery.data && categoriesQuery.data.length > 0) {
      const categoryNames = categoriesQuery.data.map((c: { name: string }) => c.name);

      // Si estamos editando un producto, esperar a que se cargue antes de sincronizar
      if (productId && !productQuery.data) {
        // Esperar a que se cargue el producto antes de sincronizar
        return;
      }

      // Si el valor actual no está en las opciones disponibles, mantener "Seleccionar categoría"
      // pero solo si realmente no hay una selección válida
      if (form.category && form.category !== 'Seleccionar categoría' && !categoryNames.includes(form.category)) {
        setForm(prev => ({ ...prev, category: 'Seleccionar categoría' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesQuery.data, productId, productQuery.data]); // form.category se actualiza dentro del efecto, no debe estar en dependencias

  // Cargar producto existente para edición
  // Esperar a que tanto el producto como las categorías estén cargadas
  useEffect(() => {
    if (!productId) return;
    if (!productQuery.data) return;
    // Esperar a que las categorías estén cargadas para poder mapear correctamente
    if (!categoriesQuery.data || categoriesQuery.data.length === 0) return;

    const product = productQuery.data as {
      name?: string;
      description?: string;
      promotion?: string;
      category_identification_code?: string;
      category?: { name?: string; id?: string };
      condition?: string;
      year?: number;
      crypto?: string;
      price?: number;
      price_ars?: number;
      pricing?: {
        values?: Array<{ currency?: string; amount?: number; usdPerUnit?: number }>;
      };
      shipping?: { weight?: number };
      stock?: number;
      photos?: Array<{
        imageUrl?: string;
        image_url?: string;
        imageUrlLg?: string | null;
        imageUrlMd?: string | null;
        imageUrlSm?: string | null;
      }>;
      meta?: {
        technicalSheet?: {
          brand?: string;
          model?: string;
          specs?: Record<string, unknown>;
        };
        promotions?: {
          promoReturn?: string;
          promoReturnInfo?: string;
          promoShipping?: string;
          promoShippingTime?: string;
          promoShippingInfo?: string;
          promoBanks?: string;
          promoBanksInfo?: string;
        };
      };
    };
    const meta = product?.meta || {};
    const ts = meta?.technicalSheet || {};

    // Usar el nombre de la categoría directamente si está disponible
    // Si no, intentar mapear desde category_identification_code usando las categorías disponibles
    let categoryLabel = 'Seleccionar categoría';

    if (product.category?.name) {
      categoryLabel = product.category.name;
    } else if (product.category_identification_code && Array.isArray(categoriesQuery.data)) {
      // Construir mapa dinámico desde las categorías disponibles
      const categoryCode = String(product.category_identification_code);

      // Buscar la categoría por ID (UUID) o por nombre
      const foundCategory = categoriesQuery.data.find((c: { id?: string; name?: string }) =>
        c.id === categoryCode || c.name === categoryCode
      );

      if (foundCategory?.name) {
        categoryLabel = foundCategory.name;
      }
    }

    // Extraer precios desde pricing
    const pricing = product.pricing;
    let priceUSDT = Number(product.price ?? 0);
    let priceARS = Number(product.price_ars ?? 0);
    
    // Si hay pricing, extraer los valores
    if (pricing?.values && Array.isArray(pricing.values)) {
      const usdtValue = pricing.values.find(v => v.currency?.toUpperCase() === 'USDT');
      const arsValue = pricing.values.find(v => v.currency?.toUpperCase() === 'ARS');
      
      if (usdtValue?.amount) {
        priceUSDT = Number(usdtValue.amount);
      }
      if (arsValue?.amount) {
        priceARS = Number(arsValue.amount);
      }
    }

    // Definir crypto seleccionada (si tiene ARS, incluir ambos)
    const cryptoSelected: number[] = [];
    if (priceUSDT > 0) {
      cryptoSelected.push(1); // USDT
    }
    if (priceARS > 0) {
      cryptoSelected.push(2); // ARS
    }
    // Si no hay ninguno, usar USDT por defecto
    if (cryptoSelected.length === 0) {
      cryptoSelected.push(1);
    }

    // Shipping
    const hasShipping = Boolean(product.shipping);
    const shippingWeight = Number(product.shipping?.weight ?? 0);
    const shippingHeight = Number(product.shipping?.dimensions?.height ?? 0);
    const shippingWidth = Number(product.shipping?.dimensions?.width ?? 0);
    const shippingLength = Number(product.shipping?.dimensions?.length ?? 0);

    // Cargar fotos existentes del producto
    // La primera foto es la portada, las demás son fotos adicionales
    const existingPhotos = product.photos || [];
    const coverImageUrl = existingPhotos.length > 0
      ? (existingPhotos[0].imageUrl || existingPhotos[0].image_url)
      : null;
    const productImagesUrls = existingPhotos.length > 1
      ? existingPhotos.slice(1).map(p => p.imageUrl || p.image_url).filter(Boolean) as string[]
      : [];

    setForm((prev) => ({
      ...prev,
      name: product.name || '',
      description: product.description || '',
      promotion: product.promotion || '',
      category: categoryLabel,
      condition: product.condition === 'used' ? 'Usado' : 'Nuevo',
      year: String(product.year || ''),
      coverImage: coverImageUrl as unknown as File | null, // URLs como strings se pueden usar directamente
      productImages: productImagesUrls as unknown as File[],
      shipping: hasShipping,
      priceUSDT: priceUSDT,
      priceARS: priceARS,
      crypto: cryptoSelected,
      stock: Number(product.stock ?? 1),
      shippingWeight: hasShipping && shippingWeight > 0 ? String(shippingWeight) : '',
      shippingHeight: hasShipping && shippingHeight > 0 ? String(shippingHeight) : '',
      shippingWidth: hasShipping && shippingWidth > 0 ? String(shippingWidth) : '',
      shippingLength: hasShipping && shippingLength > 0 ? String(shippingLength) : '',
      promoReturn: '',
      promoReturnInfo: '',
      promoShipping: '',
      promoShippingTime: '',
      promoShippingInfo: '',
      promoBanks: '',
      promoBanksInfo: '',
    }));

    // Prefill ficha técnica y promociones desde meta
    try {
      const brand = typeof ts?.brand === 'string' ? ts.brand : '';
      const model = typeof ts?.model === 'string' ? ts.model : '';
      const specs = (ts?.specs || {}) as Record<string, unknown> & {
        dimensions?: { width?: unknown; height?: unknown; depth?: unknown; unit?: unknown };
        weight?: { value?: unknown; unit?: unknown };
      };

      // Cargar promociones desde meta.promotions
      const promotions = (meta?.promotions || {}) as {
        promoReturn?: string;
        promoReturnInfo?: string;
        promoShipping?: string;
        promoShippingTime?: string;
        promoShippingInfo?: string;
        promoBanks?: string;
        promoBanksInfo?: string;
      };

      // Si hay datos de shipping, usarlos para la ficha técnica (tienen prioridad sobre specs)
      const finalDimensionsWidth = hasShipping && shippingWidth > 0 
        ? String(shippingWidth) 
        : String(specs.dimensions?.width ?? '');
      const finalDimensionsHeight = hasShipping && shippingHeight > 0 
        ? String(shippingHeight) 
        : String(specs.dimensions?.height ?? '');
      const finalDimensionsDepth = hasShipping && shippingLength > 0 
        ? String(shippingLength) 
        : String(specs.dimensions?.depth ?? '');
      const finalWeightValue = hasShipping && shippingWeight > 0 
        ? String(shippingWeight) 
        : String(specs.weight?.value ?? '');

      setTechnicalSheet((prev) => ({
        ...prev,
        brand,
        model,
        condition: product.condition === 'used' ? 'Usado' : 'Nuevo',
        category: categoryLabel,
        dimensionsWidth: finalDimensionsWidth,
        dimensionsHeight: finalDimensionsHeight,
        dimensionsDepth: finalDimensionsDepth,
        dimensionsUnit: String(specs.dimensions?.unit ?? 'cm'),
        weightValue: finalWeightValue,
        weightUnit: String(specs.weight?.unit ?? 'g')
      }));

      // Cargar promociones en el formulario
      setForm((prev) => ({
        ...prev,
        promoReturn: promotions.promoReturn || '',
        promoReturnInfo: promotions.promoReturnInfo || '',
        promoShipping: promotions.promoShipping || '',
        promoShippingTime: promotions.promoShippingTime || '',
        promoShippingInfo: promotions.promoShippingInfo || '',
        promoBanks: promotions.promoBanks || '',
        promoBanksInfo: promotions.promoBanksInfo || '',
      }));

      const kvPairs: { name: string; value: string; temporalId: number }[] = [];
      // Campos que ya se manejan en campos específicos de la ficha técnica
      const excludedKeys = ['dimensions', 'weight'];

      Object.entries(specs).forEach(([key, value]) => {
        if (excludedKeys.includes(key)) {
          return;
        }

        if (value === undefined || value === null) return;

        if (typeof value === 'object' && value !== null) {
          return;
        }

        const valStr = String(value);
        kvPairs.push({
          name: key,
          value: valStr,
          temporalId: Date.now() + Math.floor(Math.random() * 1000)
        });
      });

      if (kvPairs.length) setExtraAttributes(kvPairs);
    } catch (error) {
      console.error('[useUploadProduct] Error al cargar ficha técnica y promociones:', error);
    }

    setTabs((prevState) =>
      prevState.map((tab) => ({
        ...tab,
        disabled: false,
      }))
    );
  }, [productId, productQuery.data, categoriesQuery.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;

    // Usar función de actualización para garantizar que tenemos el estado más reciente
    setForm((prevForm) => {
      // Convertir a número campos numéricos
      let processedValue: string | number = fieldValue;
      if (fieldName === 'stock') {
        processedValue = fieldValue === '' ? 0 : Number(fieldValue) || 0;
      } else if (fieldName === 'priceUSDT' || fieldName === 'priceARS') {
        // Permitir valores vacíos para mostrar placeholder, convertir a número solo si hay valor
        processedValue = fieldValue === '' ? 0 : Number(fieldValue) || 0;
      } else if (fieldName === 'shippingWeight' || fieldName === 'shippingHeight' ||
        fieldName === 'shippingWidth' || fieldName === 'shippingLength') {
        // Mantener como string para permitir decimales, convertir a número solo al guardar
        // Aceptar cualquier string (ya viene filtrado del componente)
        processedValue = fieldValue;
      }

      const updatedForm = { ...prevForm, [fieldName]: processedValue };
      
      // Si shipping está habilitado, sincronizar datos de envío con ficha técnica
      if (updatedForm.shipping && (
        fieldName === 'shippingWeight' || 
        fieldName === 'shippingHeight' || 
        fieldName === 'shippingWidth' || 
        fieldName === 'shippingLength'
      )) {
        // Mapear campos de envío a ficha técnica
        const shippingToTechnicalMap: Record<string, keyof TechnicalSheet> = {
          shippingWeight: 'weightValue',
          shippingHeight: 'dimensionsHeight',
          shippingWidth: 'dimensionsWidth',
          shippingLength: 'dimensionsDepth'
        };
        
        const technicalField = shippingToTechnicalMap[fieldName];
        if (technicalField) {
          setTechnicalSheet((prevSheet) => ({
            ...prevSheet,
            [technicalField]: fieldValue
          }));
        }
      }
      
      return updatedForm;
    });

    if (fieldName === "condition" || fieldName === "category") {
      setTechnicalSheet((prevSheet) => ({ ...prevSheet, [fieldName]: fieldValue }));
    }
  };

  const handleSwitch = () => {
    const newShippingValue = !form.shipping;
    setForm({ ...form, shipping: newShippingValue });
    
    // Si se habilita shipping y hay datos de envío, copiarlos a la ficha técnica
    if (newShippingValue) {
      setTechnicalSheet((prevSheet) => ({
        ...prevSheet,
        weightValue: typeof form.shippingWeight === 'string' ? form.shippingWeight : (form.shippingWeight ? String(form.shippingWeight) : ''),
        dimensionsHeight: typeof form.shippingHeight === 'string' ? form.shippingHeight : (form.shippingHeight ? String(form.shippingHeight) : ''),
        dimensionsWidth: typeof form.shippingWidth === 'string' ? form.shippingWidth : (form.shippingWidth ? String(form.shippingWidth) : ''),
        dimensionsDepth: typeof form.shippingLength === 'string' ? form.shippingLength : (form.shippingLength ? String(form.shippingLength) : ''),
        // Establecer unidades por defecto si no están establecidas
        dimensionsUnit: prevSheet?.dimensionsUnit || 'cm',
        weightUnit: prevSheet?.weightUnit || 'g'
      }));
    }
  };

  const handleCryptoSelect = (id: number) => {
    const isInForm = form.crypto.includes(id);
    if (isInForm) {
      return setForm({ ...form, crypto: form.crypto.filter(c => c !== id) });
    }
    setForm({ ...form, crypto: [...form.crypto, id] });
  };

  const handleDaysSelect = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    setForm({ ...form, promoShipping: "dias" });
  };

  const handleCloseInfo = () => {
    setShowInfo(false);
    // Guardar en localStorage que el usuario cerró la card
    if (typeof window !== 'undefined') {
      localStorage.setItem('upload-product-info-dismissed', 'true');
    }
  };

  const addTechnicalAttribute = () => {
    const temporalId = Date.now();
    setExtraAttributes(prev => ([...prev, { name: "", value: "", temporalId }]));
  };

  const deleteTechnicalAttribute = (index: number) => {
    setExtraAttributes(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleChangeTechnicalAttribute = (index: number, field: 'name' | 'value', value: string) => {
    const updatedAttributes = [...extraAttributes];
    updatedAttributes[index][field] = value;
    setExtraAttributes(updatedAttributes);
  };

  const handleCoverImageChange = (files: File[]) => {
    setForm({
      ...form,
      coverImage: files[0] || null
    });
  };

  const handleProductImagesChange = (files: File[]) => {
    setForm({
      ...form,
      productImages: Array.isArray(files) ? files : []
    });
  };

  // Función para validar si Datos principales está completo
  // Solo título, imagen y categoría son obligatorios
  const isMainDataComplete = useCallback((): boolean => {
    if (!form.name?.trim()) return false;

    const categoryValue = form.category?.trim() || "";
    const isDefaultCategory = categoryValue === "" || 
      categoryValue === "Seleccionar categoría" ||
      categoryValue.toLowerCase() === "seleccionar categoría";
    if (!categoryValue || isDefaultCategory) return false;

    const gallery = Array.isArray(form.productImages) ? form.productImages : [];
    const hasImages = Boolean(form.coverImage) || gallery.length > 0;
    if (!hasImages) return false;

    // Validar año solo si se ingresó
    if (form.year) {
      const yearNumber = Number(form.year);
      const currentYear = new Date().getFullYear();
      if (Number.isNaN(yearNumber) || yearNumber > currentYear || yearNumber < 1900) return false;
    }

    // Validar dimensiones de envío solo si shipping está habilitado
    if (form.shipping) {
      const weight = typeof form.shippingWeight === 'string' ? parseFloat(form.shippingWeight) : Number(form.shippingWeight);
      const height = typeof form.shippingHeight === 'string' ? parseFloat(form.shippingHeight) : Number(form.shippingHeight);
      const width = typeof form.shippingWidth === 'string' ? parseFloat(form.shippingWidth) : Number(form.shippingWidth);
      const length = typeof form.shippingLength === 'string' ? parseFloat(form.shippingLength) : Number(form.shippingLength);
      if (!weight || weight <= 0 || Number.isNaN(weight)) return false;
      if (!height || height <= 0 || Number.isNaN(height)) return false;
      if (!width || width <= 0 || Number.isNaN(width)) return false;
      if (!length || length <= 0 || Number.isNaN(length)) return false;
    }

    return true;
  }, [form]);

  // Actualizar estado de tabs basado en el progreso
  useEffect(() => {
    const mainDataComplete = isMainDataComplete();
    
    setTabs(prevTabs => prevTabs.map(tab => {
      if (tab.id === '1') {
        // Datos principales siempre habilitado
        return { ...tab, disabled: false };
      } else if (tab.id === '2') {
        // Ficha técnica habilitado solo si Datos principales está completo
        return { ...tab, disabled: !mainDataComplete };
      } else if (tab.id === '3') {
        // Promociones habilitado solo si Datos principales está completo (ficha técnica es opcional)
        return { ...tab, disabled: !mainDataComplete };
      }
      return tab;
    }));
  }, [form, isMainDataComplete]);

  const handleTabClick = (tabId: string) => {
    const targetTab = tabs.find(t => t.id === tabId);
    
    // No permitir cambiar a un tab deshabilitado
    if (targetTab?.disabled) {
      return;
    }
    
    // Cambiar al tab seleccionado
    setTabs(tabs.map(t => ({ 
      ...t, 
      isActive: t.id === tabId
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const currentTab = tabs.find(tab => tab.isActive);
    if (!currentTab) return;

    try {
      // Validar datos principales si estamos en la primera pestaña
      if (currentTab.id === '1') {
        // Usar el estado más reciente del formulario para la validación
        // Esto garantiza que tenemos el valor actualizado incluso si el estado aún no se ha renderizado
        const currentFormState = form;
        const mainFeaturesErrors = validateMainFeatures(currentFormState as ProductFormState);

        if (Object.keys(mainFeaturesErrors).length > 0) {
          const firstError = Object.values(mainFeaturesErrors)[0];
          const firstErrorKey = Object.keys(mainFeaturesErrors)[0];
          notificationService.error(firstError, { autoClose: 7000 });
          document.getElementById(firstErrorKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setLoading(false);
          return;
        }
      }

      // Si estamos en la última pestaña, crear o actualizar
      if (tabs[2].isActive) {
        if (!(profileData as { id?: string })?.id) {
          notificationService.error('No se pudo obtener la información del usuario');
          setLoading(false);
          return;
        }

        // Validar datos completos del formulario
        const formValidation = validateUploadFormData(form as UploadProductFormData);
        if (!formValidation.isValid) {
          notificationService.error(formValidation.errors[0], { autoClose: 7000 });
          setLoading(false);
          return;
        }

        if (productId) {
          // Construir meta con ficha técnica y promociones
          const meta = buildProductMeta(
            {
              brand: technicalSheet.brand,
              model: technicalSheet.model,
              condition: technicalSheet.condition,
              category: technicalSheet.category,
              dimensionsWidth: technicalSheet.dimensionsWidth,
              dimensionsHeight: technicalSheet.dimensionsHeight,
              dimensionsDepth: technicalSheet.dimensionsDepth,
              dimensionsUnit: technicalSheet.dimensionsUnit,
              weightValue: technicalSheet.weightValue,
              weightUnit: technicalSheet.weightUnit,
            },
            extraAttributes.map(a => ({ name: a.name, value: a.value })),
            {
              promoReturn: form.promoReturn,
              promoReturnInfo: form.promoReturnInfo,
              promoShipping: form.promoShipping,
              promoShippingTime: form.promoShippingTime,
              promoShippingInfo: form.promoShippingInfo,
              promoBanks: form.promoBanks,
              promoBanksInfo: form.promoBanksInfo,
            }
          );

          // Construir pricing según la estructura esperada por el backend
          const pricingValues: Array<{ currency: string; amount: number; usdPerUnit: number }> = [];

          // Agregar USDT si está seleccionado
          if (form.crypto.includes(1) && form.priceUSDT > 0) {
            pricingValues.push({
              currency: 'USDT',
              amount: form.priceUSDT,
              usdPerUnit: 1,
            });
          }

          // Agregar ARS si está seleccionado
          if (form.crypto.includes(2) && form.priceARS > 0 && form.priceUSDT > 0) {
            const usdPerUnit = form.priceUSDT / form.priceARS;
            pricingValues.push({
              currency: 'ARS',
              amount: form.priceARS,
              usdPerUnit: usdPerUnit,
            });
          }

          // Si no hay valores de pricing, usar USDT por defecto
          if (pricingValues.length === 0 && form.priceUSDT > 0) {
            pricingValues.push({
              currency: 'USDT',
              amount: form.priceUSDT,
              usdPerUnit: 1,
            });
          }

          const pricing = {
            referenceBase: 'USD',
            referenceAt: new Date().toISOString(),
            values: pricingValues,
          };

          // Verificar si hay fotos nuevas (File objects, no URLs)
          const productImagesSafe = Array.isArray(form.productImages) ? form.productImages : [];
          const hasNewPhotos = form.coverImage instanceof File ||
            productImagesSafe.some((img) => img instanceof File);

          if (hasNewPhotos) {
            // Si hay fotos nuevas, enviar como FormData (similar a crear)
            const allImages = [
              form.coverImage instanceof File ? form.coverImage : null,
              ...productImagesSafe.filter((img) => img instanceof File)
            ].filter((img): img is File => img !== null);

            const formDataToSend = mapUploadFormToFormData(form as UploadProductFormData);

            // Agregar storeId si está disponible
            const storeId = (storeQuery.data as { id?: string } | undefined)?.id;
            if (storeId) {
              formDataToSend.append('storeId', storeId);
            }

            // Limpiar las imágenes anteriores del FormData (solo las que vienen del mapper)
            formDataToSend.delete('photos');
            formDataToSend.delete('photoTypes');

            // Construir array de tipos de fotos
            const photoTypes: string[] = [];
            // La primera foto nueva es la portada si existe, sino todas son producto
            const hasNewCoverImage = form.coverImage instanceof File;
            if (hasNewCoverImage && allImages.length > 0 && allImages[0] === form.coverImage) {
              photoTypes.push('cover');
              allImages.slice(1).forEach(() => photoTypes.push('product'));
            } else {
              // Si no hay portada nueva, todas son producto
              allImages.forEach(() => photoTypes.push('product'));
            }

            // Agregar todas las imágenes nuevas
            allImages.forEach((image) => {
              formDataToSend.append('photos', image);
            });

            // Agregar tipos de fotos
            if (photoTypes.length > 0) {
              formDataToSend.append('photoTypes', JSON.stringify(photoTypes));
            }

            // Usar updateProduct pero enviando FormData
            await updateProduct.mutateAsync({
              id: productId,
              data: formDataToSend as unknown as Partial<ProductEntity>
            });
          } else {
            // Si no hay fotos nuevas, enviar como JSON normal
            const storeId = (storeQuery.data as { id?: string } | undefined)?.id;
            const payload: Record<string, unknown> = {
              name: form.name,
              description: form.description,
              promotion: form.promotion || undefined,
              pricing: pricing,
              year: Number(form.year) || undefined,
              condition: (form.condition?.toLowerCase() === 'usado' ? 'used' : 'new') as 'new' | 'used',
              activeStatus: form.shipping ? 1 : 0,
              categoryIdentificationCode: form.category && form.category !== 'Seleccionar categoría' ? form.category : undefined,
              stock: form.stock !== undefined ? Number(form.stock) : undefined,
              meta: Object.keys(meta).length > 0 ? meta : undefined,
            };

            // Agregar storeId si está disponible
            if (storeId) {
              payload.storeId = storeId;
            }

            // Eliminar campos undefined para evitar enviarlos al backend
            Object.keys(payload).forEach(key => {
              if (payload[key] === undefined) {
                delete payload[key];
              }
            });

            await updateProduct.mutateAsync({ id: productId, data: payload as Partial<ProductEntity> });
          }

          // La notificación se maneja en el componente usando toast
          return router.push('/admin/panel/products');
        } else {
          // Crear: validar imágenes y enviar FormData
          // Construir array de imágenes: portada + fotos del producto
          const productImagesSafe = Array.isArray(form.productImages) ? form.productImages : [];
          const allImages = [
            form.coverImage,
            ...productImagesSafe
          ].filter((img): img is File => img !== null);

          // Validar que haya al menos 1 imagen (mínimo requerido)
          if (allImages.length === 0) {
            notificationService.error('Debe agregar al menos una imagen del producto', { autoClose: 7000 });
            setLoading(false);
            return;
          }

          // Validar que no exceda 6 imágenes
          if (allImages.length > 6) {
            notificationService.error('Máximo 6 imágenes permitidas', { autoClose: 7000 });
            setLoading(false);
            return;
          }

          const formDataToSend = mapUploadFormToFormData(form as UploadProductFormData);

          // Agregar storeId si está disponible
          const storeId = (storeQuery.data as { id?: string } | undefined)?.id;
          if (storeId) {
            formDataToSend.append('storeId', storeId);
          }

          // Agregar todas las imágenes (portada + fotos del producto)
          // Limpiar las imágenes anteriores del FormData
          formDataToSend.delete('photos');
          formDataToSend.delete('photoTypes');

          // Construir array de tipos de fotos: primera es cover, resto son product
          const photoTypes: string[] = ['cover'];
          productImagesSafe.forEach(() => photoTypes.push('product'));

          allImages.forEach((image) => {
            formDataToSend.append('photos', image);
          });

          // Agregar tipos de fotos
          if (photoTypes.length > 0) {
            formDataToSend.append('photoTypes', JSON.stringify(photoTypes));
          }

          const meta = buildProductMeta(
            {
              brand: technicalSheet.brand,
              model: technicalSheet.model,
              condition: technicalSheet.condition,
              category: technicalSheet.category,
              dimensionsWidth: technicalSheet.dimensionsWidth,
              dimensionsHeight: technicalSheet.dimensionsHeight,
              dimensionsDepth: technicalSheet.dimensionsDepth,
              dimensionsUnit: technicalSheet.dimensionsUnit,
              weightValue: technicalSheet.weightValue,
              weightUnit: technicalSheet.weightUnit,
            },
            extraAttributes.map(a => ({ name: a.name, value: a.value })),
            {
              promoReturn: form.promoReturn,
              promoReturnInfo: form.promoReturnInfo,
              promoShipping: form.promoShipping,
              promoShippingTime: form.promoShippingTime,
              promoShippingInfo: form.promoShippingInfo,
              promoBanks: form.promoBanks,
              promoBanksInfo: form.promoBanksInfo,
            }
          );

          // Solo agregar meta si tiene contenido válido y no es un objeto vacío
          // Verificar que meta no sea undefined, null, o un objeto vacío
          if (meta && typeof meta === 'object' && meta !== null && Object.keys(meta).length > 0) {
            try {
              const metaString = JSON.stringify(meta);
              if (metaString && metaString !== 'undefined' && metaString !== 'null' && metaString !== '{}') {
                formDataToSend.append('meta', metaString);
              }
            } catch {
              // Error al stringificar meta
            }
          }

          await createProduct.mutateAsync(formDataToSend);
          // La notificación se maneja en el componente usando toast

          // Esperar explícitamente a que las queries se refetcheen antes de redirigir
          // Esto asegura que la página de home tenga los datos actualizados al cargar
          const accountId = (profileData as { id?: string })?.id;
          const PRODUCTS_KEY = ['products'];

          // Invalidar y refetchear las queries de productos
          await queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });

          // Si hay accountId, también refetchear la query específica del usuario
          if (accountId) {
            const byAccountKey = [...PRODUCTS_KEY, 'byAccount', accountId];
            await queryClient.invalidateQueries({ queryKey: byAccountKey });
            await queryClient.refetchQueries({ queryKey: byAccountKey });
          }

          // Refetchear la query general de productos
          await queryClient.refetchQueries({ queryKey: PRODUCTS_KEY });

          // Usar replace en lugar de push para evitar problemas de navegación
          router.replace('/admin/panel/home');
        }
      }

      // Si no es la última pestaña, avanzar a la siguiente
      const nextTab = tabs.findIndex(tab => Number(tab.id) === Number(currentTab.id) + 1);
      if (nextTab === -1) return;

      const newTabs = tabs.map((tab, idx) => ({
        ...tab,
        isActive: nextTab === idx,
      }));
      newTabs[nextTab].disabled = false;

      setTabs(newTabs);
      setLoading(false);
    } catch (error) {
      console.error('Error en el formulario:', error);
      // El error será capturado por los useEffect del componente que monitorean
      // createProduct.isError y updateProduct.isError
      setLoading(false);
      // No re-lanzar el error, React Query ya lo maneja en el estado de la mutación
    }
  };

  // Función para validar si el formulario está completo y válido
  // Solo título, imagen y categoría son obligatorios
  const isFormValid = (): boolean => {
    if (!form.name?.trim()) return false;

    const categoryValue = form.category?.trim() || "";
    const isDefaultCategory = categoryValue === "" ||
      categoryValue === "Seleccionar categoría" ||
      categoryValue.toLowerCase() === "seleccionar categoría";
    if (!categoryValue || isDefaultCategory) return false;

    const gallery = Array.isArray(form.productImages) ? form.productImages : [];
    const hasImages = Boolean(form.coverImage) || gallery.length > 0;
    if (!hasImages) return false;

    const totalImages = (form.coverImage ? 1 : 0) + gallery.length;
    if (totalImages > 6) return false;

    if (form.year) {
      const yearNumber = Number(form.year);
      const currentYear = new Date().getFullYear();
      if (Number.isNaN(yearNumber) || yearNumber > currentYear || yearNumber < 1900) return false;
    }

    if (form.shipping) {
      const weight = typeof form.shippingWeight === 'string' ? parseFloat(form.shippingWeight) : Number(form.shippingWeight);
      const height = typeof form.shippingHeight === 'string' ? parseFloat(form.shippingHeight) : Number(form.shippingHeight);
      const width = typeof form.shippingWidth === 'string' ? parseFloat(form.shippingWidth) : Number(form.shippingWidth);
      const length = typeof form.shippingLength === 'string' ? parseFloat(form.shippingLength) : Number(form.shippingLength);
      if (!weight || weight <= 0 || Number.isNaN(weight)) return false;
      if (!height || height <= 0 || Number.isNaN(height)) return false;
      if (!width || width <= 0 || Number.isNaN(width)) return false;
      if (!length || length <= 0 || Number.isNaN(length)) return false;
    }

    return true;
  };

  return {
    // Estado
    tabs,
    showInfo,
    form,
    technicalSheet,
    extraAttributes,
    loading,
    cryptos,

    // Hooks de productos
    createProduct,
    updateProduct,
    productQuery,

    // Handlers
    handleChange,
    handleSwitch,
    handleCryptoSelect,
    handleDaysSelect,
    handleCloseInfo,
    addTechnicalAttribute,
    deleteTechnicalAttribute,
    handleChangeTechnicalAttribute,
    handleCoverImageChange,
    handleProductImagesChange,
    handleTabClick,
    handleSubmit,

    // Setters directos (para casos especiales)
    setTechnicalSheet,

    // Validación
    isFormValid,
  };
};

