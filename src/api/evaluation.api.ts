import apiClient from "@/lib/apiClient";
import type {
  IAttemptScoreResponse,
  ICodingEvaluationResponse,
  IEvaluationFilterQuery,
  IEvaluationListResponse,
  IManualEvaluationPayload,
  IManualEvaluationResponse,
  IMCQEvaluationResponse,
  ISingleEvaluationResponse,
  IWrittenEvaluationPayload,
} from "@/types/evaluation.type";

/**
 * 1. Query evaluations list with filters and pagination
 */
export function getAllEvaluations(
  query?: IEvaluationFilterQuery,
): Promise<IEvaluationListResponse> {
  return apiClient("evaluation", {
    method: "GET",
    query,
  });
}

/**
 * 2. Query single evaluation by ID
 */
export function getEvaluationById(
  id: string,
): Promise<ISingleEvaluationResponse> {
  return apiClient(`evaluation/${id}`, {
    method: "GET",
  });
}

/**
 * 3. Submit manual evaluation / grading for a candidate submission
 */
export function manualEvaluateSubmission(
  submissionId: string,
  payload: IManualEvaluationPayload,
): Promise<IManualEvaluationResponse> {
  return apiClient(`evaluation/manual/${submissionId}`, {
    method: "POST",
    body: payload,
  });
}

/**
 * 4. Trigger automated Judge0 coding evaluation
 */
export function evaluateCodingSubmission(
  submissionId: string,
): Promise<ICodingEvaluationResponse> {
  return apiClient(`evaluation/coding/${submissionId}`, {
    method: "POST",
  });
}

/**
 * 5. Trigger automated MCQ evaluation
 */
export function evaluateMCQSubmission(
  submissionId: string,
): Promise<IMCQEvaluationResponse> {
  return apiClient(`evaluation/mcq/${submissionId}`, {
    method: "POST",
  });
}

/**
 * 6. Evaluate written question submission
 */
export function evaluateWrittenSubmission(
  submissionId: string,
  payload?: IWrittenEvaluationPayload,
): Promise<IManualEvaluationResponse> {
  return apiClient(`evaluation/written/${submissionId}`, {
    method: "POST",
    body: payload || {},
  });
}

/**
 * 7. Recalculate and aggregate total attempt evaluation score
 */
export function calculateAttemptEvaluationScore(
  attemptId: string,
): Promise<IAttemptScoreResponse> {
  return apiClient(`evaluation/attempt/${attemptId}/score`, {
    method: "POST",
  });
}
