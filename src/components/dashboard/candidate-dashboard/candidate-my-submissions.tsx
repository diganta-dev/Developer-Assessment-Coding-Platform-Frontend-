"use client";

import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  HelpCircle,
  Layers,
  RefreshCw,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SubmissionScoreBreakdownCard } from "@/components/dashboard/assessments-components/submission-score-breakdown-card";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMySubmissions } from "@/hook/submission.hook";
import type {
  ISubmissionItem,
  SubmissionStatus,
} from "@/types/submission.type";

function formatDate(dateStr?: string | Date | null, fallback = "N/A"): string {
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

export function CandidateMySubmissions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [correctFilter, setCorrectFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected submission for detail dialog
  const [selectedSubmission, setSelectedSubmission] =
    useState<ISubmissionItem | null>(null);

  const queryParams = useMemo(() => {
    return {
      page: currentPage,
      limit: pageSize,
      searchTerm: searchTerm.trim() || undefined,
      status:
        statusFilter !== "ALL"
          ? (statusFilter as SubmissionStatus)
          : undefined,
      isCorrect:
        correctFilter === "CORRECT"
          ? true
          : correctFilter === "INCORRECT"
            ? false
            : undefined,
      sortBy: "submittedAt",
      sortOrder: "desc" as const,
    };
  }, [currentPage, searchTerm, statusFilter, correctFilter]);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetMySubmissions(queryParams);

  const submissions = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || 1;
  const totalSubmissions = meta?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                My Submissions
              </h1>
              <p className="text-xs text-muted-foreground">
                Track code executions, test case passes, MCQ picks, and written answers across all assessments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-xs h-9"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by problem title..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/30 p-1 text-xs">
                {(["ALL", "PASSED", "FAILED", "EVALUATED", "PENDING"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status);
                        setCurrentPage(1);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                        statusFilter === status
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>

              {/* Accuracy Tabs */}
              <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/30 p-1 text-xs">
                {(["ALL", "CORRECT", "INCORRECT"] as const).map((corr) => (
                  <button
                    key={corr}
                    type="button"
                    onClick={() => {
                      setCorrectFilter(corr);
                      setCurrentPage(1);
                    }}
                    className={`rounded-lg px-2 py-1 text-xs font-medium transition-all ${
                      correctFilter === corr
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {corr === "ALL" ? "All Results" : corr === "CORRECT" ? "Correct" : "Incorrect"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-border/60 p-4 animate-pulse">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-rose-500/30 bg-rose-500/5 p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            Failed to Load Submissions
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while fetching your submission history."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
          </Button>
        </Card>
      ) : submissions.length === 0 ? (
        <Card className="border-border/60 p-12 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mx-auto">
            <Code2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            No Submissions Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchTerm || statusFilter !== "ALL" || correctFilter !== "ALL"
              ? "No solutions match your active filters. Try adjusting your search query."
              : "You have not submitted any problem solutions yet. Take an assessment to record your solutions."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>
              Showing {submissions.length} of {totalSubmissions} submissions
            </span>
          </div>

          <div className="space-y-3">
            {submissions.map((sub) => {
              const problem = sub.problem;
              const isCorrect = sub.isCorrect === true;
              const isIncorrect = sub.isCorrect === false;

              return (
                <Card
                  key={sub.id}
                  className="border-border/70 hover:border-border transition-all shadow-xs overflow-hidden"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Problem and Assessment Title */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground hover:underline cursor-pointer truncate" onClick={() => setSelectedSubmission(sub)}>
                            {problem?.title || "Problem Solution"}
                          </span>

                          {problem?.type && (
                            <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              {problem.type}
                            </span>
                          )}

                          {problem?.difficulty && (
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                problem.difficulty === "EASY"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : problem.difficulty === "MEDIUM"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {problem.difficulty}
                            </span>
                          )}

                          {/* Status Badge */}
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              sub.status === "PASSED" || sub.status === "EVALUATED"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : sub.status === "FAILED"
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {sub.attempt?.assessment?.title && (
                            <span className="truncate max-w-xs font-medium text-foreground">
                              {sub.attempt.assessment.title}
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(sub.submittedAt)}
                          </span>

                          {sub.language && (
                            <span className="font-mono text-[11px] bg-muted/60 px-1.5 py-0.2 rounded">
                              {sub.language}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Stats and Detail Trigger */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Result indicator */}
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            {isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : isIncorrect ? (
                              <XCircle className="h-4 w-4 text-rose-500" />
                            ) : (
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-xs font-bold text-foreground">
                              {sub.marks != null
                                ? `${sub.marks} Marks`
                                : isCorrect
                                  ? "Passed"
                                  : isIncorrect
                                    ? "Failed"
                                    : "Ungraded"}
                            </span>
                          </div>

                          {sub.passedTests !== undefined && sub.passedTests > 0 && (
                            <span className="text-[11px] text-muted-foreground block">
                              {sub.passedTests} passed · {sub.failedTests} failed
                            </span>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubmission(sub)}
                          className="text-xs h-8"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="text-xs h-8"
              >
                Previous
              </Button>

              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="text-xs h-8"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <Dialog
          open={Boolean(selectedSubmission)}
          onOpenChange={(open) => !open && setSelectedSubmission(null)}
        >
          <DialogContent className="w-[96vw] max-w-[96vw] h-[92vh] max-h-[94vh] flex flex-col p-0 gap-0 overflow-hidden border-border/80 bg-background/98 shadow-2xl backdrop-blur-xl">
            <DialogHeader className="p-5 border-b border-border/60 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    <span>
                      {selectedSubmission.problem?.title || "Submission Breakdown"}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Submitted on {formatDate(selectedSubmission.submittedAt)} · Attempt ID: {selectedSubmission.attemptId}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Score Calculation Card Component */}
              <SubmissionScoreBreakdownCard
                submissionId={selectedSubmission.id}
                defaultExpanded={true}
              />

              {/* Source Code View for Coding Questions */}
              {selectedSubmission.sourceCode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 text-primary" />
                      Submitted Code ({selectedSubmission.language || "Plain Text"})
                    </span>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto max-h-72">
                    <pre>
                      <code>{selectedSubmission.sourceCode}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Written Answer View */}
              {selectedSubmission.answerText && (
                <div className="space-y-2">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    Written Response
                  </span>
                  <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.answerText}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
