"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Eye,
  FileCheck2,
  FileText,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useGetMe } from "@/hook";
import { useGetAssessmentAttempts } from "@/hook/assessment.hook";
import { CompanyMemberRole, UserRole } from "@/types";
import type {
  IAssessment,
  IAssessmentAttemptListItem,
  ISingleAssessmentDetail,
} from "@/types/assessment.type";
import { isUserAuthorized } from "@/utils";
import { AttemptDetailsDialog } from "./attempt-details-dialog";
import { CalculateScoreDialog } from "./calculate-score-dialog";
import { DetailedAssessmentReportDialog } from "./detailed-assessment-report-dialog";
import { PublishResultsDialog } from "./publish-results-dialog";

export interface AssessmentAttemptsDialogProps {
  assessment: IAssessment | ISingleAssessmentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AttemptStatusFilter =
  | "ALL"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "EVALUATED"
  | "EXPIRED";

// ─── Formatting Helpers ───────────────────────────────────────────────────────

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

function formatDuration(
  startStr?: string | null,
  endStr?: string | null,
): string {
  if (!startStr) return "N/A";
  const start = new Date(startStr).getTime();
  const end = endStr ? new Date(endStr).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "N/A";

  const diffSecs = Math.floor((end - start) / 100);
  const minutes = Math.floor(diffSecs / 60);
  const seconds = diffSecs % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

function AttemptStatusBadge({ status }: { status: string }) {
  const norm = status?.toUpperCase() || "UNKNOWN";

  if (norm === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        In Progress
      </span>
    );
  }

  if (norm === "SUBMITTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
        <span className="size-1.5 rounded-full bg-indigo-500" />
        Submitted
      </span>
    );
  }

