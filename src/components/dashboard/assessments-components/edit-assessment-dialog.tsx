"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Code2,
  Eye,
  Settings2,
  ShieldAlert,
  Loader2,
  Save,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useUpdateAssessment } from "@/hook/assessment.hook";
import type { ISingleAssessmentDetail } from "@/types/assessment.type";
import { cn } from "@/lib/utils";

const updateAssessmentSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be at most 200 characters")
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .max(2000, "Description must be at most 2000 characters")
      .optional()
      .nullable(),
    durationMinutes: z
      .number()
      .int()
      .min(5, "Duration must be at least 5 minutes")
      .max(1440, "Duration must be at most 24 hours")
      .optional(),
    totalMarks: z.number().positive().optional(),
    passingScore: z.number().positive().optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    status: z
      .enum(["DRAFT", "PUBLISHED", "ACTIVE", "COMPLETED", "ARCHIVED"])
      .optional(),
    isStrictTimeLimit: z.boolean().optional(),
    proctoringSettings: z
      .object({
        trackTabSwitches: z.boolean().optional(),
        maxTabSwitches: z.number().optional(),
        requireFullscreen: z.boolean().optional(),
        blockCopyPaste: z.boolean().optional(),
        trackFocusLoss: z.boolean().optional(),
      })
      .optional(),
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
  );

type UpdateAssessmentValues = z.infer<typeof updateAssessmentSchema>;

