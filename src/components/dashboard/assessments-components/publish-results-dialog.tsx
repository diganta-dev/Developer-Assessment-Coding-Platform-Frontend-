"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck2,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  Megaphone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
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
import { useGetMe } from "@/hook";
import { usePublishResults } from "@/hook/assessment.hook";
import { CompanyMemberRole, UserRole } from "@/types";
import type {
  IAssessment,
  IPublishResultsData,
  ISingleAssessmentDetail,
} from "@/types/assessment.type";
import { isUserAuthorized } from "@/utils";

export interface PublishResultsDialogProps {
  assessment: IAssessment | ISingleAssessmentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PublishResultsDialog({
  assessment,
  open,
  onOpenChange,
  onSuccess,
}: PublishResultsDialogProps) {
  const queryClient = useQueryClient();
  const publishMutation = usePublishResults();

  // Role verification from authentication context
  const { data: meData } = useGetMe();
  const currentUser = meData?.data;

  // Granular publishing configurations (backend supported parameters)
  const [recalculateRanks, setRecalculateRanks] = useState(true);
  const [publishAll, setPublishAll] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [publishedResultData, setPublishedResultData] =
    useState<IPublishResultsData | null>(null);

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
    assessment?.creatorId || assessment?.createdById || assessment?.creator?.id;

  const isAssessmentCreator = Boolean(
    currentUser?.id && creatorId && currentUser.id === creatorId,
  );

  const canPublish = isPlatformAdmin || isAuthorizedRole || isAssessmentCreator;

  const userEffectiveRoleDisplay = isPlatformAdmin
    ? "Platform Administrator"
    : currentUser?.memberRole === CompanyMemberRole.COMPANY_OWNER
      ? "Company Owner"
      : currentUser?.memberRole === CompanyMemberRole.COMPANY_ADMIN
        ? "Company Admin"
        : currentUser?.memberRole === CompanyMemberRole.ASSESSMENT_CREATOR
          ? "Assessment Creator"
          : currentUser?.memberRole === CompanyMemberRole.EVALUATOR
            ? "Evaluator (Restricted)"
            : currentUser?.role || "Candidate";

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

  const handleClose = () => {
    if (publishMutation.isPending) return;
    setPublishedResultData(null);
    onOpenChange(false);
  };

  const handleConfirmPublishResults = () => {
    if (!assessment?.id || !canPublish || publishMutation.isPending) return;

    publishMutation.mutate(
      {
        assessmentId: assessment.id,
        payload: {
          publishAll,
          recalculateRanks,
        },
      },
      {
        onSuccess: (res) => {
          // React Query invalidation in calling component (AGENTS.md Rule 2)
          queryClient.invalidateQueries({ queryKey: ["company-assessments"] });
          queryClient.invalidateQueries({ queryKey: ["my-assessments"] });
          queryClient.invalidateQueries({ queryKey: ["assessments"] });
          queryClient.invalidateQueries({
            queryKey: ["assessment-single", assessment.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment", assessment.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-attempts", assessment.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-results", assessment.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-leaderboard", assessment.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-invitations", assessment.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-attempt-result"],
          });
          queryClient.invalidateQueries({
            queryKey: ["candidate-my-attempts"],
          });
          queryClient.invalidateQueries({
            queryKey: ["my-attempts"],
          });

          if (res?.data) {
            setPublishedResultData(res.data);
          }

          toast.add({
            title: "Results Published Successfully",
            description:
              res?.message ||
              `Evaluation results for "${assessment.title}" are now officially published.`,
            type: "success",
          });

          onSuccess?.();
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };

          toast.add({
            title: "Failed to Publish Results",
            description:
              apiErr?.data?.message ||
              apiErr?.message ||
              "An unexpected error occurred while publishing assessment results.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        size="xl"
        className="max-h-[88vh] overflow-y-auto p-5 sm:p-6 gap-4"
      >
        {/* Header */}
        <DialogHeader className="space-y-1.5 pb-0.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm shrink-0">
              <Award className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Publish Assessment Results
                </DialogTitle>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  Direct Route
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Calculate official standings, generate reports, and release
                scores to candidates
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Success Summary Overview (Post-Publish) ── */}
        {publishedResultData ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="size-5" />
                <span>Results Officially Released</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scores and percentiles for{" "}
                <strong className="text-foreground">{assessment.title}</strong>{" "}
                have been finalized. Candidates can now view their scores,
                detailed breakdown, and pass/fail status in their portal.
              </p>

              {/* Stats Overview */}
              {publishedResultData.overview && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <div className="p-2.5 rounded-lg bg-background/80 border border-border/60">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Completed
                    </p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {publishedResultData.overview.completedAttempts}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background/80 border border-border/60">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Pass Rate
                    </p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {publishedResultData.overview.passRate}%
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background/80 border border-border/60">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Avg Score
                    </p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {publishedResultData.overview.averageScore}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background/80 border border-border/60">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Highest
                    </p>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {publishedResultData.overview.highestScore}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-emerald-500/20">
                <span>
                  Updated Results Count:{" "}
                  <strong className="text-foreground">
                    {publishedResultData.publishedCount}
                  </strong>
                </span>
                <span>
                  Published:{" "}
                  {publishedResultData.publishedAt
                    ? new Date(
                        publishedResultData.publishedAt,
                      ).toLocaleTimeString()
                    : "Just now"}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto text-xs h-8 px-4 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* ── Pre-Publish Configuration & Confirmation ── */
          <div className="space-y-3.5">
            {/* Unauthorized Role Warning Guard */}
            {!canPublish && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs space-y-2 text-destructive">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldAlert className="size-4" />
                  <span>Insufficient Permissions to Publish Results</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  You are currently authenticated as{" "}
                  <strong className="text-foreground">
                    {userEffectiveRoleDisplay}
                  </strong>
                  . Only <strong>Platform Admins</strong>,{" "}
                  <strong>Company Owners</strong>,{" "}
                  <strong>Company Admins</strong>, or the{" "}
                  <strong>Assessment Creator</strong> can trigger rank
                  recalculation and publish results.
                </p>
              </div>
            )}

            {/* Assessment Snapshot Card */}
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
                  {assessment.isResultPublished ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <Sparkles className="size-3" />
                      Previously Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="size-3" />
                      Ready to Publish
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    Status:{" "}
                    <strong className="uppercase">{assessment.status}</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/50 text-[11px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileCheck2 className="size-3 text-primary" />
                  <span>
                    Total Marks:{" "}
                    <strong className="text-foreground">
                      {assessment.totalMarks}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  <span>
                    Passing:{" "}
                    <strong className="text-foreground">
                      {assessment.passingScore ?? "N/A"}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-3 text-amber-500" />
                  <span>
                    Duration:{" "}
                    <strong className="text-foreground">
                      {assessment.durationMinutes}m
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Granular Publication Controls */}
            <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Recalculate Competitive Ranks & Percentiles</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Re-computes candidate percentiles, ranks, and resolves ties
                    before official release.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={recalculateRanks}
                  disabled={!canPublish || publishMutation.isPending}
                  onClick={() => setRecalculateRanks(!recalculateRanks)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    recalculateRanks
                      ? "bg-emerald-600"
                      : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      recalculateRanks ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-border/40 pt-2.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Users className="size-3.5 text-primary" />
                    <span>Publish All Completed Submissions</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Releases final scorecards and answers to all eligible
                    candidates who completed the test.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={publishAll}
                  disabled={!canPublish || publishMutation.isPending}
                  onClick={() => setPublishAll(!publishAll)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    publishAll ? "bg-emerald-600" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      publishAll ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Impact & Security Guidance Box */}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-semibold text-[11px] text-amber-700 dark:text-amber-400">
                <Megaphone className="size-3.5" />
                <span>Candidate Visibility & System Impact</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
                <li>
                  Candidates will immediately view their earned score,
                  percentage, standings, and breakdown.
                </li>
                <li>
                  An official assessment analytics report will be updated on the
                  platform.
                </li>
                <li>
                  Evaluator reviews and proctoring audit flags are locked into
                  the final record.
                </li>
              </ul>
            </div>

            {/* Footer Actions */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={publishMutation.isPending}
                className="text-xs h-8 cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleConfirmPublishResults}
                disabled={!canPublish || publishMutation.isPending}
                className={`text-xs h-8 gap-1.5 font-semibold text-white shadow-sm cursor-pointer ${
                  canPublish
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-muted-foreground/50 cursor-not-allowed"
                }`}
                id={`confirm-publish-results-${assessment.id}-btn`}
              >
                {publishMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Publishing & Calculating Ranks...</span>
                  </>
                ) : !canPublish ? (
                  <>
                    <Lock className="size-3.5" />
                    <span>Publishing Restricted</span>
                  </>
                ) : (
                  <>
                    <Award className="size-3.5" />
                    <span>Confirm & Publish Results</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PublishResultsDialog;
