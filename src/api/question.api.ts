import apiClient from "@/lib/apiClient";
import type { ICreateQuestion } from "@/types";

export function createQuestion(payload: ICreateQuestion) {
  return apiClient("problem/create-problem", {
    method: "POST",
    body: payload,
  });
}
export function getAllProblem() {
  return apiClient("problem", {
    method: "GET",
  });
} 

