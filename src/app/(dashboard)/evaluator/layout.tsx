import type { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { CompanyMemberRole } from "@/types";

export default function EvaluatorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={[CompanyMemberRole.EVALUATOR]}>
      <DashboardShell role={CompanyMemberRole.EVALUATOR}>
        <div className="flex-1 p-6 md:p-8 space-y-6">{children}</div>
      </DashboardShell>
    </RoleGuard>
  );
}
