import { useMutation, useQuery } from "@tanstack/react-query";
import { getPaymentStatus, retryCompanyPayment } from "@/api/payment.api";
import type { IRetryCompanyPaymentPayload } from "@/types";

/**
 * Pure TanStack Query hook to check status of a specific payment reference
 */
export function useGetPaymentStatus(paymentReference?: string) {
  return useQuery({
    queryKey: ["payment-status", paymentReference],
    queryFn: () => getPaymentStatus(paymentReference!),
    enabled: Boolean(paymentReference),
    retry: 2,
    refetchInterval: (query) => {
      // Poll every 3 seconds if pending
      const status = query.state.data?.data?.status;
      return status === "PENDING" ? 3000 : false;
    },
  });
}

/**
 * Pure TanStack Query mutation hook to initiate or retry bKash payment for company
 */
export function useRetryCompanyPayment() {
  return useMutation({
    mutationFn: (payload: IRetryCompanyPaymentPayload = {}) =>
      retryCompanyPayment(payload),
  });
}
