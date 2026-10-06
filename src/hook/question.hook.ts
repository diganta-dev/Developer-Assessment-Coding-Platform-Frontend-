import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createQuestion,
  deleteProblem,
  getAllProblem,
  getCompanyProblems,
  getOneProblem,
  updateProblem,
} from "@/api";
import type {
  ICreateQuestion,
  IProblemFilters,
  IUpdateQuestion,
} from "@/types";

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICreateQuestion) => createQuestion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-questions"] });
      queryClient.invalidateQueries({ queryKey: ["all-questions"] });
    },
  });
}

export function useGetAllQuestion(filters?: IProblemFilters) {
  return useQuery({
    queryKey: ["all-questions", filters],
    queryFn: () => getAllProblem(filters),
  });
}

export function useGetCompanyProblems(filters?: IProblemFilters) {
  return useQuery({
    queryKey: ["company-questions", filters],
    queryFn: () => getCompanyProblems(filters),
  });
}

export function useDeleteCompanyProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (problemId: string) => deleteProblem(problemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-questions"] });
      queryClient.invalidateQueries({ queryKey: ["all-questions"] });
    },
  });
}

export function useGetOneProblem(problemId: string) {
  return useQuery({
    queryKey: ["problem", problemId],
    queryFn: () => getOneProblem(problemId),
    enabled: Boolean(problemId),
  });
}

export function useUpdateProblem() {
  return useMutation({
    mutationFn: ({
      problemId,
      payload,
    }: {
      problemId: string;
      payload: IUpdateQuestion;
    }) => updateProblem(problemId, payload),
  });
}
