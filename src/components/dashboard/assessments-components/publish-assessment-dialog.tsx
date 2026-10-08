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
  Copy,
  FileCheck2,
  FileQuestion,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  Lock,
  Megaphone,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { usePublishAssessmentProtected } from "@/hook/assessment.hook";
import { useGetMe } from "@/hook";
import { isUserAuthorized } from "@/utils";
import { CompanyMemberRole, UserRole } from "@/types";
import type {
  IAssessment,
  IPublishAssessmentResponse,
  ISingleAssessmentDetail,
} from "@/types/assessment.type";

export interface PublishAssessmentDialogProps {
  assessment: IAssessment | ISingleAssessmentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PublishAssessmentDialog({
  assessment,
  open,
  onOpenChange,
  onSuccess,
}: PublishAssessmentDialogProps) {
  const queryClient = useQueryClient();
  const publishMutation = usePublishAssessmentProtected();

  // Role verification from authentication context
  const { data: meData } = useGetMe();
  const currentUser = meData?.data;

  const [copiedId, setCopiedId] = useState(false);

  if (!assessment) return null;

  // ── Role & Permission Verification ──
  // Permitted roles: Admin, Super Admin, Company Owner, Company Admin, Assessment Creator
  const isPlatformAdmin =
    currentUser?.role === UserRole.SUPER_ADMIN ||
    currentUser?.role === UserRole.ADMIN;

  const isAuthorizedRole = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
    CompanyMemberRole.ASSESSMENT_CREATOR,
  ]);

  const creatorId =
    assessment?.creatorId ||
    assessment?.createdById ||
    assessment?.creator?.id;

  const isAssessmentCreator = Boolean(
    currentUser?.id && creatorId && currentUser.id === creatorId
  );

  const canPublish = isPlatformAdmin || isAuthorizedRole || isAssessmentCreator;

  const userRoleDisplay = isPlatformAdmin
    ? "Platform Administrator"
    : currentUser?.memberRole === CompanyMemberRole.COMPANY_OWNER
      ? "Company Owner"
      : currentUser?.memberRole === CompanyMemberRole.COMPANY_ADMIN
        ? "Company Admin"
        : currentUser?.memberRole === CompanyMemberRole.ASSESSMENT_CREATOR
          ? "Assessment Creator"
          : currentUser?.memberRole === CompanyMemberRole.EVALUATOR
            ? "Evaluator (Restricted)"
            : currentUser?.role || "Non-Creator";

  // ── Pre-flight Readiness Checks (matches Backend Service validation) ──
  const countObj = assessment._count as
    | {
        problems?: number;
        invitations?: number;
        attempts?: number;
      }
    | undefined;

  const problemsCount =
    countObj?.problems ??
    (Array.isArray(assessment.problems) ? assessment.problems.length : 0);

  const hasNoProblems = problemsCount === 0;
  const hasInvalidDuration = (assessment.durationMinutes ?? 0) <= 0;
  const isAlreadyPublished =
    assessment.status === "PUBLISHED" || assessment.status === "ACTIVE";
  const isArchivedOrCompleted =
    assessment.status === "COMPLETED" ||
    assessment.status === "ARCHIVED" ||
    assessment.status === "EXPIRED";

  const isPastDeadline =
    assessment.endDate && new Date(assessment.endDate) < new Date();

  const isPassingScoreExceeded =
    assessment.passingScore !== null &&
    assessment.passingScore !== undefined &&
    assessment.totalMarks > 0 &&
    assessment.passingScore > assessment.totalMarks;

  const isReadyToPublish =
    canPublish &&
    !hasNoProblems &&
    !hasInvalidDuration &&
    !isAlreadyPublished &&
    !isArchivedOrCompleted &&
    !isPastDeadline &&
    !isPassingScoreExceeded;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!assessment.id) return;
    navigator.clipboard.writeText(assessment.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    toast.add({
      title: "ID Copied",
      description: "Assessment ID copied to clipboard.",
      type: "info",
    });
  };

  const handleConfirmPublish = () => {
    if (!assessment?.id || !isReadyToPublish || publishMutation.isPending) return;

    publishMutation.mutate(assessment.id, {
      onSuccess: (res: IPublishAssessmentResponse) => {
        // Invalidate queries in calling component per AGENTS.md Rule 2
        queryClient.invalidateQueries({ queryKey: ["my-assessments"] });
        queryClient.invalidateQueries({ queryKey: ["company-assessments"] });
        queryClient.invalidateQueries({ queryKey: ["assessments"] });
        queryClient.invalidateQueries({
          queryKey: ["assessment-single", assessment.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["assessment", assessment.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["assessment-invitations", assessment.id],
        });

        toast.add({
          title: "Assessment Published Successfully",
          description:
            res?.message ||
            `"${assessment.title}" is now officially published and ready for candidate evaluations.`,
          type: "success",
        });

        onOpenChange(false);
        onSuccess?.();
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
            "An unexpected error occurred while publishing the assessment.",
          type: "error",
        });
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !publishMutation.isPending) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent size="xl" className="max-h-[88vh] overflow-y-auto p-5 sm:p-6 gap-4">
        {/* Header */}
        <DialogHeader className="space-y-1.5 pb-0.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm shrink-0">
              <Send className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Publish Assessment
                </DialogTitle>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  Direct Route
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Transition this assessment from Draft to Published, unlocking test access for candidates
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Role & Permission Guard ── */}
        {!canPublish && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs space-y-2 text-destructive">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="size-4" />
              <span>Permission Denied (Publish Restricted)</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You are currently authenticated as{" "}
              <strong className="text-foreground">{userRoleDisplay}</strong>. Only{" "}
              <strong>Platform Admins</strong>, <strong>Company Owners</strong>,{" "}
              <strong>Company Admins</strong>, or the{" "}
              <strong>Assessment Creator</strong> have authorization to publish
              assessments. Evaluators and candidates do not have permission.
            </p>
          </div>
        )}

        {/* ── Readiness Warnings ── */}
        {hasNoProblems && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs space-y-1 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold">
              <FileQuestion className="size-4 text-amber-600" />
              <span>No Questions Attached</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Cannot publish an assessment with zero questions. Please attach at least
              one coding challenge or MCQ problem before publishing.
            </p>
          </div>
        )}

        {hasInvalidDuration && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs space-y-1 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold">
              <Clock className="size-4 text-amber-600" />
              <span>Invalid Test Duration</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Assessment duration must be greater than 0 minutes. Please edit the
              assessment settings.
            </p>
          </div>
        )}

        {isPastDeadline && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs space-y-1 text-destructive">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="size-4" />
              <span>End Date Has Passed</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              The scheduled deadline for this assessment passed on{" "}
              <strong>{new Date(assessment.endDate!).toLocaleString()}</strong>.
              Please update the end date before publishing.
            </p>
          </div>
        )}

        {isPassingScoreExceeded && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs space-y-1 text-destructive">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              <span>Passing Score Exceeds Total Marks</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Passing score ({assessment.passingScore}) cannot be greater than total
              marks ({assessment.totalMarks}). Please adjust the passing threshold or
              add more problems.
            </p>
          </div>
        )}

        {isAlreadyPublished && (
          <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-xs space-y-1 text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="size-4 text-blue-600" />
              <span>Already Published</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              This assessment is currently in{" "}
              <strong className="uppercase">{assessment.status}</strong> status and is
              already open for candidate evaluations.
            </p>
          </div>
        )}

        {/* Assessment Overview Card */}
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {assessment.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] font-mono text-muted-foreground">
                  ID: {assessment.id.slice(0, 16)}...
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Copy full assessment ID"
                >
                  {copiedId ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="size-3" />
                Draft Assessment
              </span>
              <span className="text-[10px] text-muted-foreground">
                Current Status: <strong className="uppercase">{assessment.status}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileQuestion className="size-3.5 text-primary" />
              <span>
                Questions: <strong className="text-foreground">{problemsCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5 text-amber-500" />
              <span>
                Duration:{" "}
                <strong className="text-foreground">
                  {assessment.durationMinutes}m
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileCheck2 className="size-3.5 text-primary" />
              <span>
                Total:{" "}
                <strong className="text-foreground">{assessment.totalMarks}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span>
                Passing:{" "}
                <strong className="text-foreground">
                  {assessment.passingScore ?? "N/A"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Impact & Guidelines Notice */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-amber-700 dark:text-amber-400">
            <Megaphone className="size-3.5" />
            <span>Publishing Guidelines & Candidate Access</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>
              Upon publishing, invited candidates will receive active exam access
              according to your scheduled test window.
            </li>
            <li>
              Once candidate attempts begin, problem questions and score allocations
              will be permanently locked to ensure evaluation fairness.
            </li>
            <li>
              You can track candidate submissions and proctoring telemetry in real time
              from the attempts monitor.
            </li>
          </ul>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={publishMutation.isPending}
            className="text-xs h-8 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirmPublish}
            disabled={!isReadyToPublish || publishMutation.isPending}
            className={`text-xs h-8 gap-1.5 font-semibold text-white shadow-sm cursor-pointer ${
              isReadyToPublish
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-muted-foreground/50 cursor-not-allowed"
            }`}
            id={`confirm-publish-assessment-${assessment.id}-btn`}
          >
            {publishMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Publishing Assessment...</span>
              </>
            ) : !canPublish ? (
              <>
                <Lock className="size-3.5" />
                <span>Publishing Restricted</span>
              </>
            ) : !isReadyToPublish ? (
              <>
                <AlertCircle className="size-3.5" />
                <span>Readiness Incomplete</span>
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                <span>Confirm & Publish Assessment</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PublishAssessmentDialog;
