"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ReactNode } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardRole } from "@/types";
import { useGetMe } from "@/hook";
import { UserMenu } from "@/components/layout/user-menu";

export default function DashboardShell({
  children,
  role,
}: { 
  children: ReactNode;
  role?: DashboardRole;
}) {
  const { data } = useGetMe();
  const user = data?.data;

  return (
    <SidebarProvider>
      <DashboardSidebar role={role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          {user && <UserMenu user={user} />}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}