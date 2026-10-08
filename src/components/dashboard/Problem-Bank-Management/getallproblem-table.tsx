"use client";

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Code2,
  Eye,
  FileQuestion,
  Filter,
  Loader2,
  Pencil,
  PenTool,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EditProblemDialog } from "./edit-problem-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import {
  useDeleteCompanyProblem,
  useGetAllQuestion,
  useGetCompanyProblems,
  useGetOneProblem,
} from "@/hook/question.hook";
import type {
  Difficulty,
  IProblemFilters,
  IProblemListItem,
  ProblemType,
  SortOrder,
} from "@/types";

// ─── Constants ──────────────────────────────────────────────────────────────

const SCOPE_OPTIONS = [
  { value: "COMPANY" as const, label: "My Company" },
  { value: "ALL" as const, label: "Platform Bank" },
];

const DIFFICULTY_OPTIONS: { value: Difficulty | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Difficulties" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const TYPE_OPTIONS: { value: ProblemType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Types" },
  { value: "MCQ", label: "MCQ" },
  { value: "WRITTEN", label: "Written" },
  { value: "CODING", label: "Coding" },
];

const LIMIT_OPTIONS = [10, 20, 50];

// ─── Sub-components ─────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const config = {
    EASY: {
      label: "Easy",
      className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    MEDIUM: {
      label: "Medium",
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    HARD: {
      label: "Hard",
      className: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
  }[difficulty];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function TypeBadge({ type }: { type: ProblemType }) {
  const config = {
    MCQ: {
      icon: FileQuestion,
      label: "MCQ",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    WRITTEN: {
      icon: PenTool,
      label: "Written",
      className: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    },
    CODING: {
      icon: Code2,
      label: "Coding",
      className: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    },
  }[type];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.className}`}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}) {
  if (sortBy !== column)
    return <ChevronsUpDown className="size-3 text-muted-foreground/50" />;
  return sortOrder === "asc" ? (
    <ChevronUp className="size-3 text-primary" />
  ) : (
    <ChevronDown className="size-3 text-primary" />
  );
}

function SkeletonRow() {
  return (
    <TableRow className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded-md bg-muted w-3/4" />
        </TableCell>
      ))}
    </TableRow>
  );
}

function SelectFilter<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (val: T) => void;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-8 pl-2.5 pr-7 rounded-lg border border-border bg-background text-xs font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
    </div>
  );
}

// ─── Problem Detail Dialog (uses useGetOneProblem) ──────────────────────────

function ProblemDetailDialog({
  problemId,
  onClose,
  onEdit,
}: {
  problemId: string | null;
  onClose: () => void;
  onEdit: (problemId: string) => void;
}) {
  const { data, isLoading, isError, error, refetch } = useGetOneProblem(
    problemId ?? "",
  );
  // Backend returns { statusCode, success, message, data: { ... } }
  const res = data as
    | { data?: Record<string, unknown>; [key: string]: unknown }
    | undefined;
  const problem = (res?.data ?? res) as Record<string, any> | undefined;

  return (
    <Dialog
      open={Boolean(problemId)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="w-[96vw] max-w-[96vw] h-[92vh] max-h-[94vh] overflow-y-auto shadow-2xl">
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs">Loading problem details…</p>
          </div>
        )}

        {isError && (
          <div className="py-8 text-center space-y-3">
            <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Failed to load problem
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(error as Error)?.message ||
                  "Could not retrieve problem details."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-3.5" /> Retry
            </Button>
          </div>
        )}

        {problem && !isLoading && !isError && (
          <>
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={problem.type} />
                <DifficultyBadge difficulty={problem.difficulty} />
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted border border-border text-foreground">
                  {problem.marks ?? problem.defaultMarks ?? 0} pts
                </span>
                {problem.company?.name && (
                  <span className="text-xs text-muted-foreground font-medium ml-auto">
                    {problem.company.name}
                  </span>
                )}
              </div>
              <DialogTitle className="text-lg font-bold text-foreground leading-snug">
                {problem.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description / Statement
                </h4>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </div>
              </div>

              {/* MCQ Details */}
              {problem.type === "MCQ" && problem.mcqQuestion && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Options ({problem.mcqQuestion.options?.length ?? 0})
                  </h4>
                  <div className="space-y-2">
                    {problem.mcqQuestion.options?.map(
                      (opt: any, idx: number) => {
                        const label = String.fromCharCode(65 + idx);
                        return (
                          <div
                            key={opt.id || idx}
                            className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                              opt.isCorrect
                                ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-950 dark:text-emerald-200"
                                : "border-border/60 bg-muted/20 text-foreground"
                            }`}
                          >
                            <span
                              className={`size-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                opt.isCorrect
                                  ? "bg-emerald-500 text-white"
                                  : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {label}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{opt.optionText}</p>
                              {opt.isCorrect && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                  <CheckCircle2 className="size-3" /> Correct
                                  Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {problem.mcqQuestion.explanation && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1 mt-2">
                      <p className="font-semibold text-primary">Explanation:</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {problem.mcqQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Written Details */}
              {problem.type === "WRITTEN" && problem.writtenQuestion && (
                <div className="space-y-3">
                  {problem.writtenQuestion.wordLimit && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-xs">
                      <span className="text-muted-foreground">Word Limit:</span>
                      <span className="font-semibold text-foreground">
                        {problem.writtenQuestion.wordLimit} words
                      </span>
                    </div>
                  )}

                  {problem.writtenQuestion.expectedAnswer && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Expected Answer / Guidelines
                      </h4>
                      <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                        {problem.writtenQuestion.expectedAnswer}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Coding Details */}
              {problem.type === "CODING" && problem.codingQuestion && (
                <div className="space-y-3">
                  {/* Languages & Limits */}
                  <div className="flex flex-wrap items-center gap-2">
                    {problem.codingQuestion.supportedLanguages?.map(
                      (lang: string) => (
                        <span
                          key={lang}
                          className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold"
                        >
                          {lang}
                        </span>
                      ),
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      Time: {problem.codingQuestion.timeLimitMs ?? 2000}ms |
                      Memory: {problem.codingQuestion.memoryLimitMb ?? 256}MB
                    </span>
                  </div>

                  {/* Specifications */}
                  {problem.codingQuestion.inputFormat && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Input Format:
                      </p>
                      <p className="p-2 rounded bg-muted/30 border border-border/50 text-xs">
                        {problem.codingQuestion.inputFormat}
                      </p>
                    </div>
                  )}
                  {problem.codingQuestion.outputFormat && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Output Format:
                      </p>
                      <p className="p-2 rounded bg-muted/30 border border-border/50 text-xs">
                        {problem.codingQuestion.outputFormat}
                      </p>
                    </div>
                  )}
                  {problem.codingQuestion.constraints && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Constraints:
                      </p>
                      <p className="p-2 rounded bg-muted/30 border border-border/50 text-xs font-mono">
                        {problem.codingQuestion.constraints}
                      </p>
                    </div>
                  )}

                  {/* Test Cases */}
                  {problem.codingQuestion.testCases?.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Test Cases ({problem.codingQuestion.testCases.length})
                      </h4>
                      <div className="space-y-2">
                        {problem.codingQuestion.testCases.map(
                          (tc: any, idx: number) => (
                            <div
                              key={tc.id || idx}
                              className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground">
                                  Test Case #{idx + 1}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase ${
                                    tc.type === "PUBLIC"
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                      : "bg-muted text-muted-foreground border-border"
                                  }`}
                                >
                                  {tc.type}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-[11px] text-muted-foreground font-medium">
                                    Input:
                                  </span>
                                  <pre className="p-1.5 rounded bg-background border border-border text-[11px] font-mono whitespace-pre-wrap mt-0.5">
                                    {tc.input}
                                  </pre>
                                </div>
                                <div>
                                  <span className="text-[11px] text-muted-foreground font-medium">
                                    Expected Output:
                                  </span>
                                  <pre className="p-1.5 rounded bg-background border border-border text-[11px] font-mono whitespace-pre-wrap mt-0.5">
                                    {tc.expectedOutput}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:justify-between items-center pt-2">
              <div className="text-[11px] text-muted-foreground">
                Created by {problem.createdBy?.name || "Admin"} on{" "}
                {new Date(problem.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onEdit(problem.id);
                  }}
                  className="cursor-pointer gap-1.5"
                >
                  <Pencil className="size-3.5" />
                  Edit Problem
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface GetAllProblemTableProps {
  companyId?: string;
}

export function GetAllProblemTable({ companyId }: GetAllProblemTableProps) {
  // Filter & Search states
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "ALL">(
    "ALL",
  );
  const [typeFilter, setTypeFilter] = useState<ProblemType | "ALL">("ALL");
  const [scopeFilter, setScopeFilter] = useState<"COMPANY" | "ALL">("COMPANY");

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // View details modal state (uses useGetOneProblem)
  const [viewingProblemId, setViewingProblemId] = useState<string | null>(null);

  // Edit modal state (uses useUpdateProblem)
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);

  // Deletion modal state
  const [problemToDelete, setProblemToDelete] =
    useState<IProblemListItem | null>(null);
  const deleteProblemMutation = useDeleteCompanyProblem();

  // Debounce search input (350ms)
  const debounceTimerRef = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (val: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setDebouncedSearch(val);
          setPage(1);
        }, 350);
      };
    })(),
    [],
  );

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchInput(val);
    debounceTimerRef(val);
  }

  // Build query filters
  const filters: IProblemFilters = useMemo(
    () => ({
      ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
      ...(difficultyFilter !== "ALL" ? { difficulty: difficultyFilter } : {}),
      ...(typeFilter !== "ALL" ? { type: typeFilter } : {}),
      ...(companyId ? { companyId } : {}),
      page,
      limit,
      ...(sortBy ? { sortBy, sortOrder } : {}),
    }),
    [
      debouncedSearch,
      difficultyFilter,
      typeFilter,
      companyId,
      page,
      limit,
      sortBy,
      sortOrder,
    ],
  );

  const companyProblemsQuery = useGetCompanyProblems(filters);
  const allProblemsQuery = useGetAllQuestion(filters);

  const activeQuery =
    scopeFilter === "ALL" ? allProblemsQuery : companyProblemsQuery;

  const { data, isLoading, isFetching, isError, error, refetch } = activeQuery;

  const problems: IProblemListItem[] = data?.data ?? [];
  const meta = data?.meta;

  // Sort column toggle
  function handleSort(column: string) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  }

  // Clear all filters
  function clearFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setDifficultyFilter("ALL");
    setTypeFilter("ALL");
    setSortBy(undefined);
    setPage(1);
  }

  // Delete Handlers
  function handleDeleteClick(problem: IProblemListItem) {
    setProblemToDelete(problem);
  }

  function handleConfirmDelete() {
    if (!problemToDelete) return;

    deleteProblemMutation.mutate(problemToDelete.id, {
      onSuccess: () => {
        toast.add({
          title: "Problem Deleted",
          description: `"${problemToDelete.title}" has been deleted successfully.`,
          type: "success",
        });
        setProblemToDelete(null);
        // If this was the last item on a page > 1, navigate back one page
        if (problems.length === 1 && page > 1) {
          setPage((p) => p - 1);
        }
      },
      onError: (err: unknown) => {
        const apiErr = err as {
          data?: { message?: string };
          message?: string;
        };
        toast.add({
          title: "Failed to delete problem",
          description:
            apiErr?.data?.message ||
            apiErr?.message ||
            "An error occurred while deleting the problem.",
          type: "error",
        });
      },
    });
  }

  const hasActiveFilters =
    Boolean(debouncedSearch.trim()) ||
    difficultyFilter !== "ALL" ||
    typeFilter !== "ALL";

  return (
    <div className="space-y-4">
      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            id="problem-search-input"
            type="search"
            placeholder="Search problems by title, description…"
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-8 h-8 text-xs bg-background"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setDebouncedSearch("");
                setPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="size-3" />
            <span className="hidden sm:inline">Filters:</span>
          </div>

          {/* Scope filter */}
          <SelectFilter
            id="problem-scope-filter"
            value={scopeFilter}
            options={SCOPE_OPTIONS}
            onChange={(v) => {
              setScopeFilter(v as "COMPANY" | "ALL");
              setPage(1);
            }}
          />

          {/* Type filter */}
          <SelectFilter
            id="problem-type-filter"
            value={typeFilter}
            options={TYPE_OPTIONS}
            onChange={(v) => {
              setTypeFilter(v);
              setPage(1);
            }}
          />

          {/* Difficulty filter */}
          <SelectFilter
            id="problem-difficulty-filter"
            value={difficultyFilter}
            options={DIFFICULTY_OPTIONS}
            onChange={(v) => {
              setDifficultyFilter(v);
              setPage(1);
            }}
          />

          {hasActiveFilters && (
            <Button
              id="problem-clear-filters-btn"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1 text-xs text-muted-foreground cursor-pointer"
            >
              <X className="size-3" />
              Clear
            </Button>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1 hidden sm:block" />

        {/* Right side: limit + refresh */}
        <div className="flex items-center gap-2">
          <SelectFilter
            id="problem-limit-select"
            value={String(limit) as "10" | "20" | "50"}
            options={LIMIT_OPTIONS.map((l) => ({
              value: String(l) as "10" | "20" | "50",
              label: `${l} / page`,
            }))}
            onChange={(v) => {
              setLimit(Number(v));
              setPage(1);
            }}
          />

          <Button
            id="problem-refresh-btn"
            variant="outline"
            size="icon-sm"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh table"
            className="cursor-pointer"
          >
            <RefreshCw
              className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="min-w-[260px]">
                <button
                  type="button"
                  onClick={() => handleSort("title")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-medium cursor-pointer"
                  id="sort-by-title-btn"
                >
                  Title
                  <SortIcon
                    column="title"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </button>
              </TableHead>
              <TableHead className="w-[120px]">
                <button
                  type="button"
                  onClick={() => handleSort("type")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-medium cursor-pointer"
                  id="sort-by-type-btn"
                >
                  Type
                  <SortIcon
                    column="type"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </button>
              </TableHead>
              <TableHead className="w-[120px]">
                <button
                  type="button"
                  onClick={() => handleSort("difficulty")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-medium cursor-pointer"
                  id="sort-by-difficulty-btn"
                >
                  Difficulty
                  <SortIcon
                    column="difficulty"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </button>
              </TableHead>
              <TableHead className="w-[110px]">
                <button
                  type="button"
                  onClick={() => handleSort("marks")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-medium cursor-pointer"
                  id="sort-by-marks-btn"
                >
                  Marks
                  <SortIcon
                    column="marks"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </button>
              </TableHead>
              <TableHead className="w-[140px]">
                <button
                  type="button"
                  onClick={() => handleSort("createdAt")}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-medium cursor-pointer"
                  id="sort-by-date-btn"
                >
                  Created
                  <SortIcon
                    column="createdAt"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                  />
                </button>
              </TableHead>
              <TableHead className="text-right">Creator</TableHead>
              <TableHead className="w-[110px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading skeleton */}
            {isLoading &&
              Array.from({ length: limit }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}

            {/* Error state */}
            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-16">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="size-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Failed to load problems
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(error as Error)?.message ??
                          "An unexpected error occurred"}
                      </p>
                    </div>
                    <Button
                      id="problem-error-retry-btn"
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="size-3" />
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Empty state */}
            {!isLoading && !isError && problems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-16">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                      <BookOpen className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        No problems found
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {hasActiveFilters
                          ? "Try adjusting or clearing your filters"
                          : "Create your first problem to get started"}
                      </p>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        id="problem-empty-clear-btn"
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-1.5 cursor-pointer"
                      >
                        <X className="size-3" />
                        Clear filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading &&
              !isError &&
              problems.map((problem) => (
                <TableRow
                  key={problem.id}
                  className={`transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}
                >
                  <TableCell>
                    <div className="space-y-0.5">
                      <p
                        onClick={() => setViewingProblemId(problem.id)}
                        className="text-sm font-medium text-foreground leading-tight line-clamp-1 hover:text-primary transition-colors cursor-pointer"
                      >
                        {problem.title}
                      </p>
                      {problem.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-2xl">
                          {problem.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={problem.type} />
                  </TableCell>
                  <TableCell>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold tabular-nums">
                      {problem.marks ?? problem.defaultMarks ?? 0}
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        pts
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {new Date(problem.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {problem.createdBy?.name ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        id={`view-problem-${problem.id}-btn`}
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setViewingProblemId(problem.id)}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title="View details"
                        aria-label={`View ${problem.title}`}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        id={`edit-problem-${problem.id}-btn`}
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setEditingProblemId(problem.id)}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title="Edit problem"
                        aria-label={`Edit ${problem.title}`}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        id={`delete-problem-${problem.id}-btn`}
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeleteClick(problem)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Delete problem"
                        aria-label={`Delete ${problem.title}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      {meta && meta.totalPages > 0 && (
        <Pagination meta={meta} onPageChange={setPage} isLoading={isFetching} />
      )}

      {/* Fetching overlay indicator */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Updating…
        </div>
      )}

      {/* ── View Problem Details Dialog (uses useGetOneProblem) ── */}
      <ProblemDetailDialog
        problemId={viewingProblemId}
        onClose={() => setViewingProblemId(null)}
        onEdit={(id) => setEditingProblemId(id)}
      />

      {/* ── Edit Problem Dialog (uses useUpdateProblem) ── */}
      <EditProblemDialog
        problemId={editingProblemId}
        onClose={() => setEditingProblemId(null)}
      />

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={Boolean(problemToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteProblemMutation.isPending) {
            setProblemToDelete(null);
          }
        }}
      >
        <DialogContent className="w-[96vw] max-w-lg p-6 gap-5 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-destructive/10 text-destructive shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle>Delete Problem</DialogTitle>
                <DialogDescription>
                  Are you sure you want to permanently delete this problem from
                  the Problem Bank? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {problemToDelete && (
            <div className="p-3 rounded-lg border border-border/70 bg-muted/40 space-y-1.5 my-1">
              <div className="flex items-center gap-2">
                <TypeBadge type={problemToDelete.type} />
                <DifficultyBadge difficulty={problemToDelete.difficulty} />
                <span className="text-xs font-semibold tabular-nums text-muted-foreground ml-auto">
                  {problemToDelete.marks ?? problemToDelete.defaultMarks ?? 0}{" "}
                  pts
                </span>
              </div>
              <p className="text-xs font-semibold text-foreground line-clamp-1">
                {problemToDelete.title}
              </p>
              {problemToDelete.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {problemToDelete.description}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleteProblemMutation.isPending}
              onClick={() => setProblemToDelete(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              id="confirm-delete-problem-btn"
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteProblemMutation.isPending}
              onClick={handleConfirmDelete}
              className="cursor-pointer"
            >
              {deleteProblemMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5 mr-1.5" />
                  Confirm & Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
