import apiClient from "@/lib/apiClient";
import type { IUpdateProfilePayload, IUser } from "@/types";

export interface IProfileResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IUser;
}

/**
 * Retrieves the current authenticated user's profile details.
 */
export function getMyProfile() {
  return apiClient<IProfileResponse>("users/me");
}

/**
 * Updates basic profile attributes (name, phone, bio, location, githubUrl, linkedinUrl).
 */
export function updateMyProfile(payload: IUpdateProfilePayload) {
  return apiClient<IProfileResponse>("users/me/profile", {
    method: "PATCH",
    body: payload,
  });
}

/**
 * Uploads or replaces the user's profile picture using multipart/form-data.
 */
export function uploadProfilePicture(formData: FormData) {
  return apiClient<IProfileResponse>("users/me/profile-picture", {
    method: "PATCH",
    body: formData,
  });
}

/**
 * Removes the user's profile picture from both DB and Cloudinary.
 */
export function removeProfilePicture() {
  return apiClient<IProfileResponse>("users/me/profile-picture", {
    method: "DELETE",
  });
}

/**
 * Uploads or replaces the user's PDF resume using multipart/form-data.
 */
export function uploadResume(formData: FormData) {
  return apiClient<IProfileResponse>("users/me/resume", {
    method: "PATCH",
    body: formData,
  });
}

/**
 * Removes the user's PDF resume from both DB and Cloudinary.
 */
export function removeResume() {
  return apiClient<IProfileResponse>("users/me/resume", {
    method: "DELETE",
  });
}
