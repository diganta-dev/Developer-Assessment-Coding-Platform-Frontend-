import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addCompanyMember,
  getCompanyMembers,
  getUserCompany,
  removeMember,
  updateCompany,
  updateCompanyMemberRole,
} from "@/api/company.api";
import type {
  AddCompanyMemberPayload,
  UpdateCompanyMemberRolePayload,
  UpdateCompanyPayload,
} from "@/types/company.type";

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

export function useAddCompanyMember() {
  return useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string;
      payload: AddCompanyMemberPayload;
    }) => addCompanyMember(companyId, payload),
  });
}

export function useRemoveMember() {
  return useMutation({
    mutationFn: ({
      companyId,
      memberUserId,
    }: {
      companyId: string;
      memberUserId: string;
    }) => removeMember(companyId, memberUserId),
  });
}

export function useUpdateCompany() {
  return useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string;
      payload: UpdateCompanyPayload;
    }) => updateCompany(companyId, payload),
  });
}
