import apiClient from "@/lib/apiClient";
import { LoginPayload, UserRegistrationPayload } from "@/types";

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