import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addProblemInAssessment,
  createAssessment,
  getCompanyAllAssessments,
  inviteCandidate,
  publishAssessment,
} from "@/api/assessment.api";
import type {
  IAddProblemInAssessment,
  IAssessmentFilters,
  ICreateAssessmentPayload,
  IInviteCandidatePayload,
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

export function useAddProblemInAssessment(assessmentId?: string) {
  return useMutation({
    mutationFn: (
      variables:
        | IAddProblemInAssessment
        | { assessmentId: string; payload: IAddProblemInAssessment },
    ) => {
      if ("problems" in variables) {
        if (!assessmentId) throw new Error("Assessment ID is required");
        return addProblemInAssessment(assessmentId, variables);
      }
      return addProblemInAssessment(variables.assessmentId, variables.payload);
    },
  });
}

export function usePublishAssessment(assessmentId?: string) {
  return useMutation({
    mutationFn: (targetId?: string) => {
      const id = targetId || assessmentId;
      if (!id) {
        throw new Error("Assessment ID is required to publish assessment");
      }
      return publishAssessment(id);
    },
  });
}
export function useInviteCandidate(assessmentId?: string) {
  return useMutation({
    mutationFn: (
      variables:
        | IInviteCandidatePayload
        | {
            payload: IInviteCandidatePayload;
            assessmentId?: string;
          },
    ) => {
      if ("emails" in variables) {
        if (!assessmentId) {
          throw new Error("Assessment ID is required to invite candidates");
        }
        return inviteCandidate(assessmentId, variables);
      }
      const id = variables.assessmentId || assessmentId;
      if (!id) {
        throw new Error("Assessment ID is required to invite candidates");
      }
      return inviteCandidate(id, variables.payload);
    },
  });
}
