import apiClient from "@/lib/apiClient";
import type {
  IAssessmentReportApiResponse,
  IAssessmentStatisticsApiResponse,
  ICandidatePerformanceApiResponse,
  ICandidateReportApiResponse,
  ICompanyReportApiResponse,
  IPassFailStatisticsApiResponse,
  IScoreDistributionApiResponse,
} from "@/types/reports-analytics.type";

/**
 * 1. Generate or retrieve comprehensive assessment report
 */
export function getAssessmentReport(
  assessmentId: string,
): Promise<IAssessmentReportApiResponse> {
  return apiClient(`reports-analytics/assessment/${assessmentId}/report`, {
    method: "GET",
  });
}

/**
 * 2. Get score distribution buckets and statistical variance
 */
export function getScoreDistribution(
  assessmentId: string,
): Promise<IScoreDistributionApiResponse> {
  return apiClient(
    `reports-analytics/assessment/${assessmentId}/score-distribution`,
    {
      method: "GET",
    },
  );
}

/**
 * 3. Get granular pass/fail statistics and near-miss metrics
 */
export function getPassFailStatistics(
  assessmentId: string,
): Promise<IPassFailStatisticsApiResponse> {
  return apiClient(`reports-analytics/assessment/${assessmentId}/pass-fail`, {
    method: "GET",
  });
}

/**
 * 4. Get operational assessment statistics and difficulty distribution
 */
export function getAssessmentStatistics(
  assessmentId: string,
): Promise<IAssessmentStatisticsApiResponse> {
  return apiClient(`reports-analytics/assessment/${assessmentId}/statistics`, {
    method: "GET",
  });
}

/**
 * 5. Get individual candidate attempt performance benchmark
 */
export function getCandidatePerformance(
  attemptId: string,
): Promise<ICandidatePerformanceApiResponse> {
  return apiClient(`reports-analytics/attempt/${attemptId}/performance`, {
    method: "GET",
  });
}

/**
 * 6. Generate candidate multi-assessment historical talent report
 */
export function getCandidateReport(
  candidateId: string,
): Promise<ICandidateReportApiResponse> {
  return apiClient(`reports-analytics/candidate/${candidateId}/report`, {
    method: "GET",
  });
}

/**
 * 7. Generate company recruitment pipeline & talent report
 */
export function getCompanyReport(
  companyId: string,
): Promise<ICompanyReportApiResponse> {
  return apiClient(`reports-analytics/company/${companyId}/report`, {
    method: "GET",
  });
}
