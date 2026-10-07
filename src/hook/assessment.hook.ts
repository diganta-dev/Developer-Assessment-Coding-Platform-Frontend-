import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addProblemInAssessment,
  calculateAttemptScore,
  createAssessment,
  createSubmissionFromAttempt,
  deleteAssessment,
  finalizeAndSubmitAttempt,
  getAssessmentInvitation,
  getAttemptDetails,
  getAttemptResult,
  getCandidateMyAttempts,
  getCompanyAllAssessments,
  getDetailedAssesssmentReport,
  getMyAssessments,
  getMyAttempts,
  GetSingleAssessment,
  inviteCandidate,
  publishAssessment,
  publishResults,
  startAttempt,
  submitAssessmentAttempt,
  updateAssessment,
  verifyAssessmentInvitation,
} from "@/api/assessment.api";
import type {
  IAddProblemInAssessment,
  IAssessmentFilters,
  ICandidateMyAttemptsFilters,
  ICreateAssessmentPayload,
  ICreateSubmissionPayload,
  IInviteCandidatePayload,
  IStartAttemptResponse,
  ISubmitAttemptPayload,
  StartAttemptParams,
  IUpdateAssessmentPayload,
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

export const usegetAssessmentInvitation = useGetAssessmentInvitation;

export function useVerifyAssessmentInvitation(token: string) {
  return useQuery({
    queryKey: ["verify-invitation", token],
    queryFn: () => verifyAssessmentInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useStartAttempt() {
  const queryClient = useQueryClient();

  return useMutation<IStartAttemptResponse, Error, StartAttemptParams>({
    mutationFn: (variables: StartAttemptParams) => startAttempt(variables),
    onSuccess: (response, variables) => {
      const assessmentId =
        typeof variables === "string" ? variables : variables.assessmentId;

      queryClient.invalidateQueries({
        queryKey: ["assessment-invitation", assessmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-attempts"],
      });
      if (response.data?.attempt?.id) {
        queryClient.invalidateQueries({
          queryKey: ["assessment-attempt", response.data.attempt.id],
        });
      }
    },
  });
}

export function useSubmitAssessmentAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      payload,
    }: {
      attemptId: string;
      payload: ISubmitAttemptPayload;
    }) => submitAssessmentAttempt(attemptId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assessment-attempt", variables.attemptId],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-attempts"],
      });
    },
  });
}

export function useGetMyAttempts(options?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ["my-attempts", options],
    queryFn: () => getMyAttempts(options),
  });
}

export function useGetCandidateMyAttempts(
  filters?: ICandidateMyAttemptsFilters,
) {
  return useQuery({
    queryKey: ["candidate-my-attempts", filters],
    queryFn: () => getCandidateMyAttempts(filters),
  });
}

export function useGetAttemptDetails(attemptId: string) {
  return useQuery({
    queryKey: ["assessment-attempt", attemptId],
    queryFn: () => getAttemptDetails(attemptId),
    enabled: Boolean(attemptId),
    refetchInterval: false,
  });
}

export function useFinalizeAndSubmitResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      variables:
        | string
        | {
            attemptId: string;
            payload?: ISubmitAttemptPayload;
          },
    ) => {
      const attemptId =
        typeof variables === "string" ? variables : variables.attemptId;
      const payload =
        typeof variables === "string" ? undefined : variables.payload;
      return finalizeAndSubmitAttempt(attemptId, payload);
    },
    onSuccess: (_, variables) => {
      const attemptId =
        typeof variables === "string" ? variables : variables.attemptId;
      queryClient.invalidateQueries({ queryKey: ["candidate-my-attempts"] });
      queryClient.invalidateQueries({
        queryKey: ["assessment-attempt", attemptId],
      });
      queryClient.invalidateQueries({
        queryKey: ["assessment-attempt-result", attemptId],
      });
      queryClient.invalidateQueries({ queryKey: ["assessment-invitations"] });
    },
  });
}

export function useGetAttemptResults(attemptId: string, enabled = true) {
  return useQuery({
    queryKey: ["assessment-attempt-result", attemptId],
    queryFn: () => getAttemptResult(attemptId),
    enabled: Boolean(attemptId) && enabled,
    refetchInterval: false,
  });
}

export function useGetDetailedAssesssmentReport(attemptId: string) {
  return useQuery({
    queryKey: ["assessment-attempt-detailed-report", attemptId],
    queryFn: () => getDetailedAssesssmentReport(attemptId),
    enabled: Boolean(attemptId),
    refetchInterval: false,
  });
}

export function usePublishResult(assessmentId?: string) {
  return useMutation({
    mutationFn: (overrideAssessmentId?: string) => {
      const targetId = overrideAssessmentId || assessmentId;
      if (!targetId) {
        throw new Error("Assessment ID is required to publish results.");
      }
      return publishResults(targetId);
    },
  });
}

export function useCreateSubmissionFromAttempt() {
  return useMutation({
    mutationFn: (variables: {
      attemptId: string;
      payload: ICreateSubmissionPayload;
    }) => createSubmissionFromAttempt(variables.attemptId, variables.payload),
  });
} 

export function useCalculateAttemptScore() {
  return useMutation({
    mutationFn: (attemptId: string) => calculateAttemptScore(attemptId),
    
  });
}
export function useGetMyAssessments(filters?: IAssessmentFilters) {
  return useQuery({
    queryKey: ["my-assessments", filters],
    queryFn: () => getMyAssessments(filters),
  });
}
export function useGetSingleAssessment(assessmentId: string) {
  return useQuery({
    queryKey: ["assessment-single", assessmentId],
    queryFn: () => GetSingleAssessment(assessmentId),
    enabled: Boolean(assessmentId),
    refetchInterval: false,
  });
} 

export function useUpdateAssessment(
  assessmentId?: string,
  payload?: IUpdateAssessmentPayload | ICreateAssessmentPayload,
) {
  return useMutation({
    mutationFn: (variables?: {
      assessmentId: string;
      payload: IUpdateAssessmentPayload | ICreateAssessmentPayload;
    }) => {
      const targetId = variables?.assessmentId ?? assessmentId;
      const targetPayload = variables?.payload ?? payload;
      
      if (!targetId || !targetPayload) {
        throw new Error("assessmentId and payload are required");
      }
      
      return updateAssessment(targetId, targetPayload);
    },
  });
}

export function useDeleteAssessment() {
  return useMutation({
    mutationFn: (assessmentId: string) => deleteAssessment(assessmentId),
  });
}

