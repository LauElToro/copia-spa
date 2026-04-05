// Tipos para las estructuras de datos del ms-transactions

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  CRYPTO = 'CRYPTO',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

// Transaction Entity
export interface TransactionEntity {
  id: string;
  transactionId: string;
  date: string | Date;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  currency: string;
  accountId: string;
  cryptoId?: string;
  shippingId?: string;
}

// Transaction Response (API response wrapper)
export interface TransactionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: TransactionEntity | TransactionEntity[];
  correlationId?: string;
  meta?: {
    timestamp: string;
    version: string;
  };
}

// Mapped transaction for UI (purchases table)
export interface PurchaseTransaction {
  id: string;
  product: string;
  seller: string;
  email: string;
  status: string;
  amount: string;
  date: string;
}

