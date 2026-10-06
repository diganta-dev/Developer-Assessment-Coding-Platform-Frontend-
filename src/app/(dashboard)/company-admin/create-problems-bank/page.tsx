import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProblemBankCreate } from "@/components/dashboard/Problem-Bank-Management/problem-bank-create";

export default function CreateProblemsBankPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Link
          href="/company-admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Problem Bank</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Create and manage your company&apos;s question library
        </p>
      </div>

      <ProblemBankCreate />
    </div>
  );
}
