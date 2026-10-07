"use client";

import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  FileCheck2,
  FileText,
  HelpCircle,
  Lock,
  RefreshCw,
  Sparkles,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSubmissionScore } from "@/hook/score-calculation.hook";
import type {
  ICodingScoreBreakdown,
  IMCQScoreBreakdown,
  IWrittenScoreBreakdown,
} from "@/types/score-calculation.type";

interface SubmissionScoreBreakdownCardProps {
  submissionId: string;
  defaultExpanded?: boolean;
}

export function SubmissionScoreBreakdownCard({
  submissionId,
  defaultExpanded = false,
}: SubmissionScoreBreakdownCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetSubmissionScore(submissionId);

  const scoreResult = data?.data;
  const details = scoreResult?.details;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {error instanceof Error
              ? error.message
              : "Failed to load score calculation breakdown."}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="h-7 text-xs border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefetching ? "animate-spin" : ""}`} />
          Retry
        </Button>
      </div>
    );
  }

  if (!scoreResult) {
    return null;
  }

  const isCorrect = scoreResult.isCorrect;
  const isCoding = scoreResult.problemType === "CODING";
  const isMCQ = scoreResult.problemType === "MCQ";
  const isWritten = scoreResult.problemType === "WRITTEN";

  const codingDetails = isCoding ? (details as ICodingScoreBreakdown | undefined) : undefined;
  const mcqDetails = isMCQ ? (details as IMCQScoreBreakdown | undefined) : undefined;
  const writtenDetails = isWritten ? (details as IWrittenScoreBreakdown | undefined) : undefined;

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs transition-all hover:border-border">
      {/* Header Summary Row */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-muted/20 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Score Engine Breakdown
              </span>
              <span className="rounded-md border border-border bg-background px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground uppercase">
                {scoreResult.problemType}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {scoreResult.problemTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Marks badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isCorrect
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : scoreResult.obtainedMarks > 0
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : scoreResult.obtainedMarks > 0 ? (
              <Award className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {scoreResult.obtainedMarks} / {scoreResult.totalMarks} Marks ({scoreResult.percentage}%)
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Granular Telemetry */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-border/50 text-xs">
          {/* Coding Diagnostics */}
          {codingDetails && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Total test cases */}
                <div className="rounded-xl border border-border/60 bg-muted/10 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    All Tests
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {codingDetails.passedTests} / {codingDetails.totalTestCases}
                  </span>
                </div>

                {/* Public tests */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">
                    Public Tests
                  </span>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {codingDetails.publicTestsPassed} / {codingDetails.totalPublicTests}
                  </span>
                </div>

                {/* Hidden tests */}
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    Hidden Tests
                  </span>
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    {codingDetails.hiddenTestsPassed} / {codingDetails.totalHiddenTests}
                  </span>
                </div>

                {/* Runtime & Memory */}
                <div className="rounded-xl border border-border/60 bg-muted/10 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Performance
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-foreground font-medium">
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {codingDetails.executionTimeMs}ms
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Cpu className="h-3 w-3 text-muted-foreground" />
                      {codingDetails.memoryUsedMb}MB
                    </span>
                  </div>
                </div>
              </div>

              {codingDetails.feedback && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                    Execution Feedback
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {codingDetails.feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MCQ Diagnostics */}
          {mcqDetails && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-border/60 bg-muted/10 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Candidate Choice
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {mcqDetails.selectedOptionText || "No option selected"}
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">
                    Correct Answer
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {mcqDetails.correctOptionText || "N/A"}
                  </span>
                </div>
              </div>

              {mcqDetails.explanation && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <HelpCircle className="h-3 w-3 text-primary" />
                    Rationale & Explanation
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {mcqDetails.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Written Diagnostics */}
          {writtenDetails && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-border/60 bg-muted/10 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Word Count
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {writtenDetails.wordCount}{" "}
                    {writtenDetails.wordLimit ? `/ ${writtenDetails.wordLimit} max` : "words"}
                  </span>
                  {writtenDetails.isWordLimitExceeded && (
                    <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">
                      Limit Exceeded
                    </span>
                  )}
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/10 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Evaluation Status
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {writtenDetails.evaluationStatus}
                  </span>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/10 p-2.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Evaluator
                  </span>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <UserCheck className="h-3 w-3 text-primary" />
                    {writtenDetails.evaluatorName || "Automated Rubric"}
                  </span>
                </div>
              </div>

              {writtenDetails.feedback && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3 text-primary" />
                    Examiner Feedback
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {writtenDetails.feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Refetch Trigger */}
          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3 w-3 mr-1.5 ${isRefetching ? "animate-spin" : ""}`} />
              Refresh Calculation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
