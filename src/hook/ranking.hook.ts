import { useMutation, useQuery } from "@tanstack/react-query";
import {
  calculateCandidateRank,
  generateAssessmentResult,
  getAssessmentLeaderboard,
  getCandidateAttemptResult,
  getMyAssessmentResults,
  publishAssessmentResult,
} from "@/api/ranking.api";
import type { IRankingFilterQuery } from "@/types/ranking.type";

/**
 * Pure mutation hook: Generate/finalize assessment result for attempt
 */
export function useGenerateAssessmentResult() {
  return useMutation({
    mutationFn: (attemptId: string) => generateAssessmentResult(attemptId),
  });
}

/**
 * Pure query hook: Calculate candidate competitive rank and percentile
 */
export function useCalculateCandidateRank(attemptId: string, enabled = true) {
  return useQuery({
    queryKey: ["candidate-rank", attemptId],
    queryFn: () => calculateCandidateRank(attemptId),
    enabled: Boolean(attemptId) && enabled,
    refetchInterval: false,
  });
}

/**
 * Pure query hook: Fetch assessment leaderboard and ranking
 */
export function useGetRankingLeaderboard(
  assessmentId: string,
  query?: IRankingFilterQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: ["ranking-leaderboard", assessmentId, query],
    queryFn: () => getAssessmentLeaderboard(assessmentId, query),
    enabled: Boolean(assessmentId) && enabled,
    refetchInterval: false,
  });
}

/**
 * Pure mutation hook: Publish assessment results
 */
export function usePublishAssessmentResults() {
  return useMutation({
    mutationFn: (assessmentId: string) => publishAssessmentResult(assessmentId),
  });
}

/**
 * Pure query hook: Fetch all results for current authenticated candidate
 */
export function useGetMyResults() {
  return useQuery({
    queryKey: ["my-results-portfolio"],
    queryFn: () => getMyAssessmentResults(),
  });
}

/**
 * Pure query hook: Fetch candidate result by attempt ID
 */
export function useGetCandidateAttemptResult(
  attemptId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["candidate-attempt-result", attemptId],
    queryFn: () => getCandidateAttemptResult(attemptId),
    enabled: Boolean(attemptId) && enabled,
    refetchInterval: false,
  });
}
