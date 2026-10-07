"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Globe,
  HelpCircle,
  Laptop,
  Maximize2,
  MinusCircle,
  Printer,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Timer,
  User,
  X,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useGetDetailedAssesssmentReport } from "@/hook/assessment.hook";
import type {
  AntiCheatEventType,
  IAntiCheatEvent,
  IDetailedAssessmentReportData,
  IDetailedReportSubmissionItem,
  ISanitizedAssessmentProblem,
} from "@/types/assessment.type";

interface DetailedAssessmentReportViewProps {
  attemptId?: string | null;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

type QuestionFilterType = "ALL" | "CODING" | "MCQ" | "WRITTEN" | "INCORRECT";

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

function formatRelativeTime(startStr?: string | null, eventStr?: string | null): string {
  if (!startStr || !eventStr) return "";
  try {
    const start = new Date(startStr).getTime();
    const event = new Date(eventStr).getTime();
    const diffSec = Math.max(0, Math.floor((event - start) / 1000));
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `+${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  } catch {
    return "";
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

function getAntiCheatIcon(type: string) {
  switch (type?.toUpperCase()) {
    case "TAB_SWITCH":
    case "MULTIPLE_TAB":
      return <Laptop className="size-3.5 text-amber-500" />;
    case "FULLSCREEN_EXIT":
      return <Maximize2 className="size-3.5 text-rose-500" />;
    case "COPY":
    case "PASTE":
      return <Copy className="size-3.5 text-purple-500" />;
    case "WINDOW_BLUR":
      return <Eye className="size-3.5 text-sky-500" />;
    default:
      return <AlertTriangle className="size-3.5 text-amber-500" />;
  }
}

export function DetailedAssessmentReportView({
  attemptId,
  onClose,
  isStandalonePage = false,
}: DetailedAssessmentReportViewProps) {
  const searchParams = useSearchParams();
  const [customAttemptId, setCustomAttemptId] = useState<string>("");
  const [lookupInput, setLookupInput] = useState<string>("");
  const effectiveAttemptId = attemptId || customAttemptId || searchParams?.get("attemptId") || "";

  const [activeTab, setActiveTab] = useState<"questions" | "proctoring" | "candidate">("questions");
  const [questionFilter, setQuestionFilter] = useState<QuestionFilterType>("ALL");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetDetailedAssesssmentReport(effectiveAttemptId);

  // Normalize API response safely
  const report: IDetailedAssessmentReportData | null = useMemo(() => {
    if (!data) return null;
    const raw = (data as { data?: unknown })?.data ?? data;
    return (raw as IDetailedAssessmentReportData) || null;
  }, [data]);

  const candidate = report?.candidate;
  const assessment = report?.assessment;
  const attempt = report?.attempt;
  const result = report?.result;
  const antiCheat = report?.antiCheat;
  const submissions: IDetailedReportSubmissionItem[] = useMemo(() => {
    return report?.submissions || [];
  }, [report]);

  const problems: ISanitizedAssessmentProblem[] = useMemo(() => {
    return assessment?.problems || [];
  }, [assessment]);

  // Map submissions by problemId for O(1) lookup
  const submissionMap = useMemo(() => {
    const map = new Map<string, IDetailedReportSubmissionItem>();
    for (const sub of submissions) {
      if (sub.problemId) {
        map.set(sub.problemId, sub);
      }
    }
    return map;
  }, [submissions]);

  // Combined Question + Submission list
  const combinedProblems = useMemo(() => {
    // If we have problems in assessment:
    if (problems.length > 0) {
      return problems.map((prob) => {
        const sub = submissionMap.get(prob.problem.id) || null;
        return {
          problemId: prob.problem.id,
          order: prob.questionOrder,
          marksAllocated: prob.problem?.marks ?? 0,
          problem: prob.problem,
          submission: sub,
        };
      });
    }

    // Fallback: If problems was not returned, reconstruct from submissions
    return submissions.map((sub, idx) => ({
      problemId: sub.problemId,
      order: idx + 1,
      marksAllocated: sub.marks ?? 0,
      problem: {
        id: sub.problemId,
        title: `Question #${idx + 1}`,
        description: "",
        type: sub.sourceCode ? "CODING" : sub.selectedOptionId ? "MCQ" : "WRITTEN",
        difficulty: "MEDIUM",
        marks: sub.marks ?? 0,
        mcqQuestion: null,
        codingQuestion: null,
        writtenQuestion: null,
      },
      submission: sub,
    }));
  }, [problems, submissionMap, submissions]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return combinedProblems.filter((item) => {
      const type = (item.problem?.type || "").toUpperCase();
      const isCorrect = item.submission?.isCorrect;

      if (questionFilter === "ALL") return true;
      if (questionFilter === "CODING") return type === "CODING";
      if (questionFilter === "MCQ") return type === "MCQ";
      if (questionFilter === "WRITTEN") return type === "WRITTEN";
      if (questionFilter === "INCORRECT") {
        return isCorrect === false || (item.submission && (item.submission.marks ?? 0) === 0);
      }
      return true;
    });
  }, [combinedProblems, questionFilter]);

  // Result metrics
  const totalMarks = result?.totalMarks ?? assessment?.totalMarks ?? 0;
  const obtainedMarks = result?.obtainedMarks ?? 0;
  const percentage = result?.percentage ?? (totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0);
  const passingScore = result?.passingScore ?? assessment?.passingScore ?? null;
  const isPassed =
    result?.status?.toUpperCase() === "PASSED" ||
    (passingScore !== null && percentage >= passingScore);
  const isEvaluated =
    result?.status?.toUpperCase() === "PASSED" ||
    result?.status?.toUpperCase() === "FAILED" ||
    attempt?.status?.toUpperCase() === "EVALUATED";

  // Anti-cheat risk calculation
  const totalViolations = antiCheat?.totalViolations ?? 0;
  const antiCheatEvents: IAntiCheatEvent[] = useMemo(() => {
    return antiCheat?.events || [];
  }, [antiCheat]);

  const riskAssessment = useMemo(() => {
    if (totalViolations === 0) {
      return {
        level: "CLEAN",
        label: "Verified Clean Integrity",
        colorClass: "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
        badgeText: "High Trust",
        description: "Zero anti-cheat flags recorded. Session was strictly compliant.",
      };
    }
    if (totalViolations <= 3 && !(antiCheat?.summary?.FULLSCREEN_EXIT ?? 0)) {
      return {
        level: "LOW_RISK",
        label: "Low Proctoring Risk",
        colorClass: "text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/10",
        badgeText: "Review Recommended",
        description: "Minor window or tab movements detected during the attempt.",
      };
    }
    return {
      level: "HIGH_RISK",
      label: "Elevated Proctoring Risk",
      colorClass: "text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10",
      badgeText: "Audit Required",
      description: "Multiple violations or fullscreen exits detected. Careful review required.",
    };
  }, [totalViolations, antiCheat]);

  // Copy code helper
  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    toast.add({
      title: "Code Copied",
      description: "Candidate submission code copied to clipboard.",
      type: "success",
    });
    setTimeout(() => {
      setCopiedCodeId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!effectiveAttemptId) {
    return (
      <div className="space-y-6">
        <Card className="border-border/80 shadow-xs bg-card/60 backdrop-blur-sm">
          <CardHeader className="text-center pb-3 pt-6">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-2">
              <FileText className="size-6" />
            </div>
            <CardTitle className="text-xl font-bold">
              Detailed Assessment Report
            </CardTitle>
            <CardDescription className="max-w-md mx-auto text-xs">
              Access comprehensive candidate evaluations, question-level source code, test case telemetry, and anti-cheat proctoring logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-md mx-auto pb-8 space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = lookupInput.trim();
                if (!trimmed) return;
                setCustomAttemptId(trimmed);
                if (typeof window !== "undefined") {
                  const url = new URL(window.location.href);
                  url.searchParams.set("attemptId", trimmed);
                  window.history.pushState({}, "", url.toString());
                }
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Paste Candidate Attempt ID (UUID)..."
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Button type="submit" size="sm" className="h-9 px-4 text-xs font-semibold cursor-pointer">
                View Report
              </Button>
            </form>

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1.5 border border-border/50">
              <p className="font-medium text-foreground text-[11px] uppercase tracking-wider">
                How to open an attempt report:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Go to <strong>Assessments</strong> in your navigation sidebar.</li>
                <li>Open the <strong>Invitations & Candidates</strong> list for any assessment.</li>
                <li>Click the <strong>Report</strong> button next to a candidate who has completed or submitted their test.</li>
                <li>Or paste the candidate attempt UUID in the input field above.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>

        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Failed to load detailed assessment report
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {error instanceof Error ? error.message : "The detailed report could not be retrieved. Ensure you have the required Admin or Company Staff permissions."}
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => refetch()} className="text-xs">
            <RefreshCw className="size-3.5 mr-1.5" />
            Retry
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose} className="text-xs">
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full print:p-0 print:space-y-4">
      {/* ── Top Executive Action Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-primary/10 text-primary border-primary/20">
              <Award className="size-3.5" />
              Official Detailed Assessment Report
            </span>

            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border border-border/60">
              Attempt #{attempt?.attemptNumber ?? 1}
            </span>

            {isEvaluated ? (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isPassed
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                }`}
              >
                {isPassed ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                {isPassed ? "PASSED" : "FAILED"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                <Clock className="size-3" />
                {attempt?.status || "IN_PROGRESS"}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1.5">
            {assessment?.title || "Assessment Report"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Admin & Evaluator Review • Company: {assessment?.company?.name || "Independent"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 print:hidden shrink-0">
          {isStandalonePage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomAttemptId("");
                setLookupInput("");
                if (typeof window !== "undefined") {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("attemptId");
                  window.history.pushState({}, "", url.toString());
                }
              }}
              className="h-8 text-xs gap-1.5 font-medium cursor-pointer"
              title="Lookup another candidate attempt"
            >
              <Search className="size-3.5" />
              <span className="hidden sm:inline">Lookup Another</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs gap-1.5 font-medium cursor-pointer"
            title="Print or export report to PDF"
          >
            <Printer className="size-3.5" />
            <span>Print Report</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 text-xs gap-1.5 font-medium cursor-pointer"
            title="Refresh latest candidate metrics"
          >
            <RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </Button>

          {onClose && !isStandalonePage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs gap-1"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Candidate Executive Header Card ── */}
      <Card className="border-border/70 shadow-xs bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar className="size-14 rounded-xl border border-border/70 shadow-xs">
              <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
                {getInitials(candidate?.name, candidate?.email)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-foreground">
                  {candidate?.name || "Candidate"}
                </h3>
                {candidate?.profile?.title && (
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-secondary text-secondary-foreground">
                    {candidate.profile.title}
                  </span>
                )}
                {candidate?.profile?.yearsOfExperience != null && (
                  <span className="text-xs text-muted-foreground">
                    ({candidate.profile.yearsOfExperience} yrs exp)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <User className="size-3" />
                  {candidate?.email}
                </span>

                {attempt?.startedAt && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    Started: {formatDate(attempt.startedAt)}
                  </span>
                )}

                {attempt?.submittedAt && (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Submitted: {formatDate(attempt.submittedAt)}
                  </span>
                )}
              </div>

              {/* Skills / Links if candidate profile exists */}
              {candidate?.profile && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {candidate.profile.skills && Array.isArray(candidate.profile.skills) && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {candidate.profile.skills.slice(0, 5).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-[10px] px-1.5 py-0.2 rounded-sm bg-muted text-muted-foreground border border-border/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {candidate.profile.githubUrl && (
                    <a
                      href={candidate.profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Globe className="size-3" /> GitHub
                    </a>
                  )}
                  {candidate.profile.linkedinUrl && (
                    <a
                      href={candidate.profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Globe className="size-3" /> LinkedIn
                    </a>
                  )}
                  {candidate.profile.resumeUrl && (
                    <a
                      href={candidate.profile.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs inline-flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      <FileText className="size-3" /> View Resume
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Result Pill */}
          <div className="md:text-right shrink-0 bg-muted/40 p-3 rounded-xl border border-border/60">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Score Outcome
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {obtainedMarks}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                / {totalMarks} pts
              </span>
            </div>
            <p className="text-xs font-semibold text-primary">
              {percentage}% overall
            </p>
          </div>
        </div>
      </Card>

      {/* ── Key Performance Metrics (KPI Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score & Threshold */}
        <Card className="p-4 border-border/70 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Performance Benchmark</span>
            <Award className="size-4 text-primary" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                {percentage}%
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Passing: {passingScore != null ? `${passingScore}%` : "Not set"}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isPassed ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Proctoring Risk & Anti-Cheat */}
        <Card className="p-4 border-border/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Integrity Rating</span>
            {totalViolations === 0 ? (
              <ShieldCheck className="size-4 text-emerald-500" />
            ) : totalViolations <= 3 ? (
              <Shield className="size-4 text-amber-500" />
            ) : (
              <ShieldAlert className="size-4 text-rose-500" />
            )}
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                {totalViolations}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${riskAssessment.colorClass}`}
              >
                {riskAssessment.badgeText}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
              {riskAssessment.label}
            </p>
          </div>
        </Card>

        {/* Time Spent vs Duration */}
        <Card className="p-4 border-border/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Time Utilization</span>
            <Timer className="size-4 text-sky-500" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                {attempt?.durationMinutes != null ? `${attempt.durationMinutes}m` : "N/A"}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Allowed: {assessment?.durationMinutes}m
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {attempt?.durationMinutes && assessment?.durationMinutes
                ? `${Math.round((attempt.durationMinutes / assessment.durationMinutes) * 100)}% of total time used`
                : "Completed within time limit"}
            </p>
          </div>
        </Card>

        {/* Evaluation & Submissions Count */}
        <Card className="p-4 border-border/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Submission Audit</span>
            <FileCheck2 className="size-4 text-indigo-500" />
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                {submissions.length} / {combinedProblems.length}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Questions Answered
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {result?.rank != null ? `Platform Rank #${result.rank}` : "Official Score Calculated"}
            </p>
          </div>
        </Card>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center justify-between border-b border-border/60 pb-1">
        <div className="inline-flex items-center p-1 rounded-xl bg-muted/70 border border-border/60 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "questions"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="size-3.5 text-primary" />
            <span>Problem Submissions & Answers ({combinedProblems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("proctoring")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "proctoring"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="size-3.5 text-primary" />
            <span>Proctoring & Anti-Cheat Audit ({totalViolations})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("candidate")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "candidate"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="size-3.5 text-primary" />
            <span>Candidate & Test Context</span>
          </button>
        </div>
      </div>

      {/* ── Tab Panel 1: Problem Submissions & Detailed Answers ── */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {/* Question Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-2.5 rounded-xl border border-border/60">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
                <Filter className="size-3" /> Filter:
              </span>
              {(
                [
                  { key: "ALL", label: `All (${combinedProblems.length})` },
                  {
                    key: "CODING",
                    label: `Coding (${combinedProblems.filter((p) => p.problem?.type === "CODING").length})`,
                  },
                  {
                    key: "MCQ",
                    label: `MCQ (${combinedProblems.filter((p) => p.problem?.type === "MCQ").length})`,
                  },
                  {
                    key: "WRITTEN",
                    label: `Written (${combinedProblems.filter((p) => p.problem?.type === "WRITTEN").length})`,
                  },
                  {
                    key: "INCORRECT",
                    label: `Needs Review (${
                      combinedProblems.filter(
                        (p) => p.submission && p.submission.isCorrect === false
                      ).length
                    })`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setQuestionFilter(tab.key)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    questionFilter === tab.key
                      ? "bg-background text-foreground font-semibold shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground">
              Showing {filteredProblems.length} of {combinedProblems.length} questions
            </span>
          </div>

          {/* Questions List */}
          {filteredProblems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs border border-dashed rounded-xl">
              No questions found matching the selected filter.
            </div>
          ) : (
            filteredProblems.map((item, index) => {
              const prob = item.problem;
              const sub = item.submission;
              const probType = (prob?.type || "CODING").toUpperCase();
              const difficulty = (prob?.difficulty || "MEDIUM").toUpperCase();
              const isCorrect = sub?.isCorrect;
              const marksAwarded = sub?.marks ?? 0;
              const marksAllocated = item.marksAllocated || prob?.marks || 0;
              const isAttempted = Boolean(sub);

              return (
                <Card
                  key={item.problemId || index}
                  className="border-border/70 shadow-xs overflow-hidden"
                >
                  {/* Problem Card Header */}
                  <CardHeader className="bg-muted/20 border-b border-border/60 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border/60">
                            #{item.order}
                          </span>

                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              probType === "CODING"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                : probType === "MCQ"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {probType}
                          </span>

                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              difficulty === "EASY"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : difficulty === "HARD"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}
                          >
                            {difficulty}
                          </span>
                        </div>

                        <CardTitle className="text-base font-bold text-foreground mt-1">
                          {prob?.title || `Question #${item.order}`}
                        </CardTitle>
                      </div>

                      {/* Marks & Status Outcome */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {isAttempted ? (
                          isCorrect === true ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="size-3.5" /> Correct
                            </span>
                          ) : isCorrect === false ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <XCircle className="size-3.5" /> Incorrect
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              <Clock className="size-3.5" /> {sub?.status || "Evaluated"}
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold bg-muted text-muted-foreground border border-border/80">
                            <MinusCircle className="size-3.5" /> Not Attempted
                          </span>
                        )}

                        <div className="text-right pl-2 border-l border-border/60">
                          <span className="text-xs font-bold text-foreground">
                            {marksAwarded} / {marksAllocated}
                          </span>
                          <span className="text-[10px] block text-muted-foreground">pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Question Description */}
                    {prob?.description && (
                      <div className="mt-3 text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-background/50 p-3 rounded-lg border border-border/40">
                        {prob.description}
                      </div>
                    )}
                  </CardHeader>

                  {/* Problem Card Body: Candidate Submission Review */}
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    {/* 1. MCQ Review */}
                    {probType === "MCQ" && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-foreground">
                          Option Choices & Candidate Selection:
                        </p>

                        <div className="space-y-2">
                          {prob?.mcqQuestion?.options && prob.mcqQuestion.options.length > 0 ? (
                            prob.mcqQuestion.options.map((opt) => {
                              const isSelected = sub?.selectedOptionId === opt.id;
                              // Note: options might have isCorrect if populated by backend for staff review
                              const isOptCorrect = (opt as { isCorrect?: boolean }).isCorrect;

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 transition-colors ${
                                    isSelected && isOptCorrect
                                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-200"
                                      : isSelected && !isOptCorrect
                                      ? "bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-200"
                                      : isOptCorrect
                                      ? "bg-emerald-500/5 border-emerald-500/30 text-foreground"
                                      : "bg-muted/20 border-border/60 text-muted-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="size-5 rounded-full border flex items-center justify-center font-bold text-[10px]">
                                      {String.fromCharCode(65 + (opt.optionOrder || 0))}
                                    </span>
                                    <span className="font-medium">{opt.optionText}</span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {isSelected && (
                                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        Candidate Choice
                                      </span>
                                    )}
                                    {isOptCorrect && (
                                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                        <Check className="size-3" /> Correct Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Candidate selected option ID: {sub?.selectedOptionId || "None"}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. Coding Question Review */}
                    {probType === "CODING" && (
                      <div className="space-y-4">
                        {/* Execution Specs & Test Cases */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3 rounded-xl border border-border/60 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                              Language
                            </span>
                            <span className="font-bold text-foreground">
                              {sub?.language || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                              Test Cases
                            </span>
                            <span className="font-bold text-foreground">
                              {sub?.passedTests ?? 0} Passed / {sub?.failedTests ?? 0} Failed
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                              Execution Time
                            </span>
                            <span className="font-bold text-foreground">
                              {sub?.executionTimeMs != null ? `${sub.executionTimeMs} ms` : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                              Memory Used
                            </span>
                            <span className="font-bold text-foreground">
                              {sub?.memoryUsedMb != null ? `${sub.memoryUsedMb} MB` : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Submitted Code Block */}
                        <div>
                          <div className="flex items-center justify-between pb-1.5">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Code2 className="size-3.5 text-primary" /> Submitted Source Code:
                            </span>

                            {sub?.sourceCode && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyCode(sub.id, sub.sourceCode || "")}
                                className="h-7 text-xs gap-1 font-medium cursor-pointer"
                              >
                                {copiedCodeId === sub.id ? (
                                  <>
                                    <Check className="size-3 text-emerald-600" />
                                    <span className="text-emerald-600 font-semibold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="size-3 text-muted-foreground" />
                                    <span>Copy Code</span>
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                          {sub?.sourceCode ? (
                            <div className="relative rounded-xl border border-border/80 bg-muted/40 p-4 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
                              <pre className="text-foreground">
                                <code>{sub.sourceCode}</code>
                              </pre>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl border border-dashed text-xs text-muted-foreground text-center">
                              No source code submitted for this coding problem.
                            </div>
                          )}
                        </div>

                        {/* Test Cases preview if available */}
                        {prob?.codingQuestion?.testCases && prob.codingQuestion.testCases.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <span className="text-xs font-semibold text-foreground">
                              Test Cases Configured ({prob.codingQuestion.testCases.length}):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {prob.codingQuestion.testCases.map((tc, tcIdx) => (
                                <div
                                  key={tc.id || tcIdx}
                                  className="p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs space-y-1 font-mono"
                                >
                                  <div className="text-[10px] text-muted-foreground font-sans font-semibold">
                                    Test Case #{tcIdx + 1} ({tc.type || "PUBLIC"})
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Input: </span>
                                    <span className="text-foreground">{tc.input}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Expected: </span>
                                    <span className="text-foreground">{tc.expectedOutput}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Written Question Review */}
                    {probType === "WRITTEN" && (
                      <div className="space-y-3">
                        <span className="text-xs font-semibold text-foreground">
                          Candidate Written Response:
                        </span>

                        {sub?.answerText ? (
                          <div className="p-4 rounded-xl border border-border/80 bg-muted/30 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                            {sub.answerText}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed text-xs text-muted-foreground text-center">
                            No answer provided by candidate.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Evaluator Feedback & Reviews (for Written/Manual Review) */}
                    {sub?.evaluations && sub.evaluations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Award className="size-3.5 text-primary" /> Staff Evaluator Reviews:
                        </span>

                        <div className="space-y-2">
                          {sub.evaluations.map((ev) => (
                            <div
                              key={ev.id}
                              className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                                <span>
                                  Evaluator:{" "}
                                  <strong className="text-foreground">
                                    {ev.evaluator?.name || ev.evaluator?.email || "Staff Evaluator"}
                                  </strong>
                                </span>
                                <span className="font-bold text-primary">
                                  Marks Awarded: {ev.marksAwarded}
                                </span>
                              </div>
                              {ev.feedback && (
                                <p className="text-xs text-foreground mt-1 italic">
                                  &ldquo;{ev.feedback}&rdquo;
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── Tab Panel 2: Proctoring & Anti-Cheat Audit ── */}
      {activeTab === "proctoring" && (
        <div className="space-y-6">
          {/* Integrity Risk Summary Banner */}
          <Card className={`p-5 border ${riskAssessment.colorClass} shadow-xs`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-background/80 shadow-xs mt-0.5">
                  {totalViolations === 0 ? (
                    <ShieldCheck className="size-6 text-emerald-600" />
                  ) : totalViolations <= 3 ? (
                    <Shield className="size-6 text-amber-600" />
                  ) : (
                    <ShieldAlert className="size-6 text-rose-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {riskAssessment.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {riskAssessment.description}
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-border/60 sm:pl-5 shrink-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Violations
                </p>
                <p className="text-3xl font-black text-foreground mt-0.5">
                  {totalViolations}
                </p>
              </div>
            </div>
          </Card>

          {/* Breakdown by Incident Category */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                type: "TAB_SWITCH",
                label: "Tab Switches",
                count: antiCheat?.summary?.TAB_SWITCH ?? 0,
                icon: Laptop,
              },
              {
                type: "FULLSCREEN_EXIT",
                label: "Fullscreen Exits",
                count: antiCheat?.summary?.FULLSCREEN_EXIT ?? 0,
                icon: Maximize2,
              },
              {
                type: "WINDOW_BLUR",
                label: "Window Blurs",
                count: antiCheat?.summary?.WINDOW_BLUR ?? 0,
                icon: Eye,
              },
              {
                type: "COPY",
                label: "Copy Attempts",
                count: antiCheat?.summary?.COPY ?? 0,
                icon: Copy,
              },
              {
                type: "PASTE",
                label: "Paste Attempts",
                count: antiCheat?.summary?.PASTE ?? 0,
                icon: Copy,
              },
              {
                type: "MULTIPLE_TAB",
                label: "Multiple Tabs",
                count: antiCheat?.summary?.MULTIPLE_TAB ?? 0,
                icon: Laptop,
              },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <Card
                  key={cat.type}
                  className="p-3 border-border/70 text-center space-y-1 shadow-xs"
                >
                  <div className="flex items-center justify-center p-1.5 mx-auto rounded-lg bg-muted text-muted-foreground size-8">
                    <Icon className="size-4" />
                  </div>
                  <p className="text-xl font-bold text-foreground">{cat.count}</p>
                  <p className="text-[10px] font-medium text-muted-foreground leading-tight">
                    {cat.label}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Incident Timeline */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="size-4 text-primary" /> Chronological Proctoring Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {antiCheatEvents.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="size-8 mx-auto text-emerald-500 mb-2" />
                  No security incidents or anti-cheat triggers occurred during this attempt.
                </div>
              ) : (
                <div className="divide-y divide-border/60 max-h-96 overflow-y-auto">
                  {antiCheatEvents.map((event, idx) => {
                    const relative = formatRelativeTime(attempt?.startedAt, event.occurredAt);
                    return (
                      <div
                        key={event.id || idx}
                        className="p-3.5 px-4 sm:px-5 flex items-center justify-between gap-3 text-xs hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted border border-border/60 shrink-0">
                            {getAntiCheatIcon(event.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {event.type.replace(/_/g, " ")}
                              </span>
                              {relative && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-muted text-muted-foreground font-mono">
                                  {relative}
                                </span>
                              )}
                            </div>
                            {event.metadata && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                                {JSON.stringify(event.metadata)}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                          {formatDate(event.occurredAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab Panel 3: Candidate & Test Context ── */}
      {activeTab === "candidate" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidate Profile Details */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="size-4 text-primary" /> Candidate Profile & Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Full Name</span>
                  <span className="font-bold text-foreground">
                    {candidate?.name || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Email Address</span>
                  <span className="font-bold text-foreground">{candidate?.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Candidate ID</span>
                  <span className="font-mono text-muted-foreground">{candidate?.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Professional Title</span>
                  <span className="font-medium text-foreground">
                    {candidate?.profile?.title || "Candidate"}
                  </span>
                </div>
              </div>

              {candidate?.profile?.bio && (
                <div className="pt-2">
                  <span className="text-muted-foreground block text-[11px] mb-1">Bio / Summary</span>
                  <p className="text-xs text-foreground bg-muted/30 p-3 rounded-lg border border-border/60">
                    {candidate.profile.bio}
                  </p>
                </div>
              )}

              {candidate?.profile?.skills && Array.isArray(candidate.profile.skills) && (
                <div className="pt-2">
                  <span className="text-muted-foreground block text-[11px] mb-1.5">
                    Demonstrated Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.profile.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-secondary-foreground border border-border/50"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                {candidate?.profile?.resumeUrl && (
                  <a
                    href={candidate.profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    <ExternalLink className="size-3.5" /> Download / Open Candidate Resume
                  </a>
                )}
                {candidate?.profile?.githubUrl && (
                  <a
                    href={candidate.profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="size-3.5" /> Candidate GitHub Profile
                  </a>
                )}
                {candidate?.profile?.linkedinUrl && (
                  <a
                    href={candidate.profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="size-3.5" /> Candidate LinkedIn Profile
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Specifications */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCheck2 className="size-4 text-primary" /> Assessment Configuration & Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Assessment Title</span>
                  <span className="font-bold text-foreground">{assessment?.title}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Target Score</span>
                  <span className="font-bold text-foreground">
                    {passingScore != null ? `${passingScore}%` : "No minimum passing threshold"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Duration Allocated</span>
                  <span className="font-bold text-foreground">
                    {assessment?.durationMinutes} minutes
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Total Points</span>
                  <span className="font-bold text-foreground">{totalMarks} points</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60">
                <span className="text-muted-foreground block text-[11px] mb-2 font-semibold">
                  Attempt Metadata
                </span>
                <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border border-border/60 font-mono text-[11px]">
                  <div>Attempt ID: {attempt?.id}</div>
                  <div>Status: {attempt?.status}</div>
                  <div>Started At: {formatDate(attempt?.startedAt)}</div>
                  <div>Submitted At: {formatDate(attempt?.submittedAt)}</div>
                  <div>Calculated Duration: {attempt?.durationMinutes ?? "N/A"} minutes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DetailedAssessmentReportView;
