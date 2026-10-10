"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  FileUp,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
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
import { useRemoveResume, useUploadResume } from "@/hook/user.hook";
import type { IUser } from "@/types";

interface ProfileResumeUploaderProps {
  user: IUser;
}

const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function ProfileResumeUploader({ user }: ProfileResumeUploaderProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const { mutate: uploadResumeMutate, isPending: isUploading } = useUploadResume();
  const { mutate: removeResumeMutate, isPending: isRemoving } = useRemoveResume();

  const candidateProfile = user.candidateProfile;
  const currentResumeUrl = candidateProfile?.resumeUrl || null;
  const currentResumeName = candidateProfile?.resumeFileName || "Candidate_Resume.pdf";

  const handleValidateAndSelect = (file: File) => {
    // Validate PDF
    const isPdf =
      file.type.toLowerCase() === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast.add({
        title: "Invalid Document Format",
        description: "Only PDF documents (.pdf) are supported for resume uploads.",
        type: "error",
      });
      return;
    }

    if (file.size > MAX_RESUME_SIZE_BYTES) {
      toast.add({
        title: "File Exceeds Limit",
        description: `Document size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB maximum limit.`,
        type: "error",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleValidateAndSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleValidateAndSelect(file);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadResume = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("resume", selectedFile);

    uploadResumeMutate(formData, {
      onSuccess: async () => {
        toast.add({
          title: "Resume Uploaded Successfully",
          description: `"${selectedFile.name}" has been uploaded and linked to your profile.`,
          type: "success",
        });
        handleClearSelection();
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      },
      onError: (err: any) => {
        toast.add({
          title: "Upload Failed",
          description:
            err?.data?.message || err?.message || "Could not upload resume document.",
          type: "error",
        });
      },
    });
  };

  const handleConfirmRemove = () => {
    removeResumeMutate(undefined, {
      onSuccess: async () => {
        toast.add({
          title: "Resume Removed",
          description: "Your resume has been successfully removed.",
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
            err?.data?.message || err?.message || "Failed to delete resume. Please try again.",
          type: "error",
        });
      },
    });
  };

  const handleViewResume = () => {
    if (currentResumeUrl) {
      window.open(currentResumeUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={isUploading || isRemoving}
      />

      {/* Header Description */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <span>Curriculum Vitae / Resume</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Attach your PDF resume for technical recruiters and assessment evaluators.
          </p>
        </div>

        {currentResumeUrl && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3.5" />
            Uploaded
          </span>
        )}
      </div>

      {/* 1. Existing Resume Display Card */}
      {currentResumeUrl && !selectedFile && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                {currentResumeName}
              </p>
              <p className="text-xs text-muted-foreground">
                Document format: Portable Document Format (.PDF)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleViewResume}
              className="gap-1.5 text-xs"
            >
              <ExternalLink className="size-3.5" />
              <span>View Resume</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isRemoving}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Replace</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              disabled={isUploading || isRemoving}
              className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
            >
              <Trash2 className="size-3.5" />
              <span>Remove</span>
            </Button>
          </div>
        </div>
      )}

      {/* 2. File Selection Review State */}
      {selectedFile && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FileUp className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ready to upload: {(selectedFile.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              disabled={isUploading}
              className="size-8 p-0"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              onClick={handleUploadResume}
              disabled={isUploading}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Uploading to Cloud...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="size-3.5" />
                  <span>Confirm & Upload Resume</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              disabled={isUploading}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* 3. Drag and Drop Upload Zone (when no file is uploaded or selected) */}
      {!currentResumeUrl && !selectedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
            isDragOver
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border/80 hover:border-primary/60 hover:bg-muted/40"
          }`}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <UploadCloud className="size-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Click to upload, or drag and drop your resume
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF files only (maximum size 10MB)
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4 gap-1.5 pointer-events-none"
          >
            <FileText className="size-3.5" />
            <span>Select PDF File</span>
          </Button>
        </div>
      )}

      {/* Confirmation Dialog for Resume Removal */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Resume Document?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove your resume? Employers will no longer be able to view your uploaded document.
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
                  Removing...
                </>
              ) : (
                "Delete Resume"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
