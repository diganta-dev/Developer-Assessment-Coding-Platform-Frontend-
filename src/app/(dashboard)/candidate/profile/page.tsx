import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CandidateProfileView } from "@/components/dashboard/candidate-dashboard/candidate-profile-view";

export const metadata: Metadata = {
  title: "Candidate Profile | Candidate Portal",
  description:
    "Review candidate profile details, test activity, and portfolio scores.",
};

export default function CandidateProfilePage() {
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Link
          href="/candidate"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Page Heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Candidate Profile & Activity
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review your verified identity, examination records, and portfolio
          evaluations.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading candidate profile...
          </div>
        }
      >
        <CandidateProfileView />
      </Suspense>
    </div>
  );
}
