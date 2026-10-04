import { getCompanyMembers, getUserCompany, updateCompanyMemberRole } from "@/api";
import { UpdateCompanyMemberRolePayload } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useUserCompany() {
  return useQuery({
    queryKey: ["user-company"],
    queryFn: getUserCompany,
  });
}

export function useCompanyMembers(companyId?: string) {
  return useQuery({
    queryKey: ["company-members", companyId],
    queryFn: () => getCompanyMembers(companyId!),
    enabled: Boolean(companyId),
  });
}

export function useUpdateCompanyMemberRole() {
  return useMutation({
    mutationFn: ({
      companyId,
      memberUserId,
      payload,
    }: {
      companyId: string;
      memberUserId: string;
      payload: UpdateCompanyMemberRolePayload;
    }) => updateCompanyMemberRole(companyId, memberUserId, payload),
  });
}