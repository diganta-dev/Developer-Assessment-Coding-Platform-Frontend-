"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Camera, Check, Image as ImageIcon, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { useRemoveProfilePicture, useUploadProfilePicture } from "@/hook/user.hook";
import type { IUser } from "@/types";

interface ProfileAvatarUploaderProps {
  user: IUser;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getInitials(name?: string | null, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return "US";
}

export function ProfileAvatarUploader({ user }: ProfileAvatarUploaderProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const { mutate: uploadPicture, isPending: isUploading } = useUploadProfilePicture();
  const { mutate: removePicture, isPending: isRemoving } = useRemoveProfilePicture();

  const currentAvatarUrl =
    user.profilePictureUrl || user.avatar || user.candidateProfile?.profileImage || null;

  // Revoke preview URL on unmount or file change to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      toast.add({
        title: "Unsupported Image Format",
        description: "Please select a valid image file (JPEG, PNG, or WebP).",
        type: "error",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.add({
        title: "File Exceeds Limit",
        description: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB maximum limit.`,
        type: "error",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("profilePicture", selectedFile);

    uploadPicture(formData, {
      onSuccess: async (res) => {
        toast.add({
          title: "Profile Picture Updated",
          description: "Your new profile picture has been uploaded successfully.",
          type: "success",
        });
        handleCancelPreview();
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      },
      onError: (err: any) => {
        toast.add({
          title: "Upload Failed",
          description:
            err?.data?.message || err?.message || "Failed to upload image. Please try again.",
          type: "error",
        });
      },
    });
  };

  const handleConfirmRemove = () => {
    removePicture(undefined, {
      onSuccess: async () => {
        toast.add({
          title: "Profile Picture Removed",
          description: "Your profile picture has been deleted.",
          type: "success",
        });
        setShowRemoveDialog(false);
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      },
      onError: (err: any) => {
        toast.add({
          title: "Removal Failed",
          description:
            err?.data?.message || err?.message || "Could not delete profile picture. Please try again.",
          type: "error",
        });
      },
    });
  };

  const displayAvatarSrc = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl border border-border/70 bg-card shadow-xs">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        disabled={isUploading || isRemoving}
      />

      {/* Avatar Container with Hover Overlay */}
      <div className="relative group shrink-0">
        <Avatar className="size-28 sm:size-32 rounded-2xl ring-4 ring-background shadow-md bg-muted">
          {displayAvatarSrc ? (
            <AvatarImage
              src={displayAvatarSrc}
              alt={user.name || "Profile Picture"}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="rounded-2xl text-2xl font-bold bg-primary/10 text-primary">
            {getInitials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>

        {/* Quick Camera Change Trigger Overlay */}
        {!selectedFile && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRemoving}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-white text-xs font-medium gap-1"
            title="Click to change photo"
          >
            <Camera className="size-5" />
            <span>Change</span>
          </button>
        )}

        {previewUrl && (
          <span className="absolute -top-2 -right-2 flex items-center justify-center size-6 rounded-full bg-amber-500 text-white shadow-sm ring-2 ring-background text-[10px] font-bold">
            !
          </span>
        )}
      </div>

      {/* Avatar Controls & Information */}
      <div className="flex-1 space-y-3 text-center sm:text-left">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center justify-center sm:justify-start gap-2">
            <ImageIcon className="size-4 text-primary" />
            <span>Profile Photo</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload a clear, professional photo. Supports JPEG, PNG, and WebP up to 5MB.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
          {selectedFile ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
                className="gap-1.5 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span>Save Photo</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelPreview}
                disabled={isUploading}
                className="gap-1.5 text-xs"
              >
                <X className="size-3.5" />
                <span>Cancel</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isRemoving}
                className="gap-1.5 shadow-xs"
              >
                <UploadCloud className="size-3.5" />
                <span>{currentAvatarUrl ? "Change Photo" : "Upload Photo"}</span>
              </Button>

              {currentAvatarUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRemoveDialog(true)}
                  disabled={isUploading || isRemoving}
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
                >
                  {isRemoving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  <span>Remove</span>
                </Button>
              )}
            </>
          )}
        </div>

        {selectedFile && (
          <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
            Previewing: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB) — Click &quot;Save Photo&quot; to apply.
          </p>
        )}
      </div>

      {/* Confirmation Dialog for Removal */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Profile Picture?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your profile picture? This will revert your avatar to your initials.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Deleting...
                </>
              ) : (
                "Delete Picture"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
