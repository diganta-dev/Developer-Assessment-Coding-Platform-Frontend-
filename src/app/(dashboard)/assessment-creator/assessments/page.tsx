import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AssessmentManagement } from "@/components/dashboard/assessments-components/assessment-management";

export const metadata: Metadata = {
  title: "Assessments Builder | Assessment Creator",
  description: "Create, configure, publish tests, and release candidate results.",
};

export default function AssessmentCreatorAssessmentsPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/assessment-creator"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Creator Dashboard
        </Link>
      </div>

      {/* Page Heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Assessments & Tests</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Design coding assessments, invite candidates, and publish official test results.
        </p>
      </div>

      {/* Client Component */}
      <AssessmentManagement />
    </div>
  );
}
