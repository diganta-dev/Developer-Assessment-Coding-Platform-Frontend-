import apiClient from "@/lib/apiClient";
import type { IAttemptScoreResponse } from "@/types/evaluation.type";
import type {
  ICodingScoreResponse,
  IMCQScoreResponse,
  ISubmissionScoreResponse,
  IWrittenScoreResponse,
} from "@/types/score-calculation.type";

/**
 * 1. Get unified score breakdown for any submission (Coding, MCQ, Written)
 */
export function getSubmissionScore(
  submissionId: string,
): Promise<ISubmissionScoreResponse> {
  return apiClient(`score-calculation/submission/${submissionId}`, {
    method: "GET",
  });
}

/**
 * 2. Get granular Coding submission score breakdown (test cases, performance, marks)
 */
export function getCodingScoreBreakdown(
  submissionId: string,
): Promise<ICodingScoreResponse> {
  return apiClient(`score-calculation/coding/${submissionId}/score`, {
    method: "GET",
  });
}

/**
 * 3. Get granular MCQ submission score breakdown (options, selected, explanation)
 */
export function getMCQScoreBreakdown(
  submissionId: string,
): Promise<IMCQScoreResponse> {
  return apiClient(`score-calculation/mcq/${submissionId}/score`, {
    method: "GET",
  });
}

/**
 * 4. Get granular Written submission score breakdown (word limits, marks, evaluator feedback)
 */
export function getWrittenScoreBreakdown(
  submissionId: string,
): Promise<IWrittenScoreResponse> {
  return apiClient(`score-calculation/written/${submissionId}/score`, {
    method: "GET",
  });
}

/**
 * 5. Get aggregate attempt score and completion result
 */
export function getAttemptScore(
  attemptId: string,
): Promise<IAttemptScoreResponse> {
  return apiClient(`score-calculation/attempt/${attemptId}`, {
    method: "GET",
  });
}

/**
 * 6. Recalculate attempt score on demand
 */
export function recalculateAttemptScore(
  attemptId: string,
): Promise<IAttemptScoreResponse> {
  return apiClient(`score-calculation/attempt/${attemptId}`, {
    method: "POST",
  });
}
