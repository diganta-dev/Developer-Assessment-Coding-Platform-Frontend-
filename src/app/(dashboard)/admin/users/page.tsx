import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminUserManagement } from "@/components/dashboard/admin/admin-user-management";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "User Directory Management | Platform Admin",
  description:
    "Manage platform users, candidate rosters, organization recruiters, and administrator privileges.",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Platform User Management Directory
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          View all registered candidates, recruiters, and platform
          administrators. Toggle access status or remove accounts.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <AdminUserManagement />
      </Suspense>
    </div>
  );
}
