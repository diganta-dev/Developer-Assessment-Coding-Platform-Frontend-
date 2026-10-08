"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  CopyX,
  ExternalLink,
  Eye,
  FileCheck2,
  FileQuestion,
  FileText,
  Globe,
  Layers,
  Lock,
  Mail,
  Maximize2,
  Megaphone,
  Play,
  Plus,
  RefreshCw,
  Send,
  Settings2,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  Trophy,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | string;
  className?: string;
}) {
  const variantStyles =
    variant === "outline"
      ? "border border-border/80 text-foreground"
      : variant === "secondary"
        ? "bg-muted text-muted-foreground border-transparent"
        : "bg-primary text-primary-foreground border-transparent";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useGetMe } from "@/hook";
import {
  useGetSingleAssessment,
  useGetSingleAssessmentDirectRoute,
  usePublishAssessment,
} from "@/hook/assessment.hook";
import { CompanyMemberRole, UserRole } from "@/types";
import type {
  IAssessment,
  ISingleAssessmentDetail,
  ISingleAssessmentProblemItem,
} from "@/types/assessment.type";
import { isUserAuthorized } from "@/utils";
import { AssessmentInvitationsDialog } from "./assessment-invitations-dialog";
import { InviteCandidateDialog } from "./invite-candidate-dialog";
import { PublishResultsDialog } from "./publish-results-dialog";
import { EditAssessmentDialog } from "./edit-assessment-dialog";
import { DeleteAssessmentDialog } from "./delete-assessment-dialog";
import { AssessmentAttemptsDialog } from "./assessment-attempts-dialog";
import { AssessmentResultsDialog } from "./assessment-results-dialog";
import { AssessmentLeaderboardDialog } from "./assessment-leaderboard-dialog";
import { StartAttemptDialog } from "./start-attempt-dialog";
import { PublishAssessmentDialog } from "./publish-assessment-dialog";

export interface SingleAssessmentDialogProps {
  assessmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProblemsClick?: (assessment: IAssessment) => void;
}

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

