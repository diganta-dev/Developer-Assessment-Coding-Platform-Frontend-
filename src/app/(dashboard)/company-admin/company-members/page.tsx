import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ManageTeam } from "@/components/dashboard/company-dashboard/company-manage-team";

export default function CompanyMembersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/company-admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Company Profile
        </Link>
      </div>

      <ManageTeam />
    </div>
  );
}
