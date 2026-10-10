import type { ReactNode } from "react";

/**
 * Dedicated Examination Layout
 * Completely independent of the Candidate Dashboard Shell.
 * Provides a distraction-free, full-window canvas for technical assessments.
 */
export default function AssessmentExaminationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col z-50">
      {children}
    </div>
  );
}
