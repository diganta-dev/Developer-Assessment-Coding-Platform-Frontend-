import apiClient from "@/lib/apiClient";
import type { ICodingEvaluationResponse } from "@/types/evaluation.type";
import type {
  ICreateSubmissionPayload,
} from "@/types/assessment.type";
import type {
  IDirectSubmissionResponse,
  ISingleSubmissionResponse,
  ISubmissionFilterQuery,
  ISubmissionListResponse,
  ISubmitSubmissionPayload,
  ISubmitSubmissionResponse,
} from "@/types/submission.type";

/**
 * 1. Create or upsert a problem submission (attemptId in payload)
 */
export function createSubmission(
  payload: ICreateSubmissionPayload,
): Promise<IDirectSubmissionResponse> {
  return apiClient("submission", {
    method: "POST",
    body: payload,
  });
}

/**
 * 2. Create or upsert a problem submission via attempt URL param
 */
export function createSubmissionByAttempt(
  attemptId: string,
  payload: Omit<ICreateSubmissionPayload, "attemptId">,
): Promise<IDirectSubmissionResponse> {
  return apiClient(`submission/attempts/${attemptId}`, {
    method: "POST",
    body: payload,
  });
}

/**
 * 3. Finalize and submit submission (with payload)
 */
export function submitSubmission(
  payload: ISubmitSubmissionPayload,
): Promise<ISubmitSubmissionResponse> {
  return apiClient("submission/submit", {
    method: "POST",
    body: payload,
  });
}

/**
 * 4. Finalize and submit submission by submission ID
 */
export function submitSubmissionById(
  id: string,
  payload?: Partial<ISubmitSubmissionPayload>,
): Promise<ISubmitSubmissionResponse> {
  return apiClient(`submission/${id}/submit`, {
    method: "POST",
    body: payload || {},
  });
}

/**
 * 5. Run automated code evaluation on submission
 */
export function evaluateCodingSubmissionDirect(
  id: string,
): Promise<ICodingEvaluationResponse> {
  return apiClient(`submission/${id}/evaluate`, {
    method: "POST",
  });
}

/**
 * 6. Get candidate's personal submissions with filters and pagination
 */
export function getMySubmissions(
  query?: ISubmissionFilterQuery,
): Promise<ISubmissionListResponse> {
  return apiClient("submission/my-submissions", {
    method: "GET",
    query,
  });
}

/**
 * 7. Get all submissions for a specific attempt
 */
export function getAttemptSubmissions(
  attemptId: string,
): Promise<{ success: boolean; message: string; data: import("@/types/submission.type").ISubmissionItem[] }> {
  return apiClient(`submission/attempts/${attemptId}`, {
    method: "GET",
  });
}

/**
 * 8. Get single submission by ID
 */
export function getSubmissionById(
  id: string,
): Promise<ISingleSubmissionResponse> {
  return apiClient(`submission/${id}`, {
    method: "GET",
  });
}
