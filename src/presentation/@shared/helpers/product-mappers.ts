import { CreateProductRequest } from '../hooks/use-products';

// Tipo para el formulario de upload-product
export interface UploadProductFormData {
  name: string;
  description: string;
  promotion: string;
  category: string;
  condition: string;
  year: string;
  coverImage: File | null; // Portada (1 foto obligatoria)
  productImages?: File[]; // Fotos del producto (hasta 5)
  priceUSDT: number;
  priceARS: number;
  crypto: number[];
  stock: number;
  shipping: boolean;
  shippingWeight: number;
  shippingHeight: number;
  shippingWidth: number;
  shippingLength: number;
  promoReturn: string;
  promoReturnInfo: string;
  promoShipping: string;
  promoShippingTime: string;
  promoShippingInfo: string;
  promoBanks: string;
  promoBanksInfo: string;
}

// Mapear datos del formulario a la estructura de la API
export const mapUploadFormToCreateRequest = (
  formData: UploadProductFormData,
  accountId: string
): CreateProductRequest => {
  // Mapear condición del español al inglés
  const conditionMap: Record<string, 'new' | 'used'> = {
    'Nuevo': 'new',
    'Usado': 'used',
    'Reacondicionado': 'used', // Mapear como usado por defecto
  };

  // Mapear categoría a código de identificación (esto debería venir de la API de categorías)
  const categoryMap: Record<string, string> = {
    'Electrónica': 'electronics',
    'Ropa': 'clothing',
    'Hogar': 'home',
    'Deportes': 'sports',
    'Juguetes': 'toys',
    'Libros': 'books',
  };

  // Determinar el precio principal (USDT siempre está presente)
  const price = formData.priceUSDT;
  const crypto = formData.crypto.includes(1) ? 'USDT' : 'ARS'; // 1 = USDT, 2 = ARS

  // Construir el objeto base
  const createRequest: CreateProductRequest = {
    name: formData.name,
    price: price,
    crypto: crypto,
    description: formData.description,
    category_identification_code: categoryMap[formData.category] || 'other',
    status: 'active',
    promotion: formData.promotion === 'Ninguna' ? undefined : formData.promotion,
    year: Number.parseInt(formData.year, 10),
    condition: conditionMap[formData.condition] || 'new',
    active_status: 1, // Activo por defecto
    account_id: accountId,
  };

  // Agregar información de envío si está habilitado
  if (formData.shipping) {
    createRequest.shipping = {
      origin: {
        address: 'Dirección del vendedor', // Esto debería venir del perfil del usuario
        city: 'Ciudad del vendedor',
        state: 'Estado del vendedor',
        postal_code: '00000',
        country: 'Argentina',
      },
      dimensions: {
        length: formData.shippingLength,
        width: formData.shippingWidth,
        height: formData.shippingHeight,
      },
      weight: formData.shippingWeight,
      content_type: 'General',
      declared_value: price,
      shipping_method: 'Standard',
    };

    createRequest.location = {
      latitude: -34.6037, // Buenos Aires por defecto
      longitude: -58.3816,
      address: 'Dirección del vendedor',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      country: 'Argentina',
      postal_code: '1000',
    };
  }

  return createRequest;
};

