"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  FileCheck2,
  FileText,
  Flame,
  Medal,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
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
import { useGetAssessmentLeaderboard } from "@/hook/assessment.hook";
import { CompanyMemberRole, UserRole } from "@/types";
import type {
  IAssessment,
  IAssessmentLeaderboardItem,
} from "@/types/assessment.type";
import { isUserAuthorized } from "@/utils";
import { AttemptDetailsDialog } from "./attempt-details-dialog";
import { DetailedAssessmentReportDialog } from "./detailed-assessment-report-dialog";
import { PublishResultsDialog } from "./publish-results-dialog";

export interface AssessmentLeaderboardDialogProps {
  assessmentId: string | null;
  assessmentTitle?: string;
  assessment?: IAssessment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LeaderboardTab = "ALL" | "TOP_10" | "PASSED" | "MY_RANK";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  return "CO";
}

// ─── Podium Cards ─────────────────────────────────────────────────────────────

function PodiumEntry({
  item,
  rank,
  isCurrentUser,
  onInspect,
  canInspect,
}: {
  item: IAssessmentLeaderboardItem;
  rank: 1 | 2 | 3;
  isCurrentUser: boolean;
  onInspect?: () => void;
  canInspect?: boolean;
}) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  const borderColor = isFirst
    ? "border-amber-400 dark:border-amber-500 shadow-amber-500/10 shadow-lg ring-1 ring-amber-400/30"
    : isSecond
      ? "border-slate-300 dark:border-slate-600 shadow-md"
      : "border-amber-700/50 dark:border-amber-600/50 shadow-md";

  const badgeBg = isFirst
    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
    : isSecond
      ? "bg-gradient-to-r from-slate-400 to-slate-500 text-white"
      : "bg-gradient-to-r from-amber-700 to-amber-800 text-white";

  return (
    <Card
      className={`relative p-4 flex flex-col items-center text-center transition-all duration-200 ${borderColor} ${
        isCurrentUser ? "bg-primary/5 ring-2 ring-primary/40" : "bg-muted/20"
      } ${isFirst ? "sm:-translate-y-2 order-1 sm:order-2" : isSecond ? "order-2 sm:order-1" : "order-3"}`}
    >
      {/* Crown / Trophy icon for #1 */}
      {isFirst && (
        <div className="absolute -top-3.5 flex items-center justify-center p-1.5 rounded-full bg-amber-500 text-white shadow-md">
          <Crown className="size-4 animate-bounce" />
        </div>
      )}

      {/* Rank Indicator */}
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs mt-1 ${badgeBg}`}
      >
        {isFirst ? (
          <Trophy className="size-3 fill-current" />
        ) : (
          <Medal className="size-3 fill-current" />
        )}
        Rank #{rank}
      </span>

      {/* Candidate Avatar */}
      <Avatar className="size-14 sm:size-16 mt-3 border-2 border-background shadow-xs">
        <AvatarImage src={item.candidate?.profilePictureUrl || ""} />
        <AvatarFallback className="text-xs font-bold">
          {getInitials(item.candidate?.name, item.candidate?.email)}
        </AvatarFallback>
      </Avatar>

      {/* Candidate Name & Info */}
      <div className="mt-2 space-y-0.5 max-w-[140px]">
        <p className="text-xs font-bold text-foreground truncate">
          {item.candidate?.name || "Candidate"}
        </p>
        {isCurrentUser && (
          <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary text-primary-foreground">
            You
          </span>
        )}
      </div>

      {/* Score */}
      <div className="mt-2 pt-2 border-t border-border/50 w-full space-y-0.5">
        <p className="text-sm font-extrabold text-foreground font-mono">
          {item.obtainedMarks} / {item.totalMarks} pts
        </p>
        <span className="inline-block text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {item.percentage}%
        </span>
      </div>

      {canInspect && onInspect && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onInspect}
          className="text-[11px] h-6 px-2 mt-2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Eye className="size-3 mr-1" />
          Inspect
        </Button>
      )}
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AssessmentLeaderboardDialog({
  assessmentId,
  assessmentTitle,
  assessment,
  open,
  onOpenChange,
}: AssessmentLeaderboardDialogProps) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("ALL");
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );
  const [attemptDetailsOpen, setAttemptDetailsOpen] = useState(false);
  const [reportAttemptId, setReportAttemptId] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const targetId = assessmentId || assessment?.id || "";

  // Query Leaderboard
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetAssessmentLeaderboard(targetId);

  // User identity & role checks
  const { data: meData } = useGetMe();
  const currentUser = meData?.data;

  const isCandidate = currentUser?.role === UserRole.CANDIDATE;
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

  const canManageAssessments = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
    CompanyMemberRole.ASSESSMENT_CREATOR,
  ]);

  const canInspectDetails = !isCandidate;

  // Safe data extraction
  const rawData = data?.data;
  const isPublished =
    typeof rawData === "object" && rawData !== null && "isPublished" in rawData
      ? Boolean(rawData.isPublished)
      : assessment?.status === "COMPLETED" ||
        assessment?.status === "PUBLISHED";

  const leaderboardList: IAssessmentLeaderboardItem[] = useMemo(() => {
    if (!data) return [];
    const raw = (data as { data?: unknown })?.data ?? data;

    let items: IAssessmentLeaderboardItem[] = [];
    if (Array.isArray(raw)) {
      items = raw as IAssessmentLeaderboardItem[];
    } else if (Array.isArray((raw as { leaderboard?: unknown })?.leaderboard)) {
      items = (raw as { leaderboard: IAssessmentLeaderboardItem[] }).leaderboard;
    } else if (Array.isArray((raw as { results?: unknown })?.results)) {
      items = (raw as { results: IAssessmentLeaderboardItem[] }).results;
    }

    // Sort by rank or score
    return items
      .map((item, idx) => ({
        ...item,
        rank: item.rank || idx + 1,
      }))
      .sort((a, b) => a.rank - b.rank);
  }, [data]);

  // Find current user's entry if candidate
  const myEntry = useMemo(() => {
    if (!currentUser?.id && !currentUser?.email) return null;
    return leaderboardList.find((item) => {
      const matchId =
        item.candidateId === currentUser.id ||
        item.candidate?.id === currentUser.id;
      const matchEmail =
        currentUser.email &&
        item.candidate?.email?.toLowerCase() ===
          currentUser.email.toLowerCase();
      return matchId || matchEmail;
    });
  }, [leaderboardList, currentUser]);

  // Filtered leaderboard entries
  const filteredList = useMemo(() => {
    return leaderboardList.filter((item) => {
      // Tab filtering
      if (activeTab === "TOP_10" && item.rank > 10) return false;
      if (activeTab === "PASSED") {
        const passingScore =
          assessment?.passingScore ??
          (item.totalMarks ? Math.round(item.totalMarks * 0.5) : 0);
        if (passingScore > 0 && item.obtainedMarks < passingScore) return false;
      }
      if (activeTab === "MY_RANK") {
        if (!myEntry || item.id !== myEntry.id) return false;
      }

      // Search filtering
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const name = item.candidate?.name?.toLowerCase() || "";
      const email = item.candidate?.email?.toLowerCase() || "";
      const rankStr = `#${item.rank}`;

      return name.includes(term) || email.includes(term) || rankStr.includes(term);
    });
  }, [leaderboardList, activeTab, searchTerm, assessment, myEntry]);

  // Statistics
  const stats = useMemo(() => {
    const total = leaderboardList.length;
    let totalScore = 0;
    let highest = 0;
    let passedCount = 0;

    const passingScore =
      assessment?.passingScore ??
      (assessment?.totalMarks ? Math.round(assessment.totalMarks * 0.5) : 0);

    for (const item of leaderboardList) {
      const marks = item.obtainedMarks || 0;
      totalScore += marks;
      if (marks > highest) highest = marks;
      if (passingScore > 0 && marks >= passingScore) passedCount++;
    }

    const avg = total > 0 ? (totalScore / total).toFixed(1) : "0";
    const passRate = total > 0 ? Math.round((passedCount / total) * 100) : 0;

    return {
      total,
      highest,
      avg,
      passedCount,
      passRate,
    };
  }, [leaderboardList, assessment]);

  // Top 3 Podium
  const top1 = leaderboardList.find((i) => i.rank === 1);
  const top2 = leaderboardList.find((i) => i.rank === 2);
  const top3 = leaderboardList.find((i) => i.rank === 3);

  const displayTitle =
    assessmentTitle || assessment?.title || "Assessment Leaderboard";

  const rolePerspectiveBadge = isCandidate
    ? "Candidate Merit Standings"
    : isAdmin
      ? "Admin Oversight: Merit Rankings"
      : isCompanyOwner
        ? "Company Owner: Candidate Leaderboard"
        : isCompanyAdmin
          ? "Company Admin: Candidate Leaderboard"
          : isCreator
            ? "Creator Telemetry: Cohort Rankings"
            : isEvaluator
              ? "Evaluator Grading: Final Leaderboard"
              : "Official Leaderboard";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 gap-0 [scrollbar-width:thin]">
          {/* ── Dialog Header Banner ── */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-500/10 via-background to-primary/5 border-b border-border/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    <Trophy className="size-3.5 fill-current text-amber-500" />
                    {rolePerspectiveBadge}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                      isPublished
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {isPublished ? "Official Verified" : "Provisional"}
                  </span>
                </div>

                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>{displayTitle}</span>
                </DialogTitle>

                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  Official candidate merit rankings, test performance percentiles, and scores.
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
                  id="refresh-leaderboard-btn"
                >
                  <RefreshCw
                    className={`size-3.5 ${
                      isRefetching ? "animate-spin text-primary" : ""
                    }`}
                  />
                  <span>Refresh</span>
                </Button>

                {canManageAssessments && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setPublishModalOpen(true)}
                    className="text-xs h-8 px-3 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    <Send className="size-3.5" />
                    <span>Publish Results</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Candidate Self-Standing Alert Banner */}
            {isCandidate && myEntry && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/25 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-full bg-primary text-primary-foreground">
                    <Target className="size-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      Your Standing: Rank #{myEntry.rank} of {stats.total} candidates
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Score: <strong>{myEntry.obtainedMarks} / {myEntry.totalMarks} pts</strong> ({myEntry.percentage}%)
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("MY_RANK")}
                  className="text-xs h-7 px-2.5 bg-background font-semibold cursor-pointer"
                >
                  Focus My Rank
                </Button>
              </div>
            )}

            {/* Top 3 Podium (when participants >= 2) */}
            {!isLoading && leaderboardList.length >= 2 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" />
                  Top Merit Podium
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  {top2 && (
                    <PodiumEntry
                      item={top2}
                      rank={2}
                      isCurrentUser={Boolean(myEntry && top2.id === myEntry.id)}
                      onInspect={() => {
                        setSelectedAttemptId(top2.attemptId || top2.id || null);
                        setAttemptDetailsOpen(true);
                      }}
                      canInspect={canInspectDetails}
                    />
                  )}
                  {top1 && (
                    <PodiumEntry
                      item={top1}
                      rank={1}
                      isCurrentUser={Boolean(myEntry && top1.id === myEntry.id)}
                      onInspect={() => {
                        setSelectedAttemptId(top1.attemptId || top1.id || null);
                        setAttemptDetailsOpen(true);
                      }}
                      canInspect={canInspectDetails}
                    />
                  )}
                  {top3 && (
                    <PodiumEntry
                      item={top3}
                      rank={3}
                      isCurrentUser={Boolean(myEntry && top3.id === myEntry.id)}
                      onInspect={() => {
                        setSelectedAttemptId(top3.attemptId || top3.id || null);
                        setAttemptDetailsOpen(true);
                      }}
                      canInspect={canInspectDetails}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Total Ranked Candidates
                </p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {stats.total}
                </p>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Highest Score (#1)
                </p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {stats.highest} pts
                </p>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Cohort Average
                </p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {stats.avg} pts
                </p>
              </Card>

              <Card className="p-3 shadow-2xs border-border/60">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Pass Rate
                </p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {stats.passRate}%
                </p>
              </Card>
            </div>
          </div>

          {/* ── Toolbar: Search & Tab Filtering ── */}
          <div className="p-4 sm:px-6 border-b border-border/60 bg-background/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search candidate name, email, or rank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
                id="search-leaderboard-input"
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
                  { key: "ALL", label: `All Ranked (${leaderboardList.length})` },
                  { key: "TOP_10", label: "Top 10" },
                  { key: "PASSED", label: `Passed (${stats.passedCount})` },
                  ...(myEntry ? [{ key: "MY_RANK" as const, label: "My Standing" }] : []),
                ] as const
              ).map(({ key, label }) => (
                <Button
                  key={key}
                  type="button"
                  variant={activeTab === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(key)}
                  className="text-xs h-8 px-2.5 rounded-lg font-medium cursor-pointer"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* ── Leaderboard Table ── */}
          <div className="p-4 sm:p-6">
            <Card className="shadow-2xs border-border/70 overflow-hidden min-h-[300px]">
              <div className="overflow-x-auto [scrollbar-width:thin]">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-20 text-center text-xs font-semibold">
                        Rank
                      </TableHead>
                      <TableHead className="min-w-[200px] text-xs font-semibold">
                        Candidate
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Score / Marks
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Percentile / Status
                      </TableHead>
                      <TableHead className="min-w-[140px] text-xs font-semibold">
                        Completion
                      </TableHead>
                      {canInspectDetails && (
                        <TableHead className="text-right text-xs font-semibold">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Loading State */}
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map((id) => (
                        <TableRow
                          key={`leaderboard-skeleton-${id}`}
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
                                <Skeleton className="h-3 w-36" />
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
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          {canInspectDetails && (
                            <TableCell className="text-right">
                              <Skeleton className="h-7 w-16 ml-auto rounded-md" />
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : isError ? (
                      /* Error State */
                      <TableRow>
                        <TableCell
                          colSpan={canInspectDetails ? 6 : 5}
                          className="h-48 text-center"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                            <AlertCircle className="size-8 text-destructive" />
                            <p className="text-sm font-semibold text-foreground">
                              Failed to load leaderboard
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(error as Error)?.message ||
                                "Could not connect to the leaderboard service. Please verify permissions."}
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
                    ) : filteredList.length === 0 ? (
                      /* Empty State */
                      <TableRow>
                        <TableCell
                          colSpan={canInspectDetails ? 6 : 5}
                          className="h-48 text-center"
                        >
                          <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
                              <Trophy className="size-6" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {searchTerm || activeTab !== "ALL"
                                ? "No candidates match the active filter"
                                : "No leaderboard records available yet"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {searchTerm || activeTab !== "ALL"
                                ? "Adjust your search filter or clear tab selections."
                                : "Leaderboard entries will appear here once candidates complete and submit their assessments."}
                            </p>
                            {(searchTerm || activeTab !== "ALL") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchTerm("");
                                  setActiveTab("ALL");
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
                      filteredList.map((item, idx) => {
                        const isMe = Boolean(
                          myEntry && (item.id === myEntry.id || item.rank === myEntry.rank),
                        );
                        const cand = item.candidate;
                        const rankNum = item.rank || idx + 1;
                        const passingScore =
                          assessment?.passingScore ??
                          (item.totalMarks
                            ? Math.round(item.totalMarks * 0.5)
                            : 0);

                        const isPassed =
                          item.status?.toUpperCase() === "PASSED" ||
                          (passingScore > 0 && item.obtainedMarks >= passingScore);

                        const targetAttemptId = item.attemptId || item.id || "";

                        return (
                          <TableRow
                            key={item.id || `rank-row-${idx}`}
                            className={`transition-colors ${
                              isMe
                                ? "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary font-medium"
                                : "hover:bg-muted/30"
                            }`}
                          >
                            {/* Rank */}
                            <TableCell className="text-center">
                              {rankNum === 1 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  <Trophy className="size-3 text-amber-500" />
                                  #1
                                </span>
                              ) : rankNum === 2 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-300/20 text-slate-700 dark:text-slate-300 border border-slate-400/30">
                                  <Medal className="size-3 text-slate-400" />
                                  #2
                                </span>
                              ) : rankNum === 3 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-700/15 text-amber-800 dark:text-amber-300 border border-amber-700/30">
                                  <Medal className="size-3 text-amber-600" />
                                  #3
                                </span>
                              ) : (
                                <span className="text-xs font-mono font-medium text-muted-foreground">
                                  #{rankNum}
                                </span>
                              )}
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
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-xs font-semibold text-foreground leading-snug">
                                      {cand?.name || "Candidate"}
                                    </p>
                                    {isMe && (
                                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary text-primary-foreground">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground font-mono">
                                    {canInspectDetails
                                      ? cand?.email || "No email"
                                      : cand?.email
                                        ? cand.email.replace(/(.{2})(.*)(?=@)/, "$1***")
                                        : "Participating Candidate"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Score & Marks */}
                            <TableCell>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-foreground font-mono">
                                  {item.obtainedMarks} / {item.totalMarks} pts
                                </p>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  Score: {item.percentage}%
                                </span>
                              </div>
                            </TableCell>

                            {/* Percentile / Status */}
                            <TableCell>
                              {isPassed ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                                  <CheckCircle2 className="size-3 text-emerald-500" />
                                  Passed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                                  <XCircle className="size-3 text-rose-500" />
                                  Below Cutoff
                                </span>
                              )}
                            </TableCell>

                            {/* Completion Time */}
                            <TableCell>
                              <div className="space-y-0.5 text-[11px] text-muted-foreground">
                                <p className="text-foreground">
                                  {formatDate(item.submittedAt)}
                                </p>
                                {item.durationMinutes && (
                                  <p className="text-[10px] flex items-center gap-1 font-mono">
                                    <Clock className="size-2.5" />
                                    {item.durationMinutes} mins taken
                                  </p>
                                )}
                              </div>
                            </TableCell>

                            {/* Actions Column (Staff only) */}
                            {canInspectDetails && (
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedAttemptId(targetAttemptId);
                                      setAttemptDetailsOpen(true);
                                    }}
                                    className="text-xs h-7 px-2 gap-1 cursor-pointer"
                                    title="Inspect candidate submissions"
                                  >
                                    <Eye className="size-3 text-muted-foreground" />
                                    Inspect
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setReportAttemptId(targetAttemptId);
                                      setReportDialogOpen(true);
                                    }}
                                    className="text-xs h-7 px-2 gap-1 text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                                    title="View detailed audit report"
                                  >
                                    <FileText className="size-3 text-primary" />
                                    Report
                                  </Button>
                                </div>
                              </TableCell>
                            )}
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

      {/* ── Sub-Dialog: Attempt Details (Staff) ── */}
      {selectedAttemptId && (
        <AttemptDetailsDialog
          attemptId={selectedAttemptId}
          open={attemptDetailsOpen}
          onOpenChange={setAttemptDetailsOpen}
          isCandidateView={false}
        />
      )}

      {/* ── Sub-Dialog: Detailed Assessment Report (Staff) ── */}
      {reportAttemptId && (
        <DetailedAssessmentReportDialog
          attemptId={reportAttemptId}
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
        />
      )}

      {/* ── Sub-Dialog: Publish Results (Staff) ── */}
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

export default AssessmentLeaderboardDialog;
