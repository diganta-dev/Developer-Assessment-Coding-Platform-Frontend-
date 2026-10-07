import {
  createSubmission,
  createSubmissionByAttempt,
  evaluateCodingSubmissionDirect,
  getAttemptSubmissions,
  getMySubmissions,
  getSubmissionById,
  submitSubmission,
  submitSubmissionById,
} from "@/api/submission.api";
import type { ICreateSubmissionPayload } from "@/types/assessment.type";
import type {
  ISubmissionFilterQuery,
  ISubmitSubmissionPayload,
} from "@/types/submission.type";
import { useMutation, useQuery } from "@tanstack/react-query";

/**
 * 1. Query candidate's submissions list
 */
export function useGetMySubmissions(query?: ISubmissionFilterQuery) {
  return useQuery({
    queryKey: ["my-submissions", query],
    queryFn: () => getMySubmissions(query),
  });
}

/**
 * 2. Query all submissions belonging to an attempt
 */
export function useGetAttemptSubmissions(attemptId?: string) {
  return useQuery({
    queryKey: ["attempt-submissions", attemptId],
    queryFn: () => getAttemptSubmissions(attemptId!),
    enabled: Boolean(attemptId),
  });
}

/**
 * 3. Query a single submission by its ID
 */
export function useGetSubmissionById(id?: string) {
  return useQuery({
    queryKey: ["submission-single", id],
    queryFn: () => getSubmissionById(id!),
    enabled: Boolean(id),
  });
}

/**
 * 4. Mutation to create or upsert a submission
 */
export function useCreateSubmission() {
  return useMutation({
    mutationFn: (payload: ICreateSubmissionPayload) =>
      createSubmission(payload),
  });
}

/**
 * 5. Mutation to create or upsert a submission via attemptId
 */
export function useCreateSubmissionByAttempt(attemptId: string) {
  return useMutation({
    mutationFn: (payload: Omit<ICreateSubmissionPayload, "attemptId">) =>
      createSubmissionByAttempt(attemptId, payload),
  });
}

/**
 * 6. Mutation to finalize and submit a submission
 */
export function useSubmitSubmission() {
  return useMutation({
    mutationFn: (payload: ISubmitSubmissionPayload) =>
      submitSubmission(payload),
  });
}

/**
 * 7. Mutation to finalize and submit a submission by ID
 */
export function useSubmitSubmissionById(id: string) {
  return useMutation({
    mutationFn: (payload?: Partial<ISubmitSubmissionPayload>) =>
      submitSubmissionById(id, payload),
  });
}

/**
 * 8. Mutation to run direct coding evaluation
 */
export function useEvaluateCodingSubmissionDirect() {
  return useMutation({
    mutationFn: (id: string) => evaluateCodingSubmissionDirect(id),
  });
}
