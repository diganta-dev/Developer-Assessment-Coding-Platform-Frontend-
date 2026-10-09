import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { UserRole } from "@/types";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={[UserRole.CANDIDATE]}>
      <DashboardShell role={UserRole.CANDIDATE}>
        <div className="flex-1 p-6 md:p-8 space-y-6">{children}</div>
      </DashboardShell>
    </RoleGuard>
  );
}
