"useclient";

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
      <DialogContent className="w-[96vw] max-w-xl max-h-[90vh] overflow-y-auto border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-inner">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl font-bold tracking-tight text-foreground">
            Finalize & Submit Assessment?
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground leading-relaxed">
            {assessmentTitle ? (
              <span className="block font-medium text-foreground mb-1">
                "{assessmentTitle}"
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

        <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 space-y-2 text-xs text-muted-foreground">
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

        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto text-xs"
            disabled={finalizeMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel & Continue Test
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20"
            disabled={finalizeMutation.isPending}
            onClick={handleConfirmSubmit}
          >
            {finalizeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting & Evaluating...
              </>
            ) : (
              <>
                <Send className="mr-2 h-3.5 w-3.5" />
                Confirm & Submit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
