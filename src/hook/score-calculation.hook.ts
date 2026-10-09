import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAttemptScore,
  getCodingScoreBreakdown,
  getMCQScoreBreakdown,
  getSubmissionScore,
  getWrittenScoreBreakdown,
  recalculateAttemptScore,
} from "@/api/score-calculation.api";

/**
 * 1. Query unified submission score breakdown
 */
export function useGetSubmissionScore(submissionId?: string) {
  return useQuery({
    queryKey: ["score-calculation-submission", submissionId],
    queryFn: () => getSubmissionScore(submissionId!),
    enabled: Boolean(submissionId),
  });
}

/**
 * 2. Query granular coding score breakdown
 */
export function useGetCodingScoreBreakdown(submissionId?: string) {
  return useQuery({
    queryKey: ["score-calculation-coding", submissionId],
    queryFn: () => getCodingScoreBreakdown(submissionId!),
    enabled: Boolean(submissionId),
  });
}

/**
 * 3. Query granular MCQ score breakdown
 */
export function useGetMCQScoreBreakdown(submissionId?: string) {
  return useQuery({
    queryKey: ["score-calculation-mcq", submissionId],
    queryFn: () => getMCQScoreBreakdown(submissionId!),
    enabled: Boolean(submissionId),
  });
}

/**
 * 4. Query granular written question score breakdown
 */
export function useGetWrittenScoreBreakdown(submissionId?: string) {
  return useQuery({
    queryKey: ["score-calculation-written", submissionId],
    queryFn: () => getWrittenScoreBreakdown(submissionId!),
    enabled: Boolean(submissionId),
  });
}

/**
 * 5. Query aggregate score breakdown for an entire attempt
 */
export function useGetAttemptScore(attemptId?: string) {
  return useQuery({
    queryKey: ["score-calculation-attempt", attemptId],
    queryFn: () => getAttemptScore(attemptId!),
    enabled: Boolean(attemptId),
  });
}

/**
 * 6. Mutation to trigger score recalculation for an attempt
 */
export function useRecalculateAttemptScore() {
  return useMutation({
    mutationFn: (attemptId: string) => recalculateAttemptScore(attemptId),
  });
}
