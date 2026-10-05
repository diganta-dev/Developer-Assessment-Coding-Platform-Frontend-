import apiClient from "@/lib/apiClient";
import { AddCompanyMemberPayload, UpdateCompanyMemberRolePayload } from "@/types";

export function getUserCompany() {
  return apiClient("company/my-company");
}

export function getCompanyMembers(companyId: string) {
  return apiClient(`company/${companyId}/members`);
}

export function updateCompanyMemberRole(
  companyId: string,
  memberUserId: string,
  payload: UpdateCompanyMemberRolePayload
) {
  return apiClient(`company/${companyId}/members/${memberUserId}`, {
    method: "PATCH",
    body: payload,
  });
}
export function addCompanyMember(companyId: string, payload: AddCompanyMemberPayload) {
  return apiClient(`company/add-member/${companyId}`, {
    method: "POST",
    body: payload,
  });
}
export function removeMember(companyId: string, memberUserId: string) {
  return apiClient(`company/${companyId}/members/${memberUserId}`, {
    method: "DELETE",
  });
}
  
