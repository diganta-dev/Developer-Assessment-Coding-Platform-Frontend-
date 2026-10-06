import type { Metadata } from "next";
import { Suspense } from "react";
import { AssessmentInvitationView } from "@/components/dashboard/assessments-components/assessment-invitation-view";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Assessment Invitation | Developer Assessment Platform",
  description:
    "Review details and accept your technical coding assessment invitation.",
};

export default function AssessmentInvitationPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <Card className="max-w-md mx-auto p-8 text-center space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </Card>
        }
      >
        <AssessmentInvitationView />
      </Suspense>
    </div>
  );
}
