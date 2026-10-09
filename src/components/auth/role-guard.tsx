"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useGetMe } from "@/hook";
import type { DashboardRole } from "@/types";
import { getRoleDashboardRoute, isUserAuthorized } from "@/utils";
import AccessDenied from "./access-denied";
import AuthLoading from "./auth-loading";

interface IProps {
  children: ReactNode;
  roles: DashboardRole[];
}

export default function RoleGuard({ children, roles }: IProps) {
  const router = useRouter();

  const { data, isPending, isError } = useGetMe();

  const user = data?.data;

  const isAuthorized = isUserAuthorized(user, roles);

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

  if (isAuthorized) {
    return <>{children}</>;
  }

  return <AuthLoading label="Redirecting to your dashboard..." />;
}