  if (norm === "EVALUATED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
        <CheckCircle2 className="size-3 text-emerald-500" />
        Evaluated
      </span>
    );
  }

  if (norm === "EXPIRED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
        <span className="size-1.5 rounded-full bg-rose-500" />
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-muted text-muted-foreground border-border/70">
      <span className="size-1.5 rounded-full bg-muted-foreground/50" />
      {norm}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AssessmentAttemptsDialog({
  assessment,
  open,
  onOpenChange,
}: AssessmentAttemptsDialogProps) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttemptStatusFilter>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sub-dialogs state
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );
  const [attemptDetailsOpen, setAttemptDetailsOpen] = useState(false);

  const [scoreAttemptId, setScoreAttemptId] = useState<string | null>(null);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);

  const [reportAttemptId, setReportAttemptId] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const [publishResultsOpen, setPublishResultsOpen] = useState(false);

  const assessmentId = assessment?.id || "";

  // TanStack Query for Attempts
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetAssessmentAttempts(assessmentId);

  // Current user permissions
  const { data: meData } = useGetMe();
  const currentUser = meData?.data;

  const isAdmin =
    currentUser?.role === UserRole.ADMIN ||
    currentUser?.role === UserRole.SUPER_ADMIN;
  const isCompanyOwner =
    currentUser?.memberRole === CompanyMemberRole.COMPANY_OWNER;
  const isCompanyAdmin =
    currentUser?.memberRole === CompanyMemberRole.COMPANY_ADMIN;
  const isCreator =
    currentUser?.memberRole === CompanyMemberRole.ASSESSMENT_CREATOR;
  const isEvaluator =
    currentUser?.memberRole === CompanyMemberRole.EVALUATOR ||
    currentUser?.role === (CompanyMemberRole.EVALUATOR as string);

  const canPublishResults = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
    CompanyMemberRole.ASSESSMENT_CREATOR,
  ]);

  const canCalculateScores = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
    CompanyMemberRole.ASSESSMENT_CREATOR,
    CompanyMemberRole.EVALUATOR,
  ]);

  // Safe normalization of attempts response
  const attempts: IAssessmentAttemptListItem[] = useMemo(() => {
    if (!data) return [];
    const raw = (data as { data?: unknown })?.data ?? data;
    if (Array.isArray(raw)) return raw as IAssessmentAttemptListItem[];
    if (Array.isArray((raw as { attempts?: unknown })?.attempts)) {
      return (raw as { attempts: IAssessmentAttemptListItem[] }).attempts;
    }
    return [];
  }, [data]);

  // Client-side search and status filter
  const filteredAttempts = useMemo(() => {
    return attempts.filter((att) => {
      // 1. Status Filter
      if (statusFilter !== "ALL") {
        const attStatus = att.status?.toUpperCase() || "";
        if (attStatus !== statusFilter) return false;
      }

      // 2. Search Term Filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const candName = att.candidate?.name?.toLowerCase() || "";
      const candEmail = att.candidate?.email?.toLowerCase() || "";
      const attId = att.id?.toLowerCase() || "";

      return (
        candName.includes(term) ||
        candEmail.includes(term) ||
        attId.includes(term)
      );
    });
  }, [attempts, statusFilter, searchTerm]);

  // Statistics calculation
  const stats = useMemo(() => {
    let inProgress = 0;
    let submitted = 0;
    let evaluated = 0;
    let expired = 0;
    let totalScore = 0;
    let scoredCount = 0;

    for (const a of attempts) {
      const st = a.status?.toUpperCase();
      if (st === "IN_PROGRESS") inProgress++;
      else if (st === "SUBMITTED") submitted++;
      else if (st === "EVALUATED") evaluated++;
      else if (st === "EXPIRED") expired++;

      if (a.obtainedMarks !== null && a.obtainedMarks !== undefined) {
        totalScore += a.obtainedMarks;
        scoredCount++;
      } else if (a.result?.obtainedMarks !== null && a.result?.obtainedMarks !== undefined) {
        totalScore += a.result.obtainedMarks;
        scoredCount++;
      }
    }

    const avgScore =
      scoredCount > 0 ? (totalScore / scoredCount).toFixed(1) : null;

    return {
      total: attempts.length,
      inProgress,
      submitted,
      evaluated,
      expired,
      avgScore,
    };
  }, [attempts]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.add({
      title: "Attempt ID Copied",
      description: "Identifier copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const rolePerspectiveLabel = isAdmin
    ? "Admin Oversight: Candidate Attempts Audit"
    : isCompanyOwner
      ? "Company Leadership: Candidate Attempts"
      : isCompanyAdmin
        ? "Company Admin: Candidate Attempts"
        : isCreator
          ? "Assessment Creator: Questions Telemetry"
          : isEvaluator
            ? "Evaluator Grading: Candidate Attempts"
            : "Candidate Attempts";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 gap-0 [scrollbar-width:thin]">
          {/* ── Dialog Header Banner ── */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-primary/5 via-muted/30 to-background border-b border-border/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    <Users className="size-3" />
                    {rolePerspectiveLabel}
                  </span>
                  {assessment?.status && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border bg-muted text-muted-foreground border-border/60">
                      {assessment.status}
                    </span>
                  )}
                </div>

                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Assessment Candidate Attempts
                </DialogTitle>

                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  {assessment?.title ? (
                    <span>
                      Tracking session submissions for{" "}
                      <strong className="text-foreground">
                        &quot;{assessment.title}&quot;
                      </strong>
                    </span>
                  ) : (
                    "Inspect individual candidate sessions, submitted answers, and calculated grades."
                  )}
                </DialogDescription>
              </div>

              {/* Action Toolbar on Header */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="text-xs h-8 px-2.5 gap-1.5 cursor-pointer"
                  id="refresh-attempts-btn"
                >
                  <RefreshCw
                    className={`size-3.5 ${
                      isRefetching ? "animate-spin text-primary" : ""
                    }`}
                  />
                  <span>Refresh</span>
                </Button>

                {canPublishResults && assessment?.status !== "DRAFT" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setPublishResultsOpen(true)}
                    className="text-xs h-8 px-3 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    id="publish-results-shortcut-btn"
                  >
                    <Award className="size-3.5" />
                    Publish Results
                  </Button>
                )}
              </div>
            </div>

            {/* Metric Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Total Attempts
                </p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {stats.total}
                </p>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  In Progress
                </p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {stats.inProgress}
                </p>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Submitted
                </p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {stats.submitted}
                </p>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Evaluated
                </p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {stats.evaluated}
                </p>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60 col-span-2 sm:col-span-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Average Score
                </p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {stats.avgScore ? `${stats.avgScore} pts` : "N/A"}
                </p>
              </Card>
            </div>
          </div>

          {/* ── Toolbar: Search & Filters ── */}
          <div className="p-4 sm:px-6 border-b border-border/60 bg-background/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search candidate name, email, or attempt ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
                id="search-attempts-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0 [scrollbar-width:none]">
              {(
                [
                  { key: "ALL", label: `All (${attempts.length})` },
                  { key: "IN_PROGRESS", label: `In Progress (${stats.inProgress})` },
                  { key: "SUBMITTED", label: `Submitted (${stats.submitted})` },
                  { key: "EVALUATED", label: `Evaluated (${stats.evaluated})` },
                  { key: "EXPIRED", label: `Expired (${stats.expired})` },
                ] as const
              ).map(({ key, label }) => (
                <Button
                  key={key}
                  type="button"
                  variant={statusFilter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(key)}
                  className="text-xs h-8 px-2.5 rounded-lg font-medium cursor-pointer"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* ── Attempts Table ── */}
          <div className="p-4 sm:p-6">
            <Card className="shadow-2xs border-border/70 overflow-hidden min-h-[320px]">
              <div className="overflow-x-auto [scrollbar-width:thin]">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="min-w-[220px] text-xs font-semibold">
                        Candidate
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Attempt #
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Score / Marks
                      </TableHead>
                      <TableHead className="min-w-[160px] text-xs font-semibold">
                        Session Timing
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Loading State */}
                    {isLoading ? (
                      [1, 2, 3, 4].map((id) => (
                        <TableRow
                          key={`attempts-skeleton-${id}`}
                          className="animate-pulse"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Skeleton className="size-8 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-3.5 w-28" />
                                <Skeleton className="h-3 w-40" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-7 w-20 ml-auto rounded-md" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : isError ? (
                      /* Error State */
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                            <AlertCircle className="size-8 text-destructive" />
                            <p className="text-sm font-semibold text-foreground">
                              Failed to load candidate attempts
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(error as Error)?.message ||
                                "Could not connect to the assessment service. Please verify permissions."}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refetch()}
                              className="text-xs mt-2"
                            >
                              Try Again
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredAttempts.length === 0 ? (
                      /* Empty State */
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
                              <FileCheck2 className="size-6" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {searchTerm || statusFilter !== "ALL"
                                ? "No attempts match the selected criteria"
                                : "No candidate attempts recorded yet"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {searchTerm || statusFilter !== "ALL"
                                ? "Adjust your search filter or clear status selections."
                                : "Candidates who start this assessment will appear here with live progress and submission results."}
                            </p>
                            {(searchTerm || statusFilter !== "ALL") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchTerm("");
                                  setStatusFilter("ALL");
                                }}
                                className="text-xs mt-2"
                              >
                                Clear Filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      /* Data Rows */
                      filteredAttempts.map((attempt) => {
                        const cand = attempt.candidate;
                        const scoreObtained =
                          attempt.obtainedMarks ??
                          attempt.result?.obtainedMarks ??
                          null;
                        const scoreTotal =
                          attempt.totalMarks ||
                          attempt.result?.totalMarks ||
                          assessment?.totalMarks ||
                          0;
                        const percentage =
                          attempt.percentage ??
                          attempt.result?.percentage ??
                          (scoreObtained !== null && scoreTotal > 0
                            ? Math.round((scoreObtained / scoreTotal) * 100)
                            : null);

                        return (
                          <TableRow
                            key={attempt.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            {/* Candidate Info */}
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <Avatar className="size-8">
                                  <AvatarImage
                                    src={cand?.profilePictureUrl || ""}
                                  />
                                  <AvatarFallback className="text-[10px] font-bold">
                                    {getInitials(cand?.name, cand?.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-semibold text-foreground leading-snug">
                                    {cand?.name || "Candidate"}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground font-mono">
                                    {cand?.email || "No email"}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-mono text-muted-foreground/70">
                                      ID: {attempt.id.slice(0, 8)}...
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyId(attempt.id)}
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                      title="Copy Attempt ID"
                                    >
                                      {copiedId === attempt.id ? (
                                        <Check className="size-2.5 text-emerald-500" />
                                      ) : (
                                        <Copy className="size-2.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Attempt Number */}
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-muted text-muted-foreground border border-border/60">
                                #{attempt.attemptNumber || 1}
                              </span>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <AttemptStatusBadge status={attempt.status} />
                            </TableCell>

                            {/* Score / Marks */}
                            <TableCell>
                              <div className="space-y-0.5">
                                {scoreObtained !== null ? (
                                  <>
                                    <p className="text-xs font-bold text-foreground">
                                      {scoreObtained} / {scoreTotal} pts
                                    </p>
                                    {percentage !== null && (
                                      <span
                                        className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                                          percentage >=
                                          (assessment?.passingScore ?? 50)
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                        }`}
                                      >
                                        {percentage}%
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">
                                    Pending Grade
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Session Timing */}
                            <TableCell>
                              <div className="space-y-1 text-[11px]">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="size-3 shrink-0" />
                                  <span>
                                    Started:{" "}
                                    <strong className="text-foreground font-normal">
                                      {formatDate(attempt.startedAt)}
                                    </strong>
                                  </span>
                                </div>
                                {attempt.submittedAt && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <CheckCircle2 className="size-3 shrink-0 text-emerald-500" />
                                    <span>
                                      Submitted:{" "}
                                      <strong className="text-foreground font-normal">
                                        {formatDate(attempt.submittedAt)}
                                      </strong>
                                    </span>
                                  </div>
                                )}
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  Elapsed:{" "}
                                  {formatDuration(
                                    attempt.startedAt,
                                    attempt.submittedAt,
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            {/* Actions Column */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Inspect Full Attempt Details */}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAttemptId(attempt.id);
                                    setAttemptDetailsOpen(true);
                                  }}
                                  className="text-xs h-7 px-2 gap-1 cursor-pointer"
                                  title="Inspect candidate submissions and answers"
                                >
                                  <Eye className="size-3 text-muted-foreground" />
                                  Details
                                </Button>

                                {/* Calculate / Re-Calculate Score */}
                                {canCalculateScores && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setScoreAttemptId(attempt.id);
                                      setScoreDialogOpen(true);
                                    }}
                                    className="text-xs h-7 px-2 gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                                    title="Calculate score for this attempt"
                                  >
                                    <Calculator className="size-3 text-amber-600 dark:text-amber-400" />
                                    Score
                                  </Button>
                                )}

                                {/* Detailed Analytical Report */}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReportAttemptId(attempt.id);
                                    setReportDialogOpen(true);
                                  }}
                                  className="text-xs h-7 px-2 gap-1 text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                                  title="View full candidate evaluation report"
                                >
                                  <FileText className="size-3 text-primary" />
                                  Report
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Sub-Dialog: Attempt Details ── */}
      {selectedAttemptId && (
        <AttemptDetailsDialog
          attemptId={selectedAttemptId}
          open={attemptDetailsOpen}
          onOpenChange={setAttemptDetailsOpen}
          isCandidateView={false}
        />
      )}

      {/* ── Sub-Dialog: Calculate Score ── */}
      {scoreAttemptId && (
        <CalculateScoreDialog
          attemptId={scoreAttemptId}
          open={scoreDialogOpen}
          onOpenChange={setScoreDialogOpen}
          onSuccess={() => refetch()}
        />
      )}

      {/* ── Sub-Dialog: Detailed Assessment Report ── */}
      {reportAttemptId && (
        <DetailedAssessmentReportDialog
          attemptId={reportAttemptId}
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
        />
      )}

      {/* ── Sub-Dialog: Publish Results ── */}
      {assessment && (
        <PublishResultsDialog
          assessment={assessment}
          open={publishResultsOpen}
          onOpenChange={setPublishResultsOpen}
          onSuccess={() => refetch()}
        />
      )}
    </>
  );
}

export default AssessmentAttemptsDialog;
