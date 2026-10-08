"use client";

import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
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
import { useFinalizeAndSubmitResult } from "@/hook/assessment.hook";
import type { ISubmitAttemptPayload } from "@/types/assessment.type";

interface FinalizeSubmitAttemptDialogProps {
  attemptId: string | null;
  assessmentTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload?: ISubmitAttemptPayload;
  onSuccess?: (attemptId: string) => void;
}

export function FinalizeSubmitAttemptDialog({
  attemptId,
  assessmentTitle,
  open,
  onOpenChange,
  payload,
  onSuccess,
}: FinalizeSubmitAttemptDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const finalizeMutation = useFinalizeAndSubmitResult();

  const handleConfirmSubmit = async () => {
    if (!attemptId) return;
    setErrorMessage(null);

    finalizeMutation.mutate(
      {
        attemptId,
        payload,
      },
      {
        onSuccess: (data) => {
          toast.add({
            title: "Assessment Submitted Successfully!",
            description:
              data?.message ||
              "Your answers have been recorded and submitted for evaluation.",
            type: "success",
          });
          onOpenChange(false);
          if (onSuccess) {
            onSuccess(attemptId);
          }
        },
        onError: (err: unknown) => {
          const message =
            err instanceof Error
              ? err.message
              : (err as { message?: string })?.message ||
                "Failed to submit assessment. Please check your network and try again.";
          setErrorMessage(message);
          toast.add({
            title: "Submission Failed",
            description: message,
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-5 sm:p-6 gap-4">
        <DialogHeader className="space-y-2 text-center items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-inner">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg font-bold tracking-tight text-foreground">
            Finalize & Submit Assessment?
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
            {assessmentTitle ? (
              <span className="block font-medium text-foreground mb-1">
                &quot;{assessmentTitle}&quot;
              </span>
            ) : null}
            Once submitted, your test will be officially locked. You will not be
            able to re-attempt or modify any submitted answers.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Automatic Instant Evaluation</span>
          </div>
          <p className="pl-6 text-[11px] leading-relaxed">
            MCQ questions are automatically scored upon submission. Code
            solutions and written responses will undergo system checks and
            evaluator review.
          </p>
        </div>

        <DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs"
            disabled={finalizeMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel & Continue Test
          </Button>
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            disabled={finalizeMutation.isPending}
            onClick={handleConfirmSubmit}
          >
            {finalizeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Confirm & Submit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
