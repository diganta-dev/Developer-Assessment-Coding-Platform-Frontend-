import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import MemberInvite from "@/components/dashboard/company-dashboard/member-invite";

export default function CompanyAdminInvitationsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Link
          href="/company-admin/company-members"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Team Members
        </Link>
      </div>

      <MemberInvite />
    </div>
  );
}
