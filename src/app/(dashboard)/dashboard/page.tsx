import type { Metadata } from "next";
import DashboardRedirect from "@/components/dashboard/dashboard-redirect";

export const metadata: Metadata = {
  title: "Dashboard | Developer Assessment Platform",
  description: "Directing to your role-specific dashboard",
};

export default function DashboardIndexPage() {
  return <DashboardRedirect />;
}
