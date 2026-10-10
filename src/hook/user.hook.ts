import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getMyProfile,
  removeProfilePicture,
  removeResume,
  updateMyProfile,
  uploadProfilePicture,
  uploadResume,
} from "@/api/user.api";
import type { IUpdateProfilePayload } from "@/types";

/**
 * Pure TanStack Query hook to fetch current profile
 */
export function useGetMyProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: getMyProfile,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Pure TanStack Query mutation hook to update profile fields
 */
export function useUpdateMyProfile() {
  return useMutation({
    mutationFn: (payload: IUpdateProfilePayload) => updateMyProfile(payload),
  });
}

/**
 * Pure TanStack Query mutation hook to upload/replace profile picture
 */
export function useUploadProfilePicture() {
  return useMutation({
    mutationFn: (formData: FormData) => uploadProfilePicture(formData),
  });
}

/**
 * Pure TanStack Query mutation hook to remove profile picture
 */
export function useRemoveProfilePicture() {
  return useMutation({
    mutationFn: () => removeProfilePicture(),
  });
}

/**
 * Pure TanStack Query mutation hook to upload/replace resume
 */
export function useUploadResume() {
  return useMutation({
    mutationFn: (formData: FormData) => uploadResume(formData),
  });
}

/**
 * Pure TanStack Query mutation hook to remove resume
 */
export function useRemoveResume() {
  return useMutation({
    mutationFn: () => removeResume(),
  });
}
