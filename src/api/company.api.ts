import apiClient from "@/lib/apiClient";
import type {
  AddCompanyMemberPayload,
  UpdateCompanyMemberRolePayload,
  UpdateCompanyPayload,
} from "@/types";

export function getUserCompany() {
  return apiClient("company/my-company");
}

export function getCompanyMembers(companyId: string) {
  return apiClient(`company/${companyId}/members`);
}

export function updateCompanyMemberRole(
  companyId: string,
  memberUserId: string,
  payload: UpdateCompanyMemberRolePayload,
) {
  return apiClient(`company/${companyId}/members/${memberUserId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function addCompanyMember(
  companyId: string,
  payload: AddCompanyMemberPayload,
) {
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

export function updateCompany(
  companyId: string,
  payload: UpdateCompanyPayload,
) {
  return apiClient(`company/update-company/${companyId}`, {
    method: "PATCH",
    body: payload,
  });
}

/**
 * Uploads or replaces the company's profile logo via multipart/form-data.
 */
export function uploadCompanyLogo(companyId: string, formData: FormData) {
  return apiClient(`company/${companyId}/logo`, {
    method: "PATCH",
    body: formData,
  });
}

/**
 * Removes the company's profile logo from DB and Cloudinary.
 */
export function removeCompanyLogo(companyId: string) {
  return apiClient(`company/${companyId}/logo`, {
    method: "DELETE",
  });
}
