"use client";

import {
  AlertCircle,
  Award,
  Calculator,
  CheckCircle2,
  Clock,
  Code2,
  FileCheck2,
  Lock,
  Play,
  RefreshCw,
  Shield,
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
import { useGetAttemptDetails, useStartAttempt } from "@/hook/assessment.hook";
import type {
  IAttemptSubmissionItem,
  ISanitizedAssessmentProblem,
} from "@/types/assessment.type";
import { AttemptResultDialog } from "./attempt-result-dialog";
import { CalculateScoreDialog } from "./calculate-score-dialog";
import { CreateSubmissionDialog } from "./create-submission-dialog";
import { DetailedAssessmentReportDialog } from "./detailed-assessment-report-dialog";
import { FinalizeSubmitAttemptDialog } from "./finalize-submit-attempt-dialog";

interface AttemptDetailsDialogProps {
  attemptId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional flag if viewer is candidate or staff
  isCandidateView?: boolean;
}

function formatDate(dateStr?: string | null, fallback = "N/A"): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
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

function formatDuration(seconds?: number | null): string {
  if (seconds == null || seconds <= 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
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

export function AttemptDetailsDialog({
  attemptId,
  open,
  onOpenChange,
  isCandidateView = false,
}: AttemptDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "overview">(
    "questions",
  );
  const [resultOpen, setResultOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [detailedReportOpen, setDetailedReportOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [selectedProblemIdForSubmission, setSelectedProblemIdForSubmission] =
    useState<string | null>(null);
  const [calculateScoreOpen, setCalculateScoreOpen] = useState(false);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetAttemptDetails(attemptId || "");

  const startAttemptMutation = useStartAttempt();

  const attemptData = data?.data;
  const attempt = attemptData?.attempt;
  // Normalize assessment whether nested in attempt or at top-level
  const assessment = attempt?.assessment || attemptData?.assessment;
  const candidate = attempt?.candidate;
  const submissions: IAttemptSubmissionItem[] = useMemo(() => {
    return attempt?.submissions || [];
  }, [attempt]);

  // Map problemId -> submission for quick lookup
  const submissionMap = useMemo(() => {
    const map = new Map<string, IAttemptSubmissionItem>();
    for (const sub of submissions) {
      map.set(sub.problemId, sub);
    }
    return map;
  }, [submissions]);

  const problems: ISanitizedAssessmentProblem[] = useMemo(() => {
    return assessment?.problems || [];
  }, [assessment]);

  const status = (attempt?.status || "NOT_STARTED").toUpperCase();
  const percentage = attempt?.result?.percentage ?? attempt?.percentage;
  const obtainedMarks =
    attempt?.result?.obtainedMarks ?? attempt?.obtainedMarks;
  const totalMarks = assessment?.totalMarks ?? attempt?.totalMarks ?? 0;
  const passingScore =
    assessment?.passingScore ?? attempt?.result?.passingScore;
  const rank = attempt?.result?.rank;

  const isPassed =
    percentage != null && passingScore != null
      ? percentage >=
        (passingScore <= 100 && totalMarks > 100
          ? (passingScore / totalMarks) * 100
          : passingScore)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="5xl"
        className="max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="p-5 border-b border-border/60 bg-muted/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <FileCheck2 className="size-4" />
                </div>
                <DialogTitle className="text-base font-bold tracking-tight text-foreground">
                  Assessment Attempt Details
                </DialogTitle>
                {attempt && (
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-secondary text-secondary-foreground border border-border/60">
                    Attempt #{attempt.attemptNumber}
                  </span>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground line-clamp-1">
                {assessment?.title || "Technical Assessment Examination"}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              {!isCandidateView && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setDetailedReportOpen(true)}
                  className="h-8 text-xs gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  title="Open Detailed Assessment & Proctoring Report"
                >
                  <Award className="size-3.5" />
                  <span>Detailed Report</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                className="h-8 text-xs gap-1.5 font-medium cursor-pointer"
              >
                <RefreshCw
                  className={`size-3.5 ${
                    isRefetching
                      ? "animate-spin text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* ── Candidate & Assessment Metadata Strip ── */}
          {attempt && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
              <div className="flex items-center gap-2">
                {candidate ? (
                  <div className="flex items-center gap-2 bg-background/80 px-2.5 py-1 rounded-lg border border-border/50">
                    <Avatar className="size-5 rounded-full">
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {getInitials(candidate.name, candidate.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">
                      {candidate.name || candidate.email}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      ({candidate.email})
                    </span>
                  </div>
                ) : null}

                {assessment?.company?.name && (
                  <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-lg border border-border/50 text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {assessment.company.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div>
                {status === "IN_PROGRESS" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                    </span>
                    In Progress
                  </span>
                ) : status === "EVALUATED" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="size-3.5" />
                    Evaluated
                  </span>
                ) : status === "SUBMITTED" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Clock className="size-3.5" />
                    Submitted (Pending Evaluation)
                  </span>
                ) : status === "EXPIRED" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/80">
                    <XCircle className="size-3.5" />
                    Expired
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border/60">
                    {status}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Key Score & Metric Cards ── */}
          {attempt && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* Score / Marks Card */}
              <div className="p-2.5 rounded-lg bg-background border border-border/60">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Score & Marks
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-bold text-foreground">
                    {obtainedMarks != null ? obtainedMarks : "—"} / {totalMarks}
                  </span>
                  {percentage != null && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ({percentage}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Rank / Performance */}
              <div className="p-2.5 rounded-lg bg-background border border-border/60">
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                  Rank / Benchmark
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  {rank != null ? (
                    <div className="flex items-center gap-1 text-base font-bold text-indigo-600 dark:text-indigo-400">
                      <Trophy className="size-3.5" />
                      <span>Rank #{rank}</span>
                    </div>
                  ) : isPassed != null ? (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isPassed
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isPassed ? "PASSED" : "FAILED"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {status === "EVALUATED" ? "Evaluated" : "In Progress"}
                    </span>
                  )}
                </div>
              </div>

              {/* Time Remaining / Duration */}
              <div className="p-2.5 rounded-lg bg-background border border-border/60">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {status === "IN_PROGRESS" ? "Time Remaining" : "Time Window"}
                </span>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {status === "IN_PROGRESS" &&
                  attemptData?.remainingSeconds != null
                    ? formatDuration(attemptData.remainingSeconds)
                    : `${assessment?.durationMinutes || 0} mins max`}
                </p>
              </div>

              {/* Questions Answered */}
              <div className="p-2.5 rounded-lg bg-background border border-border/60">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Submissions
                </span>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {submissions.length} / {problems.length || "—"} Answered
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Tab Switcher ── */}
        <div className="px-5 border-b border-border/40 bg-background flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "questions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Questions & Submissions ({problems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Attempt Overview & Audit Info
          </button>
        </div>

        {/* ── Content Body ── */}
        <div className="flex-1 overflow-y-auto min-h-[320px] max-h-[52vh] p-5 [scrollbar-width:thin] space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border/50 animate-pulse space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Failed to retrieve attempt details
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {(error as Error)?.message ||
                  "An error occurred while fetching attempt records."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs mt-2"
              >
                Retry
              </Button>
            </div>
          ) : !attempt ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No attempt record available.
            </div>
          ) : activeTab === "questions" ? (
            /* ── Questions List with Candidate Submissions ── */
            <div className="space-y-3.5">
              {problems.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  No questions found for this assessment.
                </div>
              ) : (
                problems.map((probWrap, idx) => {
                  const problem = probWrap.problem;
                  const submission = submissionMap.get(problem.id);
                  const isAnswered = Boolean(submission);

                  return (
                    <div
                      key={probWrap.id || problem.id}
                      className="p-4 rounded-xl border border-border/70 bg-card/60 hover:border-primary/40 transition-all space-y-3"
                    >
                      {/* Problem Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            #{probWrap.questionOrder || idx + 1}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {problem.title}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {problem.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">
                            Max: {problem.marks} pts
                          </span>
                          {submission?.obtainedMarks != null && (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Awarded: {submission.obtainedMarks} pts
                            </span>
                          )}
                          {isAnswered ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              <CheckCircle2 className="size-3" /> Answered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              <Clock className="size-3" /> Unanswered
                            </span>
                          )}

                          {isCandidateView && status === "IN_PROGRESS" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProblemIdForSubmission(problem.id);
                                setSubmissionDialogOpen(true);
                              }}
                              className="h-6 text-[11px] px-2 font-medium border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                            >
                              <Code2 className="size-2.5 mr-1" />
                              <span>
                                {isAnswered ? "Edit Answer" : "Answer"}
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Problem Description */}
                      {problem.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {problem.description}
                        </p>
                      )}

                      {/* ── MCQ Options View ── */}
                      {problem.type === "MCQ" &&
                        problem.mcqQuestion?.options && (
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                              Options:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {problem.mcqQuestion.options.map((opt) => {
                                const isSelected =
                                  submission?.selectedOptionId === opt.id;
                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${
                                      isSelected
                                        ? "bg-primary/10 border-primary text-foreground font-semibold shadow-xs"
                                        : "bg-background/50 border-border/60 text-muted-foreground"
                                    }`}
                                  >
                                    <span
                                      className={`size-4 rounded-full flex items-center justify-center text-[10px] border ${
                                        isSelected
                                          ? "bg-primary text-primary-foreground border-primary"
                                          : "border-border text-muted-foreground"
                                      }`}
                                    >
                                      {String.fromCharCode(
                                        65 + (opt.optionOrder ?? 0),
                                      )}
                                    </span>
                                    <span className="flex-1 truncate">
                                      {opt.optionText}
                                    </span>
                                    {isSelected && (
                                      <span className="text-[10px] font-semibold text-primary">
                                        (Selected)
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      {/* ── Coding Submission View ── */}
                      {problem.type === "CODING" && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Code2 className="size-3.5" />
                              Candidate Code Solution
                              {submission?.language &&
                                ` (${submission.language})`}
                            </span>
                            {submission?.status && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary">
                                {submission.status}
                              </span>
                            )}
                          </div>
                          {submission?.sourceCode ? (
                            <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-100 text-xs font-mono overflow-x-auto max-h-40 [scrollbar-width:thin] border border-border/40">
                              <code>{submission.sourceCode}</code>
                            </pre>
                          ) : (
                            <div className="p-2.5 rounded-lg border border-dashed text-xs text-muted-foreground text-center">
                              No code submission recorded for this problem.
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Written Answer View ── */}
                      {problem.type === "WRITTEN" && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[11px] font-semibold text-muted-foreground">
                            Candidate Response:
                          </p>
                          {submission?.answerText ? (
                            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-foreground whitespace-pre-wrap">
                              {submission.answerText}
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-lg border border-dashed text-xs text-muted-foreground text-center">
                              No written response submitted.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* ── Overview & Audit Info Tab ── */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
                <h3 className="font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" />
                  <span>Timeline & Session Audit</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">
                      Attempt Started:
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {formatDate(attempt.startedAt || attempt.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted At:</span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {formatDate(attempt.submittedAt, "Not yet submitted")}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Session Expiration:
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {formatDate(attempt.expiresAt, "No auto-expiration")}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Total Questions:
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {problems.length} problems attached
                    </p>
                  </div>
                </div>
              </div>

              {/* Security & Proctoring Settings */}
              {assessment?.settings && (
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
                  <h3 className="font-bold text-foreground flex items-center gap-1.5">
                    <Shield className="size-4 text-indigo-500" />
                    <span>Applied Proctoring Safeguards</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Lock className="size-3.5" />
                      <span>
                        Max Allowed Attempts:{" "}
                        <strong className="text-foreground">
                          {assessment.settings.maxAttempts || 1}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5" />
                      <span>
                        Auto Submit on Expiry:{" "}
                        <strong className="text-foreground">
                          {assessment.settings.autoSubmitOnExpiry !== false
                            ? "Enabled"
                            : "Disabled"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-3.5 px-5 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">
            Attempt ID: <code className="font-mono">{attempt?.id}</code>
          </span>
          <div className="flex items-center gap-2">
            {status !== "IN_PROGRESS" &&
              (status === "SUBMITTED" ||
                status === "EVALUATED" ||
                Boolean(attempt?.result)) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResultOpen(true)}
                  className="text-xs h-8 gap-1.5 font-medium border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                >
                  <Trophy className="size-3" />
                  <span>View Official Result</span>
                </Button>
              )}

            {isCandidateView && status === "IN_PROGRESS" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitOpen(true)}
                  className="text-xs h-8 gap-1 font-medium border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 cursor-pointer"
                >
                  <span>Submit Attempt</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setSelectedProblemIdForSubmission(null);
                    setSubmissionDialogOpen(true);
                  }}
                  className="text-xs h-8 gap-1.5 font-medium bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-sm"
                >
                  <Code2 className="size-3" />
                  <span>Solve Questions</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    if (attempt) {
                      startAttemptMutation.mutate({
                        assessmentId: attempt.assessmentId,
                      });
                    }
                  }}
                  className="text-xs h-8 gap-1.5 font-medium bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                >
                  <Play className="size-3 fill-white" />
                  <span>Resume Test</span>
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCalculateScoreOpen(true)}
              className="text-xs h-8 gap-1.5 font-medium border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400 cursor-pointer"
            >
              <Calculator className="size-3" />
              <span>Calculate Score</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 px-3 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* ── Sub Dialogs ── */}
      {calculateScoreOpen && attemptId && (
        <CalculateScoreDialog
          attemptId={attemptId}
          assessmentTitle={assessment?.title}
          candidateName={candidate?.name}
          open={calculateScoreOpen}
          onOpenChange={setCalculateScoreOpen}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
      {submissionDialogOpen && attemptId && (
        <CreateSubmissionDialog
          attemptId={attemptId}
          initialProblemId={selectedProblemIdForSubmission}
          open={submissionDialogOpen}
          onOpenChange={setSubmissionDialogOpen}
          onSubmissionSuccess={() => {
            refetch();
          }}
          onAllCompleted={() => {
            refetch();
          }}
        />
      )}
      {resultOpen && attemptId && (
        <AttemptResultDialog
          attemptId={attemptId}
          open={resultOpen}
          onOpenChange={setResultOpen}
          isCandidateView={isCandidateView}
        />
      )}
      {submitOpen && attemptId && (
        <FinalizeSubmitAttemptDialog
          attemptId={attemptId}
          assessmentTitle={assessment?.title}
          open={submitOpen}
          onOpenChange={setSubmitOpen}
          onSuccess={() => {
            setResultOpen(true);
            refetch();
          }}
        />
      )}
      {detailedReportOpen && attemptId && (
        <DetailedAssessmentReportDialog
          attemptId={attemptId}
          open={detailedReportOpen}
          onOpenChange={setDetailedReportOpen}
        />
      )}
    </Dialog>
  );
}

export default AttemptDetailsDialog;
