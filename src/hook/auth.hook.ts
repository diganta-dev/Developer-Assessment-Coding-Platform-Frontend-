import {
  companyRegistration,
  companyVerification,
  forgotPassword,
  googleLogin,
  refreshToken,
  resendLoginOtp,
  resetPassword,
  userGetMe,
  userLogin,
  userLogout,
  userRegistration,
  userVerifyAccount,
  verifyLoginOtp,
} from "@/api/auth.api";
import type {
  ForgotPasswordPayload,
  GoogleLoginPayload,
  RefreshTokenPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  VerifyLoginOtpPayload,
} from "@/types/auth.type";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useLogin() {
  return useMutation({
    mutationFn: userLogin,
  });
}

export function useRegistration() {
  return useMutation({
    mutationFn: userRegistration,
  });
}

export function useVerifyAccount() {
  return useMutation({
    mutationFn: userVerifyAccount,
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ["user"],
    queryFn: userGetMe,
    retry: false,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: userLogout,
  });
}

export function useCompanyRegistration() {
  return useMutation({
    mutationFn: companyRegistration,
  });
}

export function useCompanyVerfication() {
  return useMutation({
    mutationFn: companyVerification,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  });
}

export function useVerifyLoginOtp() {
  return useMutation({
    mutationFn: (payload: VerifyLoginOtpPayload) => verifyLoginOtp(payload),
  });
}

export function useResendLoginOtp() {
  return useMutation({
    mutationFn: (payload: ResendOtpPayload) => resendLoginOtp(payload),
  });
}

export function useGoogleLogin() {
  return useMutation({
    mutationFn: (payload: GoogleLoginPayload) => googleLogin(payload),
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: (payload?: RefreshTokenPayload) => refreshToken(payload),
  });
}