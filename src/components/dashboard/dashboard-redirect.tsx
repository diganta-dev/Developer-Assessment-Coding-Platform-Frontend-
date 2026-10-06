"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthLoading from "@/components/auth/auth-loading";
import { useGetMe } from "@/hook";
import { getRoleDashboardRoute } from "@/utils/role-routes";

export function DashboardRedirect() {
  const router = useRouter();
  const { data, isPending, isError } = useGetMe();
  const user = data?.data;

  useEffect(() => {
    if (isPending) return;

    if (isError || !user) {
      router.replace("/login");
      return;
    }

    const destination = getRoleDashboardRoute(user);
    router.replace(destination);
  }, [isPending, isError, user, router]);

  return <AuthLoading label="Directing to your role dashboard..." />;
}

export default DashboardRedirect;
