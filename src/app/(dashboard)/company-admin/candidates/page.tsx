import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CompanyCandidatesView } from "@/components/dashboard/company-dashboard/company-candidates-view";

export const metadata: Metadata = {
  title: "Candidate Roster & Performance | Company Admin",
  description:
    "Review candidate test attempts, overall scores, test durations, and live proctoring risk telemetry.",
};

export default function CompanyCandidatesPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/company-admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Page Heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Candidates & Test Results
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor candidate participation, grading scores, and proctoring
          telemetry across your company&apos;s assessments.
        </p>
      </div>

      {/* Interactive Client Component */}
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading candidate records...
          </div>
        }
      >
        <CompanyCandidatesView />
      </Suspense>
    </div>
  );
}
