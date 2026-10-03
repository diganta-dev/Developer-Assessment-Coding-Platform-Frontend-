import apiClient from "@/lib/apiClient";
import { LoginPayload } from "@/types";

export function userLogin(payload: LoginPayload) {
  return apiClient("auth/login", {
    method: "POST",
    body: payload,
  });
}