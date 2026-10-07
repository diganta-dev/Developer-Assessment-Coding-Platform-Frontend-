import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminCompanyManagement } from "@/components/dashboard/admin/admin-company-management";

export const metadata: Metadata = {
  title: "Companies Management | Admin Portal",
  description:
    "Review all registered organizations, verification statuses, and tenant usage metrics.",
};

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Overview
        </Link>
      </div>

      {/* Page Heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Organizations & Companies
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor enterprise accounts, company verifications, and platform
          assessment activity.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading companies directory...
          </div>
        }
      >
        <AdminCompanyManagement />
      </Suspense>
    </div>
  );
}
