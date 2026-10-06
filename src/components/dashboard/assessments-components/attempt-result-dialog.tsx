"use client";

import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  FileCheck2,
  FileText,
  HelpCircle,
  Hourglass,
  RefreshCw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAttemptResults } from "@/hook/assessment.hook";
import type { IAttemptResultProblemBreakdown } from "@/types/assessment.type";

interface AttemptResultDialogProps {
  attemptId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCandidateView?: boolean;
}

function formatDate(dateStr?: string | null, fallback = "N/A"): string {
  if (!dateStr) return fallback;
  try {
    return new Date(dateStr).toLocaleString("en-US", {
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

function getInitials(name?: string | null, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return "CN";
}

export function AttemptResultDialog({
  attemptId,
  open,
  onOpenChange,
  isCandidateView = false,
}: AttemptResultDialogProps) {
  const [problemFilter, setProblemFilter] = useState<
    "ALL" | "MCQ" | "CODING" | "WRITTEN"
  >("ALL");

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetAttemptResults(attemptId || "", open);

  const resultData = data?.data;
  const isPublished = Boolean(resultData?.isPublished);
  const candidate = resultData?.candidate;
  const assessment = resultData?.assessment;
  const attempt = resultData?.attempt;
  const result = resultData?.result;
  const problemBreakdown: IAttemptResultProblemBreakdown[] = useMemo(() => {
    return resultData?.problemBreakdown || [];
  }, [resultData]);

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    if (problemFilter === "ALL") return problemBreakdown;
    return problemBreakdown.filter(
      (p) => String(p.type).toUpperCase() === problemFilter,
    );
  }, [problemBreakdown, problemFilter]);

  // Status calculation
  const resultStatus = (
    result?.status ||
    attempt?.status ||
    "PENDING"
  ).toUpperCase();
  const isPassed = resultStatus === "PASSED";
  const isFailed = resultStatus === "FAILED";
  const percentage = result?.percentage ?? 0;
  const obtainedMarks = result?.obtainedMarks ?? 0;
  const totalMarks = result?.totalMarks ?? assessment?.totalMarks ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 border-b border-border/60 bg-background/90 px-6 py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  <Trophy className="h-3 w-3" />
                  Official Assessment Result
                </span>
                {isPublished ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    <Hourglass className="h-3 w-3" />
                    Pending Evaluator Release
                  </span>
                )}
              </div>
              <DialogTitle className="mt-1.5 text-lg font-bold tracking-tight text-foreground sm:text-xl">
                {assessment?.title ||
                  attempt?.assessmentTitle ||
                  "Assessment Result"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {assessment?.company?.name
                  ? `Organized by ${assessment.company.name}`
                  : "Performance Benchmark & Evaluation Summary"}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="h-8 text-xs"
              >
                <RefreshCw
                  className={`mr-1.5 h-3.5 w-3.5 ${
                    isRefetching ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-3" />
              <h3 className="text-sm font-semibold text-destructive">
                Failed to load assessment result
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred while fetching the results."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-4 text-xs"
              >
                Try Again
              </Button>
            </div>
          ) : isCandidateView && !isPublished ? (
            /* Candidate Unpublished Result View */
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/60 p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-sm mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Assessment Submitted Successfully!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                {resultData?.message ||
                  "Your submission has been captured. Results and detailed question breakdowns will be available once officially published by the evaluation team."}
              </p>

              <div className="mx-auto mt-6 max-w-sm rounded-xl border border-border/80 bg-muted/40 p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Attempt ID:</span>
                  <span className="font-mono font-medium text-foreground">
                    {attempt?.id ? `${attempt.id.slice(0, 10)}...` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Submitted At:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(attempt?.submittedAt)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">
                    Submission Status:
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Recorded
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="bg-primary text-primary-foreground text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            /* Published Result or Staff / Admin View */
            <div className="space-y-6">
              {/* Candidate Metadata (for Admin / Staff) */}
              {candidate && (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/80">
                      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                        {getInitials(candidate.name, candidate.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {candidate.name || "Candidate"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {candidate.email}
                      </p>
                    </div>
                  </div>

                  {attempt?.attemptNumber != null && (
                    <div className="text-right">
                      <span className="text-[11px] text-muted-foreground block">
                        Attempt No.
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        #{attempt.attemptNumber}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Hero KPI Card */}
              <div
                className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all ${
                  isPassed
                    ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-background"
                    : isFailed
                      ? "border-destructive/30 bg-gradient-to-br from-destructive/10 via-background to-background"
                      : "border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isPassed
                            ? "bg-emerald-500 text-white"
                            : isFailed
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : isFailed ? (
                          <XCircle className="h-3 w-3" />
                        ) : (
                          <Hourglass className="h-3 w-3" />
                        )}
                        {resultStatus}
                      </span>
                      {result?.rank != null && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Trophy className="h-3 w-3" />
                          Rank #{result.rank}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">
                      {obtainedMarks}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        / {totalMarks} Marks
                      </span>
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Passing Threshold:{" "}
                      <span className="font-semibold text-foreground">
                        {assessment?.passingScore ??
                          result?.passingScore ??
                          "50%"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl border border-border/80 bg-background/80 px-5 py-3 text-center shadow-xs">
                      <span className="text-[11px] font-medium text-muted-foreground block">
                        Percentage
                      </span>
                      <span
                        className={`text-2xl font-black ${
                          isPassed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isFailed
                              ? "text-destructive"
                              : "text-foreground"
                        }`}
                      >
                        {percentage}%
                      </span>
                    </div>

                    {attempt?.durationMinutes != null && (
                      <div className="rounded-2xl border border-border/80 bg-background/80 px-5 py-3 text-center shadow-xs">
                        <span className="text-[11px] font-medium text-muted-foreground block">
                          Duration
                        </span>
                        <span className="text-lg font-bold text-foreground">
                          {attempt.durationMinutes}m
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="mt-5 space-y-1">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPassed
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : isFailed
                            ? "bg-gradient-to-r from-red-500 to-rose-600"
                            : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, percentage))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Timing Metadata Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Started At
                    </span>
                    <span className="text-xs font-medium text-foreground truncate block">
                      {formatDate(attempt?.startedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Submitted At
                    </span>
                    <span className="text-xs font-medium text-foreground truncate block">
                      {formatDate(attempt?.submittedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
                  <Award className="h-4 w-4 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Published At
                    </span>
                    <span className="text-xs font-medium text-foreground truncate block">
                      {formatDate(result?.publishedAt, "Unpublished")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Problem Breakdown Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-primary" />
                      Detailed Problem Breakdown
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Review question-level submissions, answer verification,
                      and evaluations.
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-muted/40 p-1">
                    {(["ALL", "MCQ", "CODING", "WRITTEN"] as const).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setProblemFilter(type)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                            problemFilter === type
                              ? "bg-background text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {type}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {filteredProblems.length === 0 ? (
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-8 text-center text-xs text-muted-foreground">
                    No problems found for the selected filter.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProblems.map((prob) => {
                      const submission = prob.candidateSubmission;
                      const hasSubmission = Boolean(submission);
                      const isCorrect = submission?.isCorrect === true;
                      const isIncorrect = submission?.isCorrect === false;
                      const awardedMarks = submission?.marksObtained ?? 0;

                      return (
                        <div
                          key={prob.problemId}
                          className="rounded-2xl border border-border/70 bg-card p-5 space-y-4 transition-all hover:border-border"
                        >
                          {/* Question Card Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                #{prob.questionOrder}
                              </span>
                              <h5 className="text-sm font-semibold text-foreground">
                                {prob.title}
                              </h5>
                              <span className="rounded-md border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                {prob.type}
                              </span>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                                  prob.difficulty === "EASY"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : prob.difficulty === "MEDIUM"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {prob.difficulty}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  isCorrect
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : isIncorrect
                                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {isCorrect ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : isIncorrect ? (
                                  <XCircle className="h-3.5 w-3.5" />
                                ) : (
                                  <HelpCircle className="h-3.5 w-3.5" />
                                )}
                                {awardedMarks} / {prob.marksAllocated} Marks
                              </span>
                            </div>
                          </div>

                          {/* MCQ Specifics */}
                          {prob.mcqDetails && (
                            <div className="space-y-2.5">
                              <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                                Options & Choice:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {prob.mcqDetails.options.map((opt) => {
                                  const isSelected =
                                    submission?.selectedOptionId === opt.id;
                                  const isOptionCorrect =
                                    opt.isCorrect === true;

                                  return (
                                    <div
                                      key={opt.id}
                                      className={`rounded-xl border p-3 text-xs flex items-start justify-between gap-2 transition-all ${
                                        isOptionCorrect
                                          ? "border-emerald-500/50 bg-emerald-500/10 text-foreground"
                                          : isSelected
                                            ? "border-rose-500/50 bg-rose-500/10 text-foreground"
                                            : "border-border/60 bg-muted/20 text-muted-foreground"
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <span className="font-mono font-bold">
                                          {String.fromCharCode(
                                            64 + opt.optionOrder,
                                          )}
                                          .
                                        </span>
                                        <span>{opt.optionText}</span>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        {isSelected && (
                                          <span className="rounded-md bg-foreground/10 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                                            Your Pick
                                          </span>
                                        )}
                                        {isOptionCorrect && (
                                          <span className="rounded-md bg-emerald-500 text-white px-1.5 py-0.5 text-[10px] font-bold">
                                            Correct
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {prob.mcqDetails.explanation && (
                                <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs space-y-1">
                                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                                    <HelpCircle className="h-3.5 w-3.5 text-primary" />
                                    Explanation:
                                  </span>
                                  <p className="text-muted-foreground leading-relaxed">
                                    {prob.mcqDetails.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Coding Specifics */}
                          {prob.codingDetails && (
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                  <Code2 className="h-3.5 w-3.5 text-primary" />
                                  Submitted Code (
                                  {submission?.language || "plain text"}):
                                </span>
                              </div>

                              {submission?.sourceCode ? (
                                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto max-h-60">
                                  <pre>
                                    <code>{submission.sourceCode}</code>
                                  </pre>
                                </div>
                              ) : (
                                <p className="text-xs italic text-muted-foreground">
                                  No code solution submitted for this problem.
                                </p>
                              )}

                              {prob.codingDetails.publicTestCases &&
                                prob.codingDetails.publicTestCases.length >
                                  0 && (
                                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2 text-xs">
                                    <span className="font-semibold text-foreground block">
                                      Public Test Cases:
                                    </span>
                                    <div className="space-y-1.5 font-mono text-[11px]">
                                      {prob.codingDetails.publicTestCases.map(
                                        (tc, idx) => (
                                          <div
                                            key={`tc-${idx}-${tc.input.slice(0, 5)}`}
                                            className="flex flex-wrap items-center gap-2 text-muted-foreground"
                                          >
                                            <span className="rounded bg-muted px-1 py-0.5">
                                              Input: {tc.input}
                                            </span>
                                            <span>→</span>
                                            <span className="rounded bg-muted px-1 py-0.5 text-foreground">
                                              Expected: {tc.expectedOutput}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}

                          {/* Written Specifics */}
                          {prob.writtenDetails && (
                            <div className="space-y-2.5">
                              <span className="text-[11px] font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-primary" />
                                Submitted Answer:
                              </span>

                              {submission?.answerText ? (
                                <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                                  {submission.answerText}
                                </div>
                              ) : (
                                <p className="text-xs italic text-muted-foreground">
                                  No response provided.
                                </p>
                              )}

                              {prob.writtenDetails.expectedAnswer && (
                                <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs space-y-1">
                                  <span className="font-semibold text-foreground">
                                    Expected Key Points:
                                  </span>
                                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {prob.writtenDetails.expectedAnswer}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {!hasSubmission && (
                            <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-3 text-center text-xs text-muted-foreground">
                              Not attempted by candidate
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 flex justify-end border-t border-border/60 bg-background/95 px-6 py-4 backdrop-blur-md">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
