"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Flag,
  ListChecks,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
  Trophy,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  useDetectCopyPaste,
  useDetectFullscreenExit,
  useDetectMultipleTabs,
  useDetectTabSwitch,
} from "@/hook/anti-cheating.hook";
import {
  useCreateSubmissionFromAttempt,
  useFinalizeAndSubmitResult,
  useGetAttemptDetails,
} from "@/hook/assessment.hook";
import type {
  IAttemptSubmissionItem,
  ICreateSubmissionPayload,
  ISanitizedAssessmentProblem,
} from "@/types/assessment.type";

const DEFAULT_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "cpp",
  "java",
  "go",
];

const LANGUAGE_TEMPLATES: Record<string, string> = {
  javascript: `// Write your JavaScript solution below\nfunction solution() {\n  // Your code here\n}\n`,
  typescript: `// Write your TypeScript solution below\nfunction solution(): void {\n  // Your code here\n}\n`,
  python: `# Write your Python solution below\ndef solution():\n    # Your code here\n    pass\n`,
  cpp: `// Write your C++ solution below\n#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}\n`,
  java: `// Write your Java solution below\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n`,
  go: `// Write your Go solution below\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n}\n`,
};

const EMPTY_PROBLEMS: ISanitizedAssessmentProblem[] = [];
const EMPTY_SUBMISSIONS: IAttemptSubmissionItem[] = [];

/**
 * Main Dedicated Candidate Examination Arena
 * Renders a full-viewport, distraction-free examination workspace.
 */
export function CandidateExaminationArena() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const assessmentId = searchParams.get("assessmentId");

  // Missing or Invalid parameters guard
  if (!attemptId) {
    return <MissingAttemptSessionView />;
  }

  return (
    <ActiveExaminationSession
      attemptId={attemptId}
      assessmentId={assessmentId}
    />
  );
}

/**
 * Screen displayed when candidate navigates to examination without attemptId
 */
