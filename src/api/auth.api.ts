import apiClient from "@/lib/apiClient";
import type {
  CompanyRegistrationPayload,
  ForgotPasswordPayload,
  GoogleLoginPayload,
  LoginPayload,
  RefreshTokenPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  UserRegistrationPayload,
  VerifyAccountPayload,
  VerifyLoginOtpPayload,
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

export function userGetMe() {
  return apiClient("auth/me");
}

export function userLogout() {
  return apiClient("auth/logout", {
    method: "POST",
  });
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

export function forgotPassword(payload: ForgotPasswordPayload) {
  return apiClient("auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export function resetPassword(payload: ResetPasswordPayload) {
  return apiClient("auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

export function verifyLoginOtp(payload: VerifyLoginOtpPayload) {
  return apiClient("auth/verify-login-otp", {
    method: "POST",
    body: payload,
  });
}

export function resendLoginOtp(payload: ResendOtpPayload) {
  return apiClient("auth/resend-login-otp", {
    method: "POST",
    body: payload,
  });
}

export function googleLogin(payload: GoogleLoginPayload) {
  return apiClient("auth/google", {
    method: "POST",
    body: payload,
  });
}

export function refreshToken(payload?: RefreshTokenPayload) {
  return apiClient("auth/refresh-token", {
    method: "POST",
    body: payload || {},
  });
}
