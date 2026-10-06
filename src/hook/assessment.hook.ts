import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addProblemInAssessment,
  createAssessment,
  getAssessmentInvitation,
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

export function useAddProblemInAssessment() {
  return useMutation({
    mutationFn: ({
      assessmentId,
      payload,
    }: {
      assessmentId: string;
      payload: IAddProblemInAssessment;
    }) => addProblemInAssessment(assessmentId, payload),
  });
}

export function usePublishAssessment() {
  return useMutation({
    mutationFn: (assessmentId: string) => publishAssessment(assessmentId),
  });
}

export function useInviteCandidate() {
  return useMutation({
    mutationFn: ({
      assessmentId,
      payload,
    }: {
      assessmentId: string;
      payload: IInviteCandidatePayload;
    }) => inviteCandidate(assessmentId, payload),
  });
}

export function useGetAssessmentInvitation(assessmentId: string) {
  return useQuery({
    queryKey: ["assessment-invitation", assessmentId],
    queryFn: () => getAssessmentInvitation(assessmentId),
    enabled: Boolean(assessmentId),
  });
}

export function usegetAssessmentInvitation(assessmentId: string) {
  return useQuery({
    queryKey: ["assessment-invitation", assessmentId],
    queryFn: () => getAssessmentInvitation(assessmentId),
    enabled: Boolean(assessmentId),
  }); 
}


