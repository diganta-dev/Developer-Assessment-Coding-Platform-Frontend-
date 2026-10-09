import type { Metadata } from "next";
import { Suspense } from "react";
import { CandidateMySubmissions } from "@/components/dashboard/candidate-dashboard/candidate-my-submissions";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "My Submissions | Candidate Portal",
  description:
    "Review all submitted solutions, code execution performance, MCQ choices, and detailed rubric scores.",
};

export default function CandidateSubmissionsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Suspense
        fallback={
          <Card className="p-8 space-y-4">
            <Skeleton className="h-7 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </Card>
        }
      >
        <CandidateMySubmissions />
      </Suspense>
    </div>
  );
}
