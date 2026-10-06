import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AssessmentManagement } from "@/components/dashboard/assessments-components/assessment-management";

export default function AssessmentsPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/company-admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Page Heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Assessments</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your company&apos;s assessments, schedules, and proctoring
          benchmarks
        </p>
      </div>

      {/* Client Component */}
      <AssessmentManagement />
    </div>
  );
}
