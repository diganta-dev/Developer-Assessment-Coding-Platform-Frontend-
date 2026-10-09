"use client";

import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Flame,
  HelpCircle,
  Layers,
  Medal,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMyResults } from "@/hook/ranking.hook";
import type { IAssessmentResultData } from "@/types/ranking.type";

export function CandidateMyResults() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] =
    useState<IAssessmentResultData | null>(null);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetMyResults();

  const results: IAssessmentResultData[] = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return results;
    const term = searchTerm.toLowerCase();
    return results.filter(
      (r) =>
        r.assessmentTitle.toLowerCase().includes(term) ||
        r.attemptId.toLowerCase().includes(term),
    );
  }, [results, searchTerm]);

  // Aggregate candidate performance analytics
  const metrics = useMemo(() => {
    const total = results.length;
    if (total === 0) {
      return {
        total: 0,
        passed: 0,
        passRate: 0,
        avgPercentage: 0,
        bestScore: 0,
      };
    }
    const passed = results.filter((r) => r.status === "PASSED").length;
    const passRate = Math.round((passed / total) * 100);
    const avgPercentage = Math.round(
      results.reduce((sum, r) => sum + (r.percentage || 0), 0) / total,
    );
    const bestScore = Math.max(...results.map((r) => r.percentage || 0));
    return { total, passed, passRate, avgPercentage, bestScore };
  }, [results]);

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Trophy className="size-3.5" />
            Candidate Career Scorecards
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            My Official Assessment Results & Rankings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            View verified evaluation outcomes, competitive percentile ranks, and
            question breakdown scores.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-xs font-semibold gap-1.5 h-8 shrink-0 cursor-pointer"
        >
          <RefreshCw
            className={`size-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`}
          />
          Refresh Results
        </Button>
      </div>

      {/* ── Summary KPI Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border-border/70 shadow-xs space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Tests Taken
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground">
              {metrics.total}
            </span>
            <span className="text-xs text-muted-foreground">Assessments</span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 shadow-xs space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Passed Assessments
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.passed}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {metrics.passRate}% Pass Rate
            </span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 shadow-xs space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Average Score
          </p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-primary">
              {metrics.avgPercentage}%
            </span>
            <span className="text-xs text-muted-foreground">
              Mean Performance
            </span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 shadow-xs space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Top Score</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-500">
              {metrics.bestScore}%
            </span>
            <span className="text-xs text-amber-500 font-medium">
              Personal Best
            </span>
          </div>
        </Card>
      </div>

      {/* ── Filter / Search Bar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search completed assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* ── Results Cards Grid ── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`res-skel-${i + 1}`} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-12 text-center space-y-3 border border-border/70 rounded-2xl bg-card">
          <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Failed to retrieve assessment results
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {error instanceof Error
              ? error.message
              : "Could not load candidate portfolio results. Please try again."}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="py-16 text-center space-y-3 border-2 border-dashed border-border/60 rounded-2xl bg-card/40 p-6">
          <Trophy className="size-10 mx-auto text-muted-foreground opacity-40" />
          <h3 className="text-sm font-bold text-foreground">
            No published results yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Once your assessment attempts are evaluated and officially published
            by the company, your scores and rankings will appear here.
          </p>
          <div className="pt-2">
            <Link
              href="/candidate/assessments"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Code2 className="size-3.5" />
              Take or Practice Assessments
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResults.map((result) => {
            const isPassed = result.status === "PASSED";

            return (
              <Card
                key={result.resultId || result.attemptId}
                className="overflow-hidden border-border/70 shadow-xs hover:border-border transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  {/* Top Header Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        isPassed
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      {result.status}
                    </span>

                    {result.rank != null && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-muted text-foreground border border-border/60">
                        <Medal className="size-3 text-amber-500" />
                        Rank #{result.rank} / {result.totalParticipants}
                      </span>
                    )}
                  </div>

                  {/* Title & Score */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground line-clamp-1">
                      {result.assessmentTitle}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Attempt ID: {result.attemptId.slice(0, 8)}...
                    </p>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">
                        Final Score
                      </span>
                      <span className="font-bold text-foreground">
                        {result.obtainedMarks} / {result.totalMarks} pts (
                        {result.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isPassed ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        style={{
                          width: `${Math.min(100, result.percentage)}%`,
                        }}
                      />
                    </div>
                    {result.passingScore != null && (
                      <p className="text-[10px] text-muted-foreground">
                        Passing Threshold: {result.passingScore} pts
                      </p>
                    )}
                  </div>

                  {/* Time & Publication */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {result.timeTakenSeconds != null
                        ? `${Math.round(result.timeTakenSeconds / 60)} min`
                        : "Completed"}
                    </span>
                    {result.publishedAt && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(result.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-muted/20 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedResult(result)}
                    className="w-full text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    <FileText className="size-3.5" />
                    View Scorecard Breakdown
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Scorecard Breakdown Modal ── */}
      <Dialog
        open={Boolean(selectedResult)}
        onOpenChange={(open) => {
          if (!open) setSelectedResult(null);
        }}
      >
        <DialogContent
          size="xl"
          className="max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl"
        >
          <DialogHeader className="p-5 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                <Trophy className="size-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-base font-bold text-foreground">
                  Assessment Scorecard Breakdown
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Performance evaluation summary and detailed problem scores
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedResult && (
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  {selectedResult.assessmentTitle}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Candidate: {selectedResult.candidateName} (
                  {selectedResult.candidateEmail})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                  <p className="text-muted-foreground">Result Outcome</p>
                  <p
                    className={`text-base font-bold ${
                      selectedResult.status === "PASSED"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {selectedResult.status}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                  <p className="text-muted-foreground">Final Score</p>
                  <p className="text-base font-bold text-foreground">
                    {selectedResult.obtainedMarks} / {selectedResult.totalMarks}{" "}
                    ({selectedResult.percentage}%)
                  </p>
                </div>
              </div>

              {/* Question Breakdown list if available */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Problems Breakdown ({selectedResult.breakdown?.length || 0})
                </h5>

                {!selectedResult.breakdown ||
                selectedResult.breakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center border border-dashed rounded-lg">
                    Detailed per-problem breakdown is unavailable for this
                    attempt.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedResult.breakdown.map((prob) => (
                      <div
                        key={prob.problemId}
                        className="p-3 rounded-xl border border-border/50 bg-card text-xs flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">
                            {prob.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">
                            {prob.type}
                          </span>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-bold ${
                              prob.isCorrect
                                ? "text-emerald-600"
                                : "text-foreground"
                            }`}
                          >
                            {prob.obtainedMarks} / {prob.maxMarks} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="p-4 border-t border-border/60 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedResult(null)}
              className="text-xs"
            >
              Close Scorecard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CandidateMyResults;
