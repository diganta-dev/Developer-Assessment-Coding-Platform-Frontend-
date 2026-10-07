"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DetailedAssessmentReportView } from "./detailed-assessment-report-view";

interface DetailedAssessmentReportDialogProps {
  attemptId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetailedAssessmentReportDialog({
  attemptId,
  open,
  onOpenChange,
}: DetailedAssessmentReportDialogProps) {
  if (!attemptId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Detailed Assessment Report</DialogTitle>
          <DialogDescription>
            Audit log, candidate submission breakdown, and anti-cheat telemetry
          </DialogDescription>
        </DialogHeader>

        <DetailedAssessmentReportView
          attemptId={attemptId}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export default DetailedAssessmentReportDialog;
