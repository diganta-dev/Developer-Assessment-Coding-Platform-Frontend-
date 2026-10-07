import type {
  ICreateSubmissionPayload,
  ICreateSubmissionResponse,
} from "./assessment.type";
import type { Difficulty, ProblemType } from "./question.type";

export type SubmissionStatus =
  | "PENDING"
  | "RUNNING"
  | "PASSED"
  | "FAILED"
  | "ERROR"
  | "EVALUATED";

export interface ISubmitSubmissionPayload {
  submissionId?: string;
  attemptId?: string;
  problemId?: string;
  selectedOptionId?: string | null;
  answerText?: string | null;
  sourceCode?: string | null;
  language?: string | null;
}

export interface ISubmissionFilterQuery {
  assessmentId?: string;
  attemptId?: string;
  problemId?: string;
  status?: SubmissionStatus;
  isCorrect?: boolean;
  searchTerm?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ISubmissionItem {
  id: string;
  attemptId: string;
  problemId: string;
  sourceCode?: string | null;
  language?: string | null;
  answerText?: string | null;
  selectedOptionId?: string | null;
  status: SubmissionStatus;
  executionTimeMs?: number | null;
  memoryUsedMb?: number | null;
  passedTests: number;
  failedTests: number;
  marks?: number | null;
  isCorrect?: boolean | null;
  submittedAt: string | Date;
  problem?: {
    id: string;
    title: string;
    type: ProblemType;
    difficulty: Difficulty;
    marks: number;
  };
  attempt?: {
    id: string;
    candidateId: string;
    status: string;
    assessmentId: string;
    assessment?: {
      id: string;
      title: string;
    };
  };
}

export interface ISubmissionListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ISubmissionListResponse {
  success: boolean;
  message: string;
  meta: ISubmissionListMeta;
  data: ISubmissionItem[];
}

export interface ISingleSubmissionResponse {
  success: boolean;
  message: string;
  data: ISubmissionItem;
}

export interface IDirectSubmissionResponse {
  success: boolean;
  message: string;
  data: ISubmissionItem;
}

export interface ISubmitSubmissionResponse {
  success: boolean;
  message: string;
  data: ISubmissionItem;
}
