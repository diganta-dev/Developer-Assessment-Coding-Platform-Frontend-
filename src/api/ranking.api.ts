import apiClient from "@/lib/apiClient";
import type {
  IAssessmentLeaderboardResponse,
  IAssessmentResultResponse,
  ICandidateRankResponse,
  IMyResultsResponse,
  IPublishResultResponse,
  IRankingFilterQuery,
} from "@/types/ranking.type";

/**
 * 1. Generate / finalize result for a specific attempt
 */
export function generateAssessmentResult(
  attemptId: string,
): Promise<IAssessmentResultResponse> {
  return apiClient(`ranking-result/generate/${attemptId}`, {
    method: "POST",
  });
}

/**
 * 2. Calculate competitive rank & percentile for a candidate attempt
 */
export function calculateCandidateRank(
  attemptId: string,
): Promise<ICandidateRankResponse> {
  return apiClient(`ranking-result/rank/${attemptId}`, {
    method: "GET",
  });
}

/**
 * 3. Generate assessment ranking leaderboard with pagination and filters
 */
export function getAssessmentLeaderboard(
  assessmentId: string,
  query?: IRankingFilterQuery,
): Promise<IAssessmentLeaderboardResponse> {
  return apiClient(`ranking-result/leaderboard/${assessmentId}`, {
    method: "GET",
    query,
  });
}

/**
 * 4. Publish official assessment results for all participants
 */
export function publishAssessmentResult(
  assessmentId: string,
): Promise<IPublishResultResponse> {
  return apiClient(`ranking-result/publish/${assessmentId}`, {
    method: "POST",
  });
}

/**
 * 5. Retrieve all official results for current authenticated candidate
 */
export function getMyAssessmentResults(): Promise<IMyResultsResponse> {
  return apiClient("ranking-result/my-results", {
    method: "GET",
  });
}

/**
 * 6. Get a candidate's attempt result
 */
export function getCandidateAttemptResult(
  attemptId: string,
): Promise<IAssessmentResultResponse> {
  return apiClient(`ranking-result/attempt/${attemptId}`, {
    method: "GET",
  });
}