function getInitials(name?: string | null, fallback = "CO"): string {
  if (!name?.trim()) return fallback;
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function SingleAssessmentDialog({
  assessmentId,
  open,
  onOpenChange,
  onAddProblemsClick,
}: SingleAssessmentDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "PROBLEMS" | "TELEMETRY"
  >("OVERVIEW");
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(
    null,
  );
  const [copiedId, setCopiedId] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Sub-dialogs state for staff actions
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [invitationsModalOpen, setInvitationsModalOpen] = useState(false);
  const [attemptsModalOpen, setAttemptsModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [publishResultsModalOpen, setPublishResultsModalOpen] = useState(false);
  const [startAttemptModalOpen, setStartAttemptModalOpen] = useState(false);
  const [publishAssessmentModalOpen, setPublishAssessmentModalOpen] = useState(false);

  // TanStack Query for User Identity & Permissions
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

  const canDeleteAssessments = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
  ]);

  const canViewResults = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
    CompanyMemberRole.ASSESSMENT_CREATOR,
    CompanyMemberRole.EVALUATOR,
  ]);

  const canPublishResults = canManageAssessments;
  const canInviteCandidates = canDeleteAssessments;

  // Single Assessment Query (Direct Route GET /assessment/:id)
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetSingleAssessmentDirectRoute(assessmentId || "");

  const errorMessage = useMemo(() => {
    if (!error) return null;
    const apiErr = error as { data?: { message?: string }; message?: string };
    return (
      apiErr?.data?.message ||
      apiErr?.message ||
      "Could not retrieve assessment information. Please verify your permissions or try again."
    );
  }, [error]);

  const isForbiddenError = useMemo(() => {
    if (!errorMessage) return false;
    const lower = errorMessage.toLowerCase();
    return (
      lower.includes("permission") ||
      lower.includes("access") ||
      lower.includes("forbidden") ||
      lower.includes("organization")
    );
  }, [errorMessage]);

  const assessment: ISingleAssessmentDetail | null = useMemo(() => {
    if (!apiResponse) return null;
    const raw = (apiResponse as { data?: unknown })?.data ?? apiResponse;
    return raw as ISingleAssessmentDetail;
  }, [apiResponse]);

  // Publish Mutation (pure hook per AGENTS.md)
  const publishMutation = usePublishAssessment();

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.add({
      title: "Assessment ID Copied",
      description: "Identifier copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePublish = (a: ISingleAssessmentDetail) => {
    publishMutation.mutate(a.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["assessment-single", a.id],
        });
        queryClient.invalidateQueries({ queryKey: ["my-assessments"] });
        queryClient.invalidateQueries({ queryKey: ["company-assessments"] });
        queryClient.invalidateQueries({ queryKey: ["assessments"] });

        toast.add({
          title: "Assessment Published",
          description: `"${a.title}" is now published and ready for candidate evaluations.`,
          type: "success",
        });
      },
      onError: (err: unknown) => {
        const apiErr = err as { data?: { message?: string }; message?: string };
        toast.add({
          title: "Failed to Publish",
          description:
            apiErr?.data?.message ||
            apiErr?.message ||
            "Could not publish assessment.",
          type: "error",
        });
      },
    });
  };

  // Status computation
  const statusConfig = useMemo(() => {
    if (!assessment) {
      return {
        label: "Unknown",
        variant: "secondary" as const,
        bg: "bg-muted text-muted-foreground",
      };
    }

    const st = assessment.status?.toUpperCase() || "DRAFT";
    const now = Date.now();
    const endStr = assessment.endDate;
    const isExpired = endStr && new Date(endStr).getTime() <= now;

    if (st === "DRAFT") {
      return {
        label: "Draft",
        variant: "outline" as const,
        bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    }
    if (isExpired || st === "EXPIRED" || st === "COMPLETED") {
      return {
        label: st === "COMPLETED" ? "Completed" : "Expired",
        variant: "secondary" as const,
        bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      };
    }
    if (st === "ACTIVE") {
      return {
        label: "Live & Active",
        variant: "default" as const,
        bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      };
    }
    return {
      label: "Published",
      variant: "default" as const,
      bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    };
  }, [assessment]);

  // Problems breakdown counts
  const problemCounts = useMemo(() => {
    const list = assessment?.problems || [];
    let mcq = 0;
    let coding = 0;
    let written = 0;
    for (const p of list) {
      const type = p.problem?.type?.toUpperCase();
      if (type === "MCQ") mcq++;
      else if (type === "CODING") coding++;
      else if (type === "WRITTEN") written++;
    }
    return { total: list.length, mcq, coding, written };
  }, [assessment?.problems]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 [scrollbar-width:thin]">
          {/* ── Dialog Header Banner ── */}
          <div className="relative p-5 sm:p-6 bg-gradient-to-br from-primary/5 via-muted/40 to-background border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg}`}
                  >
                    <span className="size-1.5 rounded-full bg-current animate-pulse" />
                    {statusConfig.label}
                  </span>

                  {/* Role Perspective Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border/60">
                    {isCandidate
                      ? "Candidate Briefing"
                      : isAdmin
                        ? "Admin Oversight"
                        : isEvaluator
                          ? "Evaluator Inspection"
                          : isCompanyOwner
                            ? "Company Owner View"
                            : isCompanyAdmin
                              ? "Company Admin View"
                              : "Creator Workspace"}
                  </span>

                  {/* Company Identifier if provided */}
                  {assessment?.company?.name && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                      <Globe className="size-3" />
                      {assessment.company.name}
                    </span>
                  )}
                </div>

                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {isLoading ? (
                    <Skeleton className="h-7 w-64" />
                  ) : (
                    assessment?.title || "Assessment Details"
                  )}
                </DialogTitle>

                <DialogDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {isLoading ? (
                    <Skeleton className="h-4 w-96 mt-1" />
                  ) : (
                    assessment?.description || "No description provided."
                  )}
                </DialogDescription>
              </div>

              {/* Action Toolbar on Header */}
              {assessment && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyId(assessment.id)}
                    className="text-xs h-8 px-2.5 gap-1.5 cursor-pointer"
                    title="Copy Assessment ID"
                  >
                    {copiedId ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5 text-muted-foreground" />
                    )}
                    <span className="font-mono text-[11px]">
                      {assessment.id.slice(0, 8)}...
                    </span>
                  </Button>

                  {canManageAssessments && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-xs h-8 px-2.5 gap-1.5 cursor-pointer text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-700"
                      title="Edit Assessment Details"
                    >
                      <Settings2 className="size-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  )}

                  {canDeleteAssessments && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="text-xs h-8 px-2.5 gap-1.5 cursor-pointer text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      title="Delete Assessment"
                      id="delete-single-assessment-toolbar-btn"
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                    title="Refresh Assessment"
                  >
                    <RefreshCw
                      className={`size-3.5 ${
                        isFetching ? "animate-spin text-primary" : ""
                      }`}
                    />
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            {assessment && (
              <div className="flex items-center gap-1 pt-4 mt-2 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setActiveTab("OVERVIEW")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "OVERVIEW"
                      ? "bg-background text-foreground shadow-xs border border-border/70"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <BookOpen className="size-3.5 text-primary" />
                  Overview & Policies
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("PROBLEMS")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "PROBLEMS"
                      ? "bg-background text-foreground shadow-xs border border-border/70"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Code2 className="size-3.5 text-primary" />
                  Problems Syllabus ({problemCounts.total})
                </button>

                {!isCandidate && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("TELEMETRY")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "TELEMETRY"
                        ? "bg-background text-foreground shadow-xs border border-border/70"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Users className="size-3.5 text-primary" />
                    Roster & Telemetry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Dialog Body ── */}
          <div className="p-5 sm:p-6 space-y-6">
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4 py-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-44 rounded-xl" />
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="py-12 text-center space-y-3">
                <div
                  className={`p-3 rounded-full w-fit mx-auto ${
                    isForbiddenError
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {isForbiddenError ? (
                    <ShieldAlert className="size-7" />
                  ) : (
                    <AlertCircle className="size-7" />
                  )}
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  {isForbiddenError
                    ? "Access Restricted / Permission Required"
                    : "Failed to load assessment details"}
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {errorMessage}
                </p>
                {isForbiddenError && isCandidate && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 max-w-sm mx-auto">
                    If this is a private company assessment, please ensure you have received an invitation from the hiring organization.
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="text-xs"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}

            {/* ── Tab: OVERVIEW ── */}
            {assessment && activeTab === "OVERVIEW" && (
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Duration */}
                  <Card className="p-3.5 shadow-2xs border-border/60">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-[11px] font-medium">Duration</span>
                      <Clock className="size-3.5 text-primary" />
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-foreground">
                        {assessment.durationMinutes} min
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {assessment.isStrictTimeLimit
                          ? "Strict auto-submit"
                          : "Flexible timer"}
                      </p>
                    </div>
                  </Card>

                  {/* Marks & Passing */}
                  <Card className="p-3.5 shadow-2xs border-border/60">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-[11px] font-medium">
                        Total Marks
                      </span>
                      <Award className="size-3.5 text-amber-500" />
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-foreground">
                        {assessment.totalMarks} pts
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        Pass: {assessment.passingScore ?? 0} pts
                      </p>
                    </div>
                  </Card>

                  {/* Allowed Attempts */}
                  <Card className="p-3.5 shadow-2xs border-border/60">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-[11px] font-medium">Attempts</span>
                      <FileCheck2 className="size-3.5 text-indigo-500" />
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-foreground">
                        {assessment.allowedAttempts ||
                          assessment.settings?.maxAttempts ||
                          1}{" "}
                        Allowed
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Per candidate
                      </p>
                    </div>
                  </Card>

                  {/* Question Count */}
                  <Card className="p-3.5 shadow-2xs border-border/60">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-[11px] font-medium">Questions</span>
                      <Code2 className="size-3.5 text-sky-500" />
                    </div>
                    <div className="mt-2">
                      <p className="text-lg font-bold text-foreground">
                        {problemCounts.total} Problems
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {problemCounts.mcq} MCQ • {problemCounts.coding} Coding
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Schedule Window */}
                <Card className="p-4 shadow-2xs border-border/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Calendar className="size-3.5 text-primary" />
                    Assessment Schedule & Testing Window
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground">Window Opens</span>
                      <span className="font-semibold text-foreground">
                        {formatDate(
                          assessment.startDate || assessment.createdAt,
                          "Immediate / Anytime",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground">Window Closes</span>
                      <span className="font-semibold text-foreground">
                        {formatDate(
                          assessment.endDate,
                          "No Deadline / Flexible",
                        )}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Anti-Cheating & Proctoring Protocol */}
                <Card className="p-4 shadow-2xs border-border/60 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-border/40">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <Shield className="size-3.5 text-primary" />
                      Anti-Cheating Proctoring Safeguards
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Active Telemetry Enforced
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {/* Fullscreen */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2">
                        <Maximize2 className="size-3.5 text-muted-foreground" />
                        <span>Fullscreen Enforcement</span>
                      </div>
                      <Badge
                        variant={
                          assessment.proctoringSettings?.requireFullscreen
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px] h-5"
                      >
                        {assessment.proctoringSettings?.requireFullscreen
                          ? "Required"
                          : "Optional"}
                      </Badge>
                    </div>

                    {/* Block Copy Paste */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2">
                        <CopyX className="size-3.5 text-muted-foreground" />
                        <span>Clipboard Blocked</span>
                      </div>
                      <Badge
                        variant={
                          assessment.proctoringSettings?.blockCopyPaste
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px] h-5"
                      >
                        {assessment.proctoringSettings?.blockCopyPaste
                          ? "Enforced"
                          : "Allowed"}
                      </Badge>
                    </div>

                    {/* Focus Loss */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="size-3.5 text-muted-foreground" />
                        <span>Focus Loss Monitored</span>
                      </div>
                      <Badge
                        variant={
                          assessment.proctoringSettings?.trackFocusLoss
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px] h-5"
                      >
                        {assessment.proctoringSettings?.trackFocusLoss
                          ? "Tracked"
                          : "Disabled"}
                      </Badge>
                    </div>

                    {/* Tab Switches */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2">
                        <Users className="size-3.5 text-muted-foreground" />
                        <span>Tab Switch Detection</span>
                      </div>
                      <Badge
                        variant={
                          assessment.proctoringSettings?.trackTabSwitches
                            ? "outline"
                            : "secondary"
                        }
                        className="text-[10px] h-5 border-amber-500/30 text-amber-600 dark:text-amber-400"
                      >
                        {assessment.proctoringSettings?.trackTabSwitches
                          ? `Max ${
                              assessment.proctoringSettings.maxTabSwitches ?? 3
                            } Switches`
                          : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Candidate Specific Instructions */}
                {isCandidate && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                      <Sparkles className="size-3.5" />
                      Candidate Exam Instructions
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                      <li>
                        Ensure you have a reliable internet connection before
                        starting.
                      </li>
                      <li>
                        Fullscreen mode is strictly monitored. Do not switch
                        tabs or leave the assessment screen.
                      </li>
                      <li>
                        Your code and written solutions are auto-saved in the
                        background.
                      </li>
                    </ul>
                  </div>
                )}

                {/* Organization & Creator Card (for Admin/Staff) */}
                {!isCandidate && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {assessment.company && (
                      <Card className="p-3.5 shadow-2xs border-border/60 space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarImage
                              src={assessment.company.logoUrl || ""}
                            />
                            <AvatarFallback className="text-[10px] font-bold">
                              {getInitials(assessment.company.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">
                              {assessment.company.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {assessment.company.email ||
                                assessment.company.website ||
                                "Hosting Organization"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}

                    {assessment.creator && (
                      <Card className="p-3.5 shadow-2xs border-border/60 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                            <User className="size-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              Created by {assessment.creator.name || "Staff"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {assessment.creator.email} •{" "}
                              {assessment.creator.role || "Author"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: PROBLEMS & SYLLABUS ── */}
            {assessment && activeTab === "PROBLEMS" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Assessment Problem Syllabus
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {isCandidate
                        ? "Review the problem sequence, marks distribution, and challenge types."
                        : "Inspect question rubrics, test cases, and solution benchmarks."}
                    </p>
                  </div>
                  {canManageAssessments && onAddProblemsClick && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onOpenChange(false);
                        onAddProblemsClick(assessment);
                      }}
                      className="text-xs h-7 px-2.5 gap-1.5 text-primary border-primary/30"
                    >
                      <Plus className="size-3" />
                      Add Problems
                    </Button>
                  )}
                </div>

                {assessment.problems.length === 0 ? (
                  <div className="py-12 text-center space-y-2 border border-dashed rounded-xl border-border/70">
                    <div className="p-3 rounded-full bg-muted/60 text-muted-foreground w-fit mx-auto">
                      <FileQuestion className="size-6" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      No problems added to this assessment yet
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      {canManageAssessments
                        ? "Curate challenges from your problem bank to evaluate candidate skills."
                        : "The assessment creator has not published questions yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assessment.problems.map((pItem, idx) => {
                      const prob = pItem.problem;
                      const isExpanded = expandedProblemId === pItem.id;

                      const typeColor =
                        prob.type === "CODING"
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                          : prob.type === "MCQ"
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

                      const diffColor =
                        prob.difficulty === "HARD"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          : prob.difficulty === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

                      return (
                        <Card
                          key={pItem.id || `prob-${idx}`}
                          className="border-border/70 transition-all overflow-hidden"
                        >
                          <div
                            onClick={() =>
                              setExpandedProblemId(
                                isExpanded ? null : pItem.id,
                              )
                            }
                            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center size-6 rounded-md bg-muted text-muted-foreground font-mono text-xs font-bold">
                                {pItem.questionOrder || idx + 1}
                              </span>

                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold text-foreground">
                                    {prob.title || `Problem #${idx + 1}`}
                                  </p>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${typeColor}`}
                                  >
                                    {prob.type}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${diffColor}`}
                                  >
                                    {prob.difficulty}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-[420px] mt-0.5">
                                  {prob.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-foreground font-mono">
                                {pItem.marks} pts
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="size-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="size-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Problem View */}
                          {isExpanded && (
                            <div className="p-4 pt-2 border-t border-border/50 bg-muted/15 space-y-3 text-xs">
                              <div className="space-y-1">
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                  Problem Statement
                                </p>
                                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                  {prob.description}
                                </p>
                              </div>

                              {/* MCQ Details */}
                              {prob.type === "MCQ" && prob.mcqQuestion && (
                                <div className="space-y-2 pt-2 border-t border-border/40">
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Multiple Choice Options
                                  </p>
                                  <div className="space-y-1.5">
                                    {prob.mcqQuestion.options?.map(
                                      (opt, optIdx) => {
                                        const isCorrect =
                                          !isCandidate && opt.isCorrect;
                                        return (
                                          <div
                                            key={opt.id || optIdx}
                                            className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                                              isCorrect
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium"
                                                : "bg-background border-border/60 text-foreground"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="size-5 rounded-full bg-muted/60 flex items-center justify-center font-mono text-[10px] font-bold">
                                                {String.fromCharCode(
                                                  65 + optIdx,
                                                )}
                                              </span>
                                              <span>{opt.optionText}</span>
                                            </div>
                                            {isCorrect && (
                                              <Badge className="text-[10px] bg-emerald-600 text-white">
                                                Correct Answer
                                              </Badge>
                                            )}
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>

                                  {!isCandidate &&
                                    prob.mcqQuestion.explanation && (
                                      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs mt-2">
                                        <span className="font-semibold text-primary">
                                          Explanation:{" "}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {prob.mcqQuestion.explanation}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              )}

                              {/* Coding Details */}
                              {prob.type === "CODING" && prob.codingQuestion && (
                                <div className="space-y-2 pt-2 border-t border-border/40">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                      Test Cases
                                    </p>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      {prob.codingQuestion.testCases?.length ??
                                        0}{" "}
                                      test cases visible
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    {prob.codingQuestion.testCases?.map(
                                      (tc, tcIdx) => (
                                        <div
                                          key={tc.id || tcIdx}
                                          className="p-2.5 rounded-lg bg-background border border-border/60 space-y-1.5 font-mono text-[11px]"
                                        >
                                          <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-bold text-muted-foreground">
                                              Case #{tcIdx + 1}
                                            </span>
                                            <Badge
                                              variant={
                                                tc.type === "PUBLIC"
                                                  ? "outline"
                                                  : "secondary"
                                              }
                                              className="text-[9px]"
                                            >
                                              {tc.type || "PUBLIC"}
                                            </Badge>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">
                                              Input:{" "}
                                            </span>
                                            <span className="text-foreground">
                                              {tc.input}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">
                                              Expected Output:{" "}
                                            </span>
                                            <span className="text-emerald-600 dark:text-emerald-400">
                                              {tc.expectedOutput}
                                            </span>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Written Details */}
                              {prob.type === "WRITTEN" &&
                                prob.writtenQuestion && (
                                  <div className="space-y-2 pt-2 border-t border-border/40">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                      Submission Guidelines
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {prob.writtenQuestion.guidelines ||
                                        "Provide a detailed written response."}
                                    </p>
                                    {prob.writtenQuestion.wordLimit && (
                                      <p className="text-[11px] text-muted-foreground font-mono">
                                        Word Limit:{" "}
                                        {prob.writtenQuestion.wordLimit} words
                                      </p>
                                    )}
                                    {!isCandidate &&
                                      prob.writtenQuestion.expectedAnswer && (
                                        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                                          <span className="font-semibold text-foreground">
                                            Rubric / Expected Answer:{" "}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {
                                              prob.writtenQuestion
                                                .expectedAnswer
                                            }
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: ROSTER & TELEMETRY (Staff Only) ── */}
            {assessment && activeTab === "TELEMETRY" && !isCandidate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Candidate Roster & Submissions Telemetry
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Track invited candidate engagement and overall testing
                      throughput.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card className="p-4 shadow-2xs border-border/60">
                    <p className="text-xs text-muted-foreground">
                      Invited Candidates
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-foreground mt-1">
                      {assessment._count?.invitations ?? 0}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setInvitationsModalOpen(true)}
                      className="text-xs h-7 mt-3 w-full gap-1 cursor-pointer"
                    >
                      <Users className="size-3 text-indigo-600" />
                      View Candidate Roster
                    </Button>
                  </Card>

                  <Card className="p-4 shadow-2xs border-border/60">
                    <p className="text-xs text-muted-foreground">
                      Candidate Attempts
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-foreground mt-1">
                      {assessment._count?.attempts ?? 0}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setAttemptsModalOpen(true)}
                        className="text-xs h-7 flex-1 gap-1 cursor-pointer bg-primary text-primary-foreground font-semibold"
                        id="view-attempts-telemetry-btn"
                      >
                        <FileCheck2 className="size-3" />
                        View Attempts
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setResultsModalOpen(true)}
                        disabled={assessment.status === "DRAFT"}
                        className="text-xs h-7 gap-1 cursor-pointer"
                        title="View Assessment Results & Leaderboard"
                        id="view-results-telemetry-btn"
                      >
                        <Award className="size-3 text-emerald-600" />
                        Results
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLeaderboardModalOpen(true)}
                        disabled={assessment.status === "DRAFT"}
                        className="text-xs h-7 gap-1 cursor-pointer"
                        title="View Assessment Leaderboard"
                        id="view-leaderboard-telemetry-btn"
                      >
                        <Trophy className="size-3 text-amber-600" />
                        Leaderboard
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4 shadow-2xs border-border/60">
                    <p className="text-xs text-muted-foreground">
                      Add to Roster
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-foreground mt-1">
                      + Invite
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setInviteModalOpen(true)}
                      disabled={statusConfig.label === "Expired"}
                      className="text-xs h-7 mt-3 w-full gap-1 bg-primary text-primary-foreground font-semibold cursor-pointer"
                    >
                      <UserPlus className="size-3" />
                      Invite Candidates
                    </Button>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* ── Dialog Action Footer ── */}
          {assessment && (
            <div className="p-4 sm:p-5 bg-muted/30 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Assessment ID:
                </span>{" "}
                <span className="font-mono">{assessment.id}</span>
              </div>

              <div className="flex items-center justify-end gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs cursor-pointer"
                >
                  Close
                </Button>

                {/* Candidate Action: Start or Go to Workspace */}
                {isCandidate && (
                  <div className="flex items-center gap-2">
                    {assessment.status !== "DRAFT" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setLeaderboardModalOpen(true)}
                        className="text-xs gap-1.5 font-medium text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                        id="candidate-view-leaderboard-btn"
                      >
                        <Trophy className="size-3.5 text-amber-600 dark:text-amber-400" />
                        Leaderboard
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setStartAttemptModalOpen(true)}
                      className="text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      id="candidate-take-assessment-btn"
                    >
                      <Play className="size-3.5 fill-current" />
                      Take Assessment
                    </Button>
                  </div>
                )}

                {/* Staff / Admin Actions */}
                {canManageAssessments && (
                  <>
                    {/* Publish Draft Action */}
                    {assessment.status === "DRAFT" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setPublishAssessmentModalOpen(true)}
                        className="text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        id="publish-draft-assessment-btn"
                      >
                        <Send className="size-3.5" />
                        Publish Assessment
                      </Button>
                    )}

                    {/* Invite Button (Admin / Company Owner / Company Admin) */}
                    {canInviteCandidates && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setInviteModalOpen(true)}
                        className="text-xs gap-1.5 font-medium text-sky-600 border-sky-500/30 hover:bg-sky-500/10 cursor-pointer"
                        id="invite-candidates-dialog-btn"
                        title="Invite Candidates (Direct Route)"
                      >
                        <UserPlus className="size-3.5 text-sky-600" />
                        Invite
                      </Button>
                    )}

                    {/* Invitations Roster Button */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setInvitationsModalOpen(true)}
                      className="text-xs gap-1.5 font-medium text-indigo-600 border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer"
                    >
                      <Users className="size-3.5 text-indigo-600" />
                      Invitations ({assessment._count?.invitations ?? 0})
                    </Button>

                    {/* Candidate Attempts Button */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setAttemptsModalOpen(true)}
                      className="text-xs gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                      id="view-attempts-footer-btn"
                    >
                      <FileCheck2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      Attempts ({assessment._count?.attempts ?? 0})
                    </Button>

                    {/* Publish Results Button (Direct Route) */}
                    {canPublishResults && assessment.status !== "DRAFT" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setPublishResultsModalOpen(true)}
                        className="text-xs gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                        title="Publish Results (Direct Route)"
                        id="publish-assessment-results-dialog-btn"
                      >
                        <Megaphone className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        Publish Results
                      </Button>
                    )}

                    {/* Assessment Results */}
                    {canViewResults && assessment.status !== "DRAFT" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setResultsModalOpen(true)}
                        className="text-xs gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                        id="view-results-footer-btn"
                      >
                        <Award className="size-3.5 text-emerald-600" />
                        Results
                      </Button>
                    )}

                    {/* Assessment Leaderboard (Staff or Published) */}
                    {(canViewResults || assessment.isResultPublished) &&
                      assessment.status !== "DRAFT" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setLeaderboardModalOpen(true)}
                          className="text-xs gap-1.5 font-medium text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                          id="view-leaderboard-footer-btn"
                        >
                          <Trophy className="size-3.5 text-amber-600 dark:text-amber-400" />
                          Leaderboard
                        </Button>
                      )}

                    {/* Delete Assessment Action (Admin / Company Owner / Company Admin) */}
                    {canDeleteAssessments && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="text-xs gap-1.5 font-medium text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                        id="delete-single-assessment-footer-btn"
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                        Delete
                      </Button>
                    )}
                  </>
                )}

                {/* Evaluator Shortcuts */}
                {isEvaluator && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setInvitationsModalOpen(true)}
                      className="text-xs gap-1.5 font-medium text-indigo-600 border-indigo-500/30 cursor-pointer"
                    >
                      <Users className="size-3.5 text-indigo-600" />
                      Invitations
                    </Button>
                    <Link
                      href="/evaluator/report"
                      className="inline-flex items-center text-xs h-8 px-3 gap-1.5 font-medium text-primary border border-primary/30 rounded-md hover:bg-primary/10 transition-colors"
                    >
                      <FileText className="size-3.5" />
                      Candidate Reports
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Sub-dialogs (Staff / Admin) ── */}
      {assessment && (
        <>
          {inviteModalOpen && (
            <InviteCandidateDialog
              assessment={assessment}
              open={inviteModalOpen}
              onOpenChange={setInviteModalOpen}
            />
          )}

          {invitationsModalOpen && (
            <AssessmentInvitationsDialog
              assessment={assessment}
              open={invitationsModalOpen}
              onOpenChange={setInvitationsModalOpen}
              onInviteMore={() => setInviteModalOpen(true)}
            />
          )}

          {attemptsModalOpen && (
            <AssessmentAttemptsDialog
              assessment={assessment}
              open={attemptsModalOpen}
              onOpenChange={setAttemptsModalOpen}
            />
          )}

          {resultsModalOpen && (
            <AssessmentResultsDialog
              assessment={assessment}
              open={resultsModalOpen}
              onOpenChange={setResultsModalOpen}
            />
          )}

          {leaderboardModalOpen && (
            <AssessmentLeaderboardDialog
              assessmentId={assessment.id}
              assessmentTitle={assessment.title}
              assessment={assessment}
              open={leaderboardModalOpen}
              onOpenChange={setLeaderboardModalOpen}
            />
          )}

          {publishResultsModalOpen && (
            <PublishResultsDialog
              assessment={assessment}
              open={publishResultsModalOpen}
              onOpenChange={setPublishResultsModalOpen}
              onSuccess={() => refetch()}
            />
          )}

          {startAttemptModalOpen && (
            <StartAttemptDialog
              assessment={assessment}
              open={startAttemptModalOpen}
              onOpenChange={setStartAttemptModalOpen}
            />
          )}

          {publishAssessmentModalOpen && (
            <PublishAssessmentDialog
              assessment={assessment}
              open={publishAssessmentModalOpen}
              onOpenChange={setPublishAssessmentModalOpen}
              onSuccess={() => refetch()}
            />
          )}
        </>
      )}

      {/* ── Edit Assessment Dialog ── */}
      {isEditModalOpen && assessment && (
        <EditAssessmentDialog
          assessment={assessment as ISingleAssessmentDetail}
          open={isEditModalOpen}
          onOpenChange={(open) => setIsEditModalOpen(open)}
        />
      )}

      {/* ── Delete Assessment Dialog ── */}
      {isDeleteModalOpen && assessment && (
        <DeleteAssessmentDialog
          assessment={assessment}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}

export default SingleAssessmentDialog;
