import apiClient from "@/lib/apiClient";
import type {
  IAddProblemInAssessment,
  IAssessmentFilters,
  IAssessmentListResponse,
  ICreateAssessmentPayload,
  IInviteCandidatePayload,
  IInviteCandidateResponse,
} from "@/types/assessment.type";

export function createAssessment(payload: ICreateAssessmentPayload) {
  return apiClient("assessment/create-assessment", {
    method: "POST",
    body: payload,
  });
}

export function getCompanyAllAssessments(
  filters?: IAssessmentFilters,
): Promise<IAssessmentListResponse> {
  return apiClient("assessment/get-my-assessments", {
    method: "GET",
    query: filters,
  });
}

export function addProblemInAssessment(
  assessmentId: string,
  payload: IAddProblemInAssessment,
) {
  return apiClient(`assessment/add-problems/${assessmentId}`, {
    method: "POST",
    body: payload,
  });
}
export function publishAssessment(assessmentId: string) {
  return apiClient(`assessment/publish-assessment/${assessmentId}`, {
    method: "PATCH",
  });
}

export function inviteCandidate(
  assessmentId: string,
  payload: IInviteCandidatePayload,
): Promise<IInviteCandidateResponse> {
  return apiClient(`assessment/invite-candidates/${assessmentId}`, {
    method: "POST",
    body: payload,
  });
}

export function getAssessmentInvitation(assessmentId: string) {
  return apiClient(`assessment/${assessmentId}/invitation`, {
    method: "GET",
  });
}
     
