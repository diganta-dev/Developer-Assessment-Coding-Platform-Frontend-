import { ArrowRight, Code2, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CandidateMyAttempts } from "@/components/dashboard/candidate-dashboard";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Candidate Dashboard | Developer Assessment Platform",
  description:
    "Track your coding tests, invitations, and evaluation results in real-time.",
};

export default function CandidateDashboardPage() {
  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* ── Top Banner / Welcome ── */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
            <Code2 className="size-3.5" />
            Candidate Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Candidate Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Track your coding tests, invitations, and evaluation results in
            real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/candidate/invitations"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Mail className="mr-1.5 size-3.5" />
            View Invitations
          </Link>
          <Link
            href="/candidate/assessments"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Take Assessment
            <ArrowRight className="ml-1.5 size-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Primary Visual Component: Live Candidate Attempts ── */}
      <CandidateMyAttempts />

      {/* ── Candidate Center Quick Links ── */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Candidate Center & Quick Actions
          </CardTitle>
          <CardDescription className="text-xs">
            Manage your profile, portfolio, and review past assessment
            scorecards
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/candidate/assessments"
            className="flex flex-col gap-1 rounded-lg border border-border/60 p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            <span className="text-xs font-bold text-foreground">
              My Assessments
            </span>
            <span className="text-[11px] text-muted-foreground">
              View active and upcoming coding tests
            </span>
          </Link>

          <Link
            href="/candidate/results"
            className="flex flex-col gap-1 rounded-lg border border-border/60 p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            <span className="text-xs font-bold text-foreground">
              Test Results
            </span>
            <span className="text-[11px] text-muted-foreground">
              Check scores, feedback, and rankings
            </span>
          </Link>

          <Link
            href="/candidate/profile"
            className="flex flex-col gap-1 rounded-lg border border-border/60 p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            <span className="text-xs font-bold text-foreground">
              Candidate Profile
            </span>
            <span className="text-[11px] text-muted-foreground">
              Update resume, skills, and portfolio
            </span>
          </Link>

          <Link
            href="/candidate/invitations"
            className="flex flex-col gap-1 rounded-lg border border-border/60 p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
          >
            <span className="text-xs font-bold text-foreground">
              All Invitations
            </span>
            <span className="text-[11px] text-muted-foreground">
              Review invitation archive and history
            </span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
