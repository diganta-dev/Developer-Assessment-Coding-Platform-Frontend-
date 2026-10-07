import type { Difficulty, IPaginationMeta, ProblemType } from "./question.type";

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
  passingScore?: number;
  durationMinutes: number;
  startDate: string;
  endDate: string;
  allowedAttempts: number;
  isStrictTimeLimit: boolean;
  proctoringSettings: IProctoringSettings;
}

export interface IAssessment {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingScore?: number | null;
  durationMinutes: number;
  startDate?: string;
  endDate?: string;
  allowedAttempts: number;
  isStrictTimeLimit: boolean;
  proctoringSettings?: IProctoringSettings;
  companyId?: string;
  createdById?: string;
  status?: "DRAFT" | "PUBLISHED" | "ACTIVE" | "EXPIRED" | "ARCHIVED" | string;
  settings?: {
    maxAttempts?: number;
    autoSubmitOnExpiry?: boolean;
    [key: string]: unknown;
  };
  creator?: {
    id?: string;
    name?: string;
    email?: string;
    [key: string]: unknown;
  };
  company?: {
    id?: string;
    name?: string;
    [key: string]: unknown;
  };
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

export interface ICandidateAttemptSummary {
  id: string;
  attemptNumber: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "EXPIRED" | string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  startedAt?: string | null;
  submittedAt?: string | null;
}

export interface IAssessmentInvitationCandidate {
  id: string;
  name?: string | null;
  email: string;
  profilePictureUrl?: string | null;
  assessmentAttempts?: ICandidateAttemptSummary[];
}

export interface IAssessmentInvitation {
  id: string;
  assessmentId: string;
  candidateId: string;
  email?: string;
  candidateEmail?: string;
  token: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "DECLINED" | string;
  invitedAt: string;
  acceptedAt?: string | null;
  expiresAt?: string | null;
  candidate?: IAssessmentInvitationCandidate | null;
}

export interface IAssessmentInvitationsResponse {
  success?: boolean;
  message?: string;
  data: IAssessmentInvitation[];
}

export interface IVerifyInvitationResponse {
  success?: boolean;
  message?: string;
  data?: {
    invitation: {
      id: string;
      status: string;
      email: string;
      token: string;
      invitedAt: string;
      expiresAt?: string | null;
      isExpired: boolean;
    };
    assessment: IAssessment;
    candidate?: {
      id: string;
      name?: string | null;
      email: string;
    } | null;
  };
}

export interface IStartAttemptPayload {
  invitationToken?: string;
}

export type StartAttemptParams =
  | string
  | {
      assessmentId: string;
      invitationToken?: string;
      payload?: IStartAttemptPayload;
    };

export interface IAssessmentAttempt {
  id: string;
  assessmentId: string;
  candidateId: string;
  attemptNumber: number;
  status:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "EXPIRED"
    | "EVALUATED"
    | string;
  startedAt?: string | null;
  submittedAt?: string | null;
  expiresAt?: string | null;
  totalMarks: number;
  obtainedMarks?: number | null;
  percentage?: number | null;
  submissions?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ISanitizedProblemOption {
  id: string;
  optionText: string;
  optionOrder: number;
}

export interface ISanitizedProblemTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  type: "PUBLIC" | string;
}

export interface ISanitizedAssessmentProblem {
  id: string;
  questionOrder: number;
  problem: {
    id: string;
    title: string;
    description: string;
    type: "MCQ" | "CODING" | "WRITTEN" | string;
    difficulty: string;
    marks: number;
    mcqQuestion?: {
      id: string;
      options: ISanitizedProblemOption[];
    } | null;
    codingQuestion?: {
      id: string;
      testCases: ISanitizedProblemTestCase[];
    } | null;
    writtenQuestion?: unknown | null;
  };
}

export interface IStartAttemptData {
  isResume: boolean;
  attempt: IAssessmentAttempt;
  remainingSeconds: number | null;
  assessment: IAssessment & {
    problems?: ISanitizedAssessmentProblem[];
  };
}

export interface IStartAttemptResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IStartAttemptData;
}

