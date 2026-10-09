import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AssessmentManagement } from "@/components/dashboard/assessments-components/assessment-management";

export const metadata: Metadata = {
  title: "Assessments Management | Admin Control Center",
  description:
    "Monitor and manage platform coding assessments, candidate invitations, and published results.",
};

export default function AdminAssessmentsPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Admin Dashboard
        </Link>
      </div>

      {/* Page Heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Assessments Oversight
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review, publish, manage question banks, and release candidate results
          across all platform assessments.
        </p>
      </div>

      {/* Client Component */}
      <AssessmentManagement />
    </div>
  );
}
