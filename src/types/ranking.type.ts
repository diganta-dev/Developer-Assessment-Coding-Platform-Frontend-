export interface IResultBreakdownProblem {
  problemId: string;
  title: string;
  type: string;
  maxMarks: number;
  obtainedMarks: number;
  isCorrect: boolean;
  status: string;
}

export interface IAssessmentResultData {
  resultId: string;
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passingScore: number | null;
  status: "PASSED" | "FAILED";
  rank: number | null;
  totalParticipants: number;
  attemptStatus: string;
  isFullyEvaluated: boolean;
  timeTakenSeconds: number | null;
  startedAt: string | Date | null;
  submittedAt: string | Date | null;
  publishedAt: string | Date | null;
  isPublished: boolean;
  breakdown?: IResultBreakdownProblem[];
}

export interface IAssessmentResultResponse {
  success: boolean;
  message: string;
  data: IAssessmentResultData;
}

export interface ICandidateRankResult {
  attemptId: string;
  assessmentId: string;
  candidateId: string;
  candidateName: string;
  rank: number;
  totalParticipants: number;
  obtainedMarks: number;
  percentage: number;
  timeTakenSeconds: number | null;
  status: "PASSED" | "FAILED";
  percentile: number;
}

export interface ICandidateRankResponse {
  success: boolean;
  message: string;
  data: ICandidateRankResult;
}

export interface IRankedParticipant {
  rank: number;
  attemptId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar?: string | null;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  timeTakenSeconds: number | null;
  status: "PASSED" | "FAILED";
  submittedAt: string | Date | null;
  attemptStatus: string;
}

export interface IAssessmentLeaderboardData {
  assessmentId: string;
  assessmentTitle: string;
  totalParticipants: number;
  totalMarks: number;
  passingScore: number | null;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passingRate: number;
  isPublished: boolean;
  publishedAt: string | Date | null;
  rankings: IRankedParticipant[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IAssessmentLeaderboardResponse {
  success: boolean;
  message: string;
  data: IAssessmentLeaderboardData;
}

export interface IPublishResultData {
  assessmentId: string;
  assessmentTitle: string;
  publishedAt: string | Date;
  totalAttempts: number;
  totalEvaluated: number;
  passedCount: number;
  failedCount: number;
  averageScore: number;
  passingRate: number;
}

export interface IPublishResultResponse {
  success: boolean;
  message: string;
  data: IPublishResultData;
}

export interface IRankingFilterQuery {
  page?: number | string;
  limit?: number | string;
  searchTerm?: string;
  status?: "PASSED" | "FAILED";
  sortBy?: "rank" | "marks" | "time" | "submittedAt";
  sortOrder?: "asc" | "desc";
}

export interface IMyResultsResponse {
  success: boolean;
  message: string;
  data: IAssessmentResultData[];
}
