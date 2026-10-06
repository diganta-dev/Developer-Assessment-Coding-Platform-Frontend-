"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Copy,
  CopyX,
  Eye,
  FileCheck2,
  FileEdit,
  Layers,
  Loader2,
  Maximize2,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
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
  useGetCompanyAllAssessments,
  usePublishAssessment,
} from "@/hook/assessment.hook";
import type { IAssessment } from "@/types/assessment.type";
import { InviteCandidateDialog } from "./invite-candidate-dialog";

interface GetAllAssessmentProps {
  onCreateClick?: () => void;
  onAddProblemsClick?: (assessment: IAssessment) => void;
}

type StatusFilterType = "ALL" | "DRAFT" | "ACTIVE" | "UPCOMING" | "EXPIRED";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAssessmentTimeStatus(
  startTime?: string,
  endTime?: string,
): { label: string; variant: "active" | "upcoming" | "expired" | "unknown" } {
  if (!startTime || !endTime) {
    return { label: "Configured", variant: "unknown" };
  }

  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) {
    return { label: "Upcoming", variant: "upcoming" };
  }
  if (now >= start && now <= end) {
    return { label: "Active", variant: "active" };
  }
  return { label: "Expired", variant: "expired" };
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function AssessmentStatusBadge({
  startTime,
  endTime,
  status,
}: {
  startTime?: string;
  endTime?: string;
  status?: string;
}) {
  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
        <span className="size-1.5 rounded-full bg-amber-500" />
        Draft
      </span>
    );
  }

  const { label, variant } = getAssessmentTimeStatus(startTime, endTime);

  const styleMap = {
    active:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    upcoming: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    expired: "bg-muted text-muted-foreground border-border/80",
    unknown: "bg-muted text-muted-foreground border-border/80",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styleMap[variant]}`}
    >
      {variant === "active" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
      )}
      {label}
    </span>
  );
}

// ─── Proctoring Badges ───────────────────────────────────────────────────────

function ProctoringBadges({
  settings,
}: {
  settings?: IAssessment["proctoringSettings"];
}) {
  if (!settings) {
    return <span className="text-xs text-muted-foreground">Standard</span>;
  }

  const activeCount = [
    settings.requireFullscreen,
    settings.blockCopyPaste,
    settings.trackFocusLoss,
    settings.trackTabSwitches,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-1.5">
      <span
        title={
          settings.requireFullscreen ? "Fullscreen Required" : "Fullscreen Off"
        }
        className={`p-1 rounded-md border text-[10px] ${
          settings.requireFullscreen
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-muted/40 border-border/40 text-muted-foreground/40"
        }`}
      >
        <Maximize2 className="size-3" />
      </span>

      <span
        title={
          settings.blockCopyPaste ? "Clipboard Blocked" : "Clipboard Allowed"
        }
        className={`p-1 rounded-md border text-[10px] ${
          settings.blockCopyPaste
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-muted/40 border-border/40 text-muted-foreground/40"
        }`}
      >
        <CopyX className="size-3" />
      </span>

      <span
        title={
          settings.trackFocusLoss ? "Focus Loss Tracked" : "Focus Loss Off"
        }
        className={`p-1 rounded-md border text-[10px] ${
          settings.trackFocusLoss
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-muted/40 border-border/40 text-muted-foreground/40"
        }`}
      >
        <ShieldAlert className="size-3" />
      </span>

      <span
        title={
          settings.trackTabSwitches
            ? `Tab Switches Tracked (max: ${settings.maxTabSwitches})`
            : "Tab Switches Off"
        }
        className={`p-1 rounded-md border text-[10px] ${
          settings.trackTabSwitches
            ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
            : "bg-muted/40 border-border/40 text-muted-foreground/40"
        }`}
      >
        <Users className="size-3" />
      </span>

      <span className="text-[10px] font-mono text-muted-foreground ml-0.5">
        ({activeCount}/4)
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GetAllAssessment({
  onCreateClick,
  onAddProblemsClick,
}: GetAllAssessmentProps) {
  const queryClient = useQueryClient();
  const publishMutation = usePublishAssessment();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");
  const [selectedAssessment, setSelectedAssessment] =
    useState<IAssessment | null>(null);
  const [assessmentToPublish, setAssessmentToPublish] =
    useState<IAssessment | null>(null);
  const [candidateInviteAssessment, setCandidateInviteAssessment] =
    useState<IAssessment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // TanStack Query to fetch company assessments
  const { data, isLoading, isError, error, isFetching, refetch } =
    useGetCompanyAllAssessments();

  // Normalize API response safely
  const assessments: IAssessment[] = useMemo(() => {
    if (!data) return [];
    const raw = (data as { data?: unknown })?.data ?? data;
    if (Array.isArray(raw)) return raw as IAssessment[];
    if (Array.isArray((raw as { assessments?: unknown })?.assessments)) {
      return (raw as { assessments: IAssessment[] }).assessments;
    }
    return [];
  }, [data]);

  // Client-side filtering
  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      // Search term filter
      const matchesSearch =
        !searchTerm.trim() ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === "ALL") return true;
      if (statusFilter === "DRAFT") return item.status === "DRAFT";
      if (item.status === "DRAFT") return false;

      const status = getAssessmentTimeStatus(
        item.startTime,
        item.endTime,
      ).variant;
      return status === statusFilter.toLowerCase();
    });
  }, [assessments, searchTerm, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    let drafts = 0;
    let active = 0;
    let upcoming = 0;
    let expired = 0;

    for (const a of assessments) {
      if (a.status === "DRAFT") {
        drafts++;
        continue;
      }
      const { variant } = getAssessmentTimeStatus(a.startTime, a.endTime);
      if (variant === "active") active++;
      else if (variant === "upcoming") upcoming++;
      else if (variant === "expired") expired++;
    }

    return {
      total: assessments.length,
      drafts,
      active,
      upcoming,
      expired,
    };
  }, [assessments]);

  // Copy ID / Link handler
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.add({
      title: "Assessment ID Copied",
      description: "Identifier copied to your clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Publish assessment action handler
  const handleConfirmPublish = (assessment: IAssessment) => {
    publishMutation.mutate(assessment.id, {
      onSuccess: () => {
        // Query invalidation in component (senior rule)
        queryClient.invalidateQueries({ queryKey: ["company-assessments"] });
        queryClient.invalidateQueries({ queryKey: ["assessments"] });

        toast.add({
          title: "Assessment Published Successfully",
          description: `"${assessment.title}" is now published and ready for candidate evaluation.`,
          type: "success",
        });

        setAssessmentToPublish(null);

        // Update active modal view if currently open
        if (selectedAssessment?.id === assessment.id) {
          setSelectedAssessment((prev) =>
            prev ? { ...prev, status: "PUBLISHED" } : null,
          );
        }
      },
      onError: (err: unknown) => {
        const apiErr = err as {
          data?: { message?: string };
          message?: string;
        };

        toast.add({
          title: "Failed to Publish Assessment",
          description:
            apiErr?.data?.message ||
            apiErr?.message ||
            "An error occurred while publishing the assessment.",
          type: "error",
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Layers className="size-3" />
              Company Assessments
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1.5">
            Manage Assessments
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Overview of technical benchmarks, scheduled test windows, and
            candidate proctoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5"
            id="refresh-assessments-btn"
          >
            <RefreshCw
              className={`size-3.5 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
            Refresh
          </Button>
          {onCreateClick && (
            <Button
              type="button"
              size="sm"
              onClick={onCreateClick}
              className="text-xs gap-1.5 font-semibold"
              id="create-assessment-cta-btn"
            >
              <Plus className="size-3.5" />
              Create Assessment
            </Button>
          )}
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 shadow-xs border-border/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Tests
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-foreground">
                {stats.total}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <FileCheck2 className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-xs border-border/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Drafts
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-amber-600 dark:text-amber-400">
                {stats.drafts}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <FileEdit className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-xs border-border/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Live & Active
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
                {stats.active}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Clock className="size-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-xs border-border/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Upcoming
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-sky-600 dark:text-sky-400">
                {stats.upcoming}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-500">
              <Calendar className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Toolbar: Search & Filters ── */}
      <Card className="shadow-xs border-border/70">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments by title or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
                id="search-assessments-input"
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

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(
                [
                  { key: "ALL", label: "All Tests" },
                  { key: "DRAFT", label: "Drafts" },
                  { key: "ACTIVE", label: "Active" },
                  { key: "UPCOMING", label: "Upcoming" },
                  { key: "EXPIRED", label: "Expired" },
                ] as const
              ).map(({ key, label }) => (
                <Button
                  key={key}
                  type="button"
                  variant={statusFilter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(key)}
                  className="text-xs h-8 px-3 rounded-lg"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Assessments Table ── */}
      <Card className="shadow-xs border-border/70 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[30%] min-w-[220px] text-xs font-semibold">
                  Assessment
                </TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">
                  Duration
                </TableHead>
                <TableHead className="text-xs font-semibold">
                  Passing Marks
                </TableHead>
                <TableHead className="min-w-[180px] text-xs font-semibold">
                  Schedule Window
                </TableHead>
                <TableHead className="text-xs font-semibold">
                  Proctoring
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
                    key={`skeleton-row-${id}`}
                    className="animate-pulse"
                  >
                    <TableCell>
                      <div className="h-4 bg-muted rounded-md w-3/4 mb-1.5" />
                      <div className="h-3 bg-muted/60 rounded-md w-1/2" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 bg-muted rounded-full w-16" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded-md w-14" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded-md w-16" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded-md w-32" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-muted rounded-md w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-7 bg-muted rounded-md w-14 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                /* Error State */
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <AlertCircle className="size-8 text-destructive" />
                      <p className="text-sm font-semibold text-foreground">
                        Failed to load assessments
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(error as Error)?.message ||
                          "Could not connect to the assessment service. Please check your network."}
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
              ) : filteredAssessments.length === 0 ? (
                /* Empty State */
                <TableRow>
                  <TableCell colSpan={7} className="h-56 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                      <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
                        <FileCheck2 className="size-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {searchTerm || statusFilter !== "ALL"
                          ? "No assessments match your filters"
                          : "No assessments created yet"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchTerm || statusFilter !== "ALL"
                          ? "Try adjusting your search criteria or resetting the status filter."
                          : "Create your first technical benchmark to evaluate candidates."}
                      </p>
                      {searchTerm || statusFilter !== "ALL" ? (
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
                      ) : (
                        onCreateClick && (
                          <Button
                            size="sm"
                            onClick={onCreateClick}
                            className="text-xs mt-2 gap-1.5"
                          >
                            <Plus className="size-3.5" />
                            Create Assessment
                          </Button>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                /* Data Rows */
                filteredAssessments.map((assessment) => (
                  <TableRow
                    key={assessment.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Assessment Info */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground leading-snug">
                          {assessment.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-[280px]">
                          {assessment.description || "No description provided."}
                        </p>
                        {assessment.id && (
                          <div className="flex items-center gap-1 pt-0.5">
                            <span className="text-[10px] font-mono text-muted-foreground/70">
                              ID: {assessment.id.slice(0, 8)}...
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyId(assessment.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy Assessment ID"
                            >
                              {copiedId === assessment.id ? (
                                <Check className="size-2.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-2.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <AssessmentStatusBadge
                        startTime={assessment.startTime}
                        endTime={assessment.endTime}
                        status={assessment.status}
                      />
                    </TableCell>

                    {/* Duration & Limit */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-foreground flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground" />
                          {assessment.durationMinutes} mins
                        </span>
                        <span
                          className={`inline-block text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                            assessment.isStrictTimeLimit
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              : "bg-muted text-muted-foreground border-border/60"
                          }`}
                        >
                          {assessment.isStrictTimeLimit ? "Strict" : "Flexible"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Marks & Attempts */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-xs font-medium text-foreground">
                          {assessment.passMarks} / {assessment.totalMarks} pts
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {assessment.allowedAttempts === 1
                            ? "1 attempt"
                            : `${assessment.allowedAttempts} attempts`}
                        </p>
                      </div>
                    </TableCell>

                    {/* Schedule */}
                    <TableCell>
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span className="w-10 text-[10px] uppercase font-mono">
                            Start:
                          </span>
                          <span className="text-foreground">
                            {formatDate(assessment.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span className="w-10 text-[10px] uppercase font-mono">
                            End:
                          </span>
                          <span className="text-foreground">
                            {formatDate(assessment.endTime)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Proctoring */}
                    <TableCell>
                      <ProctoringBadges
                        settings={assessment.proctoringSettings}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Publish action for DRAFT assessments */}
                        {assessment.status === "DRAFT" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setAssessmentToPublish(assessment)}
                            className="text-xs h-7 px-2 gap-1 font-medium text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700"
                            title="Publish this Assessment"
                          >
                            <Send className="size-3 text-emerald-600" />
                            Publish
                          </Button>
                        )}

                        {onAddProblemsClick && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => onAddProblemsClick(assessment)}
                            className="text-xs h-7 px-2 gap-1 font-medium"
                            title="Add Questions to this Assessment"
                          >
                            <Plus className="size-3 text-primary" />
                            Questions
                          </Button>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setCandidateInviteAssessment(assessment)
                          }
                          className="text-xs h-7 px-2 gap-1 font-medium text-sky-600 border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-700"
                          title="Invite Candidates"
                        >
                          <UserPlus className="size-3 text-sky-600" />
                          Invite
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAssessment(assessment)}
                          className="text-xs h-7 px-2.5 gap-1"
                        >
                          <Eye className="size-3 text-muted-foreground" />
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Publish Confirmation Modal ── */}
      {assessmentToPublish && (
        <Dialog
          open={Boolean(assessmentToPublish)}
          onOpenChange={(open) => !open && setAssessmentToPublish(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Send className="size-4 text-emerald-600" />
                Publish Assessment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1">
                Are you sure you want to publish{" "}
                <strong>&quot;{assessmentToPublish.title}&quot;</strong>? Once
                published, the test becomes active and accessible to candidates
                during the scheduled window.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={publishMutation.isPending}
                onClick={() => setAssessmentToPublish(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={publishMutation.isPending}
                onClick={() => handleConfirmPublish(assessmentToPublish)}
                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {publishMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    Confirm & Publish
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Assessment Details Modal ── */}
      {selectedAssessment && (
        <Dialog
          open={Boolean(selectedAssessment)}
          onOpenChange={(open) => !open && setSelectedAssessment(null)}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AssessmentStatusBadge
                  startTime={selectedAssessment.startTime}
                  endTime={selectedAssessment.endTime}
                  status={selectedAssessment.status}
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedAssessment.id}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground mt-1">
                {selectedAssessment.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedAssessment.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Scoring & Limits Grid */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40 border border-border/70 text-xs">
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Total Marks
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {selectedAssessment.totalMarks}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Pass Marks
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {selectedAssessment.passMarks}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Attempts Allowed
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {selectedAssessment.allowedAttempts}
                  </p>
                </div>
              </div>

              {/* Timing */}
              <div className="p-3 rounded-lg border border-border/70 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    Duration
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedAssessment.durationMinutes} Minutes (
                    {selectedAssessment.isStrictTimeLimit
                      ? "Strict"
                      : "Flexible"}
                    )
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Window Opens</span>
                  <span className="text-foreground">
                    {formatDate(selectedAssessment.startTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Window Closes</span>
                  <span className="text-foreground">
                    {formatDate(selectedAssessment.endTime)}
                  </span>
                </div>
              </div>

              {/* Anti-Cheating Settings */}
              <div className="p-3 rounded-lg border border-border/70 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground pb-1 border-b border-border/40">
                  <Shield className="size-3.5 text-primary" />
                  Anti-Cheating Proctoring Safeguards
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span>Fullscreen Enforced</span>
                    <span
                      className={`font-semibold ${
                        selectedAssessment.proctoringSettings?.requireFullscreen
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {selectedAssessment.proctoringSettings?.requireFullscreen
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span>Block Copy/Paste</span>
                    <span
                      className={`font-semibold ${
                        selectedAssessment.proctoringSettings?.blockCopyPaste
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {selectedAssessment.proctoringSettings?.blockCopyPaste
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span>Track Focus Loss</span>
                    <span
                      className={`font-semibold ${
                        selectedAssessment.proctoringSettings?.trackFocusLoss
                          ? "text-emerald-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {selectedAssessment.proctoringSettings?.trackFocusLoss
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                    <span>Tab Switch Limit</span>
                    <span
                      className={`font-semibold ${
                        selectedAssessment.proctoringSettings?.trackTabSwitches
                          ? "text-amber-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {selectedAssessment.proctoringSettings?.trackTabSwitches
                        ? `Max ${selectedAssessment.proctoringSettings.maxTabSwitches}`
                        : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssessment(null)}
                className="text-xs"
              >
                Close
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyId(selectedAssessment.id)}
                className="text-xs gap-1.5"
              >
                <Copy className="size-3.5" />
                Copy ID
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCandidateInviteAssessment(selectedAssessment);
                }}
                className="text-xs gap-1.5 text-sky-600 border-sky-500/30 hover:bg-sky-500/10"
              >
                <UserPlus className="size-3.5 text-sky-600" />
                Invite Candidates
              </Button>

              {/* Publish button inside Details dialog for Drafts */}
              {selectedAssessment.status === "DRAFT" && (
                <Button
                  size="sm"
                  onClick={() => setAssessmentToPublish(selectedAssessment)}
                  className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <Send className="size-3.5" />
                  Publish Assessment
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Candidate Invite Modal ── */}
      <InviteCandidateDialog
        assessment={candidateInviteAssessment}
        open={Boolean(candidateInviteAssessment)}
        onOpenChange={(open) => !open && setCandidateInviteAssessment(null)}
      />
    </div>
  );
}

export default GetAllAssessment;
