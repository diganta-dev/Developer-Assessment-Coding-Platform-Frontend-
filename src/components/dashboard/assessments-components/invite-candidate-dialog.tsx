"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  FileCheck2,
  FileSpreadsheet,
  Info,
  Layers,
  Loader2,
  Lock,
  Mail,
  Plus,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  useInviteCandidateDirectRoute,
} from "@/hook/assessment.hook";
import { useGetMe } from "@/hook";
import { isUserAuthorized } from "@/utils";
import { CompanyMemberRole, UserRole } from "@/types";
import type {
  IAssessment,
  ISingleAssessmentDetail,
} from "@/types/assessment.type";

export interface InviteCandidateDialogProps {
  assessment: IAssessment | ISingleAssessmentDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail?: string;
  onSuccess?: () => void;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function InviteCandidateDialog({
  assessment: initialAssessment,
  open,
  onOpenChange,
  initialEmail = "",
  onSuccess,
}: InviteCandidateDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  // Role verification from authentication context
  const { data: meData } = useGetMe();
  const currentUser = meData?.data;

  // Direct Route Mutation Hook
  const inviteMutation = useInviteCandidateDirectRoute();

  // Selected assessment state (if not passed as prop)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    initialAssessment?.id || "",
  );

  // Email state
  const [currentEmailInput, setCurrentEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);

  // Expiration duration setting: "DEFAULT" | "3_DAYS" | "7_DAYS" | "14_DAYS"
  const [expirationSetting, setExpirationSetting] = useState<
    "DEFAULT" | "3_DAYS" | "7_DAYS" | "14_DAYS"
  >("DEFAULT");

  // Input tabs/modes: "CHIPS" | "BULK_TEXT" | "FILE"
  const [inputMode, setInputMode] = useState<"CHIPS" | "BULK_TEXT" | "FILE">(
    "CHIPS",
  );
  const [bulkTextInput, setBulkTextInput] = useState("");

  // Sync initialAssessment or initialEmail
  useEffect(() => {
    if (initialAssessment?.id) {
      setSelectedAssessmentId(initialAssessment.id);
    }
  }, [initialAssessment?.id]);

  useEffect(() => {
    if (initialEmail && EMAIL_REGEX.test(initialEmail.trim())) {
      setEmails((prev) =>
        prev.includes(initialEmail.trim().toLowerCase())
          ? prev
          : [...prev, initialEmail.trim().toLowerCase()],
      );
    }
  }, [initialEmail]);

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

  // ── Role & Permission Verification ──
  // Backend direct route /:id/invite strictly enforces:
  // UserRole.SUPER_ADMIN, UserRole.ADMIN, CompanyMemberRole.COMPANY_OWNER, CompanyMemberRole.COMPANY_ADMIN
  const isPlatformAdmin =
    currentUser?.role === UserRole.SUPER_ADMIN ||
    currentUser?.role === UserRole.ADMIN;

