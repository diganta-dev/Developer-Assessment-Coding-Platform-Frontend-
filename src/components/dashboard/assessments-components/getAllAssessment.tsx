"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  Calendar,
  Check,
  Clock,
  Copy,
  CopyX,
  Eye,
  FileCheck2,
  FileEdit,
  FileText,
  Layers,
  Loader2,
  Maximize2,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
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
  useGetMyAssessments,
  usePublishAssessment,
} from "@/hook/assessment.hook";
import type { IAssessment } from "@/types/assessment.type";
import { useGetMe } from "@/hook";
import { isUserAuthorized } from "@/utils";
import { CompanyMemberRole, UserRole } from "@/types";
import { AssessmentInvitationsDialog } from "./assessment-invitations-dialog";
import { InviteCandidateDialog } from "./invite-candidate-dialog";
import { PublishResultsDialog } from "./publish-results-dialog";
import { PublishAssessmentDialog } from "./publish-assessment-dialog";
import { SingleAssessmentDialog } from "./single-assessment-dialog";
import { EditAssessmentDialog } from "./edit-assessment-dialog";
import { DeleteAssessmentDialog } from "./delete-assessment-dialog";
import { AssessmentAttemptsDialog } from "./assessment-attempts-dialog";
import { AssessmentResultsDialog } from "./assessment-results-dialog";
import { AssessmentLeaderboardDialog } from "./assessment-leaderboard-dialog";
import { Settings2 } from "lucide-react";


interface GetAllAssessmentProps {
  onCreateClick?: () => void;
  onAddProblemsClick?: (assessment: IAssessment) => void;
}

