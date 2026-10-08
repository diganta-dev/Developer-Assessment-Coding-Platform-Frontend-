"use client";

import { useForm } from "@tanstack/react-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../ui/field";

import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "../ui/toast";
import { Spinner } from "../ui/spinner";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { loginSchema } from "@/validation";
import { useLogin } from "@/hook";
import { useQueryClient } from "@tanstack/react-query";
import { ForgotPasswordDialog } from "./forgot-password-dialog";
import { getRoleDashboardRoute } from "@/utils/role-routes";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: login, isPending: loginPending } = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    // defaultValues: {
    //   email: "superadmin@gmail.com",
    //   password: "Super@admin12345",
    // },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: ({ value }) => {
      const loginData = {
        email: value.email,
        password: value.password,
      };
      login(loginData, {
        onSuccess: async (res: any) => {
          if (res?.data?.requiresVerification) {
            toast.add({
              title: "Verification Required",
              description: "Please verify your account OTP to continue.",
              type: "warning",
            });
            router.push(`/register/verify-account?email=${encodeURIComponent(res.data.email || value.email)}`);
            return;
          }

          if (res?.data?.accessToken && typeof window !== "undefined") {
            localStorage.setItem("accessToken", res.data.accessToken);
          }

          toast.add({
            title: "Login successful",
            description: "You have been logged in successfully",
            type: "success",
          });

          if (res?.data?.user) {
            queryClient.setQueryData(["user"], { data: res.data.user });
            queryClient.setQueryData(["auth", "me"], { data: res.data.user });
          }

          await queryClient.invalidateQueries({ queryKey: ["user"] });
          await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

          const destination = res?.data?.user
            ? getRoleDashboardRoute(res.data.user)
            : "/dashboard";

          router.push(destination);
        },
        onError: (error) => {
          toast.add({
            title: "Login failed",
            description: error.message,
            type: "error",
          });
        },
      });
    },
  });

  return (
    <div className="flex flex-col gap-5  border rounded-xl ">
      <div className="pt-6 px-2">
        <div className="flex flex-col items-center gap-2 text-center ">
          <h1 className="text-2xl font-bold tracking-tight">
            Login to your account
          </h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
      </div>

      <form
        className="px-6 mb-2"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    value={field.state.value}
                    autoComplete="off"
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-xs text-primary hover:underline font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      value={field.state.value}
                      autoComplete="off"
                      aria-invalid={isInvalid}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeClosed className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button disabled={loginPending} type="submit">
            {loginPending ? (
              <>
                <Spinner /> submitting
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </FieldGroup>
      </form>

      <FieldSeparator>Or continue with</FieldSeparator>

      <div className="text-center text-sm text-muted-foreground mb-4">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          Register
        </Link>
      </div>

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </div>
  );
}
