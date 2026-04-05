// Tipos para las estructuras de datos del ms-account

// Phone Entity
export interface AccountPhoneEntity {
  countryCode: string;
  areaCode: string;
  number: string;
}

// User Entity (solo información del perfil)
export interface UserEntity {
  id: string;
  name: string;
  accountType: 'user' | 'seller' | 'commerce';
  phone?: AccountPhoneEntity;
  additionalInfo?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Create User Request (solo información del perfil)
export interface CreateUserRequest {
  name: string;
  accountType?: 'user' | 'seller' | 'commerce';
  phone?: AccountPhoneEntity;
  additionalInfo?: Record<string, unknown>;
}

// Update User Request
export interface UpdateUserRequest {
  name?: string;
  accountType?: 'user' | 'seller' | 'commerce';
  phone?: AccountPhoneEntity;
  additionalInfo?: Record<string, unknown>;
}

// User Statistics
export interface UserStats {
  total: number;
}

// API Response wrapper
export interface AccountApiResponse<T> {
  success: boolean;
  message: string;
  correlationId: string;
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  correlationId: string;
  data: T[];
  meta: {
    timestamp: string;
    version: string;
    pagination: PaginationMeta;
  };
}
