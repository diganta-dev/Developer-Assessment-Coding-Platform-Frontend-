import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CandidateMyAttempts } from "@/components/dashboard/candidate-dashboard/candidate-my-attempts";

export const metadata: Metadata = {
  title: "My Invitations & Assessments | Candidate Portal",
  description:
    "View your assessment invitations, start coding tests, and review completed evaluations.",
};

export default function CandidateInvitationsPage() {
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
          Assessment Invitations & Attempts
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review your pending test invitations, start active assessments, and
          inspect verified outcomes.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading invitations...
          </div>
        }
      >
        <CandidateMyAttempts />
      </Suspense>
    </div>
  );
}
