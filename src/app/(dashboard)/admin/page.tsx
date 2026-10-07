import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOverview } from "@/components/dashboard/admin/admin-overview";
import { AdminUserManagement } from "@/components/dashboard/admin/admin-user-management";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Admin Dashboard | Platform Control Center",
  description:
    "Monitor infrastructure health, manage global user directories, and oversee assessment operations.",
};

export default function AdminPage() {
  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        }
      >
        <AdminOverview />
      </Suspense>

      <div className="pt-6 border-t border-border/50 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Platform User Management Directory
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quickly activate or deactivate user accounts, filter by role, or inspect accounts.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <AdminUserManagement />
        </Suspense>
      </div>
    </div>
  );
}