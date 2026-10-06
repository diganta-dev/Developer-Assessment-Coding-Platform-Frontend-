"use client";

import {
  AlertCircle,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Loader2,
  Lock,
  Shield,
  ShieldAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  useStartAttempt,
  useVerifyAssessmentInvitation,
} from "@/hook/assessment.hook";

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

export function AssessmentInvitationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { data, isLoading, isError, error } =
    useVerifyAssessmentInvitation(token);
  const startAttemptMutation = useStartAttempt();

  const handleStartAttempt = async () => {
    if (!data?.data?.assessment?.id) return;
    try {
      const res = await startAttemptMutation.mutateAsync({
        assessmentId: data.data.assessment.id,
        invitationToken: token,
      });

      toast.add({
        title: res.data?.isResume ? "Attempt Resumed" : "Assessment Started",
        description:
          res.message || "Good luck! You may now begin answering questions.",
        type: "success",
      });

      router.push(
        `/candidate/assessments?assessmentId=${data.data.assessment.id}&attemptId=${res.data.attempt.id}`,
      );
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number;
        statusCode?: number;
        data?: { message?: string };
        message?: string;
      };
      const statusCode = apiErr?.status ?? apiErr?.statusCode;
      const errorMsg =
        apiErr?.data?.message ||
        apiErr?.message ||
        "Failed to start assessment attempt.";

      if (statusCode === 401 || statusCode === 403) {
        toast.add({
          title: "Sign In Required",
          description:
            "Please sign in with your candidate account to start this assessment.",
          type: "warning",
        });
        const currentPath = `/assessment/invitation?token=${token}`;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        toast.add({
          title: "Could Not Start Assessment",
          description: errorMsg,
          type: "error",
        });
      }
    }
  };

  if (!token) {
    return (
      <Card className="max-w-lg mx-auto shadow-sm border-border/80 text-center p-8">
        <div className="inline-flex p-3.5 rounded-full bg-amber-500/10 text-amber-600 mb-3 mx-auto">
          <AlertCircle className="size-8" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          Missing Invitation Token
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
          No invitation token was provided in the URL. Please verify the link
          from your invitation email or contact the organization.
        </p>
        <div className="pt-6">
          <Link href="/login" className={buttonVariants({ size: "sm" })}>
            Go to Login
          </Link>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto shadow-sm border-border/80 p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </Card>
    );
  }

  if (isError || !data?.data) {
    return (
      <Card className="max-w-lg mx-auto shadow-sm border-border/80 text-center p-8">
        <div className="inline-flex p-3.5 rounded-full bg-destructive/10 text-destructive mb-3 mx-auto">
          <AlertCircle className="size-8" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          Invalid or Expired Invitation
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
          {(error as Error)?.message ||
            "This assessment invitation is either invalid, revoked, or no longer active."}
        </p>
        <div className="pt-6">
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to Sign In
          </Link>
        </div>
      </Card>
    );
  }

  const { invitation, assessment, candidate } = data.data;
  const company = assessment.company as
    | { id?: string; name?: string; logoUrl?: string | null }
    | undefined;
  const isExpired = invitation.isExpired;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Top Header Card ── */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <div className="bg-primary/5 border-b border-border/50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {company?.logoUrl ? (
                <div className="relative size-14 rounded-xl overflow-hidden border border-border/60 bg-background shrink-0">
                  <Image
                    src={company.logoUrl}
                    alt={company.name || "Company"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shrink-0">
                  <Building2 className="size-7" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {company?.name || "Technical Assessment Invitation"}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  {assessment.title}
                </h1>
              </div>
            </div>

            <div>
              {isExpired ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border">
                  <Clock className="size-3.5" />
                  Invitation Expired
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Invitation Active
                </span>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Assessment Description */}
          {assessment.description && (
            <div className="text-xs text-muted-foreground leading-relaxed p-4 rounded-xl bg-muted/30 border border-border/50">
              {assessment.description}
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-border/60 bg-background/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Clock className="size-3.5 text-primary" />
                <span>Duration</span>
              </div>
              <p className="text-lg font-bold text-foreground mt-1">
                {assessment.durationMinutes} mins
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-background/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Award className="size-3.5 text-indigo-500" />
                <span>Total Marks</span>
              </div>
              <p className="text-lg font-bold text-foreground mt-1">
                {assessment.totalMarks} pts
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-background/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Passing Score</span>
              </div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {assessment.passingScore ??
                  (assessment.totalMarks > 0
                    ? Math.round(assessment.totalMarks * 0.5)
                    : 0)}{" "}
                pts
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-background/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Calendar className="size-3.5 text-sky-500" />
                <span>Deadline</span>
              </div>
              <p className="text-xs font-semibold text-foreground mt-1.5 truncate">
                {formatDate(assessment.endDate, "Open Window")}
              </p>
            </div>
          </div>

          {/* Candidate Invitation Information */}
          <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Invited Candidate:</span>
              <span className="font-semibold text-foreground">
                {candidate?.name || "Candidate"} ({invitation.email})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Invitation Date:</span>
              <span className="text-muted-foreground">
                {formatDate(invitation.invitedAt)}
              </span>
            </div>
            {invitation.expiresAt && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Link Expires:</span>
                <span className="text-muted-foreground">
                  {formatDate(invitation.expiresAt)}
                </span>
              </div>
            )}
          </div>

          {/* Anti-Cheating & Proctoring Safeguards */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Shield className="size-4 text-primary" />
              <span>Assessment Proctoring & Integrity Rules</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/40 bg-background/60">
                <Lock className="size-3.5 text-muted-foreground" />
                <span>Strict time limit automatically monitored</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/40 bg-background/60">
                <ShieldAlert className="size-3.5 text-muted-foreground" />
                <span>Tab switches & window focus losses are recorded</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/40 bg-background/60">
                <FileCheck2 className="size-3.5 text-muted-foreground" />
                <span>Auto-submission enabled upon timer expiry</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/40 bg-background/60">
                <Eye className="size-3.5 text-muted-foreground" />
                <span>Fullscreen mode recommended throughout the test</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border/40">
            {isExpired ? (
              <div className="w-full text-center p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                This invitation link has expired. Please contact the company
                administrator to request a new invitation.
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full sm:w-auto",
                  })}
                >
                  Sign In / Switch Account
                </Link>
                <Button
                  type="button"
                  onClick={handleStartAttempt}
                  disabled={startAttemptMutation.isPending}
                  size="sm"
                  className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 cursor-pointer"
                >
                  {startAttemptMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Starting Assessment...</span>
                    </>
                  ) : (
                    <>
                      <span>Accept & Begin Assessment</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssessmentInvitationView;
