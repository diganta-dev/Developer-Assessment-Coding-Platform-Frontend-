import apiClient from "@/lib/apiClient";
import { UpdateCompanyMemberRolePayload } from "@/types";

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
