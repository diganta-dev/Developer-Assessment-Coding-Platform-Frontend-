import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAssessment,
  getCompanyAllAssessments,
} from "@/api/assessment.api";
import type {
  IAssessmentFilters,
  ICreateAssessmentPayload,
} from "@/types/assessment.type";

export function useCreateAssessment() {
  return useMutation({
    mutationFn: (payload: ICreateAssessmentPayload) =>
      createAssessment(payload),
  });
}

export function useGetCompanyAllAssessments(filters?: IAssessmentFilters) {
  return useQuery({
    queryKey: ["company-assessments", filters],
    queryFn: () => getCompanyAllAssessments(filters),
  });
}
