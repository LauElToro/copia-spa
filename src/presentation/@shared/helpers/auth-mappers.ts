import { RegisterFormData } from '../types/login';
import { LoginRequest } from '../types/auth';
import { IntegratedRegisterRequest } from '../services/integrated-auth.service';
import { validateDocumentFormat } from './document-validators';

// Mapear datos del formulario de registro a la estructura de la API integrada
type AccountType = 'user' | 'commerce' | 'seller';

export const mapRegisterFormToIntegratedRequest = (
  formData: RegisterFormData,
  type: AccountType
): IntegratedRegisterRequest => {
  const phone = formData.phoneCountryCode && formData.phoneAreaCode && formData.phoneNumber ? {
    countryCode: formData.phoneCountryCode,
    areaCode: formData.phoneAreaCode,
    number: formData.phoneNumber,
  } : undefined;

  let additional_info: Record<string, string | number | undefined> = {};
  
  if (type === 'commerce' || type === 'seller') {
    additional_info = {
      type,
      plan: formData.plan,
      referral_code: formData.referralCode,
      country: formData.country,
    };
  } else {
    additional_info = {
      type: 'user',
      country: formData.country,
    };
  }

  // Usar documentNumber si está disponible, sino usar dni para compatibilidad hacia atrás
  const documentValue = formData.documentNumber || formData.dni;
  const dniValue = documentValue && /^\d+$/.test(documentValue) 
    ? Number.parseInt(documentValue, 10) 
    : undefined;

  return {
    email: formData.email,
    password: formData.password,
    isActive: true,

    name: formData.name,
    lastName: formData.lastName,
    dni: dniValue,
    phone,
    additionalInfo: {
      ...additional_info,
      lastName: formData.lastName,
      country: formData.country,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber,
    },
    accountType: type, // Agregar el tipo de cuenta para asignar el rol correcto
  };
};

// Extraer código de país de un string completo
export const extractCountryCode = (fullNumber: string): string => {
  // Si ya tiene el formato "+XX", extraer solo el código
  if (fullNumber.startsWith('+')) {
    return fullNumber;
  }
  
  // Mapeo básico de países (puedes expandir esto)
  const countryMappings: Record<string, string> = {
    'Argentina': '+54',
    'Chile': '+56',
    'Colombia': '+57',
    'México': '+52',
    'Perú': '+51',
    'Uruguay': '+598',
    'Venezuela': '+58',
  };
  
  return countryMappings[fullNumber] || '+1'; // Por defecto
};

// Funciones auxiliares para validaciones específicas
const validateBasicFields = (formData: RegisterFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.name.trim()) {
    errors.push('El nombre es requerido');
  }
  
  if (!formData.email.trim()) {
    errors.push('El email es requerido');
  }
  
  if (!formData.password) {
    errors.push('La contraseña es requerida');
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.push('Las contraseñas no coinciden');
  }
  
  if (!formData.country) {
    errors.push('El país es requerido');
  }
  
  return errors;
};

const validateUserSpecificFields = (formData: RegisterFormData): string[] => {
  const errors: string[] = [];
  
  // Validar usando los nuevos campos documentType y documentNumber
  if (formData.documentType && formData.documentNumber) {
    const documentError = validateDocumentFormat(formData.documentType, formData.documentNumber);
    if (documentError) {
      errors.push(documentError);
    }
  } else if (formData.dni?.trim()) {
    // Compatibilidad hacia atrás: validar DNI antiguo
    if (!/^\d+$/.test(formData.dni.trim())) {
      errors.push('El DNI debe contener solo números');
    }
  } else {
    errors.push('El tipo y número de documento son requeridos para usuarios');
  }
  
  return errors;
};

const validateCommerceSpecificFields = (formData: RegisterFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.plan) {
    errors.push('Debe seleccionar un plan');
  }
  
  return errors;
};

const validatePasswordFormat = (password: string): string | null => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password) 
    ? null 
    : 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
};

const validateEmailFormat = (email: string): string | null => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) ? null : 'El formato del email no es válido';
};

// Validar datos del formulario antes de enviar
export const validateRegisterForm = (
  formData: RegisterFormData,
  type: AccountType
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [
    ...validateBasicFields(formData),
    ...(type === 'user' ? validateUserSpecificFields(formData) : validateCommerceSpecificFields(formData))
  ];

  // Validación de formato de contraseña
  if (formData.password) {
    const passwordError = validatePasswordFormat(formData.password);
    if (passwordError) {
      errors.push(passwordError);
    }
  }

  // Validación de formato de email
  if (formData.email) {
    const emailError = validateEmailFormat(formData.email);
    if (emailError) {
      errors.push(emailError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Interfaz para datos del formulario de login
export interface LoginFormData {
  email: string;
  password: string;
}

// Mapear datos del formulario de login a la estructura de la API
export const mapLoginFormToApiRequest = (
  formData: LoginFormData
): LoginRequest => {
  return {
    email: formData.email.trim(),
    password: formData.password,
  };
};

// Validar datos del formulario de login
export const validateLoginForm = (
  formData: LoginFormData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validación de email
  if (formData.email.trim()) {
    // Expresión regular más segura que evita backtracking excesivo
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('El formato del email no es válido');
    }
  } else {
    errors.push('El email es requerido');
  }

  // Validación de contraseña
  if (!formData.password) {
    errors.push('La contraseña es requerida');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 