"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  FileCheck2,
  FileText,
  HelpCircle,
  ListChecks,
  Loader2,
  Percent,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  useCalculateAttemptScore,
  useGetAttemptDetails,
} from "@/hook/assessment.hook";
import type {
  IAttemptScoreBreakdownItem,
  ICalculateAttemptScoreData,
} from "@/types/assessment.type";
import { AttemptResultDialog } from "./attempt-result-dialog";

interface CalculateScoreDialogProps {
  attemptId: string | null;
  assessmentTitle?: string;
  candidateName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: ICalculateAttemptScoreData) => void;
}

function formatDate(dateVal?: string | Date | null, fallback = "Just now"): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fallback;
  }
}

export function CalculateScoreDialog({
  attemptId,
  assessmentTitle,
  candidateName,
  open,
  onOpenChange,
  onSuccess,
}: CalculateScoreDialogProps) {
  const queryClient = useQueryClient();

  // Mutation for POST /assessment/attempts/:attemptId/calculate-score
  const calculateMutation = useCalculateAttemptScore();

  // Attempt details query to show current status before calculating
  const { data: attemptRes, isLoading: isAttemptLoading } = useGetAttemptDetails(
    attemptId || "",
  );

  const attemptData = attemptRes?.data;
  const attempt = attemptData?.attempt;
  const assessment = attempt?.assessment || attemptData?.assessment;
  const candidate = attempt?.candidate;

  // Stored calculation result from mutation
  const [calcResult, setCalcResult] = useState<ICalculateAttemptScoreData | null>(
    null,
  );
  const [resultDialogOpen, setResultDialogOpen] = useState<boolean>(false);

  // Handle calculation action
  const handleCalculateScore = () => {
    if (!attemptId) return;

    calculateMutation.mutate(attemptId, {
      onSuccess: (res) => {
        const data = res.data;
        setCalcResult(data);

        // Invalidate relevant queries per senior architecture guidelines
        queryClient.invalidateQueries({
          queryKey: ["attempt-details", attemptId],
        });
        queryClient.invalidateQueries({
          queryKey: ["assessment-attempt-result", attemptId],
        });
        queryClient.invalidateQueries({
          queryKey: ["candidate-my-attempts"],
        });
        queryClient.invalidateQueries({
          queryKey: ["assessment-attempts"],
        });
        queryClient.invalidateQueries({
          queryKey: ["detailed-assessment-report", attemptId],
        });
        queryClient.invalidateQueries({
          queryKey: ["score-calculation-attempt", attemptId],
        });
        queryClient.invalidateQueries({
          queryKey: ["score-calculation-submission"],
        });

        toast.add({
          title: "Attempt Score Calculated",
          description: `Total marks: ${data.obtainedMarks}/${data.totalMarks} (${data.percentage}% • ${data.resultStatus})`,
          type: "success",
        });

        if (onSuccess) {
          onSuccess(data);
        }
      },
      onError: (err: unknown) => {
        const apiErr = err as {
          data?: { message?: string };
          message?: string;
        };
        const message =
          apiErr?.data?.message ||
          apiErr?.message ||
          "Failed to calculate attempt score. Please check attempt permissions.";

        toast.add({
          title: "Calculation Failed",
          description: message,
          type: "error",
        });
      },
    });
  };

  const isPending = calculateMutation.isPending;
  const breakdownList: IAttemptScoreBreakdownItem[] = calcResult?.breakdown || [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[96vw] max-w-[96vw] h-[92vh] max-h-[94vh] flex flex-col p-0 gap-0 overflow-hidden border-border/80 bg-background/98 shadow-2xl backdrop-blur-xl">
          {/* ── Dialog Header ── */}
          <DialogHeader className="p-5 border-b border-border/60 bg-muted/20 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Calculator className="size-4" />
                  </div>
                  <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <span>Calculate Attempt Score</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      Score Engine
                    </span>
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-foreground">
                    {assessmentTitle || assessment?.title || "Assessment Attempt"}
                  </span>
                  <span>•</span>
                  <span>
                    Candidate:{" "}
                    <strong className="text-foreground">
                      {candidateName || candidate?.name || candidate?.email || "Candidate"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Attempt ID:{" "}
                    <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                      {attemptId?.slice(0, 12)}...
                    </code>
                  </span>
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground font-semibold uppercase">
                  Status: {calcResult?.attemptStatus || attempt?.status || "IN_PROGRESS"}
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* ── Content Body ── */}
          <div className="flex-1 overflow-y-auto max-h-[60vh] p-5 [scrollbar-width:thin] space-y-5">
            {/* Info / Audit banner */}
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Sparkles className="size-4 text-indigo-500 shrink-0" />
                <span>Automated Scoring & Telemetry Pipeline</span>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-6 text-[11px]">
                Triggering score calculation aggregates MCQ auto-evaluations, code testcase execution marks, and written essay evaluations. It determines pass/fail thresholds, transitions attempt state to EVALUATED once complete, and atomically syncs official Result records.
              </p>
            </div>

            {/* If Calculation Result Available */}
            {calcResult ? (
              <div className="space-y-4">
                {/* ── Key Metrics Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Obtained Marks
                    </span>
                    <p className="text-xl font-extrabold text-foreground">
                      {calcResult.obtainedMarks}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        / {calcResult.totalMarks}
                      </span>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Percentage
                    </span>
                    <p className="text-xl font-extrabold text-foreground flex items-center gap-1">
                      <span>{calcResult.percentage}%</span>
                      <Percent className="size-3.5 text-muted-foreground" />
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Result Verdict
                    </span>
                    <p
                      className={`text-sm font-extrabold flex items-center gap-1 pt-1 ${
                        calcResult.isPassed
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {calcResult.isPassed ? (
                        <>
                          <CheckCircle2 className="size-4 shrink-0" />
                          <span>PASSED</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-4 shrink-0" />
                          <span>FAILED</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Evaluation Progress
                    </span>
                    <p className="text-xs font-bold text-foreground pt-1">
                      {calcResult.evaluatedProblems} of {calcResult.totalProblems} Graded
                    </p>
                    {calcResult.pendingProblems > 0 && (
                      <span className="text-[10px] text-amber-500 block">
                        ({calcResult.pendingProblems} pending review)
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Problem-by-Problem Score Breakdown ── */}
                {breakdownList.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ListChecks className="size-3.5 text-primary" />
                      <span>Granular Problem Score Breakdown ({breakdownList.length}):</span>
                    </h4>

                    <div className="rounded-xl border border-border/70 overflow-hidden bg-card/50">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/40 border-b border-border/50 text-[11px] font-semibold text-muted-foreground">
                            <tr>
                              <th className="py-2.5 px-3">#</th>
                              <th className="py-2.5 px-3">Problem Title</th>
                              <th className="py-2.5 px-3">Type</th>
                              <th className="py-2.5 px-3">Difficulty</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3 text-right">Awarded Marks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {breakdownList.map((item, idx) => (
                              <tr
                                key={item.problemId || idx}
                                className="hover:bg-muted/20 transition-colors"
                              >
                                <td className="py-2.5 px-3 font-semibold text-muted-foreground">
                                  #{item.questionOrder || idx + 1}
                                </td>
                                <td className="py-2.5 px-3 font-medium text-foreground max-w-[220px] truncate">
                                  {item.title}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                                    {item.type}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                                  {item.difficulty}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                      item.submissionStatus === "EVALUATED" ||
                                      item.submissionStatus === "PASSED"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : item.submissionStatus === "NOT_SUBMITTED"
                                          ? "bg-muted text-muted-foreground"
                                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    }`}
                                  >
                                    {item.submissionStatus}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold text-foreground">
                                  <span
                                    className={
                                      item.obtainedMarks > 0
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    {item.obtainedMarks}
                                  </span>{" "}
                                  <span className="text-[10px] font-normal text-muted-foreground">
                                    / {item.maxMarks}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Pre-calculation view */
              <div className="py-8 text-center space-y-3 border border-dashed border-border/70 rounded-xl bg-muted/10 p-6">
                <div className="mx-auto size-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                  <Calculator className="size-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">
                    Ready to Calculate Attempt Score
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Click the button below to execute score calculation across all submissions. The engine will evaluate answers, aggregate marks, determine final percentage, and update result status.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleCalculateScore}
                  disabled={isPending}
                  className="mt-2 text-xs font-semibold px-5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                      Computing Telemetry...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 size-3.5" />
                      Calculate Attempt Score
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* ── Dialog Footer ── */}
          <DialogFooter className="p-3.5 px-5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="text-xs text-muted-foreground">
              {calcResult?.calculatedAt ? (
                <span>
                  Last Computed: {formatDate(calcResult.calculatedAt)}
                </span>
              ) : (
                <span>Awaiting score execution</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 text-xs px-3 cursor-pointer"
              >
                Close
              </Button>

              {calcResult && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCalculateScore}
                    disabled={isPending}
                    className="h-8 text-xs px-3 gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw
                      className={`size-3 ${isPending ? "animate-spin text-primary" : ""}`}
                    />
                    <span>Recalculate</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setResultDialogOpen(true)}
                    className="h-8 text-xs font-semibold px-3 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-sm"
                  >
                    <Trophy className="size-3" />
                    <span>View Official Result</span>
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Official Result Sub-Dialog ── */}
      <AttemptResultDialog
        attemptId={attemptId}
        open={resultDialogOpen}
        onOpenChange={setResultDialogOpen}
      />
    </>
  );
}

export default CalculateScoreDialog;
