import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProblemBankCreate } from "@/components/dashboard/Problem-Bank-Management/problem-bank-create";

export const metadata: Metadata = {
  title: "Problem Bank Management | Assessment Creator",
  description:
    "Create, configure, and manage technical questions and challenges.",
};

export default function AssessmentCreatorProblemsPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Link
          href="/assessment-creator"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Problem Bank Library
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Create and organize coding, multiple choice, and written assessment
          questions.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading problem bank...
          </div>
        }
      >
        <ProblemBankCreate />
      </Suspense>
    </div>
  );
}
