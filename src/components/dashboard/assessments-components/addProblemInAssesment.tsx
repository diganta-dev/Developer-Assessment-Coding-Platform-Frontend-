"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileCheck2,
  FileQuestion,
  HelpCircle,
  Layers,
  Loader2,
  PenTool,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  useAddProblemInAssessment,
  useGetCompanyAllAssessments,
} from "@/hook/assessment.hook";
import { useGetCompanyProblems } from "@/hook/question.hook";
import type { IAssessment } from "@/types/assessment.type";
import type {
  Difficulty,
  IProblemListItem,
  ProblemType,
} from "@/types/question.type";

export interface AddProblemInAssessmentProps {
  assessmentId?: string;
  assessmentTitle?: string;
  assessmentTotalMarks?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface StagedProblem {
  problemId: string;
  title: string;
  type: ProblemType;
  difficulty: Difficulty;
  marks: number;
  questionOrder: number;
}

// ─── Helpers & Configurations ────────────────────────────────────────────────

const TYPE_CONFIG = {
  MCQ: {
    label: "MCQ",
    icon: FileQuestion,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  WRITTEN: {
    label: "Written",
    icon: PenTool,
    className:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  CODING: {
    label: "Coding",
    icon: Code2,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
};

const DIFFICULTY_CONFIG = {
  EASY: {
    label: "Easy",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  MEDIUM: {
    label: "Medium",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  HARD: {
    label: "Hard",
    className:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function AddProblemInAssessment({
  assessmentId: initialAssessmentId,
  assessmentTitle: initialAssessmentTitle,
  assessmentTotalMarks: initialAssessmentTotalMarks,
  onSuccess,
  onCancel,
}: AddProblemInAssessmentProps) {
  const queryClient = useQueryClient();

  // State: Target Assessment
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    initialAssessmentId || "",
  );

  // Filters for available Problem Bank questions
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<ProblemType | "ALL">("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | "ALL"
  >("ALL");

  // Staged problems queue
  const [stagedProblems, setStagedProblems] = useState<StagedProblem[]>([]);

  // React Query: Fetch Company Assessments (if no preselected assessment)
  const { data: assessmentsData, isLoading: isLoadingAssessments } =
    useGetCompanyAllAssessments();

  // Normalize assessments list
  const assessmentsList: IAssessment[] = useMemo(() => {
    if (!assessmentsData) return [];
    const raw =
      (assessmentsData as { data?: unknown })?.data ?? assessmentsData;
    if (Array.isArray(raw)) return raw as IAssessment[];
    if (Array.isArray((raw as { assessments?: unknown })?.assessments)) {
      return (raw as { assessments: IAssessment[] }).assessments;
    }
    return [];
  }, [assessmentsData]);

  // Determine current active assessment details
  const currentAssessment = useMemo(() => {
    if (!selectedAssessmentId) return null;
    return (
      assessmentsList.find((a) => a.id === selectedAssessmentId) || {
        id: selectedAssessmentId,
        title: initialAssessmentTitle || "Selected Assessment",
        totalMarks: initialAssessmentTotalMarks ?? 100,
      }
    );
  }, [
    selectedAssessmentId,
    assessmentsList,
    initialAssessmentTitle,
    initialAssessmentTotalMarks,
  ]);

  // React Query: Fetch Problem Bank questions
  const {
    data: problemsData,
    isLoading: isLoadingProblems,
    refetch: refetchProblems,
  } = useGetCompanyProblems({
    searchTerm: searchTerm || undefined,
    type: selectedType === "ALL" ? undefined : selectedType,
    difficulty: selectedDifficulty === "ALL" ? undefined : selectedDifficulty,
  });

  // Normalize problem bank items
  const availableProblems: IProblemListItem[] = useMemo(() => {
    if (!problemsData) return [];
    const raw = (problemsData as { data?: unknown })?.data ?? problemsData;
    if (Array.isArray(raw)) return raw as IProblemListItem[];
    return [];
  }, [problemsData]);

  // React Query Mutation: Add problems into assessment
  const addProblemsMutation = useAddProblemInAssessment();

  // Set of staged problem IDs for quick lookup
  const stagedProblemIds = useMemo(
    () => new Set(stagedProblems.map((p) => p.problemId)),
    [stagedProblems],
  );

  // Marks Calculation
  const totalAllocatedMarks = useMemo(
    () => stagedProblems.reduce((sum, p) => sum + (Number(p.marks) || 0), 0),
    [stagedProblems],
  );

  const targetMarks = currentAssessment?.totalMarks ?? 100;

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Add problem to staging queue
  const handleAddProblem = (problem: IProblemListItem) => {
    if (stagedProblemIds.has(problem.id)) {
      toast.add({
        title: "Already Added",
        description: `"${problem.title}" is already in your staging queue.`,
        type: "info",
      });
      return;
    }

    const defaultMarks = Number(problem.marks || problem.defaultMarks || 10);

    setStagedProblems((prev) => [
      ...prev,
      {
        problemId: problem.id,
        title: problem.title,
        type: problem.type,
        difficulty: problem.difficulty,
        marks: defaultMarks,
        questionOrder: prev.length + 1,
      },
    ]);
  };

  // Remove problem from staging queue
  const handleRemoveProblem = (problemId: string) => {
    setStagedProblems((prev) =>
      prev
        .filter((p) => p.problemId !== problemId)
        .map((p, index) => ({
          ...p,
          questionOrder: index + 1,
        })),
    );
  };

  // Update marks for a staged problem
  const handleMarksChange = (problemId: string, newMarks: number) => {
    setStagedProblems((prev) =>
      prev.map((p) =>
        p.problemId === problemId ? { ...p, marks: Math.max(0, newMarks) } : p,
      ),
    );
  };

  // Move problem position up in questionOrder
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setStagedProblems((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next.map((p, i) => ({ ...p, questionOrder: i + 1 }));
    });
  };

  // Move problem position down in questionOrder
  const handleMoveDown = (index: number) => {
    if (index >= stagedProblems.length - 1) return;
    setStagedProblems((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next.map((p, i) => ({ ...p, questionOrder: i + 1 }));
    });
  };

  // Clear all staged problems
  const handleClearAll = () => {
    setStagedProblems([]);
  };

  // Submit staged problems to backend
  const handleSubmit = () => {
    if (!selectedAssessmentId) {
      toast.add({
        title: "Select Assessment",
        description: "Please pick a target assessment to attach problems to.",
        type: "error",
      });
      return;
    }

    if (stagedProblems.length === 0) {
      toast.add({
        title: "No Problems Selected",
        description: "Please add at least one problem from the Problem Bank.",
        type: "error",
      });
      return;
    }

    // Validate marks
    const invalidMarks = stagedProblems.some((p) => !p.marks || p.marks <= 0);
    if (invalidMarks) {
      toast.add({
        title: "Invalid Marks",
        description: "Each question must be allocated greater than 0 marks.",
        type: "error",
      });
      return;
    }

    const payload = {
      problems: stagedProblems.map((p) => ({
        problemId: p.problemId,
        marks: Number(p.marks),
        questionOrder: Number(p.questionOrder),
      })),
    };

    addProblemsMutation.mutate(
      { assessmentId: selectedAssessmentId, payload },
      {
        onSuccess: () => {
          // Query invalidation in component (senior rule)
          queryClient.invalidateQueries({ queryKey: ["company-assessments"] });
          queryClient.invalidateQueries({ queryKey: ["assessments"] });
          queryClient.invalidateQueries({ queryKey: ["company-questions"] });

          toast.add({
            title: "Problems Added Successfully",
            description: `Successfully attached ${stagedProblems.length} problems to "${currentAssessment?.title || "Assessment"}".`,
            type: "success",
          });

          // Reset staging queue
          setStagedProblems([]);
          onSuccess?.();
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };
          toast.add({
            title: "Failed to Add Problems",
            description:
              apiErr?.data?.message ||
              apiErr?.message ||
              "An error occurred while attaching problems to the assessment.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <BookOpen className="size-3" />
              Assessment Builder
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Problem Attachment
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1.5">
            Add Problems to Assessment
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Select algorithmic questions, configure custom point weights, and
            arrange question sequence.
          </p>
        </div>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs"
          >
            Back
          </Button>
        )}
      </div>

      {/* ── Assessment Selection Banner ── */}
      <Card className="shadow-xs border-border/70 bg-card">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5 flex-1 max-w-md">
              <Label
                htmlFor="target-assessment-select"
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <Layers className="size-3.5 text-primary" />
                Target Assessment <span className="text-destructive">*</span>
              </Label>

              {initialAssessmentId ? (
                <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>{currentAssessment?.title}</span>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    ID: {initialAssessmentId.slice(0, 8)}...
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    id="target-assessment-select"
                    value={selectedAssessmentId}
                    onChange={(e) => setSelectedAssessmentId(e.target.value)}
                    disabled={isLoadingAssessments}
                    className="w-full h-9 pl-3 pr-8 rounded-lg border border-border bg-background text-xs font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">-- Choose an Assessment --</option>
                    {assessmentsList.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.totalMarks} Total Marks)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Assessment Target Marks Summary */}
            {currentAssessment && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Award className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Target Marks Scale
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-foreground">
                      {targetMarks} pts
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (Allocated:{" "}
                      <span
                        className={`font-semibold ${
                          totalAllocatedMarks === targetMarks
                            ? "text-emerald-600"
                            : totalAllocatedMarks > targetMarks
                              ? "text-rose-600"
                              : "text-amber-600"
                        }`}
                      >
                        {totalAllocatedMarks}
                      </span>{" "}
                      pts)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Two-Column Builder Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: Available Problem Bank (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="shadow-xs border-border/70">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" />
                    <span>1. Browse Problem Bank</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Find and select questions to add to this assessment.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchProblems()}
                  className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="size-3" />
                  Refresh
                </Button>
              </div>

              {/* Filters Toolbar */}
              <div className="pt-2 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search problems by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs"
                    id="search-problem-bank-input"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {/* Type Filter */}
                  {(
                    [
                      { key: "ALL", label: "All Types" },
                      { key: "MCQ", label: "MCQ" },
                      { key: "WRITTEN", label: "Written" },
                      { key: "CODING", label: "Coding" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedType(key)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                        selectedType === key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}

                  <span className="text-muted-foreground/40 mx-1">|</span>

                  {/* Difficulty Filter */}
                  {(
                    [
                      { key: "ALL", label: "All Levels" },
                      { key: "EASY", label: "Easy" },
                      { key: "MEDIUM", label: "Medium" },
                      { key: "HARD", label: "Hard" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDifficulty(key)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                        selectedDifficulty === key
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 max-h-[580px] overflow-y-auto pr-2">
              {isLoadingProblems ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`problem-skeleton-${i + 1}`}
                    className="p-3 rounded-lg border border-border/60 bg-muted/20 animate-pulse space-y-2"
                  >
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted/60 rounded w-1/3" />
                  </div>
                ))
              ) : availableProblems.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <HelpCircle className="size-7 mx-auto opacity-40" />
                  <p className="text-xs font-semibold">No questions found</p>
                  <p className="text-[11px]">
                    Create questions in the Problem Bank or adjust your filters.
                  </p>
                </div>
              ) : (
                availableProblems.map((problem) => {
                  const isStaged = stagedProblemIds.has(problem.id);
                  const typeConf = TYPE_CONFIG[problem.type] || TYPE_CONFIG.MCQ;
                  const diffConf =
                    DIFFICULTY_CONFIG[problem.difficulty] ||
                    DIFFICULTY_CONFIG.MEDIUM;
                  const TypeIcon = typeConf.icon;

                  return (
                    <div
                      key={problem.id}
                      className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
                        isStaged
                          ? "border-primary/40 bg-primary/[0.03]"
                          : "border-border/70 hover:border-border hover:bg-muted/10 bg-card"
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeConf.className}`}
                          >
                            <TypeIcon className="size-2.5" />
                            {typeConf.label}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${diffConf.className}`}
                          >
                            {diffConf.label}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground ml-1">
                            Default: {problem.marks || 10} pts
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-foreground line-clamp-1 pt-0.5">
                          {problem.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {problem.description || "No description provided."}
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant={isStaged ? "secondary" : "outline"}
                        disabled={isStaged}
                        onClick={() => handleAddProblem(problem)}
                        className="shrink-0 h-8 px-2.5 text-xs gap-1"
                      >
                        {isStaged ? (
                          <>
                            <Check className="size-3 text-emerald-500" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="size-3 text-primary" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT COLUMN: Staged Questions in Assessment (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-xs border-border/70 bg-card">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileCheck2 className="size-4 text-primary" />
                    <span>2. Staged Assessment Questions</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {stagedProblems.length} questions configured
                  </CardDescription>
                </div>
                {stagedProblems.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-7 px-2 text-[11px] text-destructive hover:text-destructive"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Progress towards totalMarks */}
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    Marks Allocation
                  </span>
                  <span className="font-bold text-foreground">
                    {totalAllocatedMarks} / {targetMarks} pts
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      totalAllocatedMarks === targetMarks
                        ? "bg-emerald-500"
                        : totalAllocatedMarks > targetMarks
                          ? "bg-rose-500"
                          : "bg-amber-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (totalAllocatedMarks / (targetMarks || 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
                {totalAllocatedMarks > targetMarks && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="size-3" />
                    Allocated marks exceed assessment target ({targetMarks} pts)
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-4 max-h-[480px] overflow-y-auto pr-2">
              {stagedProblems.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground space-y-2 border-2 border-dashed border-border/60 rounded-xl p-4">
                  <Layers className="size-8 mx-auto opacity-30" />
                  <p className="text-xs font-semibold text-foreground">
                    No questions staged yet
                  </p>
                  <p className="text-[11px] max-w-xs mx-auto">
                    Click &quot;+ Add&quot; on questions from the Problem Bank
                    on the left to include them here.
                  </p>
                </div>
              ) : (
                stagedProblems.map((problem, index) => {
                  const typeConf = TYPE_CONFIG[problem.type] || TYPE_CONFIG.MCQ;
                  const TypeIcon = typeConf.icon;

                  return (
                    <div
                      key={problem.problemId}
                      className="p-3 rounded-xl border border-border/70 bg-card shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center justify-center size-5 rounded-md bg-muted text-[10px] font-bold font-mono text-muted-foreground">
                            #{problem.questionOrder}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${typeConf.className}`}
                          >
                            <TypeIcon className="size-2.5" />
                            {typeConf.label}
                          </span>
                        </div>

                        {/* Order & Remove Controls */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveUp(index)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                            title="Move Up"
                          >
                            <ArrowUp className="size-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === stagedProblems.length - 1}
                            onClick={() => handleMoveDown(index)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                            title="Move Down"
                          >
                            <ArrowDown className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveProblem(problem.problemId)
                            }
                            className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors ml-1"
                            title="Remove Question"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-foreground line-clamp-1">
                        {problem.title}
                      </p>

                      {/* Marks Allocation input */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <Label
                          htmlFor={`marks-input-${problem.problemId}`}
                          className="text-[11px] text-muted-foreground font-medium"
                        >
                          Marks Allocated:
                        </Label>
                        <div className="w-20">
                          <Input
                            id={`marks-input-${problem.problemId}`}
                            type="number"
                            min={1}
                            value={problem.marks}
                            onChange={(e) =>
                              handleMarksChange(
                                problem.problemId,
                                Number(e.target.value),
                              )
                            }
                            className="h-7 text-xs text-right font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>

            {/* Submit Action */}
            <div className="p-4 border-t border-border/40 bg-muted/20 rounded-b-xl space-y-2">
              <Button
                type="button"
                disabled={
                  stagedProblems.length === 0 ||
                  !selectedAssessmentId ||
                  addProblemsMutation.isPending
                }
                onClick={handleSubmit}
                className="w-full text-xs font-semibold gap-1.5"
                id="submit-add-problems-btn"
              >
                {addProblemsMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Adding Problems...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    Save & Attach {stagedProblems.length} Problems
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AddProblemInAssessment;
