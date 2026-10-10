"use client";

import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  FileCheck2,
  Flame,
  Layers,
  Mail,
  Play,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCandidateMyAttempts, useGetMe, useGetMyResults } from "@/hook";
import type { ICandidateAttemptItem } from "@/types/assessment.type";

function getInitials(name?: string | null, fallback = "CD"): string {
  if (!name?.trim()) return fallback;
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

export function CandidateOverview() {
  const { data: meData, isLoading: isMeLoading } = useGetMe();
  const user = meData?.data;

  // Query candidate attempts
  const {
    data: attemptsRes,
    isLoading: isAttemptsLoading,
    refetch: refetchAttempts,
  } = useGetCandidateMyAttempts({
    page: 1,
    limit: 10,
  });

  // Query verified assessment results portfolio
  const { data: resultsRes, isLoading: isResultsLoading } = useGetMyResults();

  const attempts: ICandidateAttemptItem[] = useMemo(() => {
    return attemptsRes?.data || [];
  }, [attemptsRes]);

  const results = useMemo(() => {
    return resultsRes?.data || [];
  }, [resultsRes]);

  // Telemetry KPIs
  const stats = useMemo(() => {
    const inProgress = attempts.filter(
      (a) => (a.status || "").toUpperCase() === "IN_PROGRESS",
    );
    const submitted = attempts.filter(
      (a) => (a.status || "").toUpperCase() === "SUBMITTED",
    );
    const evaluated = attempts.filter(
      (a) => (a.status || "").toUpperCase() === "EVALUATED",
    );

    const totalScores = results.reduce(
      (acc: number, r: any) => acc + (r.percentage ?? 0),
      0,
    );
    const avgScore =
      results.length > 0 ? Math.round(totalScores / results.length) : null;

    return {
      inProgressCount: inProgress.length,
      activeAttempt: inProgress[0] || null,
      submittedCount: submitted.length,
      evaluatedCount: evaluated.length,
      totalCount: attempts.length,
      avgScore,
      resultsCount: results.length,
    };
  }, [attempts, results]);

  const recentAttempts = useMemo(() => {
    return attempts.slice(0, 5);
  }, [attempts]);

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* ── Candidate Greeting & Quick Actions Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Candidate Assessment Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            {isMeLoading ? (
              <span className="animate-pulse">Welcome back...</span>
            ) : (
              `Welcome back, ${user?.name || "Candidate"}!`
            )}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Monitor your coding test invitations, resume active exams, and check
            verified scorecards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/candidate/invitations"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Mail className="mr-1.5 size-3.5" />
            Invitations
          </Link>
          <Link
            href="/candidate/results"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Award className="mr-1.5 size-3.5" />
            Scorecards
          </Link>
          <Link
            href="/candidate/invitations"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            <Play className="mr-1.5 size-3.5" />
            Take Assessment
          </Link>
        </div>
      </div>

      {/* ── In-Progress Live Test Alert (if candidate has an active exam) ── */}
      {stats.activeAttempt && (
        <Card className="border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Flame className="size-5 animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Active Exam in Progress
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    Attempt #{stats.activeAttempt.attemptNumber}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {stats.activeAttempt.assessment?.title ||
                    "Technical Assessment"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {stats.activeAttempt.assessment?.company?.name ||
                    "Benchmark Company"}{" "}
                  • {stats.activeAttempt.assessment?.durationMinutes || 60} mins
                  allowed window
                </p>
              </div>
            </div>

            <Link
              href={`/candidate/assessments?assessmentId=${stats.activeAttempt.assessmentId || stats.activeAttempt.assessment?.id}&attemptId=${stats.activeAttempt.id}`}
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className:
                  "bg-amber-600 hover:bg-amber-700 text-white shrink-0",
              })}
            >
              Resume Assessment
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ── Key Metrics & KPI Cards (4 Cards) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: In Progress */}
        <Card className="border-border/70 hover:border-primary/40 transition-all shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              In-Progress Tests
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isAttemptsLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold tracking-tight">
                {stats.inProgressCount}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Active exams awaiting submission
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Invitations / Attempts */}
        <Card className="border-border/70 hover:border-primary/40 transition-all shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Invitations & Attempts
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Mail className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isAttemptsLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold tracking-tight">
                {stats.totalCount}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Test invitations in your portfolio
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Evaluated */}
        <Card className="border-border/70 hover:border-primary/40 transition-all shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Evaluated Tests
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isAttemptsLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold tracking-tight">
                {stats.evaluatedCount}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Graded with official results
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Average Score */}
        <Card className="border-border/70 hover:border-primary/40 transition-all shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Average Performance
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isResultsLoading ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold tracking-tight">
                {stats.avgScore !== null ? `${stats.avgScore}%` : "—"}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats.resultsCount > 0
                ? `Across ${stats.resultsCount} published outcome${stats.resultsCount > 1 ? "s" : ""}`
                : "No published scores yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Assessments & Activity Section ── */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Recent Assessment Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Quick overview of your latest test invitations and attempt
              progress
            </CardDescription>
          </div>
          <Link
            href="/candidate/invitations"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            View All
            <ArrowRight className="size-3" />
          </Link>
        </CardHeader>

        <CardContent>
          {isAttemptsLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : recentAttempts.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="size-10 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <Code2 className="size-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                No assessment attempts recorded yet
              </p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                When you accept invitations or start coding assessments, your
                live progress will appear here.
              </p>
              <Link
                href="/candidate/invitations"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Browse Assessments
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentAttempts.map((item) => {
                const company = item.assessment?.company;
                const status = (item.status || "NOT_STARTED").toUpperCase();
                const scorePercentage =
                  item.result?.percentage ?? item.percentage;

                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-lg border border-border/60 bg-muted/40 shrink-0">
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
                        <h4 className="text-xs font-semibold text-foreground">
                          {item.assessment?.title || "Technical Assessment"}
                        </h4>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <span>{company?.name || "DevAssess Benchmark"}</span>
                          {item.assessment?.durationMinutes && (
                            <>
                              <span>•</span>
                              <span>
                                {item.assessment.durationMinutes} mins
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      {status === "IN_PROGRESS" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          In Progress
                        </span>
                      ) : status === "EVALUATED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          {scorePercentage != null
                            ? `${scorePercentage}%`
                            : "Evaluated"}
                        </span>
                      ) : status === "SUBMITTED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-secondary-foreground">
                          {status}
                        </span>
                      )}

                      {status === "IN_PROGRESS" ? (
                        <Link
                          href={`/candidate/assessments?assessmentId=${item.assessmentId || item.assessment?.id}&attemptId=${item.id}`}
                          className={buttonVariants({
                            variant: "default",
                            size: "xs" as any,
                            className: "h-7 text-[11px] px-2.5",
                          })}
                        >
                          Continue
                        </Link>
                      ) : (
                        <Link
                          href="/candidate/invitations"
                          className={buttonVariants({
                            variant: "outline",
                            size: "xs" as any,
                            className: "h-7 text-[11px] px-2.5",
                          })}
                        >
                          Details
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Candidate Portal Quick Access Grid ── */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Candidate Portal Hub & Modules
          </CardTitle>
          <CardDescription className="text-xs">
            Direct access to assessments, invitations, scorecards, submissions,
            and portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/candidate/invitations"
            className="group flex flex-col gap-1.5 rounded-lg border border-border/60 p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Code2 className="size-4" />
            </div>
            <span className="text-xs font-bold text-foreground">
              Coding Workspace
            </span>
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              Take active tests, compile code with Judge0, and submit solutions.
            </span>
          </Link>

          <Link
            href="/candidate/results"
            className="group flex flex-col gap-1.5 rounded-lg border border-border/60 p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award className="size-4" />
            </div>
            <span className="text-xs font-bold text-foreground">
              Scorecards & Results
            </span>
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              Inspect test breakdowns, pass/fail status, percentiles, and ranks.
            </span>
          </Link>

          <Link
            href="/candidate/submissions"
            className="group flex flex-col gap-1.5 rounded-lg border border-border/60 p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileCheck2 className="size-4" />
            </div>
            <span className="text-xs font-bold text-foreground">
              Solution Submissions
            </span>
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              Review written and code answers, test case pass counts, and
              feedback.
            </span>
          </Link>

          <Link
            href="/candidate/profile"
            className="group flex flex-col gap-1.5 rounded-lg border border-border/60 p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <User className="size-4" />
            </div>
            <span className="text-xs font-bold text-foreground">
              Candidate Profile
            </span>
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              Manage contact details, resume PDF, GitHub, and technical skills.
            </span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default CandidateOverview;
