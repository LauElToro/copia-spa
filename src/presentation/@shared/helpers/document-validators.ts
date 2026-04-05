import { DocumentType } from '../types/login';

/**
 * Valida el formato de un documento según su tipo
 * @param documentType Tipo de documento
 * @param documentNumber Número de documento
 * @returns Mensaje de error si es inválido, null si es válido
 */
export const validateDocumentFormat = (
  documentType: DocumentType | string | undefined,
  documentNumber: string | undefined
): string | null => {
  if (!documentType || !documentNumber?.trim()) {
    return null; // La validación de presencia se hace en otro lugar
  }

  const trimmedNumber = documentNumber.trim();

  switch (documentType) {
    case 'DNI':
    case 'LC':
    case 'LE':
      // DNI, LC y LE: 7-8 dígitos numéricos
      if (!/^\d{7,8}$/.test(trimmedNumber)) {
        return `${documentType} debe tener entre 7 y 8 dígitos numéricos`;
      }
      break;

    case 'PASAPORTE':
      // Pasaporte: alfanumérico, entre 6 y 12 caracteres
      if (!/^[A-Z0-9]{6,12}$/i.test(trimmedNumber)) {
        return 'El pasaporte debe tener entre 6 y 12 caracteres alfanuméricos';
      }
      break;

    case 'CUIL':
    case 'CUIT':
      // CUIL/CUIT: formato XX-XXXXXXXX-X (11 dígitos con guiones)
      // También acepta sin guiones: XXXXXXXXXXX
      const cleaned = trimmedNumber.replace(/-/g, '');
      if (!/^\d{11}$/.test(cleaned)) {
        return `${documentType} debe tener 11 dígitos (formato: XX-XXXXXXXX-X o XXXXXXXXXXX)`;
      }
      break;

    default:
      return 'Tipo de documento no válido';
  }

  return null;
};

/**
 * Formatea el número de documento según su tipo
 * @param documentType Tipo de documento
 * @param documentNumber Número de documento
 * @returns Número formateado
 */
export const formatDocumentNumber = (
  documentType: DocumentType | string | undefined,
  documentNumber: string | undefined
): string => {
  if (!documentType || !documentNumber) {
    return documentNumber || '';
  }

  const cleaned = documentNumber.replace(/\D/g, ''); // Solo números

  switch (documentType) {
    case 'CUIL':
    case 'CUIT':
      // Formatear progresivamente como XX-XXXXXXXX-X
      // Aplicar formato mientras el usuario escribe
      if (cleaned.length > 0) {
        if (cleaned.length <= 2) {
          // Primeros 2 dígitos: agregar guion después del segundo dígito
          return cleaned.length === 2 ? `${cleaned}-` : cleaned;
        } else if (cleaned.length <= 10) {
          // Del 3er al 10mo dígito: XX-XXXXXXXX
          return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
        } else {
          // 11 dígitos completos: XX-XXXXXXXX-X
          return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 10)}-${cleaned.slice(10)}`;
        }
      }
      break;
  }

  return documentNumber;
};

/**
 * Obtiene el placeholder según el tipo de documento
 * @param documentType Tipo de documento
 * @returns Placeholder string
 */
export const getDocumentPlaceholder = (documentType: DocumentType | string | undefined): string => {
  switch (documentType) {
    case 'DNI':
      return '12345678';
    case 'LC':
      return '12345678';
    case 'LE':
      return '12345678';
    case 'PASAPORTE':
      return 'ABC123456';
    case 'CUIL':
      return '20-12345678-9';
    case 'CUIT':
      return '20-12345678-9';
    default:
      return 'Número de documento';
  }
};

/**
 * Obtiene el tipo de input según el tipo de documento
 * @param documentType Tipo de documento
 * @returns Tipo de input ('text' o 'number')
 */
export const getDocumentInputType = (documentType: DocumentType | string | undefined): 'text' | 'number' => {
  switch (documentType) {
    case 'DNI':
    case 'LC':
    case 'LE':
    case 'CUIL':
    case 'CUIT':
      return 'number';
    case 'PASAPORTE':
      return 'text';
    default:
      return 'text';
  }
};

