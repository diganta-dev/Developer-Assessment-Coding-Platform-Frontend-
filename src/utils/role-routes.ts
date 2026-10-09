import {
  CompanyMemberRole,
  type DashboardRole,
  type IUser,
  UserRole,
} from "@/types";

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
 * Extracts the user's company role from either direct property (JWT payload)
 * or companyMembers array (Prisma relation from GET /api/v1/auth/me).
 */
export function getCompanyRole(
  user?: Partial<IUser> | null,
): CompanyMemberRole | string | null {
  if (!user) return null;

  // 1. Direct companyRole property (e.g. from decoded JWT or flattened user)
  if (user.companyRole) {
    return user.companyRole;
  }

  // 2. From companyMembers array (returned by Prisma auth/me query)
  if (Array.isArray(user.companyMembers) && user.companyMembers.length > 0) {
    const primary = user.companyMembers[0];
    if (primary && primary.role) {
      return primary.role;
    }
  }

  // 3. Fallback for potential nested single object
  if (user.companyMember && user.companyMember.role) {
    return user.companyMember.role;
  }

  return null;
}

/**
 * Extracts the user's companyId from direct property or companyMembers array.
 */
export function getCompanyId(user?: Partial<IUser> | null): string | null {
  if (!user) return null;
  if (user.companyId) return user.companyId;
  if (Array.isArray(user.companyMembers) && user.companyMembers.length > 0) {
    return user.companyMembers[0]?.companyId || null;
  }
  return null;
}

/**
 * Determines the effective dashboard role for a user.
 *
 * Rules:
 * 1. If user has a companyRole (either directly or in companyMembers):
 *    -> That company role determines their dashboard view and permissions.
 * 2. If user only has base role without company membership:
 *    -> Uses base role (e.g. CANDIDATE -> candidate dashboard, ADMIN/SUPER_ADMIN -> admin dashboard).
 * 3. If user has role: "CANDIDATE" WITH company role (e.g. COMPANY_ADMIN):
 *    -> Prioritizes company role to open the respective company dashboard (/company-admin).
 */
export function getUserEffectiveRole(
  user?: Partial<IUser> | null,
): DashboardRole {
  if (!user) return UserRole.CANDIDATE;

  // 1. Check for company role first (from direct companyRole or companyMembers)
  const companyRole = getCompanyRole(user);
  if (companyRole) {
    const normalizedCompanyRole = String(companyRole)
      .trim()
      .toUpperCase() as DashboardRole;
    if (normalizedCompanyRole in ROLE_DASHBOARD_ROUTES) {
      return normalizedCompanyRole;
    }
  }

  // 2. Platform SUPER_ADMIN or ADMIN without company role
  if (user.role) {
    const normalizedRole = String(user.role)
      .trim()
      .toUpperCase() as DashboardRole;
    if (normalizedRole in ROLE_DASHBOARD_ROUTES) {
      return normalizedRole;
    }
  }

  return UserRole.CANDIDATE;
}

/**
 * Checks whether a user is authorized for a list of allowed roles.
 * A user is authorized if their effective role matches any of the allowed roles.
 */
export function isUserAuthorized(
  user: Partial<IUser> | null | undefined,
  allowedRoles: DashboardRole[],
): boolean {
  if (!user) return false;

  const normalizedAllowed = new Set(
    allowedRoles.map((r) => String(r).toUpperCase()),
  );
  const effectiveRole = getUserEffectiveRole(user);

  // 1. Effective role directly matches allowed roles
  if (normalizedAllowed.has(effectiveRole)) {
    return true;
  }

  // 2. Platform administrators have access to ADMIN / SUPER_ADMIN routes
  if (
    user.role &&
    (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) &&
    (normalizedAllowed.has(UserRole.ADMIN) ||
      normalizedAllowed.has(UserRole.SUPER_ADMIN))
  ) {
    return true;
  }

  // 3. COMPANY_OWNER can access COMPANY_ADMIN routes
  const companyRole = getCompanyRole(user);
  if (
    companyRole &&
    String(companyRole).toUpperCase() === CompanyMemberRole.COMPANY_OWNER &&
    normalizedAllowed.has(CompanyMemberRole.COMPANY_ADMIN)
  ) {
    return true;
  }

  return false;
}

/**
 * Returns the corresponding dashboard URL based on the user's role or user object.
 * Defaults to "/candidate" or fallback if not matched.
 */
export function getRoleDashboardRoute(
  roleOrUser?: DashboardRole | string | Partial<IUser> | null,
): string {
  if (!roleOrUser) return "/login";

  // If a user object is passed (has role or companyRole or companyMembers)
  if (typeof roleOrUser === "object") {
    const effectiveRole = getUserEffectiveRole(roleOrUser);
    return ROLE_DASHBOARD_ROUTES[effectiveRole] || "/candidate";
  }

  const normalizedRole = String(roleOrUser)
    .trim()
    .toUpperCase() as DashboardRole;
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
      return "/candidate";
  }
}

/**
 * Explicit helper to get dashboard route directly from a user object.
 */
export function getUserDashboardRoute(user?: Partial<IUser> | null): string {
  return getRoleDashboardRoute(user);
}
