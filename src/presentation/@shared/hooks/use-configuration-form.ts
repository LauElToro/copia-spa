'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useConfiguration } from './use-configuration';
import { useAccount } from './use-account';
import { useUserAvatar } from './use-user-avatar';
import { axiosHelper } from '../helpers/axios-helper';
import { useAuthContext } from '../contexts/auth-context';
import { useAuth } from './use-auth';
import type { ToastContextType } from '../components/ui/molecules/toast';

// Debug flag - set to true only for local debugging
const DEBUG_CONFIGURATION_FORM = false;

interface StoreData {
  id?: string;
  storeId?: string;
  store_id?: string;
  accountId?: string;
  account_id?: string;
  media?: {
    logo?: { smUrl?: string };
    banner?: {
      mobileUrl?: string;
      variants?: {
        mobile?: { url?: string };
        tablet?: { url?: string };
        desktop?: { url?: string };
        mobileUrl?: string;
      };
    };
  };
  [key: string]: unknown;
}

interface ConfigurationForm {
  id?: string;
  name?: string;
  storeName?: string;
  lastName?: string;
  holderInformation?: string;
  information?: string;
  email?: string;
  country?: string;
  description?: string;
  phone?: string;
  phoneCountryCode?: string;
  phoneAreaCode?: string;
  phoneNumber?: string;
  dni?: string;
  documentType?: string;
  documentNumber?: string;
  cuit?: string;
  commerceDocumentType?: string;
  province?: string;
  businessPhone?: string;
  businessPhoneCountryCode?: string;
  businessPhoneAreaCode?: string;
  businessPhoneNumber?: string;
  businessEmail?: string;
  website?: string;
  address?: string;
  postalCode?: string;
}

const fieldSchemas: Record<string, z.ZodTypeAny> = {
  name: z.string().min(1, 'Requerido'),
  storeName: z.string().min(1, 'Requerido').optional(),
  holderInformation: z.string().min(1, 'Requerido').optional(),
  information: z.string().min(1, 'Requerido').optional(),
  email: z.string().email('Email inválido').optional(),
  country: z.string().min(1, 'Requerido').optional(),
  phone: z.string().regex(/^[0-9+\-\s()]{6,20}$/, 'Teléfono inválido').optional(),
  dni: z.string().regex(/^\d{6,12}$/, 'DNI inválido').optional(),
  cuit: z.string().optional().refine((v) => {
    if (v === undefined || v === null || v === '') return true;
    // La validación de formato se hace en el nivel del formulario, no aquí
    return true;
  }, {
    message: 'CUIT inválido',
  }),
  province: z.string().min(1, 'Requerido').optional(),
  businessPhone: z.string().optional(),
  businessPhoneCountryCode: z.string().min(1, 'Código de país requerido').optional(),
  businessPhoneAreaCode: z.string().regex(/^\d{1,4}$/, 'Código de área inválido (1-4 dígitos)').optional(),
  businessPhoneNumber: z.string().regex(/^\d{6,10}$/, 'Número de teléfono inválido (6-10 dígitos)').optional(),
  businessEmail: z.string().email('Email inválido').optional(),
  website: z.union([
    z.string().url('URL inválida. Debe comenzar con http:// o https://'),
    z.literal('')
  ]).optional(),
  description: z.string().optional(),
  address: z.string().min(1, 'Requerido').optional(),
  postalCode: z.string().regex(/^\d{3,10}$/, 'Código postal inválido').optional(),
};

const getStoreId = (s: StoreData | undefined): string | undefined =>
  s?.id || s?.storeId || s?.store_id || s?.accountId || s?.account_id;

