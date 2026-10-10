"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.6H9.2v-8.6H6.46M7.83 6.45c-.96 0-1.74.78-1.74 1.74 0 .96.78 1.74 1.74 1.74.96 0 1.74-.78 1.74-1.74 0-.96-.78-1.74-1.74-1.74Z" />
    </svg>
  );
}
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useUpdateMyProfile } from "@/hook/user.hook";
import type { IUpdateProfilePayload, IUser } from "@/types";

interface ProfileDetailsEditorProps {
  user: IUser;
}

export function ProfileDetailsEditor({ user }: ProfileDetailsEditorProps) {
  const queryClient = useQueryClient();
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();

  const candidateProfile = user.candidateProfile;

  // Form states
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(candidateProfile?.phone || "");
  const [location, setLocation] = useState(candidateProfile?.location || "");
  const [bio, setBio] = useState(candidateProfile?.bio || "");
  const [githubUrl, setGithubUrl] = useState(candidateProfile?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(candidateProfile?.linkedinUrl || "");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form if external user state changes (e.g. after query invalidation)
  useEffect(() => {
    setName(user.name || "");
    setPhone(user.candidateProfile?.phone || "");
    setLocation(user.candidateProfile?.location || "");
    setBio(user.candidateProfile?.bio || "");
    setGithubUrl(user.candidateProfile?.githubUrl || "");
    setLinkedinUrl(user.candidateProfile?.linkedinUrl || "");
    setErrors({});
  }, [user]);

  const initialName = user.name || "";
  const initialPhone = candidateProfile?.phone || "";
  const initialLocation = candidateProfile?.location || "";
  const initialBio = candidateProfile?.bio || "";
  const initialGithub = candidateProfile?.githubUrl || "";
  const initialLinkedin = candidateProfile?.linkedinUrl || "";

  const isDirty =
    name !== initialName ||
    phone !== initialPhone ||
    location !== initialLocation ||
    bio !== initialBio ||
    githubUrl !== initialGithub ||
    linkedinUrl !== initialLinkedin;

  const handleReset = () => {
    setName(initialName);
    setPhone(initialPhone);
    setLocation(initialLocation);
    setBio(initialBio);
    setGithubUrl(initialGithub);
    setLinkedinUrl(initialLinkedin);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (phone.trim() && phone.trim().length > 30) {
      newErrors.phone = "Phone number must be under 30 characters.";
    }

    if (githubUrl.trim()) {
      const gUrl = githubUrl.trim();
      if (!gUrl.startsWith("http://") && !gUrl.startsWith("https://")) {
        newErrors.githubUrl = "Please provide a valid URL starting with http:// or https://";
      }
    }

    if (linkedinUrl.trim()) {
      const lUrl = linkedinUrl.trim();
      if (!lUrl.startsWith("http://") && !lUrl.startsWith("https://")) {
        newErrors.linkedinUrl = "Please provide a valid URL starting with http:// or https://";
      }
    }

    if (bio.trim().length > 500) {
      newErrors.bio = "Bio cannot exceed 500 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: IUpdateProfilePayload = {
      name: name.trim(),
      phone: phone.trim() || null,
      location: location.trim() || null,
      bio: bio.trim() || null,
      githubUrl: githubUrl.trim() || null,
      linkedinUrl: linkedinUrl.trim() || null,
    };

    updateProfile(payload, {
      onSuccess: async (response) => {
        toast.add({
          title: "Profile Updated",
          description: response?.message || "Your profile details have been saved successfully.",
          type: "success",
        });
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      },
      onError: (err: any) => {
        const errorMsg =
          err?.data?.message || err?.message || "Failed to update profile. Please try again.";
        toast.add({
          title: "Update Failed",
          description: errorMsg,
          type: "error",
        });
      },
    });
  };

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="size-4 text-primary" />
              Personal & Professional Details
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your personal identification, contact channels, and portfolio links.
            </CardDescription>
          </div>
          {isDirty && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Unsaved changes
            </span>
          )}
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-5">
          {/* Row 1: Name & Email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-xs font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-name"
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-8 text-xs"
                  disabled={isPending}
                  aria-invalid={!!errors.name}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-xs font-medium text-foreground">
                Email Address <span className="text-[10px] text-muted-foreground">(Read-only)</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  className="pl-8 text-xs bg-muted/50 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Email is tied to your login credentials and verified authentication.
              </p>
            </div>
          </div>

          {/* Row 2: Phone & Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone" className="text-xs font-medium text-foreground">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-phone"
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-8 text-xs"
                  disabled={isPending}
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-location" className="text-xs font-medium text-foreground">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-location"
                  type="text"
                  placeholder="e.g. San Francisco, CA / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-8 text-xs"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-bio" className="text-xs font-medium text-foreground">
                Professional Bio
              </Label>
              <span className="text-[10px] text-muted-foreground">
                {bio.length} / 500 characters
              </span>
            </div>
            <Textarea
              id="profile-bio"
              rows={3}
              placeholder="Brief summary of your technical background, core programming stacks, and engineering specializations..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="text-xs min-h-[70px]"
              disabled={isPending}
              aria-invalid={!!errors.bio}
            />
            {errors.bio && (
              <p className="text-[11px] text-destructive">{errors.bio}</p>
            )}
          </div>

          {/* Row 4: GitHub & LinkedIn URLs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-github" className="text-xs font-medium text-foreground">
                GitHub Profile URL
              </Label>
              <div className="relative">
                <GithubIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-github"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="pl-8 text-xs"
                  disabled={isPending}
                  aria-invalid={!!errors.githubUrl}
                />
              </div>
              {errors.githubUrl && (
                <p className="text-[11px] text-destructive">{errors.githubUrl}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-linkedin" className="text-xs font-medium text-foreground">
                LinkedIn Profile URL
              </Label>
              <div className="relative">
                <LinkedinIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="profile-linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="pl-8 text-xs"
                  disabled={isPending}
                  aria-invalid={!!errors.linkedinUrl}
                />
              </div>
              {errors.linkedinUrl && (
                <p className="text-[11px] text-destructive">{errors.linkedinUrl}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-2 border-t border-border/40 pt-3 pb-3 bg-muted/20">
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={handleReset}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Discard Changes
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={isPending || !isDirty}
            className="gap-1.5 text-xs min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
