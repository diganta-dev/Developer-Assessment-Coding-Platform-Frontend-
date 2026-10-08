"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Clock,
  Loader2,
  Save,
  Settings2,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";

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

  // General Details State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [status, setStatus] = useState<
    "DRAFT" | "PUBLISHED" | "ACTIVE" | "COMPLETED" | "ARCHIVED"
  >("DRAFT");
  const [totalMarks, setTotalMarks] = useState<number | string>(100);
  const [passingScore, setPassingScore] = useState<number | string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Settings & Proctoring State
  const [autoSubmitOnExpiry, setAutoSubmitOnExpiry] = useState(true);
  const [preventCopyPaste, setPreventCopyPaste] = useState(false);
  const [requireFullscreen, setRequireFullscreen] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleMCQOptions, setShuffleMCQOptions] = useState(false);
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);

  // Form error message
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form state once when modal opens or assessment changes
  useEffect(() => {
    if (open && assessment) {
      setTitle(assessment.title || "");
      setDescription(assessment.description || "");
      setDurationMinutes(assessment.durationMinutes || 60);
      setStatus(
        (assessment.status as
          | "DRAFT"
          | "PUBLISHED"
          | "ACTIVE"
          | "COMPLETED"
          | "ARCHIVED") || "DRAFT",
      );
      setTotalMarks(
        assessment.totalMarks !== undefined ? assessment.totalMarks : 100,
      );
      setPassingScore(
        assessment.passingScore !== undefined &&
          assessment.passingScore !== null
          ? assessment.passingScore
          : "",
      );
      setStartDate(formatForInput(assessment.startDate));
      setEndDate(formatForInput(assessment.endDate));

      const settings = (assessment.settings || {}) as {
        maxAttempts?: number;
        allowMultipleAttempts?: boolean;
        autoSubmitOnExpiry?: boolean;
        preventCopyPaste?: boolean;
        requireFullscreen?: boolean;
        shuffleQuestions?: boolean;
        shuffleMCQOptions?: boolean;
      };

      setAutoSubmitOnExpiry(settings.autoSubmitOnExpiry ?? true);
      setPreventCopyPaste(settings.preventCopyPaste ?? false);
      setRequireFullscreen(settings.requireFullscreen ?? false);
      setShuffleQuestions(settings.shuffleQuestions ?? false);
      setShuffleMCQOptions(settings.shuffleMCQOptions ?? false);
      setAllowMultipleAttempts(settings.allowMultipleAttempts ?? false);
      setMaxAttempts(settings.maxAttempts ?? 1);

      setFormError(null);
      setActiveTab("general");
    }
  }, [open, assessment]);

  if (!assessment) return null;

  const isPublished =
    assessment.status === "PUBLISHED" || assessment.status === "ACTIVE";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validation
    if (!title.trim() || title.trim().length < 3) {
      setFormError("Assessment title must be at least 3 characters.");
      setActiveTab("general");
      return;
    }

    if (durationMinutes < 5 || durationMinutes > 1440) {
      setFormError("Duration must be between 5 and 1440 minutes.");
      setActiveTab("general");
      return;
    }

    if (startDate && endDate) {
      const s = new Date(startDate).getTime();
      const eDate = new Date(endDate).getTime();
      if (eDate <= s) {
        setFormError("End date must be strictly after the start date.");
        setActiveTab("general");
        return;
      }
    }

    const totalMarksNum = totalMarks !== "" ? Number(totalMarks) : undefined;
    const passingScoreNum = passingScore !== "" ? Number(passingScore) : null;

    if (
      passingScoreNum !== null &&
      totalMarksNum !== undefined &&
      passingScoreNum > totalMarksNum
    ) {
      setFormError(
        `Passing score (${passingScoreNum}) cannot exceed total marks (${totalMarksNum}).`,
      );
      setActiveTab("general");
      return;
    }

    const payload: IUpdateAssessmentPayload = {
      title: title.trim(),
      description: description.trim() || null,
      durationMinutes: Number(durationMinutes),
      status,
      startDate: formatIso(startDate),
      endDate: formatIso(endDate),
      settings: {
        maxAttempts: Number(maxAttempts) || 1,
        allowMultipleAttempts: Boolean(allowMultipleAttempts),
        autoSubmitOnExpiry: Boolean(autoSubmitOnExpiry),
        preventCopyPaste: Boolean(preventCopyPaste),
        requireFullscreen: Boolean(requireFullscreen),
        shuffleQuestions: Boolean(shuffleQuestions),
        shuffleMCQOptions: Boolean(shuffleMCQOptions),
      },
    };

    if (totalMarksNum !== undefined) {
      payload.totalMarks = totalMarksNum;
    }
    if (passingScoreNum !== null) {
      payload.passingScore = passingScoreNum;
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
            setFormError(res.message || "Failed to update assessment.");
            toast.add({
              title: "Update Failed",
              description: res.message || "An error occurred.",
              type: "error",
            });
            return;
          }

          toast.add({
            title: "Assessment Updated",
            description:
              res?.message ||
              `"${title.trim()}" settings have been successfully updated.`,
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

          onOpenChange(false);
          onSuccess?.();
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

          setFormError(errMsg);
          toast.add({
            title: "Update Failed",
            description: errMsg,
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="3xl" className="max-h-[90vh] p-0 overflow-hidden flex flex-col shadow-2xl">
        {/* Dialog Header */}
        <DialogHeader className="p-5 pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <Settings2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight">
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
                This assessment is live or published.
              </p>
              <p className="opacity-90 mt-0.5">
                Modifying schedule, duration, or exam policies while candidates
                are attempting it may affect in-progress submissions.
              </p>
            </div>
          </div>
        )}

        {formError && (
          <div className="mx-6 mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2 text-destructive text-xs items-center">
            <AlertCircle className="size-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
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
            {/* ── Tab 1: General Details ── */}
            <div className={activeTab === "general" ? "space-y-4" : "hidden"}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <Label
                    htmlFor="edit-assessment-title"
                    className="text-xs font-medium"
                  >
                    Assessment Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-assessment-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Benchmark 2026"
                    className="text-xs"
                    required
                  />
                </div>

                {/* Description */}
                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <Label
                    htmlFor="edit-assessment-desc"
                    className="text-xs font-medium"
                  >
                    Description & Guidelines
                  </Label>
                  <Textarea
                    id="edit-assessment-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide test instructions, candidate rules, and expectations..."
                    className="min-h-[90px] resize-y text-xs"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-assessment-duration"
                    className="text-xs font-medium"
                  >
                    Duration (Minutes){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit-assessment-duration"
                      type="number"
                      min={5}
                      max={1440}
                      value={durationMinutes}
                      onChange={(e) =>
                        setDurationMinutes(Number(e.target.value) || 0)
                      }
                      className="text-xs pl-8"
                      required
                    />
                    <Clock className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-assessment-status"
                    className="text-xs font-medium"
                  >
                    Lifecycle Status
                  </Label>
                  <select
                    id="edit-assessment-status"
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as
                          | "DRAFT"
                          | "PUBLISHED"
                          | "ACTIVE"
                          | "COMPLETED"
                          | "ARCHIVED",
                      )
                    }
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                {/* Total Marks */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-assessment-total-marks"
                    className="text-xs font-medium"
                  >
                    Total Marks (Points)
                  </Label>
                  <Input
                    id="edit-assessment-total-marks"
                    type="number"
                    min={1}
                    value={totalMarks}
                    onChange={(e) =>
                      setTotalMarks(
                        e.target.value !== "" ? Number(e.target.value) : "",
                      )
                    }
                    placeholder="e.g. 100"
                    className="text-xs"
                  />
                </div>

                {/* Passing Score */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-assessment-passing-score"
                    className="text-xs font-medium"
                  >
                    Passing Score (Points)
                  </Label>
                  <Input
                    id="edit-assessment-passing-score"
                    type="number"
                    min={0}
                    value={passingScore}
                    onChange={(e) =>
                      setPassingScore(
                        e.target.value !== "" ? Number(e.target.value) : "",
                      )
                    }
                    placeholder="e.g. 60 (Optional)"
                    className="text-xs"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-assessment-start"
                    className="text-xs font-medium"
                  >
                    Start Date & Time (Schedule Window)
                  </Label>
                  <Input
                    id="edit-assessment-start"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-assessment-end"
                    className="text-xs font-medium"
                  >
                    End Date & Time (Expiry Window)
                  </Label>
                  <Input
                    id="edit-assessment-end"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* ── Tab 2: Settings & Proctoring ── */}
            <div className={activeTab === "settings" ? "space-y-4" : "hidden"}>
              <div className="grid grid-cols-1 gap-4">
                {/* Auto Submit on Expiry */}
                <label className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3.5 bg-card hover:bg-muted/10 transition-colors cursor-pointer">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-semibold text-foreground">
                      Strict Time Limit (Auto-Submit on Expiry)
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Automatically submit and finalize candidate submissions
                      the exact moment exam duration expires.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="size-4 accent-primary cursor-pointer shrink-0"
                    checked={autoSubmitOnExpiry}
                    onChange={(e) => setAutoSubmitOnExpiry(e.target.checked)}
                  />
                </label>

                {/* Prevent Copy Paste */}
                <label className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3.5 bg-card hover:bg-muted/10 transition-colors cursor-pointer">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-semibold text-foreground">
                      Prevent Copy & Paste
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Block candidate clipboard copy actions and disable
                      external pasting into coding & written solutions.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="size-4 accent-primary cursor-pointer shrink-0"
                    checked={preventCopyPaste}
                    onChange={(e) => setPreventCopyPaste(e.target.checked)}
                  />
                </label>

                {/* Require Fullscreen */}
                <label className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3.5 bg-card hover:bg-muted/10 transition-colors cursor-pointer">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-semibold text-foreground">
                      Require Fullscreen Mode
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Mandate full-screen browser viewport and log live
                      anti-cheat violations whenever candidate leaves
                      fullscreen.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="size-4 accent-primary cursor-pointer shrink-0"
                    checked={requireFullscreen}
                    onChange={(e) => setRequireFullscreen(e.target.checked)}
                  />
                </label>

                {/* Shuffle Questions */}
                <label className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3.5 bg-card hover:bg-muted/10 transition-colors cursor-pointer">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-semibold text-foreground">
                      Shuffle Questions Order
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Randomize problem sequence for each candidate session to
                      prevent peer collaboration.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="size-4 accent-primary cursor-pointer shrink-0"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                  />
                </label>

                {/* Shuffle MCQ Options */}
                <label className="flex flex-row items-center justify-between rounded-lg border border-border/70 p-3.5 bg-card hover:bg-muted/10 transition-colors cursor-pointer">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-semibold text-foreground">
                      Shuffle MCQ Options
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Randomize multiple-choice choices order for each question
                      across candidates.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="size-4 accent-primary cursor-pointer shrink-0"
                    checked={shuffleMCQOptions}
                    onChange={(e) => setShuffleMCQOptions(e.target.checked)}
                  />
                </label>

                {/* Multiple Attempts Policy */}
                <div className="rounded-lg border border-border/70 p-3.5 bg-card space-y-3">
                  <label className="flex flex-row items-center justify-between cursor-pointer">
                    <div className="space-y-0.5 pr-4">
                      <p className="text-xs font-semibold text-foreground">
                        Allow Multiple Attempts
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Permit candidates to re-attempt the assessment if they
                        encounter technical issues.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="size-4 accent-primary cursor-pointer shrink-0"
                      checked={allowMultipleAttempts}
                      onChange={(e) =>
                        setAllowMultipleAttempts(e.target.checked)
                      }
                    />
                  </label>

                  {/* Max Attempts Input */}
                  <div className="pt-2 border-t border-border/40 space-y-1">
                    <Label
                      htmlFor="edit-assessment-max-attempts"
                      className="text-xs font-medium"
                    >
                      Max Attempts Allowed
                    </Label>
                    <Input
                      id="edit-assessment-max-attempts"
                      type="number"
                      min={1}
                      max={10}
                      value={maxAttempts}
                      onChange={(e) =>
                        setMaxAttempts(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="text-xs max-w-xs mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dialog Footer */}
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
