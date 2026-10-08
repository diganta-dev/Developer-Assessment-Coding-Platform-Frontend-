"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  FileText,
  HelpCircle,
  Loader2,
  MessageSquare,
  PenTool,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useManualEvaluateSubmission } from "@/hook/evaluation.hook";
import type { IEvaluationListItem } from "@/types/evaluation.type";

interface ManualEvaluationDialogProps {
  evaluation: IEvaluationListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManualEvaluationDialog({
  evaluation,
  isOpen,
  onClose,
  onSuccess,
}: ManualEvaluationDialogProps) {
  const queryClient = useQueryClient();
  const manualEvaluateMutation = useManualEvaluateSubmission();

  const maxMarks = evaluation?.submission?.problem?.marks ?? 10;
  const [marks, setMarks] = useState<number>(evaluation?.marks ?? 0);
  const [feedback, setFeedback] = useState<string>(
    evaluation?.feedback ?? "",
  );

  useEffect(() => {
    if (evaluation) {
      setMarks(evaluation.marks ?? 0);
      setFeedback(evaluation.feedback ?? "");
    }
  }, [evaluation]);

  if (!isOpen || !evaluation) return null;

  const problem = evaluation.submission.problem;
  const submission = evaluation.submission;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (marks < 0 || marks > maxMarks) {
      toast.add({
        title: "Invalid Marks",
        description: `Marks must be between 0 and ${maxMarks}.`,
        type: "error",
      });
      return;
    }

    manualEvaluateMutation.mutate(
      {
        submissionId: evaluation.submissionId,
        payload: {
          marks: Number(marks),
          feedback: feedback.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["evaluations"] });
          queryClient.invalidateQueries({
            queryKey: ["evaluation", evaluation.id],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "assessment-attempt-detailed-report",
              submission.attemptId,
            ],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-attempt", submission.attemptId],
          });

          toast.add({
            title: "Grading Saved Successfully",
            description: `Assigned ${marks} / ${maxMarks} marks for "${problem.title}".`,
            type: "success",
          });

          onSuccess?.();
          onClose();
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };
          toast.add({
            title: "Grading Submission Failed",
            description:
              apiErr?.data?.message ||
              apiErr?.message ||
              "Could not record manual evaluation. Please try again.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-grading-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-popover text-popover-foreground border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <PenTool className="size-5" />
            </div>
            <div>
              <h2
                id="manual-grading-title"
                className="text-base font-bold text-foreground"
              >
                Manual Evaluation & Grading Rubric
              </h2>
              <p className="text-xs text-muted-foreground">
                Submission ID: <code className="font-mono">{submission.id.slice(0, 8)}...</code>
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Problem Overview Card */}
            <Card className="p-4 border-border/70 bg-muted/20 space-y-2 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
                    {problem.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-secondary-foreground">
                    {problem.difficulty}
                  </span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  Max Points: <strong className="text-foreground">{maxMarks} pts</strong>
                </span>
              </div>

              <h3 className="text-sm font-bold text-foreground">{problem.title}</h3>
            </Card>

            {/* Candidate Submitted Response Preview */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" />
                Candidate Submitted Response
              </Label>

              {problem.type === "WRITTEN" && (
                <div className="p-3.5 rounded-xl border border-border/60 bg-background text-xs font-normal leading-relaxed text-foreground whitespace-pre-wrap max-h-52 overflow-y-auto">
                  {submission.answerText || (
                    <span className="italic text-muted-foreground">No written response provided.</span>
                  )}
                </div>
              )}

              {problem.type === "CODING" && (
                <div className="rounded-xl border border-border/60 bg-zinc-950 p-3.5 text-xs font-mono text-zinc-100 max-h-52 overflow-y-auto">
                  <div className="text-[10px] text-zinc-400 mb-1.5 flex items-center justify-between pb-1 border-b border-zinc-800">
                    <span>Language: {submission.language || "code"}</span>
                    <span>Executed: {submission.status}</span>
                  </div>
                  <pre>{submission.sourceCode || "// No code submitted"}</pre>
                </div>
              )}

              {problem.type === "MCQ" && (
                <div className="p-3.5 rounded-xl border border-border/60 bg-background text-xs space-y-1">
                  <p className="text-muted-foreground">
                    Selected Option ID:{" "}
                    <code className="font-mono text-foreground font-semibold">
                      {submission.selectedOptionId || "None"}
                    </code>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Auto-Evaluated: {submission.isCorrect ? "Correct" : "Incorrect"}
                  </p>
                </div>
              )}
            </div>

            {/* Marks Assignment Form */}
            <div className="space-y-4 pt-2 border-t border-border/50">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="marks-input" className="text-xs font-semibold flex items-center gap-1.5">
                    <Award className="size-3.5 text-primary" />
                    Assigned Marks (0 to {maxMarks}) <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs font-bold text-foreground">
                    {marks} / {maxMarks} pts
                  </span>
                </div>
                <Input
                  id="marks-input"
                  type="number"
                  min={0}
                  max={maxMarks}
                  step={0.5}
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  required
                  className="h-9 text-sm font-semibold"
                />
              </div>

              {/* Feedback and Rubric Remarks */}
              <div className="space-y-1.5">
                <Label htmlFor="feedback-input" className="text-xs font-semibold flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-primary" />
                  Evaluator Rubric Feedback & Comments (Optional)
                </Label>
                <Textarea
                  id="feedback-input"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback, reasoning for point deductions, or praise for solution approach..."
                  className="text-xs min-h-[90px] leading-relaxed"
                />

                {/* Quick Feedback Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Excellent solution structure",
                    "Edge cases missed",
                    "Correct methodology with minor syntax flaws",
                    "Clear and concise written explanation",
                    "Lacks required detail",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setFeedback((prev) => (prev ? `${prev} • ${preset}` : preset))
                      }
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={manualEvaluateMutation.isPending}
              className="text-xs font-semibold gap-1.5"
            >
              {manualEvaluateMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving Grade...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Save & Publish Evaluation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManualEvaluationDialog;
