import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProblemBankCreate } from "@/components/dashboard/Problem-Bank-Management/problem-bank-create";

export default function CreateProblemsBankPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Link
          href="/company-admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
      </div>

      <ProblemBankCreate />
    </div>
  );
}
