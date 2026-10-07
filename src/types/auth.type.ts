export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserRegistrationPayload {
  name: string;
  email: string;
  password: string;
  candidateProfile: {
    phone: string;
    location: string;
  };
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export interface CompanyRegistrationPayload {
  name: string;
  email: string;
  description?: string;
  website?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface VerifyLoginOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface GoogleLoginPayload {
  idToken: string;
}

export interface RefreshTokenPayload {
  refreshToken?: string;
}