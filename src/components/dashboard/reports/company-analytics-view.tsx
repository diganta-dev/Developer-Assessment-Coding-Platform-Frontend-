"use client";

import {
  AlertCircle,
  Award,
  Building2,
  CheckCircle2,
  FileCheck2,
  Globe,
  Mail,
  Percent,
  RefreshCw,
  TrendingUp,
  UserMinus,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe } from "@/hook/auth.hook";
import { useGetCompanyReport } from "@/hook/reports-analytics.hook";

export function CompanyAnalyticsView() {
  const { data: meRes, isLoading: isMeLoading } = useGetMe();
  const user = meRes?.data;

  // Resolve company ID
  const companyId = useMemo(() => {
    return (
      user?.companyId ||
      user?.companyMembers?.[0]?.companyId ||
      user?.company?.id ||
      ""
    );
  }, [user]);

  const {
    data: reportRes,
    isLoading: isReportLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useGetCompanyReport(companyId || undefined);

  const report = reportRes?.data;
  const funnel = report?.talentPipelineFunnel;
  const assessments = report?.assessmentBreakdown || [];

  if (isMeLoading || isReportLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-rose-500/30 bg-rose-500/5 p-8 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-foreground">
          Failed to Load Organization Report
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {error instanceof Error
            ? error.message
            : "An error occurred while loading executive company analytics. Ensure your account is associated with a company."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
        </Button>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="border-border/60 p-12 text-center">
        <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-sm font-bold text-foreground">
          No Company Organization Data
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Create assessments and invite candidates to generate executive hiring
          analytics.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {report.companyName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {report.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {report.email}
                </span>
              )}
              {report.website && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {report.website}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="h-9 text-xs"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 mr-1 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
              Assessments Created
            </span>
            <div className="text-2xl font-black text-foreground">
              {report.totalAssessmentsCreated}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Total platform assessments
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
              Total Candidates Invited
            </span>
            <div className="text-2xl font-black text-foreground">
              {report.totalCandidatesInvited}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {report.totalCandidatesStarted} started attempts
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
              Hiring Pass Rate
            </span>
            <div className="text-2xl font-black text-foreground text-emerald-600 dark:text-emerald-400">
              {report.overallHiringPassRate}%
            </div>
            <div className="text-[11px] text-muted-foreground">
              {report.totalCandidatesPassed} total candidates passed
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
              Organization Avg Score
            </span>
            <div className="text-2xl font-black text-foreground text-primary">
              {report.companyAverageScore}%
            </div>
            <div className="text-[11px] text-muted-foreground">
              Across all completed attempts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Talent Pipeline Funnel */}
      {funnel && (
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
              <span>Recruitment Funnel & Candidate Conversion</span>
              <span className="rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                Drop-off Rate: {funnel.dropOffRate}%
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Candidate progression from invitation to passing assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  1. Invited
                </span>
                <span className="text-xl font-bold text-foreground">
                  {funnel.invited}
                </span>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  2. Started
                </span>
                <span className="text-xl font-bold text-foreground">
                  {funnel.started}
                </span>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  3. Completed
                </span>
                <span className="text-xl font-bold text-foreground">
                  {funnel.completed}
                </span>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">
                  4. Passed
                </span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {funnel.passed}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Breakdown Table */}
      {assessments.length > 0 && (
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground">
              Assessment Roster Performance
            </CardTitle>
            <CardDescription className="text-xs">
              Performance breakdown across individual organization assessments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/70 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border/70 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3">Assessment Title</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Total Candidates</th>
                      <th className="p-3 text-right">Completed</th>
                      <th className="p-3 text-right">Average Score</th>
                      <th className="p-3 text-right">Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {assessments.map((ass) => (
                      <tr key={ass.assessmentId} className="hover:bg-muted/20">
                        <td className="p-3 font-semibold text-foreground">
                          {ass.title}
                        </td>
                        <td className="p-3">
                          <span className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
                            {ass.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-medium text-foreground">
                          {ass.totalCandidates}
                        </td>
                        <td className="p-3 text-right text-muted-foreground">
                          {ass.completedCandidates}
                        </td>
                        <td className="p-3 text-right font-bold text-foreground">
                          {ass.averageScore}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`font-bold ${
                              ass.passRate >= 70
                                ? "text-emerald-600 dark:text-emerald-400"
                                : ass.passRate >= 40
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {ass.passRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
