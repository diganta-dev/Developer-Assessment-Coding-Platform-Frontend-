"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMe } from "@/hook";
import { getRoleDashboardRoute } from "@/utils/role-routes";
import AuthLoading from "@/components/auth/auth-loading";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { data, isPending, isError } = useGetMe();
  const user = data?.data;

  useEffect(() => {
    if (isPending) return;

    if (isError || !user) {
      router.replace("/login");
      return;
    }

    const destination = getRoleDashboardRoute(user.role);
    router.replace(destination);
  }, [isPending, isError, user, router]);

  return <AuthLoading label="Directing to your role dashboard..." />;
}
