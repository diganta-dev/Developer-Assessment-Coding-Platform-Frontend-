"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  Check,
  ChevronDown,
  Clock,
  FileSpreadsheet,
  Info,
  Layers,
  Loader2,
  Mail,
  Plus,
  Send,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useId, useMemo, useRef, useState } from "react";
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
import {
  useGetCompanyAllAssessments,
  useInviteCandidate,
} from "@/hook/assessment.hook";
import type { IAssessment } from "@/types/assessment.type";

export interface InviteCandidateDialogProps {
  assessment: IAssessment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function InviteCandidateDialog({
  assessment: initialAssessment,
  open,
  onOpenChange,
  onSuccess,
}: InviteCandidateDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  // Selected assessment state (if not passed as prop)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    initialAssessment?.id || "",
  );

  // Email state
  const [currentEmailInput, setCurrentEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);

  // Input tabs/modes: "CHIPS" | "BULK_TEXT" | "FILE"
  const [inputMode, setInputMode] = useState<"CHIPS" | "BULK_TEXT" | "FILE">(
    "CHIPS",
  );
  const [bulkTextInput, setBulkTextInput] = useState("");

  // Fetch assessments list if no initial assessment provided
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

  // Determine current active assessment
  const targetAssessment = useMemo(() => {
    if (initialAssessment) return initialAssessment;
    if (!selectedAssessmentId) return null;
    return assessmentsList.find((a) => a.id === selectedAssessmentId) || null;
  }, [initialAssessment, selectedAssessmentId, assessmentsList]);

  // React Query Mutation
  const inviteMutation = useInviteCandidate();

  // ── Email Parsing & Normalization Helper ───────────────────────────────────

