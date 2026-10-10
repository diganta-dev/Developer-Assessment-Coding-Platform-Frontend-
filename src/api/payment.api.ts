import apiClient from "@/lib/apiClient";
import type {
  IPaymentRecord,
  IRetryCompanyPaymentPayload,
  IRetryCompanyPaymentResponse,
} from "@/types";

export interface IPaymentStatusApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IPaymentRecord;
}

/**
 * Retrieves the verification status of a specific payment reference.
 */
export function getPaymentStatus(paymentReference: string) {
  return apiClient<IPaymentStatusApiResponse>(
    `payment/status/${paymentReference}`,
  );
}

/**
 * Retries or initiates bKash Tokenized Checkout for company registration.
 */
export function retryCompanyPayment(payload: IRetryCompanyPaymentPayload = {}) {
  return apiClient<IRetryCompanyPaymentResponse>(
    "payment/retry-company-payment",
    {
      method: "POST",
      body: payload,
    },
  );
}
