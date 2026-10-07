import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DetailedAssessmentReportView } from "@/components/dashboard/assessments-components/detailed-assessment-report-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Detailed Assessment Report | Company Admin",
  description: "Candidate submission breakdown, test case telemetry, and anti-cheat audit report.",
};

export default function CompanyStaffAttemptReportPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back Navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/company-admin/assessments"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Assessments
        </Link>
      </div>

      {/* Main Report View wrapped in Suspense for static site export */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        }
      >
        <DetailedAssessmentReportView isStandalonePage={true} />
      </Suspense>
    </div>
  );
}
