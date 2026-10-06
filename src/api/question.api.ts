import apiClient from "@/lib/apiClient";
import type {
  ICreateQuestion,
  IProblemFilters,
  IProblemListResponse,
  IUpdateQuestion,
} from "@/types";

export function createQuestion(payload: ICreateQuestion) {
  return apiClient("problem/create-problem", {
    method: "POST",
    body: payload,
  });
}

export function getAllProblem(
  filters?: IProblemFilters,
): Promise<IProblemListResponse> {
  return apiClient("problem/all-problems", {
    method: "GET",
    query: filters,
  });
}

export function getCompanyProblems(
  filters?: IProblemFilters,
): Promise<IProblemListResponse> {
  return apiClient("problem/company-problems", {
    method: "GET",
    query: filters,
  });
}
export function deleteProblem(problemId: string) {
  return apiClient(`problem/${problemId}`, {
    method: "DELETE",
  });
}
export function getOneProblem(problemId: string) {
  return apiClient(`problem/${problemId}`, {
    method: "GET",
  });
}

export function updateProblem(problemId: string, payload: IUpdateQuestion) {
  return apiClient(`problem/${problemId}`, {
    method: "PATCH",
    body: payload,
  });
}
