"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  FileQuestion,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  PenTool,
  Play,
  RefreshCw,
  Search,
  Sparkles,
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  useEvaluateCodingSubmission,
  useEvaluateMCQSubmission,
  useGetAllEvaluations,
} from "@/hook/evaluation.hook";
import type {
  EvaluationStatus,
  EvaluationType,
  IEvaluationListItem,
} from "@/types/evaluation.type";
import { ManualEvaluationDialog } from "./manual-evaluation-dialog";

export function EvaluatorGradingQueue() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedType, setSelectedType] = useState<EvaluationType | "ALL">(
    "ALL",
  );
  const [selectedStatus, setSelectedStatus] = useState<
    EvaluationStatus | "ALL"
  >("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [gradingEvaluation, setGradingEvaluation] =
    useState<IEvaluationListItem | null>(null);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetAllEvaluations({
      page,
      limit,
      type: selectedType === "ALL" ? undefined : selectedType,
      status: selectedStatus === "ALL" ? undefined : selectedStatus,
    });

  const evaluateCodingMutation = useEvaluateCodingSubmission();
  const evaluateMCQMutation = useEvaluateMCQSubmission();

  const evaluations: IEvaluationListItem[] = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const meta = data?.meta;

  // Filter client-side by search term
  const filteredEvaluations = useMemo(() => {
    if (!searchTerm.trim()) return evaluations;
    const term = searchTerm.toLowerCase();
    return evaluations.filter(
      (ev) =>
        ev.submission?.problem?.title.toLowerCase().includes(term) ||
        ev.submissionId.toLowerCase().includes(term) ||
        ev.evaluator?.name?.toLowerCase().includes(term) ||
        ev.evaluator?.email?.toLowerCase().includes(term),
    );
  }, [evaluations, searchTerm]);

  // Metric counts
  const stats = useMemo(() => {
    const total = meta?.total ?? evaluations.length;
    const pending = evaluations.filter((e) => e.status === "PENDING").length;
    const completed = evaluations.filter((e) => e.status === "COMPLETED").length;
    const manual = evaluations.filter((e) => e.type === "MANUAL").length;
    return { total, pending, completed, manual };
  }, [meta, evaluations]);

  const handleAutoEvaluate = (ev: IEvaluationListItem) => {
    const problemType = ev.submission?.problem?.type;

    if (problemType === "CODING") {
      evaluateCodingMutation.mutate(ev.submissionId, {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: ["evaluations"] });
          queryClient.invalidateQueries({ queryKey: ["evaluation", ev.id] });
          toast.add({
            title: "Automated Evaluation Complete",
            description: `Judge0 evaluated submission: ${res?.data?.passedTests ?? 0} tests passed.`,
            type: "success",
          });
        },
        onError: (err: unknown) => {
          const apiErr = err as { data?: { message?: string }; message?: string };
          toast.add({
            title: "Evaluation Failed",
            description: apiErr?.data?.message || apiErr?.message || "Could not execute code evaluation.",
            type: "error",
          });
        },
      });
    } else if (problemType === "MCQ") {
      evaluateMCQMutation.mutate(ev.submissionId, {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: ["evaluations"] });
          queryClient.invalidateQueries({ queryKey: ["evaluation", ev.id] });
          toast.add({
            title: "MCQ Evaluation Complete",
            description: `Result: ${res?.data?.isCorrect ? "Correct" : "Incorrect"} (${res?.data?.earnedMarks ?? 0} pts).`,
            type: "success",
          });
        },
        onError: (err: unknown) => {
          const apiErr = err as { data?: { message?: string }; message?: string };
          toast.add({
            title: "Evaluation Failed",
            description: apiErr?.data?.message || apiErr?.message || "Could not evaluate MCQ submission.",
            type: "error",
          });
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-1">
            <Award className="size-3.5" />
            Evaluation Engine
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Candidate Submissions & Grading Queue
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Evaluate candidate coding challenges, grade open-ended written questions, and review automated test cases.
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
          <RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
          Refresh Queue
        </Button>
      </div>

      {/* ── Statistics Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border-border/70 shadow-xs space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Total In Queue</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground">{stats.total}</span>
            <span className="text-xs text-muted-foreground">Submissions</span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 shadow-xs space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Pending Review</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.pending}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Needs Action</span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 shadow-xs space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Completed Grades</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.completed}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Evaluated</span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 shadow-xs space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Manual Rubric</p>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-primary">{stats.manual}</span>
            <span className="text-xs text-muted-foreground">Written/Custom</span>
          </div>
        </Card>
      </div>

      {/* ── Filters Toolbar ── */}
      <Card className="p-3 sm:p-4 border-border/70 shadow-xs bg-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by problem title, submission ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1">
              {(["ALL", "PENDING", "COMPLETED"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    selectedStatus === st
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <span className="text-border">|</span>

            {/* Type Filter */}
            <div className="flex items-center gap-1">
              {(["ALL", "AUTOMATIC", "MANUAL"] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => {
                    setSelectedType(tp);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    selectedType === tp
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Queue Table Content ── */}
      <Card className="border-border/70 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`eval-skel-${i + 1}`} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Failed to load evaluation queue
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {error instanceof Error
                ? error.message
                : "Unable to retrieve submissions queue. Please verify Evaluator or Admin permissions."}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="text-xs">
              Retry
            </Button>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-muted-foreground">
            <HelpCircle className="size-8 mx-auto opacity-40" />
            <p className="text-xs font-semibold text-foreground">No submissions found</p>
            <p className="text-[11px] max-w-sm mx-auto">
              No evaluation records match the selected status or type criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Problem & Type</th>
                  <th className="py-3 px-4">Evaluation Type</th>
                  <th className="py-3 px-4">Assigned Marks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Evaluator</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredEvaluations.map((ev) => {
                  const prob = ev.submission?.problem;
                  const maxMarks = prob?.marks ?? 10;
                  const isPending = ev.status === "PENDING";
                  const isCompleted = ev.status === "COMPLETED";

                  return (
                    <tr
                      key={ev.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">
                            {prob?.title || "Untitled Problem"}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className="font-bold text-primary">
                              {prob?.type || "QUESTION"}
                            </span>
                            <span>•</span>
                            <span>{prob?.difficulty || "MEDIUM"}</span>
                            <span>•</span>
                            <span className="font-mono">
                              Sub ID: {ev.submissionId.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            ev.type === "MANUAL"
                              ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                              : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                          }`}
                        >
                          {ev.type === "MANUAL" ? (
                            <PenTool className="size-2.5" />
                          ) : (
                            <Sparkles className="size-2.5" />
                          )}
                          {ev.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <span
                          className={
                            isCompleted
                              ? "text-emerald-600 dark:text-emerald-400 font-bold"
                              : "text-muted-foreground"
                          }
                        >
                          {ev.marks ?? 0}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {" "}
                          / {maxMarks} pts
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : isPending
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="size-2.5" />
                          ) : (
                            <Clock className="size-2.5" />
                          )}
                          {ev.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                        {ev.evaluator?.name || ev.evaluator?.email || "System / Unassigned"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manual grade button */}
                          <Button
                            type="button"
                            size="sm"
                            variant={isPending ? "default" : "outline"}
                            onClick={() => setGradingEvaluation(ev)}
                            className="h-7 px-2.5 text-[11px] font-semibold gap-1 cursor-pointer"
                          >
                            <PenTool className="size-3" />
                            {isPending ? "Grade" : "Edit Grade"}
                          </Button>

                          {/* Auto evaluate re-trigger for coding/mcq */}
                          {(prob?.type === "CODING" || prob?.type === "MCQ") && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={
                                evaluateCodingMutation.isPending ||
                                evaluateMCQMutation.isPending
                              }
                              onClick={() => handleAutoEvaluate(ev)}
                              title="Re-run automated evaluation"
                              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Play className="size-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Footer ── */}
        {meta && meta.totalPages > 1 && (
          <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} records)
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Manual Grading Rubric Modal ── */}
      <ManualEvaluationDialog
        evaluation={gradingEvaluation}
        isOpen={Boolean(gradingEvaluation)}
        onClose={() => setGradingEvaluation(null)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}

export default EvaluatorGradingQueue;
