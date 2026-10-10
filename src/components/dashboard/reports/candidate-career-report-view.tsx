"use client";

import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Code2,
  FileCheck2,
  HelpCircle,
  Layers,
  Percent,
  RefreshCw,
  ShieldCheck,
  Target,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe } from "@/hook/auth.hook";
import { useGetCandidateReport } from "@/hook/reports-analytics.hook";

interface CandidateCareerReportViewProps {
  candidateId?: string | null;
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

export function CandidateCareerReportView({
  candidateId: propCandidateId,
}: CandidateCareerReportViewProps) {
  const { data: meRes, isLoading: isMeLoading } = useGetMe();
  const user = meRes?.data;

  const candidateId = propCandidateId || user?.id || user?._id || "";

  const {
    data: reportRes,
    isLoading: isReportLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useGetCandidateReport(candidateId || undefined);

  const report = reportRes?.data;
  const skillMastery = report?.skillMastery || [];
  const history = report?.assessmentHistory || [];

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
          Unable to Load Candidate Career Report
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred while compiling your candidate portfolio telemetry."}
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
        <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-sm font-bold text-foreground">
          No Candidate Career Report Found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Take assessments to build your talent portfolio and track skill
          category mastery.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {report.name}&apos;s Career Telemetry Report
            </h2>
            <p className="text-xs text-muted-foreground">
              {report.email} · Multi-Assessment Technical Performance Benchmark
            </p>
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
              Assessments Taken
            </span>
            <div className="text-2xl font-black text-foreground">
              {report.totalAssessmentsAttempted}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {report.totalCompleted} completed
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
              Overall Pass Rate
            </span>
            <div className="text-2xl font-black text-foreground text-emerald-600 dark:text-emerald-400">
              {report.overallPassRate}%
            </div>
            <div className="text-[11px] text-muted-foreground">
              {report.totalPassed} passed · {report.totalFailed} failed
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
              Average Score
            </span>
            <div className="text-2xl font-black text-foreground text-primary">
              {report.averagePercentage}%
            </div>
            <div className="text-[11px] text-muted-foreground">
              Personal peak: {report.highestPercentage}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
              Integrity Score
            </span>
            <div className="text-2xl font-black text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-6 w-6 text-emerald-500" />
              <span>
                {report.totalAntiCheatViolations === 0
                  ? "100%"
                  : `${Math.max(0, 100 - report.totalAntiCheatViolations * 10)}%`}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              {report.totalAntiCheatViolations} total infractions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Mastery Category Cards */}
      {skillMastery.length > 0 && (
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground">
              Skill Category Mastery & Accuracy
            </CardTitle>
            <CardDescription className="text-xs">
              Demonstrated accuracy breakdown across coding, written, and MCQ
              formats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skill Mastery Recharts Bar Visualizer */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={skillMastery.map((cat) => ({
                    type: cat.problemType,
                    accuracy: cat.accuracyRate,
                    avgScore: cat.averageScorePercentage,
                    attempted: cat.attemptedCount,
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/40"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="type"
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
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-border/80 bg-background/95 p-2.5 shadow-xl backdrop-blur-md text-xs">
                            <p className="font-bold text-foreground mb-1">
                              Skill Domain: {d.type}
                            </p>
                            <p className="text-muted-foreground">
                              Accuracy Rate:{" "}
                              <strong className="text-emerald-600 font-bold">
                                {d.accuracy}%
                              </strong>
                            </p>
                            <p className="text-muted-foreground">
                              Average Score:{" "}
                              <strong className="text-primary font-bold">
                                {d.avgScore}%
                              </strong>
                            </p>
                            <p className="text-muted-foreground">
                              Problems Attempted:{" "}
                              <strong className="text-foreground font-semibold">
                                {d.attempted}
                              </strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: 10 }}
                  />
                  <Bar
                    dataKey="accuracy"
                    name="Accuracy (%)"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="avgScore"
                    name="Avg Score (%)"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/40">
              {skillMastery.map((cat) => (
                <div
                  key={cat.problemType}
                  className="rounded-2xl border border-border/70 bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground uppercase">
                      {cat.problemType}
                    </span>
                    <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {cat.attemptedCount} / {cat.totalProblemsEncountered}{" "}
                      attempted
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="font-bold text-foreground">
                        {cat.accuracyRate}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, cat.accuracyRate)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    <span>Average Score</span>
                    <span className="font-semibold text-foreground">
                      {cat.averageScorePercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Score Trajectory Chart */}
      {history.length > 0 && (
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
              <span>Assessment Score Performance Trajectory</span>
              <span className="text-xs font-normal text-muted-foreground">
                {history.length} completed attempts
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Candidate percentage score curve across chronological assessment attempts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[...history]
                    .reverse()
                    .map((att, idx) => ({
                      index: idx + 1,
                      title:
                        att.assessmentTitle.length > 15
                          ? `${att.assessmentTitle.slice(0, 15)}...`
                          : att.assessmentTitle,
                      percentage: att.percentage,
                      date: formatDate(att.submittedAt),
                      marks: `${att.obtainedMarks}/${att.totalMarks}`,
                    }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-border/80 bg-background/95 p-2.5 shadow-xl backdrop-blur-md text-xs">
                            <p className="font-bold text-foreground mb-1">
                              {d.title}
                            </p>
                            <p className="text-muted-foreground">
                              Score:{" "}
                              <strong className="text-primary font-bold">
                                {d.percentage}% ({d.marks})
                              </strong>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Completed: {d.date}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    name="Score Percentage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment History Table */}
      {history.length > 0 && (
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground">
              Assessment Attempt History
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological log of completed assessment attempts and benchmark
              ranks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/70 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border/70 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3">Assessment</th>
                      <th className="p-3">Company</th>
                      <th className="p-3 text-right">Score</th>
                      <th className="p-3 text-right">Rank</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {history.map((att) => (
                      <tr key={att.attemptId} className="hover:bg-muted/20">
                        <td className="p-3 font-semibold text-foreground">
                          {att.assessmentTitle}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {att.companyName}
                        </td>
                        <td className="p-3 text-right font-bold text-foreground">
                          {att.obtainedMarks} / {att.totalMarks} (
                          {att.percentage}%)
                        </td>
                        <td className="p-3 text-right">
                          {att.rank ? (
                            <span className="font-bold text-primary">
                              #{att.rank}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              att.status === "PASSED"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : att.status === "FAILED"
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {formatDate(att.submittedAt)}
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
