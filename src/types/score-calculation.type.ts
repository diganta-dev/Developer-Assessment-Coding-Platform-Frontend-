import type { Difficulty, ProblemType } from "./question.type";
import type { EvaluationStatus } from "./evaluation.type";

export interface ICodingScoreBreakdown {
  submissionId: string;
  attemptId: string;
  problemId: string;
  problemTitle: string;
  totalMarks: number;
  earnedMarks: number;
  percentage: number;
  totalTestCases: number;
  passedTests: number;
  failedTests: number;
  publicTestsPassed: number;
  totalPublicTests: number;
  hiddenTestsPassed: number;
  totalHiddenTests: number;
  executionTimeMs: number;
  memoryUsedMb: number;
  isCorrect: boolean;
  status: string;
  feedback: string | null;
}

export interface IMCQScoreBreakdown {
  submissionId: string;
  attemptId: string;
  problemId: string;
  problemTitle: string;
  totalMarks: number;
  earnedMarks: number;
  percentage: number;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string | null;
  correctOptionText: string | null;
  isCorrect: boolean;
  explanation: string | null;
  feedback: string | null;
  status: string;
}

export interface IWrittenScoreBreakdown {
  submissionId: string;
  attemptId: string;
  problemId: string;
  problemTitle: string;
  totalMarks: number;
  earnedMarks: number;
  percentage: number;
  answerText: string | null;
  wordCount: number;
  wordLimit: number | null;
  isWordLimitExceeded: boolean;
  expectedAnswer: string | null;
  isCorrect: boolean;
  status: string;
  evaluationStatus: EvaluationStatus;
  feedback: string | null;
  evaluatorId: string | null;
  evaluatorName: string | null;
  evaluatedAt: string | Date | null;
}

export interface ISubmissionScoreResult {
  submissionId: string;
  attemptId: string;
  problemId: string;
  problemTitle: string;
  problemType: ProblemType;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  isCorrect: boolean;
  status: string;
  feedback: string | null;
  details?: ICodingScoreBreakdown | IMCQScoreBreakdown | IWrittenScoreBreakdown;
}

export interface ISubmissionScoreResponse {
  success: boolean;
  message: string;
  data: ISubmissionScoreResult;
}

export interface ICodingScoreResponse {
  success: boolean;
  message: string;
  data: ICodingScoreBreakdown;
}

export interface IMCQScoreResponse {
  success: boolean;
  message: string;
  data: IMCQScoreBreakdown;
}

export interface IWrittenScoreResponse {
  success: boolean;
  message: string;
  data: IWrittenScoreBreakdown;
}
