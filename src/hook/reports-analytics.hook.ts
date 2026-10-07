import {
  getAssessmentReport,
  getAssessmentStatistics,
  getCandidatePerformance,
  getCandidateReport,
  getCompanyReport,
  getPassFailStatistics,
  getScoreDistribution,
} from "@/api/reports-analytics.api";
import { useQuery } from "@tanstack/react-query";

/**
 * 1. Query comprehensive assessment report
 */
export function useGetAssessmentReport(assessmentId?: string) {
  return useQuery({
    queryKey: ["reports-assessment", assessmentId],
    queryFn: () => getAssessmentReport(assessmentId!),
    enabled: Boolean(assessmentId),
  });
}

/**
 * 2. Query score frequency distribution
 */
export function useGetScoreDistribution(assessmentId?: string) {
  return useQuery({
    queryKey: ["reports-score-distribution", assessmentId],
    queryFn: () => getScoreDistribution(assessmentId!),
    enabled: Boolean(assessmentId),
  });
}

/**
 * 3. Query pass/fail breakdown
 */
export function useGetPassFailStatistics(assessmentId?: string) {
  return useQuery({
    queryKey: ["reports-pass-fail", assessmentId],
    queryFn: () => getPassFailStatistics(assessmentId!),
    enabled: Boolean(assessmentId),
  });
}

/**
 * 4. Query assessment operational statistics
 */
export function useGetAssessmentStatistics(assessmentId?: string) {
  return useQuery({
    queryKey: ["reports-assessment-statistics", assessmentId],
    queryFn: () => getAssessmentStatistics(assessmentId!),
    enabled: Boolean(assessmentId),
  });
}

/**
 * 5. Query candidate attempt diagnostic & cohort benchmark
 */
export function useGetCandidatePerformance(attemptId?: string) {
  return useQuery({
    queryKey: ["reports-candidate-performance", attemptId],
    queryFn: () => getCandidatePerformance(attemptId!),
    enabled: Boolean(attemptId),
  });
}

/**
 * 6. Query candidate career report
 */
export function useGetCandidateReport(candidateId?: string) {
  return useQuery({
    queryKey: ["reports-candidate-career", candidateId],
    queryFn: () => getCandidateReport(candidateId!),
    enabled: Boolean(candidateId),
  });
}

/**
 * 7. Query organization executive recruitment report
 */
export function useGetCompanyReport(companyId?: string) {
  return useQuery({
    queryKey: ["reports-company", companyId],
    queryFn: () => getCompanyReport(companyId!),
    enabled: Boolean(companyId),
  });
}
