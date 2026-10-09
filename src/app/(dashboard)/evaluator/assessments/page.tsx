import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GetAllAssessment } from "@/components/dashboard/assessments-components/getAllAssessment";

export const metadata: Metadata = {
  title: "Assigned Assessments | Evaluator Portal",
  description:
    "Browse assigned candidate coding assessments, proctoring benchmarks, and candidate rosters.",
};

export default function EvaluatorAssessmentsPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/evaluator"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Evaluator Dashboard
        </Link>
      </div>

      {/* Page Heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Assigned Assessments
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review your assigned company assessments, test schedules, and
          candidate invitation rosters.
        </p>
      </div>

      {/* Client Component */}
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
            Loading assigned assessments...
          </div>
        }
      >
        <GetAllAssessment />
      </Suspense>
    </div>
  );
}
