import type { IPaginationMeta } from "./question.type";

export interface IProctoringSettings {
  trackTabSwitches: boolean;
  maxTabSwitches: number;
  requireFullscreen: boolean;
  blockCopyPaste: boolean;
  trackFocusLoss: boolean;
}

export interface ICreateAssessmentPayload {
  title: string;
  description: string;
  totalMarks: number;
  passMarks: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  allowedAttempts: number;
  isStrictTimeLimit: boolean;
  proctoringSettings: IProctoringSettings;
}

export interface IAssessment {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passMarks: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  allowedAttempts: number;
  isStrictTimeLimit: boolean;
  proctoringSettings?: IProctoringSettings;
  companyId?: string;
  createdById?: string;
  status?: "DRAFT" | "PUBLISHED" | "ACTIVE" | "EXPIRED" | "ARCHIVED" | string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    problems?: number;
    candidates?: number;
    submissions?: number;
    questions?: number;
  };
  problems?: unknown[];
  questions?: unknown[];
  submissions?: unknown[];
}

export interface IAssessmentFilters {
  searchTerm?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IAssessmentListResponse {
  data: IAssessment[];
  meta?: IPaginationMeta;
  success?: boolean;
  message?: string;
}
export interface IAssessmentProblem {
  problemId: string;
  marks: number;
  questionOrder: number;
}

export interface IAddProblemInAssessment {
  problems: IAssessmentProblem[];
}

export interface IInviteCandidatePayload {
  emails: string[];
}

export interface IInviteCandidateResponse {
  success?: boolean;
  message?: string;
  data?: {
    invitedCount?: number;
    failedCount?: number;
    invitations?: unknown[];
  };
}