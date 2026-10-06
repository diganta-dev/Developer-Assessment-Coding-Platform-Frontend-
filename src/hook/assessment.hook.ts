import { useMutation } from "@tanstack/react-query";
import { createAssessment } from "@/api/assessment.api";
import type { ICreateAssessmentPayload } from "@/types/assessment.type";

export function useCreateAssessment() {
  return useMutation({
    mutationFn: (payload: ICreateAssessmentPayload) => createAssessment(payload),
  });
}