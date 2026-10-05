"use client";

import {
  AlertCircle,
  BookOpen,
  Check,
  HelpCircle,
  Loader2,
  PenTool,
  RotateCcw,
  Sparkles,
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
import type { Difficulty, ICreateWrittenQuestion } from "@/types";

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

export function CreateWrittenQuestion() {
  const { data: companyData } = useUserCompany();
  const company = companyData?.data || companyData;
  const companyId = company?.id;

  const createQuestionMutation = useCreateQuestion();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
  const [defaultMarks, setDefaultMarks] = useState<number | "">(10);
  const [guidelines, setGuidelines] = useState("");
  const [minWords, setMinWords] = useState<number | "">(30);
  const [maxWords, setMaxWords] = useState<number | "">(500);

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset Form
  const handleReset = () => {
    setTitle("");
    setDescription("");
    setDifficulty("MEDIUM");
    setDefaultMarks(10);
    setGuidelines("");
    setMinWords(30);
    setMaxWords(500);
    setErrors({});
  };

  // Load Example from User prompt
  const handleLoadExample = () => {
    setTitle("Explain Database Indexing Architecture");
    setDescription(
      "Explain how B-Tree indexes optimize read latency in PostgreSQL.",
    );
    setDifficulty("MEDIUM");
    setDefaultMarks(10);
    setGuidelines(
      "Mention B-Tree structure, time complexity, write amplification trade-offs.",
    );
    setMinWords(30);
    setMaxWords(500);
    setErrors({});
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Problem title is required.";
    }
    if (!description.trim()) {
      newErrors.description = "Problem question/description is required.";
    }
    if (!guidelines.trim()) {
      newErrors.guidelines = "Evaluation guidelines are required.";
    }
    if (defaultMarks === "" || Number(defaultMarks) <= 0) {
      newErrors.defaultMarks = "Marks must be greater than 0.";
    }

    const min = minWords !== "" ? Number(minWords) : undefined;
    const max = maxWords !== "" ? Number(maxWords) : undefined;

    if (min !== undefined && (Number.isNaN(min) || min < 0)) {
      newErrors.minWords = "Minimum words cannot be negative.";
    }
    if (max !== undefined && (Number.isNaN(max) || max <= 0)) {
      newErrors.maxWords = "Maximum words must be greater than 0.";
    }
    if (min !== undefined && max !== undefined && min > max) {
      newErrors.maxWords = "Maximum words must be greater than minimum words.";
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
        description: "Please check all fields and fix errors.",
        type: "error",
      });
      return;
    }

    const payload: ICreateWrittenQuestion = {
      title: title.trim(),
      description: description.trim(),
      type: "WRITTEN",
      difficulty,
      defaultMarks: Number(defaultMarks),
      companyId: companyId || undefined,
      writtenQuestion: {
        guidelines: guidelines.trim(),
        ...(minWords !== "" ? { minWords: Number(minWords) } : {}),
        ...(maxWords !== "" ? { maxWords: Number(maxWords) } : {}),
      },
    };

    createQuestionMutation.mutate(payload, {
      onSuccess: () => {
        toast.add({
          title: "Written Question Created",
          description: `"${title.trim()}" has been successfully added to Problem Bank.`,
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
          title: "Creation Failed",
          description:
            apiErr?.data?.message ||
            apiErr?.message ||
            "Could not create written question. Please try again.",
          type: "error",
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <PenTool className="size-3" />
              Written Question
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Problem Bank
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1.5">
            Create Written Problem
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Define descriptive questions, word count parameters, and evaluation
            rubrics for candidates.
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
            Basic metadata, prompt, and scoring for this question
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="written-title" className="text-xs font-semibold">
              Problem Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="written-title"
              placeholder="e.g. Explain Database Indexing Architecture"
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
            <Label
              htmlFor="written-description"
              className="text-xs font-semibold"
            >
              Question Prompt / Description{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="written-description"
              rows={3}
              placeholder="e.g. Explain how B-Tree indexes optimize read latency in PostgreSQL."
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
              <Label htmlFor="written-marks" className="text-xs font-semibold">
                Default Marks <span className="text-destructive">*</span>
              </Label>
              <Input
                id="written-marks"
                type="number"
                min={1}
                max={100}
                placeholder="10"
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

      {/* Card 2: Written Question Guidelines & Limits */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span>2. Evaluation Guidelines & Word Limits</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Rubric for manual or automated evaluation and candidate word bounds
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Guidelines */}
          <div className="space-y-1.5">
            <Label
              htmlFor="written-guidelines"
              className="text-xs font-semibold flex items-center justify-between"
            >
              <span>
                Evaluation Guidelines / Rubric{" "}
                <span className="text-destructive">*</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                Shown to reviewers during grading
              </span>
            </Label>
            <Textarea
              id="written-guidelines"
              rows={4}
              placeholder="e.g. Mention B-Tree structure, time complexity, write amplification trade-offs."
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              className={errors.guidelines ? "border-destructive" : ""}
            />
            {errors.guidelines && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.guidelines}
              </p>
            )}
          </div>

          {/* Word Limits Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <Label
                htmlFor="written-minWords"
                className="text-xs font-semibold"
              >
                Minimum Words
              </Label>
              <Input
                id="written-minWords"
                type="number"
                min={0}
                placeholder="30"
                value={minWords}
                onChange={(e) =>
                  setMinWords(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className={errors.minWords ? "border-destructive" : ""}
              />
              {errors.minWords && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.minWords}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="written-maxWords"
                className="text-xs font-semibold"
              >
                Maximum Words
              </Label>
              <Input
                id="written-maxWords"
                type="number"
                min={1}
                placeholder="500"
                value={maxWords}
                onChange={(e) =>
                  setMaxWords(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className={errors.maxWords ? "border-destructive" : ""}
              />
              {errors.maxWords && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.maxWords}
                </p>
              )}
            </div>
          </div>

          {/* Quick info note */}
          {(minWords !== "" || maxWords !== "") && (
            <div className="p-2.5 rounded-lg border border-border/70 bg-muted/40 text-xs text-muted-foreground flex items-center gap-2">
              <BookOpen className="size-3.5 text-primary shrink-0" />
              <span>
                Candidate submission will be constrained to{" "}
                <span className="font-semibold text-foreground">
                  {minWords !== "" ? `${minWords} min` : "no min"}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {maxWords !== "" ? `${maxWords} max` : "no max"}
                </span>{" "}
                words.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button & Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <HelpCircle className="size-3.5 text-muted-foreground/70" />
          This written question can be included in coding assessments and exams.
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
            className="w-full sm:w-auto gap-2 min-w-48"
          >
            {createQuestionMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating Question...
              </>
            ) : (
              <>
                <Check className="size-4" />
                Create Written Question
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
