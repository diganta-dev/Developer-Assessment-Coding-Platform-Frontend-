import { useMutation, useQuery } from "@tanstack/react-query";
import { createQuestion, getAllProblem } from "@/api";
import type { ICreateQuestion } from "@/types";

export function useCreateQuestion() {
  return useMutation({
    mutationFn: (payload: ICreateQuestion) => createQuestion(payload),
  });
}
export function useGetAllQuestion() {
  return useQuery({
    queryKey: ["all-questions"],
    queryFn: () => getAllProblem(),
  });
}