// Solo título, imagen y categoría son obligatorios. Todo lo demás es opcional.
export const validateUploadFormData = (formData: UploadProductFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.name?.trim()) {
    errors.push('El nombre del producto es obligatorio');
  }

  if (!formData.category || formData.category.trim() === '' || formData.category === 'Seleccionar categoría') {
    errors.push('Debe seleccionar una categoría');
  }

  // Validar imagen: debe haber coverImage o al menos una en productImages
  const gallery = Array.isArray(formData.productImages) ? formData.productImages : [];
  const hasImage = Boolean(formData.coverImage) || gallery.length > 0;
  if (!hasImage) {
    errors.push('Debe agregar al menos una imagen del producto');
  }

  // Validaciones opcionales: solo si el usuario ingresó valores
  if (formData.year && formData.year !== '') {
    const yearNum = Number.parseInt(formData.year, 10);
    if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      errors.push('El año debe ser válido');
    }
  }

  if (formData.shipping) {
    if (formData.shippingWeight <= 0) {
      errors.push('El peso del envío debe ser mayor a 0');
    }
    if (formData.shippingLength <= 0 || formData.shippingWidth <= 0 || formData.shippingHeight <= 0) {
      errors.push('Las dimensiones del envío deben ser mayores a 0');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Convierte los datos del formulario a FormData para enviar con archivos
 * @param formData - Datos del formulario
 * @returns FormData listo para enviar a la API
 */
export const mapUploadFormToFormData = (
  formData: UploadProductFormData
): FormData => {
  const form = new FormData();

  // Permitir que el caller agregue luego accountId; aquí sólo contemplamos si estuviera en el objeto
  const maybeAny = formData as unknown as { accountId?: string };
  if (maybeAny?.accountId) {
    form.append('accountId', String(maybeAny.accountId));
  }

  // Mapear condición del español al inglés
  const conditionMap: Record<string, 'new' | 'used'> = {
    'Nuevo': 'new',
    'Usado': 'used',
    'Reacondicionado': 'used',
  };

  // Datos básicos del producto (description opcional, puede estar vacío)
  form.append('name', formData.name);
  form.append('description', formData.description || '');

  // ms-products espera el nombre de la categoría directamente en category_identification_code
  // El servicio busca la categoría por nombre y usa su ID
  // Si no existe, la crea automáticamente
  const categoryName = formData.category && formData.category !== 'Seleccionar categoría'
    ? formData.category.trim()
    : '';

  console.log('[mapUploadFormToFormData] Categoría seleccionada:', categoryName);

  if (!categoryName) {
    console.warn('[mapUploadFormToFormData] Categoría vacía o inválida');
  }

  // El DTO espera categoryIdentificationCode (camelCase), no category_identification_code (snake_case)
  form.append('categoryIdentificationCode', categoryName || 'other');
  form.append('status', 'active');
  if (formData.promotion && formData.promotion !== 'Ninguna') {
    form.append('promotion', formData.promotion);
  }
  // Year opcional: usar actual si está vacío
  const yearValue = (formData.year && !isNaN(Number(formData.year)) && Number(formData.year) >= 1900)
    ? String(Number(formData.year))
    : String(new Date().getFullYear());
  form.append('year', yearValue);
  form.append('condition', conditionMap[formData.condition] || 'new');
  // El DTO espera activeStatus (camelCase), no active_status (snake_case)
  // Asegurar que activeStatus sea un número válido (1 o 0)
  const activeStatusValue = formData.stock > 0 ? '1' : '0';
  form.append('activeStatus', activeStatusValue);

  // Enviar stock al backend
  form.append('stock', String(formData.stock || 0));

  // Construir pricing según la estructura esperada por ms-products
  const pricingValues: Array<{ currency: string; amount: number; usdPerUnit: number }> = [];

  // Agregar USDT si está seleccionado
  if (formData.crypto.includes(1) && formData.priceUSDT > 0) {
    pricingValues.push({
      currency: 'USDT',
      amount: formData.priceUSDT,
      usdPerUnit: 1, // USDT siempre tiene usdPerUnit = 1
    });
  }

  // Agregar ARS si está seleccionado
  if (formData.crypto.includes(2) && formData.priceARS > 0 && formData.priceUSDT > 0) {
    // Calcular usdPerUnit basado en la relación USDT/ARS
    const usdPerUnit = formData.priceUSDT / formData.priceARS;
    pricingValues.push({
      currency: 'ARS',
      amount: formData.priceARS,
      usdPerUnit: usdPerUnit,
    });
  }

  // Si no hay valores de pricing, usar USDT con amount 0 (precio "a consultar" o por defecto)
  if (pricingValues.length === 0) {
    pricingValues.push({
      currency: 'USDT',
      amount: formData.priceUSDT > 0 ? formData.priceUSDT : 0,
      usdPerUnit: 1,
    });
  }

  const pricing = {
    referenceBase: 'USD',
    referenceAt: new Date().toISOString(),
    values: pricingValues,
  };

  console.log('[mapUploadFormToFormData] Pricing construido:', pricing);
  form.append('pricing', JSON.stringify(pricing));

  // Agregar archivos de imágenes: portada + fotos del producto
  const photoTypes: string[] = [];
  if (formData.coverImage instanceof File) {
    form.append('photos', formData.coverImage);
    photoTypes.push('cover');
  }
  const galleryImages = Array.isArray(formData.productImages) ? formData.productImages : [];
  galleryImages.forEach((image) => {
    if (image instanceof File) {
      form.append('photos', image);
      photoTypes.push('product');
    }
  });

  // Agregar array de tipos de fotos como JSON string
  if (photoTypes.length > 0) {
    form.append('photoTypes', JSON.stringify(photoTypes));
  }

  // Agregar información de envío si está habilitado (como JSON string)
  if (formData.shipping) {
    const shippingData = {
      origin: {
        address: 'Dirección del vendedor',
        city: 'Ciudad del vendedor',
        state: 'Estado del vendedor',
        postalCode: '00000', // El backend espera camelCase, no snake_case
        country: 'Argentina',
      },
      dimensions: {
        length: formData.shippingLength ? (typeof formData.shippingLength === 'string' ? parseFloat(formData.shippingLength) || 0 : Number(formData.shippingLength) || 0) : 0,
        width: formData.shippingWidth ? (typeof formData.shippingWidth === 'string' ? parseFloat(formData.shippingWidth) || 0 : Number(formData.shippingWidth) || 0) : 0,
        height: formData.shippingHeight ? (typeof formData.shippingHeight === 'string' ? parseFloat(formData.shippingHeight) || 0 : Number(formData.shippingHeight) || 0) : 0,
      },
      weight: formData.shippingWeight ? (typeof formData.shippingWeight === 'string' ? parseFloat(formData.shippingWeight) || 0 : Number(formData.shippingWeight) || 0) : 0,
      contentType: 'General', // El backend espera camelCase, no snake_case
      declaredValue: Number(formData.priceUSDT) || 0, // El backend espera camelCase, no snake_case
      shippingMethod: 'Standard', // El backend espera camelCase, no snake_case
    };
    form.append('shipping', JSON.stringify(shippingData));

    const locationData = {
      latitude: -34.6037,
      longitude: -58.3816,
      address: 'Dirección del vendedor',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      country: 'Argentina',
      postalCode: '1000', // El backend espera camelCase, no snake_case
    };
    form.append('location', JSON.stringify(locationData));
  }

  return form;
};

// Helper: construir metadata (ficha técnica y promociones) desde el formulario
export const buildProductMeta = (
  technicalSheet: Record<string, unknown> | undefined,
  extraAttributes: { name: string; value: string }[],
  promotions?: {
    promoReturn?: string;
    promoReturnInfo?: string;
    promoShipping?: string;
    promoShippingTime?: string;
    promoShippingInfo?: string;
    promoBanks?: string;
    promoBanksInfo?: string;
  },
): Record<string, unknown> => {
  console.log('[buildProductMeta] Iniciando construcción de meta');
  console.log('[buildProductMeta] technicalSheet recibido:', technicalSheet);
  console.log('[buildProductMeta] extraAttributes recibidos:', extraAttributes);
  console.log('[buildProductMeta] promotions recibidas:', promotions);

  const specs: Record<string, unknown> = {};
  for (const attr of extraAttributes) {
    if (!attr.name || !attr.name.trim()) {
      console.log('[buildProductMeta] Atributo sin nombre válido, saltando:', attr);
      continue;
    }
    // Solo agregar atributos con nombre y valor válidos
    if (attr.value && attr.value.trim()) {
      specs[attr.name] = attr.value;
      console.log('[buildProductMeta] Atributo agregado a specs:', attr.name, '=', attr.value);
    } else {
      console.log('[buildProductMeta] Atributo sin valor válido, saltando:', attr.name);
    }
  }

  // Dimensiones normalizadas (permitir decimales)
  const dwStr = String(technicalSheet?.dimensionsWidth || '').trim();
  const dhStr = String(technicalSheet?.dimensionsHeight || '').trim();
  const ddStr = String(technicalSheet?.dimensionsDepth || '').trim();
  const du = technicalSheet?.dimensionsUnit as string | undefined;

  const dw = dwStr ? parseFloat(dwStr) : NaN;
  const dh = dhStr ? parseFloat(dhStr) : NaN;
  const dd = ddStr ? parseFloat(ddStr) : NaN;

  // Solo agregar dimensions si hay al menos un valor válido
  const hasValidDimensions = (!Number.isNaN(dw) && dw > 0) ||
                             (!Number.isNaN(dh) && dh > 0) ||
                             (!Number.isNaN(dd) && dd > 0) ||
                             (du && du.trim());

  if (hasValidDimensions) {
    const dimensions: Record<string, unknown> = {};
    if (!Number.isNaN(dw) && dw > 0) dimensions.width = dw;
    if (!Number.isNaN(dh) && dh > 0) dimensions.height = dh;
    if (!Number.isNaN(dd) && dd > 0) dimensions.depth = dd;
    if (du && du.trim()) dimensions.unit = du;

    if (Object.keys(dimensions).length > 0) {
      specs.dimensions = dimensions;
    }
  }

  // Peso normalizado (permitir decimales)
  const wvStr = String(technicalSheet?.weightValue || '').trim();
  const wu = technicalSheet?.weightUnit as string | undefined;
  const wv = wvStr ? parseFloat(wvStr) : NaN;

  // Solo agregar weight si hay al menos un valor válido
  const hasValidWeight = (!Number.isNaN(wv) && wv > 0) || (wu && wu.trim());

  if (hasValidWeight) {
    const weight: Record<string, unknown> = {};
    if (!Number.isNaN(wv) && wv > 0) weight.value = wv;
    if (wu && wu.trim()) weight.unit = wu;

    if (Object.keys(weight).length > 0) {
      specs.weight = weight;
    }
  }

  // Construir technicalSheet solo si hay datos válidos
  const technicalSheetData: Record<string, unknown> = {};
  const brand = technicalSheet?.brand as string | undefined;
  const model = technicalSheet?.model as string | undefined;

  if (brand && brand.trim()) {
    technicalSheetData.brand = brand;
  }
  if (model && model.trim()) {
    technicalSheetData.model = model;
  }

  // Solo agregar specs si tiene contenido
  if (Object.keys(specs).length > 0) {
    technicalSheetData.specs = specs;
  }

  // Construir objeto meta con technicalSheet y promociones
  const meta: Record<string, unknown> = {};

  // Agregar technicalSheet si tiene contenido
  if (Object.keys(technicalSheetData).length > 0) {
    meta.technicalSheet = technicalSheetData;
  }

  // Agregar promociones si están disponibles
  if (promotions) {
    const promotionsData: Record<string, unknown> = {};

    if (promotions.promoReturn) promotionsData.promoReturn = promotions.promoReturn;
    if (promotions.promoReturnInfo) promotionsData.promoReturnInfo = promotions.promoReturnInfo;
    if (promotions.promoShipping) promotionsData.promoShipping = promotions.promoShipping;
    if (promotions.promoShippingTime) promotionsData.promoShippingTime = promotions.promoShippingTime;
    if (promotions.promoShippingInfo) promotionsData.promoShippingInfo = promotions.promoShippingInfo;
    if (promotions.promoBanks) promotionsData.promoBanks = promotions.promoBanks;
    if (promotions.promoBanksInfo) promotionsData.promoBanksInfo = promotions.promoBanksInfo;

    if (Object.keys(promotionsData).length > 0) {
      meta.promotions = promotionsData;
    }
  }

  // Retornar meta si tiene contenido, sino objeto vacío
  if (Object.keys(meta).length > 0) {
    console.log('[buildProductMeta] Meta construido con contenido:', Object.keys(meta));
    return meta;
  }

  // Si no hay datos, retornar un objeto vacío en lugar de undefined
  console.log('[buildProductMeta] No hay datos válidos, retornando objeto vacío');
  return {};
};
