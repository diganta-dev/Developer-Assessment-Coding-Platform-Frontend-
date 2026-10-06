"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Play,
  RefreshCw,
  Search,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AttemptDetailsDialog,
  AttemptResultDialog,
  FinalizeSubmitAttemptDialog,
} from "@/components/dashboard/assessments-components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  useGetCandidateMyAttempts,
  useStartAttempt,
} from "@/hook/assessment.hook";
import type { ICandidateAttemptItem } from "@/types/assessment.type";

type AttemptStatusFilter =
  | "ALL"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "EVALUATED"
  | "EXPIRED";

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

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "CO";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function CandidateMyAttempts() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttemptStatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Finalize & Submit dialog state
  const [submitAttemptId, setSubmitAttemptId] = useState<string | null>(null);
  const [submitAssessmentTitle, setSubmitAssessmentTitle] = useState("");
  const [submitOpen, setSubmitOpen] = useState(false);

  // Result dialog state
  const [resultAttemptId, setResultAttemptId] = useState<string | null>(null);
  const [resultOpen, setResultOpen] = useState(false);

  const pageSize = 10;

  // Query candidate attempts
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetCandidateMyAttempts({
      page: currentPage,
      limit: pageSize,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    });

  const startAttemptMutation = useStartAttempt();

  // Attempts list
  const attempts: ICandidateAttemptItem[] = useMemo(() => {
    if (!data?.data) return [];
    return data.data;
  }, [data]);

  const meta = data?.meta;

  // Filter client-side by search query
  const filteredAttempts = useMemo(() => {
    if (!searchTerm.trim()) return attempts;
    const term = searchTerm.toLowerCase().trim();
    return attempts.filter((item) => {
      const title = item.assessment?.title?.toLowerCase() || "";
      const company = item.assessment?.company?.name?.toLowerCase() || "";
      const id = item.id.toLowerCase();
      return (
        title.includes(term) || company.includes(term) || id.includes(term)
      );
    });
  }, [attempts, searchTerm]);

  // Overall Statistics computed from attempts
  const stats = useMemo(() => {
    let inProgress = 0;
    let submitted = 0;
    let evaluated = 0;
    let expired = 0;
    let totalScoreSum = 0;
    let totalScoreCount = 0;

    for (const a of attempts) {
      const st = a.status?.toUpperCase();
      if (st === "IN_PROGRESS") inProgress++;
      else if (st === "SUBMITTED") submitted++;
      else if (st === "EVALUATED") {
        evaluated++;
        const pct = a.result?.percentage ?? a.percentage;
        if (pct != null) {
          totalScoreSum += pct;
          totalScoreCount++;
        }
      } else if (st === "EXPIRED") expired++;
    }

    const avgScore =
      totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : null;

    return {
      total: meta?.total ?? attempts.length,
      inProgress,
      submitted,
      evaluated,
      expired,
      avgScore,
    };
  }, [attempts, meta]);

  const handleRefresh = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["candidate-my-attempts"] });
    toast.add({
      title: "Attempts Refreshed",
      description: "Your assessment attempts records are up to date.",
      type: "info",
    });
  };

  const handleResumeAttempt = async (attempt: ICandidateAttemptItem) => {
    try {
      const res = await startAttemptMutation.mutateAsync({
        assessmentId: attempt.assessmentId,
      });

      toast.add({
        title: "Resuming Assessment",
        description: `Continuing attempt #${res.data?.attempt?.attemptNumber || attempt.attemptNumber}...`,
        type: "success",
      });

      router.push(
        `/candidate/assessments?assessmentId=${attempt.assessmentId}&attemptId=${attempt.id}`,
      );
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string };
      toast.add({
        title: "Cannot Resume Test",
        description:
          apiErr?.data?.message ||
          apiErr?.message ||
          "Unable to resume this attempt at this moment.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* ── Section Title & Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Trophy className="size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              My Assessment Attempts
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Review your technical evaluations, track in-progress exams, and view
            benchmarked scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching || isLoading}
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

      {/* ── Quick Metrics Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="shadow-xs border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Attempts
            </span>
            <FileCheck2 className="size-4 text-muted-foreground/70" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground mt-2">
            {stats.total}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Recorded evaluations
          </p>
        </Card>

        <Card className="shadow-xs border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              In Progress
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-2">
            {stats.inProgress}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Active / Ready to resume
          </p>
        </Card>

        <Card className="shadow-xs border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Evaluated
            </span>
            <CheckCircle2 className="size-4 text-emerald-500/70" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.evaluated}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Completed assessments
          </p>
        </Card>

        <Card className="shadow-xs border-border/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Average Score
            </span>
            <Award className="size-4 text-indigo-500/70" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 mt-2">
            {stats.avgScore != null ? `${stats.avgScore}%` : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Performance benchmark
          </p>
        </Card>
      </div>

      {/* ── Toolbar: Search & Filter Tabs ── */}
      <Card className="shadow-xs border-border/70 overflow-hidden">
        <div className="p-3 sm:px-4 border-b border-border/40 bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search assessment title, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 pr-7 text-xs bg-background"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
            {(
              [
                { key: "ALL", label: "All" },
                { key: "IN_PROGRESS", label: "In Progress" },
                { key: "SUBMITTED", label: "Submitted" },
                { key: "EVALUATED", label: "Evaluated" },
                { key: "EXPIRED", label: "Expired" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setStatusFilter(key);
                  setCurrentPage(1);
                }}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content: Attempts Table ── */}
        <div className="overflow-x-auto [scrollbar-width:thin]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/40 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-24 rounded-md" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Failed to load candidate attempts
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {(error as Error)?.message ||
                  "Could not retrieve your assessment records from the server."}
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
          ) : filteredAttempts.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-muted/60 text-muted-foreground">
                <Clock className="size-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {searchTerm || statusFilter !== "ALL"
                  ? "No matching attempts found"
                  : "No assessment attempts yet"}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchTerm || statusFilter !== "ALL"
                  ? "Try resetting your search query or switching to another status tab."
                  : "When you start or submit a coding test, your attempt history and benchmarked scores will appear here."}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="text-xs mt-2"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs font-semibold">
                    Assessment & Company
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Attempt
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Score & Result
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Date & Time
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.map((item) => {
                  const company = item.assessment?.company;
                  const status = (item.status || "NOT_STARTED").toUpperCase();
                  const scorePercentage =
                    item.result?.percentage ?? item.percentage;
                  const obtainedMarks =
                    item.result?.obtainedMarks ?? item.obtainedMarks;
                  const totalMarks =
                    item.assessment?.totalMarks ?? item.totalMarks;
                  const rank = item.result?.rank;

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/20">
                      {/* Assessment Title & Company */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 rounded-lg border border-border/60 bg-muted/40">
                            {company?.logoUrl ? (
                              <AvatarImage
                                src={company.logoUrl}
                                alt={company.name || "Company"}
                                className="object-cover"
                              />
                            ) : null}
                            <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                              {getInitials(company?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground leading-tight">
                              {item.assessment?.title || "Technical Assessment"}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 leading-tight">
                              <span>
                                {company?.name || "DevAssess Benchmark"}
                              </span>
                              {item.assessment?.durationMinutes && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {item.assessment.durationMinutes} mins
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Attempt Number */}
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/60">
                          #{item.attemptNumber}
                        </span>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        {status === "IN_PROGRESS" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                            </span>
                            In Progress
                          </span>
                        ) : status === "EVALUATED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            <CheckCircle2 className="size-3" />
                            Evaluated
                          </span>
                        ) : status === "SUBMITTED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                            <Clock className="size-3" />
                            Submitted
                          </span>
                        ) : status === "EXPIRED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-muted text-muted-foreground border-border/80">
                            <XCircle className="size-3" />
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-secondary text-secondary-foreground border-border/60">
                            {status}
                          </span>
                        )}
                      </TableCell>

                      {/* Score & Rank */}
                      <TableCell>
                        {scorePercentage != null && status === "EVALUATED" ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground">
                                {scorePercentage}%
                              </span>
                              {obtainedMarks != null && totalMarks != null && (
                                <span className="text-[11px] text-muted-foreground">
                                  ({obtainedMarks}/{totalMarks} pts)
                                </span>
                              )}
                            </div>
                            {rank != null && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                <Trophy className="size-2.5" />
                                Rank #{rank}
                              </span>
                            )}
                          </div>
                        ) : status === "SUBMITTED" ? (
                          <span className="text-xs text-muted-foreground italic">
                            Pending Evaluation
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Dates */}
                      <TableCell>
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <p>
                            Started:{" "}
                            {formatDate(item.startedAt || item.createdAt)}
                          </p>
                          {item.submittedAt && (
                            <p className="text-[11px]">
                              Submitted: {formatDate(item.submittedAt)}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === "IN_PROGRESS" ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleResumeAttempt(item)}
                                disabled={startAttemptMutation.isPending}
                                className="h-7 text-xs px-2.5 gap-1.5 font-medium bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                              >
                                <Play className="size-3 fill-white" />
                                <span>Resume</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSubmitAttemptId(item.id);
                                  setSubmitAssessmentTitle(
                                    item.assessment?.title || "",
                                  );
                                  setSubmitOpen(true);
                                }}
                                className="h-7 text-xs px-2 gap-1 font-medium border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 cursor-pointer"
                              >
                                <span>Submit</span>
                              </Button>
                            </>
                          ) : (
                            <>
                              {(status === "SUBMITTED" ||
                                status === "EVALUATED") && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setResultAttemptId(item.id);
                                    setResultOpen(true);
                                  }}
                                  className="h-7 text-xs px-2.5 gap-1 font-medium border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                                >
                                  <Trophy className="size-3" />
                                  <span>Result</span>
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAttemptId(item.id);
                                  setDetailsOpen(true);
                                }}
                                className="h-7 text-xs px-2.5 gap-1 font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <Eye className="size-3 text-muted-foreground" />
                                <span>Details</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* ── Table Footer & Pagination ── */}
        {meta && meta.totalPages > 1 && (
          <div className="p-3 px-4 border-t border-border/40 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="h-7 text-xs px-2.5"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(meta.totalPages, p + 1))
                }
                disabled={currentPage >= meta.totalPages || isLoading}
                className="h-7 text-xs px-2.5"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Attempt Details Modal Dialog ── */}
      <AttemptDetailsDialog
        attemptId={selectedAttemptId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        isCandidateView={true}
      />

      {/* ── Finalize & Submit Dialog ── */}
      <FinalizeSubmitAttemptDialog
        attemptId={submitAttemptId}
        assessmentTitle={submitAssessmentTitle}
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSuccess={(id) => {
          setResultAttemptId(id);
          setResultOpen(true);
        }}
      />

      {/* ── Official Attempt Result Modal Dialog ── */}
      <AttemptResultDialog
        attemptId={resultAttemptId}
        open={resultOpen}
        onOpenChange={setResultOpen}
        isCandidateView={true}
      />
    </div>
  );
}

export default CandidateMyAttempts;
