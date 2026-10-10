export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum PaymentType {
  COMPANY_REGISTRATION = "COMPANY_REGISTRATION",
  USER_REGISTRATION = "USER_REGISTRATION",
}

export interface IPaymentRecord {
  id: string;
  paymentReference: string;
  amount: number;
  currency: string;
  paymentType: PaymentType | string;
  status: PaymentStatus | string;
  bkashTransactionId?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    slug: string;
    email: string;
    isVerified: boolean;
    isPaymentVerified: boolean;
  } | null;
}

export interface IRetryCompanyPaymentPayload {
  companyId?: string;
  paymentReference?: string;
}

export interface IRetryCompanyPaymentResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    paymentReference: string;
    bkashURL?: string | null;
    paymentId?: string | null;
    amount?: number;
    currency?: string;
    companyId?: string;
    status?: PaymentStatus | string;
    alreadyVerified?: boolean;
    reconciled?: boolean;
    company?: any;
  };
}
