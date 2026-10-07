import apiClient from "@/lib/apiClient";
import type {
  IAdminCompanyListResponse,
  IAdminDashboardStatsResponse,
  IAdminUserDetailsResponse,
  IAdminUserListResponse,
  ICompanyFilterQuery,
  ISystemStatisticsResponse,
  IUpdateUserStatusPayload,
  IUpdateUserStatusResponse,
  IUserFilterQuery,
} from "@/types/admin.type";

/**
 * 1. Overview dashboard counts and metrics
 */
export function getAdminDashboardStatistics(): Promise<IAdminDashboardStatsResponse> {
  return apiClient("admin-management/dashboard-statistics", {
    method: "GET",
  });
}

/**
 * 2. System and infrastructure telemetry
 */
export function getAdminSystemStatistics(): Promise<ISystemStatisticsResponse> {
  return apiClient("admin-management/system-statistics", {
    method: "GET",
  });
}

/**
 * 3. User management directory with filters
 */
export function getAdminUsers(
  query?: IUserFilterQuery,
): Promise<IAdminUserListResponse> {
  return apiClient("admin-management/users", {
    method: "GET",
    query,
  });
}

/**
 * 4. Get detailed user profile and history
 */
export function getAdminUserDetails(
  id: string,
): Promise<IAdminUserDetailsResponse> {
  return apiClient(`admin-management/users/${id}`, {
    method: "GET",
  });
}

/**
 * 5. Update user active/verified status or role
 */
export function updateAdminUserStatus(
  id: string,
  payload: IUpdateUserStatusPayload,
): Promise<IUpdateUserStatusResponse> {
  return apiClient(`admin-management/users/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

/**
 * 6. Delete platform user
 */
export function deleteAdminUser(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  return apiClient(`admin-management/users/${id}`, {
    method: "DELETE",
  });
}

/**
 * 7. Query all companies across the platform
 */
export function getAdminCompanies(
  query?: ICompanyFilterQuery,
): Promise<IAdminCompanyListResponse> {
  return apiClient("admin-management/companies", {
    method: "GET",
    query,
  });
}
