"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  CopyX,
  FileCheck2,
  Loader2,
  Maximize2,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
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
import { useCreateAssessment } from "@/hook/assessment.hook";
import type {
  ICreateAssessmentPayload,
  IProctoringSettings,
} from "@/types/assessment.type";

interface FormErrors {
  title?: string;
  description?: string;
  totalMarks?: string;
  passMarks?: string;
  durationMinutes?: string;
  startTime?: string;
  endTime?: string;
  allowedAttempts?: string;
  maxTabSwitches?: string;
}

interface CreateAssessmentFormProps {
  onSuccess?: () => void;
}

export default function CreateAssessmentForm({
  onSuccess,
}: CreateAssessmentFormProps = {}) {
  const queryClient = useQueryClient();
  const { mutate: createAssessment, isPending } = useCreateAssessment();

  // Basic Information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Scoring & Attempts
  const [totalMarks, setTotalMarks] = useState<number | "">(100);
  const [passMarks, setPassMarks] = useState<number | "">(50);
  const [allowedAttempts, setAllowedAttempts] = useState<number | "">(1);

  // Timing & Schedule
  const [durationMinutes, setDurationMinutes] = useState<number | "">(60);
  const [isStrictTimeLimit, setIsStrictTimeLimit] = useState(true);
  const [startTime, setStartTime] = useState("2026-01-01T00:00");
  const [endTime, setEndTime] = useState("2027-12-31T23:59");

  // Proctoring Settings
  const [proctoring, setProctoring] = useState<IProctoringSettings>({
    trackTabSwitches: true,
    maxTabSwitches: 3,
    requireFullscreen: true,
    blockCopyPaste: true,
    trackFocusLoss: true,
  });

  // Validation Errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form to defaults
  const handleReset = () => {
    setTitle("");
    setDescription("");
    setTotalMarks(100);
    setPassMarks(50);
    setAllowedAttempts(1);
    setDurationMinutes(60);
    setIsStrictTimeLimit(true);
    setStartTime("");
    setEndTime("");
    setProctoring({
      trackTabSwitches: true,
      maxTabSwitches: 3,
      requireFullscreen: true,
      blockCopyPaste: true,
      trackFocusLoss: true,
    });
    setErrors({});
  };

  // Populate example benchmark data
  const handleLoadExample = () => {
    setTitle("Senior Backend Engineer Benchmark 2026");
    setDescription(
      "Comprehensive technical evaluation covering architecture, event loop, and databases.",
    );
    setTotalMarks(100);
    setPassMarks(50);
    setDurationMinutes(60);
    setStartTime("2026-01-01T00:00");
    setEndTime("2027-12-31T23:59");
    setAllowedAttempts(1);
    setIsStrictTimeLimit(true);
    setProctoring({
      trackTabSwitches: true,
      maxTabSwitches: 3,
      requireFullscreen: true,
      blockCopyPaste: true,
      trackFocusLoss: true,
    });
    setErrors({});
    toast.add({
      title: "Example Loaded",
      description: "Populated form with the Senior Backend Benchmark details.",
      type: "info",
    });
  };

  // Validate form before submission
  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!title.trim()) {
      errs.title = "Assessment title is required";
    }

    if (!description.trim()) {
      errs.description = "Description is required";
    }

    if (totalMarks === "" || totalMarks <= 0) {
      errs.totalMarks = "Total marks must be greater than 0";
    }

    if (passMarks === "" || passMarks < 0) {
      errs.passMarks = "Pass marks cannot be negative";
    } else if (
      typeof totalMarks === "number" &&
      Number(passMarks) > totalMarks
    ) {
      errs.passMarks = "Pass marks cannot exceed total marks";
    }

    if (durationMinutes === "" || durationMinutes <= 0) {
      errs.durationMinutes = "Duration must be greater than 0 minutes";
    }

    if (allowedAttempts === "" || allowedAttempts <= 0) {
      errs.allowedAttempts = "At least 1 attempt must be allowed";
    }

    if (!startTime) {
      errs.startTime = "Start time is required";
    }

    if (!endTime) {
      errs.endTime = "End time is required";
    }

    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      errs.endTime = "End time must be later than start time";
    }

    if (
      proctoring.trackTabSwitches &&
      (!proctoring.maxTabSwitches || proctoring.maxTabSwitches <= 0)
    ) {
      errs.maxTabSwitches = "Max tab switches must be at least 1";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.add({
        title: "Validation Error",
        description: "Please resolve the errors highlighted in the form.",
        type: "error",
      });
      return;
    }

    // Format dates to ISO 8601 strings
    const formattedStartTime = new Date(startTime).toISOString();
    const formattedEndTime = new Date(endTime).toISOString();

    const payload: ICreateAssessmentPayload = {
      title: title.trim(),
      description: description.trim(),
      totalMarks: Number(totalMarks),
      passingScore: Number(passMarks),
      durationMinutes: Number(durationMinutes),
      startDate: formattedStartTime,
      endDate: formattedEndTime,
      allowedAttempts: Number(allowedAttempts),
      isStrictTimeLimit,
      proctoringSettings: {
        trackTabSwitches: proctoring.trackTabSwitches,
        maxTabSwitches: proctoring.trackTabSwitches
          ? Number(proctoring.maxTabSwitches)
          : 0,
        requireFullscreen: proctoring.requireFullscreen,
        blockCopyPaste: proctoring.blockCopyPaste,
        trackFocusLoss: proctoring.trackFocusLoss,
      },
    };

    createAssessment(payload, {
      onSuccess: () => {
        // Query invalidation in form component as instructed (refreshes all assessment lists without page reload)
        queryClient.invalidateQueries({ queryKey: ["my-assessments"] });
        queryClient.invalidateQueries({ queryKey: ["company-assessments"] });
        queryClient.invalidateQueries({ queryKey: ["assessments"] });

        toast.add({
          title: "Assessment Created Successfully",
          description: `"${title.trim()}" has been published.`,
          type: "success",
        });

        handleReset();
        onSuccess?.();
      },
      onError: (error: unknown) => {
        const apiErr = error as {
          data?: { message?: string };
          message?: string;
        };

        toast.add({
          title: "Failed to Create Assessment",
          description:
            apiErr?.data?.message ||
            apiErr?.message ||
            "An unexpected error occurred while saving the assessment.",
          type: "error",
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <FileCheck2 className="size-3" />
              Assessment Creator
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Benchmark Setup
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1.5">
            Create New Assessment
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure assessment title, duration, scoring benchmarks, and
            proctoring safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadExample}
            className="text-xs gap-1.5"
            id="assessment-load-example-btn"
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
            id="assessment-reset-btn"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* ── Card 1: Basic Information ── */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <span>1. Basic Information</span>
          </CardTitle>
          <CardDescription>
            Specify the title and description visible to candidates before
            starting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium">
              Assessment Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title)
                  setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g. Senior Backend Engineer Benchmark 2026"
              className={
                errors.title
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {errors.title && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-medium">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              placeholder="Describe the assessment objectives, topics covered, and evaluation criteria..."
              className={
                errors.description
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {errors.description && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" />
                {errors.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Card 2: Scoring & Attempts ── */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="size-4 text-primary" />
            <span>2. Scoring & Evaluation</span>
          </CardTitle>
          <CardDescription>
            Set the evaluation scale, passing threshold, and attempt limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="totalMarks" className="text-xs font-medium">
                Total Marks <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalMarks"
                type="number"
                min={1}
                value={totalMarks}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? "" : Number(e.target.value);
                  setTotalMarks(val);
                  if (errors.totalMarks)
                    setErrors((prev) => ({ ...prev, totalMarks: undefined }));
                }}
                className={
                  errors.totalMarks
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.totalMarks && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.totalMarks}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passMarks" className="text-xs font-medium">
                Pass Marks <span className="text-destructive">*</span>
              </Label>
              <Input
                id="passMarks"
                type="number"
                min={0}
                value={passMarks}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? "" : Number(e.target.value);
                  setPassMarks(val);
                  if (errors.passMarks)
                    setErrors((prev) => ({ ...prev, passMarks: undefined }));
                }}
                className={
                  errors.passMarks
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.passMarks && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.passMarks}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="allowedAttempts" className="text-xs font-medium">
                Allowed Attempts <span className="text-destructive">*</span>
              </Label>
              <Input
                id="allowedAttempts"
                type="number"
                min={1}
                value={allowedAttempts}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? "" : Number(e.target.value);
                  setAllowedAttempts(val);
                  if (errors.allowedAttempts)
                    setErrors((prev) => ({
                      ...prev,
                      allowedAttempts: undefined,
                    }));
                }}
                className={
                  errors.allowedAttempts
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.allowedAttempts && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.allowedAttempts}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 3: Schedule & Duration ── */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <span>3. Schedule & Duration</span>
          </CardTitle>
          <CardDescription>
            Specify the test window availability and time limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="durationMinutes" className="text-xs font-medium">
                Duration (Minutes) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="durationMinutes"
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? "" : Number(e.target.value);
                  setDurationMinutes(val);
                  if (errors.durationMinutes)
                    setErrors((prev) => ({
                      ...prev,
                      durationMinutes: undefined,
                    }));
                }}
                className={
                  errors.durationMinutes
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.durationMinutes && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.durationMinutes}
                </p>
              )}
            </div>

            {/* Strict Time Limit Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
              <div className="space-y-0.5">
                <Label
                  htmlFor="strict-time-toggle"
                  className="text-xs font-medium cursor-pointer"
                >
                  Strict Time Limit
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Auto-submits test when timer reaches 00:00
                </p>
              </div>
              <button
                type="button"
                id="strict-time-toggle"
                role="switch"
                aria-checked={isStrictTimeLimit}
                onClick={() => setIsStrictTimeLimit(!isStrictTimeLimit)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  isStrictTimeLimit ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isStrictTimeLimit ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="startTime"
                className="text-xs font-medium flex items-center gap-1.5"
              >
                <Calendar className="size-3 text-muted-foreground" />
                Start Window <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (errors.startTime)
                    setErrors((prev) => ({ ...prev, startTime: undefined }));
                }}
                className={
                  errors.startTime
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.startTime && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.startTime}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="endTime"
                className="text-xs font-medium flex items-center gap-1.5"
              >
                <Calendar className="size-3 text-muted-foreground" />
                End Window <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (errors.endTime)
                    setErrors((prev) => ({ ...prev, endTime: undefined }));
                }}
                className={
                  errors.endTime
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.endTime && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 4: Proctoring Settings ── */}
      <Card className="shadow-xs border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="size-4 text-primary" />
            <span>4. Anti-Cheating & Proctoring</span>
          </CardTitle>
          <CardDescription>
            Enforce test integrity with automated proctoring rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Require Fullscreen */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Maximize2 className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-medium">Require Fullscreen</p>
                  <p className="text-[11px] text-muted-foreground">
                    Candidates must remain in full-screen mode
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={proctoring.requireFullscreen}
                onClick={() =>
                  setProctoring((prev) => ({
                    ...prev,
                    requireFullscreen: !prev.requireFullscreen,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  proctoring.requireFullscreen ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transition duration-200 ease-in-out ${
                    proctoring.requireFullscreen
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Block Copy Paste */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <CopyX className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-medium">Block Copy & Paste</p>
                  <p className="text-[11px] text-muted-foreground">
                    Disable clipboard actions inside the test environment
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={proctoring.blockCopyPaste}
                onClick={() =>
                  setProctoring((prev) => ({
                    ...prev,
                    blockCopyPaste: !prev.blockCopyPaste,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  proctoring.blockCopyPaste ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transition duration-200 ease-in-out ${
                    proctoring.blockCopyPaste
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Track Focus Loss */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <ShieldAlert className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-medium">
                    Track Window Blur / Focus Loss
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Flag when browser window loses focus
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={proctoring.trackFocusLoss}
                onClick={() =>
                  setProctoring((prev) => ({
                    ...prev,
                    trackFocusLoss: !prev.trackFocusLoss,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  proctoring.trackFocusLoss ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transition duration-200 ease-in-out ${
                    proctoring.trackFocusLoss
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Track Tab Switches */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Users className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-medium">Track Tab Switches</p>
                  <p className="text-[11px] text-muted-foreground">
                    Monitor when candidate switches between browser tabs
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={proctoring.trackTabSwitches}
                onClick={() =>
                  setProctoring((prev) => ({
                    ...prev,
                    trackTabSwitches: !prev.trackTabSwitches,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  proctoring.trackTabSwitches ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg transition duration-200 ease-in-out ${
                    proctoring.trackTabSwitches
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Conditional Max Tab Switches Input */}
          {proctoring.trackTabSwitches && (
            <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2 mt-2">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="maxTabSwitches"
                    className="text-xs font-medium"
                  >
                    Max Tab Switches Allowed
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Exceeding this count can trigger warning or auto-submission.
                  </p>
                </div>
                <div className="w-28">
                  <Input
                    id="maxTabSwitches"
                    type="number"
                    min={1}
                    value={proctoring.maxTabSwitches}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProctoring((prev) => ({
                        ...prev,
                        maxTabSwitches: val,
                      }));
                      if (errors.maxTabSwitches) {
                        setErrors((prev) => ({
                          ...prev,
                          maxTabSwitches: undefined,
                        }));
                      }
                    }}
                    className={
                      errors.maxTabSwitches ? "border-destructive" : ""
                    }
                  />
                </div>
              </div>
              {errors.maxTabSwitches && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.maxTabSwitches}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Summary & Actions ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted font-medium text-foreground">
            <Clock className="size-3 text-primary" />
            {durationMinutes || 0} mins
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted font-medium text-foreground">
            <Award className="size-3 text-emerald-500" />
            Pass: {passMarks || 0}/{totalMarks || 0}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted font-medium text-foreground">
            <Shield className="size-3 text-sky-500" />
            Proctoring:{" "}
            {
              [
                proctoring.requireFullscreen,
                proctoring.blockCopyPaste,
                proctoring.trackFocusLoss,
                proctoring.trackTabSwitches,
              ].filter(Boolean).length
            }{" "}
            active
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isPending}
            className="w-full sm:w-auto text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto text-xs font-semibold gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Creating Assessment...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                Create Assessment
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
