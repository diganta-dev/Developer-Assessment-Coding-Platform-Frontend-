"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flag,
  HelpCircle,
  Info,
  Laptop,
  Maximize2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
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
import { useFlagAttempt, useGetCheatingRisk } from "@/hook/anti-cheating.hook";
import type { CheatingRiskLevel } from "@/types/anti-cheating.type";

interface CheatingRiskAuditDialogProps {
  attemptId: string;
  isOpen: boolean;
  onClose: () => void;
}

const RISK_LEVEL_CONFIG: Record<
  CheatingRiskLevel,
  { label: string; badgeClass: string; bgClass: string; textClass: string; icon: typeof ShieldCheck }
> = {
  LOW: {
    label: "Low Risk",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    icon: ShieldCheck,
  },
  MEDIUM: {
    label: "Moderate Risk",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    bgClass: "bg-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    icon: Shield,
  },
  HIGH: {
    label: "High Risk",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    bgClass: "bg-rose-500",
    textClass: "text-rose-600 dark:text-rose-400",
    icon: ShieldAlert,
  },
  CRITICAL: {
    label: "Critical Violation",
    badgeClass: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
    bgClass: "bg-red-600",
    textClass: "text-red-600 dark:text-red-400",
    icon: AlertTriangle,
  },
};

export function CheatingRiskAuditDialog({
  attemptId,
  isOpen,
  onClose,
}: CheatingRiskAuditDialogProps) {
  const queryClient = useQueryClient();

  const {
    data: riskData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCheatingRisk(attemptId, isOpen);

  const flagAttemptMutation = useFlagAttempt();

  // Flag attempt form states
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState<"MEDIUM" | "HIGH" | "CRITICAL">(
    "HIGH",
  );
  const [disqualify, setDisqualify] = useState(false);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const report = riskData?.data;
  const riskConfig =
    (report?.riskLevel && RISK_LEVEL_CONFIG[report.riskLevel]) ||
    RISK_LEVEL_CONFIG.LOW;
  const RiskIcon = riskConfig.icon;

  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim() || reason.trim().length < 3) {
      toast.add({
        title: "Validation Error",
        description: "Reason must be at least 3 characters long.",
        type: "error",
      });
      return;
    }

    flagAttemptMutation.mutate(
      {
        attemptId,
        payload: {
          reason: reason.trim(),
          severity,
          disqualify,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({
            queryKey: ["cheating-risk", attemptId],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-attempt-detailed-report", attemptId],
          });
          queryClient.invalidateQueries({
            queryKey: ["assessment-attempt", attemptId],
          });

          toast.add({
            title: disqualify ? "Attempt Disqualified" : "Attempt Flagged",
            description:
              res?.message ||
              "Proctor flag recorded successfully against candidate attempt.",
            type: "success",
          });

          setShowFlagForm(false);
          setReason("");
          setNotes("");
          setDisqualify(false);
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };
          toast.add({
            title: "Flagging Failed",
            description:
              apiErr?.data?.message ||
              apiErr?.message ||
              "Could not record proctor flag. Please try again.",
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheating-risk-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Shield className="size-5" />
            </div>
            <div>
              <h2
                id="cheating-risk-title"
                className="text-base font-bold text-foreground"
              >
                Proctoring & Anti-Cheat Telemetry Audit
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Attempt ID: {attemptId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-8 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="size-8 mx-auto animate-spin text-primary opacity-70" />
              <p className="text-xs font-semibold text-foreground">
                Analyzing Proctor Telemetry & Scoring Multi-Factor Risk...
              </p>
            </div>
          ) : isError || !report ? (
            <div className="py-12 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Failed to load cheating risk calculation
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {error instanceof Error
                  ? error.message
                  : "Verify that you have permission (Admin, Company Owner/Admin, Evaluator) to audit this attempt."}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="text-xs"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              {/* Executive Risk Score Card */}
              <Card className="border-border/70 overflow-hidden shadow-xs">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 rounded-xl bg-muted/60 text-foreground shrink-0 mt-0.5">
                        <RiskIcon className={`size-7 ${riskConfig.textClass}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskConfig.badgeClass}`}
                          >
                            {riskConfig.label}
                          </span>
                          {report.isFlagged && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                              <Flag className="size-3" />
                              FLAGGED
                            </span>
                          )}
                          {report.disqualified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                              <XCircle className="size-3" />
                              DISQUALIFIED
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-foreground">
                          Candidate: {report.candidateName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {report.candidateEmail} • Assessment:{" "}
                          <span className="font-semibold text-foreground">
                            {report.assessmentTitle}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Numeric Gauge */}
                    <div className="sm:border-l sm:border-border/60 sm:pl-6 text-right shrink-0">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Risk Score
                      </p>
                      <div className="flex items-baseline justify-end gap-1 mt-0.5">
                        <span
                          className={`text-3xl font-black ${riskConfig.textClass}`}
                        >
                          {report.riskScore}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          / 100
                        </span>
                      </div>
                      <div className="w-28 h-2 bg-muted rounded-full mt-1.5 overflow-hidden ml-auto">
                        <div
                          className={`h-full ${riskConfig.bgClass}`}
                          style={{
                            width: `${Math.min(100, report.riskScore)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recommendation strip */}
                  <div className="mt-4 pt-3.5 border-t border-border/40 flex items-start gap-2 bg-muted/30 p-3 rounded-xl">
                    <Info className="size-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      <span className="font-semibold text-primary">
                        System Recommendation:
                      </span>{" "}
                      {report.recommendation || "No action necessary."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Event Statistics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-border/60 bg-card text-center space-y-1">
                  <p className="text-xs text-muted-foreground">Total Events</p>
                  <p className="text-xl font-bold text-foreground">
                    {report.totalEvents}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border/60 bg-card text-center space-y-1">
                  <p className="text-xs text-muted-foreground">Tab Switches</p>
                  <p className="text-xl font-bold text-foreground">
                    {report.eventsByType?.TAB_SWITCH || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border/60 bg-card text-center space-y-1">
                  <p className="text-xs text-muted-foreground">Fullscreen Exits</p>
                  <p className="text-xl font-bold text-foreground">
                    {report.eventsByType?.FULLSCREEN_EXIT || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-border/60 bg-card text-center space-y-1">
                  <p className="text-xs text-muted-foreground">Copy / Paste</p>
                  <p className="text-xl font-bold text-foreground">
                    {(report.eventsByType?.COPY || 0) +
                      (report.eventsByType?.PASTE || 0)}
                  </p>
                </div>
              </div>

              {/* Policy Settings Enforcement */}
              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground font-medium">
                  Assessment Policy Checks:
                </span>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    {report.policySettings.preventCopyPaste ? (
                      <CheckCircle2 className="size-3 text-emerald-500" />
                    ) : (
                      <XCircle className="size-3 text-muted-foreground" />
                    )}
                    Prevent Copy/Paste:{" "}
                    {report.policySettings.preventCopyPaste ? "On" : "Off"}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold">
                    {report.policySettings.requireFullscreen ? (
                      <CheckCircle2 className="size-3 text-emerald-500" />
                    ) : (
                      <XCircle className="size-3 text-muted-foreground" />
                    )}
                    Require Fullscreen:{" "}
                    {report.policySettings.requireFullscreen ? "On" : "Off"}
                  </span>
                </div>
              </div>

              {/* Event Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Proctoring Event Timeline ({report.timeline?.length || 0})
                </h4>

                {report.timeline?.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground space-y-1 border border-dashed border-border/60 rounded-xl">
                    <ShieldCheck className="size-6 mx-auto text-emerald-500 opacity-80" />
                    <p className="text-xs font-medium text-foreground">
                      Clean Record
                    </p>
                    <p className="text-[11px]">
                      No anomalous activities recorded during this exam session.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {report.timeline.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-muted/10 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted font-mono">
                            {event.type}
                          </span>
                          <span className="text-muted-foreground">
                            {event.metadata?.reason ||
                              event.metadata?.details ||
                              "Anomaly detected"}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {new Date(event.occurredAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual Flag Action Panel */}
              <div className="border-t border-border/60 pt-4">
                {!showFlagForm ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        Formal Proctor Review
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Flag this attempt for evaluation committee or disqualify candidate immediately.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowFlagForm(true)}
                      className="text-xs font-semibold gap-1.5"
                    >
                      <Flag className="size-3.5" />
                      Flag or Disqualify
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleFlagSubmit}
                    className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-destructive flex items-center gap-1.5">
                        <Flag className="size-3.5" />
                        Flag / Disqualify Attempt Form
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowFlagForm(false)}
                        className="text-muted-foreground hover:text-foreground text-xs"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="flag-reason" className="text-xs font-semibold">
                        Reason <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="flag-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Unexplained tab switches during critical coding test"
                        className="h-8 text-xs bg-background"
                        required
                        minLength={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="flag-severity" className="text-xs font-semibold">
                          Severity
                        </Label>
                        <select
                          id="flag-severity"
                          value={severity}
                          onChange={(e) =>
                            setSeverity(
                              e.target.value as "MEDIUM" | "HIGH" | "CRITICAL",
                            )
                          }
                          className="w-full h-8 px-2 rounded-lg border border-border bg-background text-xs"
                        >
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="flag-disqualify"
                          checked={disqualify}
                          onChange={(e) => setDisqualify(e.target.checked)}
                          className="size-4 rounded text-destructive focus:ring-destructive"
                        />
                        <Label
                          htmlFor="flag-disqualify"
                          className="text-xs font-semibold text-destructive cursor-pointer"
                        >
                          Disqualify Immediately (Terminates Attempt)
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="flag-notes" className="text-xs font-semibold">
                        Additional Notes (Optional)
                      </Label>
                      <Textarea
                        id="flag-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Proctor notes and review references..."
                        className="text-xs min-h-[60px] bg-background"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFlagForm(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        disabled={flagAttemptMutation.isPending}
                        className="text-xs font-semibold gap-1.5"
                      >
                        {flagAttemptMutation.isPending ? (
                          <>
                            <RefreshCw className="size-3.5 animate-spin" />
                            Recording Flag...
                          </>
                        ) : (
                          <>
                            <Flag className="size-3.5" />
                            Confirm Flag & Record
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheatingRiskAuditDialog;
