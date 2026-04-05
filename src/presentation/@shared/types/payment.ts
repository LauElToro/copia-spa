// TypeScript types for ms-payments integration
// Matching the DTOs from ms-payments service

/**
 * Payment Method Enum
 * Must match ms-payments PaymentMethod enum values (UPPERCASE)
 */
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  CRYPTO = 'CRYPTO',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

/**
 * Order Status Enum
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

/**
 * DTO for creating an Order Item
 * Represents a product snapshot at purchase time
 */
export interface CreateOrderItemDto {
  productId: string; // Reference to product in ms-products
  name: string; // Product name snapshot
  quantity: number; // Must be at least 1
  unitPrice: number; // Price snapshot at purchase time
  currency: string; // Product currency (USD, EUR, ARS, USDT, etc.)
  subtotal?: number; // Optional: auto-calculated if missing (quantity * unitPrice)
  [key: string]: unknown; // Index signature for compatibility
}

/**
 * DTO for Transaction-Level Payment Information
 * Each transaction can have its own payment method
 */
export interface TransactionPaymentInfoDto {
  method: PaymentMethod; // CREDIT_CARD, CRYPTO, BANK_TRANSFER, CASH
  provider: string; // VISA, MASTERCARD, PAYPAL, USDT_NETWORK, etc.
  transactionReference?: string; // Optional: Unique payment reference
  status?: string; // Optional: defaults to "pending"
  cryptoId?: string; // Optional: Only when method = CRYPTO (BTC, ETH, USDT, etc.)
  [key: string]: unknown; // Index signature for compatibility
}

/**
 * DTO for Exchange Information
 * Used when item currency differs from transaction currency
 */
export interface ExchangeInfoDto {
  from: string; // Source currency
  to: string; // Target currency
  rate: number; // Exchange rate
  snapshotDate: string; // ISO date of rate snapshot
  [key: string]: unknown; // Index signature for compatibility
}

/**
 * DTO for creating a Transaction
 * Each transaction represents products from a single store
 */
export interface CreateTransactionDto {
  transactionId: string; // Business ID: TXN-001
  storeId: string; // Reference to store in ms-stores
  currency: string; // Store/Transaction currency (typically USDT)
  totalAmount: number; // Sum of item subtotals (auto-calculated, sent value overridden)
  shippingId: string; // Reference to shipping created by frontend via ms-shippings
  items: CreateOrderItemDto[]; // Products in this transaction (at least 1)
  exchange?: ExchangeInfoDto[]; // Optional: Only when item currency != transaction currency
  payment: TransactionPaymentInfoDto; // Payment method and details
  [key: string]: unknown; // Index signature for compatibility
}

/**
 * DTO for Meta Information
 */
export interface MetaInfoDto {
  correlationId?: string; // Unique correlation ID for tracking
  source?: string; // Source of the request (e.g., "frontend-checkout")
  version?: string; // API version (e.g., "1.0")
  [key: string]: unknown; // Allow additional meta fields
}

/**
 * DTO for Creating a Payment Order
 * Payment Order represents a logical grouping of transactions
 */
export interface CreatePaymentOrderDto {
  orderId: string; // Unique order ID (any string accepted)
  userId: string; // User ID from authentication
  status?: OrderStatus; // Optional: defaults to PENDING
  transactions: CreateTransactionDto[]; // At least one transaction
  meta?: MetaInfoDto; // Optional metadata
  [key: string]: unknown; // Index signature for compatibility with Record<string, unknown>
}

/**
 * Response from creating a Payment Order
 */
export interface PaymentOrderResponse {
  id: string; // Database ID (UUID)
  orderId: string; // Business order ID
  userId: string;
  status: OrderStatus;
  currency?: string;
  totalAmount?: number;
  transactionIds?: string[];
  transactions: TransactionResponse[] | Array<{ success: boolean; message: string }>;
  meta?: MetaInfoDto;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Wrapper Response from ms-payments
 * The backend wraps responses in a success/data structure
 */
export interface PaymentsApiResponse<T> {

  success: boolean;
  message: string;
  correlationId: string;
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
}

export interface PaymentOrderStats {
  total: number;
  totalAmount: number;
  totalTransactions: number;
  totalUsers: number;
}

/**
 * Transaction Response
 */
export interface TransactionResponse {
  id: string;
  transactionId: string;
  storeId: string;
  currency: string;
  totalAmount: number;
  shippingId: string;
  items: OrderItemResponse[];
  payment: TransactionPaymentInfoDto;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order Item Response
 */
export interface OrderItemResponse {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  subtotal: number;
}

/**
 * Payment Order API Error Response
 */
export interface PaymentOrderError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
}