  const canInviteCandidates = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
  ]);

  const userRoleDisplay = isPlatformAdmin
    ? "Platform Administrator"
    : currentUser?.memberRole === CompanyMemberRole.COMPANY_OWNER
      ? "Company Owner"
      : currentUser?.memberRole === CompanyMemberRole.COMPANY_ADMIN
        ? "Company Admin"
        : currentUser?.memberRole === CompanyMemberRole.ASSESSMENT_CREATOR
          ? "Assessment Creator (Restricted)"
          : currentUser?.memberRole === CompanyMemberRole.EVALUATOR
            ? "Evaluator (Restricted)"
            : currentUser?.role || "Non-Admin";

  // Assessment lifecycle checks
  const isArchivedOrCompleted =
    targetAssessment?.status === "COMPLETED" ||
    targetAssessment?.status === "ARCHIVED" ||
    targetAssessment?.status === "EXPIRED";

  const isPastDeadline =
    targetAssessment?.endDate &&
    new Date(targetAssessment.endDate) < new Date();

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
        "Please enter a valid email address (e.g. tested.candidate@devassess.com)",
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSingleEmail(currentEmailInput);
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const handleClearAll = () => {
    setEmails([]);
    setInputError(null);
  };

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
        description: `Successfully added ${added} candidate email${added > 1 ? "s" : ""}.`,
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

  const handleClose = () => {
    if (inviteMutation.isPending) return;
    setEmails([]);
    setCurrentEmailInput("");
    setInputError(null);
    setInputMode("CHIPS");
    setBulkTextInput("");
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!targetAssessment?.id) {
      toast.add({
        title: "Assessment Required",
        description: "Please select an assessment to invite candidates to.",
        type: "error",
      });
      return;
    }

    if (!canInviteCandidates) {
      toast.add({
        title: "Permission Denied",
        description:
          "Only Platform Admins, Company Owners, and Company Admins can dispatch invitations.",
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

    // Calculate optional expiresAt if selected
    let expiresAt: string | null = null;
    if (expirationSetting === "3_DAYS") {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      expiresAt = d.toISOString();
    } else if (expirationSetting === "7_DAYS") {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      expiresAt = d.toISOString();
    } else if (expirationSetting === "14_DAYS") {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      expiresAt = d.toISOString();
    }

    inviteMutation.mutate(
      {
        assessmentId: targetAssessment.id,
        payload: {
          emails,
          expiresAt: expiresAt || undefined,
        },
      },
      {
        onSuccess: (res) => {
          // React Query invalidation in calling component (AGENTS.md Rule 2)
          queryClient.invalidateQueries({ queryKey: ["company-assessments"] });
          queryClient.invalidateQueries({ queryKey: ["my-assessments"] });
          queryClient.invalidateQueries({ queryKey: ["assessments"] });
          queryClient.invalidateQueries({
            queryKey: ["assessment-invitations", targetAssessment.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-invitation", targetAssessment.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-single", targetAssessment.id],
          });

          const count = res?.data?.count || res?.data?.invitedCount || emails.length;
          toast.add({
            title: "Invitations Dispatched Successfully",
            description:
              res?.message ||
              `Access tokens sent to ${count} candidate${count > 1 ? "s" : ""} for "${targetAssessment.title}".`,
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
            title: "Failed to Dispatch Invitations",
            description:
              apiErr?.data?.message ||
              apiErr?.message ||
              "An unexpected error occurred while sending candidate invitations.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[96vw] max-w-[96vw] h-[90vh] max-h-[92vh] overflow-y-auto p-6 border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl space-y-4">
        {/* Header */}
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shadow-sm">
              <UserPlus className="size-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold text-foreground">
                  Invite Candidates
                </DialogTitle>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold">
                  Direct Route
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Generate secure access tokens and dispatch test invitation emails to candidates
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Role & Permission Guard (Admin / Company Owner / Company Admin Only) ── */}
        {!canInviteCandidates && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs space-y-2 text-destructive">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="size-4" />
              <span>Invitation Permission Denied (Role Restricted)</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You are currently authenticated as{" "}
              <strong className="text-foreground">{userRoleDisplay}</strong>. Under
              system access policies, only <strong>Platform Admins</strong>,{" "}
              <strong>Company Owners</strong>, and <strong>Company Admins</strong> are
              authorized to dispatch candidate invitations. Assessment Creators and
              Evaluators do not have permission to invite candidates.
            </p>
          </div>
        )}

        {/* Assessment Lifecycle Warnings */}
        {isArchivedOrCompleted && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs space-y-1 text-destructive">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="size-4" />
              <span>Assessment Archived / Completed</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Cannot dispatch invitations to an assessment that is closed, expired, or
              archived.
            </p>
          </div>
        )}

        {isPastDeadline && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs space-y-1 text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold">
              <Clock className="size-4 text-amber-600" />
              <span>Assessment Deadline Passed</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              The submission deadline for this test has already passed. Please update
              the end date before inviting candidates.
            </p>
          </div>
        )}

        {/* Assessment Target Card */}
        {targetAssessment && (
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {targetAssessment.title}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                  ID: {targetAssessment.id.slice(0, 16)}...
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase">
                {targetAssessment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1.5 border-t border-border/50 text-[11px]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5 text-amber-500" />
                <span>
                  Duration:{" "}
                  <strong className="text-foreground">
                    {targetAssessment.durationMinutes}m
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileCheck2 className="size-3.5 text-primary" />
                <span>
                  Total Marks:{" "}
                  <strong className="text-foreground">
                    {targetAssessment.totalMarks}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>
                  Passing:{" "}
                  <strong className="text-foreground">
                    {targetAssessment.passingScore ?? "N/A"}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Mode Selection Tabs (Chips / Bulk / Upload) ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={inputMode === "CHIPS" ? "default" : "ghost"}
                size="sm"
                onClick={() => setInputMode("CHIPS")}
                className="h-7 text-xs px-2.5 cursor-pointer font-medium"
              >
                Direct Add
              </Button>
              <Button
                type="button"
                variant={inputMode === "BULK_TEXT" ? "default" : "ghost"}
                size="sm"
                onClick={() => setInputMode("BULK_TEXT")}
                className="h-7 text-xs px-2.5 cursor-pointer font-medium"
              >
                Bulk Paste
              </Button>
              <Button
                type="button"
                variant={inputMode === "FILE" ? "default" : "ghost"}
                size="sm"
                onClick={() => setInputMode("FILE")}
                className="h-7 text-xs px-2.5 cursor-pointer font-medium"
              >
                CSV Upload
              </Button>
            </div>

            {emails.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-destructive hover:underline cursor-pointer"
              >
                Clear all ({emails.length})
              </button>
            )}
          </div>

          {/* Mode 1: Individual / Delimited Input */}
          {inputMode === "CHIPS" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter email e.g. tested.candidate@devassess.com..."
                    value={currentEmailInput}
                    onChange={(e) => {
                      setCurrentEmailInput(e.target.value);
                      if (inputError) setInputError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={!canInviteCandidates || inviteMutation.isPending}
                    className="text-xs h-8 pl-8 placeholder:text-muted-foreground/70"
                    id="single-candidate-email-input"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSingleEmail(currentEmailInput)}
                  disabled={
                    !canInviteCandidates ||
                    !currentEmailInput.trim() ||
                    inviteMutation.isPending
                  }
                  className="text-xs h-8 px-3 cursor-pointer shrink-0"
                >
                  <Plus className="size-3.5 mr-1" />
                  Add
                </Button>
              </div>

              {inputError && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  <span>{inputError}</span>
                </p>
              )}
            </div>
          )}

          {/* Mode 2: Bulk Text Input */}
          {inputMode === "BULK_TEXT" && (
            <div className="space-y-2">
              <Textarea
                placeholder="Paste candidate emails separated by commas, spaces, or newlines..."
                value={bulkTextInput}
                onChange={(e) => setBulkTextInput(e.target.value)}
                disabled={!canInviteCandidates || inviteMutation.isPending}
                className="text-xs min-h-[90px] font-mono leading-relaxed"
                id="bulk-candidate-emails-textarea"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setInputMode("CHIPS")}
                  className="text-xs h-7 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyBulkText}
                  disabled={!bulkTextInput.trim() || inviteMutation.isPending}
                  className="text-xs h-7 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
                >
                  Parse & Add Emails
                </Button>
              </div>
            </div>
          )}

          {/* Mode 3: CSV / File Upload */}
          {inputMode === "FILE" && (
            <div className="rounded-xl border-2 border-dashed border-border/80 p-5 text-center space-y-2 bg-muted/20">
              <Upload className="size-6 text-muted-foreground mx-auto" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Upload CSV or TXT candidate list
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  File should contain email addresses separated by commas or lines
                </p>
              </div>
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={!canInviteCandidates || inviteMutation.isPending}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!canInviteCandidates || inviteMutation.isPending}
                className="text-xs h-7 cursor-pointer mx-auto mt-2"
              >
                <FileSpreadsheet className="size-3.5 mr-1" />
                Choose File
              </Button>
            </div>
          )}

          {/* ── Staged Candidates Chips View ── */}
          {emails.length > 0 && (
            <div className="rounded-xl border border-border/70 bg-card p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Staged Candidates ({emails.length})</span>
                </span>
                <span className="text-muted-foreground font-mono text-[10px]">
                  payload.emails
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1.5 pr-1">
                {emails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      disabled={inviteMutation.isPending}
                      className="text-sky-600/70 hover:text-sky-900 dark:hover:text-sky-100 cursor-pointer"
                      title="Remove candidate"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Expiration Configuration */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3 text-primary" />
              <span>Token Expiry:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExpirationSetting("DEFAULT")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  expirationSetting === "DEFAULT"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => setExpirationSetting("3_DAYS")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  expirationSetting === "3_DAYS"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                3 Days
              </button>
              <button
                type="button"
                onClick={() => setExpirationSetting("7_DAYS")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  expirationSetting === "7_DAYS"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                7 Days
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={inviteMutation.isPending}
            className="text-xs h-8 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={
              !canInviteCandidates ||
              emails.length === 0 ||
              isArchivedOrCompleted ||
              inviteMutation.isPending
            }
            className={`text-xs h-8 gap-1.5 font-semibold text-white shadow-sm cursor-pointer ${
              canInviteCandidates && emails.length > 0 && !isArchivedOrCompleted
                ? "bg-sky-600 hover:bg-sky-700"
                : "bg-muted-foreground/50 cursor-not-allowed"
            }`}
            id="confirm-dispatch-invitations-btn"
          >
            {inviteMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Dispatching Invitations...</span>
              </>
            ) : !canInviteCandidates ? (
              <>
                <Lock className="size-3.5" />
                <span>Invite Restricted</span>
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                <span>Send Invitations ({emails.length})</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InviteCandidateDialog;
