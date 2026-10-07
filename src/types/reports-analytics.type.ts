import type { Difficulty, ProblemType } from "./question.type";

export interface IQuestionPerformanceStat {
  problemId: string;
  title: string;
  type: ProblemType;
  difficulty: Difficulty;
  maxMarks: number;
  totalSubmissions: number;
  correctSubmissions: number;
  averageScore: number;
  accuracyRate: number;
}

export interface IScoreDistributionBucket {
  range: string;
  minPercent: number;
  maxPercent: number;
  count: number;
  percentageOfTotal: number;
}

export interface IAntiCheatSummary {
  totalEvents: number;
  flaggedCandidatesCount: number;
  eventBreakdown: Record<string, number>;
}

export interface IAssessmentReportResponse {
  reportId: string;
  assessmentId: string;
  assessmentTitle: string;
  companyId: string;
  companyName: string;
  status: string;
  durationMinutes: number;
  totalMarks: number;
  passingScore: number | null;
  totalCandidates: number;
  invitedCandidates: number;
  startedCandidates: number;
  completedCandidates: number;
  completionRate: number;
  passedCandidates: number;
  failedCandidates: number;
  passRate: number;
  failRate: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  medianScore: number;
  scoreDistribution: IScoreDistributionBucket[];
  questionPerformance: IQuestionPerformanceStat[];
  antiCheatStatistics: IAntiCheatSummary;
  generatedAt: string | Date;
  updatedAt: string | Date;
}

export interface IScoreDistribution {
  assessmentId: string;
  assessmentTitle: string;
  totalEvaluated: number;
  mean: number;
  median: number;
  standardDeviation: number;
  highestScore: number;
  lowestScore: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
  buckets: IScoreDistributionBucket[];
}

export interface IPassFailStatistics {
  assessmentId: string;
  assessmentTitle: string;
  passingScoreThreshold: number;
  passingScoreType: "CONFIGURED" | "DEFAULT_PERCENTAGE";
  totalEvaluated: number;
  passedCount: number;
  failedCount: number;
  passRate: number;
  failRate: number;
  averagePassedScore: number;
  averageFailedScore: number;
  nearMissCandidatesCount: number;
}

export interface IDifficultyDistribution {
  difficulty: Difficulty;
  problemCount: number;
  totalMarks: number;
  averageEarnedMarks: number;
  averageAccuracyRate: number;
}

export interface IAssessmentStatistics {
  assessmentId: string;
  assessmentTitle: string;
  durationMinutes: number;
  totalMarks: number;
  passingScore: number | null;
  attemptsByStatus: Record<string, number>;
  averageTimeTakenSeconds: number;
  fastestTimeTakenSeconds: number | null;
  slowestTimeTakenSeconds: number | null;
  totalSubmissions: number;
  submissionsByType: Record<string, number>;
  difficultyDistribution: IDifficultyDistribution[];
}

export interface ICohortBenchmark {
  cohortSize: number;
  cohortAverageScore: number;
  cohortAveragePercentage: number;
  cohortHighestScore: number;
  candidateScoreDiffFromAverage: number;
  percentileRank: number;
}

export interface IAttemptQuestionDiagnostic {
  problemId: string;
  title: string;
  type: ProblemType;
  difficulty: Difficulty;
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  isCorrect: boolean;
  submissionStatus: string;
  executionTimeMs?: number | null;
  memoryUsedMb?: number | null;
  feedback?: string | null;
}

export interface ICandidatePerformanceDiagnostic {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  rank: number | null;
  status: string;
  attemptStatus: string;
  timeTakenSeconds: number | null;
  durationMinutesAllocated: number;
  timeUtilizationPercentage: number;
  cohortBenchmark: ICohortBenchmark;
  questionDiagnostics: IAttemptQuestionDiagnostic[];
  antiCheatAuditTrail: Array<{
    id: string;
    type: string;
    metadata: Record<string, unknown>;
    occurredAt: string | Date;
  }>;
  antiCheatFlagged: boolean;
}

export interface ICompanyAssessmentMetric {
  assessmentId: string;
  title: string;
  status: string;
  createdAt: string | Date;
  totalCandidates: number;
  completedCandidates: number;
  averageScore: number;
  passRate: number;
}

export interface ICompanyReportResponse {
  companyId: string;
  companyName: string;
  slug: string;
  email: string;
  logoUrl: string | null;
  website: string | null;
  totalAssessmentsCreated: number;
  totalCandidatesInvited: number;
  totalCandidatesStarted: number;
  totalCandidatesCompleted: number;
  totalCandidatesPassed: number;
  companyAverageScore: number;
  overallHiringPassRate: number;
  talentPipelineFunnel: {
    invited: number;
    started: number;
    completed: number;
    passed: number;
    dropOffRate: number;
  };
  assessmentBreakdown: ICompanyAssessmentMetric[];
}

export interface ICandidateReportResponse {
  candidateId: string;
  name: string;
  email: string;
  profilePictureUrl: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  resumeUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  totalAssessmentsAttempted: number;
  totalCompleted: number;
  totalPassed: number;
  totalFailed: number;
  averagePercentage: number;
  highestPercentage: number;
  overallPassRate: number;
  skillMastery: Array<{
    problemType: ProblemType;
    totalProblemsEncountered: number;
    attemptedCount: number;
    averageScorePercentage: number;
    accuracyRate: number;
  }>;
  assessmentHistory: Array<{
    attemptId: string;
    assessmentId: string;
    assessmentTitle: string;
    companyName: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    rank: number | null;
    status: string;
    attemptStatus: string;
    timeTakenSeconds: number | null;
    submittedAt: string | Date | null;
    isPublished: boolean;
  }>;
  totalAntiCheatViolations: number;
}

// Wrapped response types
export interface IAssessmentReportApiResponse {
  success: boolean;
  message: string;
  data: IAssessmentReportResponse;
}

export interface IScoreDistributionApiResponse {
  success: boolean;
  message: string;
  data: IScoreDistribution;
}

export interface IPassFailStatisticsApiResponse {
  success: boolean;
  message: string;
  data: IPassFailStatistics;
}

export interface IAssessmentStatisticsApiResponse {
  success: boolean;
  message: string;
  data: IAssessmentStatistics;
}

export interface ICandidatePerformanceApiResponse {
  success: boolean;
  message: string;
  data: ICandidatePerformanceDiagnostic;
}

export interface ICompanyReportApiResponse {
  success: boolean;
  message: string;
  data: ICompanyReportResponse;
}

export interface ICandidateReportApiResponse {
  success: boolean;
  message: string;
  data: ICandidateReportResponse;
}
