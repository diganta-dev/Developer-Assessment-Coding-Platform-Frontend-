import apiClient from "@/lib/apiClient";
import type {
    IAddProblemInAssessment,
  IAssessmentFilters,
  IAssessmentListResponse,
  ICreateAssessmentPayload,
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

export function addProblemInAssessment(assessmentId: string ,payload:IAddProblemInAssessment) {
  return apiClient(`assessment/add-problems/${assessmentId}`, {
    method: "POST",
    body: payload,
  });
}
