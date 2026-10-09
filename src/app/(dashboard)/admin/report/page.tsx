import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ReportsHub } from "@/components/dashboard/reports";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Reports & Global Analytics | Admin Control Center",
  description:
    "Cross-assessment analytics, score variance distributions, candidate submission diagnostics, and organization telemetry.",
};

export default function AdminAttemptReportPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back Navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Admin Dashboard
        </Link>
      </div>

      {/* Main Reports Hub wrapped in Suspense for static site export */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        }
      >
        <ReportsHub defaultTab="assessment" />
      </Suspense>
    </div>
  );
}
