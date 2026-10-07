import type { Metadata } from "next";
import { Suspense } from "react";
import { CandidateAssessmentWorkspace } from "@/components/dashboard/candidate-dashboard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Assessment Workspace | Candidate Portal",
  description:
    "Solve coding challenges, multiple-choice questions, and submit your technical assessment solutions.",
};

export default function CandidateAssessmentsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Suspense
        fallback={
          <Card className="p-8 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </Card>
        }
      >
        <CandidateAssessmentWorkspace />
      </Suspense>
    </div>
  );
}
