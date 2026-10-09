"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Award,
  Clock,
  Code2,
  Loader2,
  Trash2,
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
import { useDeleteAssessment } from "@/hook/assessment.hook";
import type {
  IAssessment,
  ISingleAssessmentDetail,
} from "@/types/assessment.type";

export interface DeleteAssessmentDialogProps {
  assessment: IAssessment | ISingleAssessmentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteAssessmentDialog({
  assessment,
  open,
  onOpenChange,
  onSuccess,
}: DeleteAssessmentDialogProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteAssessment();

  if (!assessment) return null;

  const countObj = assessment._count as
    | {
        problems?: number;
        invitations?: number;
        attempts?: number;
        candidates?: number;
        submissions?: number;
      }
    | undefined;

  const problemCount =
    countObj?.problems ??
    (Array.isArray(assessment.problems) ? assessment.problems.length : 0);

  const invitationsCount = countObj?.invitations ?? countObj?.candidates ?? 0;
  const attemptsCount = countObj?.attempts ?? countObj?.submissions ?? 0;

  const isLiveOrPublished =
    assessment.status === "ACTIVE" || assessment.status === "PUBLISHED";

  const handleDelete = () => {
    if (!assessment.id || deleteMutation.isPending) return;

    deleteMutation.mutate(assessment.id, {
      onSuccess: () => {
        // Senior pattern: perform invalidations and notifications in the component
        queryClient.invalidateQueries({ queryKey: ["my-assessments"] });
        queryClient.invalidateQueries({ queryKey: ["company-assessments"] });
        queryClient.invalidateQueries({ queryKey: ["assessments"] });
        queryClient.removeQueries({
          queryKey: ["assessment-single", assessment.id],
        });

        toast.add({
          title: "Assessment Deleted",
          description: `"${assessment.title}" has been permanently removed.`,
          type: "success",
        });

        onSuccess?.();
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        const apiErr = err as {
          data?: { message?: string };
          message?: string;
        };

        toast.add({
          title: "Failed to Delete Assessment",
          description:
            apiErr?.data?.message ||
            apiErr?.message ||
            "An error occurred while deleting the assessment. Please try again.",
          type: "error",
        });
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !deleteMutation.isPending) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent size="md" className="p-5 sm:p-6 gap-4">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
              <Trash2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                Delete Assessment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                This action is destructive and cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Assessment Overview Card */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-foreground line-clamp-1">
                {assessment.title}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                ID: {assessment.id}
              </p>
            </div>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                assessment.status === "DRAFT"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : assessment.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
              }`}
            >
              {assessment.status || "DRAFT"}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Code2 className="size-3.5 text-primary shrink-0" />
              <span>{problemCount} Questions</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5 text-primary shrink-0" />
              <span>{assessment.durationMinutes || 0} mins</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Award className="size-3.5 text-primary shrink-0" />
              <span>{assessment.totalMarks || 0} pts</span>
            </div>
          </div>
        </div>

        {/* High Risk Caution Warning */}
        {isLiveOrPublished && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">
                Caution: Live / Published Assessment
              </p>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-300/80 leading-relaxed">
                This assessment is marked as{" "}
                <strong>{assessment.status}</strong>.
                {invitationsCount > 0 || attemptsCount > 0 ? (
                  <span>
                    {" "}
                    It currently has <strong>{invitationsCount}</strong>{" "}
                    invitations and <strong>{attemptsCount}</strong> attempts
                    recorded.
                  </span>
                ) : null}{" "}
                Deleting it will immediately disconnect all candidate access.
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Are you sure you want to permanently delete{" "}
          <strong className="text-foreground">
            &quot;{assessment.title}&quot;
          </strong>
          ? All associated test configurations and questions linked to this
          assessment will be removed.
        </p>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            id="confirm-delete-assessment-btn"
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
            className="text-xs gap-1.5 font-semibold cursor-pointer"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Deleting Assessment...
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                Confirm & Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteAssessmentDialog;
