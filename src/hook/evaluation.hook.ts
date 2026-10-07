import { useMutation, useQuery } from "@tanstack/react-query";
import {
  calculateAttemptEvaluationScore,
  evaluateCodingSubmission,
  evaluateMCQSubmission,
  evaluateWrittenSubmission,
  getAllEvaluations,
  getEvaluationById,
  manualEvaluateSubmission,
} from "@/api/evaluation.api";
import type {
  IEvaluationFilterQuery,
  IManualEvaluationPayload,
  IWrittenEvaluationPayload,
} from "@/types/evaluation.type";

/**
 * Pure query hook: Fetch all evaluations with filters and pagination
 */
export function useGetAllEvaluations(query?: IEvaluationFilterQuery) {
  return useQuery({
    queryKey: ["evaluations", query],
    queryFn: () => getAllEvaluations(query),
  });
}

/**
 * Pure query hook: Fetch single evaluation by ID
 */
export function useGetEvaluationById(id: string, enabled = true) {
  return useQuery({
    queryKey: ["evaluation", id],
    queryFn: () => getEvaluationById(id),
    enabled: Boolean(id) && enabled,
    refetchInterval: false,
  });
}

/**
 * Pure mutation hook: Submit manual evaluation / score & feedback
 */
export function useManualEvaluateSubmission() {
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: IManualEvaluationPayload;
    }) => manualEvaluateSubmission(submissionId, payload),
  });
}

/**
 * Pure mutation hook: Trigger Judge0 automated coding evaluation
 */
export function useEvaluateCodingSubmission() {
  return useMutation({
    mutationFn: (submissionId: string) =>
      evaluateCodingSubmission(submissionId),
  });
}

/**
 * Pure mutation hook: Trigger automated MCQ evaluation
 */
export function useEvaluateMCQSubmission() {
  return useMutation({
    mutationFn: (submissionId: string) => evaluateMCQSubmission(submissionId),
  });
}

/**
 * Pure mutation hook: Trigger written evaluation
 */
export function useEvaluateWrittenSubmission() {
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload?: IWrittenEvaluationPayload;
    }) => evaluateWrittenSubmission(submissionId, payload),
  });
}

/**
 * Pure mutation hook: Recalculate attempt score
 */
export function useCalculateAttemptEvaluationScore() {
  return useMutation({
    mutationFn: (attemptId: string) =>
      calculateAttemptEvaluationScore(attemptId),
  });
}
