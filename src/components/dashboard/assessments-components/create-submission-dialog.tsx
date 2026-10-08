"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  FileCheck2,
  FileText,
  HelpCircle,
  ListChecks,
  Loader2,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
  useCreateSubmissionFromAttempt,
  useGetAttemptDetails,
} from "@/hook/assessment.hook";
import type {
  IAttemptSubmissionItem,
  ICreateSubmissionPayload,
  ISanitizedAssessmentProblem,
} from "@/types/assessment.type";
import { FinalizeSubmitAttemptDialog } from "./finalize-submit-attempt-dialog";

interface CreateSubmissionDialogProps {
  attemptId: string | null;
  initialProblemId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmissionSuccess?: (submission: IAttemptSubmissionItem) => void;
  onAllCompleted?: () => void;
}

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

export function CreateSubmissionDialog({
  attemptId,
  initialProblemId,
  open,
  onOpenChange,
  onSubmissionSuccess,
  onAllCompleted,
}: CreateSubmissionDialogProps) {
  const queryClient = useQueryClient();

  // Load Attempt details (assessment problems & current submissions)
  const {
    data: attemptRes,
    isLoading: isAttemptLoading,
    isError: isAttemptError,
    error: attemptError,
    refetch: refetchAttempt,
  } = useGetAttemptDetails(attemptId || "");

  const createSubmissionMutation = useCreateSubmissionFromAttempt();

  const attemptData = attemptRes?.data;
  const attempt = attemptData?.attempt;
  const assessment = attempt?.assessment || attemptData?.assessment;

  const problems: ISanitizedAssessmentProblem[] = useMemo(() => {
    return assessment?.problems || [];
  }, [assessment]);

  const existingSubmissions: IAttemptSubmissionItem[] = useMemo(() => {
    return attempt?.submissions || [];
  }, [attempt]);

  // Map problemId -> submission
  const submissionsMap = useMemo(() => {
    const map = new Map<string, IAttemptSubmissionItem>();
    for (const sub of existingSubmissions) {
      if (sub.problemId) {
        map.set(sub.problemId, sub);
      }
    }
    return map;
  }, [existingSubmissions]);

  // Current selected problem index
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);

  // Form states per problem type
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [answerText, setAnswerText] = useState<string>("");
  const [sourceCode, setSourceCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Synchronize initial problem on open or when problems change
  useEffect(() => {
    if (!open || problems.length === 0) return;

    if (initialProblemId) {
      const foundIdx = problems.findIndex(
        (p) => p.problem.id === initialProblemId,
      );
      if (foundIdx !== -1) {
        setCurrentProblemIndex(foundIdx);
        return;
      }
    }
    setCurrentProblemIndex(0);
  }, [open, initialProblemId, problems]);

  // Current active problem
  const currentProblemWrap = problems[currentProblemIndex];
  const currentProblem = currentProblemWrap?.problem;

  // Sync draft answer when current problem changes or submissions are fetched
  useEffect(() => {
    if (!currentProblem) return;

    const existingSub = submissionsMap.get(currentProblem.id);

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
        (supportedLangs.includes("typescript") ? "typescript" : supportedLangs[0]) ||
        "javascript";

      setLanguage(initialLang);
      setSourceCode(
        existingSub?.sourceCode ||
          LANGUAGE_TEMPLATES[initialLang.toLowerCase()] ||
          `// Solution for ${currentProblem.title}\n`,
      );
    }
  }, [currentProblemIndex, currentProblem, submissionsMap]);

  // Word count calculation for WRITTEN problems
  const writtenWordCount = useMemo(() => {
    if (!answerText.trim()) return 0;
    return answerText.trim().split(/\s+/).filter(Boolean).length;
  }, [answerText]);

  const wordLimit =
    (currentProblem?.writtenQuestion as { wordLimit?: number | null })?.wordLimit ?? null;
  const isWordLimitExceeded = Boolean(wordLimit && writtenWordCount > wordLimit);

  // Supported languages for current coding problem
  const supportedLanguages = useMemo(() => {
    if (
      currentProblem?.codingQuestion?.supportedLanguages &&
      currentProblem.codingQuestion.supportedLanguages.length > 0
    ) {
      return currentProblem.codingQuestion.supportedLanguages;
    }
    return DEFAULT_LANGUAGES;
  }, [currentProblem]);

  // Validation: can submit current problem?
  const canSubmitCurrent = useMemo(() => {
    if (!currentProblem) return false;
    if (currentProblem.type === "MCQ") {
      return Boolean(selectedOptionId && selectedOptionId.trim() !== "");
    }
    if (currentProblem.type === "WRITTEN") {
      return (
        Boolean(answerText.trim().length > 0) && !isWordLimitExceeded
      );
    }
    if (currentProblem.type === "CODING") {
      return Boolean(sourceCode.trim().length > 0 && language.trim().length > 0);
    }
    return false;
  }, [currentProblem, selectedOptionId, answerText, isWordLimitExceeded, sourceCode, language]);

  // Copy attempt ID helper
  const handleCopyAttemptId = () => {
    if (!attemptId) return;
    navigator.clipboard.writeText(attemptId);
    setCopiedId(true);
    toast.add({
      title: "Attempt ID Copied",
      description: "Identifier copied to clipboard.",
      type: "info",
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Change language and set starter template if code is empty/default
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

  // Submit Answer Mutation Handler
  const handleSaveSubmission = async (shouldNavigateNext = false) => {
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
      selectedOptionId:
        currentProblem.type === "MCQ" ? selectedOptionId : null,
      answerText:
        currentProblem.type === "WRITTEN" ? answerText.trim() : null,
      sourceCode:
        currentProblem.type === "CODING" ? sourceCode : null,
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
          // Invalidate relevant query caches per senior guidelines
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

          if (onSubmissionSuccess && res?.data) {
            onSubmissionSuccess(res.data);
          }

          if (shouldNavigateNext) {
            if (currentProblemIndex < problems.length - 1) {
              setCurrentProblemIndex((prev) => prev + 1);
            } else {
              toast.add({
                title: "All Questions Answered",
                description:
                  "You have reached the end of the problem set. You may review your answers or finalize your assessment.",
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
          const message =
            apiErr?.data?.message ||
            apiErr?.message ||
            "Failed to save submission. Please try again.";

          toast.add({
            title: "Submission Error",
            description: message,
            type: "error",
          });
        },
      },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[96vw] max-w-[96vw] h-[94vh] max-h-[96vh] flex flex-col p-0 gap-0 overflow-hidden border-border/80 bg-background/98 shadow-2xl backdrop-blur-xl">
          {/* ── Dialog Header ── */}
          <DialogHeader className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Code2 className="size-4" />
                  </div>
                  <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <span>Candidate Submission Workspace</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20">
                      Live Attempt
                    </span>
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-foreground">
                    {assessment?.title || "Assessment Examination"}
                  </span>
                  <span>•</span>
                  <span>
                    Attempt ID:{" "}
                    <code className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                      {attemptId?.slice(0, 10)}...
                    </code>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAttemptId}
                    className="inline-flex items-center text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Copy full Attempt ID"
                  >
                    {copiedId ? (
                      <Check className="size-3 text-emerald-500 ml-0.5" />
                    ) : (
                      <Copy className="size-3 ml-0.5" />
                    )}
                  </button>
                </DialogDescription>
              </div>

              {/* Progress Summary & Finalize Trigger */}
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-semibold text-foreground">
                    {existingSubmissions.length} of {problems.length} Answered
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Total Marks: {assessment?.totalMarks ?? 0} pts
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setFinalizeDialogOpen(true)}
                  className="h-8 text-xs font-semibold gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 cursor-pointer"
                >
                  <Send className="size-3" />
                  <span>Finalize Test</span>
                </Button>
              </div>
            </div>

            {/* ── Question Navigator Ribbon ── */}
            {problems.length > 0 && (
              <div className="pt-2 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1.5 shrink-0 flex items-center gap-1">
                  <ListChecks className="size-3.5" /> Questions:
                </span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {problems.map((probWrap, idx) => {
                    const isCurrent = idx === currentProblemIndex;
                    const isAnswered = submissionsMap.has(probWrap.problem.id);

                    return (
                      <button
                        key={probWrap.problem.id || idx}
                        type="button"
                        onClick={() => setCurrentProblemIndex(idx)}
                        className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
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
                        <span className="text-[11px]">
                          {probWrap.problem.type}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </DialogHeader>

          {/* ── Main Workspace Body ── */}
          <div className="flex-1 overflow-y-auto max-h-[62vh] p-5 [scrollbar-width:thin] space-y-5">
            {isAttemptLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ) : isAttemptError ? (
              <div className="py-12 text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
                  <AlertCircle className="size-6" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Failed to load attempt questions
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {(attemptError as Error)?.message ||
                    "Could not load problem bank for this attempt."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchAttempt()}
                  className="text-xs"
                >
                  Retry
                </Button>
              </div>
            ) : !currentProblem ? (
              <div className="py-16 text-center text-xs text-muted-foreground">
                No questions found in this assessment attempt.
              </div>
            ) : (
              <div className="space-y-5">
                {/* ── Problem Info Banner ── */}
                <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        #{currentProblemWrap.questionOrder || currentProblemIndex + 1}
                      </span>
                      <h3 className="text-sm font-bold text-foreground">
                        {currentProblem.title}
                      </h3>
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
                          <CheckCircle2 className="size-3" /> Saved Answer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          <Clock className="size-3" /> Not Yet Saved
                        </span>
                      )}
                    </div>
                  </div>

                  {currentProblem.description && (
                    <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap border-t border-border/40 pt-2.5">
                      {currentProblem.description}
                    </div>
                  )}
                </div>

                {/* ── PROBLEM TYPE: MCQ ── */}
                {currentProblem.type === "MCQ" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ListChecks className="size-3.5 text-primary" />
                        <span>Select the Best Option:</span>
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        Click on an option below to select it
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentProblem.mcqQuestion?.options?.map((opt, optIdx) => {
                        const isSelected = selectedOptionId === opt.id;
                        const optionLetter = String.fromCharCode(65 + (opt.optionOrder ?? optIdx));

                        return (
                          <div
                            key={opt.id}
                            onClick={() => setSelectedOptionId(opt.id)}
                            className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary/10 border-primary text-foreground font-medium shadow-sm ring-1 ring-primary/40"
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

                {/* ── PROBLEM TYPE: WRITTEN ── */}
                {currentProblem.type === "WRITTEN" && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="size-3.5 text-primary" />
                        <span>Written Response:</span>
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`font-semibold ${
                            isWordLimitExceeded
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          Words: {writtenWordCount}
                          {wordLimit ? ` / ${wordLimit} max` : ""}
                        </span>
                      </div>
                    </div>

                    {isWordLimitExceeded && (
                      <div className="p-2.5 rounded-lg border border-destructive/20 bg-destructive/10 text-xs text-destructive flex items-center gap-2">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>
                          Word limit exceeded! Please shorten your answer to{" "}
                          {wordLimit} words or fewer.
                        </span>
                      </div>
                    )}

                    <Textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Type your structured explanation, technical analysis, or essay answer here..."
                      rows={9}
                      className="resize-y text-xs font-sans leading-relaxed border-border/70 focus:border-primary/50"
                    />
                  </div>
                )}

                {/* ── PROBLEM TYPE: CODING ── */}
                {currentProblem.type === "CODING" && (
                  <div className="space-y-3">
                    {/* Coding Header: Language selector & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <Terminal className="size-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                          Programming Language:
                        </span>
                        <select
                          value={language}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="h-7 text-xs px-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer uppercase font-semibold"
                        >
                          {supportedLanguages.map((lang: string) => (
                            <option key={lang} value={lang.toLowerCase()}>
                              {lang.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleResetTemplate}
                          className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <RotateCcw className="size-3" />
                          <span>Reset Boilerplate</span>
                        </Button>
                      </div>
                    </div>

                    {/* Dark Code Editor Area */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-inner flex flex-col">
                      <div className="px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="font-mono flex items-center gap-1.5">
                          <Code2 className="size-3 text-emerald-400" />
                          solution.{language === "python" ? "py" : language === "cpp" ? "cpp" : language === "java" ? "java" : language === "go" ? "go" : "ts"}
                        </span>
                        <span>Press Tab to indent</span>
                      </div>
                      <textarea
                        value={sourceCode}
                        onChange={(e) => setSourceCode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Tab") {
                            e.preventDefault();
                            const target = e.target as HTMLTextAreaElement;
                            const start = target.selectionStart;
                            const end = target.selectionEnd;
                            const nextVal = `${sourceCode.substring(0, start)}  ${sourceCode.substring(end)}`;
                            setSourceCode(nextVal);
                            setTimeout(() => {
                              target.selectionStart = target.selectionEnd = start + 2;
                            }, 0);
                          }
                        }}
                        rows={12}
                        placeholder="// Write your algorithm solution..."
                        spellCheck={false}
                        className="w-full p-4 bg-transparent text-zinc-100 font-mono text-xs leading-relaxed focus:outline-none resize-y [scrollbar-width:thin]"
                      />
                    </div>

                    {/* Public Test Cases Preview */}
                    {currentProblem.codingQuestion?.testCases &&
                      currentProblem.codingQuestion.testCases.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <h5 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                            <span>Sample Test Cases ({currentProblem.codingQuestion.testCases.length})</span>
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {currentProblem.codingQuestion.testCases.map((tc, tcIdx) => (
                              <div
                                key={tc.id || tcIdx}
                                className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs font-mono space-y-1.5"
                              >
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                  Case #{tcIdx + 1}
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
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Dialog Footer with Navigation & Submission Actions ── */}
          <DialogFooter className="p-3.5 px-5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentProblemIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentProblemIndex <= 0 || isAttemptLoading}
                className="h-8 text-xs px-2.5 gap-1 cursor-pointer"
              >
                <ArrowLeft className="size-3" />
                <span>Prev Question</span>
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
                disabled={
                  currentProblemIndex >= problems.length - 1 || isAttemptLoading
                }
                className="h-8 text-xs px-2.5 gap-1 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="size-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 text-xs px-3 cursor-pointer"
              >
                Close
              </Button>

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
                    <span>Saving Answer...</span>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Finalize Assessment Dialog ── */}
      <FinalizeSubmitAttemptDialog
        attemptId={attemptId}
        assessmentTitle={assessment?.title}
        open={finalizeDialogOpen}
        onOpenChange={setFinalizeDialogOpen}
        onSuccess={() => {
          onOpenChange(false);
          if (onAllCompleted) {
            onAllCompleted();
          }
        }}
      />
    </>
  );
}

export default CreateSubmissionDialog;