export const useConfigurationForm = (toast?: ToastContextType) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuthContext();
  const { storeQuery, userQuery, updateStoreMutation, uploadLogoMutation, uploadBannerMutation } = useConfiguration();
  const { updateUser: updateUserMutation } = useAccount();
  const { uploadAvatar, isUploadingAvatar, getErrorMessage } = useUserAvatar();
  const { refreshToken: refreshTokenMutation } = useAuth();

  // Leer el perfil para determinar el tipo de cuenta (usando useState y useEffect)
  const [isCommerce, setIsCommerce] = useState<boolean>(false);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const userStr = window.localStorage.getItem("user");
        if (userStr) {
          const profile = JSON.parse(userStr) as { accountType?: string; id?: string };
          setIsCommerce(profile?.accountType === 'commerce' || profile?.accountType === 'seller');
          setAccountId(profile?.id);
        } else {
          setIsCommerce(false);
          setAccountId(undefined);
        }
      } else {
        setIsCommerce(false);
        setAccountId(undefined);
      }
    } catch (error) {
      console.warn('[useConfigurationForm] Error leyendo perfil de localStorage:', error);
      setIsCommerce(false);
      setAccountId(undefined);
    }
  }, []);

  const [form, setForm] = useState<ConfigurationForm>({});
  // CRITICAL: Use ref to always have access to the latest form state
  // This fixes the React state timing issue where form values may be stale in closures
  const formRef = useRef<ConfigurationForm>({});

  // Keep formRef in sync with form state
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number>(0); // Timestamp del último guardado
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarCancelled, setAvatarCancelled] = useState<boolean>(false);
  const [logoCancelled, setLogoCancelled] = useState<boolean>(false);
  const [bannerCancelled, setBannerCancelled] = useState<boolean>(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Cargar avatar existente cuando se carga el usuario
  useEffect(() => {
    if (!isCommerce && userQuery.data && !avatarCancelled) {
      const userAdditionalInfo = userQuery.data.additionalInfo as Record<string, unknown> | undefined;
      const avatarData = userAdditionalInfo?.avatar;
      // Extraer URL del avatar (puede ser string o objeto)
      const existingAvatarUrl = typeof avatarData === 'string'
        ? avatarData
        : (avatarData && typeof avatarData === 'object' && 'url' in avatarData && typeof avatarData.url === 'string')
          ? avatarData.url
          : (avatarData && typeof avatarData === 'object' && 'original' in avatarData &&
            avatarData.original && typeof avatarData.original === 'object' &&
            'url' in avatarData.original && typeof avatarData.original.url === 'string')
            ? avatarData.original.url
            : undefined;

      // Solo actualizar si hay un avatar y no hay un file activo (para no sobrescribir una selección nueva)
      // CRÍTICO: No sobrescribir si el preview es un blob URL (indica que el usuario acaba de seleccionar una nueva imagen)
      if (existingAvatarUrl && !avatarFile) {
        const isBlobUrl = typeof avatarPreview === 'string' && avatarPreview.startsWith('blob:');
        // Si no hay preview o el preview es diferente al avatar existente, actualizar
        // Pero NO si es un blob URL (nueva selección del usuario)
        if ((!avatarPreview || avatarPreview !== existingAvatarUrl) && !isBlobUrl) {
          setAvatarPreview(existingAvatarUrl);
        }
      }
    }
  }, [userQuery.data, isCommerce, avatarFile, avatarCancelled, avatarPreview]);

  // Cargar logo y banner existentes cuando se cargan los datos del store (para comercios)
  useEffect(() => {
    if (isCommerce && storeQuery.data && !logoCancelled && !bannerCancelled) {
      const storeDataLocal = storeQuery.data as StoreData | undefined;

      // Función helper para extraer URL del logo desde objeto media completo
      const getLogoFromMedia = (media: unknown): string | undefined => {
        if (!media || typeof media !== 'object') return undefined;
        const mediaObj = media as Record<string, unknown>;
        const logo = mediaObj.logo;

        if (!logo || typeof logo !== 'object') return undefined;
        const logoObj = logo as Record<string, unknown>;

        // Estructura nueva: media.logo.variants.sm.url (o md, lg, xl)
        if (logoObj.variants && typeof logoObj.variants === 'object') {
          const variants = logoObj.variants as Record<string, unknown>;
          // Intentar en orden: sm, md, lg, xl
          for (const size of ['sm', 'md', 'lg', 'xl']) {
            const variant = variants[size];
            if (variant && typeof variant === 'object') {
              const variantObj = variant as Record<string, unknown>;
              if (typeof variantObj.url === 'string') {
                return variantObj.url;
              }
            }
          }
        }

        // Estructura antigua: media.logo.smUrl
        if (typeof logoObj.smUrl === 'string') return logoObj.smUrl;
        if (typeof logoObj.url === 'string') return logoObj.url;

        return undefined;
      };

      // Usar la misma lógica que getExistingLogo() en la página
      const existingLogo = getLogoFromMedia(storeDataLocal?.media) ||
        getLogoFromMedia((storeQuery.data && typeof storeQuery.data === 'object' && 'media' in storeQuery.data ? storeQuery.data.media : undefined)) ||
        (storeDataLocal?.information && typeof storeDataLocal.information === 'object' && !Array.isArray(storeDataLocal.information)
          ? (storeDataLocal.information as Record<string, unknown>)?.logo as string | undefined
          : undefined) ||
        (storeQuery.data && typeof storeQuery.data === 'object' && 'information' in storeQuery.data &&
          storeQuery.data.information && typeof storeQuery.data.information === 'object' &&
          !Array.isArray(storeQuery.data.information)
          ? (storeQuery.data.information as Record<string, unknown>)?.logo as string | undefined
          : undefined);

      // Solo actualizar si hay un logo y no hay un file activo
      if (existingLogo && !logoFile) {
        // Si no hay preview o el preview es diferente al logo existente, actualizar
        if (!logoPreview || logoPreview !== existingLogo) {
          setLogoPreview(existingLogo);
          // También actualizar avatarPreview para que se muestre el logo como avatar
          setAvatarPreview(existingLogo);
        }
      }

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

      // Usar la misma lógica que getExistingBanner() en la página
      const existingBanner = getBannerFromMedia(storeDataLocal?.media) ||
        (storeDataLocal?.information && typeof storeDataLocal.information === 'object' && !Array.isArray(storeDataLocal.information)
          ? (storeDataLocal.information as Record<string, unknown>)?.banner as string | undefined
          : undefined) ||
        (storeQuery.data && typeof storeQuery.data === 'object' && 'media' in storeQuery.data
          ? getBannerFromMedia((storeQuery.data as Record<string, unknown>).media)
          : (storeQuery.data && typeof storeQuery.data === 'object' && 'information' in storeQuery.data &&
            storeQuery.data.information && typeof storeQuery.data.information === 'object' &&
            !Array.isArray(storeQuery.data.information)
            ? (storeQuery.data.information as Record<string, unknown>)?.banner as string | undefined
            : undefined));

      // Solo actualizar si hay un banner y no hay un file activo
      if (existingBanner && !bannerFile) {
        // Si no hay preview o el preview es diferente al banner existente, actualizar
        if (!bannerPreview || bannerPreview !== existingBanner) {
          setBannerPreview(existingBanner);
        }
      }
    }
  }, [storeQuery.data, isCommerce, logoFile, logoCancelled, logoPreview, bannerFile, bannerCancelled, bannerPreview]);

  const storeData = storeQuery.data as StoreData | undefined;

  const validateField = (key: string, value: unknown) => {
    const schema = fieldSchemas[key];
    if (!schema) return;
    const result = schema.safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [key]: result.success ? '' : (result.error?.issues?.[0]?.message || 'Dato inválido')
    }));
  };

  // Cargar datos del store y user en el formulario
  useEffect(() => {
    // CRÍTICO: NO ejecutar el useEffect si se está guardando
    // Esto evita que el formulario se resetee mientras se construye el payload
    if (isSaving) {
      if (DEBUG_CONFIGURATION_FORM) console.log('[useConfigurationForm] useEffect omitido porque isSaving es true');
      return;
    }

    // FIX: Reduced cooldown from 5s to 2s - long enough to prevent reset, short enough to get updates
    // This prevents the form from being reset by server data immediately after saving
    // while still allowing server updates (like normalized values) to come through reasonably quickly
    const now = Date.now();
    const SAVE_COOLDOWN_MS = 2000;
    if (lastSavedAt > 0 && (now - lastSavedAt) < SAVE_COOLDOWN_MS) {
      if (DEBUG_CONFIGURATION_FORM) console.log('[useConfigurationForm] useEffect omitido porque acabamos de guardar hace', now - lastSavedAt, 'ms');
      return;
    }

    const store = storeQuery.data as StoreData & {
      holderInformation?: {
        name?: string;
        lastName?: string;
        email?: string;
        country?: string;
        documentType?: string;
        identityDocument?: number;
        phone?: {
          countryCode?: string;
          areaCode?: string;
          number?: string;
        };
      };
      information?: {
        cuitCuil?: string;
        documentType?: string;
        description?: string;
        website?: string;
        phone?: {
          countryCode?: string;
          areaCode?: string;
          number?: string;
        };
        location?: {
          address?: string;
          city?: string;
          state?: string;
          country?: string;
          postalCode?: string;
        };
      };
      name?: string;
      email?: string;
      country?: string;
      province?: string;
      address?: string;
      postalCode?: string;
      website?: string;
      businessEmail?: string;
      businessPhone?: string;
      cuit?: string;
      Phone?: { number?: string };
      dni?: string;
    };
    const user = userQuery.data as {
      name?: string;
      email?: string;
      phone?: { countryCode?: string; areaCode?: string; number?: string };
      Phone?: { countryCode?: string; areaCode?: string; number?: string };
      dni?: number;
      additionalInfo?: Record<string, unknown>;
    };

    // Función helper para formatear teléfono desde objeto
    const formatPhoneFromObject = (phoneObj: { countryCode?: string; areaCode?: string; number?: string } | undefined): string => {
      if (!phoneObj) return '';
      if (typeof phoneObj === 'string') return phoneObj;
      const { countryCode, areaCode, number } = phoneObj;
      if (areaCode && number) {
        return countryCode ? `${countryCode} ${areaCode}${number}` : `${areaCode}${number}`;
      }
      return '';
    };


    if (store || user) {
      // Obtener teléfono del usuario (puede venir como phone o Phone)
      const userPhone = user?.phone || user?.Phone;
      const formattedUserPhone = formatPhoneFromObject(userPhone);

      // Extraer componentes del teléfono del usuario
      const userPhoneCountryCode = userPhone?.countryCode || '';
      const userPhoneAreaCode = userPhone?.areaCode || '';
      const userPhoneNumber = userPhone?.number || '';

      // Obtener teléfono del holderInformation (camelCase)
      const holderInfo = (typeof store?.holderInformation === 'object' && store?.holderInformation !== null)
        ? store.holderInformation
        : undefined;
      const holderPhone = holderInfo?.phone;
      const formattedHolderPhone = formatPhoneFromObject(holderPhone);

      // Extraer componentes del teléfono del holder (camelCase)
      const holderPhoneCountryCode = holderPhone?.countryCode || userPhoneCountryCode || '';
      const holderPhoneAreaCode = holderPhone?.areaCode || userPhoneAreaCode || '';
      const holderPhoneNumber = holderPhone?.number || userPhoneNumber || '';

      // Obtener email del usuario desde ms-auth (validateToken) o desde additionalInfo como fallback
      const userEmail = user?.email || (user?.additionalInfo as Record<string, unknown> | undefined)?.email as string | undefined;

      // Si no hay email en userQuery, intentar obtenerlo desde localStorage (que viene de validateToken)
      let emailFromAuth: string | undefined;
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const userStr = window.localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr) as { email?: string };
            emailFromAuth = userData?.email;
          }
        } catch (error) {
          console.warn('[useConfigurationForm] Error leyendo email de localStorage:', error);
        }
      }

      // Obtener DNI desde holderInformation (camelCase)
      const dniFromStore = holderInfo?.identityDocument;
      const dniFromUser = user?.dni;
      const resolvedDni = dniFromStore ? String(dniFromStore) : (dniFromUser ? String(dniFromUser) : undefined);

      // Obtener nombre del holder desde holderInformation (camelCase)
      const holderName = holderInfo?.name;
      const holderLastName = holderInfo?.lastName;
      const holderCountry = holderInfo?.country;
      const holderDocumentType = holderInfo?.documentType;

      // Obtener documentType y documentNumber desde holderInformation o additionalInfo
      const userAdditionalInfo = user?.additionalInfo as Record<string, unknown> | undefined;
      const documentType = holderDocumentType ||
        (userAdditionalInfo?.documentType as string | undefined) ||
        (dniFromStore ? 'DNI' : undefined);
      const documentNumber = (userAdditionalInfo?.documentNumber as string | undefined) || resolvedDni;

      // Obtener lastName y country desde additionalInfo del usuario (prioridad) o holderInformation
      const userLastName = (userAdditionalInfo?.lastName as string | undefined);
      const userCountry = (userAdditionalInfo?.country as string | undefined);

      // Dividir nombre completo en name y lastName si es posible
      // Priorizar lastName del holderInformation, luego additionalInfo, luego dividir nombre completo
      const fullName = holderName || user?.name || store?.name || '';
      let lastName = holderLastName || userLastName || '';
      if (!lastName && fullName && typeof fullName === 'string') {
        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length > 1) {
          lastName = nameParts.slice(1).join(' ');
        }
      }

      // Obtener email del holder desde holderInformation (camelCase)
      const holderEmail = holderInfo?.email;

      // Obtener información del comercio (camelCase)
      const storeInfo = typeof store?.information === 'object' ? store.information : undefined;
      const storeCuit = storeInfo?.cuitCuil || store?.cuit;

      // Debug: Log específico para CUIT
      if (store) {
        if (DEBUG_CONFIGURATION_FORM) {
          console.log('[useConfigurationForm] CUIT Debug:', {
            hasStore: !!store,
            hasInformation: !!store?.information,
            informationType: typeof store?.information,
            hasStoreInfo: !!storeInfo,
            storeInfoType: typeof storeInfo,
            cuitCuilInStoreInfo: storeInfo && 'cuitCuil' in storeInfo,
            cuitCuilValue: storeInfo?.cuitCuil,
            cuitCuilType: typeof storeInfo?.cuitCuil,
            cuitInStore: store?.cuit,
            resolvedCuit: storeCuit,
          });
        }
      }
      const storeDescription = storeInfo?.description;
      // Extraer website: primero de information.website, luego de store.website, manejar null/undefined/empty string
      const storeWebsite = (storeInfo?.website !== null && storeInfo?.website !== undefined && storeInfo?.website !== '')
        ? storeInfo.website
        : (store?.website !== null && store?.website !== undefined && store?.website !== '')
          ? store.website
          : undefined;

      // Obtener documentType desde information si existe (camelCase)
      // IMPORTANTE: Declarar ANTES del console.log para evitar "Cannot access uninitialized variable"
      let cuitDocumentType: string | undefined = undefined;
      if (storeInfo && storeInfo.documentType !== null && storeInfo.documentType !== undefined) {
        cuitDocumentType = String(storeInfo.documentType);
        if (cuitDocumentType === '') {
          cuitDocumentType = undefined;
        }
      } else if (storeCuit) {
        // Fallback: Intentar inferir el tipo desde el formato del CUIT/CUIL
        // Nota: En Argentina, CUIT y CUIL usan prefijos similares:
        // - 20, 23, 24: Masculino (puede ser CUIT o CUIL)
        // - 27: Femenino (puede ser CUIT o CUIL)
        // - 30, 33, 34: Persona jurídica/empresa (siempre es CUIT)
        const cleaned = String(storeCuit).replace(/[^0-9]/g, '');
        if (cleaned.length === 11) {
          const firstTwo = cleaned.substring(0, 2);
          // Solo podemos estar seguros que es CUIT para personas jurídicas (30, 33, 34)
          if (['30', '33', '34'].includes(firstTwo)) {
            cuitDocumentType = 'CUIT';
          } else if (['20', '23', '24', '27'].includes(firstTwo)) {
            // Para personas físicas, podría ser CUIT o CUIL - defaultear a CUIT
            // ya que es más común para comercios
            cuitDocumentType = 'CUIT';
          }
          // Si no coincide con ningún prefijo conocido, dejamos undefined
        }
      }

      // Debug: Log para verificar que los datos se están cargando correctamente
      if (store) {
        if (DEBUG_CONFIGURATION_FORM) {
          console.log('[useConfigurationForm] Loading store data:', {
            hasStoreInfo: !!storeInfo,
            cuitFromInfo: storeInfo?.cuitCuil,
            cuitFromStore: store?.cuit,
            resolvedCuit: storeCuit,
            documentTypeFromInfo: storeInfo?.documentType,
            resolvedDocumentType: cuitDocumentType,
            websiteFromInfo: storeInfo?.website,
            websiteFromStore: store?.website,
            resolvedWebsite: storeWebsite,
            holderEmail: holderEmail,
            storeEmail: store?.email,
            fullInformation: JSON.stringify(storeInfo, null, 2),
          });
        }
      }
      const storeBusinessPhone = storeInfo?.phone ? formatPhoneFromObject(storeInfo.phone) : store?.businessPhone;
      const storeLocation = storeInfo?.location;

      // Extraer componentes del teléfono del negocio (camelCase)
      const businessPhoneObj = storeInfo?.phone;
      const businessPhoneCountryCode = businessPhoneObj?.countryCode || '';
      const businessPhoneAreaCode = businessPhoneObj?.areaCode || '';
      const businessPhoneNumber = businessPhoneObj?.number || '';

      setForm((prev) => {
        // CRÍTICO: Si los valores del formulario ya existen y son diferentes a los del servidor,
        // preservar los valores del formulario (que son los que el usuario acaba de guardar)
        // Solo cargar valores del servidor si el formulario está vacío

        // Email del usuario autenticado (ms-auth) para "Información del titular"
        // CRÍTICO: Prioridad para resolver el email del titular:
        // 1. Valor actual del formulario (si existe y no está vacío)
        // 2. Email guardado en holderInformation (del servidor)
        // 3. Email del usuario autenticado
        // 4. Email de auth context
        const storeEmailValue = store?.email as string | undefined;
        let resolvedUserEmail: string | undefined;

        // FIX: Simplificar la lógica del email - el bug anterior filtraba holderEmail
        // si era igual a storeEmailValue, causando que el campo se vaciara
        if (prev.email && prev.email !== '') {
          // Si ya hay un email en el formulario, preservarlo
          resolvedUserEmail = prev.email;
        } else if (holderEmail && holderEmail !== '') {
          // Si no hay email en el formulario, usar el del holder (del servidor)
          // Este es el valor que guardamos en holderInformation.email
          resolvedUserEmail = holderEmail;
        } else {
          // Fallback: buscar de otras fuentes (pero no del store.email que es del comercio)
          const candidates = [userEmail, emailFromAuth].filter(
            (email) => email && email !== '' && email !== storeEmailValue
          );
          resolvedUserEmail = candidates[0] || undefined;
        }

        // Email de la tienda para "Información del comercio"
        // Usar businessEmail si existe, sino usar el email de la tienda
        const resolvedBusinessEmail = store?.businessEmail ?? store?.email ?? prev.businessEmail;

        // CRÍTICO: Preservar TODOS los valores del formulario si ya existen
        // Solo actualizar con valores del servidor si el campo está vacío en el formulario
        return {
          ...prev,
          id: getStoreId(store) ?? prev.id,
          // Preservar valores del formulario si existen, sino cargar del servidor
          name: (prev.name && prev.name !== '') ? prev.name : (holderName ?? user?.name ?? prev.name),
          storeName: (prev.storeName && prev.storeName !== '') ? prev.storeName : (store?.name ?? prev.storeName),
          // FIX: Handle null/undefined explicitly to prevent "zombie" data reappearing
          // If prev.lastName is null (intentionally cleared), don't fall back to server value
          lastName: prev.lastName !== undefined
            ? (prev.lastName !== null && prev.lastName !== '' ? prev.lastName : prev.lastName)
            : (lastName || undefined),
          holderInformation: prev.holderInformation || (typeof store?.holderInformation === 'string' ? store.holderInformation : (holderName ?? user?.name ?? prev.holderInformation)),
          information: prev.information || (typeof store?.information === 'string' ? store.information : (storeDescription ?? prev.information)),
          // FIX: Simplified email assignment - resolvedUserEmail already handles priority
          email: resolvedUserEmail,
          country: (prev.country && prev.country !== '') ? prev.country : (holderCountry ?? userCountry ?? storeLocation?.country ?? store?.country ?? prev.country),
          // FIX: Don't fall back to city for province - they're semantically different
          province: (prev.province && prev.province !== '') ? prev.province : (storeLocation?.state ?? store?.province ?? prev.province),
          address: (prev.address && prev.address !== '') ? prev.address : (storeLocation?.address ?? store?.address ?? prev.address),
          postalCode: (prev.postalCode && prev.postalCode !== '') ? prev.postalCode : (storeLocation?.postalCode ?? store?.postalCode ?? prev.postalCode),
          website: (prev.website && prev.website !== '') ? prev.website : (storeWebsite !== undefined ? storeWebsite : prev.website),
          description: (prev.description && prev.description !== '') ? prev.description : (storeDescription ?? prev.description),
          businessEmail: (prev.businessEmail && prev.businessEmail !== '') ? prev.businessEmail : resolvedBusinessEmail,
          businessPhone: (prev.businessPhone && prev.businessPhone !== '') ? prev.businessPhone : (storeBusinessPhone ?? prev.businessPhone),
          // FIX: Use consistent pattern for phone fields (check for non-empty, not just truthy)
          businessPhoneCountryCode: (prev.businessPhoneCountryCode && prev.businessPhoneCountryCode !== '')
            ? prev.businessPhoneCountryCode
            : (businessPhoneCountryCode || prev.businessPhoneCountryCode),
          businessPhoneAreaCode: (prev.businessPhoneAreaCode && prev.businessPhoneAreaCode !== '')
            ? prev.businessPhoneAreaCode
            : (businessPhoneAreaCode || prev.businessPhoneAreaCode),
          businessPhoneNumber: (prev.businessPhoneNumber && prev.businessPhoneNumber !== '')
            ? prev.businessPhoneNumber
            : (businessPhoneNumber || prev.businessPhoneNumber),
          // CUIT: Preservar el valor del formulario si existe, sino cargar del servidor
          cuit: (prev.cuit && prev.cuit !== '')
            ? prev.cuit // Si el usuario ya ingresó un valor, preservarlo
            : (storeCuit !== null && storeCuit !== undefined && storeCuit !== '')
              ? String(storeCuit) // Si no hay valor del usuario, cargar desde el servidor
              : prev.cuit,
          documentType: (prev.documentType && prev.documentType !== '') ? prev.documentType : (documentType || prev.documentType),
          // documentType del comercio: Preservar si existe, sino cargar del servidor (manejar tanto camelCase como snake_case)
          commerceDocumentType: (prev.commerceDocumentType && prev.commerceDocumentType !== '')
            ? prev.commerceDocumentType
            : (cuitDocumentType !== undefined && cuitDocumentType !== null && cuitDocumentType !== '')
              ? cuitDocumentType
              : prev.commerceDocumentType,
          phone: (prev.phone && prev.phone !== '') ? prev.phone : (formattedHolderPhone || formattedUserPhone || store?.Phone?.number || prev.phone),
          // FIX: Use consistent pattern for phone fields (check for non-empty, not just truthy)
          phoneCountryCode: (prev.phoneCountryCode && prev.phoneCountryCode !== '')
            ? prev.phoneCountryCode
            : (holderPhoneCountryCode || prev.phoneCountryCode),
          phoneAreaCode: (prev.phoneAreaCode && prev.phoneAreaCode !== '')
            ? prev.phoneAreaCode
            : (holderPhoneAreaCode || prev.phoneAreaCode),
          phoneNumber: (prev.phoneNumber && prev.phoneNumber !== '')
            ? prev.phoneNumber
            : (holderPhoneNumber || prev.phoneNumber),
          dni: (prev.dni && prev.dni !== '') ? prev.dni : (resolvedDni ?? prev.dni),
          documentNumber: (prev.documentNumber && prev.documentNumber !== '') ? prev.documentNumber : (documentNumber || prev.documentNumber),
        };
      });
    }
  }, [storeQuery.data, userQuery.data, isSaving, lastSavedAt]);

  const handleSaveGeneral = async () => {
    if (isSaving) return; // Prevenir múltiples clicks
    setIsSaving(true);

    // CRÍTICO: Usar formRef.current para obtener el estado MÁS RECIENTE del formulario
    // Esto soluciona el problema de timing de React donde form puede tener valores obsoletos
    // debido a que los state updates son asíncronos y pueden no haberse aplicado aún
    const currentForm = formRef.current;

    if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] ===== CAPTURANDO FORMSNAPSHOT =====');
    if (DEBUG_CONFIGURATION_FORM) {
      console.log('[handleSaveGeneral] formRef.current (estado más reciente):', {
        name: currentForm.name,
        lastName: currentForm.lastName,
        email: currentForm.email,
        country: currentForm.country,
        documentType: currentForm.documentType,
        dni: currentForm.dni,
        documentNumber: currentForm.documentNumber,
      });
    }

    const formSnapshot: ConfigurationForm = {
      ...currentForm,
      // Copiar todos los campos explícitamente para asegurar que no cambien
      id: currentForm.id,
      name: currentForm.name,
      lastName: currentForm.lastName,
      email: currentForm.email,
      country: currentForm.country,
      documentType: currentForm.documentType,
      dni: currentForm.dni,
      phone: currentForm.phone,
      phoneCountryCode: currentForm.phoneCountryCode,
      phoneAreaCode: currentForm.phoneAreaCode,
      phoneNumber: currentForm.phoneNumber,
      documentNumber: currentForm.documentNumber,
      storeName: currentForm.storeName,
      website: currentForm.website,
      cuit: currentForm.cuit,
      commerceDocumentType: currentForm.commerceDocumentType,
      businessEmail: currentForm.businessEmail,
      businessPhone: currentForm.businessPhone,
      province: currentForm.province,
      address: currentForm.address,
      postalCode: currentForm.postalCode,
      description: currentForm.description,
      holderInformation: currentForm.holderInformation,
      information: currentForm.information,
    };

    if (DEBUG_CONFIGURATION_FORM) {
      console.log('[handleSaveGeneral] formSnapshot capturado:', {
        name: formSnapshot.name,
        lastName: formSnapshot.lastName,
        email: formSnapshot.email,
        country: formSnapshot.country,
        documentType: formSnapshot.documentType,
        dni: formSnapshot.dni,
        documentNumber: formSnapshot.documentNumber,
        province: formSnapshot.province,
        address: formSnapshot.address,
        postalCode: formSnapshot.postalCode,
      });
    }
    if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] ===== FIN CAPTURA FORMSNAPSHOT =====');

    try {
      // accountId ya está disponible desde el estado

      // Si es usuario normal, validar solo campos relevantes
      if (!isCommerce && accountId) {
        // Validación solo para campos que se van a enviar (name, dni, phone)
        const allErrors: Record<string, string> = {};

        // Validar name solo si tiene valor (es opcional para usuarios normales en este contexto)
        if (formSnapshot.name !== undefined && formSnapshot.name !== null && formSnapshot.name !== '') {
          const nameResult = fieldSchemas.name.safeParse(formSnapshot.name);
          if (!nameResult.success) {
            allErrors.name = nameResult.error.issues?.[0]?.message || 'Nombre inválido';
          }
        }

        // Validar dni solo si tiene valor
        if (formSnapshot.dni !== undefined && formSnapshot.dni !== null && formSnapshot.dni !== '') {
          const dniResult = fieldSchemas.dni.safeParse(formSnapshot.dni);
          if (!dniResult.success) {
            allErrors.dni = dniResult.error.issues?.[0]?.message || 'DNI inválido';
          }
        }

        // Validar phone solo si tiene valor
        if (formSnapshot.phone !== undefined && formSnapshot.phone !== null && formSnapshot.phone !== '') {
          const phoneResult = fieldSchemas.phone.safeParse(formSnapshot.phone);
          if (!phoneResult.success) {
            allErrors.phone = phoneResult.error.issues?.[0]?.message || 'Teléfono inválido';
          }
        }

        setErrors(allErrors);
        const hasErrors = Object.values(allErrors).some((m) => m && m.length > 0);
        if (hasErrors) {
          toast?.error('No se puede guardar: corrige los errores del formulario.');
          setIsSaving(false);
          return;
        }

        try {
          // Obtener el email original del usuario para comparar
          const user = userQuery.data as {
            email?: string;
            additionalInfo?: Record<string, unknown>;
          } | undefined;
          const currentEmail = user?.email || (user?.additionalInfo as Record<string, unknown> | undefined)?.email as string | undefined;
          const newEmail = formSnapshot.email?.trim();
          const emailChanged = newEmail && newEmail !== currentEmail && newEmail.length > 0;

          if (DEBUG_CONFIGURATION_FORM) {
            console.log('[handleSaveGeneral] Verificando cambio de email:', {
              currentEmail,
              newEmail,
              emailChanged,
            });
          }

          // Si hay email para actualizar Y cambió, actualizarlo en ms-auth primero
          let emailWasUpdated = false;
          if (emailChanged && newEmail) {
            try {
              let helper: typeof axiosHelper;
              try {
                helper = axiosHelper;
              } catch (error) {
                console.warn('[handleSaveGeneral] Error accediendo a axiosHelper:', error);
                helper = undefined as unknown as typeof axiosHelper;
              }

              if (!helper || !helper.auth || typeof helper.auth.updateEmail !== 'function') {
                console.warn('[handleSaveGeneral] axiosHelper.auth.updateEmail no está disponible');
              } else {
                if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] Email cambió, actualizando en ms-auth:', { from: currentEmail, to: newEmail });
                await helper.auth.updateEmail(accountId, newEmail);
                if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] Email actualizado en ms-auth:', newEmail);
                emailWasUpdated = true;
              }
            } catch (emailError: unknown) {
              console.error('[handleSaveGeneral] Error actualizando email en ms-auth:', emailError);
              // Extraer mensaje de error del servidor
              let errorMessage = 'No se pudo actualizar el email. Inténtalo nuevamente.';
              if (emailError && typeof emailError === 'object') {
                const axiosError = emailError as { response?: { data?: { message?: string; error?: string; detail?: string } } };
                errorMessage =
                  axiosError?.response?.data?.message ||
                  axiosError?.response?.data?.error ||
                  axiosError?.response?.data?.detail ||
                  errorMessage;
              }
              toast?.error(errorMessage);
              setIsSaving(false);
              return; // No continuar si falla la actualización del email
            }
          } else if (newEmail && !emailChanged) {
            if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] Email no cambió, no se actualiza en ms-auth:', { current: currentEmail, new: newEmail });
          }

          // Construir payload para actualizar usuario con TODOS los campos del formulario (usar snapshot)
          const userUpdateData: Record<string, unknown> = {
            name: formSnapshot.name,
          };

          // Procesar teléfono - usar phoneCountryCode, phoneAreaCode, phoneNumber si están disponibles
          // o parsear desde formSnapshot.phone si está disponible
          let phoneObj: { countryCode?: string; areaCode?: string; number?: string } | undefined;

          if (formSnapshot.phoneCountryCode && formSnapshot.phoneAreaCode && formSnapshot.phoneNumber) {
            // Usar los campos separados si están disponibles
            phoneObj = {
              countryCode: formSnapshot.phoneCountryCode,
              areaCode: formSnapshot.phoneAreaCode,
              number: formSnapshot.phoneNumber,
            };
          } else if (formSnapshot.phone && typeof formSnapshot.phone === 'string' && formSnapshot.phone.trim().length > 0) {
            // Parsear desde el string del teléfono
            try {
              const phoneStr = formSnapshot.phone.replace(/\s+/g, ''); // Eliminar espacios

              // Si el teléfono tiene formato con código de país (ej: +54 2323613683)
              if (phoneStr.startsWith('+')) {
                const parts = phoneStr.split(/\s+/);
                if (parts.length >= 2) {
                  phoneObj = {
                    countryCode: parts[0],
                    areaCode: parts[1].substring(0, 2) || '',
                    number: parts[1].substring(2) || '',
                  };
                } else {
                  // Si solo tiene el código de país y número sin espacio
                  const match = phoneStr.match(/^\+(\d{1,3})(\d+)$/);
                  if (match && match[2].length >= 6) {
                    phoneObj = {
                      countryCode: `+${match[1]}`,
                      areaCode: match[2].substring(0, 2) || '',
                      number: match[2].substring(2) || '',
                    };
                  }
                }
              } else {
                // Si no tiene código de país, asumir Argentina (+54)
                // Intentar extraer código de área (primeros 2-4 dígitos)
                if (phoneStr.length >= 8) {
                  // Código de área típico de Argentina: 2-4 dígitos
                  const areaCodeLength = phoneStr.length >= 10 ? 2 : phoneStr.length >= 9 ? 3 : 2;
                  phoneObj = {
                    countryCode: '+54',
                    areaCode: phoneStr.substring(0, areaCodeLength),
                    number: phoneStr.substring(areaCodeLength),
                  };
                } else if (phoneStr.length >= 6) {
                  // Si es corto pero tiene al menos 6 dígitos, solo número
                  phoneObj = {
                    countryCode: '+54',
                    areaCode: '',
                    number: phoneStr,
                  };
                }
              }
            } catch (phoneError) {
              // Si hay error parseando el teléfono, simplemente no lo incluimos
              console.warn('Error parsing phone number:', phoneError);
            }
          }

          // Agregar phone si se pudo construir
          if (phoneObj && phoneObj.number && phoneObj.number.length >= 6) {
            userUpdateData.phone = phoneObj;
          }

          // Construir additionalInfo preservando campos existentes (como avatar)
          // Obtener additionalInfo actual del usuario para preservar campos que no se están actualizando
          const currentAdditionalInfo = (user?.additionalInfo as Record<string, unknown> | undefined) || {};
          const additionalInfo: Record<string, unknown> = { ...currentAdditionalInfo };

          // Agregar lastName si existe (usar snapshot)
          if (formSnapshot.lastName && formSnapshot.lastName.trim().length > 0) {
            additionalInfo.lastName = formSnapshot.lastName.trim();
          }

          // Agregar country si existe
          if (formSnapshot.country && formSnapshot.country.trim().length > 0) {
            additionalInfo.country = formSnapshot.country.trim();
          }

          // Agregar documentType si existe
          if (formSnapshot.documentType && formSnapshot.documentType.trim().length > 0) {
            additionalInfo.documentType = formSnapshot.documentType.trim();
          }

          // Agregar documentNumber si existe (usar formSnapshot.documentNumber o formSnapshot.dni como fallback)
          const documentNumber = formSnapshot.documentNumber || formSnapshot.dni;
          if (documentNumber && String(documentNumber).trim().length > 0) {
            additionalInfo.documentNumber = String(documentNumber).trim();
          }

          // Agregar email a additionalInfo si existe (aunque también se actualiza en ms-auth)
          if (formSnapshot.email && formSnapshot.email.trim().length > 0) {
            additionalInfo.email = formSnapshot.email.trim();
          }

          // Preservar el avatar si existe y no se está actualizando
          // El avatar se maneja por separado con uploadAvatar, así que siempre lo preservamos
          if (currentAdditionalInfo.avatar && !additionalInfo.avatar) {
            additionalInfo.avatar = currentAdditionalInfo.avatar;
          }
          // También preservar avatar_url por compatibilidad
          if (currentAdditionalInfo.avatar_url && !additionalInfo.avatar_url) {
            additionalInfo.avatar_url = currentAdditionalInfo.avatar_url;
          }

          // Solo agregar additionalInfo si tiene al menos un campo
          if (Object.keys(additionalInfo).length > 0) {
            userUpdateData.additionalInfo = additionalInfo;
          }

          // Remover vacíos/undefined/null
          Object.keys(userUpdateData).forEach((k) => {
            const v = userUpdateData[k];
            if (v === undefined || v === null || v === '') {
              delete userUpdateData[k];
            } else if (typeof v === 'object' && !Array.isArray(v)) {
              // Para objetos como phone, verificar que tenga al menos un campo válido
              const obj = v as Record<string, unknown>;
              const hasValidFields = Object.values(obj).some(val => val !== undefined && val !== null && val !== '');
              if (!hasValidFields) {
                delete userUpdateData[k];
              }
            }
          });

          if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] Llamando a updateUserMutation con:', { id: accountId, data: userUpdateData });
          const updated = await updateUserMutation.mutateAsync({ id: accountId, data: userUpdateData });
          if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] Respuesta de updateUserMutation:', updated);

          // FIX: Removed duplicate invalidation calls - only need to invalidate once
          // Invalidar queries para forzar recarga de datos
          await queryClient.invalidateQueries({ queryKey: ['account', 'user', accountId] });
          await queryClient.invalidateQueries({ queryKey: ['account', 'user'] });

          // Refetch del userQuery para cargar datos actualizados
          if (userQuery.refetch) {
            await userQuery.refetch();
          }

          // Actualizar el formulario con los datos actualizados de la respuesta
          if (updated && typeof updated === 'object') {
            const updatedData = updated as {
              name?: string;
              phone?: { countryCode?: string; areaCode?: string; number?: string };
              dni?: number;
              additionalInfo?: Record<string, unknown>;
            };

            // Formatear el teléfono si viene como objeto
            let formattedPhone = '';
            if (updatedData.phone && typeof updatedData.phone === 'object') {
              const { countryCode, areaCode, number } = updatedData.phone;
              if (areaCode && number) {
                formattedPhone = countryCode ? `${countryCode} ${areaCode}${number}` : `${areaCode}${number}`;
              }
            }

            // Extraer datos de additionalInfo
            const updatedAdditionalInfo = updatedData.additionalInfo as Record<string, unknown> | undefined;
            const updatedEmail = updatedAdditionalInfo?.email as string | undefined;
            const updatedLastName = updatedAdditionalInfo?.lastName as string | undefined;
            const updatedCountry = updatedAdditionalInfo?.country as string | undefined;
            const updatedDocumentType = updatedAdditionalInfo?.documentType as string | undefined;
            const updatedDocumentNumber = updatedAdditionalInfo?.documentNumber as string | undefined;

            // Extraer componentes del teléfono para los campos separados
            const phoneCountryCode = updatedData.phone?.countryCode || '';
            const phoneAreaCode = updatedData.phone?.areaCode || '';
            const phoneNumber = updatedData.phone?.number || '';

            if (DEBUG_CONFIGURATION_FORM) {
              console.log('[handleSaveGeneral] Actualizando formulario con datos de respuesta:', {
                name: updatedData.name,
                lastName: updatedLastName,
                country: updatedCountry,
                documentType: updatedDocumentType,
                documentNumber: updatedDocumentNumber,
                phone: formattedPhone,
                email: updatedEmail,
              });
            }

            setForm((prev) => ({
              ...prev,
              name: updatedData.name ?? prev.name,
              lastName: updatedLastName ?? prev.lastName,
              country: updatedCountry ?? prev.country,
              dni: updatedData.dni ? String(updatedData.dni) : prev.dni,
              documentType: updatedDocumentType ?? prev.documentType,
              documentNumber: updatedDocumentNumber ?? prev.documentNumber,
              phone: formattedPhone || prev.phone,
              phoneCountryCode: phoneCountryCode || prev.phoneCountryCode,
              phoneAreaCode: phoneAreaCode || prev.phoneAreaCode,
              phoneNumber: phoneNumber || prev.phoneNumber,
              email: updatedEmail ?? prev.email,
            }));
          }

          // Mostrar mensaje de éxito
          if (emailWasUpdated) {
            try {
              if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] Email cambió, refrescando token...');
              // Refrescar el token para obtener uno nuevo con el email actualizado
              await refreshTokenMutation.mutateAsync();
              if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] Token refrescado exitosamente');
              toast?.success('Información actualizada correctamente. El token se ha renovado con tu nuevo email.');
            } catch (refreshError) {
              console.error('[handleSaveGeneral] Error al refrescar token:', refreshError);
              // Si falla el refresh, hacer logout como fallback
              toast?.warning('Información actualizada, pero hubo un problema al renovar la sesión. Por favor, inicia sesión nuevamente.');
              setTimeout(async () => {
                try {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.removeItem('accessToken');
                    window.localStorage.removeItem('refreshToken');
                    window.localStorage.removeItem('user');
                  }
                  await logout();
                  router.push('/login');
                } catch (logoutError) {
                  console.error('Error durante logout:', logoutError);
                  router.push('/login');
                }
              }, 2000);
            }
          } else {
            toast?.success('Cambios guardados correctamente.');
          }
        } catch (error: unknown) {
          console.error('[handleSaveGeneral] Error updating user:', error);
          // Extraer mensaje de error del servidor
          let errorMessage = 'No se pudo guardar los cambios. Inténtalo nuevamente.';
          if (error && typeof error === 'object') {
            const axiosError = error as { response?: { data?: { message?: string; error?: string; detail?: string } } };
            errorMessage =
              axiosError?.response?.data?.message ||
              axiosError?.response?.data?.error ||
              axiosError?.response?.data?.detail ||
              errorMessage;
          }
          toast?.error(errorMessage);
        } finally {
          setIsSaving(false);
        }
        return;
      }

      // Si no es usuario normal ni comercio, o no hay accountId
      if (!isCommerce && !accountId) {
        console.error('[handleSaveGeneral] No se puede guardar: accountId no disponible');
        toast?.error('No se pudo identificar la cuenta. Por favor, recarga la página.');
        setIsSaving(false);
        return;
      }

      // Si es comercio, validación completa y actualizar la tienda (lógica original)
      // Validación total antes de guardar (siempre corre, incluso si no hay id)
      // Usar formSnapshot para validar los valores capturados al inicio
      const allErrors: Record<string, string> = {};
      Object.entries(fieldSchemas).forEach(([k, s]) => {
        const value = formSnapshot[k as keyof ConfigurationForm];
        // Validar solo si el campo tiene valor (permitir guardar vacíos)
        if (value === undefined || value === null || value === '') return;
        const r = s.safeParse(value);
        if (!r.success) allErrors[k] = r.error.issues?.[0]?.message || 'Dato inválido';
      });
      setErrors(allErrors);
      const hasErrors = Object.values(allErrors).some((m) => m && m.length > 0);
      if (hasErrors) {
        toast?.error('No se puede guardar: corrige los errores del formulario.');
        setIsSaving(false);
        return;
      }

      let fallbackStoreId = getStoreId(storeData);
      if (!form.id && fallbackStoreId) {
        setForm((prev) => ({ ...prev, id: fallbackStoreId }));
      }
      if (!form.id && !fallbackStoreId) {
        try {
          const ref = await storeQuery.refetch();
          fallbackStoreId = getStoreId(ref.data as StoreData);
        } catch { }
        if (!fallbackStoreId) {
          toast?.error('No se puede guardar: tienda no cargada. Reintenta en unos segundos.');
          setIsSaving(false);
          return;
        }
      }

      // Construir payload según StoreEntity DTO
      // CRÍTICO: Usar formSnapshot para asegurar que los valores no cambien durante el proceso
      const source = {
        ...formSnapshot,
        id: formSnapshot.id || fallbackStoreId,
        // Asegurar que CUIT y document_type se capturen siempre desde el snapshot
        cuit: formSnapshot.cuit !== undefined ? formSnapshot.cuit : '',
        commerceDocumentType: formSnapshot.commerceDocumentType !== undefined ? formSnapshot.commerceDocumentType : '',
      };

      // Debug: Verificar que el CUIT esté presente
      if (DEBUG_CONFIGURATION_FORM) {
        console.log('[handleSaveGeneral] FormSnapshot antes de crear source:', {
          snapshotCuit: formSnapshot.cuit,
          sourceCuit: source.cuit,
          snapshotCommerceDocumentType: formSnapshot.commerceDocumentType,
          sourceCommerceDocumentType: source.commerceDocumentType,
          snapshotKeys: Object.keys(formSnapshot),
          sourceKeys: Object.keys(source),
        });
      }

      const storeId = (source.id as string) || (fallbackStoreId as string);

      // Obtener datos del store existente para campos requeridos y IDs de relaciones (camelCase)
      const existingStore = storeQuery.data as StoreData & {
        plan?: string;
        isActive?: boolean;
        userId?: string;
        holderInformation?: {
          id?: string;
          name?: string;
          lastName?: string;
          email?: string;
          country?: string;
          documentType?: string;
          identityDocument?: number;
          phone?: { id?: string; countryCode?: string; areaCode?: string; number?: string };
        };
        information?: {
          id?: string;
          cuitCuil?: string;
          documentType?: string;
          description?: string;
          logo?: string;
          banner?: string;
          phone?: { id?: string; countryCode?: string; areaCode?: string; number?: string };
          location?: {
            id?: string;
            latitude?: number;
            longitude?: number;
            address?: string;
            city?: string;
            state?: string;
            country?: string;
            postalCode?: string;
          };
        };
      };

      // Función helper para parsear teléfono desde string (devuelve camelCase)
      // FIX: Handle more phone formats, not just those with + prefix
      const parsePhone = (phoneStr: string | undefined): { countryCode: string; areaCode: string; number: string } | undefined => {
        if (!phoneStr || typeof phoneStr !== 'string') return undefined;
        const cleaned = phoneStr.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses

        if (cleaned.length < 6) return undefined; // Too short to be a valid phone

        // Format with country code: +54 2323613683 or +542323613683
        if (cleaned.startsWith('+')) {
          // Try to match: +countryCode(1-3 digits) + areaCode(2-4 digits) + number(6-10 digits)
          const match = cleaned.match(/^\+(\d{1,3})(\d{2,4})(\d{6,10})$/);
          if (match) {
            return {
              countryCode: `+${match[1]}`,
              areaCode: match[2],
              number: match[3],
            };
          }
          // Fallback: Try simpler pattern for shorter area codes
          const simpleMatch = cleaned.match(/^\+(\d{1,3})(\d{2})(\d+)$/);
          if (simpleMatch && simpleMatch[3].length >= 6) {
            return {
              countryCode: `+${simpleMatch[1]}`,
              areaCode: simpleMatch[2],
              number: simpleMatch[3],
            };
          }
        }

        // Format without country code: assume Argentina (+54)
        // Handle formats like: 2323613683, 3513059353, etc.
        if (/^\d{8,12}$/.test(cleaned)) {
          // For Argentina: area codes are typically 2-4 digits
          // - Buenos Aires city: 11 (2 digits)
          // - Other provinces: 3-4 digits (e.g., 351 for Córdoba, 2323 for Chacabuco)
          let areaCodeLength = 2;
          if (cleaned.length === 10) {
            // 10 digits total: 2-digit area code + 8-digit number (Buenos Aires style)
            areaCodeLength = 2;
          } else if (cleaned.length >= 10) {
            // For longer numbers, use 3-digit area code
            areaCodeLength = 3;
          }

          return {
            countryCode: '+54',
            areaCode: cleaned.substring(0, areaCodeLength),
            number: cleaned.substring(areaCodeLength),
          };
        }

        return undefined;
      };

      // Construir holderInformation (email del usuario autenticado)
      // El servicio espera que siempre exista con phone, así que construirlo con datos existentes o nuevos
      // Usar phoneCountryCode, phoneAreaCode, phoneNumber si están disponibles, sino parsear desde phone string
      let holderInfoPhone: { countryCode: string; areaCode: string; number: string } | undefined;
      if (source.phoneCountryCode && source.phoneAreaCode && source.phoneNumber) {
        holderInfoPhone = {
          countryCode: String(source.phoneCountryCode),
          areaCode: String(source.phoneAreaCode),
          number: String(source.phoneNumber),
        };
      } else {
        holderInfoPhone = parsePhone(source.phone as string | undefined);
      }

      // Construir nombre desde name (sin incluir lastName en name, ya que se guarda por separado)
      const holderName = source.name || (typeof source.holderInformation === 'string' ? source.holderInformation : undefined) || existingStore?.holderInformation?.name || '';

      // Usar storeName para el nombre de la tienda, o el name del store existente como fallback
      const storeName = source.storeName || existingStore?.name || '';

      // Construir holderInformation en CAMELCASE para el backend
      // CRÍTICO: Usar los valores del formulario (source) SIEMPRE que existan, incluso si están vacíos
      // Solo usar valores del servidor como fallback si el formulario no tiene ese campo
      if (DEBUG_CONFIGURATION_FORM) {
        console.log('[handleSaveGeneral] Construyendo holderInformation con:', {
          sourceName: source.name,
          sourceLastName: source.lastName,
          sourceEmail: source.email,
          sourceCountry: source.country,
          sourceDocumentType: source.documentType,
          sourceDni: source.dni,
          sourceDocumentNumber: source.documentNumber,
          existingStoreHolderInfo: existingStore?.holderInformation,
        });
      }

      const holderInformation: Record<string, unknown> = {
        // CRÍTICO: Usar source.name si está definido, incluso si es string vacío
        name: source.name !== undefined ? String(source.name || '') : (holderName || ''),
        // CRÍTICO: Si source.lastName existe (incluso si es string vacío), usarlo
        // Solo usar existingStore si source.lastName es undefined
        lastName: source.lastName !== undefined ? (source.lastName !== null && source.lastName !== '' ? String(source.lastName) : null) : (existingStore?.holderInformation?.lastName || null),
        email: source.email !== undefined ? String(source.email || '') : (existingStore?.holderInformation?.email || ''),
        country: source.country !== undefined ? (source.country || null) : (existingStore?.holderInformation?.country || null),
        documentType: source.documentType !== undefined ? (source.documentType || null) : (existingStore?.holderInformation?.documentType || null),
      };

      if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] holderInformation construido:', JSON.stringify(holderInformation, null, 2));

      // Para identityDocument, usar el valor del formulario si existe
      // CRITICAL: documentNumber (user input) takes precedence over dni (loaded from server)
      // FIX: Use explicit empty string checks instead of || which treats '' as falsy
      const hasDocumentNumber = source.documentNumber !== undefined && source.documentNumber !== null && String(source.documentNumber).trim() !== '';
      const hasDni = source.dni !== undefined && source.dni !== null && String(source.dni).trim() !== '';

      if (hasDocumentNumber) {
        // User typed a value in documentNumber field - use it
        holderInformation.identityDocument = Number.parseInt(String(source.documentNumber), 10);
      } else if (hasDni) {
        // Fall back to dni field if documentNumber is empty
        holderInformation.identityDocument = Number.parseInt(String(source.dni), 10);
      } else if (existingStore?.holderInformation?.identityDocument !== undefined) {
        // Fall back to existing store value
        holderInformation.identityDocument = existingStore.holderInformation.identityDocument;
      } else {
        // Last resort: use default value
        holderInformation.identityDocument = 38000001;
      }

      if (DEBUG_CONFIGURATION_FORM) {
        console.log('[handleSaveGeneral] identityDocument resolved:', {
          hasDocumentNumber,
          hasDni,
          sourceDocumentNumber: source.documentNumber,
          sourceDni: source.dni,
          finalValue: holderInformation.identityDocument,
        });
      }
      // Phone siempre debe existir (requerido por el servicio)
      // CRÍTICO: NO enviar el campo 'id' - el DTO PhoneDto solo acepta countryCode, areaCode, number
      if (holderInfoPhone) {
        // Crear phone con los datos proporcionados en camelCase (sin id)
        holderInformation.phone = {
          countryCode: holderInfoPhone.countryCode || '+54',
          areaCode: holderInfoPhone.areaCode || '',
          number: holderInfoPhone.number || '',
        };
      } else if (existingStore?.holderInformation?.phone) {
        // Mantener el teléfono existente si no se está actualizando (sin id)
        holderInformation.phone = {
          countryCode: existingStore.holderInformation.phone.countryCode || '+54',
          areaCode: existingStore.holderInformation.phone.areaCode || '',
          number: existingStore.holderInformation.phone.number || '',
        };
      } else {
        // FIX: If no phone data exists, use empty strings instead of fake data
        // This makes it clear that no phone was provided, rather than polluting DB with fake numbers
        // The backend should handle validation of required fields
        holderInformation.phone = {
          countryCode: '+54',
          areaCode: '',
          number: '',
        };
      }

      // Construir information en CAMELCASE según UpdateStoreDto.InformationDto
      const information: Record<string, unknown> = {};

      // Guardar CUIT: SIEMPRE enviarlo si tiene valor en el formulario
      const cuitValue = source.cuit;
      if (cuitValue !== undefined && cuitValue !== null && cuitValue !== '') {
        information.cuitCuil = String(cuitValue);
      } else if (existingStore?.information?.cuitCuil !== undefined && existingStore?.information?.cuitCuil !== null && existingStore?.information?.cuitCuil !== '') {
        information.cuitCuil = existingStore.information.cuitCuil;
      }

      if (source.description !== undefined) {
        information.description = source.description as string;
      } else if (existingStore?.information?.description !== undefined) {
        information.description = existingStore.information.description;
      }

      if (source.website !== undefined) {
        information.website = source.website as string;
      } else if (existingStore?.information && typeof existingStore.information === 'object' && 'website' in existingStore.information) {
        information.website = existingStore.information.website as string;
      }

      if (existingStore?.information?.logo) {
        information.logo = existingStore.information.logo;
      }
      if (existingStore?.information?.banner) {
        information.banner = existingStore.information.banner;
      }

      if (DEBUG_CONFIGURATION_FORM) {
        console.log('[handleSaveGeneral] Guardando información del comercio:', {
          sourceCuit: source.cuit,
          sourceCommerceDocumentType: source.commerceDocumentType,
          snapshotCuit: formSnapshot.cuit,
          snapshotCommerceDocumentType: formSnapshot.commerceDocumentType,
          informationCuit: information.cuitCuil,
          fullInformation: information,
        });
      }

      // Agregar documentType a information si existe (camelCase)
      const documentTypeValue = source.commerceDocumentType;
      if (documentTypeValue !== undefined && documentTypeValue !== null && documentTypeValue !== '') {
        information.documentType = String(documentTypeValue);
      } else if (existingStore?.information?.documentType !== undefined && existingStore?.information?.documentType !== null) {
        information.documentType = existingStore.information.documentType;
      }

      // FIX: Add location fields inside information.location (not at root level!)
      // Location fields must be nested inside information according to the DTO structure
      const hasLocationData = source.country || source.province || source.address || source.postalCode;

      if (hasLocationData) {
        const location: Record<string, unknown> = {};

        // Only send fields that are in the form or have been edited
        if (source.country !== undefined && source.country !== null && source.country !== '') {
          location.country = source.country as string;
        }

        if (source.province !== undefined && source.province !== null && source.province !== '') {
          location.state = source.province as string; // Backend uses 'state' field
        }

        if (source.address !== undefined && source.address !== null && source.address !== '') {
          location.address = source.address as string;
        }

        if (source.postalCode !== undefined && source.postalCode !== null && source.postalCode !== '') {
          location.postalCode = source.postalCode as string;
        }

        // Only add location to information if it has fields
        if (Object.keys(location).length > 0) {
          information.location = location;
        }
      }

      // Construir payload según UpdateStoreDto - enviar TODOS los campos que el DTO acepta
      const payload: Record<string, unknown> = {};

      // FIX: Basic DTO fields - use explicit checks to avoid fallback bugs
      if (storeName !== undefined && storeName !== null && storeName !== '') {
        payload.name = storeName;
      } else if (existingStore?.name) {
        payload.name = existingStore.name;
      }

      // Store email (from businessEmail field in form)
      if (source.businessEmail !== undefined && source.businessEmail !== null) {
        payload.email = source.businessEmail as string;
      } else if (existingStore?.email) {
        payload.email = existingStore.email;
      }

      // information objeto (InformationDto) - camelCase
      if (Object.keys(information).length > 0) {
        payload.information = information;
      }

      // holderInformation como objeto (HolderInformationDto) - camelCase
      if (Object.keys(holderInformation).length > 0) {
        payload.holderInformation = holderInformation;
      }

      // FIX: businessEmail - use explicit check to avoid fallback bug
      if (source.businessEmail !== undefined && source.businessEmail !== null) {
        payload.businessEmail = source.businessEmail as string;
      } else if (existingStore?.email) {
        payload.businessEmail = existingStore.email;
      }

      // Construir businessPhone desde los campos separados (camelCase)
      const businessPhone: { countryCode: string; areaCode: string; number: string } | undefined =
        (source.businessPhoneCountryCode || source.businessPhoneAreaCode || source.businessPhoneNumber)
          ? {
            countryCode: (source.businessPhoneCountryCode as string) || '+54',
            areaCode: (source.businessPhoneAreaCode as string) || '',
            number: (source.businessPhoneNumber as string) || '',
          }
          : parsePhone(source.businessPhone as string | undefined);

      if (businessPhone) {
        payload.businessPhone = `${businessPhone.countryCode} ${businessPhone.areaCode}${businessPhone.number}`;
      } else if (existingStore?.information?.phone) {
        const existingPhone = existingStore.information.phone;
        payload.businessPhone = `${existingPhone.countryCode || '+54'} ${existingPhone.areaCode || ''}${existingPhone.number || ''}`;
      }

      if (source.cuit) {
        payload.cuit = source.cuit as string;
      }

      if (source.dni || source.documentNumber) {
        payload.dni = String(source.dni || source.documentNumber);
      }

      try {
        if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] ===== INICIO PAYLOAD DEBUG =====');
        if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] formSnapshot:', JSON.stringify(formSnapshot, null, 2));
        if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] source:', JSON.stringify(source, null, 2));
        if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] holderInformation construido:', JSON.stringify(holderInformation, null, 2));
        if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] payload completo:', JSON.stringify(payload, null, 2));
        if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] ===== FIN PAYLOAD DEBUG =====');

        if (DEBUG_CONFIGURATION_FORM) {
          console.log('[handleSaveGeneral] Llamando a updateStoreMutation con:', {
            id: storeId,
            payload: JSON.stringify(payload, null, 2),
            holderInformation: payload.holderInformation,
            holderInformationDetails: payload.holderInformation ? {
              name: (payload.holderInformation as Record<string, unknown>)?.name,
              lastName: (payload.holderInformation as Record<string, unknown>)?.lastName,
              email: (payload.holderInformation as Record<string, unknown>)?.email,
            } : null,
            informationCuit: (payload.information as Record<string, unknown>)?.cuitCuil,
            informationDocumentType: (payload.information as Record<string, unknown>)?.documentType,
          });
        }

        const updated = await updateStoreMutation.mutateAsync({ id: storeId, data: payload });

        if (DEBUG_CONFIGURATION_FORM) console.log('[handleSaveGeneral] Respuesta de updateStoreMutation:', updated);

        // CRÍTICO: Preservar TODOS los valores del formSnapshot (los que el usuario modificó)
        // Actualizar el formulario INMEDIATAMENTE con los valores que se enviaron
        // para que no se resetee cuando el useEffect se ejecute después
        setForm((prev) => ({
          ...formSnapshot, // Usar TODOS los valores del snapshot para preservar los cambios del usuario
          id: getStoreId(updated as StoreData) || formSnapshot.id || prev.id,
        }));

        // Marcar que acabamos de guardar ANTES de invalidar queries
        // para evitar que el useEffect resetee el formulario
        const savedTimestamp = Date.now();
        setLastSavedAt(savedTimestamp);

        // CRÍTICO: Actualizar el cache de React Query con la respuesta del servidor
        // ANTES de que el onSuccess de updateStoreMutation invalide las queries
        // Esto asegura que cuando el refetch ocurra, el cache ya tenga los datos correctos
        if (updated && typeof updated === 'object') {
          queryClient.setQueryData(['account', 'store', accountId], updated);
        }

        // Invalidar queries de forma asíncrona sin bloquear la UI
        // Usar void para no esperar la invalidación, que puede ser lenta
        void queryClient.invalidateQueries({ queryKey: ['account', 'store', accountId] });

        toast?.success('Cambios guardados correctamente.');
      } catch (error: unknown) {
        console.error('[handleSaveGeneral] Error updating store:', error);
        // Extraer mensaje de error del servidor
        let errorMessage = 'No se pudo guardar los cambios. Inténtalo nuevamente.';
        if (error && typeof error === 'object') {
          const axiosError = error as { response?: { data?: { message?: string; error?: string; detail?: string } } };
          errorMessage =
            axiosError?.response?.data?.message ||
            axiosError?.response?.data?.error ||
            axiosError?.response?.data?.detail ||
            errorMessage;
        }
        toast?.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    } catch (error: unknown) {
      console.error('[handleSaveGeneral] Unexpected error:', error);
      toast?.error('Ocurrió un error inesperado. Inténtalo nuevamente.');
      setIsSaving(false);
    }
  };

  const inputClass = (key: string) => `form-control text-white ${errors[key] ? 'border-danger is-invalid' : 'border-secondary'}`;
  const selectClass = (key: string) => `form-select bg-dark text-white ${errors[key] ? 'border-danger is-invalid' : 'border-secondary'}`;

  const handleChange = useCallback((field: keyof ConfigurationForm, value: string) => {
    // CRITICAL: Update ref IMMEDIATELY so it's always available even before React re-renders
    formRef.current = { ...formRef.current, [field]: value };
    // Then schedule the state update for React to re-render
    setForm((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, []);

  return {
    form,
    setForm,
    errors,
    isSaving,
    isCommerce,
    storeData,
    storeQuery,
    userQuery,
    validateField,
    handleSaveGeneral,
    handleChange,
    inputClass,
    selectClass,
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
    accountId,
  };
};

