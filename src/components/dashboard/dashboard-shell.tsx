"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { UserMenu } from "@/components/layout/user-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useGetMe } from "@/hook";
import type { DashboardRole } from "@/types";
import { getCompanyRole } from "@/utils";
import { DashboardSidebar } from "./dashboard-sidebar";

export default function DashboardShell({
  children,
  role,
}: {
  children: ReactNode;
  role?: DashboardRole;
}) {
  const { data } = useGetMe();
  const user = data?.data;
  const companyRole = getCompanyRole(user);

  return (
    <SidebarProvider>
      <DashboardSidebar role={role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-3">
            {!companyRole && (
              <Link
                href="/company-registration"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-xs"
              >
                <Building2 className="size-3.5" />
                <span>Register Company</span>
              </Link>
            )}
            {user && <UserMenu user={user} />}
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
