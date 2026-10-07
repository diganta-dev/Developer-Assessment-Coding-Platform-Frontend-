"use client";

import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  GraduationCap,
  Layers,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  useGetAssessmentAttempts,
  useGetCompanyAllAssessments,
} from "@/hook/assessment.hook";
import type {
  IAssessment,
  IAssessmentAttemptListItem,
} from "@/types/assessment.type";
import { AttemptDetailsDialog } from "../assessments-components/attempt-details-dialog";
import { AttemptResultDialog } from "../assessments-components/attempt-result-dialog";
import { CheatingRiskAuditDialog } from "../assessments-components/cheating-risk-dialog";
import { InviteCandidateDialog } from "../assessments-components/invite-candidate-dialog";

function formatDate(dateValue?: string | Date | null) {
  if (!dateValue) return "N/A";
  try {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "N/A";
  }
}

function formatDuration(
  startStr?: string | null,
  endStr?: string | null,
): string {
  if (!startStr) return "N/A";
  const start = new Date(startStr).getTime();
  const end = endStr ? new Date(endStr).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end)) return "N/A";
  const diffMinutes = Math.max(0, Math.floor((end - start) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return `${hours}h ${mins}m`;
}

function getInitials(name?: string | null, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return "CA";
}

export function CompanyCandidatesView() {
  // 1. Fetch Assessments for this company
  const {
    data: assessmentsData,
    isLoading: assessmentsLoading,
    error: assessmentsError,
    refetch: refetchAssessments,
  } = useGetCompanyAllAssessments();

  const assessments: IAssessment[] = useMemo(() => {
    const raw = assessmentsData?.data;
    if (Array.isArray(raw)) return raw;
    if (
      raw &&
      typeof raw === "object" &&
      "assessments" in raw &&
      Array.isArray((raw as { assessments: IAssessment[] }).assessments)
    ) {
      return (raw as { assessments: IAssessment[] }).assessments;
    }
    return [];
  }, [assessmentsData]);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("ALL");

  // Determine active assessment (use selected or default to first)
  const activeAssessmentId = selectedAssessmentId || assessments[0]?.id || "";
  const activeAssessment =
    assessments.find((a) => a.id === activeAssessmentId) || null;

  // 2. Fetch attempts for active assessment
  const {
    data: attemptsData,
    isLoading: attemptsLoading,
    isRefetching: attemptsRefetching,
    refetch: refetchAttempts,
  } = useGetAssessmentAttempts(activeAssessmentId);

  const attempts: IAssessmentAttemptListItem[] = useMemo(() => {
    const raw = attemptsData?.data;
    if (Array.isArray(raw)) return raw;
    if (
      raw &&
      typeof raw === "object" &&
      "attempts" in raw &&
      Array.isArray(
        (raw as { attempts: IAssessmentAttemptListItem[] }).attempts,
      )
    ) {
      return (raw as { attempts: IAssessmentAttemptListItem[] }).attempts;
    }
    return [];
  }, [attemptsData]);

  // Dialog management
  const [resultAttemptId, setResultAttemptId] = useState<string | null>(null);
  const [detailsAttemptId, setDetailsAttemptId] = useState<string | null>(null);
  const [auditAttemptId, setAuditAttemptId] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Filtered attempts
  const filteredAttempts = useMemo(() => {
    return attempts.filter((item) => {
      const candidateName = (item.candidate?.name || "").toLowerCase();
      const candidateEmail = (item.candidate?.email || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q || candidateName.includes(q) || candidateEmail.includes(q);

      const matchesStatus =
        statusFilter === "ALL" ||
        item.status?.toUpperCase() === statusFilter.toUpperCase();

      let matchesOutcome = true;
      if (outcomeFilter === "PASSED") {
        matchesOutcome =
          item.result?.status === "PASSED" ||
          (item.percentage !== null &&
            item.percentage !== undefined &&
            activeAssessment?.passingScore !== undefined &&
            item.percentage >= (activeAssessment?.passingScore ?? 60));
      } else if (outcomeFilter === "FAILED") {
        matchesOutcome =
          item.result?.status === "FAILED" ||
          (item.percentage !== null &&
            item.percentage !== undefined &&
            activeAssessment?.passingScore !== undefined &&
            item.percentage < (activeAssessment?.passingScore ?? 60));
      }

      return matchesSearch && matchesStatus && matchesOutcome;
    });
  }, [attempts, searchQuery, statusFilter, outcomeFilter, activeAssessment]);

  // Aggregate stats
  const totalCount = attempts.length;
  const completedCount = attempts.filter(
    (a) => a.status === "EVALUATED" || a.status === "SUBMITTED",
  ).length;

  const passedCount = attempts.filter((a) => {
    if (a.result?.status === "PASSED") return true;
    if (
      a.percentage !== null &&
      a.percentage !== undefined &&
      activeAssessment?.passingScore !== undefined
    ) {
      return a.percentage >= (activeAssessment.passingScore ?? 60);
    }
    return false;
  }).length;

  const avgScore = useMemo(() => {
    const scoredAttempts = attempts.filter(
      (a) => a.percentage !== null && a.percentage !== undefined,
    );
    if (!scoredAttempts.length) return 0;
    const sum = scoredAttempts.reduce(
      (acc, curr) => acc + (curr.percentage || 0),
      0,
    );
    return Math.round(sum / scoredAttempts.length);
  }, [attempts]);

  // Loading assessment state
  if (assessmentsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (assessmentsError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 text-center p-8">
        <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Failed to load candidates</h3>
            <p className="text-sm text-muted-foreground">
              Unable to load your company assessments. Please try again.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAssessments()}
            className="gap-2"
          >
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No assessments created yet
  if (!assessments.length) {
    return (
      <Card className="p-12 text-center border-dashed">
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Layers className="size-7" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold">No Assessments Created Yet</h3>
            <p className="text-xs text-muted-foreground">
              Before tracking candidate performance and invitations, you need to
              create and publish at least one assessment.
            </p>
          </div>
          <Link
            href="/company-admin/assessments"
            className={buttonVariants({ size: "sm", className: "gap-1.5" })}
          >
            <Plus className="size-3.5" />
            Create Your First Assessment
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar with Assessment Selector & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label
            htmlFor="assessmentSelector"
            className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
          >
            <Layers className="size-3.5 text-primary" />
            Select Assessment:
          </label>
          <select
            id="assessmentSelector"
            value={activeAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[240px]"
          >
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} {a.status ? `• (${a.status})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAttempts()}
            disabled={attemptsLoading || attemptsRefetching}
            className="gap-1.5 text-xs"
          >
            <RefreshCw
              className={`size-3.5 ${attemptsRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            disabled={!activeAssessment}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Plus className="size-3.5" />
            Invite Candidate
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Candidates
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{totalCount}</div>
            <CardDescription className="text-xs">
              Registered attempts for this assessment
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed Tests
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{completedCount}</div>
            <CardDescription className="text-xs">
              {totalCount > 0
                ? `${Math.round((completedCount / totalCount) * 100)}% completion rate`
                : "Awaiting submissions"}
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pass Rate
            </CardTitle>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Award className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">
              {completedCount > 0
                ? `${Math.round((passedCount / completedCount) * 100)}%`
                : "N/A"}
            </div>
            <CardDescription className="text-xs">
              {passedCount} candidates passed criteria
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average Score
            </CardTitle>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{avgScore}%</div>
            <CardDescription className="text-xs">
              Passing mark: {activeAssessment?.passingScore ?? 60}%
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search & Filter Bar */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                Candidate Performance Roster
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect scores, test durations, and live proctor telemetry for{" "}
                <span className="font-semibold text-foreground">
                  {activeAssessment?.title}
                </span>
              </CardDescription>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search candidate or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="EVALUATED">Evaluated</option>
                <option value="EXPIRED">Expired</option>
              </select>

              {/* Outcome Filter */}
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium focus:outline-none"
              >
                <option value="ALL">All Outcomes</option>
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {attemptsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredAttempts.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Users className="mx-auto size-10 text-muted-foreground/40 mb-3" />
              <h4 className="text-sm font-semibold text-foreground">
                No candidates found
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                {searchQuery ||
                statusFilter !== "ALL" ||
                outcomeFilter !== "ALL"
                  ? "No candidate attempts match your search and filter criteria."
                  : "No candidates have started or taken this assessment yet. Invite candidates to begin."}
              </p>
              {searchQuery ||
              statusFilter !== "ALL" ||
              outcomeFilter !== "ALL" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setOutcomeFilter("ALL");
                  }}
                  className="text-xs"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsInviteOpen(true)}
                  className="gap-1.5 text-xs shadow-xs"
                >
                  <Plus className="size-3.5" />
                  Invite Candidates Now
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-[11px]">
                    <TableHead>Candidate</TableHead>
                    <TableHead>Session Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score & Accuracy</TableHead>
                    <TableHead>Proctor / Anti-Cheat</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttempts.map((attempt) => {
                    const isEvaluated = attempt.status === "EVALUATED";
                    const isSubmitted = attempt.status === "SUBMITTED";
                    const isPassed =
                      attempt.result?.status === "PASSED" ||
                      (attempt.percentage !== null &&
                        attempt.percentage !== undefined &&
                        attempt.percentage >=
                          (activeAssessment?.passingScore ?? 60));

                    return (
                      <TableRow
                        key={attempt.id}
                        className="text-xs hover:bg-muted/30"
                      >
                        {/* Candidate Identity */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8 rounded-full border border-border">
                              {attempt.candidate?.profilePictureUrl ? (
                                <AvatarImage
                                  src={attempt.candidate.profilePictureUrl}
                                  alt={attempt.candidate.name || "Candidate"}
                                />
                              ) : null}
                              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                {getInitials(
                                  attempt.candidate?.name,
                                  attempt.candidate?.email,
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                <span>
                                  {attempt.candidate?.name ||
                                    "Anonymous Candidate"}
                                </span>
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Mail className="size-3" />
                                <span>
                                  {attempt.candidate?.email || "No email"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Session Details */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px] text-foreground">
                              <Calendar className="size-3 text-muted-foreground" />
                              <span>{formatDate(attempt.startedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="size-3" />
                              <span>
                                Duration:{" "}
                                {formatDuration(
                                  attempt.startedAt,
                                  attempt.submittedAt,
                                )}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Attempt Status Badge */}
                        <TableCell>
                          {attempt.status === "EVALUATED" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="size-3" />
                              Evaluated
                            </span>
                          ) : attempt.status === "SUBMITTED" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              <FileCheck2 className="size-3" />
                              Submitted
                            </span>
                          ) : attempt.status === "IN_PROGRESS" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <Clock className="size-3" />
                              In Progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border">
                              <XCircle className="size-3" />
                              {attempt.status}
                            </span>
                          )}
                        </TableCell>

                        {/* Score & Accuracy */}
                        <TableCell>
                          {isEvaluated ||
                          (isSubmitted && attempt.percentage !== null) ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">
                                  {attempt.obtainedMarks ?? 0} /{" "}
                                  {attempt.totalMarks}
                                </span>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  ({attempt.percentage ?? 0}%)
                                </span>
                                {isPassed ? (
                                  <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    PASS
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-destructive/10 px-1.5 py-0.2 text-[10px] font-bold text-destructive">
                                    FAIL
                                  </span>
                                )}
                              </div>
                              {/* Mini progress bar */}
                              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full ${
                                    isPassed
                                      ? "bg-emerald-500"
                                      : "bg-destructive"
                                  }`}
                                  style={{
                                    width: `${Math.min(100, Math.max(0, attempt.percentage || 0))}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-[11px] italic">
                              Pending evaluation
                            </span>
                          )}
                        </TableCell>

                        {/* Anti-Cheat / Proctor Telemetry */}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAuditAttemptId(attempt.id)}
                            className="h-7 px-2 gap-1.5 text-[11px] hover:bg-muted font-normal"
                          >
                            <ShieldCheck className="size-3.5 text-emerald-500" />
                            <span>Audit Risk</span>
                          </Button>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Scorecard */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setResultAttemptId(attempt.id)}
                              className="h-7 px-2.5 text-xs gap-1 shadow-2xs"
                              title="View Scorecard Breakdown"
                            >
                              <Award className="size-3 text-primary" />
                              <span>Scorecard</span>
                            </Button>

                            {/* Attempt Details */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailsAttemptId(attempt.id)}
                              className="h-7 px-2 text-xs gap-1"
                              title="Inspect Full Submissions"
                            >
                              <Eye className="size-3 text-muted-foreground" />
                              <span>Details</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Modals */}
      {/* Invite Candidate Modal */}
      {activeAssessment && (
        <InviteCandidateDialog
          assessment={activeAssessment}
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          onSuccess={() => refetchAttempts()}
        />
      )}

      {/* Attempt Result / Scorecard Modal */}
      {resultAttemptId && (
        <AttemptResultDialog
          attemptId={resultAttemptId}
          open={Boolean(resultAttemptId)}
          onOpenChange={(open) => !open && setResultAttemptId(null)}
          isCandidateView={false}
        />
      )}

      {/* Attempt Details / Submissions Modal */}
      {detailsAttemptId && (
        <AttemptDetailsDialog
          attemptId={detailsAttemptId}
          open={Boolean(detailsAttemptId)}
          onOpenChange={(open) => !open && setDetailsAttemptId(null)}
          isCandidateView={false}
        />
      )}

      {/* Anti-Cheat Risk Proctor Audit Modal */}
      {auditAttemptId && (
        <CheatingRiskAuditDialog
          attemptId={auditAttemptId}
          isOpen={Boolean(auditAttemptId)}
          onClose={() => setAuditAttemptId(null)}
        />
      )}
    </div>
  );
}
