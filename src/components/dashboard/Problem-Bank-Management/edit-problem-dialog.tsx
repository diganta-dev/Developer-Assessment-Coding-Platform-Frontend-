"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Code2,
  FileQuestion,
  Loader2,
  Lock,
  PenTool,
  Plus,
  RefreshCw,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useGetOneProblem, useUpdateProblem } from "@/hook/question.hook";
import type {
  Difficulty,
  ICreateMCQOptionPayload,
  ITestCase,
  IUpdateProblemPayload,
  ProblemType,
  TestCaseType,
} from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const DIFFICULTIES: {
  value: Difficulty;
  label: string;
  badgeClass: string;
  activeClass: string;
}[] = [
  {
    value: "EASY",
    label: "Easy",
    badgeClass: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    activeClass:
      "bg-emerald-500 text-white dark:bg-emerald-600 border-emerald-600 shadow-xs",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    badgeClass: "text-amber-600 dark:text-amber-400 border-amber-500/30",
    activeClass:
      "bg-amber-500 text-white dark:bg-amber-600 border-amber-600 shadow-xs",
  },
  {
    value: "HARD",
    label: "Hard",
    badgeClass: "text-rose-600 dark:text-rose-400 border-rose-500/30",
    activeClass:
      "bg-rose-500 text-white dark:bg-rose-600 border-rose-600 shadow-xs",
  },
];

const SUPPORTED_LANGUAGES = [
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C++",
  "C",
  "Go",
  "Rust",
  "C#",
  "Ruby",
  "Kotlin",
  "Swift",
];

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

interface FormOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

interface FormTestCase extends ITestCase {
  id: string;
}

// ─── Edit Problem Dialog Component ──────────────────────────────────────────

interface EditProblemDialogProps {
  problemId: string | null;
  onClose: () => void;
}

