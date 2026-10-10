"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Globe,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useUpdateCompany } from "@/hook/company.hook";
import type { ICompany } from "@/types";
import { CompanyLogoUploader } from "./company-logo-uploader";

interface EditCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: ICompany;
}

export function EditCompanyDialog({
  open,
  onOpenChange,
  company,
}: EditCompanyDialogProps) {
  const queryClient = useQueryClient();
  const updateCompanyMutation = useUpdateCompany();

  const [name, setName] = useState(company.name || "");
  const [description, setDescription] = useState(company.description || "");
  const [website, setWebsite] = useState(company.website || "");
  const [logoUrl, setLogoUrl] = useState(company.logoUrl || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state with company prop on open
  useEffect(() => {
    if (open) {
      setName(company.name || "");
      setDescription(company.description || "");
      setWebsite(company.website || "");
      setLogoUrl(company.logoUrl || "");
      setErrorMsg(null);
    }
  }, [open, company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Company name is required.");
      return;
    }

    setErrorMsg(null);
    updateCompanyMutation.mutate(
      {
        companyId: company.id,
        payload: {
          name: name.trim(),
          description: description.trim() || null,
          website: website.trim() || null,
          logoUrl: logoUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Company profile updated",
            description:
              "Your company profile changes were successfully saved.",
            type: "success",
          });
          queryClient.invalidateQueries({ queryKey: ["user-company"] });
          onOpenChange(false);
        },
        onError: (err: Error & { data?: { message?: string } }) => {
          const message =
            err?.data?.message ||
            err?.message ||
            "Failed to update company details.";
          setErrorMsg(message);
          toast.add({
            title: "Update failed",
            description: message,
            type: "error",
          });
        },
      },
    );
  };

  const getInitials = (val?: string) => {
    if (!val) return "CO";
    const parts = val.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        className="p-5 sm:p-6 max-h-[88vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1 pb-1">
            <div className="flex items-center gap-1.5 text-primary font-medium text-xs">
              <Sparkles className="size-3.5" />
              <span>Workspace Administration</span>
            </div>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Edit Company Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update organization identity, branding logo, and public mission
              statement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {errorMsg && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-xs">
                {errorMsg}
              </div>
            )}

            {/* Logo Uploader */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <ImageIcon className="size-3.5 text-primary" />
                Company Profile Picture / Logo
              </Label>
              <CompanyLogoUploader company={company} size="md" showControls={true} />
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-semibold">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="Acme Corp"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="h-9 text-xs"
                disabled={updateCompanyMutation.isPending}
                required
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <Label
                htmlFor="companyWebsite"
                className="text-xs font-semibold flex items-center gap-1.5"
              >
                <Globe className="size-3.5 text-muted-foreground" />
                Website URL
              </Label>
              <Input
                id="companyWebsite"
                placeholder="https://acme.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="h-9 text-xs font-mono"
                disabled={updateCompanyMutation.isPending}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="companyDescription"
                  className="text-xs font-semibold"
                >
                  About Organization
                </Label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {description.length} chars
                </span>
              </div>
              <Textarea
                id="companyDescription"
                placeholder="Share your engineering vision, tech stack, and what makes your team exceptional..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="text-xs resize-none"
                disabled={updateCompanyMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateCompanyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateCompanyMutation.isPending}
              className="gap-1.5"
            >
              {updateCompanyMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
