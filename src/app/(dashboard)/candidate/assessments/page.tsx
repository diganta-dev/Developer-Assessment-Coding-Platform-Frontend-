import type { Metadata } from "next";
import { Suspense } from "react";
import { CandidateExaminationArena } from "@/components/dashboard/candidate-dashboard/candidate-examination-arena";

export const metadata: Metadata = {
  title: "Examination Arena | Candidate Portal",
  description:
    "Official proctored examination environment for candidate assessment attempts.",
};

export default function CandidateAssessmentsPage() {
  return (
    <main className="h-full w-full flex flex-col overflow-hidden bg-background">
      <Suspense
        fallback={
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-4">
            <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs font-medium text-muted-foreground">
              Initializing examination environment...
            </p>
          </div>
        }
      >
        <CandidateExaminationArena />
      </Suspense>
    </main>
  );
}
