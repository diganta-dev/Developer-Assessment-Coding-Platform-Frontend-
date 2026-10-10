import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { UserRole } from "@/types";

export default function CandidateDashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell role={UserRole.CANDIDATE}>
      <div className="flex-1 p-6 md:p-8 space-y-6">{children}</div>
    </DashboardShell>
  );
}