export function EditProblemDialog({
  problemId,
  onClose,
}: EditProblemDialogProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useGetOneProblem(
    problemId ?? "",
  );
  const updateProblemMutation = useUpdateProblem();

  const res = data as
    | { data?: Record<string, any>; [key: string]: any }
    | undefined;
  const problem = res?.data ?? res;

  // Common Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [marks, setMarks] = useState<number | "">(1);

  // MCQ States
  const [mcqOptions, setMcqOptions] = useState<FormOption[]>([]);
  const [mcqExplanation, setMcqExplanation] = useState("");

  // Written States
  const [wordLimit, setWordLimit] = useState<number | "">("");
  const [expectedAnswer, setExpectedAnswer] = useState("");

  // Coding States
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [constraints, setConstraints] = useState("");
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [timeLimitMs, setTimeLimitMs] = useState<number | "">(2000);
  const [memoryLimitMb, setMemoryLimitMb] = useState<number | "">(256);
  const [testCases, setTestCases] = useState<FormTestCase[]>([]);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state when problem data loads
  useEffect(() => {
    if (problem && problem.id === problemId) {
      setTitle(problem.title || "");
      setDescription(problem.description || "");
      setDifficulty(problem.difficulty || "MEDIUM");
      setMarks(problem.marks ?? problem.defaultMarks ?? 1);

      // MCQ
      if (problem.type === "MCQ" && problem.mcqQuestion) {
        setMcqExplanation(problem.mcqQuestion.explanation || "");
        const opts = (problem.mcqQuestion.options || []).map(
          (opt: any, idx: number) => ({
            id: opt.id || `opt-${idx}`,
            optionText: opt.optionText || "",
            isCorrect: Boolean(opt.isCorrect),
          }),
        );
        setMcqOptions(
          opts.length >= 2
            ? opts
            : [
                { id: "opt-1", optionText: "", isCorrect: true },
                { id: "opt-2", optionText: "", isCorrect: false },
              ],
        );
      }

      // WRITTEN
      if (problem.type === "WRITTEN" && problem.writtenQuestion) {
        setWordLimit(problem.writtenQuestion.wordLimit ?? "");
        setExpectedAnswer(problem.writtenQuestion.expectedAnswer || "");
      }

      // CODING
      if (problem.type === "CODING" && problem.codingQuestion) {
        setInputFormat(problem.codingQuestion.inputFormat || "");
        setOutputFormat(problem.codingQuestion.outputFormat || "");
        setConstraints(problem.codingQuestion.constraints || "");
        setSupportedLanguages(
          problem.codingQuestion.supportedLanguages || ["Python", "JavaScript"],
        );
        setTimeLimitMs(problem.codingQuestion.timeLimitMs ?? 2000);
        setMemoryLimitMb(problem.codingQuestion.memoryLimitMb ?? 256);
        setTestCases(
          (problem.codingQuestion.testCases || []).map(
            (tc: any, idx: number) => ({
              id: tc.id || `tc-${idx}`,
              type: tc.type || "PUBLIC",
              input: tc.input || "",
              expectedOutput: tc.expectedOutput || "",
              ...(tc.timeLimitMs
                ? { timeLimitMs: Number(tc.timeLimitMs) }
                : {}),
              ...(tc.memoryLimitMb
                ? { memoryLimitMb: Number(tc.memoryLimitMb) }
                : {}),
            }),
          ),
        );
      }

      setErrors({});
    }
  }, [problem, problemId]);

  // ── MCQ Helpers ─────────────────────────────────────────────────────────────

  const handleOptionTextChange = (id: string, text: string) => {
    setMcqOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, optionText: text } : opt)),
    );
  };

  const handleToggleCorrect = (id: string) => {
    setMcqOptions((prev) =>
      prev.map((opt) =>
        opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt,
      ),
    );
  };

  const handleAddOption = () => {
    if (mcqOptions.length >= 8) {
      toast.add({
        title: "Limit reached",
        description: "Maximum 8 options allowed.",
        type: "error",
      });
      return;
    }
    setMcqOptions((prev) => [
      ...prev,
      {
        id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        optionText: "",
        isCorrect: false,
      },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (mcqOptions.length <= 2) {
      toast.add({
        title: "Minimum required",
        description: "An MCQ question must have at least 2 options.",
        type: "error",
      });
      return;
    }
    const filtered = mcqOptions.filter((opt) => opt.id !== id);
    if (!filtered.some((opt) => opt.isCorrect)) {
      filtered[0].isCorrect = true;
    }
    setMcqOptions(filtered);
  };

  // ── Coding Helpers ──────────────────────────────────────────────────────────

  const handleToggleLanguage = (lang: string) => {
    setSupportedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const handleAddTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      {
        id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: "PUBLIC",
        input: "",
        expectedOutput: "",
      },
    ]);
  };

  const handleRemoveTestCase = (id: string) => {
    if (testCases.length <= 1) {
      toast.add({
        title: "Minimum required",
        description: "At least 1 test case is required.",
        type: "error",
      });
      return;
    }
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  };

  const handleUpdateTestCase = (
    id: string,
    field: keyof FormTestCase,
    value: string | TestCaseType,
  ) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)),
    );
  };

  // ── Form Validation ─────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Problem title is required.";
    if (title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (marks === "" || Number(marks) <= 0)
      newErrors.marks = "Marks must be greater than 0.";

    if (problem?.type === "MCQ") {
      if (mcqOptions.length < 2) {
        newErrors.options = "MCQ must have at least 2 options.";
      } else {
        const hasEmpty = mcqOptions.some((opt) => !opt.optionText.trim());
        if (hasEmpty) {
          newErrors.options = "All option texts must be filled.";
        }
        const hasCorrect = mcqOptions.some((opt) => opt.isCorrect);
        if (!hasCorrect) {
          newErrors.options = "At least one option must be marked as correct.";
        }
      }
    }

    if (problem?.type === "CODING") {
      if (supportedLanguages.length === 0) {
        newErrors.languages = "Select at least one supported language.";
      }
      testCases.forEach((tc, idx) => {
        if (!tc.input.trim())
          newErrors[`tc_in_${idx}`] =
            `Test case #${idx + 1} input is required.`;
        if (!tc.expectedOutput.trim())
          newErrors[`tc_out_${idx}`] =
            `Test case #${idx + 1} expected output is required.`;
      });
      if (
        testCases.length > 0 &&
        !testCases.some((tc) => tc.type === "PUBLIC")
      ) {
        newErrors.testCases = "At least one PUBLIC test case is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit Update ───────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemId || !problem) return;

    if (!validateForm()) {
      toast.add({
        title: "Validation Error",
        description: "Please check all fields and resolve errors.",
        type: "error",
      });
      return;
    }

    // Build Payload matching backend updateProblemValidation
    const payload: IUpdateProblemPayload = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      marks: Number(marks),
    };

    if (problem.type === "MCQ") {
      payload.mcq = {
        ...(mcqExplanation.trim()
          ? { explanation: mcqExplanation.trim() }
          : {}),
        options: mcqOptions.map((opt, idx) => ({
          optionText: opt.optionText.trim(),
          isCorrect: opt.isCorrect,
          optionOrder: idx + 1,
        })),
      };
    } else if (problem.type === "WRITTEN") {
      payload.written = {
        ...(wordLimit !== "" ? { wordLimit: Number(wordLimit) } : {}),
        ...(expectedAnswer.trim()
          ? { expectedAnswer: expectedAnswer.trim() }
          : {}),
      };
    } else if (problem.type === "CODING") {
      payload.coding = {
        ...(inputFormat.trim() ? { inputFormat: inputFormat.trim() } : {}),
        ...(outputFormat.trim() ? { outputFormat: outputFormat.trim() } : {}),
        ...(constraints.trim() ? { constraints: constraints.trim() } : {}),
        supportedLanguages,
        ...(timeLimitMs !== "" && Number(timeLimitMs) > 0
          ? { timeLimitMs: Number(timeLimitMs) }
          : {}),
        ...(memoryLimitMb !== "" && Number(memoryLimitMb) > 0
          ? { memoryLimitMb: Number(memoryLimitMb) }
          : {}),
        testCases: testCases.map((tc) => {
          const cleanTc: {
            type: TestCaseType;
            input: string;
            expectedOutput: string;
            timeLimitMs?: number;
            memoryLimitMb?: number;
          } = {
            type: tc.type,
            input: tc.input.trim(),
            expectedOutput: tc.expectedOutput.trim(),
          };
          if (
            tc.timeLimitMs !== undefined &&
            tc.timeLimitMs !== null &&
            !Number.isNaN(Number(tc.timeLimitMs)) &&
            Number(tc.timeLimitMs) > 0
          ) {
            cleanTc.timeLimitMs = Number(tc.timeLimitMs);
          }
          if (
            tc.memoryLimitMb !== undefined &&
            tc.memoryLimitMb !== null &&
            !Number.isNaN(Number(tc.memoryLimitMb)) &&
            Number(tc.memoryLimitMb) > 0
          ) {
            cleanTc.memoryLimitMb = Number(tc.memoryLimitMb);
          }
          return cleanTc;
        }),
      };
    }

    updateProblemMutation.mutate(
      { problemId, payload },
      {
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: ["company-questions"] });
          queryClient.invalidateQueries({ queryKey: ["all-questions"] });
          queryClient.invalidateQueries({
            queryKey: ["problem", variables.problemId],
          });
          toast.add({
            title: "Problem Updated",
            description: `"${title.trim()}" has been updated successfully.`,
            type: "success",
          });
          onClose();
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };
          toast.add({
            title: "Update Failed",
            description:
              apiErr?.data?.message ||
              apiErr?.message ||
              "Could not update the problem. Please try again.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog
      open={Boolean(problemId)}
      onOpenChange={(open) =>
        !open && !updateProblemMutation.isPending && onClose()
      }
    >
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs">Loading problem for editing…</p>
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader className="space-y-1.5 pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {problem.type === "MCQ" && (
                    <FileQuestion className="size-3" />
                  )}
                  {problem.type === "WRITTEN" && <PenTool className="size-3" />}
                  {problem.type === "CODING" && <Code2 className="size-3" />}
                  {problem.type} Problem
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
                  <Lock className="size-3 text-muted-foreground/70" />
                  Type Immutable
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Edit Problem
              </DialogTitle>
              <DialogDescription className="text-xs">
                Update metadata, questions, and parameters for this problem in
                your Problem Bank.
              </DialogDescription>
            </DialogHeader>

            {/* ── General Information ── */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                1. General Information
              </h3>

              {/* Title */}
              <div className="space-y-1">
                <Label htmlFor="edit-title" className="text-xs font-semibold">
                  Problem Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="edit-desc" className="text-xs font-semibold">
                  Description / Prompt{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="edit-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Difficulty & Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    Difficulty Level
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map((d) => {
                      const isSelected = difficulty === d.value;
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setDifficulty(d.value)}
                          className={`h-8 px-2 text-xs font-medium rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            isSelected
                              ? d.activeClass
                              : "border-border hover:bg-muted/60 text-muted-foreground"
                          }`}
                        >
                          {isSelected && <Check className="size-3" />}
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="edit-marks" className="text-xs font-semibold">
                    Marks / Points <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-marks"
                    type="number"
                    min={1}
                    max={100}
                    value={marks}
                    onChange={(e) =>
                      setMarks(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className={errors.marks ? "border-destructive" : ""}
                  />
                  {errors.marks && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.marks}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Type Specific Fields ── */}

            {/* MCQ Fields */}
            {problem.type === "MCQ" && (
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    2. MCQ Options & Explanation
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="h-7 text-xs gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" /> Add Option
                  </Button>
                </div>

                {errors.options && (
                  <p className="text-[11px] text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    {errors.options}
                  </p>
                )}

                <div className="space-y-2">
                  {mcqOptions.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex items-center gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleCorrect(opt.id)}
                        className={`size-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                          opt.isCorrect
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "bg-muted border border-border text-muted-foreground hover:bg-muted/80"
                        }`}
                        title={
                          opt.isCorrect
                            ? "Marked as correct answer (click to toggle)"
                            : "Click to mark as correct answer"
                        }
                      >
                        {OPTION_LABELS[idx] || idx + 1}
                      </button>

                      <Input
                        value={opt.optionText}
                        onChange={(e) =>
                          handleOptionTextChange(opt.id, e.target.value)
                        }
                        placeholder={`Option ${OPTION_LABELS[idx] || idx + 1} text`}
                        className="h-8 text-xs flex-1"
                      />

                      <button
                        type="button"
                        onClick={() => handleToggleCorrect(opt.id)}
                        className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer transition-all ${
                          opt.isCorrect
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {opt.isCorrect ? "Correct" : "Incorrect"}
                      </button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveOption(opt.id)}
                        disabled={mcqOptions.length <= 2}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete option"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* MCQ Explanation */}
                <div className="space-y-1 pt-1">
                  <Label
                    htmlFor="edit-explanation"
                    className="text-xs font-semibold"
                  >
                    Explanation / Solution Details (Optional)
                  </Label>
                  <Textarea
                    id="edit-explanation"
                    rows={2}
                    value={mcqExplanation}
                    onChange={(e) => setMcqExplanation(e.target.value)}
                    placeholder="Provide an explanation for the correct answer…"
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* Written Fields */}
            {problem.type === "WRITTEN" && (
              <div className="space-y-3 pt-2 border-t border-border/50">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  2. Written Question Parameters
                </h3>

                <div className="space-y-1">
                  <Label
                    htmlFor="edit-wordlimit"
                    className="text-xs font-semibold"
                  >
                    Word Limit (Optional)
                  </Label>
                  <Input
                    id="edit-wordlimit"
                    type="number"
                    min={1}
                    placeholder="e.g. 500"
                    value={wordLimit}
                    onChange={(e) =>
                      setWordLimit(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="edit-expected"
                    className="text-xs font-semibold"
                  >
                    Expected Answer / Evaluation Guidelines
                  </Label>
                  <Textarea
                    id="edit-expected"
                    rows={4}
                    value={expectedAnswer}
                    onChange={(e) => setExpectedAnswer(e.target.value)}
                    placeholder="Describe key points, algorithms, or rubrics for the evaluation…"
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* Coding Fields */}
            {problem.type === "CODING" && (
              <div className="space-y-4 pt-2 border-t border-border/50">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  2. Coding Specifications & Test Cases
                </h3>

                {/* Languages */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Supported Languages{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = supportedLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleToggleLanguage(lang)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {isSelected && (
                            <Check className="size-3 inline mr-1" />
                          )}
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                  {errors.languages && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.languages}
                    </p>
                  )}
                </div>

                {/* Time & Memory Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="edit-time-limit"
                      className="text-xs font-semibold"
                    >
                      Time Limit (ms)
                    </Label>
                    <Input
                      id="edit-time-limit"
                      type="number"
                      min={100}
                      step={100}
                      value={timeLimitMs}
                      onChange={(e) =>
                        setTimeLimitMs(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="edit-mem-limit"
                      className="text-xs font-semibold"
                    >
                      Memory Limit (MB)
                    </Label>
                    <Input
                      id="edit-mem-limit"
                      type="number"
                      min={16}
                      step={16}
                      value={memoryLimitMb}
                      onChange={(e) =>
                        setMemoryLimitMb(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  </div>
                </div>

                {/* Input / Output Format & Constraints */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="edit-in-format"
                      className="text-xs font-semibold"
                    >
                      Input Format
                    </Label>
                    <Input
                      id="edit-in-format"
                      value={inputFormat}
                      onChange={(e) => setInputFormat(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="edit-out-format"
                      className="text-xs font-semibold"
                    >
                      Output Format
                    </Label>
                    <Input
                      id="edit-out-format"
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="edit-constraints"
                    className="text-xs font-semibold"
                  >
                    Constraints
                  </Label>
                  <Input
                    id="edit-constraints"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="e.g. 1 <= N <= 10^5"
                  />
                </div>

                {/* Test Cases */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Test Cases ({testCases.length})
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTestCase}
                      className="h-7 text-xs gap-1 cursor-pointer"
                    >
                      <Plus className="size-3" /> Add Test Case
                    </Button>
                  </div>

                  {errors.testCases && (
                    <p className="text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      {errors.testCases}
                    </p>
                  )}

                  <div className="space-y-3">
                    {testCases.map((tc, idx) => (
                      <div
                        key={tc.id}
                        className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">
                            Test Case #{idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateTestCase(
                                  tc.id,
                                  "type",
                                  tc.type === "PUBLIC" ? "HIDDEN" : "PUBLIC",
                                )
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border uppercase cursor-pointer ${
                                tc.type === "PUBLIC"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {tc.type} (Click to toggle)
                            </button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleRemoveTestCase(tc.id)}
                              disabled={testCases.length <= 1}
                              className="text-muted-foreground hover:text-destructive cursor-pointer"
                              title="Delete testcase"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-medium">
                              Input
                            </Label>
                            <Textarea
                              rows={2}
                              value={tc.input}
                              onChange={(e) =>
                                handleUpdateTestCase(
                                  tc.id,
                                  "input",
                                  e.target.value,
                                )
                              }
                              className="font-mono text-xs"
                            />
                            {errors[`tc_in_${idx}`] && (
                              <p className="text-[10px] text-destructive">
                                {errors[`tc_in_${idx}`]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground font-medium">
                              Expected Output
                            </Label>
                            <Textarea
                              rows={2}
                              value={tc.expectedOutput}
                              onChange={(e) =>
                                handleUpdateTestCase(
                                  tc.id,
                                  "expectedOutput",
                                  e.target.value,
                                )
                              }
                              className="font-mono text-xs"
                            />
                            {errors[`tc_out_${idx}`] && (
                              <p className="text-[10px] text-destructive">
                                {errors[`tc_out_${idx}`]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:justify-end items-center pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={updateProblemMutation.isPending}
                onClick={onClose}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateProblemMutation.isPending}
                className="cursor-pointer"
              >
                {updateProblemMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Saving Changes…
                  </>
                ) : (
                  <>
                    <Check className="size-3.5 mr-1.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