interface EditAssessmentDialogProps {
  assessment: ISingleAssessmentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAssessmentDialog({
  assessment,
  open,
  onOpenChange,
}: EditAssessmentDialogProps) {
  const queryClient = useQueryClient();
  const { mutate: updateAssessment, isPending } = useUpdateAssessment();
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
      status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ACTIVE" | "COMPLETED" | "ARCHIVED",
      isStrictTimeLimit: true,
      proctoringSettings: {
        trackTabSwitches: false,
        requireFullscreen: false,
        trackFocusLoss: false,
        maxTabSwitches: 3,
        blockCopyPaste: false,
      },
    } as UpdateAssessmentValues,
    validators: {
      onChange: updateAssessmentSchema,
      onSubmit: updateAssessmentSchema,
    },
    onSubmit: async ({ value }) => {
      if (!assessment?.id) return;

      const payload = {
        ...value,
        title: value.title || undefined,
        description: value.description || null,
        durationMinutes: value.durationMinutes ? Number(value.durationMinutes) : undefined,
        totalMarks: value.totalMarks ? Number(value.totalMarks) : undefined,
        passingScore: value.passingScore ? Number(value.passingScore) : null,
        startDate: value.startDate || null,
        endDate: value.endDate || null,
      } as any;

      updateAssessment(
        { assessmentId: assessment.id, payload },
        {
          onSuccess: (res: any) => {
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
              description: "The assessment has been successfully updated.",
              type: "success",
            });
            queryClient.invalidateQueries({
              queryKey: ["assessment-single", assessment.id],
            });
            queryClient.invalidateQueries({
              queryKey: ["my-assessments"],
            });
            queryClient.invalidateQueries({
              queryKey: ["company-assessments"],
            });
            onOpenChange(false);
          },
          onError: (err: any) => {
            toast.add({
              title: "Update Failed",
              description:
                err?.response?.data?.message || err?.message || "An error occurred.",
              type: "error",
            });
          },
        },
      );
    },
  });

  useEffect(() => {
    if (assessment && open) {
      // @ts-ignore
      form.reset({
        title: assessment.title || "",
        description: assessment.description || "",
        durationMinutes: assessment.durationMinutes || 60,
        totalMarks: assessment.totalMarks || 100,
        passingScore: assessment.passingScore || null,
        // @ts-ignore
        startDate: assessment.startDate ? new Date(assessment.startDate).toISOString().slice(0, 16) : null,
        // @ts-ignore
        endDate: assessment.endDate ? new Date(assessment.endDate).toISOString().slice(0, 16) : null,
        status: assessment.status as UpdateAssessmentValues["status"] || "DRAFT",
        isStrictTimeLimit: assessment.isStrictTimeLimit ?? true,
        proctoringSettings: {
          trackTabSwitches: assessment.proctoringSettings?.trackTabSwitches ?? false,
          requireFullscreen: assessment.proctoringSettings?.requireFullscreen ?? false,
          trackFocusLoss: assessment.proctoringSettings?.trackFocusLoss ?? false,
          maxTabSwitches: assessment.proctoringSettings?.maxTabSwitches ?? 3,
          blockCopyPaste: assessment.proctoringSettings?.blockCopyPaste ?? false,
        },
      });
      setActiveTab("general");
    }
  }, [assessment, open]);

  if (!assessment) return null;

  const isPublished = assessment.status === "PUBLISHED" || assessment.status === "ACTIVE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <Settings2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Edit Assessment</DialogTitle>
              <DialogDescription>
                Update the settings and configurations for this assessment.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isPublished && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">This assessment is live.</p>
              <p className="opacity-90 mt-0.5">
                Modifying schedule, duration, or proctoring settings while candidates are attempting it may cause unexpected behavior.
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
          <div className="px-6 flex items-center gap-4 border-b border-border/40 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={cn(
                "pb-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "general"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              General Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={cn(
                "pb-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Proctoring & Settings
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === "general" ? (
              <FieldGroup className="grid grid-cols-2 gap-6">
                <form.Field
                  name="title"
                  children={(field) => (
                    <Field className="col-span-2">
                      <FieldLabel>Assessment Title</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Senior Frontend Developer Assessment"
                      />
                      {field.state.meta.errors ? (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />

                <form.Field
                  name="description"
                  children={(field) => (
                    <Field className="col-span-2">
                      <FieldLabel>Description</FieldLabel>
                      <Textarea
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Describe the assessment instructions, rules, and expectations..."
                        className="min-h-[100px] resize-y"
                      />
                      {field.state.meta.errors ? (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />

                <form.Field
                  name="durationMinutes"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Duration (Minutes)</FieldLabel>
                      <Input
                        type="number"
                        min={5}
                        max={1440}
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value) || 0)
                        }
                      />
                      {field.state.meta.errors ? (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />

                <form.Field
                  name="status"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />

                <form.Field
                  name="startDate"
                  children={(field) => (
                    <Field>
                      <FieldLabel>Start Date & Time</FieldLabel>
                      <Input
                        type="datetime-local"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value || null)}
                      />
                      {field.state.meta.errors ? (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />

                <form.Field
                  name="endDate"
                  children={(field) => (
                    <Field>
                      <FieldLabel>End Date & Time</FieldLabel>
                      <Input
                        type="datetime-local"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value || null)}
                      />
                      {field.state.meta.errors ? (
                        <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                      ) : null}
                    </Field>
                  )}
                />
              </FieldGroup>
            ) : (
              <FieldGroup className="grid grid-cols-1 gap-6">
                <form.Field
                  name="isStrictTimeLimit"
                  children={(field) => (
                    <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-base">Strict Time Limit</FieldLabel>
                        <p className="text-sm text-muted-foreground">
                          Automatically submit the assessment when time runs out.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                      />
                    </Field>
                  )}
                />

                <div className="space-y-4 rounded-lg border p-4 bg-muted/10">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ShieldAlert className="size-4 text-primary" />
                    Proctoring Features
                  </h3>
                  
                  <form.Field
                    name="proctoringSettings.trackTabSwitches"
                    children={(field) => (
                      <Field className="flex flex-row items-center justify-between">
                        <FieldLabel className="font-normal">Track Tab Switches</FieldLabel>
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                        />
                      </Field>
                    )}
                  />

                  <form.Field
                    name="proctoringSettings.requireFullscreen"
                    children={(field) => (
                      <Field className="flex flex-row items-center justify-between">
                        <FieldLabel className="font-normal">Require Fullscreen</FieldLabel>
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                        />
                      </Field>
                    )}
                  />

                  <form.Field
                    name="proctoringSettings.blockCopyPaste"
                    children={(field) => (
                      <Field className="flex flex-row items-center justify-between">
                        <FieldLabel className="font-normal">Block Copy/Paste</FieldLabel>
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                        />
                      </Field>
                    )}
                  />
                  
                  <form.Field
                    name="proctoringSettings.trackFocusLoss"
                    children={(field) => (
                      <Field className="flex flex-row items-center justify-between">
                        <FieldLabel className="font-normal">Track Focus Loss</FieldLabel>
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                        />
                      </Field>
                    )}
                  />
                </div>
              </FieldGroup>
            )}
          </div>

          <DialogFooter className="p-6 border-t border-border/40 bg-muted/20 mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
