"use client";

import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Code2,
  FileCode2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
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
import { useGetCandidateMyAttempts } from "@/hook/assessment.hook";
import { useGetMe } from "@/hook/auth.hook";
import type { ICandidateAttemptItem } from "@/types/assessment.type";

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

function formatDate(dateValue?: string | Date | null) {
  if (!dateValue) return "N/A";
  try {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "N/A";
  }
}

export function CandidateProfileView() {
  const { data: userData, isLoading: userLoading, error, refetch } = useGetMe();
  const user = userData?.data || userData;

  const { data: attemptsData } = useGetCandidateMyAttempts();
  const rawAttempts = attemptsData?.data;
  const attempts: ICandidateAttemptItem[] = Array.isArray(rawAttempts)
    ? rawAttempts
    : rawAttempts &&
        typeof rawAttempts === "object" &&
        "attempts" in rawAttempts &&
        Array.isArray(
          (rawAttempts as { attempts: ICandidateAttemptItem[] }).attempts,
        )
      ? (rawAttempts as { attempts: ICandidateAttemptItem[] }).attempts
      : [];

  const completedAttempts = attempts.filter(
    (a) => a.status === "EVALUATED" || a.status === "SUBMITTED",
  );

  if (userLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 text-center p-8">
        <CardContent className="flex flex-col items-center justify-center space-y-3 pt-4">
          <AlertCircle className="size-8 text-destructive" />
          <h3 className="text-base font-semibold">Failed to load profile</h3>
          <p className="text-xs text-muted-foreground">
            {error?.message || "Unable to retrieve your user credentials."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Candidate Hero Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-primary/5 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start sm:items-center gap-5">
            <Avatar className="size-20 sm:size-24 rounded-2xl ring-4 ring-background/90 shadow-md bg-muted shrink-0">
              {user.avatar ? (
                <AvatarImage
                  src={user.avatar}
                  alt={user.name || "Candidate"}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-2xl text-xl font-bold bg-primary/10 text-primary">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {user.name || "Candidate User"}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <BadgeCheck className="size-3.5" />
                  Verified Candidate
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="size-3" />
                  {user.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>

              <div className="pt-1">
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  ID: {user.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/candidate/assessments"
              className={buttonVariants({
                size: "sm",
                className: "gap-1.5 shadow-xs",
              })}
            >
              <Code2 className="size-3.5" />
              Take Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Candidate Portfolio Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Assessments Taken
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <Code2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{attempts.length}</div>
            <CardDescription className="text-xs">
              Total tests initiated or submitted
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed Evaluations
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{completedAttempts.length}</div>
            <CardDescription className="text-xs">
              Tests evaluated by scoring engines
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Performance Rank
            </CardTitle>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Trophy className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">Active</div>
            <CardDescription className="text-xs">
              Profile in good standing
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 3. Quick Portals Navigation */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Candidate Workspace Sections
          </CardTitle>
          <CardDescription className="text-xs">
            Quick links to tests, solutions, and score diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 grid gap-3 sm:grid-cols-3">
          <Link
            href="/candidate/results"
            className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 hover:border-primary/50 hover:shadow-2xs transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  My Test Results
                </span>
                <Trophy className="size-4 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                View verified percentiles, passing statuses, and question
                scorecard breakdowns.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-primary mt-3">
              <span>View scorecards</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            href="/candidate/submissions"
            className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 hover:border-primary/50 hover:shadow-2xs transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  Code Submissions
                </span>
                <FileCode2 className="size-4 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Browse submitted algorithms, test case outputs, and Judge0
                execution metrics.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-primary mt-3">
              <span>Inspect code</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            href="/candidate/invitations"
            className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card p-4 hover:border-primary/50 hover:shadow-2xs transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  Invitations & Tests
                </span>
                <Code2 className="size-4 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Enter private invitation keys, preview assessment guidelines,
                and launch test sessions.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-primary mt-3">
              <span>View tests</span>
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
