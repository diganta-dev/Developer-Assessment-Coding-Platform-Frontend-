"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Loader2,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { usePublishResult } from "@/hook/assessment.hook";
import type { IAssessment } from "@/types/assessment.type";

interface PublishResultsDialogProps {
  assessment: IAssessment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PublishResultsDialog({
  assessment,
  open,
  onOpenChange,
  onSuccess,
}: PublishResultsDialogProps) {
  const queryClient = useQueryClient();
  const publishMutation = usePublishResult();

  if (!assessment) return null;

  const handleConfirmPublishResults = () => {
    publishMutation.mutate(assessment.id, {
      onSuccess: (res) => {
        // Query invalidation in component (senior guideline)
        queryClient.invalidateQueries({ queryKey: ["company-assessments"] });
        queryClient.invalidateQueries({ queryKey: ["assessments"] });
        if (assessment.id) {
          queryClient.invalidateQueries({
            queryKey: ["assessment-invitations", assessment.id],
          });
        }
        queryClient.invalidateQueries({
          queryKey: ["assessment-attempt-result"],
        });
        queryClient.invalidateQueries({
          queryKey: ["candidate-my-attempts"],
        });
        queryClient.invalidateQueries({
          queryKey: ["my-attempts"],
        });

        toast.add({
          title: "Results Published Successfully",
          description:
            res?.message ||
            `Evaluation results for "${assessment.title}" are now officially published and visible to candidates.`,
          type: "success",
        });
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (err: unknown) => {
        const apiErr = err as {
          data?: { message?: string };
          message?: string;
        };

        toast.add({
          title: "Failed to Publish Results",
          description:
            apiErr?.data?.message ||
            apiErr?.message ||
            "An unexpected error occurred while publishing assessment results.",
          type: "error",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl space-y-4">
        {/* Header */}
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Award className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Publish Assessment Results
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Release finalized scores, ranks, and reports to candidates
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Assessment Card */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-foreground line-clamp-1">
                {assessment.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                ID: <span className="font-mono">{assessment.id.slice(0, 12)}...</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="size-3" />
              Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileCheck2 className="size-3 text-primary" />
              <span>Total Marks: <strong className="text-foreground">{assessment.totalMarks}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>Passing: <strong className="text-foreground">{assessment.passingScore ?? "N/A"}</strong></span>
            </div>
          </div>
        </div>

        {/* Informational Guidance Box */}
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-amber-700 dark:text-amber-400">
            <Megaphone className="size-3.5" />
            <span>Important Candidate Impact</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>
              Candidates who submitted their attempts will immediately be able to view their scores, detailed breakdown, and pass/fail outcome.
            </li>
            <li>
              Anti-cheat proctoring flags and evaluator reviews will be locked into the finalized outcome.
            </li>
          </ul>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={publishMutation.isPending}
            className="text-xs h-8 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirmPublishResults}
            disabled={publishMutation.isPending}
            className="text-xs h-8 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
          >
            {publishMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Publishing Results...</span>
              </>
            ) : (
              <>
                <Award className="size-3.5" />
                <span>Confirm & Publish Results</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PublishResultsDialog;
