import type { Metadata } from "next";
import { Suspense } from "react";
import { EvaluatorGradingQueue } from "@/components/dashboard/evaluator/evaluator-grading-queue";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Submissions & Grading Queue | Evaluator Portal",
  description:
    "Review candidate code submissions, grade evaluations, and inspect test case execution results.",
};

export default function EvaluatorSubmissionsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <EvaluatorGradingQueue />
    </Suspense>
  );
}
