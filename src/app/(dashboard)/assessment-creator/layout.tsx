import { ReactNode } from "react";
import RoleGuard from "@/components/auth/role-guard";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { CompanyMemberRole } from "@/types";

export default function AssessmentCreatorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard roles={[CompanyMemberRole.ASSESSMENT_CREATOR]}>
      <DashboardShell role={CompanyMemberRole.ASSESSMENT_CREATOR}>
        <div className="flex-1 p-6 md:p-8 space-y-6">
          {children}
        </div>
      </DashboardShell>
    </RoleGuard>
  );
}
