import type { Difficulty, ProblemType } from "./question.type";

export type EvaluationType = "AUTOMATIC" | "MANUAL";

export type EvaluationStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "EXPIRED";

export interface IManualEvaluationPayload {
  marks: number;
  feedback?: string;
}

export interface IWrittenEvaluationPayload {
  marks: number;
  feedback?: string;
}

export interface IEvaluationFilterQuery {
  submissionId?: string;
  evaluatorId?: string;
  type?: EvaluationType;
  status?: EvaluationStatus;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IEvaluationListItem {
  id: string;
  submissionId: string;
  evaluatorId: string | null;
  type: EvaluationType;
  status: EvaluationStatus;
  marks: number;
  feedback: string | null;
  evaluatedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  submission: {
    id: string;
    attemptId: string;
    problemId: string;
    sourceCode?: string | null;
    language?: string | null;
    answerText?: string | null;
    selectedOptionId?: string | null;
    status: string;
    marks?: number | null;
    isCorrect?: boolean | null;
    submittedAt: string | Date;
    problem: {
      id: string;
      title: string;
      type: ProblemType;
      difficulty: Difficulty;
      marks: number;
    };
    attempt: {
      id: string;
      candidateId: string;
      status: string;
    };
  };
  evaluator: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface IEvaluationListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IEvaluationListResponse {
  success: boolean;
  message: string;
  meta: IEvaluationListMeta;
  data: IEvaluationListItem[];
}

export interface ISingleEvaluationResponse {
  success: boolean;
  message: string;
  data: IEvaluationListItem;
}

export interface IManualEvaluationResponse {
  success: boolean;
  message: string;
  data: IEvaluationListItem;
}

export interface ITestCaseExecutionResult {
  testCaseId: string;
  type: "PUBLIC" | "HIDDEN";
  passed: boolean;
  executionTimeMs: number;
  memoryUsedMb: number;
  judge0StatusId: number;
  judge0StatusDescription: string;
  expectedOutput?: string;
  actualOutput?: string | null;
  stderr?: string | null;
  compileOutput?: string | null;
  message?: string | null;
}

export interface ICodingEvaluationResult {
  submissionId: string;
  totalTestCases: number;
  passedTests: number;
  failedTests: number;
  executionTimeMs: number;
  memoryUsedMb: number;
  earnedMarks: number;
  totalMarks: number;
  isCorrect: boolean;
  status: string;
  testResults: ITestCaseExecutionResult[];
}

export interface ICodingEvaluationResponse {
  success: boolean;
  message: string;
  data: ICodingEvaluationResult;
}

export interface IMCQEvaluationResult {
  submissionId: string;
  problemId: string;
  selectedOptionId: string | null;
  selectedOptionText?: string | null;
  isCorrect?: boolean;
  earnedMarks?: number;
  totalMarks: number;
  status: string;
  correctOptionId?: string;
  explanation?: string | null;
  feedback?: string;
  evaluationId?: string;
}

export interface IMCQEvaluationResponse {
  success: boolean;
  message: string;
  data: IMCQEvaluationResult;
}

export interface IAttemptProblemScoreBreakdown {
  problemId: string;
  questionOrder: number;
  title: string;
  type: ProblemType;
  difficulty: Difficulty;
  maxMarks: number;
  obtainedMarks: number;
  isCorrect: boolean;
  submissionStatus: string;
  submissionId: string | null;
}

export interface IAttemptScoreResult {
  attemptId: string;
  assessmentId: string;
  candidateId: string;
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passingScore: number | null;
  isPassed: boolean;
  resultStatus: string;
  attemptStatus: string;
  isFullyEvaluated: boolean;
  totalProblems: number;
  evaluatedProblems: number;
  pendingProblems: number;
  breakdown: IAttemptProblemScoreBreakdown[];
  resultId?: string;
  calculatedAt: string | Date;
}

export interface IAttemptScoreResponse {
  success: boolean;
  message: string;
  data: IAttemptScoreResult;
}
