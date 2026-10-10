"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Check,
  Image as ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
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
import { useRemoveCompanyLogo, useUploadCompanyLogo } from "@/hook/company.hook";
import type { ICompany } from "@/types";

interface CompanyLogoUploaderProps {
  company: ICompany;
  size?: "sm" | "md" | "lg";
  showControls?: boolean;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getCompanyInitials(name?: string | null): string {
  if (!name?.trim()) return "CO";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function CompanyLogoUploader({
  company,
  size = "lg",
  showControls = true,
}: CompanyLogoUploaderProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const { mutate: uploadLogo, isPending: isUploading } = useUploadCompanyLogo();
  const { mutate: removeLogo, isPending: isRemoving } = useRemoveCompanyLogo();

  const currentLogoUrl = company.logoUrl || null;

  // Clean up object URL on unmount or file reset
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

    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      toast.add({
        title: "Unsupported Image Format",
        description: "Please select a valid image file (JPEG, PNG, or WebP).",
        type: "error",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

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
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("logo", selectedFile);

    uploadLogo(
      {
        companyId: company.id,
        formData,
      },
      {
        onSuccess: async () => {
          toast.add({
            title: "Company Logo Updated",
            description: "Your company logo has been uploaded and applied successfully.",
            type: "success",
          });
          handleCancelPreview();
          await queryClient.invalidateQueries({ queryKey: ["user-company"] });
          await queryClient.invalidateQueries({ queryKey: ["company-members", company.id] });
        },
        onError: (err: any) => {
          const errorMsg =
            err?.data?.message || err?.message || "Failed to upload company logo. Please try again.";
          toast.add({
            title: "Upload Failed",
            description: errorMsg,
            type: "error",
          });
        },
      },
    );
  };

  const handleRemove = () => {
    removeLogo(company.id, {
      onSuccess: async () => {
        toast.add({
          title: "Company Logo Removed",
          description: "Your company logo has been removed.",
          type: "success",
        });
        setShowRemoveDialog(false);
        await queryClient.invalidateQueries({ queryKey: ["user-company"] });
        await queryClient.invalidateQueries({ queryKey: ["company-members", company.id] });
      },
      onError: (err: any) => {
        const errorMsg =
          err?.data?.message || err?.message || "Could not delete company logo. Please try again.";
        toast.add({
          title: "Removal Failed",
          description: errorMsg,
          type: "error",
        });
      },
    });
  };

  // Dimensions based on size prop
  const avatarClasses =
    size === "lg"
      ? "size-20 sm:size-24 rounded-2xl"
      : size === "md"
        ? "size-16 rounded-xl"
        : "size-12 rounded-lg";

  const fallbackTextClass =
    size === "lg"
      ? "text-xl sm:text-2xl font-bold"
      : size === "md"
        ? "text-base font-bold"
        : "text-xs font-semibold";

  const displayImage = previewUrl || currentLogoUrl;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        aria-label="Upload company logo"
        disabled={isUploading || isRemoving}
      />

      {/* Avatar Display with Hover Overlay */}
      <div className="group relative shrink-0">
        <Avatar className={`${avatarClasses} ring-4 ring-background/90 shadow-md bg-muted/60`}>
          {displayImage ? (
            <AvatarImage
              src={displayImage}
              alt={company.name || "Company Logo"}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback
            className={`${avatarClasses} ${fallbackTextClass} bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary border border-primary/10`}
          >
            {getCompanyInitials(company.name)}
          </AvatarFallback>
        </Avatar>

        {/* Hover Camera Trigger Overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isRemoving}
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 disabled:pointer-events-none"
          title="Change Company Logo"
        >
          {isUploading ? (
            <Loader2 className="size-6 animate-spin text-white" />
          ) : (
            <>
              <Camera className="size-5" />
              <span className="text-[10px] font-medium mt-1">Change</span>
            </>
          )}
        </button>

        {/* Status preview indicator */}
        {previewUrl && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs">
            !
          </span>
        )}
      </div>

      {/* Action Controls & Information */}
      {showControls && (
        <div className="space-y-2">
          {previewUrl ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  New logo selected
                </span>
                <span className="text-[11px] text-muted-foreground">
                  ({selectedFile?.name})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="gap-1.5 text-xs h-7"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="size-3" />
                      Save Logo
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelPreview}
                  disabled={isUploading}
                  className="gap-1 text-xs h-7 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isRemoving}
                  className="gap-1.5 text-xs h-7 shadow-2xs"
                >
                  <UploadCloud className="size-3.5" />
                  {currentLogoUrl ? "Change Logo" : "Upload Logo"}
                </Button>

                {currentLogoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRemoveDialog(true)}
                    disabled={isUploading || isRemoving}
                    className="gap-1 text-xs h-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Accepts JPEG, PNG, or WebP up to 5MB.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Logo Removal */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Company Logo?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to remove your company logo? This will revert your organization branding to the initials fallback.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRemoveDialog(false)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isRemoving}
              className="gap-1.5"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  Confirm Remove
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