  const parseAndAddEmails = (
    rawText: string,
  ): { added: number; skipped: number } => {
    const tokens = rawText
      .split(/[\r\n,; \t]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    let addedCount = 0;
    let skippedCount = 0;
    const newValidEmails: string[] = [];

    for (const token of tokens) {
      if (EMAIL_REGEX.test(token)) {
        if (!emails.includes(token) && !newValidEmails.includes(token)) {
          newValidEmails.push(token);
          addedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    if (newValidEmails.length > 0) {
      setEmails((prev) => [...prev, ...newValidEmails]);
    }

    return { added: addedCount, skipped: skippedCount };
  };

  // Add single email or auto-split if pasted with delimiters
  const handleAddSingleEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (
      trimmed.includes(",") ||
      trimmed.includes(";") ||
      trimmed.includes("\n") ||
      trimmed.includes(" ")
    ) {
      const { added, skipped } = parseAndAddEmails(trimmed);
      setCurrentEmailInput("");
      setInputError(null);
      if (added > 0) {
        toast.add({
          title: "Emails Added",
          description: `Added ${added} candidate email${added > 1 ? "s" : ""}.`,
          type: "info",
        });
      }
      if (skipped > 0) {
        setInputError(`Skipped ${skipped} invalid email entries.`);
      }
      return;
    }

    const normalized = trimmed.toLowerCase();

    if (!EMAIL_REGEX.test(normalized)) {
      setInputError(
        "Please enter a valid email address (e.g. dev@company.com)",
      );
      return;
    }

    if (emails.includes(normalized)) {
      setInputError("This candidate is already in the invite list");
      return;
    }

    setEmails((prev) => [...prev, normalized]);
    setCurrentEmailInput("");
    setInputError(null);
  };

  // Handle key down (Enter, Comma)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSingleEmail(currentEmailInput);
    }
  };

  // Remove email chip
  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  // Clear all staged emails
  const handleClearAll = () => {
    setEmails([]);
    setInputError(null);
  };

  // Apply Bulk Text
  const handleApplyBulkText = () => {
    if (!bulkTextInput.trim()) {
      setInputMode("CHIPS");
      return;
    }

    const { added, skipped } = parseAndAddEmails(bulkTextInput);
    setBulkTextInput("");
    setInputMode("CHIPS");

    if (added > 0) {
      toast.add({
        title: "Bulk Emails Parsed",
        description: `Successfully added ${added} valid candidate email${added > 1 ? "s" : ""}.`,
        type: "success",
      });
    }

    if (skipped > 0) {
      toast.add({
        title: "Ignored Invalid Entries",
        description: `Skipped ${skipped} entries that did not match standard email formats.`,
        type: "info",
      });
    }
  };

  // File Upload (.csv or .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const { added, skipped } = parseAndAddEmails(content);
        if (added > 0) {
          toast.add({
            title: "File Processed Successfully",
            description: `Imported ${added} candidate email${added > 1 ? "s" : ""} from "${file.name}".`,
            type: "success",
          });
        } else {
          toast.add({
            title: "No Valid Emails Found",
            description: `Could not find valid email addresses in "${file.name}".`,
            type: "error",
          });
        }
        if (skipped > 0) {
          setInputError(`Skipped ${skipped} non-email tokens from file.`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Close modal and reset state
  const handleClose = () => {
    setEmails([]);
    setCurrentEmailInput("");
    setInputError(null);
    setInputMode("CHIPS");
    setBulkTextInput("");
    onOpenChange(false);
  };

  // Submit invitations
  const handleSubmit = () => {
    if (!targetAssessment?.id) {
      toast.add({
        title: "Assessment Required",
        description: "Please select an assessment to invite candidates to.",
        type: "error",
      });
      return;
    }

    if (emails.length === 0) {
      toast.add({
        title: "No Candidates Provided",
        description:
          "Please enter or paste at least one candidate email address.",
        type: "error",
      });
      return;
    }

    inviteMutation.mutate(
      {
        assessmentId: targetAssessment.id,
        payload: { emails },
      },
      {
        onSuccess: () => {
          // Query invalidation in component (senior fullstack rule)
          queryClient.invalidateQueries({ queryKey: ["company-assessments"] });
          queryClient.invalidateQueries({ queryKey: ["assessments"] });

          const count = emails.length;
          toast.add({
            title: "Invitations Dispatched Successfully",
            description: `Access links sent to ${count} candidate${count > 1 ? "s" : ""} for "${targetAssessment.title}".`,
            type: "success",
          });

          handleClose();
          onSuccess?.();
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };

          toast.add({
            title: "Failed to Send Invitations",
            description:
              apiErr?.data?.message ||
              apiErr?.message ||
              "An unexpected error occurred while communicating with the invitation server.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              <UserPlus className="size-3" />
              Candidate Invitations
            </span>
            {targetAssessment && (
              <span className="text-xs text-muted-foreground font-mono">
                ID: {targetAssessment.id.slice(0, 8)}...
              </span>
            )}
          </div>
          <DialogTitle className="text-lg font-bold text-foreground mt-1.5">
            Invite Candidates to Assessment
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Invited candidates will receive an assessment access link, benchmark
            details, and scheduling windows.
          </DialogDescription>
        </DialogHeader>

        {/* ── Assessment Target Picker or Banner ── */}
        {!initialAssessment ? (
          <div className="space-y-1.5 pt-1">
            <Label
              htmlFor="modal-assessment-select"
              className="text-xs font-semibold flex items-center gap-1.5"
            >
              <Layers className="size-3.5 text-primary" />
              Target Assessment <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <select
                id="modal-assessment-select"
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                disabled={isLoadingAssessments}
                className="w-full h-9 pl-3 pr-8 rounded-lg border border-border bg-background text-xs font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Select Assessment --</option>
                {assessmentsList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.durationMinutes} mins • {a.totalMarks} pts)
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-border/70 bg-muted/30 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">
                {targetAssessment?.title}
              </p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border/60 bg-background text-muted-foreground capitalize">
                {targetAssessment?.status || "Configured"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Clock className="size-3 text-primary" />
                {targetAssessment?.durationMinutes} mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Award className="size-3 text-emerald-500" />
                Pass: {targetAssessment?.passMarks}/
                {targetAssessment?.totalMarks} pts
              </span>
              <span>•</span>
              <span>Attempts: {targetAssessment?.allowedAttempts || 1}</span>
            </div>
          </div>
        )}

        {/* ── Mode Switcher & Input Section ── */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" />
              Candidate Email List ({emails.length} added)
            </Label>

            {/* Input Mode Switch Tabs */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-muted text-[11px] font-medium border border-border/60">
              <button
                type="button"
                onClick={() => setInputMode("CHIPS")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  inputMode === "CHIPS"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tag Input
              </button>
              <button
                type="button"
                onClick={() => setInputMode("BULK_TEXT")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  inputMode === "BULK_TEXT"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bulk Paste
              </button>
              <button
                type="button"
                onClick={() => setInputMode("FILE")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  inputMode === "FILE"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                CSV / File
              </button>
            </div>
          </div>

          {/* Mode 1: Interactive Tag Input */}
          {inputMode === "CHIPS" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Enter email and press Enter, comma, or paste multiple..."
                    value={currentEmailInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (
                        val.includes(",") ||
                        val.includes(";") ||
                        val.includes("\n")
                      ) {
                        handleAddSingleEmail(val);
                      } else {
                        setCurrentEmailInput(val);
                        if (inputError) setInputError(null);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    className="pl-9 text-xs h-9"
                    id="candidate-email-input"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddSingleEmail(currentEmailInput)}
                  className="text-xs h-9 px-3 gap-1"
                >
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>

              {inputError && (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                  <AlertCircle className="size-3" />
                  {inputError}
                </p>
              )}
            </div>
          )}

          {/* Mode 2: Bulk Text Paste */}
          {inputMode === "BULK_TEXT" && (
            <div className="space-y-2">
              <Textarea
                rows={4}
                placeholder="Paste candidate emails separated by commas, spaces, or newlines (e.g. from an Excel column or email list)..."
                value={bulkTextInput}
                onChange={(e) => setBulkTextInput(e.target.value)}
                className="text-xs font-mono"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputMode("CHIPS")}
                  className="text-xs h-7"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyBulkText}
                  className="text-xs h-7 gap-1 font-semibold"
                >
                  <Check className="size-3" />
                  Parse & Add Emails
                </Button>
              </div>
            </div>
          )}

          {/* Mode 3: CSV / TXT Upload */}
          {inputMode === "FILE" && (
            <div className="p-4 rounded-xl border border-dashed border-border/70 bg-muted/20 text-center space-y-2.5">
              <div className="p-2.5 rounded-full bg-primary/10 text-primary w-fit mx-auto">
                <FileSpreadsheet className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Upload CSV or Text File
                </p>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  Upload a spreadsheet or text file containing candidate email
                  addresses.
                </p>
              </div>
              <div>
                <input
                  id={fileInputId}
                  type="file"
                  accept=".csv,.txt"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs gap-1.5 h-8"
                >
                  <Upload className="size-3.5" />
                  Choose File (.csv, .txt)
                </Button>
              </div>
            </div>
          )}

          {/* ── Staged Candidates Chips Container ── */}
          {emails.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Staged for invitation:</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-destructive hover:underline font-medium cursor-pointer"
                >
                  Clear all ({emails.length})
                </button>
              </div>

              <div className="p-3 rounded-xl border border-border/70 bg-card max-h-44 overflow-y-auto space-y-1.5 shadow-xs">
                <div className="flex flex-wrap gap-1.5">
                  {emails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted/60 border border-border text-foreground shadow-xs"
                    >
                      <Mail className="size-2.5 text-muted-foreground" />
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                        title="Remove candidate"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {emails.length === 0 && inputMode === "CHIPS" && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
              <Info className="size-3 text-primary shrink-0" />
              Tip: You can paste comma-separated email lists directly into the
              input field above.
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="gap-2 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={inviteMutation.isPending}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={
              emails.length === 0 ||
              !targetAssessment?.id ||
              inviteMutation.isPending
            }
            onClick={handleSubmit}
            className="text-xs gap-1.5 font-semibold"
            id="send-candidate-invitations-btn"
          >
            {inviteMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Dispatching Invites...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                Send {emails.length}{" "}
                {emails.length === 1 ? "Invitation" : "Invitations"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InviteCandidateDialog;
