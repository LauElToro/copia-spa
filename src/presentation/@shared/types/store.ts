/**
 * Store Types
 *
 * Types for Commerce Store entities and operations (ms-stores microservice)
 * NOTA: Usar camelCase para coincidir con los DTOs del backend
 */

export interface PhoneEntity {
  countryCode: string;
  areaCode: string;
  number: string;
}

export interface LocationEntity {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface HolderInformationEntity {
  name: string;
  email: string;
  phone: PhoneEntity;
  identityDocument?: number;
}

export interface InformationEntity {
  cuitCuil?: string;
  logo?: string;
  banner?: string;
  description?: string;
  phone?: PhoneEntity;
  location?: LocationEntity;
}

export interface StoreEntity {
  id: string;
  name: string;
  holderInformation?: HolderInformationEntity;
  information?: InformationEntity;
  storeIdentificationCode?: string;
  categoryCode?: string;
  plan: string;
  totalPoints?: number;
  email: string;
  isActive: boolean;
  referredBy?: string;
  cognitoId?: string;
  kycCompleted?: number;
  chatbotId?: string;
  userId: string;
  accountId?: string;
}

export interface CreateStoreRequest {
  name: string;
  holderInformation: HolderInformationEntity;
  information: InformationEntity;
  storeIdentificationCode?: string;
  categoryCode?: string;
  plan: string;
  email: string;
  isActive: boolean;
  userId: string;
  accountId?: string;
}

export interface StoreApiResponse {
  success: boolean;
  message: string;
  data: StoreEntity;
}
