import apiClient from "@/lib/apiClient";
import type {
  IAddProblemInAssessment,
  IAssessmentAttempt,
  IAssessmentFilters,
  IAssessmentInvitationsResponse,
  IAssessmentListResponse,
  IAttemptDetailsResponse,
  ICreateAssessmentPayload,
  IInviteCandidatePayload,
  IInviteCandidateResponse,
  IStartAttemptPayload,
  IStartAttemptResponse,
  ISubmitAttemptPayload,
  ISubmitAttemptResponse,
  IVerifyInvitationResponse,
  StartAttemptParams,
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

export function getAssessmentInvitation(
  assessmentId: string,
): Promise<IAssessmentInvitationsResponse> {
  return apiClient(`assessment/${assessmentId}/invitations`, {
    method: "GET",
  });
}

export const getAssessmentInvitations = getAssessmentInvitation;

export function verifyAssessmentInvitation(
  token: string,
): Promise<IVerifyInvitationResponse> {
  return apiClient(`assessment/invitation/verify/${token}`, {
    method: "GET",
  });
}

export function startAttempt(
  variables: StartAttemptParams,
  payload?: IStartAttemptPayload,
): Promise<IStartAttemptResponse> {
  const assessmentId =
    typeof variables === "string" ? variables : variables.assessmentId;

  const invitationToken =
    typeof variables === "object" ? variables.invitationToken : undefined;

  const bodyPayload: IStartAttemptPayload =
    payload ??
    (invitationToken
      ? { invitationToken }
      : typeof variables === "object" && variables.payload
        ? variables.payload
        : {});

  return apiClient(`assessment/start-attempt/${assessmentId}`, {
    method: "POST",
    body: Object.keys(bodyPayload).length > 0 ? bodyPayload : undefined,
  });
}

export function getAttemptDetails(
  attemptId: string,
): Promise<IAttemptDetailsResponse> {
  return apiClient(`assessment/attempts/${attemptId}`, {
    method: "GET",
  });
}

export function submitAssessmentAttempt(
  attemptId: string,
  payload: ISubmitAttemptPayload,
): Promise<ISubmitAttemptResponse> {
  return apiClient(`assessment/attempts/${attemptId}/submit`, {
    method: "POST",
    body: payload,
  });
}

export function getMyAttempts(options?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{
  success: boolean;
  message: string;
  data: IAssessmentAttempt[];
}> {
  return apiClient("assessment/my-attempts", {
    method: "GET",
    query: options,
  });
}

export function getCandidateMyAttempts(){
    return apiClient("assessment/candidate/my-attempts", {
        method: "GET",
    });
} 