import type { Metadata } from "next";
import { Suspense } from "react";
import { CandidateOverview } from "@/components/dashboard/candidate-dashboard/candidate-overview";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Candidate Dashboard | Developer Assessment Platform",
  description:
    "Track your coding tests, invitations, and evaluation results in real-time.",
};

export default function CandidateDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 w-full max-w-7xl mx-auto p-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-full" />
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <CandidateOverview />
    </Suspense>
  );
}
