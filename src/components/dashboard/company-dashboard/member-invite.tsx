"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Building2,
  Check,
  Crown,
  Info,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAddCompanyMember, useUserCompany } from "@/hook";
import type { ICompany } from "@/types";
import { type MemberInviteFormValues, memberInviteSchema } from "@/validation";

interface RoleOption {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badgeClass: string;
  borderActiveClass: string;
}

const ROLES: RoleOption[] = [
  {
    key: "ASSESSMENT_CREATOR",
    label: "Assessment Creator",
    icon: UserCheck,
    description:
      "Can create, edit, and configure assessment challenges, tests, and rubrics.",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    borderActiveClass:
      "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5",
  },
  {
    key: "EVALUATOR",
    label: "Evaluator",
    icon: Users,
    description:
      "Can inspect candidate submissions, review code runs, and grade assessments.",
    badgeClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    borderActiveClass:
      "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5",
  },
  {
    key: "COMPANY_ADMIN",
    label: "Company Admin",
    icon: ShieldCheck,
    description:
      "Full administrative access to manage assessments, team members, and settings.",
    badgeClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    borderActiveClass: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5",
  },
  {
    key: "COMPANY_OWNER",
    label: "Company Owner",
    icon: Crown,
    description:
      "Full organization ownership, billing access, and platform administration.",
    badgeClass:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    borderActiveClass:
      "border-purple-500 ring-2 ring-purple-500/20 bg-purple-500/5",
  },
];

