import { axiosHelper } from '../helpers/axios-helper';

export interface CreateUalaPaymentRequest {
  orderId: string; // accountId for seller registration
  userId: string; // Account ID
  planId?: string;
  amount: number;
  currency: string;
  description: string;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
  payerEmail?: string;
  payerName?: string;
  payerDni?: string;
  payerPhone?: string;
}

export interface UalaPaymentResponse {
  success: boolean;
  message: string;
  data: {
    checkoutId: string;
    checkoutUrl: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    expiresAt: string;
  };
}

export interface CheckPaymentStatusResponse {
  success: boolean;
  data: {
    checkoutId: string;
    orderId: string;
    userId: string;
    planId?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
    paymentMethod?: string;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export class UalaPaymentService {
  /**
   * Create Uala payment checkout
   */
  static async createPaymentCheckout(
    request: CreateUalaPaymentRequest,
  ): Promise<UalaPaymentResponse> {
    try {
      const response = await axiosHelper.payments.createUalaCheckout(request);
      return response.data as UalaPaymentResponse;
    } catch (error) {
      console.error('Error creating Uala payment checkout:', error);
      throw error;
    }
  }

  /**
   * Check payment status by order ID
   */
  static async checkPaymentStatus(
    orderId: string,
  ): Promise<CheckPaymentStatusResponse> {
    try {
      const response = await axiosHelper.payments.getUalaPaymentByOrderId(orderId);
      return response.data as CheckPaymentStatusResponse;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  /**
   * Check if user has approved payment for a plan
   */
  static async hasApprovedPayment(
    userId: string,
    planId: string,
  ): Promise<boolean> {
    try {
      const response = await axiosHelper.payments.checkUalaPaymentApproved(
        userId,
        planId,
      );
      return response.data.data?.hasApprovedPayment || false;
    } catch (error) {
      console.error('Error checking approved payment:', error);
      return false;
    }
  }
}


