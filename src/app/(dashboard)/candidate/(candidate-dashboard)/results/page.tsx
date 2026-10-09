import type { Metadata } from "next";
import { Suspense } from "react";
import { CandidateMyResults } from "@/components/dashboard/candidate-dashboard/candidate-my-results";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "My Results & Rankings | Candidate Portal",
  description:
    "View your official assessment scores, competitive percentile ranks, and problem performance analytics.",
};

export default function CandidateResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      }
    >
      <CandidateMyResults />
    </Suspense>
  );
}
