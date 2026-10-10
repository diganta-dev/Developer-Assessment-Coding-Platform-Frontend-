"use client";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  FileCheck2,
  Filter,
  HelpCircle,
  Percent,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCompanyAllAssessments } from "@/hook/assessment.hook";
import {
  useGetAssessmentReport,
  useGetAssessmentStatistics,
  useGetPassFailStatistics,
  useGetScoreDistribution,
} from "@/hook/reports-analytics.hook";

interface AssessmentAnalyticsViewProps {
  initialAssessmentId?: string | null;
}

function formatDate(dateVal?: string | Date | null, fallback = "N/A"): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
}

export function AssessmentAnalyticsView({
  initialAssessmentId,
}: AssessmentAnalyticsViewProps) {
  const searchParams = useSearchParams();
  const queryAssessmentId = searchParams.get("assessmentId");

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    string | null
  >(initialAssessmentId || queryAssessmentId || null);

  // Fetch assessment list for the selector
  const { data: assessmentsRes, isLoading: isAssessmentsLoading } =
    useGetCompanyAllAssessments({ limit: 100 });

  const assessmentsList = assessmentsRes?.data || [];

  // Automatically select first assessment if none selected
  useEffect(() => {
    if (!selectedAssessmentId && assessmentsList.length > 0) {
      setSelectedAssessmentId(assessmentsList[0].id);
    }
  }, [selectedAssessmentId, assessmentsList]);

  // Queries for the selected assessment
  const {
    data: reportRes,
    isLoading: isReportLoading,
    isError: isReportError,
    error: reportError,
    refetch: refetchReport,
    isRefetching,
  } = useGetAssessmentReport(selectedAssessmentId || undefined);

  const { data: scoreDistRes } = useGetScoreDistribution(
    selectedAssessmentId || undefined,
  );
  const { data: passFailRes } = useGetPassFailStatistics(
    selectedAssessmentId || undefined,
  );
  const { data: assessmentStatsRes } = useGetAssessmentStatistics(
    selectedAssessmentId || undefined,
  );

  const report = reportRes?.data;
  const scoreDistribution = scoreDistRes?.data || report?.scoreDistribution;
  const passFailStats = passFailRes?.data;
  const assessmentStats = assessmentStatsRes?.data;

  return (
    <div className="space-y-6">
      {/* Assessment Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Assessment Analytics & Cohort Telemetry
            </h2>
            <p className="text-xs text-muted-foreground">
              Select an assessment to inspect completion funnel, difficulty
              diagnostics, and pass rates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Assessment Dropdown */}
          <select
            value={selectedAssessmentId || ""}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            disabled={isAssessmentsLoading || assessmentsList.length === 0}
            className="h-9 px-3 text-xs rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
          >
            {assessmentsList.length === 0 ? (
              <option value="">No assessments available</option>
            ) : (
              assessmentsList.map((ass) => (
                <option key={ass.id} value={ass.id}>
                  {ass.title} ({ass.status})
                </option>
              ))
            )}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchReport()}
            disabled={!selectedAssessmentId || isRefetching}
            className="h-9 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedAssessmentId ? (
        <Card className="border-border/60 p-12 text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">
            No Assessment Selected
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Please choose an assessment from the dropdown above to view reports
            and analytics.
          </p>
        </Card>
      ) : isReportLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : isReportError ? (
        <Card className="border-rose-500/30 bg-rose-500/5 p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            Unable to Load Assessment Analytics
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {reportError instanceof Error
              ? reportError.message
              : "An error occurred while compiling assessment metrics. Please ensure you have evaluator or company permissions."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchReport()}
            className="text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Try Again
          </Button>
        </Card>
      ) : !report ? (
        <Card className="border-border/60 p-12 text-center">
          <p className="text-xs text-muted-foreground">
            No analytics data recorded for this assessment yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Top Funnel and KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Invited & Started */}
            <Card className="border-border/70 shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Invited Candidates
                  </span>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-black text-foreground">
                  {report.invitedCandidates}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {report.startedCandidates} started ({report.completionRate}%
                  completion)
                </div>
              </CardContent>
            </Card>

            {/* Completed */}
            <Card className="border-border/70 shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Completed
                  </span>
                  <FileCheck2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-foreground">
                  {report.completedCandidates}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {report.totalCandidates} total submissions
                </div>
              </CardContent>
            </Card>

            {/* Pass Rate */}
            <Card className="border-border/70 shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Pass Rate
                  </span>
                  <Award className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-foreground">
                  {report.passRate}%
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {report.passedCandidates} passed · {report.failedCandidates}{" "}
                  failed
                </div>
              </CardContent>
            </Card>

            {/* Average Score */}
            <Card className="border-border/70 shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Average Score
                  </span>
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-foreground">
                  {report.averageScore} / {report.totalMarks}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Median: {report.medianScore} · Peak: {report.highestScore}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pass/Fail Diagnostics & Near-Miss Warning */}
          {passFailStats && (
            <Card className="border-border/70 shadow-xs bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Pass / Fail Threshold Diagnostics</span>
                  <span className="rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    Threshold: {passFailStats.passingScoreThreshold} marks (
                    {passFailStats.passingScoreType})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Cohort outcome variance and near-miss candidate
                  classification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Passed Candidates Average
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {passFailStats.averagePassedScore} marks
                    </span>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Failed Candidates Average
                    </span>
                    <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                      {passFailStats.averageFailedScore} marks
                    </span>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                    <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 block flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Near-Miss Candidates (&lt;10% gap)
                    </span>
                    <span className="text-base font-bold text-amber-700 dark:text-amber-300">
                      {passFailStats.nearMissCandidatesCount} candidates
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Frequency Distribution */}
          {scoreDistribution && (
            <Card className="border-border/70 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Score Frequency Distribution</span>
                  {"mean" in scoreDistribution && (
                    <span className="text-xs font-normal text-muted-foreground">
                      Mean: {scoreDistribution.mean} · Std Dev:{" "}
                      {scoreDistribution.standardDeviation}
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribution of candidate total scores grouped by percentage percentiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recharts Bar Visualizer */}
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        Array.isArray(scoreDistribution)
                          ? scoreDistribution
                          : scoreDistribution.buckets
                      }
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border/40"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="range"
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-xl border border-border/80 bg-background/95 p-2.5 shadow-xl backdrop-blur-md text-xs">
                                <p className="font-bold text-foreground mb-1">
                                  Score Band: {data.range}
                                </p>
                                <p className="text-muted-foreground">
                                  Candidates:{" "}
                                  <strong className="text-primary font-bold">
                                    {data.count}
                                  </strong>
                                </p>
                                <p className="text-muted-foreground">
                                  Cohort Share:{" "}
                                  <strong className="text-foreground font-semibold">
                                    {data.percentageOfTotal}%
                                  </strong>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="count"
                        name="Candidates"
                        fill="#3b82f6"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="pt-2 border-t border-border/40 space-y-2">
                  {(Array.isArray(scoreDistribution)
                    ? scoreDistribution
                    : scoreDistribution.buckets
                  ).map((bucket) => (
                    <div key={bucket.range} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-foreground">{bucket.range}</span>
                        <span className="text-muted-foreground">
                          {bucket.count} candidates ({bucket.percentageOfTotal}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(bucket.percentageOfTotal, bucket.count > 0 ? 5 : 0))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Problem Performance Matrix */}
          {report.questionPerformance &&
            report.questionPerformance.length > 0 && (
              <Card className="border-border/70 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-foreground">
                    Problem Performance & Accuracy Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Detailed diagnostics for each challenge in this assessment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Problem Accuracy Comparison Chart */}
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={report.questionPerformance.map((q) => ({
                          title:
                            q.title.length > 15
                              ? `${q.title.slice(0, 15)}...`
                              : q.title,
                          accuracy: q.accuracyRate,
                          avgScore: q.averageScore,
                          type: q.type,
                        }))}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-border/40"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="title"
                          stroke="#888888"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          unit="%"
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="rounded-xl border border-border/80 bg-background/95 p-2.5 shadow-xl backdrop-blur-md text-xs">
                                  <p className="font-bold text-foreground mb-1">
                                    {d.title} ({d.type})
                                  </p>
                                  <p className="text-muted-foreground">
                                    Accuracy:{" "}
                                    <strong className="text-emerald-600 font-bold">
                                      {d.accuracy}%
                                    </strong>
                                  </p>
                                  <p className="text-muted-foreground">
                                    Average Score:{" "}
                                    <strong className="text-primary font-bold">
                                      {d.avgScore} marks
                                    </strong>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="accuracy"
                          name="Accuracy Rate (%)"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-xl border border-border/70 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/40 text-muted-foreground border-b border-border/70 uppercase font-semibold text-[10px]">
                          <tr>
                            <th className="p-3">Problem Title</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Difficulty</th>
                            <th className="p-3 text-right">Max Marks</th>
                            <th className="p-3 text-right">Submissions</th>
                            <th className="p-3 text-right">Accuracy Rate</th>
                            <th className="p-3 text-right">Avg Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {report.questionPerformance.map((q) => (
                            <tr key={q.problemId} className="hover:bg-muted/20">
                              <td className="p-3 font-semibold text-foreground">
                                {q.title}
                              </td>
                              <td className="p-3">
                                <span className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
                                  {q.type}
                                </span>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                    q.difficulty === "EASY"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                      : q.difficulty === "MEDIUM"
                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  }`}
                                >
                                  {q.difficulty}
                                </span>
                              </td>
                              <td className="p-3 text-right font-medium text-foreground">
                                {q.maxMarks}
                              </td>
                              <td className="p-3 text-right text-muted-foreground">
                                {q.totalSubmissions} ({q.correctSubmissions}{" "}
                                correct)
                              </td>
                              <td className="p-3 text-right">
                                <span
                                  className={`font-bold ${
                                    q.accuracyRate >= 70
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : q.accuracyRate >= 40
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-rose-600 dark:text-rose-400"
                                  }`}
                                >
                                  {q.accuracyRate}%
                                </span>
                              </td>
                              <td className="p-3 text-right font-bold text-foreground">
                                {q.averageScore}
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

          {/* Anti-Cheat & Telemetry Summary */}
          {report.antiCheatStatistics && (
            <Card className="border-border/70 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Anti-Cheat & Integrity Audit Summary
                  </span>
                  <span className="rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {report.antiCheatStatistics.flaggedCandidatesCount} Flagged
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Summary of proctor violations detected during assessment
                  attempts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Total Violations Ingested
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {report.antiCheatStatistics.totalEvents}
                    </span>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                    <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 block">
                      Candidates Flagged
                    </span>
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-300">
                      {report.antiCheatStatistics.flaggedCandidatesCount}
                    </span>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Report Generated
                    </span>
                    <span className="text-xs font-semibold text-foreground block mt-1">
                      {formatDate(report.generatedAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
