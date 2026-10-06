"use client";

import {
  AlertCircle,
  Check,
  ChevronDown,
  Code2,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Terminal,
  Trash2,
  X,
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
import type {
  Difficulty,
  ICreateCodingQuestion,
  ITestCase,
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

const DEFAULT_TIME_LIMIT = 2000;
const DEFAULT_MEMORY_LIMIT = 256;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormTestCase extends ITestCase {
  id: string;
}

const makeEmptyTestCase = (type: TestCaseType = "PUBLIC"): FormTestCase => ({
  id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
  type,
  input: "",
  expectedOutput: "",
});

const getDefaultState = () => ({
  title: "",
  description: "",
  difficulty: "EASY" as Difficulty,
  marks: 10 as number | "",
  inputFormat: "",
  outputFormat: "",
  constraints: "",
  supportedLanguages: ["Python", "JavaScript"] as string[],
  timeLimitMs: DEFAULT_TIME_LIMIT as number | "",
  memoryLimitMb: DEFAULT_MEMORY_LIMIT as number | "",
  testCases: [
    makeEmptyTestCase("PUBLIC"),
    makeEmptyTestCase("HIDDEN"),
  ] as FormTestCase[],
});

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateCodingQuestion() {
  const { data: companyData } = useUserCompany();
  const company = companyData?.data || companyData;
  const companyId = company?.id;

  const createQuestionMutation = useCreateQuestion();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("EASY");
  const [marks, setMarks] = useState<number | "">(10);
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [constraints, setConstraints] = useState("");
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([
    "Python",
    "JavaScript",
  ]);
  const [timeLimitMs, setTimeLimitMs] = useState<number | "">(
    DEFAULT_TIME_LIMIT,
  );
  const [memoryLimitMb, setMemoryLimitMb] = useState<number | "">(
    DEFAULT_MEMORY_LIMIT,
  );
  const [testCases, setTestCases] = useState<FormTestCase[]>([
    makeEmptyTestCase("PUBLIC"),
    makeEmptyTestCase("HIDDEN"),
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    const d = getDefaultState();
    setTitle(d.title);
    setDescription(d.description);
    setDifficulty(d.difficulty);
    setMarks(d.marks);
    setInputFormat(d.inputFormat);
    setOutputFormat(d.outputFormat);
    setConstraints(d.constraints);
    setSupportedLanguages(d.supportedLanguages);
    setTimeLimitMs(d.timeLimitMs);
    setMemoryLimitMb(d.memoryLimitMb);
    setTestCases(d.testCases);
    setErrors({});
  };

  const handleLoadExample = () => {
    setTitle("Sum Two Numbers");
    setDescription("Read two numbers and print their sum.");
    setDifficulty("EASY");
    setMarks(10);
    setInputFormat("Two integers on a single line separated by a space");
    setOutputFormat("A single integer — the sum of the two numbers");
    setConstraints("-10^9 ≤ a, b ≤ 10^9");
    setSupportedLanguages(["Python", "JavaScript"]);
    setTimeLimitMs(2000);
    setMemoryLimitMb(256);
    setTestCases([
      { id: "tc-ex-1", type: "PUBLIC", input: "2 3", expectedOutput: "5" },
      { id: "tc-ex-2", type: "PUBLIC", input: "10 -3", expectedOutput: "7" },
      {
        id: "tc-ex-3",
        type: "HIDDEN",
        input: "1000000000 1000000000",
        expectedOutput: "2000000000",
      },
    ]);
    setErrors({});
  };

  // ── Language toggle ──────────────────────────────────────────────────────────

  const toggleLanguage = (lang: string) => {
    setSupportedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  // ── Test case CRUD ───────────────────────────────────────────────────────────

  const addTestCase = (type: TestCaseType) => {
    if (testCases.length >= 20) {
      toast.add({
        title: "Limit reached",
        description: "Maximum 20 test cases allowed.",
        type: "error",
      });
      return;
    }
    setTestCases((prev) => [...prev, makeEmptyTestCase(type)]);
  };

  const removeTestCase = (id: string) => {
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

  const updateTestCase = (
    id: string,
    field: keyof FormTestCase,
    value: string | TestCaseType,
  ) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)),
    );
  };

  const toggleTestCaseType = (id: string) => {
    setTestCases((prev) =>
      prev.map((tc) =>
        tc.id === id
          ? { ...tc, type: tc.type === "PUBLIC" ? "HIDDEN" : "PUBLIC" }
          : tc,
      ),
    );
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Problem title is required.";
    if (title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (marks === "" || Number(marks) <= 0)
      newErrors.marks = "Marks must be greater than 0.";
    if (supportedLanguages.length === 0)
      newErrors.languages = "Select at least one supported language.";

    testCases.forEach((tc, idx) => {
      if (!tc.input.trim())
        newErrors[`tc_input_${idx}`] =
          `Test case #${idx + 1} input is required.`;
      if (!tc.expectedOutput.trim())
        newErrors[`tc_output_${idx}`] =
          `Test case #${idx + 1} expected output is required.`;
    });

    const hasPublic = testCases.some((tc) => tc.type === "PUBLIC");
    if (!hasPublic)
      newErrors.testCases = "At least one PUBLIC test case is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

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

    const payload: ICreateCodingQuestion = {
      title: title.trim(),
      description: description.trim(),
      type: "CODING",
      difficulty,
      marks: Number(marks),
      companyId: companyId || undefined,
      coding: {
        ...(inputFormat.trim() ? { inputFormat: inputFormat.trim() } : {}),
        ...(outputFormat.trim() ? { outputFormat: outputFormat.trim() } : {}),
        ...(constraints.trim() ? { constraints: constraints.trim() } : {}),
        supportedLanguages,
        ...(timeLimitMs !== "" ? { timeLimitMs: Number(timeLimitMs) } : {}),
        ...(memoryLimitMb !== ""
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
      },
    };

    createQuestionMutation.mutate(payload, {
      onSuccess: () => {
        toast.add({
          title: "Problem Created Successfully",
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
          title: "Failed to create problem",
          description:
            apiErr?.data?.message ||
            apiErr?.message ||
            "An error occurred while creating the coding problem.",
          type: "error",
        });
      },
    });
  };

  // ── Counts ───────────────────────────────────────────────────────────────────

  const publicCount = testCases.filter((tc) => tc.type === "PUBLIC").length;
  const hiddenCount = testCases.filter((tc) => tc.type === "HIDDEN").length;

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <Code2 className="size-3" />
              Coding Problem
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Problem Bank
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1.5">
            Create Coding Problem
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Build algorithmic challenges with public and hidden test cases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadExample}
            className="text-xs gap-1.5"
            id="coding-load-example-btn"
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
            id="coding-reset-btn"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* ── Card 1: General Info ── */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            1. General Information
          </CardTitle>
          <CardDescription className="text-xs">
            Metadata, categorization, and scoring for this problem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="coding-title" className="text-xs font-semibold">
              Problem Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="coding-title"
              placeholder="e.g. Sum Two Numbers"
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
              htmlFor="coding-description"
              className="text-xs font-semibold"
            >
              Problem Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="coding-description"
              rows={3}
              placeholder="e.g. Read two numbers and print their sum."
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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

            <div className="space-y-1.5">
              <Label htmlFor="coding-marks" className="text-xs font-semibold">
                Default Marks <span className="text-destructive">*</span>
              </Label>
              <Input
                id="coding-marks"
                type="number"
                min={1}
                max={100}
                placeholder="10"
                value={marks}
                onChange={(e) =>
                  setMarks(e.target.value === "" ? "" : Number(e.target.value))
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
        </CardContent>
      </Card>

      {/* ── Card 2: Problem Specification ── */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            2. Problem Specification
          </CardTitle>
          <CardDescription className="text-xs">
            Describe the input/output format and constraints (optional but
            recommended)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Format */}
            <div className="space-y-1.5">
              <Label
                htmlFor="coding-input-format"
                className="text-xs font-semibold"
              >
                Input Format
              </Label>
              <Textarea
                id="coding-input-format"
                rows={3}
                placeholder="e.g. Two integers on a single line separated by a space"
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
              />
            </div>

            {/* Output Format */}
            <div className="space-y-1.5">
              <Label
                htmlFor="coding-output-format"
                className="text-xs font-semibold"
              >
                Output Format
              </Label>
              <Textarea
                id="coding-output-format"
                rows={3}
                placeholder="e.g. A single integer — the sum of the two numbers"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
              />
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-1.5">
            <Label
              htmlFor="coding-constraints"
              className="text-xs font-semibold"
            >
              Constraints
            </Label>
            <Textarea
              id="coding-constraints"
              rows={2}
              placeholder="e.g. -10^9 ≤ a, b ≤ 10^9"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Card 3: Execution Settings ── */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            3. Execution Settings
          </CardTitle>
          <CardDescription className="text-xs">
            Configure runtime limits and supported programming languages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Time & Memory Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="coding-time-limit"
                className="text-xs font-semibold"
              >
                Time Limit (ms)
              </Label>
              <div className="relative">
                <Input
                  id="coding-time-limit"
                  type="number"
                  min={100}
                  max={30000}
                  placeholder="2000"
                  value={timeLimitMs}
                  onChange={(e) =>
                    setTimeLimitMs(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
                  ms
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="coding-memory-limit"
                className="text-xs font-semibold"
              >
                Memory Limit (MB)
              </Label>
              <div className="relative">
                <Input
                  id="coding-memory-limit"
                  type="number"
                  min={16}
                  max={1024}
                  placeholder="256"
                  value={memoryLimitMb}
                  onChange={(e) =>
                    setMemoryLimitMb(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
                  MB
                </span>
              </div>
            </div>
          </div>

          {/* Supported Languages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Supported Languages <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {supportedLanguages.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const active = supportedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    id={`lang-toggle-${lang.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      active
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 shadow-xs"
                        : "border-border text-muted-foreground hover:border-sky-500/30 hover:text-sky-500"
                    }`}
                  >
                    {active && <Check className="size-3" />}
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
        </CardContent>
      </Card>

      {/* ── Card 4: Test Cases ── */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  4. Test Cases
                </CardTitle>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/60">
                  {testCases.length} total
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Eye className="size-3" />
                  {publicCount} public
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  <EyeOff className="size-3" />
                  {hiddenCount} hidden
                </span>
              </div>
              <CardDescription className="text-xs mt-1">
                Public test cases are shown to candidates. Hidden test cases are
                used for grading only.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTestCase("PUBLIC")}
                className="text-xs gap-1.5 h-8"
                id="add-public-test-case-btn"
              >
                <Plus className="size-3.5" />
                <Eye className="size-3.5 text-emerald-500" />
                Public
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTestCase("HIDDEN")}
                className="text-xs gap-1.5 h-8"
                id="add-hidden-test-case-btn"
              >
                <Plus className="size-3.5" />
                <EyeOff className="size-3.5 text-violet-500" />
                Hidden
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {errors.testCases && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              {errors.testCases}
            </div>
          )}

          {testCases.map((tc, idx) => {
            const isPublic = tc.type === "PUBLIC";
            const hasInputErr = !!errors[`tc_input_${idx}`];
            const hasOutputErr = !!errors[`tc_output_${idx}`];

            return (
              <div
                key={tc.id}
                className={`rounded-xl border transition-all ${
                  isPublic
                    ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
                    : "border-violet-500/30 bg-violet-500/5 dark:bg-violet-500/10"
                }`}
              >
                {/* Test case header */}
                <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isPublic
                          ? "bg-emerald-500 text-white"
                          : "bg-violet-500 text-white"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      Test Case #{idx + 1}
                    </span>

                    {/* Type badge / toggle */}
                    <button
                      type="button"
                      onClick={() => toggleTestCaseType(tc.id)}
                      id={`toggle-tc-type-${idx}`}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border cursor-pointer transition-all ${
                        isPublic
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-violet-500/10 hover:text-violet-600 hover:border-violet-500/20"
                          : "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20"
                      }`}
                      title="Click to toggle PUBLIC / HIDDEN"
                    >
                      {isPublic ? (
                        <>
                          <Eye className="size-2.5" />
                          PUBLIC
                        </>
                      ) : (
                        <>
                          <EyeOff className="size-2.5" />
                          HIDDEN
                        </>
                      )}
                      <ChevronDown className="size-2.5 opacity-60" />
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeTestCase(tc.id)}
                    disabled={testCases.length <= 1}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                    id={`remove-tc-${idx}-btn`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                {/* Test case inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-3.5 pb-3.5">
                  {/* Input */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`tc-input-${idx}`}
                      className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1"
                    >
                      <Terminal className="size-3" />
                      Input <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={`tc-input-${idx}`}
                      rows={3}
                      placeholder="e.g. 2 3"
                      value={tc.input}
                      onChange={(e) =>
                        updateTestCase(tc.id, "input", e.target.value)
                      }
                      className={`font-mono text-xs ${hasInputErr ? "border-destructive" : ""}`}
                    />
                    {hasInputErr && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="size-2.5" />
                        {errors[`tc_input_${idx}`]}
                      </p>
                    )}
                  </div>

                  {/* Expected Output */}
                  <div className="space-y-1">
                    <Label
                      htmlFor={`tc-output-${idx}`}
                      className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1"
                    >
                      <Check className="size-3" />
                      Expected Output{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={`tc-output-${idx}`}
                      rows={3}
                      placeholder="e.g. 5"
                      value={tc.expectedOutput}
                      onChange={(e) =>
                        updateTestCase(tc.id, "expectedOutput", e.target.value)
                      }
                      className={`font-mono text-xs ${hasOutputErr ? "border-destructive" : ""}`}
                    />
                    {hasOutputErr && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="size-2.5" />
                        {errors[`tc_output_${idx}`]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Submit Row ── */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <HelpCircle className="size-3.5 text-muted-foreground/70" />
          Problems saved here will immediately appear in your organization's
          Problem Bank.
        </p>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={createQuestionMutation.isPending}
            className="w-full sm:w-auto"
            id="coding-cancel-btn"
          >
            <X className="size-4" />
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={createQuestionMutation.isPending}
            className="w-full sm:w-auto gap-2 min-w-48"
            id="coding-submit-btn"
          >
            {createQuestionMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating Problem...
              </>
            ) : (
              <>
                <Code2 className="size-4" />
                Create Coding Problem
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
