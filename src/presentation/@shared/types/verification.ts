/**
 * Verification Types
 *
 * Types for KYC (Know Your Customer) and KYB (Know Your Business) verification system.
 * Aligned with ms-account microservice DTOs and Prisma schema.
 */

/**
 * Verification Status Enum
 * Matches Prisma VerificationStatus enum in ms-account
 */
export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  REVIEW = 'review',
}

/**
 * Verification Type
 */
export type VerificationType = 'kyc' | 'kyb';

/**
 * Rejection Information
 * Contains details about why a verification was rejected
 */
export interface RejectionInfo {
  canRetry: boolean;
  rejectLabels?: string[];
  clientComment?: string;
  moderationComment?: string;
}

/**
 * KYC Metadata
 * Additional information stored with KYC verification
 */
export interface KycMetadata {
  applicantId?: string;
  externalUserId?: string;
  reviewStatus?: string;
  reviewResult?: {
    reviewAnswer?: string;
    rejectLabels?: string[];
    clientComment?: string;
    moderationComment?: string;
  };
  rejectionInfo?: RejectionInfo;
  lastUpdated?: string;
  [key: string]: unknown;
}

/**
 * KYB Metadata
 * Additional information stored with KYB verification
 */
export interface KybMetadata {
  applicantId?: string;
  externalUserId?: string;
  businessName?: string;
  reviewStatus?: string;
  reviewResult?: {
    reviewAnswer?: string;
    rejectLabels?: string[];
    clientComment?: string;
    moderationComment?: string;
  };
  rejectionInfo?: RejectionInfo;
  lastUpdated?: string;
  [key: string]: unknown;
}

/**
 * KYC Verification Entity
 * Represents a KYC verification record
 */
export interface KycVerificationEntity {
  id: string;
  storeId: string;
  status: VerificationStatus;
  statusName?: string;
  completedAt?: Date | string;
  method?: string;
  provider?: string;
  countryCode?: string;
  meta?: KycMetadata;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * KYB Verification Entity
 * Represents a KYB verification record
 */
export interface KybVerificationEntity {
  id: string;
  storeId: string;
  status: VerificationStatus;
  statusName?: string;
  completedAt?: Date | string;
  method?: string;
  provider?: string;
  countryCode?: string;
  meta?: KybMetadata;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Initiate KYC DTO
 * Request body for initiating KYC verification
 */
export interface InitiateKycDto {
  storeId: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

/**
 * Initiate KYB DTO
 * Request body for initiating KYB verification
 */
export interface InitiateKybDto {
  storeId: string;
  businessName?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

/**
 * KYC Access Token DTO
 * Request body for getting KYC access token
 */
export interface KycAccessTokenDto {
  storeId: string;
}

/**
 * KYB Access Token DTO
 * Request body for getting KYB access token
 */
export interface KybAccessTokenDto {
  storeId: string;
}

/**
 * Access Token Response
 * Response from token endpoint
 */
export interface AccessTokenResponse {
  accessToken: string;
  applicantId: string;
  levelName: string;
}

/**
 * KYC Status Response DTO
 * Response for KYC status queries
 */
export interface KycStatusResponseDto {
  id: string;
  storeId: string;
  status: VerificationStatus;
  statusName: string;
  completedAt?: Date | string;
  method?: string;
  provider?: string;
  countryCode?: string;
  meta?: KycMetadata;
}

/**
 * KYB Status Response DTO
 * Response for KYB status queries
 */
export interface KybStatusResponseDto {
  id: string;
  storeId: string;
  status: VerificationStatus;
  statusName: string;
  completedAt?: Date | string;
  method?: string;
  provider?: string;
  countryCode?: string;
  meta?: KybMetadata;
}

/**
 * Verification API Response Wrapper
 * Standard API response format from ms-account
 */
export interface VerificationApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Spanish Translation Map for Verification
 */
export const VERIFICATION_TRANSLATIONS = {
  // Status
  [VerificationStatus.PENDING]: 'Pendiente',
  [VerificationStatus.VERIFIED]: 'Verificado',
  [VerificationStatus.REJECTED]: 'Rechazado',
  [VerificationStatus.REVIEW]: 'En Revisión',

  // Rejection Reasons
  BAD_PROOF_OF_IDENTITY: 'Documento de identidad no válido o de mala calidad',
  FRAUDULENT_PATTERNS: 'Se detectaron patrones sospechosos',
  COMPROMISED_PERSONS: 'Persona aparece en listas de vigilancia',
  SPAM: 'Envío identificado como spam',
  UNSUITABLE_APPLICANT: 'No cumple con los requisitos',
  PROBLEMATIC_APPLICANT_DATA: 'Inconsistencias en los datos proporcionados',
  BAD_SELFIE: 'Selfie no válida o de mala calidad',
  BAD_DOCUMENT_PHOTO: 'Foto del documento no válida',
  BAD_BUSINESS_DOCUMENTS: 'Documentos comerciales no válidos o de mala calidad',

  // Button Labels
  START_VERIFICATION: 'Iniciar Verificación',
  CONTINUE_VERIFICATION: 'Continuar Verificación',
  RETRY_VERIFICATION: 'Reintentar Verificación',
  VERIFICATION_COMPLETED: 'Verificación Completada',

  // Messages
  VERIFICATION_REQUIRED: 'Verificación Requerida',
  VERIFICATION_IN_PROGRESS: 'Verificación en Progreso',
  VERIFICATION_COMPLETED_MESSAGE: '¡Verificación Completada!',
  VERIFICATION_REJECTED_MESSAGE: 'Verificación Rechazada',
} as const;

