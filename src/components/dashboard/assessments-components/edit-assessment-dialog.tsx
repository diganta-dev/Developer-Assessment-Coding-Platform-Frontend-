"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Loader2,
  Save,
  Settings2,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useUpdateAssessmentDirectRoute } from "@/hook/assessment.hook";
import { cn } from "@/lib/utils";
import type {
  ISingleAssessmentDetail,
  IUpdateAssessmentPayload,
  IUpdateAssessmentResponse,
} from "@/types/assessment.type";

// ─── Helpers for ISO Dates & Local Input ─────────────────────────────────────

function formatIso(val?: string | null): string | null {
  if (!val || !val.trim()) return null;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function formatForInput(d?: string | null): string {
  if (!d) return "";
  try {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

// ─── Zod Schema for Validation ───────────────────────────────────────────────

const updateAssessmentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title cannot exceed 200 characters"),
    description: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional()
      .nullable(),
    durationMinutes: z
      .number()
      .int("Duration must be an integer")
      .min(5, "Duration must be at least 5 minutes")
      .max(1440, "Duration cannot exceed 24 hours"),
    totalMarks: z
      .number()
      .positive("Total marks must be positive")
      .optional()
      .nullable(),
    passingScore: z
      .number()
      .positive("Passing score must be positive")
      .optional()
      .nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED", "ARCHIVED"]),
    settings: z.object({
      maxAttempts: z.number().int().min(1, "Max attempts must be at least 1"),
      allowMultipleAttempts: z.boolean(),
      autoSubmitOnExpiry: z.boolean(),
      preventCopyPaste: z.boolean(),
      requireFullscreen: z.boolean(),
      shuffleQuestions: z.boolean(),
      shuffleMCQOptions: z.boolean(),
    }),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (
        data.passingScore !== null &&
        data.passingScore !== undefined &&
        data.totalMarks !== null &&
        data.totalMarks !== undefined
      ) {
        return data.passingScore <= data.totalMarks;
      }
      return true;
    },
    {
      message: "Passing score cannot exceed total marks",
      path: ["passingScore"],
    },
  );

type UpdateAssessmentValues = z.infer<typeof updateAssessmentSchema>;

interface EditAssessmentDialogProps {
  assessment: ISingleAssessmentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditAssessmentDialog({
  assessment,
  open,
  onOpenChange,
  onSuccess,
}: EditAssessmentDialogProps) {
  const queryClient = useQueryClient();
  const { mutate: updateAssessment, isPending } =
    useUpdateAssessmentDirectRoute();
  const [activeTab, setActiveTab] = useState<"general" | "settings">("general");

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      durationMinutes: 60,
      totalMarks: 100,
      passingScore: null as number | null,
      startDate: null as string | null,
      endDate: null as string | null,
      status: "DRAFT" as
        | "DRAFT"
        | "PUBLISHED"
        | "ACTIVE"
        | "COMPLETED"
        | "ARCHIVED",
      settings: {
        maxAttempts: 1,
        allowMultipleAttempts: false,
        autoSubmitOnExpiry: true,
        preventCopyPaste: false,
        requireFullscreen: false,
        shuffleQuestions: false,
        shuffleMCQOptions: false,
      },
    } as UpdateAssessmentValues,
    validators: {
      onChange: updateAssessmentSchema,
      onSubmit: updateAssessmentSchema,
    },
    onSubmit: async ({ value }) => {
      if (!assessment?.id) return;

      const formattedStartDate = formatIso(value.startDate);
      const formattedEndDate = formatIso(value.endDate);

      const payload: IUpdateAssessmentPayload = {
        title: value.title.trim(),
        description: value.description?.trim() || null,
        durationMinutes: Number(value.durationMinutes),
        status: value.status,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        settings: {
          maxAttempts: Number(value.settings.maxAttempts) || 1,
          allowMultipleAttempts: Boolean(value.settings.allowMultipleAttempts),
          autoSubmitOnExpiry: Boolean(value.settings.autoSubmitOnExpiry),
          preventCopyPaste: Boolean(value.settings.preventCopyPaste),
          requireFullscreen: Boolean(value.settings.requireFullscreen),
          shuffleQuestions: Boolean(value.settings.shuffleQuestions),
          shuffleMCQOptions: Boolean(value.settings.shuffleMCQOptions),
        },
      };

      if (value.totalMarks !== null && value.totalMarks !== undefined) {
        payload.totalMarks = Number(value.totalMarks);
      }
      if (value.passingScore !== null && value.passingScore !== undefined) {
        payload.passingScore = Number(value.passingScore);
      } else {
        payload.passingScore = null;
      }

      updateAssessment(
        {
          assessmentId: assessment.id,
          payload,
        },
        {
          onSuccess: (res: IUpdateAssessmentResponse) => {
            if (res?.success === false) {
              toast.add({
                title: "Failed to Update Assessment",
                description: res.message || "An error occurred.",
                type: "error",
              });
              return;
            }

            toast.add({
              title: "Assessment Updated",
              description: `"${value.title}" settings have been successfully updated.`,
              type: "success",
            });

            // Invalidate all related caches
            queryClient.invalidateQueries({
              queryKey: ["assessment-single", assessment.id],
            });
            queryClient.invalidateQueries({
              queryKey: ["assessment-single-direct", assessment.id],
            });
            queryClient.invalidateQueries({
              queryKey: ["my-assessments"],
            });
            queryClient.invalidateQueries({
              queryKey: ["company-assessments"],
            });
            queryClient.invalidateQueries({
              queryKey: ["assessments"],
            });

            onSuccess?.();
            onOpenChange(false);
          },
          onError: (err: unknown) => {
            const apiErr = err as {
              response?: { data?: { message?: string } };
              data?: { message?: string };
              message?: string;
            };

            const errMsg =
              apiErr?.response?.data?.message ||
              apiErr?.data?.message ||
              apiErr?.message ||
              "An error occurred while updating the assessment.";

            toast.add({
              title: "Update Failed",
              description: errMsg,
              type: "error",
            });
          },
        },
      );
    },
  });

  useEffect(() => {
    if (assessment && open) {
      const assessmentSettings = (assessment.settings || {}) as {
        maxAttempts?: number;
        allowMultipleAttempts?: boolean;
        autoSubmitOnExpiry?: boolean;
        preventCopyPaste?: boolean;
        requireFullscreen?: boolean;
        shuffleQuestions?: boolean;
        shuffleMCQOptions?: boolean;
      };

      form.reset({
        title: assessment.title || "",
        description: assessment.description || "",
        durationMinutes: assessment.durationMinutes || 60,
        totalMarks: assessment.totalMarks ? Number(assessment.totalMarks) : 100,
        passingScore: assessment.passingScore
          ? Number(assessment.passingScore)
          : null,
        startDate: formatForInput(assessment.startDate),
        endDate: formatForInput(assessment.endDate),
        status:
          (assessment.status as UpdateAssessmentValues["status"]) || "DRAFT",
        settings: {
          maxAttempts: assessmentSettings.maxAttempts ?? 1,
          allowMultipleAttempts:
            assessmentSettings.allowMultipleAttempts ?? false,
          autoSubmitOnExpiry: assessmentSettings.autoSubmitOnExpiry ?? true,
          preventCopyPaste: assessmentSettings.preventCopyPaste ?? false,
          requireFullscreen: assessmentSettings.requireFullscreen ?? false,
          shuffleQuestions: assessmentSettings.shuffleQuestions ?? false,
          shuffleMCQOptions: assessmentSettings.shuffleMCQOptions ?? false,
        },
      });
      setActiveTab("general");
    }
  }, [assessment, open, form.reset]);

  if (!assessment) return null;

  const isPublished =
    assessment.status === "PUBLISHED" || assessment.status === "ACTIVE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-3xl max-h-[92vh] p-0 overflow-hidden flex flex-col shadow-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <Settings2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Edit Assessment
              </DialogTitle>
              <DialogDescription
                render={<p className="text-xs text-muted-foreground mt-0.5" />}
              >
                Update configurations, schedule window, and proctoring policies.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isPublished && (
          <div className="mx-6 mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold">
                This assessment is currently active or published.
              </p>
              <p className="opacity-90 mt-0.5">
                Modifying schedule, duration, or exam policies while candidates
                are attempting it may affect in-progress submissions.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Navigation Tabs */}
          <div className="px-6 flex items-center gap-4 border-b border-border/40 mt-3">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={cn(
                "pb-2.5 text-xs font-semibold transition-colors border-b-2 cursor-pointer",
                activeTab === "general"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              General Details & Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={cn(
                "pb-2.5 text-xs font-semibold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5",
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Shield className="size-3.5" />
              Settings & Proctoring
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-5 [scrollbar-width:thin]">
            {activeTab === "general" ? (
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <form.Field name="title">
                  {(field) => (
                    <Field className="col-span-1 sm:col-span-2">
                      <FieldLabel className="text-xs font-medium">
                        Assessment Title
                      </FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Senior Frontend Benchmark 2026"
                        className="text-xs"
                      />
                      {field.state.meta.errors ? (
                        <FieldError className="text-[11px] text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      ) : null}
                    </Field>
                  )}
                </form.Field>

                {/* Description */}
                <form.Field name="description">
                  {(field) => (
                    <Field className="col-span-1 sm:col-span-2">
                      <FieldLabel className="text-xs font-medium">
                        Description
                      </FieldLabel>
                      <Textarea
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Provide test instructions, candidate rules, and expectations..."
                        className="min-h-[90px] resize-y text-xs"
                      />
                      {field.state.meta.errors ? (
                        <FieldError className="text-[11px] text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      ) : null}
                    </Field>
                  )}
                </form.Field>

                {/* Duration */}
                <form.Field name="durationMinutes">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-xs font-medium">
                        Duration (Minutes)
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          type="number"
                          min={5}
                          max={1440}
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value) || 0)
                          }
                          className="text-xs pl-8"
                        />
                        <Clock className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                      {field.state.meta.errors ? (
                        <FieldError className="text-[11px] text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      ) : null}
                    </Field>
                  )}
                </form.Field>

                {/* Status */}
                <form.Field name="status">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-xs font-medium">
                        Lifecycle Status
                      </FieldLabel>
                      <select
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value as UpdateAssessmentValues["status"],
                          )
                        }
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                      {field.state.meta.errors ? (
                        <FieldError className="text-[11px] text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      ) : null}
                    </Field>
                  )}
                </form.Field>

                {/* Total Marks */}
                <form.Field name="totalMarks">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-xs font-medium">
                        Total Marks (Points)
                      </FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        value={field.state.value ?? ""}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        placeholder="e.g. 100"
                        className="text-xs"
                      />
                      {field.state.meta.errors ? (
                        <FieldError className="text-[11px] text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      ) : null}
                    </Field>
                  )}
                </form.Field>

                {/* Passing Score */}
                <form.Field name="passingScore">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-xs font-medium">
                        Passing Score (Points)
                      </FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        value={field.state.value ?? ""}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        placeholder="e.g. 60 (Optional)"
                        className="text-xs"
                      />
                      {field.state.meta.errors ? (
                        <FieldError className="text-[11px] text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      ) : null}
                    </Field>
                  )}
                </form.Field>

                {/* Start Date */}
                <form.Field name="startDate">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-xs font-medium">
                        Start Date & Time (Schedule Window)
                      </FieldLabel>
                      <Input
                        type="datetime-local"
                        value={field.state.value || ""}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                        className="text-xs"
                      />
                      {field.state.meta.errors ? (
                        <FieldError className="text-[11px] text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      ) : null}
                    </Field>
                  )}
                </form.Field>

                {/* End Date */}
                <form.Field name="endDate">
                  {(field) => (
                    <Field>
                      <FieldLabel className="text-xs font-medium">
                        End Date & Time (Expiry Window)
                      </FieldLabel>
                      <Input
                        type="datetime-local"
                        value={field.state.value || ""}
                        onChange={(e) =>
                          field.handleChange(e.target.value || null)
                        }
                        className="text-xs"
                      />
                      {field.state.meta.errors ? (
                        <FieldError className="text-[11px] text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </FieldError>
                      ) : null}
                    </Field>
                  )}
                </form.Field>
              </FieldGroup>
            ) : (
              <FieldGroup className="grid grid-cols-1 gap-4">
                {/* Auto Submit on Expiry */}
                <form.Field name="settings.autoSubmitOnExpiry">
                  {(field) => (
                    <Field className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3.5 bg-card hover:bg-muted/10 transition-colors">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-xs font-semibold cursor-pointer">
                          Strict Time Limit (Auto-Submit on Expiry)
                        </FieldLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Automatically submit and grade the candidate attempt
                          the moment duration expires.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="size-4 accent-primary cursor-pointer"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                    </Field>
                  )}
                </form.Field>

                {/* Prevent Copy Paste */}
                <form.Field name="settings.preventCopyPaste">
                  {(field) => (
                    <Field className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3.5 bg-card hover:bg-muted/10 transition-colors">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-xs font-semibold cursor-pointer">
                          Prevent Copy & Paste
                        </FieldLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Block clipboard copying of test questions and pasting
                          external code into solution boxes.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="size-4 accent-primary cursor-pointer"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                    </Field>
                  )}
                </form.Field>

                {/* Require Fullscreen */}
                <form.Field name="settings.requireFullscreen">
                  {(field) => (
                    <Field className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3.5 bg-card hover:bg-muted/10 transition-colors">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-xs font-semibold cursor-pointer">
                          Require Fullscreen Mode
                        </FieldLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Enforce browser fullscreen mode and trigger real-time
                          violation logs on screen departure.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="size-4 accent-primary cursor-pointer"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                    </Field>
                  )}
                </form.Field>

                {/* Shuffle Questions */}
                <form.Field name="settings.shuffleQuestions">
                  {(field) => (
                    <Field className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3.5 bg-card hover:bg-muted/10 transition-colors">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-xs font-semibold cursor-pointer">
                          Shuffle Questions Order
                        </FieldLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Randomize problem question sequence for each candidate
                          taking the assessment.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="size-4 accent-primary cursor-pointer"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                    </Field>
                  )}
                </form.Field>

                {/* Shuffle MCQ Options */}
                <form.Field name="settings.shuffleMCQOptions">
                  {(field) => (
                    <Field className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3.5 bg-card hover:bg-muted/10 transition-colors">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-xs font-semibold cursor-pointer">
                          Shuffle MCQ Options
                        </FieldLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Randomize multiple choice options sequence across
                          different candidate sessions.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="size-4 accent-primary cursor-pointer"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                    </Field>
                  )}
                </form.Field>

                {/* Multiple Attempts Policy */}
                <div className="rounded-lg border border-border/70 p-3.5 bg-card space-y-3">
                  <form.Field name="settings.allowMultipleAttempts">
                    {(field) => (
                      <Field className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FieldLabel className="text-xs font-semibold cursor-pointer">
                            Allow Multiple Attempts
                          </FieldLabel>
                          <p className="text-[11px] text-muted-foreground">
                            Permit candidates to re-attempt the assessment if
                            they encounter issues.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="size-4 accent-primary cursor-pointer"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                        />
                      </Field>
                    )}
                  </form.Field>

                  {/* Max Attempts Input */}
                  <form.Field name="settings.maxAttempts">
                    {(field) => (
                      <Field className="pt-2 border-t border-border/40">
                        <FieldLabel className="text-xs font-medium">
                          Max Attempts Allowed
                        </FieldLabel>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(Number(e.target.value) || 1)
                          }
                          className="text-xs max-w-xs mt-1"
                        />
                        {field.state.meta.errors ? (
                          <FieldError className="text-[11px] text-destructive">
                            {field.state.meta.errors.join(", ")}
                          </FieldError>
                        ) : null}
                      </Field>
                    )}
                  </form.Field>
                </div>
              </FieldGroup>
            )}
          </div>

          <DialogFooter className="p-4 px-6 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="text-xs gap-1.5 cursor-pointer font-semibold"
              id="save-assessment-changes-btn"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditAssessmentDialog;
