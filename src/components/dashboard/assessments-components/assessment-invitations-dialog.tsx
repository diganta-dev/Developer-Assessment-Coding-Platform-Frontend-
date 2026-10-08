"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck2,
  FileText,
  Mail,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useGetAssessmentInvitation } from "@/hook/assessment.hook";
import type {
  IAssessment,
  IAssessmentInvitation,
} from "@/types/assessment.type";
import { useGetMe } from "@/hook";
import { isUserAuthorized } from "@/utils";
import { CompanyMemberRole, UserRole } from "@/types";
import { AttemptDetailsDialog } from "./attempt-details-dialog";
import { DetailedAssessmentReportDialog } from "./detailed-assessment-report-dialog";
import { PublishResultsDialog } from "./publish-results-dialog";
import { AssessmentAttemptsDialog } from "./assessment-attempts-dialog";

interface AssessmentInvitationsDialogProps {
  assessment: IAssessment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteMore?: (assessment: IAssessment) => void;
}

type InvitationStatusFilter =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "EXPIRED"
  | "DECLINED";

function formatDate(dateStr?: string | null, fallback = "N/A"): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return fallback;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fallback;
  }
}

function getInitials(name?: string | null, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return "CN";
}

export function AssessmentInvitationsDialog({
  assessment,
  open,
  onOpenChange,
  onInviteMore,
}: AssessmentInvitationsDialogProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<InvitationStatusFilter>("ALL");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(
    null,
  );
  const [attemptDetailsOpen, setAttemptDetailsOpen] = useState(false);
  const [detailedReportAttemptId, setDetailedReportAttemptId] = useState<
    string | null
  >(null);
  const [detailedReportOpen, setDetailedReportOpen] = useState(false);
  const [publishResultsOpen, setPublishResultsOpen] = useState(false);
  const [attemptsOpen, setAttemptsOpen] = useState(false);

  const { data: meData } = useGetMe();
  const currentUser = meData?.data;
  const canPublishResults = isUserAuthorized(currentUser, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    CompanyMemberRole.COMPANY_OWNER,
    CompanyMemberRole.COMPANY_ADMIN,
    CompanyMemberRole.ASSESSMENT_CREATOR,
  ]);

  const assessmentId = assessment?.id || "";

  // Hook to fetch candidate invitations
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useGetAssessmentInvitation(assessmentId, open);

  // Normalize API response safely
  const invitations: IAssessmentInvitation[] = useMemo(() => {
    if (!data) return [];
    const raw = (data as { data?: unknown })?.data ?? data;
    if (Array.isArray(raw)) return raw as IAssessmentInvitation[];
    return [];
  }, [data]);

  // Status statistics
  const stats = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let expired = 0;
    let declined = 0;

    for (const inv of invitations) {
      const status = inv.status?.toUpperCase();
      if (status === "ACCEPTED") accepted++;
      else if (status === "EXPIRED") expired++;
      else if (status === "DECLINED") declined++;
      else pending++;
    }

    return {
      total: invitations.length,
      pending,
      accepted,
      expired,
      declined,
    };
  }, [invitations]);

  // Client-side filtered list
  const filteredInvitations = useMemo(() => {
    return invitations.filter((item) => {
      // Status filter
      if (statusFilter !== "ALL") {
        const itemStatus = (item.status || "PENDING").toUpperCase();
        if (itemStatus !== statusFilter) return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      const name = item.candidate?.name?.toLowerCase() || "";
      const email = (
        item.candidate?.email ||
        item.candidateEmail ||
        item.email ||
        ""
      ).toLowerCase();
      const token = item.token?.toLowerCase() || "";

      return (
        name.includes(term) || email.includes(term) || token.includes(term)
      );
    });
  }, [invitations, statusFilter, searchTerm]);

  // Copy invitation URL helper
  const handleCopyInviteUrl = (token: string, candidateEmail: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/assessment/invitation?token=${token}`;

    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    toast.add({
      title: "Invitation Link Copied",
      description: `Assessment link for ${candidateEmail} copied to clipboard.`,
      type: "success",
    });

    setTimeout(() => {
      setCopiedToken((prev) => (prev === token ? null : prev));
    }, 2500);
  };

  const handleRefresh = async () => {
    await refetch();
    queryClient.invalidateQueries({
      queryKey: ["assessment-invitation", assessmentId],
    });
    toast.add({
      title: "Invitations Refreshed",
      description: "Candidate invitation records up to date.",
      type: "info",
    });
  };

  if (!assessment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-[96vw] h-[92vh] max-h-[94vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
        {/* ── Dialog Header ── */}
        <div className="p-5 border-b border-border/60 bg-muted/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Users className="size-4" />
                </div>
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                  Candidate Invitations
                </DialogTitle>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground border border-border/60">
                  {stats.total}{" "}
                  {stats.total === 1 ? "invitation" : "invitations"}
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {assessment.title}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefetching || isLoading}
                className="h-8 text-xs gap-1.5 font-medium cursor-pointer"
                title="Refresh invitations"
              >
                <RefreshCw
                  className={`size-3.5 ${isRefetching
                      ? "animate-spin text-primary"
                      : "text-muted-foreground"
                    }`}
                />
                <span>Refresh</span>
              </Button>

              {canPublishResults && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPublishResultsOpen(true)}
                  className="h-8 text-xs gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                  title="Publish results to all candidates who took this assessment"
                >
                  <Award className="size-3.5" />
                  <span>Publish Results</span>
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setAttemptsOpen(true)}
                className="h-8 text-xs gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
                title="View Candidate Test Attempts"
                id="invitations-to-attempts-btn"
              >
                <FileCheck2 className="size-3.5" />
                <span>Attempts</span>
              </Button>

              {onInviteMore && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onInviteMore(assessment);
                  }}
                  className="h-8 text-xs gap-1.5 font-medium cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <UserPlus className="size-3.5" />
                  <span>Invite Candidates</span>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Total Sent
                </p>
                <p className="text-base font-bold text-foreground mt-0.5">
                  {stats.total}
                </p>
              </div>
              <Mail className="size-4 text-muted-foreground/60" />
            </div>

            <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  Pending
                </p>
                <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {stats.pending}
                </p>
              </div>
              <Clock className="size-4 text-amber-500/60" />
            </div>

            <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Accepted
                </p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {stats.accepted}
                </p>
              </div>
              <CheckCircle2 className="size-4 text-emerald-500/60" />
            </div>

            <div className="p-2.5 rounded-lg bg-background border border-border/60 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Expired
                </p>
                <p className="text-base font-bold text-muted-foreground mt-0.5">
                  {stats.expired}
                </p>
              </div>
              <XCircle className="size-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>

        {/* ── Toolbar: Search & Filter ── */}
        <div className="p-3 sm:px-5 border-b border-border/40 bg-background flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 pr-7 text-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
            {(
              [
                { key: "ALL", label: "All" },
                { key: "PENDING", label: "Pending" },
                { key: "ACCEPTED", label: "Accepted" },
                { key: "EXPIRED", label: "Expired" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${statusFilter === key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content Area: Candidate Table ── */}
        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[50vh] p-0 [scrollbar-width:thin]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-2.5 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Failed to load candidate invitations
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {(error as Error)?.message ||
                  "An error occurred while fetching the invitation records. Please try again."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs mt-2"
              >
                Retry
              </Button>
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-muted/60 text-muted-foreground">
                <Mail className="size-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {searchTerm || statusFilter !== "ALL"
                  ? "No matching invitations found"
                  : "No candidates invited yet"}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchTerm || statusFilter !== "ALL"
                  ? "Try adjusting your search query or switching the status filter."
                  : "Send your first set of candidate invitations to allow test takers to access this assessment."}
              </p>
              {onInviteMore && !searchTerm && statusFilter === "ALL" && (
                <Button
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    onInviteMore(assessment);
                  }}
                  className="text-xs gap-1.5 mt-2"
                >
                  <UserPlus className="size-3.5" />
                  Invite Candidates Now
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="text-xs font-semibold">
                    Candidate
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Invited On
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Expires
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold">
                    Link & Token
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((invitation) => {
                  const candidateName = invitation.candidate?.name;
                  const candidateEmail =
                    invitation.candidate?.email ||
                    invitation.candidateEmail ||
                    invitation.email ||
                    "Unknown Candidate";
                  const avatarUrl = invitation.candidate?.profilePictureUrl;
                  const status = (invitation.status || "PENDING").toUpperCase();
                  const isCopied = copiedToken === invitation.token;

                  return (
                    <TableRow key={invitation.id} className="hover:bg-muted/30">
                      {/* Candidate Avatar & Info */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 rounded-full border border-border/60">
                            {avatarUrl && (
                              <AvatarImage
                                src={avatarUrl}
                                alt={candidateEmail}
                              />
                            )}
                            <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                              {getInitials(candidateName, candidateEmail)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-semibold text-foreground leading-tight">
                                {candidateName || candidateEmail.split("@")[0]}
                              </p>
                              {invitation.candidate
                                ?.assessmentAttempts?.[0] && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const attId =
                                        invitation.candidate
                                          ?.assessmentAttempts?.[0]?.id;
                                      if (attId) {
                                        setSelectedAttemptId(attId);
                                        setAttemptDetailsOpen(true);
                                      }
                                    }}
                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-sm border hover:opacity-80 transition-opacity cursor-pointer ${invitation.candidate.assessmentAttempts[0]
                                        .status === "COMPLETED"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : invitation.candidate
                                          .assessmentAttempts[0].status ===
                                          "IN_PROGRESS"
                                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                          : "bg-muted text-muted-foreground border-border"
                                      }`}
                                    title="Click to view candidate attempt details & answers"
                                  >
                                    {invitation.candidate.assessmentAttempts[0]
                                      .status === "COMPLETED"
                                      ? `Score: ${invitation.candidate
                                        .assessmentAttempts[0].percentage ??
                                      invitation.candidate
                                        .assessmentAttempts[0]
                                        .obtainedMarks ??
                                      0
                                      }%`
                                      : invitation.candidate.assessmentAttempts[0]
                                        .status}
                                  </button>
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-tight">
                              {candidateEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        {status === "ACCEPTED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            <CheckCircle2 className="size-3" />
                            Accepted
                          </span>
                        ) : status === "EXPIRED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-muted text-muted-foreground border-border/80">
                            <Clock className="size-3" />
                            Expired
                          </span>
                        ) : status === "DECLINED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-destructive/10 text-destructive border-destructive/20">
                            <XCircle className="size-3" />
                            Declined
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                            <Clock className="size-3" />
                            Pending
                          </span>
                        )}
                      </TableCell>

                      {/* Invited Date */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(invitation.invitedAt)}
                        </span>
                      </TableCell>

                      {/* Expiry Date */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(invitation.expiresAt, "No expiration")}
                        </span>
                      </TableCell>

                      {/* Actions: Copy Link / Token / Detailed Report */}
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          {invitation.candidate?.assessmentAttempts?.[0] && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const attId =
                                  invitation.candidate
                                    ?.assessmentAttempts?.[0]?.id;
                                if (attId) {
                                  setDetailedReportAttemptId(attId);
                                  setDetailedReportOpen(true);
                                }
                              }}
                              className="text-xs h-7 px-2 gap-1 font-semibold text-primary border-primary/30 hover:bg-primary/10 transition-all cursor-pointer"
                              title="View Detailed Assessment & Proctoring Report"
                            >
                              <FileText className="size-3 text-primary" />
                              <span>Report</span>
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCopyInviteUrl(
                                invitation.token,
                                candidateEmail,
                              )
                            }
                            className="text-xs h-7 px-2 gap-1 font-medium hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                            title="Copy Candidate Assessment Link"
                          >
                            {isCopied ? (
                              <>
                                <Check className="size-3 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">
                                  Copied!
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3 text-muted-foreground" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* ── Dialog Footer ── */}
        <div className="p-3 px-5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {filteredInvitations.length} of {invitations.length}{" "}
            candidates
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-7 px-3"
          >
            Close
          </Button>
        </div>
      </DialogContent>

      {/* ── Attempt Details Dialog for Company Staff ── */}
      <AttemptDetailsDialog
        attemptId={selectedAttemptId}
        open={attemptDetailsOpen}
        onOpenChange={setAttemptDetailsOpen}
        isCandidateView={false}
      />

      {/* ── Detailed Assessment Report Dialog (Admin / Company Staff) ── */}
      <DetailedAssessmentReportDialog
        attemptId={detailedReportAttemptId}
        open={detailedReportOpen}
        onOpenChange={setDetailedReportOpen}
      />

      {/* ── Publish Results Dialog ── */}
      <PublishResultsDialog
        assessment={assessment}
        open={publishResultsOpen}
        onOpenChange={setPublishResultsOpen}
        onSuccess={() => refetch()}
      />

      {/* ── Candidate Attempts Dialog ── */}
      <AssessmentAttemptsDialog
        assessment={assessment}
        open={attemptsOpen}
        onOpenChange={setAttemptsOpen}
      />
    </Dialog>
  );
}

export default AssessmentInvitationsDialog;
