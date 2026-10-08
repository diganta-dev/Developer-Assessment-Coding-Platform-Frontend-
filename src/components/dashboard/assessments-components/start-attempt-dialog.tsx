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
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileCheck2,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useStartAttemptDirectRoute } from "@/hook/assessment.hook";
import { useGetMe } from "@/hook";
import { UserRole } from "@/types";
import type {
  IAssessment,
  IStartAttemptPayload,
  IStartAttemptResponse,
  ISingleAssessmentDetail,
} from "@/types/assessment.type";

export interface StartAttemptDialogProps {
  assessment: IAssessment | ISingleAssessmentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitationToken?: string;
  onSuccess?: (response: IStartAttemptResponse) => void;
}

export function StartAttemptDialog({
  assessment,
  open,
  onOpenChange,
  invitationToken: initialToken = "",
  onSuccess,
}: StartAttemptDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const startAttemptMutation = useStartAttemptDirectRoute();

  // Role verification from authentication context
  const { data: meData } = useGetMe();
  const currentUser = meData?.data;

  // Local state for invitation token and clipboard copy
  const [invitationToken, setInvitationToken] = useState(initialToken);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (initialToken) {
      setInvitationToken(initialToken);
    }
  }, [initialToken]);

  if (!assessment) return null;

  // ── Role & Permission Verification (Candidate Only) ──
  // Backend rule: Only CANDIDATE role is authorized to sit for tests
  const isCandidate =
    currentUser?.role === UserRole.CANDIDATE ||
    currentUser?.role === "CANDIDATE";

  const userRoleDisplay =
    currentUser?.role === UserRole.SUPER_ADMIN
      ? "Super Admin"
      : currentUser?.role === UserRole.ADMIN
        ? "Platform Admin"
        : currentUser?.memberRole || currentUser?.role || "Non-Candidate";

  // Assessment lifecycle checks
  const isDraft = assessment.status === "DRAFT";
  const isExpired = assessment.status === "EXPIRED" || assessment.status === "ARCHIVED";
  const isUpcoming =
    assessment.startDate && new Date(assessment.startDate) > new Date();
  const isPastDeadline =
    assessment.endDate && new Date(assessment.endDate) < new Date();

  const isAssessmentOpen = !isDraft && !isExpired && !isUpcoming && !isPastDeadline;

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

  const handleStartAttempt = () => {
    if (!assessment.id || !isCandidate || startAttemptMutation.isPending) return;

    const payload: IStartAttemptPayload = {};
    if (invitationToken.trim()) {
      payload.invitationToken = invitationToken.trim();
    }

    startAttemptMutation.mutate(
      {
        assessmentId: assessment.id,
        payload,
      },
      {
        onSuccess: (res) => {
          // React Query invalidation in calling component (AGENTS.md Rule 2)
          queryClient.invalidateQueries({ queryKey: ["candidate-my-attempts"] });
          queryClient.invalidateQueries({ queryKey: ["my-attempts"] });
          queryClient.invalidateQueries({
            queryKey: ["assessment-attempts", assessment.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-single", assessment.id],
          });

          if (res.data?.attempt?.id) {
            queryClient.invalidateQueries({
              queryKey: ["assessment-attempt", res.data.attempt.id],
            });
          }

          toast.add({
            title: res.data?.isResume
              ? "Resuming Attempt"
              : "Assessment Attempt Started",
            description:
              res.message ||
              `Good luck! You may now begin answering questions for "${assessment.title}".`,
            type: "success",
          });

          onOpenChange(false);
          onSuccess?.(res);

          // Direct redirect into Candidate Assessment Workspace
          const targetAttemptId = res.data?.attempt?.id;
          if (targetAttemptId) {
            router.push(
              `/candidate/assessments?assessmentId=${assessment.id}&attemptId=${targetAttemptId}`
            );
          }
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };

          toast.add({
            title: "Cannot Start Assessment",
            description:
              apiErr?.data?.message ||
              apiErr?.message ||
              "An unexpected error occurred while starting your assessment attempt.",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[88vh] overflow-y-auto p-5 sm:p-6 gap-4">
        {/* Header */}
        <DialogHeader className="space-y-1.5 pb-0.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm shrink-0">
              <Play className="size-5 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Start Assessment Attempt
                </DialogTitle>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  Direct Route
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Launch your timed evaluation session or resume an active in-progress attempt
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Role & Permission Alert (Candidate Only Guard) ── */}
        {!isCandidate && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs space-y-2 text-destructive">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="size-4" />
              <span>Candidate Role Required (Test Locked)</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You are currently authenticated as{" "}
              <strong className="text-foreground">{userRoleDisplay}</strong>. Under
              anti-cheat and platform integrity rules, only registered{" "}
              <strong>Candidates</strong> are permitted to start or sit for an
              assessment. Recruiters, evaluators, and administrators cannot take tests.
            </p>
          </div>
        )}

        {/* Lifecycle Warnings */}
        {isDraft && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs space-y-1 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4 text-amber-600" />
              <span>Assessment In Draft</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              This assessment is currently in draft mode and has not yet been published
              by the recruiter.
            </p>
          </div>
        )}

        {isUpcoming && (
          <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-xs space-y-1 text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2 font-semibold">
              <Clock className="size-4 text-blue-600" />
              <span>Scheduled For Future Date</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              This assessment opens on{" "}
              <strong>{new Date(assessment.startDate!).toLocaleString()}</strong>.
            </p>
          </div>
        )}

        {isPastDeadline && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs space-y-1 text-destructive">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="size-4" />
              <span>Assessment Deadline Expired</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              The submission deadline for this test passed on{" "}
              <strong>{new Date(assessment.endDate!).toLocaleString()}</strong>.
            </p>
          </div>
        )}

        {/* Assessment Card */}
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="size-3" />
                Verified Test
              </span>
              <span className="text-[10px] text-muted-foreground">
                Status: <strong className="uppercase">{assessment.status}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/50 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5 text-amber-500" />
              <span>
                Duration:{" "}
                <strong className="text-foreground">
                  {assessment.durationMinutes} mins
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileCheck2 className="size-3.5 text-primary" />
              <span>
                Total Marks:{" "}
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

        {/* ── Direct Route Payload: Invitation Token Input ── */}
        <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="invitationToken-input"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <span>Invitation Token</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                (Optional if pre-assigned)
              </span>
            </label>
            <span className="text-[10px] font-mono text-muted-foreground">
              payload.invitationToken
            </span>
          </div>
          <Input
            id="invitationToken-input"
            type="text"
            placeholder="Enter invitation token if applicable..."
            value={invitationToken}
            onChange={(e) => setInvitationToken(e.target.value)}
            disabled={!isCandidate || startAttemptMutation.isPending}
            className="text-xs h-8 font-mono placeholder:font-sans"
          />
          <p className="text-[11px] text-muted-foreground leading-normal">
            If you received an invitation token link via email, enter it above to claim
            access. If this assessment was already assigned directly to your candidate
            profile, you can proceed directly.
          </p>
        </div>

        {/* Proctoring & Integrity Rules */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-amber-700 dark:text-amber-400">
            <Timer className="size-3.5" />
            <span>Important Examination Guidelines</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>
              <strong>Continuous Timer:</strong> Your exam countdown begins immediately
              when you click Start. The server clock continues even if you close the tab.
            </li>
            <li>
              <strong>Idempotent Resumption:</strong> If your connection drops, return
              here to resume your attempt with your remaining time.
            </li>
            <li>
              <strong>Anti-Cheat Proctoring:</strong> Browser tab switches, window blur
              events, and code pasting are monitored and logged.
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
            disabled={startAttemptMutation.isPending}
            className="text-xs h-8 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleStartAttempt}
            disabled={!isCandidate || !isAssessmentOpen || startAttemptMutation.isPending}
            className={`text-xs h-8 gap-1.5 font-semibold text-white shadow-sm cursor-pointer ${
              isCandidate && isAssessmentOpen
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-muted-foreground/50 cursor-not-allowed"
            }`}
            id={`confirm-start-attempt-${assessment.id}-btn`}
          >
            {startAttemptMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Initializing Attempt...</span>
              </>
            ) : !isCandidate ? (
              <>
                <Lock className="size-3.5" />
                <span>Candidate Role Required</span>
              </>
            ) : !isAssessmentOpen ? (
              <>
                <AlertCircle className="size-3.5" />
                <span>Test Not Available</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                <span>Start Assessment Attempt</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StartAttemptDialog;
