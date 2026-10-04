import { DashboardRole, UserRole, CompanyMemberRole } from "@/types";

/**
 * Mapping of DashboardRole to its primary overview dashboard route
 */
export const ROLE_DASHBOARD_ROUTES: Record<DashboardRole, string> = {
  [UserRole.SUPER_ADMIN]: "/admin",
  [UserRole.ADMIN]: "/admin",
  [UserRole.CANDIDATE]: "/candidate",
  [CompanyMemberRole.COMPANY_OWNER]: "/company-admin",
  [CompanyMemberRole.COMPANY_ADMIN]: "/company-admin",
  [CompanyMemberRole.ASSESSMENT_CREATOR]: "/assessment-creator",
  [CompanyMemberRole.EVALUATOR]: "/evaluator",
};

/**
 * Returns the corresponding dashboard URL based on the user's role.
 * Defaults to "/dashboard" or fallback if not matched.
 */
export function getRoleDashboardRoute(role?: DashboardRole | string | null): string {
  if (!role) return "/login";

  const normalizedRole = role.toUpperCase() as DashboardRole;
  if (normalizedRole in ROLE_DASHBOARD_ROUTES) {
    return ROLE_DASHBOARD_ROUTES[normalizedRole];
  }

  // Fallbacks for common role strings
  switch (normalizedRole) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    case "CANDIDATE":
      return "/candidate";
    case "COMPANY_OWNER":
    case "COMPANY_ADMIN":
      return "/company-admin";
    case "ASSESSMENT_CREATOR":
      return "/assessment-creator";
    case "EVALUATOR":
      return "/evaluator";
    default:
      return "/";
  }
}
