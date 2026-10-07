"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  FileCheck2,
  FileText,
  Layers,
  Medal,
  RefreshCw,
  Search,
  Send,
  Shield,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useGetAssessmentResults } from "@/hook/assessment.hook";
import { CompanyMemberRole, UserRole } from "@/types";
import type {
  IAssessment,
  IAssessmentResultItem,
  ISingleAssessmentDetail,
} from "@/types/assessment.type";
import { isUserAuthorized } from "@/utils";
import { AttemptResultDialog } from "./attempt-result-dialog";
import { CalculateScoreDialog } from "./calculate-score-dialog";
import { DetailedAssessmentReportDialog } from "./detailed-assessment-report-dialog";
import { PublishResultsDialog } from "./publish-results-dialog";
import { AssessmentLeaderboardDialog } from "./assessment-leaderboard-dialog";

export interface AssessmentResultsDialogProps {
  assessment: IAssessment | ISingleAssessmentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ResultStatusFilter = "ALL" | "PASSED" | "FAILED" | "PENDING";

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

// ─── Rank Badge Component ─────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
        <Trophy className="size-3.5 fill-current text-amber-500" />
        #1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-300/20 text-slate-700 dark:text-slate-300 border border-slate-400/30">
        <Medal className="size-3.5 fill-current text-slate-400" />
        #2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-700/15 text-amber-800 dark:text-amber-300 border border-amber-700/30">
        <Medal className="size-3.5 fill-current text-amber-600" />
        #3
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium text-muted-foreground bg-muted/50 border border-border/50">
      #{rank}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AssessmentResultsDialog({
  assessment,
  open,
  onOpenChange,
}: AssessmentResultsDialogProps) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResultStatusFilter>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sub-dialogs state
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );
  const [attemptResultOpen, setAttemptResultOpen] = useState(false);

  const [scoreAttemptId, setScoreAttemptId] = useState<string | null>(null);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);

  const [reportAttemptId, setReportAttemptId] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const assessmentId = assessment?.id || "";

  // Query Cohort Results
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetAssessmentResults(assessmentId);

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

  // Safe data extraction
  const rawData = data?.data;
  const isPublishedGlobal =
    typeof rawData === "object" && rawData !== null && "isPublished" in rawData
      ? Boolean(rawData.isPublished)
      : assessment?.status === "COMPLETED" ||
        assessment?.status === "PUBLISHED";

  const results: IAssessmentResultItem[] = useMemo(() => {
    if (!data) return [];
    const raw = (data as { data?: unknown })?.data ?? data;
    if (Array.isArray(raw)) return raw as IAssessmentResultItem[];
    if (Array.isArray((raw as { results?: unknown })?.results)) {
      return (raw as { results: IAssessmentResultItem[] }).results;
    }
    return [];
  }, [data]);

  // Sort and assign ranks if not given by backend
  const sortedResults = useMemo(() => {
    const list = [...results];
    return list.sort((a, b) => {
      if (a.rank != null && b.rank != null) return a.rank - b.rank;
      return (b.obtainedMarks || 0) - (a.obtainedMarks || 0);
    });
  }, [results]);

  // Search & Status filter
  const filteredResults = useMemo(() => {
    return sortedResults.filter((item) => {
      // Status filter
      if (statusFilter !== "ALL") {
        const itemStatus = item.status?.toUpperCase() || "";
        if (statusFilter === "PASSED" && itemStatus !== "PASSED") return false;
        if (statusFilter === "FAILED" && itemStatus !== "FAILED") return false;
        if (statusFilter === "PENDING" && itemStatus === "PASSED") return false;
      }

      // Search filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const candName = item.candidate?.name?.toLowerCase() || "";
      const candEmail = item.candidate?.email?.toLowerCase() || "";
      const itemId = item.id?.toLowerCase() || "";
      const rankStr = item.rank ? `#${item.rank}` : "";

      return (
        candName.includes(term) ||
        candEmail.includes(term) ||
        itemId.includes(term) ||
        rankStr.includes(term)
      );
    });
  }, [sortedResults, statusFilter, searchTerm]);

  // Cohort statistics
  const stats = useMemo(() => {
    let passed = 0;
    let failed = 0;
    let pending = 0;
    let totalScore = 0;
    let highestScore = 0;
    const passingScore =
      assessment?.passingScore ??
      (assessment?.totalMarks ? Math.round(assessment.totalMarks * 0.5) : 0);

    for (const r of results) {
      const score = r.obtainedMarks || 0;
      totalScore += score;
      if (score > highestScore) highestScore = score;

      const st = r.status?.toUpperCase();
      if (st === "PASSED" || (passingScore > 0 && score >= passingScore)) {
        passed++;
      } else if (st === "FAILED" || (passingScore > 0 && score < passingScore)) {
        failed++;
      } else {
        pending++;
      }
    }

    const total = results.length;
    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : "0";
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      total,
      passed,
      failed,
      pending,
      avgScore,
      highestScore,
      passRate,
    };
  }, [results, assessment]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.add({
      title: "Identifier Copied",
      description: "Result identifier copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const rolePerspectiveLabel = isAdmin
    ? "Admin Oversight: Cohort Leaderboard & Results"
    : isCompanyOwner
      ? "Company Leadership: Candidate Results"
      : isCompanyAdmin
        ? "Company Admin: Candidate Results"
        : isCreator
          ? "Assessment Creator: Question Performance"
          : isEvaluator
            ? "Evaluator Grading: Final Results & Roster"
            : "Assessment Results";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 gap-0 [scrollbar-width:thin]">
          {/* ── Dialog Header Banner ── */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-primary/5 via-muted/30 to-background border-b border-border/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Award className="size-3" />
                    {rolePerspectiveLabel}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                      isPublishedGlobal
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {isPublishedGlobal ? "Official Published" : "Unpublished Draft"}
                  </span>
                </div>

                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Assessment Results & Leaderboard
                </DialogTitle>

                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  {assessment?.title ? (
                    <span>
                      Official candidate ranking and score distribution for{" "}
                      <strong className="text-foreground">
                        &quot;{assessment.title}&quot;
                      </strong>
                    </span>
                  ) : (
                    "Inspect candidate outcomes, scoring distribution, and merit rankings."
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
                  id="refresh-results-btn"
                >
                  <RefreshCw
                    className={`size-3.5 ${
                      isRefetching ? "animate-spin text-primary" : ""
                    }`}
                  />
                  <span>Refresh</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLeaderboardOpen(true)}
                  className="text-xs h-8 px-2.5 gap-1.5 cursor-pointer text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  id="results-view-leaderboard-btn"
                >
                  <Trophy className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Leaderboard</span>
                </Button>

                {canPublishResults && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setPublishModalOpen(true)}
                    className="text-xs h-8 px-3 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    id="trigger-publish-results-btn"
                  >
                    <Send className="size-3.5" />
                    <span>Publish Results</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Evaluated Cohort
                </p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {stats.total} candidates
                </p>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Pass Rate
                </p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.passRate}%
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    ({stats.passed} passed)
                  </span>
                </div>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Average Score
                </p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {stats.avgScore} pts
                </p>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Top Score (#1)
                </p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {stats.highestScore} pts
                </p>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60 col-span-2 sm:col-span-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Passing Score Benchmark
                </p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {assessment?.passingScore ?? 0} /{" "}
                  {assessment?.totalMarks ?? 100} pts
                </p>
              </Card>
            </div>

            {/* Publication Caution Banner if Unpublished */}
            {!isPublishedGlobal && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    <strong>Results are unpublished:</strong> Candidate scores are currently hidden. Release finalized grades to publish candidate reports.
                  </span>
                </div>
                {canPublishResults && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setPublishModalOpen(true)}
                    className="text-xs h-7 px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shrink-0"
                  >
                    Publish Now
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* ── Toolbar: Search & Filters ── */}
          <div className="p-4 sm:px-6 border-b border-border/60 bg-background/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search candidate name, email, or rank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
                id="search-results-input"
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
                  { key: "ALL", label: `All Candidates (${results.length})` },
                  { key: "PASSED", label: `Passed (${stats.passed})` },
                  { key: "FAILED", label: `Failed (${stats.failed})` },
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

          {/* ── Results Leaderboard Table ── */}
          <div className="p-4 sm:p-6">
            <Card className="shadow-2xs border-border/70 overflow-hidden min-h-[320px]">
              <div className="overflow-x-auto [scrollbar-width:thin]">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-16 text-center text-xs font-semibold">
                        Rank
                      </TableHead>
                      <TableHead className="min-w-[220px] text-xs font-semibold">
                        Candidate
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Score / Marks
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Outcome
                      </TableHead>
                      <TableHead className="min-w-[150px] text-xs font-semibold">
                        Completed At
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
                          key={`results-skeleton-${id}`}
                          className="animate-pulse"
                        >
                          <TableCell className="text-center">
                            <Skeleton className="h-5 w-8 mx-auto rounded-full" />
                          </TableCell>
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
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-16 rounded-full" />
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
                              Failed to load assessment results
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
                    ) : filteredResults.length === 0 ? (
                      /* Empty State */
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
                              <Trophy className="size-6" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {searchTerm || statusFilter !== "ALL"
                                ? "No candidates match the selected criteria"
                                : "No assessment results recorded yet"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {searchTerm || statusFilter !== "ALL"
                                ? "Adjust your search filter or clear status selections."
                                : "When candidates complete and submit their attempts, their graded marks and merit rankings will appear here."}
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
                      filteredResults.map((item, idx) => {
                        const cand = item.candidate;
                        const rankNum = item.rank ?? idx + 1;
                        const passingScore =
                          assessment?.passingScore ??
                          (assessment?.totalMarks
                            ? Math.round(assessment.totalMarks * 0.5)
                            : 0);

                        const isPassed =
                          item.status?.toUpperCase() === "PASSED" ||
                          (passingScore > 0 &&
                            item.obtainedMarks >= passingScore);

                        const targetAttemptId =
                          item.attemptId || item.attempt?.id || item.id;

                        return (
                          <TableRow
                            key={item.id || `result-row-${idx}`}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            {/* Rank */}
                            <TableCell className="text-center font-mono">
                              <RankBadge rank={rankNum} />
                            </TableCell>

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
                                      ID: {item.id.slice(0, 8)}...
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyId(item.id)}
                                      className="text-muted-foreground hover:text-foreground transition-colors"
                                      title="Copy Result ID"
                                    >
                                      {copiedId === item.id ? (
                                        <Check className="size-2.5 text-emerald-500" />
                                      ) : (
                                        <Copy className="size-2.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Score & Marks */}
                            <TableCell>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-foreground font-mono">
                                  {item.obtainedMarks} / {item.totalMarks || assessment?.totalMarks || 100} pts
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                                      isPassed
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                    }`}
                                  >
                                    {item.percentage}%
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Outcome Badge */}
                            <TableCell>
                              {isPassed ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                  <CheckCircle2 className="size-3 text-emerald-500" />
                                  Passed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                                  <XCircle className="size-3 text-rose-500" />
                                  Failed
                                </span>
                              )}
                            </TableCell>

                            {/* Completion Time */}
                            <TableCell>
                              <div className="space-y-0.5 text-[11px]">
                                <p className="text-foreground">
                                  {formatDate(
                                    item.publishedAt ||
                                      item.attempt?.submittedAt ||
                                      item.createdAt,
                                  )}
                                </p>
                                {item.attempt?.durationMinutes && (
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                    <Clock className="size-2.5" />
                                    {item.attempt.durationMinutes} mins taken
                                  </p>
                                )}
                              </div>
                            </TableCell>

                            {/* Action Buttons */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Inspect Full Single Result */}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedAttemptId(targetAttemptId);
                                    setAttemptResultOpen(true);
                                  }}
                                  className="text-xs h-7 px-2 gap-1 cursor-pointer"
                                  title="Inspect problem breakdown and candidate score breakdown"
                                >
                                  <Eye className="size-3 text-muted-foreground" />
                                  Review
                                </Button>

                                {/* Recalculate Score */}
                                {canCalculateScores && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setScoreAttemptId(targetAttemptId);
                                      setScoreDialogOpen(true);
                                    }}
                                    className="text-xs h-7 px-2 gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                                    title="Recalculate score"
                                  >
                                    <Calculator className="size-3 text-amber-600 dark:text-amber-400" />
                                    Score
                                  </Button>
                                )}

                                {/* Analytical Report */}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReportAttemptId(targetAttemptId);
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

      {/* ── Sub-Dialog: Single Attempt Result Breakdown ── */}
      {selectedAttemptId && (
        <AttemptResultDialog
          attemptId={selectedAttemptId}
          open={attemptResultOpen}
          onOpenChange={setAttemptResultOpen}
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

      {/* ── Sub-Dialog: Assessment Leaderboard ── */}
      {assessment && (
        <AssessmentLeaderboardDialog
          assessmentId={assessment.id}
          assessmentTitle={assessment.title}
          assessment={assessment}
          open={leaderboardOpen}
          onOpenChange={setLeaderboardOpen}
        />
      )}

      {/* ── Sub-Dialog: Publish Results ── */}
      {assessment && (
        <PublishResultsDialog
          assessment={assessment}
          open={publishModalOpen}
          onOpenChange={setPublishModalOpen}
          onSuccess={() => refetch()}
        />
      )}
    </>
  );
}

export default AssessmentResultsDialog;
