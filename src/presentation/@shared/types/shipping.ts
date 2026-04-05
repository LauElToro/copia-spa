// TypeScript types for ms-shippings integration
// Matching the DTOs from ms-shippings service

/**
 * Shipping Status Enum
 * Must match ms-shippings ShippingStatus enum values
 */
export enum ShippingStatus {
  PENDING = 'PENDING',
  QUOTED = 'QUOTED',
  CONFIRMED = 'CONFIRMED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

/**
 * Carrier Type Enum
 * Must match ms-shippings CarrierType enum values
 */
export enum CarrierType {
  MICORREO = 'MICORREO',
  CORREO_ARGENTINO = 'CORREO_ARGENTINO',
  ANDREANI = 'ANDREANI',
  OCA = 'OCA',
  CUSTOM = 'CUSTOM',
}

/**
 * Address DTO for shipping origin/destination
 */
export interface AddressDto {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactName?: string;
  contactPhone?: string;
  [key: string]: unknown; // Index signature for compatibility
}

/**
 * Dimensions DTO for package specifications
 */
export interface DimensionsDto {
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  [key: string]: unknown; // Index signature for compatibility
}

/**
 * Shipping Entity
 */
export interface ShippingEntity {
  id: string;
  orderId: string;
  productId?: string;
  accountId: string;
  storeId?: string;
  trackingNumber?: string;
  status: ShippingStatus;
  carrier: CarrierType;
  serviceType?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  origin: AddressDto;
  destination: AddressDto;
  dimensions: DimensionsDto;
  declaredValue?: number;
  shippingCost: number;
  currency: string;
  cryptoPayment?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  creationDate: string;
  updatedAt: string;
}

/**
 * DTO for creating a Shipping record
 */
export interface CreateShippingDto {
  orderId: string;
  productId?: string;
  storeId?: string;
  status?: ShippingStatus;
  carrier?: CarrierType;
  serviceType?: string;
  estimatedDeliveryDate?: string;
  origin: AddressDto;
  destination: AddressDto;
  dimensions: DimensionsDto;
  declaredValue?: number;
  shippingCost?: number;
  currency?: string;
  cryptoPayment?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown; // Index signature for compatibility with Record<string, unknown>
}

/**
 * DTO for updating a Shipping record
 */
export interface UpdateShippingDto {
  status?: ShippingStatus;
  carrier?: CarrierType;
  serviceType?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  origin?: AddressDto;
  destination?: AddressDto;
  dimensions?: DimensionsDto;
  declaredValue?: number;
  shippingCost?: number;
  currency?: string;
  cryptoPayment?: string;
  trackingNumber?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown; // Index signature for compatibility
}

/**
 * API Response wrapper for shipping operations
 */
export interface ShippingApiResponse<T> {
  success: boolean;
  message: string;
  correlationId: string;
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
}