export function MemberInvite() {
  const queryClient = useQueryClient();
  const { data: companyData, isLoading: companyLoading } = useUserCompany();
  const company: ICompany | undefined = companyData?.data || companyData;
  const companyId = company?.id;

  const { mutate: addMember, isPending: isSubmitting } = useAddCompanyMember();

  const defaultValues: MemberInviteFormValues = {
    email: "",
    role: "",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: memberInviteSchema,
      onSubmit: memberInviteSchema,
    },
    onSubmit: async ({ value }) => {
      if (!companyId) {
        toast.add({
          title: "Company Not Found",
          description:
            "Unable to find your company details. Please try refreshing.",
          type: "error",
        });
        return;
      }

      const selectedRoleConfig = ROLES.find((r) => r.key === value.role);
      const roleLabel = selectedRoleConfig
        ? selectedRoleConfig.label
        : value.role;

      addMember(
        {
          companyId,
          payload: {
            email: value.email.trim().toLowerCase(),
            role: value.role,
          },
        },
        {
          onSuccess: (res: unknown) => {
            const response = res as
              | { success?: boolean; message?: string }
              | undefined;
            if (response && response.success === false) {
              toast.add({
                title: "Invitation Failed",
                description:
                  response.message ||
                  "Could not invite member. Please try again.",
                type: "error",
              });
              return;
            }

            toast.add({
              title: "Member Added Successfully",
              description: `${value.email.trim()} has been added as ${roleLabel}.`,
              type: "success",
            });

            form.reset();

            queryClient.invalidateQueries({
              queryKey: ["company-members", companyId],
            });
            queryClient.invalidateQueries({
              queryKey: ["user-company"],
            });
          },
          onError: (err: unknown) => {
            const apiErr = err as {
              data?: { message?: string };
              response?: { data?: { message?: string } };
              message?: string;
            };
            const errorMessage =
              apiErr?.data?.message ||
              apiErr?.response?.data?.message ||
              apiErr?.message ||
              "Failed to add company member. Please check the email and try again.";

            toast.add({
              title: "Failed to Add Member",
              description: errorMessage,
              type: "error",
            });
          },
        },
      );
    },
  });

  const submissionAttempts = useStore(
    form.store,
    (state) => state.submissionAttempts,
  );

  return (
    <Card className="border-border/70 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-5 bg-gradient-to-r from-card to-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <UserPlus className="size-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Invite Team Member
                </CardTitle>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="size-3" />
                  Collaborate
                </span>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Add an evaluator, creator, or admin to your organization to
                collaborate on coding assessments.
              </CardDescription>
            </div>
          </div>

          {/* Company Pill */}
          <div className="self-start sm:self-auto">
            {companyLoading ? (
              <Skeleton className="h-7 w-32 rounded-full" />
            ) : company ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted border border-border text-foreground">
                <Building2 className="size-3.5 text-muted-foreground" />
                <span className="font-semibold truncate max-w-[160px]">
                  {company.name}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent className="p-6 space-y-6">
          {!companyLoading && !company && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="size-4 shrink-0" />
              <span>
                No organization found for your account. You need an active
                company to invite members.
              </span>
            </div>
          )}

          <FieldGroup className="space-y-6">
            {/* Email Field */}
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  (field.state.meta.isTouched || submissionAttempts > 0) &&
                  !field.state.meta.isValid;
                const errors = field.state.meta.errors.map((err) =>
                  typeof err === "string" ? { message: err } : err,
                );

                return (
                  <Field data-invalid={isInvalid} className="space-y-2">
                    <FieldLabel
                      htmlFor={field.name}
                      className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                    >
                      <Mail className="size-3.5 text-muted-foreground" />
                      Member Email Address
                    </FieldLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="colleague@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="email"
                        disabled={isSubmitting}
                        className="h-10 text-sm pl-9 bg-background"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      The invitation will be assigned to this email address.
                    </p>
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>

            {/* Role Selection Field */}
            <form.Field name="role">
              {(field) => {
                const isInvalid =
                  (field.state.meta.isTouched || submissionAttempts > 0) &&
                  !field.state.meta.isValid;
                const errors = field.state.meta.errors.map((err) =>
                  typeof err === "string" ? { message: err } : err,
                );
                const selectedRole = field.state.value;

                return (
                  <Field data-invalid={isInvalid} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-muted-foreground" />
                        Select Member Role
                      </FieldLabel>
                      <span className="text-[11px] text-muted-foreground">
                        Determines member permissions
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ROLES.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedRole === role.key;

                        return (
                          <button
                            type="button"
                            key={role.key}
                            aria-pressed={isSelected}
                            onClick={() => {
                              if (isSubmitting) return;
                              field.handleChange(role.key);
                              field.handleBlur();
                            }}
                            disabled={isSubmitting}
                            className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              isSelected
                                ? role.borderActiveClass
                                : "border-border/70 hover:border-border hover:bg-muted/30 bg-card"
                            } ${isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <div className="w-full">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center justify-center p-1.5 rounded-lg border ${role.badgeClass}`}
                                  >
                                    <Icon className="size-3.5" />
                                  </span>
                                  <span className="text-xs font-semibold text-foreground">
                                    {role.label}
                                  </span>
                                </div>

                                {/* Checkbox badge */}
                                <div
                                  className={`size-4 rounded-full flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground"
                                      : "border border-muted-foreground/30"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check className="size-2.5 stroke-[3]" />
                                  )}
                                </div>
                              </div>

                              <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                                {role.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>

            {/* Informational Callout */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/50 text-muted-foreground text-xs">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-medium text-foreground">
                  Immediate Role Assignment
                </span>
                <p className="text-[11px] leading-relaxed">
                  Invited members can log in using their email address to access
                  assigned assessments and company workspaces directly.
                </p>
              </div>
            </div>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border/40 p-4 bg-muted/10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
            onClick={() => form.reset()}
            className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Reset Form
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/company-admin/company-members"
              className="w-full sm:w-auto"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs cursor-pointer"
              >
                <Users className="size-3.5 mr-1" />
                View Team
              </Button>
            </Link>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || companyLoading || !companyId}
              className="w-full sm:w-auto text-xs font-medium cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  <span>Sending Invitation...</span>
                </>
              ) : (
                <>
                  <UserPlus className="size-3.5 mr-1" />
                  <span>Add Member</span>
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default MemberInvite;
