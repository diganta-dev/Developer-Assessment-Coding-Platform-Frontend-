import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ReportsHub } from "@/components/dashboard/reports";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Reports & Analytics | Evaluator Portal",
  description:
    "Candidate submission breakdown, test case telemetry, scoring distributions, and evaluation reports.",
};

export default function EvaluatorReportPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back Navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/evaluator"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Evaluator Dashboard
        </Link>
      </div>

      {/* Main Reports Hub wrapped in Suspense for static site export */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        }
      >
        <ReportsHub defaultTab="assessment" />
      </Suspense>
    </div>
  );
}
