"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Eye,
  FileCheck2,
  FileText,
  ListChecks,
  Loader2,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Save,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AttemptResultDialog,
  FinalizeSubmitAttemptDialog,
} from "@/components/dashboard/assessments-components";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  useGetAttemptDetails,
  useGetCandidateMyAttempts,
} from "@/hook/assessment.hook";
import type {
  IAttemptSubmissionItem,
  ICreateSubmissionPayload,
  ISanitizedAssessmentProblem,
} from "@/types/assessment.type";
import { CandidateMyAttempts } from "./candidate-my-attempts";

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

export function CandidateAssessmentWorkspace() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const queryClient = useQueryClient();

  // If no attemptId in URL, show overview / candidate attempts
  if (!attemptId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Code2 className="size-5 text-primary" />
              <span>Assessment Workspace</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Select an active assessment below to solve coding challenges,
              answer MCQs, and submit solutions.
            </p>
          </div>
        </div>

        <CandidateMyAttempts />
      </div>
    );
  }

  return <ActiveAttemptWorkspace attemptId={attemptId} />;
}

function ActiveAttemptWorkspace({ attemptId }: { attemptId: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } =
    useGetAttemptDetails(attemptId);

  const createSubmissionMutation = useCreateSubmissionFromAttempt();

  const attemptData = data?.data;
  const attempt = attemptData?.attempt;
  const assessment = attempt?.assessment || attemptData?.assessment;

  const problems: ISanitizedAssessmentProblem[] =
    assessment?.problems ?? EMPTY_PROBLEMS;

  const submissions: IAttemptSubmissionItem[] =
    attempt?.submissions ?? EMPTY_SUBMISSIONS;

  const submissionsMap = useMemo(() => {
    const map = new Map<string, IAttemptSubmissionItem>();
    for (const sub of submissions) {
      if (sub.problemId) {
        map.set(sub.problemId, sub);
      }
    }
    return map;
  }, [submissions]);

  // Current problem index
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  // Form states per problem
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

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
  }, [currentProblemIndex, currentProblemId]);

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
      toast.add({
        title: "Template Reset",
        description: `Reset code boilerplate to default for ${language}.`,
        type: "info",
      });
    }
  };

  const handleSaveSubmission = (shouldNavigateNext = false) => {
    if (!attemptId || !currentProblem) return;

    if (!canSubmitCurrent) {
      toast.add({
        title: "Incomplete Submission",
        description: "Please provide a valid answer before saving.",
        type: "error",
      });
      return;
    }

    const payload: ICreateSubmissionPayload = {
      attemptId,
      problemId: currentProblem.id,
      selectedOptionId: currentProblem.type === "MCQ" ? selectedOptionId : null,
      answerText: currentProblem.type === "WRITTEN" ? answerText.trim() : null,
      sourceCode: currentProblem.type === "CODING" ? sourceCode : null,
      language:
        currentProblem.type === "CODING" ? language.trim().toLowerCase() : null,
    };

    createSubmissionMutation.mutate(
      {
        attemptId,
        payload,
      },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({
            queryKey: ["attempt-details", attemptId],
          });
          queryClient.invalidateQueries({
            queryKey: ["candidate-my-attempts"],
          });
          queryClient.invalidateQueries({
            queryKey: ["my-attempts"],
          });

          toast.add({
            title: "Solution Saved Successfully",
            description: `Answer for problem #${currentProblemWrap.questionOrder || currentProblemIndex + 1} (${currentProblem.title}) has been recorded.`,
            type: "success",
          });

          if (shouldNavigateNext) {
            if (currentProblemIndex < problems.length - 1) {
              setCurrentProblemIndex((p) => p + 1);
            } else {
              toast.add({
                title: "All Questions Answered",
                description:
                  "You have reached the end of the assessment problems. When ready, click 'Finalize Assessment' to submit.",
                type: "info",
              });
            }
          }
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };
          toast.add({
            title: "Submission Failed",
            description:
              apiErr?.data?.message ||
              apiErr?.message ||
              "Could not record submission. Please check your connection.",
            type: "error",
          });
        },
      },
    );
  };

  const isAttemptActive = attempt?.status === "IN_PROGRESS";

  // Anti-cheating telemetry mutations (Module 06)
  const detectTabSwitchMutation = useDetectTabSwitch();
  const detectFullscreenExitMutation = useDetectFullscreenExit();
  const detectCopyPasteMutation = useDetectCopyPaste();
  const detectMultipleTabsMutation = useDetectMultipleTabs();

  // Stable references for mutations to avoid triggering infinite re-render loops in useEffect
  const detectTabSwitchRef = useRef(detectTabSwitchMutation.mutate);
  detectTabSwitchRef.current = detectTabSwitchMutation.mutate;

  const detectFullscreenExitRef = useRef(detectFullscreenExitMutation.mutate);
  detectFullscreenExitRef.current = detectFullscreenExitMutation.mutate;

  const detectCopyPasteRef = useRef(detectCopyPasteMutation.mutate);
  detectCopyPasteRef.current = detectCopyPasteMutation.mutate;

  const detectMultipleTabsRef = useRef(detectMultipleTabsMutation.mutate);
  detectMultipleTabsRef.current = detectMultipleTabsMutation.mutate;

  // Rate-limiting throttle timestamps to prevent event spamming
  const lastTabSwitchReportRef = useRef<number>(0);
  const lastFullscreenExitReportRef = useRef<number>(0);
  const lastCopyPasteReportRef = useRef<number>(0);
  const lastMultipleTabsReportRef = useRef<number>(0);

  // Stable unique ID for this browser tab session
  const tabSessionIdRef = useRef<string>(
    typeof window !== "undefined"
      ? (window.name ||= `tab_${Math.random().toString(36).slice(2)}`)
      : "tab_session",
  );

  const settings = assessment?.settings;
  const isFullscreenRequired = Boolean(settings?.requireFullscreen);
  const isCopyPastePrevented = Boolean(settings?.preventCopyPaste);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [copyPasteBlockedCount, setCopyPasteBlockedCount] = useState(0);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);

  // 1. Fullscreen departure telemetry (with throttle & stable dependencies)
  useEffect(() => {
    if (!isAttemptActive || !isFullscreenRequired || !attemptId) return;

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);

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
              reason: "Candidate exited fullscreen exam environment",
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
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isAttemptActive, isFullscreenRequired, attemptId]);

  // 2. Tab switch & visibility loss telemetry (with throttle & stable dependencies)
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
            title: "Security Telemetry Warning",
            description:
              "Tab switch detected. This event has been recorded in the proctoring audit log.",
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

  // 3. Copy / Paste blocker & telemetry (with throttle & stable dependencies)
  useEffect(() => {
    if (!isAttemptActive || !isCopyPastePrevented || !attemptId) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setCopyPasteBlockedCount((c) => c + 1);

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
      setCopyPasteBlockedCount((c) => c + 1);

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

  // 4. Multi-tab concurrent session guard (Clean protocol, StrictMode-safe & 30s cooldown)
  useEffect(() => {
    if (
      !isAttemptActive ||
      !attemptId ||
      typeof window === "undefined" ||
      !("BroadcastChannel" in window)
    )
      return;

    const myTabId = tabSessionIdRef.current;
    const channel = new BroadcastChannel(`assessment-attempt-${attemptId}`);

    const reportDuplicate = () => {
      const now = Date.now();
      if (now - lastMultipleTabsReportRef.current > 30000) {
        lastMultipleTabsReportRef.current = now;
        detectMultipleTabsRef.current({
          attemptId,
          payload: {
            activeTabCount: 2,
            details: "Concurrent browser tab session detected",
            clientTimestamp: new Date().toISOString(),
          },
        });
        toast.add({
          title: "Multiple Tabs Detected",
          description:
            "Multiple tabs open for this exam session. Please keep only one tab open.",
          type: "warning",
        });
      }
    };

    // Delay announcement by 500ms to safely bypass React Strict Mode's rapid mount-unmount-remount
    const announceTimer = setTimeout(() => {
      channel.postMessage({ type: "EXAM_TAB_ANNOUNCE", tabId: myTabId });
    }, 500);

    channel.onmessage = (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      // Another tab announced itself
      if (msg.type === "EXAM_TAB_ANNOUNCE" && msg.tabId !== myTabId) {
        // Ack presence so the new tab knows an existing tab is active
        channel.postMessage({ type: "EXAM_TAB_ACK", tabId: myTabId });
        reportDuplicate();
      }

      // Received acknowledgment from an already existing tab
      if (msg.type === "EXAM_TAB_ACK" && msg.tabId !== myTabId) {
        reportDuplicate();
      }
    };

    return () => {
      clearTimeout(announceTimer);
      channel.close();
    };
  }, [isAttemptActive, attemptId]);

  const handleEnterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setShowFullscreenModal(false);
      }
    } catch {
      toast.add({
        title: "Fullscreen Error",
        description:
          "Could not activate fullscreen mode. Please check browser permissions.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/candidate"
              className="p-1 rounded-lg border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{assessment?.title || "Assessment Workspace"}</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  isAttemptActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {attempt?.status || "IN_PROGRESS"}
              </span>
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Attempt ID: <code className="font-mono">{attemptId}</code> • Attempt
            #{attempt?.attemptNumber || 1}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAttemptActive ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setFinalizeOpen(true)}
              className="h-8 text-xs font-semibold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer shadow-md shadow-emerald-500/10"
            >
              <Send className="size-3.5" />
              <span>Finalize Assessment</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setResultOpen(true)}
              className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <Trophy className="size-3.5" />
              <span>View Official Result</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Live Proctoring Telemetry Status Strip ── */}
      {isAttemptActive && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 px-3.5 rounded-xl border border-primary/20 bg-primary/[0.03] text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Anti-Cheat Guard
            </span>

            {/* Fullscreen status */}
            {isFullscreenRequired ? (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                  isFullscreen
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                }`}
              >
                <Maximize2 className="size-3" />
                Fullscreen: {isFullscreen ? "Active" : "Required"}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                Fullscreen: Optional
              </span>
            )}

            {/* Clipboard status */}
            {isCopyPastePrevented && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Shield className="size-3" />
                Clipboard Protected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {tabSwitchCount > 0 && (
              <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                Tab Switches:{" "}
                <strong className="text-foreground">{tabSwitchCount}</strong>
              </span>
            )}

            {fullscreenExitCount > 0 && (
              <span className="text-[11px] font-mono text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Fullscreen Exits: <strong>{fullscreenExitCount}</strong>
              </span>
            )}

            {isFullscreenRequired && !isFullscreen && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleEnterFullscreen}
                className="h-6 text-[11px] font-semibold px-2 gap-1 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
              >
                <Maximize2 className="size-3" />
                Enter Fullscreen
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Mandatory Fullscreen Modal Warning ── */}
      {isFullscreenRequired && showFullscreenModal && isAttemptActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in-0">
          <Card className="max-w-md w-full border-rose-500/30 shadow-2xl p-6 text-center space-y-4 bg-card">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 w-fit mx-auto">
              <Maximize2 className="size-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                Fullscreen Mode Required
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Exam security policies require you to remain in fullscreen mode
                throughout this assessment. Fullscreen departure events have
                been recorded.
              </p>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleEnterFullscreen}
                className="w-full text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground h-9"
              >
                <Maximize2 className="size-3.5" />
                Re-enter Fullscreen Mode
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Question Navigator Bar ── */}
      {problems.length > 0 && (
        <Card className="p-3 bg-card/60 border-border/60">
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
            <span className="text-xs font-semibold text-muted-foreground mr-2 shrink-0 flex items-center gap-1.5">
              <ListChecks className="size-3.5" /> Problems:
            </span>
            {problems.map((probWrap, idx) => {
              const isCurrent = idx === currentProblemIndex;
              const isAnswered = submissionsMap.has(probWrap.problem.id);

              return (
                <button
                  key={probWrap.problem.id || idx}
                  type="button"
                  onClick={() => setCurrentProblemIndex(idx)}
                  className={`h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30"
                      : isAnswered
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {isAnswered ? (
                    <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <span>#{probWrap.questionOrder || idx + 1}</span>
                  )}
                  <span className="text-[11px]">{probWrap.problem.type}</span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Main Problem Solving Arena ── */}
      {isLoading ? (
        <Card className="p-8 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </Card>
      ) : isError ? (
        <Card className="p-12 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Failed to load attempt questions
          </p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {(error as Error)?.message || "Could not load problem bank."}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </Card>
      ) : !currentProblem ? (
        <Card className="p-12 text-center text-xs text-muted-foreground">
          No questions available in this assessment.
        </Card>
      ) : (
        <div className="space-y-4">
          {/* ── Problem Statement Card ── */}
          <Card className="p-5 border-border/70 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  #{currentProblemWrap.questionOrder || currentProblemIndex + 1}
                </span>
                <h2 className="text-base font-bold text-foreground">
                  {currentProblem.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {currentProblem.type}
                </span>
                <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {currentProblem.difficulty}
                </span>
                <span className="font-semibold text-foreground px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {currentProblem.marks} Points
                </span>
                {submissionsMap.has(currentProblem.id) ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="size-3" /> Answer Recorded
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    <Clock className="size-3" /> Pending Submission
                  </span>
                )}
              </div>
            </div>

            {currentProblem.description && (
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {currentProblem.description}
              </p>
            )}
          </Card>

          {/* ── Solving Area by Problem Type ── */}
          <Card className="p-5 border-border/70 space-y-4">
            {/* MCQ View */}
            {currentProblem.type === "MCQ" && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ListChecks className="size-3.5 text-primary" />
                  <span>Choose Your Answer:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentProblem.mcqQuestion?.options?.map((opt, optIdx) => {
                    const isSelected = selectedOptionId === opt.id;
                    const optionLetter = String.fromCharCode(
                      65 + (opt.optionOrder ?? optIdx),
                    );

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (isAttemptActive) setSelectedOptionId(opt.id);
                        }}
                        className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                          isAttemptActive
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-80"
                        } ${
                          isSelected
                            ? "bg-primary/10 border-primary text-foreground font-medium shadow-sm ring-1 ring-primary/40"
                            : "bg-card/40 border-border/60 text-muted-foreground hover:bg-muted/40 hover:border-border"
                        }`}
                      >
                        <span
                          className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "border border-border text-muted-foreground bg-muted/40"
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <div className="flex-1 leading-relaxed pt-0.5">
                          {opt.optionText}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Written View */}
            {currentProblem.type === "WRITTEN" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-primary" />
                    <span>Written Technical Response:</span>
                  </h3>
                  <span
                    className={`text-xs font-semibold ${
                      isWordLimitExceeded
                        ? "text-destructive"
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
                  onChange={(e) => setAnswerText(e.target.value)}
                  disabled={!isAttemptActive}
                  placeholder="Draft your comprehensive solution or essay response here..."
                  rows={10}
                  className="resize-y text-xs font-sans leading-relaxed border-border/70 focus:border-primary/50"
                />
              </div>
            )}

            {/* Coding View */}
            {currentProblem.type === "CODING" && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      Language:
                    </span>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      disabled={!isAttemptActive}
                      className="h-7 text-xs px-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary uppercase font-semibold"
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

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-inner flex flex-col">
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
                    <span>Press Tab to indent</span>
                  </div>
                  <textarea
                    value={sourceCode}
                    onChange={(e) => setSourceCode(e.target.value)}
                    disabled={!isAttemptActive}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const target = e.target as HTMLTextAreaElement;
                        const start = target.selectionStart;
                        const end = target.selectionEnd;
                        const nextVal = `${sourceCode.substring(0, start)}  ${sourceCode.substring(end)}`;
                        setSourceCode(nextVal);
                        setTimeout(() => {
                          target.selectionStart = target.selectionEnd =
                            start + 2;
                        }, 0);
                      }
                    }}
                    rows={14}
                    placeholder="// Implement your algorithm solution here..."
                    spellCheck={false}
                    className="w-full p-4 bg-transparent text-zinc-100 font-mono text-xs leading-relaxed focus:outline-none resize-y"
                  />
                </div>

                {/* Test cases preview */}
                {currentProblem.codingQuestion?.testCases &&
                  currentProblem.codingQuestion.testCases.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <h4 className="text-xs font-semibold text-muted-foreground">
                        Public Test Cases (
                        {currentProblem.codingQuestion.testCases.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentProblem.codingQuestion.testCases.map(
                          (tc, tcIdx) => (
                            <div
                              key={tc.id || tcIdx}
                              className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs font-mono space-y-1.5"
                            >
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                Test Case #{tcIdx + 1}
                              </span>
                              <div>
                                <span className="text-[10px] text-muted-foreground block">
                                  Input:
                                </span>
                                <pre className="bg-background/80 p-1.5 rounded border border-border/40 text-[11px] overflow-x-auto">
                                  {tc.input}
                                </pre>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block">
                                  Expected Output:
                                </span>
                                <pre className="bg-background/80 p-1.5 rounded border border-border/40 text-[11px] overflow-x-auto text-emerald-600 dark:text-emerald-400">
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

            {/* ── Action Buttons Footer ── */}
            <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
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
                  <span>Previous</span>
                </Button>

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
                  <span>Next</span>
                  <ArrowRight className="size-3" />
                </Button>
              </div>

              {isAttemptActive && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSaveSubmission(false)}
                    disabled={
                      !canSubmitCurrent || createSubmissionMutation.isPending
                    }
                    className="h-8 text-xs px-3 font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
                  >
                    {createSubmissionMutation.isPending ? (
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
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── Finalize Assessment Dialog ── */}
      {finalizeOpen && (
        <FinalizeSubmitAttemptDialog
          attemptId={attemptId}
          assessmentTitle={assessment?.title}
          open={finalizeOpen}
          onOpenChange={setFinalizeOpen}
          onSuccess={() => {
            setResultOpen(true);
            refetch();
          }}
        />
      )}

      {/* ── Official Attempt Result Modal Dialog ── */}
      {resultOpen && (
        <AttemptResultDialog
          attemptId={attemptId}
          open={resultOpen}
          onOpenChange={setResultOpen}
          isCandidateView={true}
        />
      )}
    </div>
  );
}

export default CandidateAssessmentWorkspace;
