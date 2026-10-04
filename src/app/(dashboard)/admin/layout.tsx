import { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { UserRole } from "@/types";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
      <DashboardShell role={UserRole.ADMIN}>
        <div className="flex-1 p-6 md:p-8 space-y-6">
          {children}
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
