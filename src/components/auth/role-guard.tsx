"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useGetMe } from "@/hook";
import { CompanyMemberRole, type DashboardRole, UserRole } from "@/types";
import { getRoleDashboardRoute, isUserAuthorized } from "@/utils";
import AccessDenied from "./access-denied";
import AuthLoading from "./auth-loading";
import CompanyPaymentGuard from "./company-payment-guard";

interface IProps {
  children: ReactNode;
  roles: DashboardRole[];
}

export default function RoleGuard({ children, roles }: IProps) {
  const router = useRouter();

  const { data, isPending, isError } = useGetMe();

  const user = data?.data;

  const isAuthorized = isUserAuthorized(user, roles);

  // Check if accessing company workspace while company payment is unverified
  const isCompanyRoleRequired =
    roles.includes(CompanyMemberRole.COMPANY_ADMIN) ||
    roles.includes(CompanyMemberRole.COMPANY_OWNER);

  const company = user?.companyMembers?.[0]?.company;
  const isPlatformAdmin =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN;

  const isUnpaidCompany =
    isCompanyRoleRequired &&
    !isPlatformAdmin &&
    company &&
    company.isPaymentVerified === false;

  useEffect(() => {
    if (isPending) {
      return;
    }
    if (isError || !user) {
      router.replace("/login");
      return;
    }
    if (!isAuthorized) {
      // User is authenticated, but their active role belongs to another dashboard.
      // Automatically redirect them to their rightful dashboard!
      const rightfulDashboard = getRoleDashboardRoute(user);
      router.replace(rightfulDashboard);
    }
  }, [isPending, isError, user, isAuthorized, router]);

  if (isPending) {
    return <AuthLoading />;
  }

  if (isError || !user) {
    return <AuthLoading label="Redirecting..." />;
  }

  // Mandatory Payment Barrier: Enforce payment verification before company dashboard
  if (isUnpaidCompany) {
    return <CompanyPaymentGuard company={company} />;
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return <AuthLoading label="Redirecting to your dashboard..." />;
}