export interface ISubmitAnswerItem {
  problemId: string;
  selectedOptionId?: string;
  answerText?: string;
  sourceCode?: string;
  language?: string;
}

export interface ISubmitAttemptPayload {
  answers?: ISubmitAnswerItem[];
}

export interface ISubmitAttemptResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?:
    | (IAssessmentAttempt & {
        submissions?: IAttemptSubmissionItem[];
        result?: {
          id: string;
          totalMarks: number;
          obtainedMarks: number;
          percentage: number;
          passingScore?: number | null;
          rank?: number | null;
          status: string;
          publishedAt?: string | null;
        } | null;
      })
    | {
        attempt: IAssessmentAttempt;
        evaluatedAnswersCount?: number;
        totalMarksObtained?: number;
      };
}

export interface IAttemptSubmissionItem {
  id: string;
  attemptId?: string;
  problemId: string;
  selectedOptionId?: string | null;
  answerText?: string | null;
  sourceCode?: string | null;
  language?: string | null;
  status?: string;
  obtainedMarks?: number | null;
  isCorrect?: boolean | null;
  feedback?: string | null;
  submittedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAttemptCandidateInfo {
  id: string;
  name?: string | null;
  email: string;
}

export interface IAttemptDetailedItem extends IAssessmentAttempt {
  assessment?: IAssessment & {
    problems?: ISanitizedAssessmentProblem[];
    settings?: Record<string, unknown> | null;
    company?: {
      id: string;
      name: string;
      slug?: string;
      logoUrl?: string | null;
    };
  };
  candidate?: IAttemptCandidateInfo | null;
  submissions?: IAttemptSubmissionItem[];
  result?: {
    id: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    passingScore?: number | null;
    rank?: number | null;
    status: string;
    publishedAt?: string | null;
  } | null;
}

export interface IAttemptDetailsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    attempt: IAttemptDetailedItem;
    remainingSeconds: number | null;
    assessment?: IAssessment & {
      problems?: ISanitizedAssessmentProblem[];
      settings?: Record<string, unknown> | null;
      company?: {
        id: string;
        name: string;
        slug?: string;
        logoUrl?: string | null;
      };
    };
  };
}

export interface ICandidateAttemptItem extends IAssessmentAttempt {
  assessment: {
    id: string;
    title: string;
    durationMinutes: number;
    totalMarks: number;
    passingScore?: number | null;
    company?: {
      id: string;
      name: string;
      slug?: string;
      logoUrl?: string | null;
    };
  };
  result?: {
    id: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    passingScore?: number | null;
    rank?: number | null;
    status: string;
    publishedAt?: string | null;
  } | null;
  _count?: {
    submissions: number;
  };
}

export interface ICandidateMyAttemptsFilters {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ICandidateMyAttemptsResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: ICandidateAttemptItem[];
}

export interface IAttemptResultCandidateSubmission {
  id: string;
  selectedOptionId?: string | null;
  answerText?: string | null;
  sourceCode?: string | null;
  language?: string | null;
  status?: string | null;
  marksObtained?: number | null;
  isCorrect?: boolean | null;
  submittedAt?: string | null;
  evaluations?: Array<{
    id: string;
    marksAwarded: number;
    feedback?: string | null;
    evaluatorId?: string;
  }>;
}

export interface IAttemptResultProblemBreakdown {
  problemId: string;
  title: string;
  type: ProblemType | string;
  difficulty: Difficulty | string;
  marksAllocated: number;
  questionOrder: number;
  mcqDetails?: {
    options: Array<{
      id: string;
      optionText: string;
      optionOrder: number;
      isCorrect?: boolean;
    }>;
    explanation?: string;
  } | null;
  codingDetails?: {
    supportedLanguages: string[];
    timeLimitMs?: number;
    memoryLimitMb?: number;
    publicTestCases?: Array<{
      input: string;
      expectedOutput: string;
    }>;
  } | null;
  writtenDetails?: {
    wordLimit?: number;
    expectedAnswer?: string;
  } | null;
  candidateSubmission?: IAttemptResultCandidateSubmission | null;
}

