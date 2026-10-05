"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateQuestion, useUserCompany } from "@/hook";
import type { Difficulty, ICreateMCQQuestion, IMCQOption } from "@/types";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

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

interface FormOption extends IMCQOption {
  id: string;
}

const generateDefaultOptions = (): FormOption[] => [
  { id: "opt-1", text: "", isCorrect: true, explanation: "" },
  { id: "opt-2", text: "", isCorrect: false, explanation: "" },
  { id: "opt-3", text: "", isCorrect: false, explanation: "" },
  { id: "opt-4", text: "", isCorrect: false, explanation: "" },
];

export function CreateMCQQuestion() {
  const { data: companyData } = useUserCompany();
  const company = companyData?.data || companyData;
  const companyId = company?.id;

  const createQuestionMutation = useCreateQuestion();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [defaultMarks, setDefaultMarks] = useState<number | "">(5);
  const [question, setQuestion] = useState("");
  const [multipleCorrect, setMultipleCorrect] = useState(false);
  const [options, setOptions] = useState<FormOption[]>(generateDefaultOptions);

  // Field validation error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form
  const handleReset = () => {
    setTitle("");
    setDescription("");
    setDifficulty("EASY");
    setDefaultMarks(5);
    setQuestion("");
    setMultipleCorrect(false);
    setOptions(generateDefaultOptions());
    setErrors({});
  };

  // Autofill with standard example
  const handleLoadExample = () => {
    setTitle("Node.js Event Loop Phase Priority");
    setDescription("Which event loop phase executes timers like setTimeout?");
    setDifficulty("EASY");
    setDefaultMarks(5);
    setQuestion(
      "In Node.js event loop, which phase executes setTimeout callbacks?",
    );
    setMultipleCorrect(false);
    setOptions([
      {
        id: "opt-1",
        text: "Timers Phase",
        isCorrect: true,
        explanation:
          "Timers phase executes setTimeout & setInterval callbacks.",
      },
      {
        id: "opt-2",
        text: "Poll Phase",
        isCorrect: false,
        explanation: "",
      },
      {
        id: "opt-3",
        text: "Check Phase",
        isCorrect: false,
        explanation: "",
      },
      {
        id: "opt-4",
        text: "Close Callbacks",
        isCorrect: false,
        explanation: "",
      },
    ]);
    setErrors({});
  };

  // Option text update
  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, text } : opt)),
    );
  };

  // Option explanation update
  const handleOptionExplanationChange = (
    index: number,
    explanation: string,
  ) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, explanation } : opt)),
    );
  };

  // Option correctness toggle
  const handleToggleCorrect = (index: number) => {
    if (multipleCorrect) {
      // Checkbox mode
      setOptions((prev) =>
        prev.map((opt, i) =>
          i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt,
        ),
      );
    } else {
      // Radio mode: exactly one correct
      setOptions((prev) =>
        prev.map((opt, i) => ({
          ...opt,
          isCorrect: i === index,
        })),
      );
    }
  };

  // When switching multipleCorrect from true -> false, keep only the first correct one
  const handleMultipleCorrectToggle = (value: boolean) => {
    setMultipleCorrect(value);
    if (!value) {
      let foundFirst = false;
      setOptions((prev) =>
        prev.map((opt) => {
          if (opt.isCorrect && !foundFirst) {
            foundFirst = true;
            return opt;
          }
          return { ...opt, isCorrect: false };
        }),
      );
    }
  };

  // Add Option
  const handleAddOption = () => {
    if (options.length >= 8) {
      toast.add({
        title: "Limit reached",
        description: "A maximum of 8 options is allowed per question.",
        type: "error",
      });
      return;
    }
    setOptions((prev) => [
      ...prev,
      {
        id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        text: "",
        isCorrect: false,
        explanation: "",
      },
    ]);
  };

  // Remove Option
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      toast.add({
        title: "Minimum required",
        description: "An MCQ question must have at least 2 options.",
        type: "error",
      });
      return;
    }

    const newOptions = options.filter((_, i) => i !== index);
    // If no option is marked as correct after removal, mark the first one
    if (!newOptions.some((opt) => opt.isCorrect)) {
      newOptions[0].isCorrect = true;
    }
    setOptions(newOptions);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Problem title is required.";
    }
    if (!description.trim()) {
      newErrors.description = "Short problem description is required.";
    }
    if (!question.trim()) {
      newErrors.question = "MCQ question statement is required.";
    }
    if (defaultMarks === "" || Number(defaultMarks) <= 0) {
      newErrors.defaultMarks = "Marks must be greater than 0.";
    }

    // Check options
    const emptyOptionIndex = options.findIndex((opt) => !opt.text.trim());
    if (emptyOptionIndex !== -1) {
      newErrors.options = `Option ${OPTION_LABELS[emptyOptionIndex]} text cannot be empty.`;
    } else {
      const correctCount = options.filter((opt) => opt.isCorrect).length;
      if (correctCount === 0) {
        newErrors.options = "At least one option must be marked as correct.";
      } else if (!multipleCorrect && correctCount > 1) {
        newErrors.options =
          "In Single Choice mode, only one option can be marked as correct.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.add({
        title: "Validation Error",
        description: "Please fill in all required fields properly.",
        type: "error",
      });
      return;
    }

    const payload: ICreateMCQQuestion = {
      title: title.trim(),
      description: description.trim(),
      type: "MCQ",
      difficulty,
      defaultMarks: Number(defaultMarks),
      companyId: companyId || undefined,
      mcqQuestion: {
        question: question.trim(),
        multipleCorrect,
        options: options.map((opt) => ({
          text: opt.text.trim(),
          isCorrect: opt.isCorrect,
          ...(opt.explanation?.trim()
            ? { explanation: opt.explanation.trim() }
            : {}),
        })),
      },
    };

    createQuestionMutation.mutate(payload, {
      onSuccess: () => {
        toast.add({
          title: "Question Created Successfully",
          description: `"${title.trim()}" has been added to your Problem Bank.`,
          type: "success",
        });
        handleReset();
      },
      onError: (error: unknown) => {
        const apiErr = error as {
          data?: { message?: string };
          message?: string;
        };
        toast.add({
          title: "Failed to create question",
          description:
            apiErr?.data?.message ||
            apiErr?.message ||
            "An error occurred while creating the MCQ question.",
          type: "error",
        });
      },
    });
  };

  const correctCount = options.filter((o) => o.isCorrect).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <FileQuestion className="size-3" />
              MCQ Question
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Problem Bank
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1.5">
            Create MCQ Problem
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Design multiple-choice assessments with single or multiple correct
            options.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadExample}
            className="text-xs gap-1.5"
            title="Load sample question data"
          >
            <Sparkles className="size-3.5 text-amber-500" />
            Load Example
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Card 1: Problem Overview */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span>1. General Information</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Basic metadata, categorization, and scoring for this question
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Problem Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Node.js Event Loop Phase Priority"
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
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Problem Summary / Context{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="description"
              placeholder="e.g. Which event loop phase executes timers like setTimeout?"
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

          {/* Difficulty & Marks Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Difficulty Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Difficulty Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => {
                  const isSelected = difficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={`h-9 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? d.activeClass
                          : "border-border hover:bg-muted/60 text-muted-foreground"
                      }`}
                    >
                      {isSelected && <Check className="size-3.5" />}
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Default Marks */}
            <div className="space-y-1.5">
              <Label htmlFor="defaultMarks" className="text-xs font-semibold">
                Default Marks <span className="text-destructive">*</span>
              </Label>
              <Input
                id="defaultMarks"
                type="number"
                min={1}
                max={100}
                placeholder="5"
                value={defaultMarks}
                onChange={(e) =>
                  setDefaultMarks(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className={errors.defaultMarks ? "border-destructive" : ""}
              />
              {errors.defaultMarks && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.defaultMarks}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Question Statement */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                2. Question Statement
              </CardTitle>
              <CardDescription className="text-xs">
                The actual question text candidates will see
              </CardDescription>
            </div>

            {/* Multiple Correct Toggle */}
            <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border border-border/60">
              <span className="text-xs font-medium text-muted-foreground pl-1">
                Answer Mode:
              </span>
              <button
                type="button"
                onClick={() => handleMultipleCorrectToggle(false)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  !multipleCorrect
                    ? "bg-background text-foreground shadow-xs border border-border/60 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Single Choice
              </button>
              <button
                type="button"
                onClick={() => handleMultipleCorrectToggle(true)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                  multipleCorrect
                    ? "bg-background text-foreground shadow-xs border border-border/60 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Multiple Choice
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="question" className="text-xs font-semibold">
              Question Text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="question"
              rows={3}
              placeholder="e.g. In Node.js event loop, which phase executes setTimeout callbacks?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={errors.question ? "border-destructive" : ""}
            />
            {errors.question && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.question}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 3: MCQ Options */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  3. Answer Options
                </CardTitle>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/60">
                  {options.length} options
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                    correctCount > 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  <CheckCircle2 className="size-3" />
                  {correctCount}{" "}
                  {correctCount === 1 ? "correct answer" : "correct answers"}
                </span>
              </div>
              <CardDescription className="text-xs mt-1">
                {multipleCorrect
                  ? "Mark all valid correct answers with the checkboxes."
                  : "Click 'Mark as Correct' on the single correct answer."}
              </CardDescription>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              disabled={options.length >= 8}
              className="text-xs gap-1.5 h-8 w-full sm:w-auto"
            >
              <Plus className="size-3.5" />
              Add Option
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {errors.options && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errors.options}</span>
            </div>
          )}

          {options.map((option, idx) => {
            const letter = OPTION_LABELS[idx] || `${idx + 1}`;
            const isCorrect = option.isCorrect;

            return (
              <div
                key={option.id}
                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 ring-1 ring-emerald-500/20"
                    : "border-border/70 bg-card hover:border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Option Letter Badge */}
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isCorrect
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {letter}
                  </div>

                  {/* Option Text Input */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={`Option ${letter} text...`}
                        value={option.text}
                        onChange={(e) =>
                          handleOptionTextChange(idx, e.target.value)
                        }
                        className={`text-sm ${
                          isCorrect
                            ? "border-emerald-500/40 focus-visible:ring-emerald-500/30"
                            : ""
                        }`}
                      />

                      {/* Correct Answer Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleCorrect(idx)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                          isCorrect
                            ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground border-border/80"
                        }`}
                        title={
                          isCorrect ? "Correct answer" : "Click to mark correct"
                        }
                      >
                        <Check className="size-3.5" />
                        <span className="hidden sm:inline">
                          {isCorrect ? "Correct" : "Mark Correct"}
                        </span>
                      </button>

                      {/* Delete Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={options.length <= 2}
                        onClick={() => handleRemoveOption(idx)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title={
                          options.length <= 2
                            ? "Minimum 2 options required"
                            : "Delete option"
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {/* Explanation Input */}
                    <div className="pt-1">
                      <Input
                        placeholder={`Explanation for Option ${letter} (optional, shown during review)...`}
                        value={option.explanation || ""}
                        onChange={(e) =>
                          handleOptionExplanationChange(idx, e.target.value)
                        }
                        className="text-xs h-7 bg-muted/30 border-dashed border-border/60 placeholder:text-muted-foreground/70"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Submit Button & Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <HelpCircle className="size-3.5 text-muted-foreground/70" />
          Questions saved here will immediately appear in your organization's
          Problem Bank.
        </p>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={createQuestionMutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={createQuestionMutation.isPending}
            className="w-full sm:w-auto gap-2 min-w-44"
          >
            {createQuestionMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating Question...
              </>
            ) : (
              <>
                <Check className="size-4" />
                Create MCQ Question
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
