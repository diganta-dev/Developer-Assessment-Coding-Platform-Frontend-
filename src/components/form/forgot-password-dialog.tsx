"use client";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeClosed,
  KeyRound,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useForgotPassword, useResetPassword } from "@/hook/auth.hook";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
}: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<"REQUEST_OTP" | "RESET_PASSWORD">(
    "REQUEST_OTP",
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const forgotMutation = useForgotPassword();
  const resetMutation = useResetPassword();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    forgotMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          toast.add({
            title: "Verification Code Sent",
            description: `We've dispatched a 6-digit verification code to ${email.trim()}.`,
            type: "success",
          });
          setStep("RESET_PASSWORD");
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };
          setErrorMsg(
            apiErr?.data?.message ||
              apiErr?.message ||
              "Failed to send reset code. Please check your email.",
          );
        },
      },
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg("Please enter the 6-digit OTP sent to your email.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    resetMutation.mutate(
      {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Password Reset Successful",
            description:
              "Your credentials have been updated. You can now log in.",
            type: "success",
          });
          onOpenChange(false);
          // Reset form state
          setStep("REQUEST_OTP");
          setEmail("");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err: unknown) => {
          const apiErr = err as {
            data?: { message?: string };
            message?: string;
          };
          setErrorMsg(
            apiErr?.data?.message ||
              apiErr?.message ||
              "Invalid OTP or expired token. Please try again.",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-5 sm:p-6 gap-4">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {step === "REQUEST_OTP"
                  ? "Reset Account Password"
                  : "Enter Code & Set New Password"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {step === "REQUEST_OTP"
                  ? "Enter your registered email to receive a 6-digit recovery OTP."
                  : `Enter the code sent to ${email} and choose a secure password.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === "REQUEST_OTP" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="reset-email"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Registered Email
              </label>
              <Input
                id="reset-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={forgotMutation.isPending}
              className="w-full h-10 text-xs font-semibold"
            >
              {forgotMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> Sending Recovery Code...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-3.5 w-3.5" /> Send Verification Code
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="reset-otp"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                6-Digit Verification Code (OTP)
              </label>
              <Input
                id="reset-otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="h-10 text-xs font-mono tracking-widest text-center"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                New Password
              </label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-10 text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeClosed className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="text-xs font-semibold text-foreground"
              >
                Confirm New Password
              </label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-10 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep("REQUEST_OTP")}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={forgotMutation.isPending}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <RefreshCw
                  className={`h-3 w-3 ${forgotMutation.isPending ? "animate-spin" : ""}`}
                />
                Resend Code
              </button>
            </div>

            <Button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full h-10 text-xs font-semibold"
            >
              {resetMutation.isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> Updating Password...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Reset Password
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
