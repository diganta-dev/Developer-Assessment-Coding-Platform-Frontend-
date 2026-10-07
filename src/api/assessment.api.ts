import apiClient from "@/lib/apiClient";
import type {
  IAddProblemInAssessment,
  IAssessmentAttempt,
  IAssessmentFilters,
  IAssessmentInvitationsResponse,
  IAssessmentListResponse,
  IAttemptDetailsResponse,
  IAttemptResultResponse,
  ICandidateMyAttemptsFilters,
  ICandidateMyAttemptsResponse,
  ICalculateAttemptScoreResponse,
  ICreateAssessmentPayload,
  ICreateSubmissionPayload,
  ICreateSubmissionResponse,
  IDetailedAssessmentReportResponse,
  IDeleteAssessmentResponse,
  IInviteCandidatePayload,
  IInviteCandidateResponse,
  IPublishResultsResponse,
  ISingleAssessmentResponse,
  IStartAttemptPayload,
  IStartAttemptResponse,
  ISubmitAttemptPayload,
  ISubmitAttemptResponse,
  IUpdateAssessmentPayload,
  IUpdateAssessmentResponse,
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

export function getCandidateMyAttempts(
  filters?: ICandidateMyAttemptsFilters,
): Promise<ICandidateMyAttemptsResponse> {
  return apiClient("assessment/candidate/my-attempts", {
    method: "GET",
    query: filters,
  });
}

export function GetAttemptDetails(
  attemptId: string,
): Promise<IAttemptDetailsResponse> {
  return apiClient(`assessment/attempts/${attemptId}`, {
    method: "GET",
  });
}

export function finalizeAndSubmitAttempt(
  attemptId: string,
  payload?: ISubmitAttemptPayload,
): Promise<ISubmitAttemptResponse> {
  return apiClient(`assessment/attempts/${attemptId}/submit`, {
    method: "POST",
    body: payload,
  });
}

export function getAttemptResult(
  attemptId: string,
): Promise<IAttemptResultResponse> {
  return apiClient(`assessment/attempts/${attemptId}/result`, {
    method: "GET",
  });
}
export function getDetailedAssesssmentReport(
  attemptId: string,
): Promise<IDetailedAssessmentReportResponse> {
  return apiClient(`assessment/attempts/${attemptId}/detailed-report`, {
    method: "GET",
  });
}

export function publishResults(
  assessmentId: string,
): Promise<IPublishResultsResponse> {
  return apiClient(`assessment/publish-results/${assessmentId}`, {
    method: "POST",
  });
}

export function createSubmissionFromAttempt(
  attemptId: string,
  payload: ICreateSubmissionPayload,
): Promise<ICreateSubmissionResponse> {
  return apiClient(`assessment/attempts/${attemptId}/submissions`, {
    method: "POST",
    body: {
      attemptId,
      ...payload,
    },
  });
}
export function calculateAttemptScore(
  attemptId: string,
): Promise<ICalculateAttemptScoreResponse> {
  return apiClient(`assessment/attempts/${attemptId}/calculate-score`, {
    method: "POST",
  });
}

export function getMyAssessments(
  filters?: IAssessmentFilters,
): Promise<IAssessmentListResponse> {
  return apiClient("assessment/get-my-assessments", {
    method: "GET",
    query: filters,
  });
}

export function GetSingleAssessment(
  assessmentId: string,
): Promise<ISingleAssessmentResponse> {
  return apiClient(`assessment/get-single-assessment/${assessmentId}`, {
    method: "GET",
  });
}

export function updateAssessment(
  assessmentId: string,
  payload: IUpdateAssessmentPayload | ICreateAssessmentPayload,
): Promise<IUpdateAssessmentResponse> {
  return apiClient(`assessment/update-assessment/${assessmentId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteAssessment(
  assessmentId: string,
): Promise<IDeleteAssessmentResponse> {
  return apiClient(`assessment/delete-assessment/${assessmentId}`, {
    method: "DELETE",
  });
}



 