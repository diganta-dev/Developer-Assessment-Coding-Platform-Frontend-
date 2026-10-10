"use client";

import { useForm } from "@tanstack/react-form";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCompanyRegistration, useGetMe } from "@/hook";
import { companyRegistrationSchema } from "@/validation";
import { Spinner } from "../ui/spinner";
import { toast } from "../ui/toast";

export function CompanyRegisterForm() {
  const router = useRouter();
  const { data: userData, isLoading: authLoading } = useGetMe();

  type CompanyDefaultValues = z.infer<typeof companyRegistrationSchema>;

  const defaultValues: CompanyDefaultValues = {
    name: "",
    email: "",
    description: "",
    website: "",
  };

  const { mutate: registration, isPending: registrationPending } =
    useCompanyRegistration();

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: companyRegistrationSchema,
    },
    onSubmit: async ({ value }) => {
      const registrationData = {
        name: value.name,
        email: value.email,
        description: value.description,
        website: value.website,
      };

      registration(registrationData, {
        onSuccess: (res) => {
          if (!res.success) {
            toast.add({
              title: "Server Failure",
              description: "Something went wrong. Please try again",
              type: "error",
            });
            return;
          }

          toast.add({
            title: "Registration OTP Sent",
            description: "Please check your company email for the 6-digit verification code",
            type: "success",
          });
          const params = new URLSearchParams({ email: registrationData.email });
          if ((res as any)?.data?.devOtp) {
            params.set("devOtp", (res as any).data.devOtp);
          }
          router.push(
            `/company-registration/verify-company?${params.toString()}`,
          );
        },
        onError: (err: any) => {
          const errMsg =
            err?.data?.message ||
            err?.message ||
            "Failed to initiate company registration. Please try again";
          toast.add({
            title: "Registration Failed",
            description: errMsg,
            type: "error",
          });
        },
      });
    },
  });

  const currentUser = (userData?.data as any)?.user || (userData?.data as any);
  const existingCompany =
    currentUser?.companyMembers?.[0]?.company || (currentUser as any)?.company;

  if (!authLoading && !currentUser) {
    return (
      <div className="flex flex-col gap-4 border p-6 m-2 rounded-md w-[380px] mx-auto text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <Building2 className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Login Required</h2>
        <p className="text-sm text-muted-foreground">
          You must be logged in to register a company. Please log in or create an account first.
        </p>
        <Button onClick={() => router.push("/login?redirect=/company-registration")}>
          Go to Login
        </Button>
      </div>
    );
  }

  if (!authLoading && existingCompany) {
    const isPaid = existingCompany.isPaymentVerified !== false;

    return (
      <div className="flex flex-col gap-4 border p-6 m-2 rounded-md w-[380px] mx-auto text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="size-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">
          {isPaid ? "Already Associated" : "Payment Required"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isPaid ? (
            <>
              You are already associated with <strong>{existingCompany.name}</strong>. A user can only manage one company.
            </>
          ) : (
            <>
              Your company <strong>{existingCompany.name}</strong> is registered, but registration payment has not been completed.
            </>
          )}
        </p>
        {isPaid ? (
          <Button onClick={() => router.push("/company-admin")}>
            Go to Company Dashboard
          </Button>
        ) : (
          <Button
            className="bg-[#E2136E] hover:bg-[#C91060] text-white"
            onClick={() => router.push("/company-registration/verify-company?status=pending")}
          >
            Complete Payment with bKash
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 border p-6 m-2 rounded-md w-[380px] mx-auto shadow-sm">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Building2 className="size-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Register Company</h1>
        <p className="text-sm text-muted-foreground">
          Enter company details below to initiate registration
        </p>
      </div>

      {currentUser && (
        <div className="flex flex-col gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate">
              Logged in as: <strong>{currentUser.name || currentUser.email}</strong>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-emerald-500/15">
            <span>Registration Fee:</span>
            <span className="font-semibold text-foreground">1,000 BDT via bKash</span>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Company Name</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Company Name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="name"
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="website">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Company Website</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="https://example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="description">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Company Description
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Description about your company"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button disabled={registrationPending} type="submit">
            {registrationPending ? (
              <>
                <Spinner /> submitting
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