type StatusFilterType =
  | "ALL"
  | "DRAFT"
  | "PUBLISHED"
  | "ACTIVE"
  | "UPCOMING"
  | "EXPIRED";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function resolveAssessmentStatus(item: IAssessment): {
  key: "DRAFT" | "PUBLISHED" | "ACTIVE" | "UPCOMING" | "EXPIRED";
  label: string;
  variant: "draft" | "published" | "active" | "upcoming" | "expired";
} {
  // 1. DRAFT status
  if (item.status === "DRAFT") {
    return { key: "DRAFT", label: "Draft", variant: "draft" };
  }

  const startStr = item.startDate;
  const endStr = item.endDate;
  const now = Date.now();

  // 2. Deadline has passed or status is EXPIRED / COMPLETED / ARCHIVED
  if (
    item.status === "EXPIRED" ||
    item.status === "COMPLETED" ||
    item.status === "ARCHIVED" ||
    (endStr && new Date(endStr).getTime() <= now)
  ) {
    return {
      key: "EXPIRED",
      label:
        item.status === "COMPLETED"
          ? "Completed"
          : item.status === "ARCHIVED"
            ? "Archived"
            : "Expired",
      variant: "expired",
    };
  }

  // 3. ACTIVE status (Candidate attempt taken / exam actively in progress)
  if (item.status === "ACTIVE") {
    return { key: "ACTIVE", label: "Live & Active", variant: "active" };
  }

  // 4. Future start date check
  if (startStr && new Date(startStr).getTime() > now) {
    return { key: "UPCOMING", label: "Upcoming", variant: "upcoming" };
  }

  // 5. PUBLISHED status (Published & waiting for candidate attempts)
  if (item.status === "PUBLISHED") {
    return { key: "PUBLISHED", label: "Published", variant: "published" };
  }

  return {
    key: "PUBLISHED",
    label: item.status || "Configured",
    variant: "published",
  };
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

function getPassingMarks(assessment?: IAssessment | null): number {
  if (!assessment) return 0;
  if (
    assessment.passingScore !== null &&
    assessment.passingScore !== undefined
  ) {
    return assessment.passingScore;
  }
  return assessment.totalMarks > 0
    ? Math.round(assessment.totalMarks * 0.5)
    : 0;
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function AssessmentStatusBadge({
  assessment,
  status,
}: {
  assessment?: IAssessment;
  status?: string;
}) {
  const item: IAssessment =
    assessment ||
    ({
      status,
    } as IAssessment);

  const { label, variant } = resolveAssessmentStatus(item);

  if (variant === "draft") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
        <span className="size-1.5 rounded-full bg-amber-500" />
        Draft
      </span>
    );
  }

  if (variant === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        Live & Active
      </span>
    );
  }

  if (variant === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
        <span className="size-1.5 rounded-full bg-indigo-500" />
        Published
      </span>
    );
  }

  if (variant === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
        <span className="size-1.5 rounded-full bg-sky-500" />
        Upcoming
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-muted text-muted-foreground border-border/80">
      <span className="size-1.5 rounded-full bg-muted-foreground/50" />
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
  const [assessmentToEdit, setAssessmentToEdit] =
    useState<IAssessment | null>(null);
  const [assessmentToPublish, setAssessmentToPublish] =
    useState<IAssessment | null>(null);
  const [candidateInviteAssessment, setCandidateInviteAssessment] =
    useState<IAssessment | null>(null);
  const [invitationsAssessment, setInvitationsAssessment] =
    useState<IAssessment | null>(null);
  const [attemptsAssessment, setAttemptsAssessment] =
    useState<IAssessment | null>(null);
  const [assessmentForResults, setAssessmentForResults] =
    useState<IAssessment | null>(null);
  const [assessmentForLeaderboard, setAssessmentForLeaderboard] =
    useState<IAssessment | null>(null);
  const [assessmentToPublishResults, setAssessmentToPublishResults] =
    useState<IAssessment | null>(null);
  const [assessmentToDelete, setAssessmentToDelete] =
    useState<IAssessment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: meData } = useGetMe();
  const currentUser = meData?.data;
  const canPublishResults = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
    CompanyMemberRole.ASSESSMENT_CREATOR,
  ]);

  const canManageAssessments = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
    CompanyMemberRole.ASSESSMENT_CREATOR,
  ]);

  const canDeleteAssessments = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
  ]);

  const canViewAttempts = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
    CompanyMemberRole.ASSESSMENT_CREATOR,
    CompanyMemberRole.EVALUATOR,
  ]);

  const canViewResults = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
    CompanyMemberRole.ASSESSMENT_CREATOR,
    CompanyMemberRole.EVALUATOR,
  ]);

  const userRole = currentUser?.role;
  const memberRole = currentUser?.memberRole;

  const isAdmin =
    userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
  const isCompanyOwner =
    memberRole === CompanyMemberRole.COMPANY_OWNER;
  const isCompanyAdmin =
    memberRole === CompanyMemberRole.COMPANY_ADMIN;
  const isCreator =
    memberRole === CompanyMemberRole.ASSESSMENT_CREATOR;
  const isEvaluator =
    memberRole === CompanyMemberRole.EVALUATOR ||
    userRole === (CompanyMemberRole.EVALUATOR as string);

  const roleBadgeLabel = isAdmin
    ? "Platform Assessments (Admin Oversight)"
    : isCompanyOwner
      ? "Company Assessments (Owner)"
      : isCompanyAdmin
        ? "Company Assessments (Admin)"
        : isCreator
          ? "My Created Assessments (Creator)"
          : isEvaluator
            ? "My Assigned Assessments (Evaluator)"
            : "My Assessments";

  const roleHeading = isEvaluator
    ? "Assigned Assessments"
    : isAdmin
      ? "Assessments Oversight"
      : isCompanyOwner || isCompanyAdmin
        ? "Company Assessments"
        : isCreator
          ? "Assessment Builder & Tests"
          : "Manage Assessments";

  const roleSubtitle = isEvaluator
    ? "Browse assigned candidate benchmarks, verify proctoring policies, and review candidate grading reports."
    : isAdmin
      ? "Platform-wide assessment oversight, proctoring supervision, and official result publishing."
      : isCompanyOwner || isCompanyAdmin
        ? "Manage company assessment benchmarks, invite candidates, and monitor live test windows."
        : isCreator
          ? "Design coding assessments, curate question banks, invite candidate cohorts, and publish test results."
          : "Overview of technical benchmarks, scheduled test windows, and candidate proctoring.";

  // TanStack Query to fetch staff assessments (Admin, Owner, Admin, Creator, Evaluator)
  const { data, isLoading, isError, error, isFetching, refetch } =
    useGetMyAssessments();

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

      const computed = resolveAssessmentStatus(item);
      return computed.key === statusFilter;
    });
  }, [assessments, searchTerm, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    let drafts = 0;
    let published = 0;
    let active = 0;
    let upcoming = 0;
    let expired = 0;

    for (const a of assessments) {
      const computed = resolveAssessmentStatus(a);
      if (computed.key === "DRAFT") drafts++;
      else if (computed.key === "PUBLISHED") published++;
      else if (computed.key === "ACTIVE") active++;
      else if (computed.key === "UPCOMING") upcoming++;
      else if (computed.key === "EXPIRED") expired++;
    }

    return {
      total: assessments.length,
      drafts,
      published,
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
        queryClient.invalidateQueries({ queryKey: ["my-assessments"] });
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
              {roleBadgeLabel}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1.5">
            {roleHeading}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {roleSubtitle}
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
          {canManageAssessments && onCreateClick && (
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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
                Published
              </p>
              <h3 className="text-2xl font-bold tracking-tight mt-1 text-indigo-600 dark:text-indigo-400">
                {stats.published}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Send className="size-5" />
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
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
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
            <div className="flex flex-wrap items-center gap-1.5 shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(
                [
                  { key: "ALL", label: "All Tests" },
                  { key: "DRAFT", label: "Drafts" },
                  { key: "PUBLISHED", label: "Published" },
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
                  className="text-xs h-8 px-3 rounded-lg font-medium transition-all cursor-pointer"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Assessments Table ── */}
      <Card className="shadow-xs border-border/70 overflow-hidden min-h-[360px]">
        <div className="overflow-x-auto [scrollbar-width:thin]">
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-semibold text-foreground leading-snug">
                            {assessment.title}
                          </p>
                          {assessment.company?.name && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-muted/80 text-muted-foreground border border-border/60">
                              {assessment.company.name}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-[280px]">
                          {assessment.description || "No description provided."}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                          {assessment.id && (
                            <div className="flex items-center gap-1">
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
                          {Boolean(
                            assessment._count?.problems ||
                              assessment.problems?.length,
                          ) && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              •{" "}
                              {assessment._count?.problems ||
                                assessment.problems?.length}{" "}
                              Problems
                            </span>
                          )}
                          {Boolean(assessment.creator?.name) && (
                            <span className="text-[10px] text-muted-foreground/80">
                              • by {assessment.creator?.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <AssessmentStatusBadge assessment={assessment} />
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
                          {getPassingMarks(assessment)} /{" "}
                          {assessment.totalMarks} pts
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {(assessment.allowedAttempts ||
                            assessment.settings?.maxAttempts ||
                            1) === 1
                            ? "1 attempt"
                            : `${
                                assessment.allowedAttempts ||
                                assessment.settings?.maxAttempts ||
                                1
                              } attempts`}
                        </p>
                      </div>
                    </TableCell>

                    {/* Schedule */}
                    <TableCell>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="w-10 text-[10px] uppercase font-mono font-semibold text-muted-foreground/80">
                            Start:
                          </span>
                          <span className="text-foreground font-medium">
                            {formatDate(
                              assessment.startDate || assessment.createdAt,
                              "Immediate",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="w-10 text-[10px] uppercase font-mono font-semibold text-muted-foreground/80">
                            End:
                          </span>
                          <span className="text-foreground font-medium">
                            {formatDate(assessment.endDate, "No Expiry / Open")}
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
                      {(() => {
                        const isExpired =
                          resolveAssessmentStatus(assessment).key === "EXPIRED";

                        return (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Publish action for DRAFT assessments */}
                            {canManageAssessments &&
                              assessment.status === "DRAFT" &&
                              !isExpired && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setAssessmentToPublish(assessment)
                                  }
                                  className="text-xs h-7 px-2 gap-1 font-medium text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700"
                                  title="Publish this Assessment"
                                >
                                  <Send className="size-3 text-emerald-600" />
                                  Publish
                                </Button>
                              )}

                            {canManageAssessments &&
                              onAddProblemsClick &&
                              !isExpired && (
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

                            {canManageAssessments && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={isExpired}
                                onClick={() =>
                                  !isExpired &&
                                  setCandidateInviteAssessment(assessment)
                                }
                                className={`text-xs h-7 px-2 gap-1 font-medium ${
                                  isExpired
                                    ? "opacity-50 cursor-not-allowed text-muted-foreground border-border/40"
                                    : "text-sky-600 border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-700"
                                }`}
                                title={
                                  isExpired
                                    ? "Assessment deadline has passed"
                                    : "Invite Candidates"
                                }
                              >
                                <UserPlus
                                  className={`size-3 ${
                                    isExpired
                                      ? "text-muted-foreground"
                                      : "text-sky-600"
                                  }`}
                                />
                                Invite
                              </Button>
                            )}

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setInvitationsAssessment(assessment)
                              }
                              className="text-xs h-7 px-2 gap-1 font-medium text-indigo-600 border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-700 cursor-pointer"
                              title="View Invited Candidates & Status"
                            >
                              <Users className="size-3 text-indigo-600" />
                              Invitations
                            </Button>

                            {/* Candidate Attempts action (Admin, Owner, Admin, Creator, Evaluator) */}
                            {canViewAttempts && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setAttemptsAssessment(assessment)
                                }
                                className="text-xs h-7 px-2 gap-1 font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                                title="View candidate test sessions and submitted attempts"
                                id={`view-attempts-${assessment.id}-btn`}
                              >
                                <FileCheck2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                                Attempts
                              </Button>
                            )}

                            {/* Results & Leaderboard action (Admin / Company Owner / Company Admin / Assessment Creator / Evaluator) */}
                            {canViewResults &&
                              assessment.status !== "DRAFT" && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setAssessmentForResults(assessment)
                                  }
                                  className="text-xs h-7 px-2 gap-1 font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 cursor-pointer"
                                  title="View Assessment Results"
                                  id={`view-results-${assessment.id}-btn`}
                                >
                                  <Award className="size-3 text-emerald-600 dark:text-emerald-400" />
                                  Results
                                </Button>
                              )}

                            {/* Leaderboard Action */}
                            {canViewResults &&
                              assessment.status !== "DRAFT" && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setAssessmentForLeaderboard(assessment)
                                  }
                                  className="text-xs h-7 px-2 gap-1 font-medium text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-700 cursor-pointer"
                                  title="View Assessment Leaderboard"
                                  id={`view-leaderboard-${assessment.id}-btn`}
                                >
                                  <Trophy className="size-3 text-amber-600 dark:text-amber-400" />
                                  Leaderboard
                                </Button>
                              )}

                            {/* Publish Results (Direct Route) Action (Admin / Company Owner / Company Admin / Assessment Creator) */}
                            {canPublishResults &&
                              assessment.status !== "DRAFT" && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setAssessmentToPublishResults(assessment)
                                  }
                                  className="text-xs h-7 px-2 gap-1 font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 cursor-pointer"
                                  title="Publish Assessment Results (Direct Route)"
                                  id={`publish-results-${assessment.id}-btn`}
                                >
                                  <Megaphone className="size-3 text-emerald-600 dark:text-emerald-400" />
                                  Publish Results
                                </Button>
                              )}

                              {/* Evaluator Report shortcut */}
                              {isEvaluator && (
                                <Link
                                  href="/evaluator/report"
                                  className="inline-flex items-center text-xs h-7 px-2 gap-1 font-medium text-primary border border-primary/30 rounded-md hover:bg-primary/10 transition-colors"
                                  title="Candidate Reports"
                                >
                                  <FileText className="size-3" />
                                  Reports
                                </Link>
                              )}

                            {canManageAssessments && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAssessmentToEdit(assessment)}
                                className="text-xs h-7 px-2.5 gap-1 cursor-pointer"
                              >
                                <Settings2 className="size-3 text-muted-foreground" />
                                Edit
                              </Button>
                            )}

                            {canDeleteAssessments && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAssessmentToDelete(assessment)}
                                className="text-xs h-7 px-2.5 gap-1 cursor-pointer text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                title="Delete Assessment"
                                id={`delete-assessment-${assessment.id}-btn`}
                              >
                                <Trash2 className="size-3 text-destructive" />
                                Delete
                              </Button>
                            )}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAssessment(assessment)}
                              className="text-xs h-7 px-2.5 gap-1 cursor-pointer"
                            >
                              <Eye className="size-3 text-muted-foreground" />
                              Details
                            </Button>
                          </div>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Publish Assessment Dialog (Direct Route) ── */}
      <PublishAssessmentDialog
        assessment={assessmentToPublish}
        open={Boolean(assessmentToPublish)}
        onOpenChange={(open) => !open && setAssessmentToPublish(null)}
        onSuccess={() => {
          if (selectedAssessment?.id === assessmentToPublish?.id) {
            setSelectedAssessment((prev) =>
              prev ? { ...prev, status: "PUBLISHED" } : null,
            );
          }
        }}
      />

      {/* ── Single Assessment Details Dialog (Role-Aware) ── */}
      <SingleAssessmentDialog
        assessmentId={selectedAssessment?.id || null}
        open={Boolean(selectedAssessment)}
        onOpenChange={(open) => !open && setSelectedAssessment(null)}
        onAddProblemsClick={onAddProblemsClick}
      />

      {/* ── Candidate Invite Modal ── */}
      <InviteCandidateDialog
        assessment={candidateInviteAssessment}
        open={Boolean(candidateInviteAssessment)}
        onOpenChange={(open) => !open && setCandidateInviteAssessment(null)}
      />

      {/* ── Candidate Invitations Modal ── */}
      <AssessmentInvitationsDialog
        assessment={invitationsAssessment}
        open={Boolean(invitationsAssessment)}
        onOpenChange={(open) => !open && setInvitationsAssessment(null)}
        onInviteMore={(a) => setCandidateInviteAssessment(a)}
      />

      {/* ── Publish Results Modal ── */}
      <PublishResultsDialog
        assessment={assessmentToPublishResults}
        open={Boolean(assessmentToPublishResults)}
        onOpenChange={(open) => !open && setAssessmentToPublishResults(null)}
        onSuccess={() => refetch()}
      />

      {/* ── Edit Assessment Dialog ── */}
      <EditAssessmentDialog
        // @ts-ignore
        assessment={assessmentToEdit}
        open={Boolean(assessmentToEdit)}
        onOpenChange={(open) => !open && setAssessmentToEdit(null)}
      />

      {/* ── Delete Assessment Dialog ── */}
      <DeleteAssessmentDialog
        assessment={assessmentToDelete}
        open={Boolean(assessmentToDelete)}
        onOpenChange={(open) => !open && setAssessmentToDelete(null)}
      />

      {/* ── Assessment Attempts Dialog ── */}
      <AssessmentAttemptsDialog
        assessment={attemptsAssessment}
        open={Boolean(attemptsAssessment)}
        onOpenChange={(open) => !open && setAttemptsAssessment(null)}
      />

      {/* ── Assessment Results Dialog ── */}
      <AssessmentResultsDialog
        assessment={assessmentForResults}
        open={Boolean(assessmentForResults)}
        onOpenChange={(open) => !open && setAssessmentForResults(null)}
      />

      {/* ── Assessment Leaderboard Dialog ── */}
      <AssessmentLeaderboardDialog
        assessmentId={assessmentForLeaderboard?.id ?? null}
        assessmentTitle={assessmentForLeaderboard?.title}
        assessment={assessmentForLeaderboard}
        open={Boolean(assessmentForLeaderboard)}
        onOpenChange={(open) => !open && setAssessmentForLeaderboard(null)}
      />
    </div>
  );
}

export default GetAllAssessment;