function MissingAttemptSessionView() {
  return (
    <div className="h-screen w-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full p-8 text-center space-y-5 border-border/80 shadow-2xl bg-card">
        <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20 shadow-inner">
          <ShieldAlert className="size-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            No Active Examination Session
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The examination environment requires an authorized assessment
            attempt ID. You cannot enter this arena without selecting an active
            test.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            href="/candidate/invitations"
            className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-colors"
          >
            <ListChecks className="mr-1.5 size-3.5" />
            My Invitations & Tests
          </Link>
          <Link
            href="/candidate"
            className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}

/**
 * Active Examination Workspace & Anti-Cheat Session
 */
function ActiveExaminationSession({
  attemptId,
  assessmentId: _assessmentId,
}: {
  attemptId: string;
  assessmentId: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } =
    useGetAttemptDetails(attemptId);

  const createSubmissionMutation = useCreateSubmissionFromAttempt();
  const finalizeMutation = useFinalizeAndSubmitResult();

  const attemptData = data?.data;
  const attempt = attemptData?.attempt;
  const assessment = attempt?.assessment || attemptData?.assessment;

  const problems: ISanitizedAssessmentProblem[] = useMemo(() => {
    return assessment?.problems ?? EMPTY_PROBLEMS;
  }, [assessment?.problems]);

  const submissions: IAttemptSubmissionItem[] = useMemo(() => {
    return attempt?.submissions ?? EMPTY_SUBMISSIONS;
  }, [attempt?.submissions]);

  const submissionsMap = useMemo(() => {
    const map = new Map<string, IAttemptSubmissionItem>();
    for (const sub of submissions) {
      if (sub.problemId) {
        map.set(sub.problemId, sub);
      }
    }
    return map;
  }, [submissions]);

  const isAttemptActive = attempt?.status === "IN_PROGRESS";

  // Flagged questions tracking
  const [flaggedProblemIds, setFlaggedProblemIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleFlagCurrent = useCallback((problemId: string) => {
    setFlaggedProblemIds((prev) => {
      const next = new Set(prev);
      if (next.has(problemId)) {
        next.delete(problemId);
        toast.add({
          title: "Question Unflagged",
          description: "Removed flag from question.",
          type: "info",
        });
      } else {
        next.add(problemId);
        toast.add({
          title: "Question Flagged for Review",
          description: "Marked question so you can return to it later.",
          type: "info",
        });
      }
      return next;
    });
  }, []);

  // Current problem index
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  // Form states per problem
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [language, setLanguage] = useState("javascript");

  // Save status state
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved",
  );

  // Dialog states
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [timeExpiredDialogOpen, setTimeExpiredDialogOpen] = useState(false);

  const currentProblemWrap = problems[currentProblemIndex];
  const currentProblem = currentProblemWrap?.problem;
  const currentProblemId = currentProblem?.id;

  // Sync draft answer on problem change
  useEffect(() => {
    if (!currentProblemId || !currentProblem) return;

    const existingSub = submissionsMap.get(currentProblemId);

    if (currentProblem.type === "MCQ") {
      setSelectedOptionId(existingSub?.selectedOptionId || "");
    } else if (currentProblem.type === "WRITTEN") {
      setAnswerText(existingSub?.answerText || "");
    } else if (currentProblem.type === "CODING") {
      const supportedLangs =
        currentProblem.codingQuestion?.supportedLanguages &&
        currentProblem.codingQuestion.supportedLanguages.length > 0
          ? currentProblem.codingQuestion.supportedLanguages
          : DEFAULT_LANGUAGES;

      const initialLang =
        existingSub?.language ||
        (supportedLangs.some((l) => l.toLowerCase() === "typescript")
          ? "typescript"
          : supportedLangs[0]?.toLowerCase()) ||
        "javascript";

      setLanguage(initialLang);
      setSourceCode(
        existingSub?.sourceCode ||
          LANGUAGE_TEMPLATES[initialLang.toLowerCase()] ||
          `// Solution for ${currentProblem.title}\n`,
      );
    }
    setSaveStatus("saved");
  }, [currentProblemId, currentProblem, submissionsMap]);

  // Word count calculation
  const writtenWordCount = useMemo(() => {
    if (!answerText.trim()) return 0;
    return answerText.trim().split(/\s+/).filter(Boolean).length;
  }, [answerText]);

  const wordLimit =
    (currentProblem?.writtenQuestion as { wordLimit?: number | null })
      ?.wordLimit ?? null;
  const isWordLimitExceeded = Boolean(
    wordLimit && writtenWordCount > wordLimit,
  );

  const supportedLanguages = useMemo(() => {
    if (
      currentProblem?.codingQuestion?.supportedLanguages &&
      currentProblem.codingQuestion.supportedLanguages.length > 0
    ) {
      return currentProblem.codingQuestion.supportedLanguages;
    }
    return DEFAULT_LANGUAGES;
  }, [currentProblem]);

  const canSubmitCurrent = useMemo(() => {
    if (!currentProblem) return false;
    if (currentProblem.type === "MCQ") {
      return Boolean(selectedOptionId && selectedOptionId.trim() !== "");
    }
    if (currentProblem.type === "WRITTEN") {
      return Boolean(answerText.trim().length > 0) && !isWordLimitExceeded;
    }
    if (currentProblem.type === "CODING") {
      return Boolean(
        sourceCode.trim().length > 0 && language.trim().length > 0,
      );
    }
    return false;
  }, [
    currentProblem,
    selectedOptionId,
    answerText,
    isWordLimitExceeded,
    sourceCode,
    language,
  ]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setSaveStatus("unsaved");
    const prevTemplate = LANGUAGE_TEMPLATES[language.toLowerCase()];
    if (!sourceCode.trim() || sourceCode.trim() === prevTemplate?.trim()) {
      setSourceCode(
        LANGUAGE_TEMPLATES[newLang.toLowerCase()] ||
          `// Solution in ${newLang}\n`,
      );
    }
  };

  const handleResetTemplate = () => {
    if (currentProblem?.type === "CODING") {
      setSourceCode(
        LANGUAGE_TEMPLATES[language.toLowerCase()] ||
          `// Solution for ${currentProblem.title}\n`,
      );
      setSaveStatus("unsaved");
      toast.add({
        title: "Template Reset",
        description: `Reset code boilerplate to default for ${language}.`,
        type: "info",
      });
    }
  };

  const handleSaveSubmission = useCallback(
    (shouldNavigateNext = false) => {
      if (!attemptId || !currentProblem) return;

      if (!canSubmitCurrent) {
        toast.add({
          title: "Incomplete Submission",
          description: "Please provide a valid answer before saving.",
          type: "error",
        });
        return;
      }

      setSaveStatus("saving");

      const payload: ICreateSubmissionPayload = {
        attemptId,
        problemId: currentProblem.id,
        selectedOptionId:
          currentProblem.type === "MCQ" ? selectedOptionId : null,
        answerText:
          currentProblem.type === "WRITTEN" ? answerText.trim() : null,
        sourceCode: currentProblem.type === "CODING" ? sourceCode : null,
        language:
          currentProblem.type === "CODING"
            ? language.trim().toLowerCase()
            : null,
      };

      createSubmissionMutation.mutate(
        {
          attemptId,
          payload,
        },
        {
          onSuccess: () => {
            setSaveStatus("saved");
            queryClient.invalidateQueries({
              queryKey: ["assessment-attempt", attemptId],
            });
            queryClient.invalidateQueries({
              queryKey: ["candidate-my-attempts"],
            });
            queryClient.invalidateQueries({
              queryKey: ["my-attempts"],
            });

            toast.add({
              title: "Solution Saved",
              description: `Draft for problem #${currentProblemWrap?.questionOrder || currentProblemIndex + 1} has been recorded.`,
              type: "success",
            });

            if (shouldNavigateNext) {
              if (currentProblemIndex < problems.length - 1) {
                setCurrentProblemIndex((p) => p + 1);
              } else {
                toast.add({
                  title: "All Questions Reached",
                  description:
                    "You are on the last question. When ready, click 'Finalize & Submit' to submit your exam.",
                  type: "info",
                });
              }
            }
          },
          onError: (err: unknown) => {
            setSaveStatus("unsaved");
            const apiErr = err as {
              data?: { message?: string };
              message?: string;
            };
            toast.add({
              title: "Save Failed",
              description:
                apiErr?.data?.message ||
                apiErr?.message ||
                "Could not record solution. Please check your network connection.",
              type: "error",
            });
          },
        },
      );
    },
    [
      attemptId,
      currentProblem,
      canSubmitCurrent,
      selectedOptionId,
      answerText,
      sourceCode,
      language,
      createSubmissionMutation,
      queryClient,
      currentProblemWrap?.questionOrder,
      currentProblemIndex,
      problems.length,
    ],
  );

  // ── Authoritative Server Countdown Timer ──
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!attempt?.expiresAt) {
      if (typeof attemptData?.remainingSeconds === "number") {
        setSecondsRemaining(attemptData.remainingSeconds);
      }
      return;
    }

    const targetTime = new Date(attempt.expiresAt).getTime();

    const calculateRemaining = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((targetTime - now) / 1000));
      return diffSecs;
    };

    setSecondsRemaining(calculateRemaining());

    const intervalId = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(intervalId);
        if (isAttemptActive) {
          setTimeExpiredDialogOpen(true);
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [attempt?.expiresAt, attemptData?.remainingSeconds, isAttemptActive]);

  // ── Anti-Cheating Telemetry Live Hooks (Module 06) ──
  const detectTabSwitchMutation = useDetectTabSwitch();
  const detectFullscreenExitMutation = useDetectFullscreenExit();
  const detectCopyPasteMutation = useDetectCopyPaste();
  const detectMultipleTabsMutation = useDetectMultipleTabs();

  const detectTabSwitchRef = useRef(detectTabSwitchMutation.mutate);
  detectTabSwitchRef.current = detectTabSwitchMutation.mutate;

  const detectFullscreenExitRef = useRef(detectFullscreenExitMutation.mutate);
  detectFullscreenExitRef.current = detectFullscreenExitMutation.mutate;

  const detectCopyPasteRef = useRef(detectCopyPasteMutation.mutate);
  detectCopyPasteRef.current = detectCopyPasteMutation.mutate;

  const detectMultipleTabsRef = useRef(detectMultipleTabsMutation.mutate);
  detectMultipleTabsRef.current = detectMultipleTabsMutation.mutate;

  const lastTabSwitchReportRef = useRef<number>(0);
  const lastFullscreenExitReportRef = useRef<number>(0);
  const lastCopyPasteReportRef = useRef<number>(0);
  const lastMultipleTabsReportRef = useRef<number>(0);

  const tabSessionIdRef = useRef<string>("exam_tab_session");
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.name) {
        window.name = `exam_tab_${Math.random().toString(36).slice(2)}`;
      }
      tabSessionIdRef.current = window.name;
    }
  }, []);

  const settings = assessment?.settings as
    | {
        requireFullscreen?: boolean;
        preventCopyPaste?: boolean;
        autoSubmitOnExpiry?: boolean;
      }
    | undefined;

  const isFullscreenRequired = Boolean(settings?.requireFullscreen);
  const isCopyPastePrevented = Boolean(settings?.preventCopyPaste);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);

  // 1. Fullscreen telemetry
  useEffect(() => {
    if (!isAttemptActive || !attemptId) return;

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);

      if (isFullscreenRequired) {
        if (!active) {
          setFullscreenExitCount((c) => c + 1);
          setShowFullscreenModal(true);

          const now = Date.now();
          if (now - lastFullscreenExitReportRef.current > 5000) {
            lastFullscreenExitReportRef.current = now;
            detectFullscreenExitRef.current({
              attemptId,
              payload: {
                durationOutsideSeconds: 0,
                screenResolution:
                  typeof window !== "undefined"
                    ? `${window.screen.width}x${window.screen.height}`
                    : undefined,
                reason: "Candidate departed fullscreen exam window",
                clientTimestamp: new Date().toISOString(),
              },
            });

            toast.add({
              title: "Fullscreen Required",
              description:
                "This assessment enforces fullscreen mode. Please return to fullscreen immediately.",
              type: "error",
            });
          }
        } else {
          setShowFullscreenModal(false);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isAttemptActive, isFullscreenRequired, attemptId]);

  // 2. Tab switch telemetry
  useEffect(() => {
    if (!isAttemptActive || !attemptId) return;

    let hiddenAt: number | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else if (document.visibilityState === "visible") {
        const durationSeconds = hiddenAt
          ? Math.max(0, Math.round((Date.now() - hiddenAt) / 1000))
          : 0;
        hiddenAt = null;

        setTabSwitchCount((c) => c + 1);

        const now = Date.now();
        if (now - lastTabSwitchReportRef.current > 3000) {
          lastTabSwitchReportRef.current = now;
          detectTabSwitchRef.current({
            attemptId,
            payload: {
              durationSeconds,
              count: 1,
              clientTimestamp: new Date().toISOString(),
              userAgent:
                typeof navigator !== "undefined"
                  ? navigator.userAgent
                  : undefined,
            },
          });

          toast.add({
            title: "Security Telemetry Notice",
            description:
              "Tab switch recorded in the authoritative proctoring audit log.",
            type: "info",
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAttemptActive, attemptId]);

  // 3. Copy / Paste blocker
  useEffect(() => {
    if (!isAttemptActive || !isCopyPastePrevented || !attemptId) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastCopyPasteReportRef.current > 2000) {
        lastCopyPasteReportRef.current = now;
        detectCopyPasteRef.current({
          attemptId,
          payload: {
            operation: "COPY",
            targetElement: (e.target as HTMLElement)?.tagName || undefined,
            clientTimestamp: new Date().toISOString(),
          },
        });
        toast.add({
          title: "Action Restricted",
          description: "Copying text is restricted during this assessment.",
          type: "error",
        });
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastCopyPasteReportRef.current > 2000) {
        lastCopyPasteReportRef.current = now;
        detectCopyPasteRef.current({
          attemptId,
          payload: {
            operation: "PASTE",
            targetElement: (e.target as HTMLElement)?.tagName || undefined,
            clientTimestamp: new Date().toISOString(),
          },
        });
        toast.add({
          title: "Action Restricted",
          description: "Pasting content is restricted during this assessment.",
          type: "error",
        });
      }
    };

    window.addEventListener("copy", handleCopy);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("paste", handlePaste);
    };
  }, [isAttemptActive, isCopyPastePrevented, attemptId]);

  // 4. Multi-tab detector
  useEffect(() => {
    if (
      !isAttemptActive ||
      !attemptId ||
      typeof window === "undefined" ||
      !("BroadcastChannel" in window)
    )
      return;

    const myTabId = tabSessionIdRef.current;
    const channel = new BroadcastChannel(`exam-channel-${attemptId}`);

    const reportDuplicate = () => {
      const now = Date.now();
      if (now - lastMultipleTabsReportRef.current > 30000) {
        lastMultipleTabsReportRef.current = now;
        detectMultipleTabsRef.current({
          attemptId,
          payload: {
            activeTabCount: 2,
            details: "Concurrent exam tab detected",
            clientTimestamp: new Date().toISOString(),
          },
        });
        toast.add({
          title: "Multiple Tabs Detected",
          description:
            "Multiple tabs open for this exam. Please keep only one tab open.",
          type: "warning",
        });
      }
    };

    const announceTimer = setTimeout(() => {
      channel.postMessage({ type: "TAB_EXAM_PING", tabId: myTabId });
    }, 500);

    channel.onmessage = (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "TAB_EXAM_PING" && msg.tabId !== myTabId) {
        channel.postMessage({ type: "TAB_EXAM_ACK", tabId: myTabId });
        reportDuplicate();
      }
      if (msg.type === "TAB_EXAM_ACK" && msg.tabId !== myTabId) {
        reportDuplicate();
      }
    };

    return () => {
      clearTimeout(announceTimer);
      channel.close();
    };
  }, [isAttemptActive, attemptId]);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
          setShowFullscreenModal(false);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch {
      toast.add({
        title: "Fullscreen Error",
        description:
          "Could not toggle fullscreen mode. Please check browser permissions.",
        type: "error",
      });
    }
  };

  // ── Final Submission Handler ──
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleFinalSubmitConfirm = () => {
    if (!attemptId) return;
    setSubmissionError(null);

    finalizeMutation.mutate(
      { attemptId },
      {
        onSuccess: () => {
          // Exit fullscreen if active
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }

          queryClient.invalidateQueries({
            queryKey: ["assessment-attempt", attemptId],
          });
          queryClient.invalidateQueries({
            queryKey: ["candidate-my-attempts"],
          });
          queryClient.invalidateQueries({
            queryKey: ["my-attempts"],
          });
          queryClient.invalidateQueries({
            queryKey: ["candidate-my-results"],
          });

          toast.add({
            title: "Examination Finalized!",
            description:
              "Your answers have been submitted successfully. Evaluation underway.",
            type: "success",
          });

          setSubmitDialogOpen(false);
          // Redirect to Candidate Results Dashboard
          router.push("/candidate/results");
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };
          const msg =
            apiErr?.data?.message ||
            apiErr?.message ||
            "Failed to submit assessment. Please check your network and try again.";
          setSubmissionError(msg);
          toast.add({
            title: "Submission Error",
            description: msg,
            type: "error",
          });
        },
      },
    );
  };

  // ── Auto-submit on Expiry ──
  const handleAutoSubmitOnExpiry = () => {
    if (!attemptId) return;

    finalizeMutation.mutate(
      { attemptId },
      {
        onSuccess: () => {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
          queryClient.invalidateQueries({
            queryKey: ["candidate-my-attempts"],
          });
          queryClient.invalidateQueries({
            queryKey: ["candidate-my-results"],
          });
          toast.add({
            title: "Time Limit Concluded",
            description: "Your assessment answers have been finalized.",
            type: "info",
          });
          router.push("/candidate/results");
        },
        onError: () => {
          router.push("/candidate/results");
        },
      },
    );
  };

  // ── Attempt State Checks (Completed or Expired screens) ──
  if (attempt?.status === "SUBMITTED" || attempt?.status === "EVALUATED") {
    return (
      <AttemptCompletedView
        attempt={attempt}
        assessmentTitle={assessment?.title}
      />
    );
  }

  if (attempt?.status === "EXPIRED") {
    return (
      <AttemptExpiredView
        attempt={attempt}
        assessmentTitle={assessment?.title}
      />
    );
  }

  // ── Loading Skeleton ──
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col bg-background">
        {/* Top bar skeleton */}
        <div className="h-14 border-b border-border/60 px-6 flex items-center justify-between">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-44" />
        </div>
        {/* Question chips skeleton */}
        <div className="h-12 border-b border-border/40 px-6 flex items-center gap-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
        {/* Workspace body skeleton */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 p-6 gap-6">
          <Skeleton className="h-full w-full rounded-xl" />
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error View ──
  if (isError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-destructive/20 shadow-2xl">
          <div className="size-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <XCircle className="size-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Failed to Load Examination
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {(error as Error)?.message ||
              "Could not retrieve assessment attempt data. Please check your network."}
          </p>
          <div className="pt-2 flex gap-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="text-xs"
            >
              Retry Connection
            </Button>
            <Link
              href="/candidate/invitations"
              className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
            >
              My Invitations
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ── Progress statistics ──
  const answeredCount = submissionsMap.size;
  const totalCount = problems.length;
  const unansweredCount = Math.max(0, totalCount - answeredCount);
  const flaggedCount = flaggedProblemIds.size;

  // Format timer
  const formattedTime = formatCountdown(secondsRemaining);
  const isTimeCritical =
    typeof secondsRemaining === "number" && secondsRemaining <= 180;
  const isTimeWarning =
    typeof secondsRemaining === "number" &&
    secondsRemaining > 180 &&
    secondsRemaining <= 600;

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden select-none">
      {/* ── TOP EXAMINATION HEADER ── */}
      <header className="h-14 border-b border-border/70 bg-card/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 gap-3 z-30">
        {/* Left: Brand & Assessment title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <Code2 className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {assessment?.title || "Assessment Examination"}
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                Attempt #{attempt?.attemptNumber || 1}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
              {assessment?.company?.name ? `${assessment.company.name} • ` : ""}
              {totalCount} Total Questions • {assessment?.totalMarks || 100} Max
              Points
            </p>
          </div>
        </div>

        {/* Center: Authoritative Countdown Timer & Anti-Cheat Badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Authoritative Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
              isTimeCritical
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse"
                : isTimeWarning
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-muted/70 text-foreground border-border/70"
            }`}
          >
            <Clock className="size-3.5" />
            <span>{formattedTime}</span>
          </div>

          {/* Anti-cheat status pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/50 bg-muted/40 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Shield className="size-3 text-emerald-500" />
            <span>Proctor Guard</span>
            {tabSwitchCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 text-[10px] font-semibold">
                {tabSwitchCount} tab switch
              </span>
            )}
          </div>
        </div>

        {/* Right: Autosave status, Fullscreen toggle & Finalize Submit */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Save status badge */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-muted-foreground px-2">
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="size-3 animate-spin text-primary" />
                <span>Saving draft...</span>
              </>
            ) : saveStatus === "unsaved" ? (
              <span className="text-amber-500">• Unsaved changes</span>
            ) : (
              <>
                <Check className="size-3 text-emerald-500" />
                <span>All saved</span>
              </>
            )}
          </div>

          {/* Fullscreen toggle button */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
          </Button>

          {/* Finalize Assessment CTA */}
          <Button
            type="button"
            size="sm"
            onClick={() => setSubmitDialogOpen(true)}
            className="h-8 px-3 text-xs font-semibold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer shadow-md shadow-emerald-500/10 shrink-0"
          >
            <Send className="size-3" />
            <span className="hidden sm:inline">Finalize & Submit</span>
            <span className="sm:hidden">Submit</span>
          </Button>
        </div>
      </header>

      {/* ── QUESTION NAVIGATOR STRIP ── */}
      <div className="h-11 border-b border-border/50 bg-card/30 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 overflow-x-auto [scrollbar-width:none]">
        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1.5 flex items-center gap-1 shrink-0">
            <ListChecks className="size-3 text-primary" />
            <span>Questions:</span>
          </span>

          {problems.map((probWrap, idx) => {
            const isCurrent = idx === currentProblemIndex;
            const isAnswered = submissionsMap.has(probWrap.problem.id);
            const isFlagged = flaggedProblemIds.has(probWrap.problem.id);

            return (
              <button
                key={probWrap.problem.id || idx}
                type="button"
                onClick={() => setCurrentProblemIndex(idx)}
                className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/40 font-bold"
                    : isAnswered
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                }`}
              >
                {isFlagged ? (
                  <Flag className="size-3 text-amber-500 fill-amber-500" />
                ) : isAnswered ? (
                  <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                ) : null}
                <span>#{probWrap.questionOrder || idx + 1}</span>
                <span className="text-[10px] opacity-75 font-normal">
                  {probWrap.problem.type === "CODING"
                    ? "CODE"
                    : probWrap.problem.type}
                </span>
              </button>
            );
          })}
        </div>

        {/* Progress counter */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0 font-medium">
          <span>
            Answered:{" "}
            <strong className="text-foreground">
              {answeredCount}/{totalCount}
            </strong>
          </span>
          {flaggedCount > 0 && (
            <span className="flex items-center gap-1 text-amber-500 font-semibold">
              <Flag className="size-3 fill-amber-500" />
              <span>{flaggedCount} flagged</span>
            </span>
          )}
        </div>
      </div>

      {/* ── MAIN WORKSPACE ARENA (Split View: Problem Pane + Solution Pane) ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-background">
        {/* ── LEFT PANE: Problem Statement & Instructions (lg:col-span-5) ── */}
        <div className="lg:col-span-5 h-full overflow-y-auto border-r border-border/70 p-5 sm:p-6 space-y-4 bg-card/15">
          {!currentProblem ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              No problem data available.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Question Header */}
              <div className="space-y-2 border-b border-border/50 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                      #
                      {currentProblemWrap?.questionOrder ||
                        currentProblemIndex + 1}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {currentProblem.type}
                    </span>
                    <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {currentProblem.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {currentProblem.marks} Marks
                    </span>
                    {submissionsMap.has(currentProblem.id) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="size-3" /> Answered
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-base font-bold text-foreground leading-snug">
                  {currentProblem.title}
                </h2>
              </div>

              {/* Problem Description */}
              {currentProblem.description && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Problem Description
                  </h3>
                  <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans bg-card/40 p-4 rounded-xl border border-border/50 shadow-inner">
                    {currentProblem.description}
                  </div>
                </div>
              )}

              {/* Public Test Cases (for coding problems) */}
              {currentProblem.type === "CODING" &&
                currentProblem.codingQuestion?.testCases &&
                currentProblem.codingQuestion.testCases.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="size-3.5 text-primary" />
                      <span>
                        Example Test Cases (
                        {currentProblem.codingQuestion.testCases.length})
                      </span>
                    </h3>

                    <div className="space-y-2.5">
                      {currentProblem.codingQuestion.testCases.map(
                        (tc, tcIdx) => (
                          <div
                            key={tc.id || tcIdx}
                            className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2 font-mono text-xs"
                          >
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                              Example #{tcIdx + 1}
                            </span>
                            <div>
                              <span className="text-[10px] text-muted-foreground block mb-0.5">
                                Input:
                              </span>
                              <pre className="bg-background/90 p-2 rounded-lg border border-border/40 text-[11px] overflow-x-auto text-foreground">
                                {tc.input}
                              </pre>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground block mb-0.5">
                                Expected Output:
                              </span>
                              <pre className="bg-background/90 p-2 rounded-lg border border-border/40 text-[11px] overflow-x-auto text-emerald-600 dark:text-emerald-400">
                                {tc.expectedOutput}
                              </pre>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* ── RIGHT PANE: Solution Arena & Controls (lg:col-span-7) ── */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-0 bg-card/25 overflow-hidden">
          {/* Solving surface based on question type */}
          <div className="flex-1 min-h-0 p-5 sm:p-6 overflow-y-auto">
            {!currentProblem ? null : currentProblem.type === "MCQ" ? (
              /* MCQ View */
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ListChecks className="size-3.5 text-primary" />
                    <span>Select the correct option:</span>
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Single Choice
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {currentProblem.mcqQuestion?.options?.map((opt, optIdx) => {
                    const isSelected = selectedOptionId === opt.id;
                    const optionLetter = String.fromCharCode(
                      65 + (opt.optionOrder ?? optIdx),
                    );

                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          if (isAttemptActive) {
                            setSelectedOptionId(opt.id);
                            setSaveStatus("unsaved");
                          }
                        }}
                        className={`w-full text-left p-4 rounded-xl border text-xs flex items-start gap-3.5 transition-all ${
                          isAttemptActive
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-80"
                        } ${
                          isSelected
                            ? "bg-primary/10 border-primary text-foreground font-medium shadow-sm ring-2 ring-primary/40"
                            : "bg-card/40 border-border/60 text-muted-foreground hover:bg-muted/40 hover:border-border"
                        }`}
                      >
                        <span
                          className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "border border-border text-muted-foreground bg-muted/40"
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <div className="flex-1 leading-relaxed pt-0.5 text-foreground text-xs font-normal">
                          {opt.optionText}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : currentProblem.type === "WRITTEN" ? (
              /* Written View */
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-primary" />
                    <span>Draft your written answer:</span>
                  </h3>
                  <span
                    className={`text-xs font-semibold ${
                      isWordLimitExceeded
                        ? "text-destructive font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    Words: {writtenWordCount}
                    {wordLimit ? ` / ${wordLimit} max` : ""}
                  </span>
                </div>

                {isWordLimitExceeded && (
                  <div className="p-2.5 rounded-lg border border-destructive/20 bg-destructive/10 text-xs text-destructive flex items-center gap-2">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>
                      Word limit exceeded! Please shorten your answer to{" "}
                      {wordLimit} words.
                    </span>
                  </div>
                )}

                <Textarea
                  value={answerText}
                  onChange={(e) => {
                    setAnswerText(e.target.value);
                    setSaveStatus("unsaved");
                  }}
                  disabled={!isAttemptActive}
                  placeholder="Draft your detailed analysis, system design, or explanation here..."
                  className="flex-1 min-h-[300px] resize-none text-xs font-sans leading-relaxed border-border/70 focus:border-primary/50 bg-background/80"
                />
              </div>
            ) : currentProblem.type === "CODING" ? (
              /* Coding View */
              <div className="space-y-3 h-full flex flex-col">
                {/* Code toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      Language:
                    </span>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      disabled={!isAttemptActive}
                      className="h-7 text-xs px-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary uppercase font-semibold cursor-pointer"
                    >
                      {supportedLanguages.map((lang: string) => (
                        <option key={lang} value={lang.toLowerCase()}>
                          {lang.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetTemplate}
                    disabled={!isAttemptActive}
                    className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset Boilerplate</span>
                  </Button>
                </div>

                {/* IDE Code Editor */}
                <div className="flex-1 min-h-[340px] rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-inner flex flex-col">
                  <div className="px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-mono flex items-center gap-1.5">
                      <Code2 className="size-3 text-emerald-400" />
                      solution.
                      {language === "python"
                        ? "py"
                        : language === "cpp"
                          ? "cpp"
                          : language === "java"
                            ? "java"
                            : language === "go"
                              ? "go"
                              : "ts"}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Press Tab to indent
                    </span>
                  </div>

                  <textarea
                    value={sourceCode}
                    onChange={(e) => {
                      setSourceCode(e.target.value);
                      setSaveStatus("unsaved");
                    }}
                    disabled={!isAttemptActive}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const target = e.target as HTMLTextAreaElement;
                        const start = target.selectionStart;
                        const end = target.selectionEnd;
                        const nextVal = `${sourceCode.substring(0, start)}  ${sourceCode.substring(end)}`;
                        setSourceCode(nextVal);
                        setSaveStatus("unsaved");
                        setTimeout(() => {
                          target.selectionStart = target.selectionEnd =
                            start + 2;
                        }, 0);
                      }
                    }}
                    placeholder="// Write your algorithm solution here..."
                    spellCheck={false}
                    className="flex-1 w-full p-4 bg-transparent text-zinc-100 font-mono text-xs leading-relaxed focus:outline-none resize-none"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* ── FOOTER ACTION BAR (Bottom of workspace) ── */}
          <footer className="h-14 border-t border-border/70 bg-card/60 backdrop-blur-md px-5 sm:px-6 flex items-center justify-between shrink-0 gap-3">
            {/* Left controls: Previous & Flag */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentProblemIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentProblemIndex <= 0}
                className="h-8 text-xs px-2.5 gap-1 cursor-pointer"
              >
                <ArrowLeft className="size-3" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {currentProblemId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFlagCurrent(currentProblemId)}
                  className={`h-8 text-xs px-2.5 gap-1 cursor-pointer ${
                    flaggedProblemIds.has(currentProblemId)
                      ? "border-amber-500/40 text-amber-500 bg-amber-500/10 hover:bg-amber-500/15"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Flag
                    className={`size-3 ${
                      flaggedProblemIds.has(currentProblemId)
                        ? "fill-amber-500"
                        : ""
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {flaggedProblemIds.has(currentProblemId)
                      ? "Flagged"
                      : "Flag"}
                  </span>
                </Button>
              )}
            </div>

            {/* Right controls: Save, Save & Next, Next */}
            <div className="flex items-center gap-2">
              {isAttemptActive && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSaveSubmission(false)}
                    disabled={
                      !canSubmitCurrent || createSubmissionMutation.isPending
                    }
                    className="h-8 text-xs px-3 font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
                  >
                    {createSubmissionMutation.isPending &&
                    saveStatus === "saving" ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="size-3" />
                        <span>Save Solution</span>
                      </>
                    )}
                  </Button>

                  {currentProblemIndex < problems.length - 1 && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveSubmission(true)}
                      disabled={
                        !canSubmitCurrent || createSubmissionMutation.isPending
                      }
                      className="h-8 text-xs px-3 font-semibold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm cursor-pointer"
                    >
                      <Sparkles className="size-3" />
                      <span>Save & Next</span>
                    </Button>
                  )}
                </>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentProblemIndex((prev) =>
                    Math.min(problems.length - 1, prev + 1),
                  )
                }
                disabled={currentProblemIndex >= problems.length - 1}
                className="h-8 text-xs px-2.5 gap-1 cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="size-3" />
              </Button>
            </div>
          </footer>
        </div>
      </div>

      {/* ── MANDATORY FULLSCREEN EXIT MODAL ── */}
      {isFullscreenRequired && showFullscreenModal && isAttemptActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in-0">
          <Card className="max-w-md w-full border-rose-500/40 shadow-2xl p-6 text-center space-y-4 bg-card">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 w-fit mx-auto border border-rose-500/20">
              <Maximize2 className="size-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                Fullscreen Mode Required
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Examination security policies require candidates to remain in
                fullscreen mode throughout this test. Departure events have been
                recorded in the audit log.
              </p>
            </div>
            {fullscreenExitCount > 0 && (
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 font-mono text-xs border border-rose-500/20">
                Fullscreen Exits: {fullscreenExitCount}
              </div>
            )}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleToggleFullscreen}
                className="w-full text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground h-9 cursor-pointer"
              >
                <Maximize2 className="size-3.5" />
                Re-enter Fullscreen Mode
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── TIME EXPIRED MODAL ── */}
      {timeExpiredDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-lg animate-in fade-in-0">
          <Card className="max-w-md w-full border-amber-500/30 shadow-2xl p-6 text-center space-y-4 bg-card">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 w-fit mx-auto border border-amber-500/20">
              <Clock className="size-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                Time Limit Concluded
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The allocated testing time for this assessment has reached zero.
                Your saved solutions are being automatically locked and
                finalized.
              </p>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleAutoSubmitOnExpiry}
                disabled={finalizeMutation.isPending}
                className="w-full text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-9 cursor-pointer"
              >
                {finalizeMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Finalizing Submission...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Proceed to Results Dashboard</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── FINALIZE & SUBMIT CONFIRMATION DIALOG ── */}
      {submitDialogOpen && (
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent size="md" className="p-5 sm:p-6 gap-4">
            <DialogHeader className="space-y-2 text-center items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-inner">
                <Send className="h-6 w-6" />
              </div>
              <DialogTitle className="text-center text-lg font-bold tracking-tight text-foreground">
                Finalize & Submit Assessment?
              </DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
                {assessment?.title ? (
                  <span className="block font-medium text-foreground mb-1">
                    &quot;{assessment.title}&quot;
                  </span>
                ) : null}
                Once confirmed, your examination will be locked. You will not be
                able to resume or edit your answers.
              </DialogDescription>
            </DialogHeader>

            {submissionError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{submissionError}</span>
              </div>
            )}

            {/* Answered statistics breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center py-1">
              <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {answeredCount}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Answered
                </div>
              </div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-muted/30">
                <div className="text-base font-bold text-foreground">
                  {unansweredCount}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Unanswered
                </div>
              </div>
              <div className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {flaggedCount}
                </div>
                <div className="text-[10px] text-muted-foreground">Flagged</div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  You have <strong>{unansweredCount}</strong> unanswered
                  questions. Unanswered questions will receive 0 marks.
                </span>
              </div>
            )}

            <DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs cursor-pointer"
                disabled={finalizeMutation.isPending}
                onClick={() => setSubmitDialogOpen(false)}
              >
                Cancel & Continue Working
              </Button>
              <Button
                type="button"
                size="sm"
                className="w-full sm:w-auto text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
                disabled={finalizeMutation.isPending}
                onClick={handleFinalSubmitConfirm}
              >
                {finalizeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Confirm & Submit Exam
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/**
 * Screen displayed when attempt has already been submitted or evaluated
 */
function AttemptCompletedView({
  attempt,
  assessmentTitle,
}: {
  attempt: {
    attemptNumber?: number;
    submittedAt?: string | null;
    status?: string;
    percentage?: number | null;
    obtainedMarks?: number | null;
  };
  assessmentTitle?: string;
}) {
  return (
    <div className="h-screen w-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full p-8 text-center space-y-5 border-emerald-500/30 shadow-2xl bg-card">
        <div className="size-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-inner">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            {attempt.status || "SUBMITTED"}
          </span>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Assessment Already Submitted
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {assessmentTitle ? (
              <span className="font-semibold text-foreground block">
                &quot;{assessmentTitle}&quot;
              </span>
            ) : null}
            Your solutions for Attempt #{attempt.attemptNumber || 1} have been
            recorded and submitted for evaluation. You cannot modify answers.
          </p>
        </div>

        {attempt.percentage != null && (
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <span className="text-muted-foreground">Evaluation Score:</span>{" "}
            <strong className="text-foreground text-sm font-bold">
              {attempt.percentage}%
            </strong>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            href="/candidate/results"
            className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-colors"
          >
            <Trophy className="mr-1.5 size-3.5" />
            View Official Scorecard
          </Link>
          <Link
            href="/candidate"
            className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}

/**
 * Screen displayed when attempt has expired
 */
function AttemptExpiredView({
  attempt,
  assessmentTitle,
}: {
  attempt: {
    attemptNumber?: number;
    status?: string;
  };
  assessmentTitle?: string;
}) {
  return (
    <div className="h-screen w-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full p-8 text-center space-y-5 border-amber-500/30 shadow-2xl bg-card">
        <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
          <Clock className="size-7" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            EXPIRED
          </span>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Assessment Session Expired
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {assessmentTitle ? (
              <span className="font-semibold text-foreground block">
                &quot;{assessmentTitle}&quot;
              </span>
            ) : null}
            The allocated duration for Attempt #{attempt.attemptNumber || 1} has
            elapsed. This assessment session is no longer active.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            href="/candidate/results"
            className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-colors"
          >
            <Trophy className="mr-1.5 size-3.5" />
            View Results
          </Link>
          <Link
            href="/candidate"
            className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}

/**
 * Format remaining seconds into HH:MM:SS or MM:SS
 */
function formatCountdown(totalSeconds: number | null): string {
  if (totalSeconds === null || totalSeconds < 0) return "--:--";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default CandidateExaminationArena;
