// Tipos para las estructuras de datos del ms-auth

// Phone Entity
export interface PhoneEntity {
  country_code: string;
  area_code: string;
  number: string;
}

// Phone Entity para OTP (diferente estructura)
export interface OtpPhoneEntity {
  countryCode: string;
  areaCode: string;
  number: string;
}

// User Registration Request (solo credenciales para ms-auth)
export interface RegisterUserRequest {
  email: string;
  password: string;
  accountId: string;
  roles?: string[];
  isActive?: boolean;
}

// User Registration Response (solo información básica de ms-auth)
export interface RegisterUserResponse {
  id: string;
  email: string;
  message: string;
}

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login Response
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  accountId: string;
}

// Refresh Token Request
export interface RefreshTokenRequest {
  token: string;
}

// Refresh Token Response
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// OTP Request (Email)
export interface OtpRequestByEmail {
  email: string;
}

// OTP Request (Phone)
export interface OtpRequestByPhone {
  phone: OtpPhoneEntity;
}

// OTP Request Union Type
export type OtpRequest = OtpRequestByEmail | OtpRequestByPhone;

// OTP Request Response
export interface OtpRequestResponse {
  message: string;
  userId: string;
  expiresIn: number;
}

// OTP Verify Request
export interface OtpVerifyRequest {
  otp: string;
  userId: string;
}

// OTP Verify Response
export interface OtpVerifyResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Logout Response
export interface LogoutResponse {
  message: string;
}

// Health Check Response
export interface HealthCheckResponse {
  status: string;
  dbStatus: string;
}

// Error Response (para 409 Conflict)
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Hook responses types (envuelven las respuestas de la API)
export interface UseRegisterResult {
  data?: RegisterUserResponse;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutate: (data: RegisterUserRequest) => void;
}

export interface UseLoginResult {
  data?: LoginResponse;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutate: (data: LoginRequest) => void;
}

export interface UseOtpRequestResult {
  data?: OtpRequestResponse;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutate: (data: OtpRequest) => void;
}

export interface UseOtpVerifyResult {
  data?: OtpVerifyResponse;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutate: (data: OtpVerifyRequest) => void;
} 