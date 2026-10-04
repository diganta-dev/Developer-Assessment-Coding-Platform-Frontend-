import apiClient from "@/lib/apiClient";
import {
  CompanyRegistrationPayload,
  LoginPayload,
  UserRegistrationPayload,
  VerifyAccountPayload,
} from "@/types";

export function userLogin(payload: LoginPayload) {
  return apiClient("auth/login", {
    method: "POST",
    body: payload,
  });
}

export function userRegistration(payload: UserRegistrationPayload) {
  return apiClient("auth/register", {
    method: "POST",
    body: payload,
  });
}

export function userVerifyAccount(payload: VerifyAccountPayload) {
  return apiClient("auth/verify-email", {
    method: "POST",
    body: payload,
  });
}

export function userGetMe(){
  return apiClient("auth/me");
}

export function companyRegistration(payload: CompanyRegistrationPayload) {
  return apiClient("company/create-company", { 
    method: "POST",
    body: payload,
  });
} 
 
export function companyVerification(payload: VerifyAccountPayload) {
  return apiClient("company/verify-company", {
    method: "POST",
    body: payload,
  });
}
  
  
