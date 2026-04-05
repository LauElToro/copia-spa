export interface RegisterFormData {
  name: string;
  lastName?: string;
  dni?: string; // Mantener para compatibilidad hacia atrás
  documentType?: string;
  documentNumber?: string;
  country: string;
  phoneCountryCode?: string;
  phoneAreaCode?: string;
  phoneNumber?: string;
  plan?: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
 termsAccepted: boolean;
  
}

export type DocumentType = "DNI" | "LC" | "LE" | "PASAPORTE" | "CUIL" | "CUIT";

export interface DocumentTypeOption {
  value: DocumentType;
  label: string;
}

export type RegisterType = "user" | "commerce" | "seller";

export enum LoginTypesEnum {
  USER = "user",
  COMMERCE = "commerce",
  SELLER = "seller",
}
