import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteAdminUser,
  getAdminCompanies,
  getAdminDashboardStatistics,
  getAdminSystemStatistics,
  getAdminUserDetails,
  getAdminUsers,
  updateAdminUserStatus,
} from "@/api/admin.api";
import type {
  ICompanyFilterQuery,
  IUpdateUserStatusPayload,
  IUserFilterQuery,
} from "@/types/admin.type";

/**
 * Pure query hook: Platform dashboard overview statistics
 */
export function useGetAdminDashboardStats() {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => getAdminDashboardStatistics(),
  });
}

/**
 * Pure query hook: System and infrastructure telemetry
 */
export function useGetAdminSystemStats() {
  return useQuery({
    queryKey: ["admin-system-stats"],
    queryFn: () => getAdminSystemStatistics(),
  });
}

/**
 * Pure query hook: User management directory with filters
 */
export function useGetAdminUsers(query?: IUserFilterQuery) {
  return useQuery({
    queryKey: ["admin-users", query],
    queryFn: () => getAdminUsers(query),
  });
}

/**
 * Pure query hook: Detailed user profile and history
 */
export function useGetAdminUserDetails(id: string, enabled = true) {
  return useQuery({
    queryKey: ["admin-user-details", id],
    queryFn: () => getAdminUserDetails(id),
    enabled: Boolean(id) && enabled,
    refetchInterval: false,
  });
}

/**
 * Pure mutation hook: Update user status or role
 */
export function useUpdateAdminUserStatus() {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IUpdateUserStatusPayload;
    }) => updateAdminUserStatus(id, payload),
  });
}

/**
 * Pure mutation hook: Delete platform user
 */
export function useDeleteAdminUser() {
  return useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
  });
}

/**
 * Pure query hook: Platform companies directory
 */
export function useGetAdminCompanies(query?: ICompanyFilterQuery) {
  return useQuery({
    queryKey: ["admin-companies", query],
    queryFn: () => getAdminCompanies(query),
  });
}