export interface IAttemptResultData {
  isPublished: boolean;
  message?: string;
  candidate?: {
    id: string;
    name?: string | null;
    email: string;
    profilePictureUrl?: string | null;
  } | null;
  assessment?: {
    id: string;
    title: string;
    totalMarks: number;
    passingScore?: number | null;
    company?: {
      id: string;
      name: string;
      slug?: string;
      logoUrl?: string | null;
    } | null;
  } | null;
  attempt?: {
    id: string;
    attemptNumber?: number;
    status: string;
    startedAt?: string | null;
    submittedAt?: string | null;
    durationMinutes?: number | null;
    assessmentTitle?: string;
  } | null;
  result?: {
    id: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    passingScore?: number | null;
    rank?: number | null;
    status: string;
    publishedAt?: string | null;
  } | null;
  problemBreakdown?: IAttemptResultProblemBreakdown[];
}

export interface IAttemptResultResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IAttemptResultData;
}

export type AntiCheatEventType =
  | "TAB_SWITCH"
  | "COPY"
  | "PASTE"
  | "FULLSCREEN_EXIT"
  | "MULTIPLE_TAB"
  | "WINDOW_BLUR";

export interface IAntiCheatEvent {
  id: string;
  attemptId?: string;
  type: AntiCheatEventType | string;
  metadata?: Record<string, unknown> | null;
  occurredAt: string;
}

export interface IAntiCheatAuditData {
  totalViolations: number;
  summary: Record<string, number>;
  events: IAntiCheatEvent[];
}

export interface IDetailedReportSubmissionEvaluation {
  id: string;
  marksAwarded: number;
  feedback?: string | null;
  evaluatorId?: string;
  evaluator?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
}

export interface IDetailedReportSubmissionItem {
  id: string;
  attemptId?: string;
  problemId: string;
  selectedOptionId?: string | null;
  answerText?: string | null;
  sourceCode?: string | null;
  language?: string | null;
  status: string;
  executionTimeMs?: number | null;
  memoryUsedMb?: number | null;
  passedTests?: number;
  failedTests?: number;
  executionResult?: Record<string, unknown> | null;
  marks?: number | null;
  isCorrect?: boolean | null;
  submittedAt: string;
  evaluations?: IDetailedReportSubmissionEvaluation[];
}

export interface IDetailedAssessmentReportData {
  candidate: {
    id: string;
    name?: string | null;
    email: string;
    profile?: {
      id?: string;
      title?: string | null;
      bio?: string | null;
      skills?: string[];
      resumeUrl?: string | null;
      githubUrl?: string | null;
      linkedinUrl?: string | null;
      portfolioUrl?: string | null;
      yearsOfExperience?: number | null;
      [key: string]: unknown;
    } | null;
  };
  assessment: {
    id: string;
    title: string;
    totalMarks: number;
    passingScore?: number | null;
    durationMinutes: number;
    company?: {
      id: string;
      name: string;
      slug?: string;
      logoUrl?: string | null;
    } | null;
    problems?: ISanitizedAssessmentProblem[];
  };
  attempt: {
    id: string;
    attemptNumber: number;
    status: string;
    startedAt?: string | null;
    submittedAt?: string | null;
    durationMinutes?: number | null;
  };
  result?: {
    id: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    passingScore?: number | null;
    rank?: number | null;
    status: string;
    publishedAt?: string | null;
  } | null;
  antiCheat: IAntiCheatAuditData;
  submissions: IDetailedReportSubmissionItem[];
}

export interface IDetailedAssessmentReportResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IDetailedAssessmentReportData;
}

