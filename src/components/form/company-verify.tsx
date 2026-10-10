"use client";

import { useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  useCompanyRegistration,
  useCompanyVerfication,
  useGetMe,
  useGetPaymentStatus,
  useRetryCompanyPayment,
} from "@/hook";

const RESEND_COOLDOWN = 120;

export default function VerifyCompanyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const status = searchParams.get("status")?.toLowerCase() || null;
  const paymentReference = searchParams.get("paymentReference") || "";
  const errorMessage = searchParams.get("message") || "";
  const emailParam = searchParams.get("email") || "";
  const devOtp = searchParams.get("devOtp") || "";

  const [otp, setOtp] = useState(devOtp || "");
  const [isInvalid, setIsInvalid] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [paymentInitiating, setPaymentInitiating] = useState(false);

  // Queries & Mutations
  const { data: userData } = useGetMe();
  const currentUser = (userData?.data as any)?.user || (userData?.data as any);
  const userCompany = currentUser?.companyMembers?.[0]?.company;

  const { mutate: verifyAccount, isPending: isVerifying } = useCompanyVerfication();
  const { mutate: resendRegistration, isPending: isResending } = useCompanyRegistration();
  const { mutate: retryPayment, isPending: isRetryingPayment } = useRetryCompanyPayment();

  // If returning with paymentReference, poll payment status
  const { data: paymentStatusData, isLoading: paymentStatusLoading } =
    useGetPaymentStatus(paymentReference || undefined);
  const paymentRecord = paymentStatusData?.data;

  // Refresh user state if payment succeeded
  useEffect(() => {
    if (status === "success") {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user-company"] });
    }
  }, [status, queryClient]);

  // Handle Resend OTP Timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Handle Triggering bKash Checkout URL
  const handleInitiateBkashPayment = (companyId?: string) => {
    setPaymentInitiating(true);
    retryPayment(
      { companyId: companyId || userCompany?.id },
      {
        onSuccess: (res) => {
          const bkashURL = (res as any)?.data?.bkashURL || (res as any)?.bkashURL;
          if (bkashURL) {
            toast.add({
              title: "Opening bKash Sandbox",
              description: "Redirecting you to the bKash checkout portal...",
              type: "info",
            });
            window.location.href = bkashURL;
          } else if ((res as any)?.data?.alreadyVerified) {
            toast.add({
              title: "Payment Already Verified",
              description: "Your company registration is already verified.",
              type: "success",
            });
            router.push("/company-admin");
          } else {
            toast.add({
              title: "Payment Initiation Issue",
              description: "Unable to retrieve bKash checkout link. Please try again.",
              type: "error",
            });
            setPaymentInitiating(false);
          }
        },
        onError: (err: any) => {
          setPaymentInitiating(false);
          const msg =
            err?.data?.message || err?.message || "Failed to initiate bKash payment. Please try again.";
          toast.add({
            title: "Payment Error",
            description: msg,
            type: "error",
          });
        },
      },
    );
  };

  // Submit OTP
  const handleOTP = () => {
    if (otp.length !== 6) {
      setIsInvalid(true);
      return;
    }

    const emailToVerify = emailParam || currentUser?.email || "";
    if (!emailToVerify) {
      toast.add({
        title: "Missing Email",
        description: "Company email could not be determined. Please register again.",
        type: "error",
      });
      router.push("/company-registration");
      return;
    }

    verifyAccount(
      {
        email: emailToVerify,
        otp,
      },
      {
        onSuccess: (res: any) => {
          const resData = res?.data || res;

          // Store session token if provided
          if (resData?.accessToken && typeof window !== "undefined") {
            localStorage.setItem("accessToken", resData.accessToken);
          }

          queryClient.invalidateQueries({ queryKey: ["user"] });
          queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

          const bkashURL = resData?.bkashURL;

          if (bkashURL) {
            toast.add({
              title: "OTP Verified Successfully",
              description: "Redirecting to bKash Sandbox checkout to complete registration fee...",
              type: "success",
            });
            // Critical: Redirect directly to bKash Sandbox checkout!
            window.location.href = bkashURL;
            return;
          }

          // If bKash URL was not immediately generated (e.g. gateway timeout)
          toast.add({
            title: "Company OTP Verified",
            description: "Please complete registration payment to activate your company.",
            type: "info",
          });
          // Initiate retry flow to obtain fresh checkout URL
          handleInitiateBkashPayment(resData?.id);
        },
        onError: (err: any) => {
          const msg =
            err?.data?.message || err?.message || "Invalid OTP code. Please try again.";
          setIsInvalid(true);
          toast.add({
            title: "Verification Failed",
            description: msg,
            type: "error",
          });
        },
      },
    );
  };

  const handleResend = () => {
    const emailToResend = emailParam || currentUser?.email || "";
    if (!emailToResend) return;

    resendRegistration(
      {
        name: userCompany?.name || "Company",
        email: emailToResend,
      },
      {
        onSuccess: (res: any) => {
          toast.add({
            title: "OTP Resent",
            description: "A new verification code has been dispatched to your email.",
            type: "success",
          });
          setResendTimer(RESEND_COOLDOWN);
          if (res?.data?.devOtp) {
            setOtp(res.data.devOtp);
          }
        },
        onError: (err: any) => {
          toast.add({
            title: "Resend Failed",
            description: err?.data?.message || err?.message || "Could not resend code.",
            type: "error",
          });
        },
      },
    );
  };

  // =========================================================================
  // VIEW 1: bKash Return Callback - SUCCESS
  // =========================================================================
  if (status === "success") {
    return (
      <Card className="shadow-md border-emerald-500/30">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="size-7" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Payment Verified!
          </CardTitle>
          <CardDescription className="text-xs">
            Your company registration payment has been verified by the bKash payment gateway.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-2 text-xs">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1.5">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="size-3.5" />
                VERIFIED & ACTIVE
              </span>
            </div>
            {paymentReference && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Reference</span>
                <span className="font-mono text-[11px] text-foreground">
                  {paymentReference}
                </span>
              </div>
            )}
            {paymentRecord?.bkashTransactionId && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Trx ID</span>
                <span className="font-mono text-[11px] text-foreground">
                  {paymentRecord.bkashTransactionId}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Amount Paid</span>
              <span className="font-semibold text-foreground">1,000.00 BDT</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            className="w-full gap-2 shadow-xs"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["user"] });
              queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
              router.push("/company-admin");
            }}
          >
            <span>Go to Company Dashboard</span>
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // =========================================================================
  // VIEW 2: bKash Return Callback - CANCELLED / FAILED / ERROR
  // =========================================================================
  if (status === "failed" || status === "cancelled" || status === "error") {
    const isCancelled = status === "cancelled";
    return (
      <Card className="shadow-md border-destructive/30">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
            {isCancelled ? (
              <AlertCircle className="size-7" />
            ) : (
              <XCircle className="size-7" />
            )}
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {isCancelled ? "Payment Cancelled" : "Payment Incomplete"}
          </CardTitle>
          <CardDescription className="text-xs">
            {errorMessage ||
              (isCancelled
                ? "You cancelled the bKash payment session. Your company workspace requires verification fee completion."
                : "The payment could not be completed on bKash. Please retry to activate your workspace.")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-2 text-xs">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1.5">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Payment Status</span>
              <span className="font-semibold text-destructive uppercase">
                {status}
              </span>
            </div>
            {paymentReference && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Reference</span>
                <span className="font-mono text-[11px] text-foreground">
                  {paymentReference}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Required Fee</span>
              <span className="font-semibold text-foreground">1,000.00 BDT</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            className="w-full gap-2 bg-[#E2136E] hover:bg-[#C91060] text-white shadow-xs"
            disabled={isRetryingPayment || paymentInitiating}
            onClick={() => handleInitiateBkashPayment()}
          >
            {isRetryingPayment || paymentInitiating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Opening bKash Portal...</span>
              </>
            ) : (
              <>
                <CreditCard className="size-4" />
                <span>Retry with bKash Sandbox</span>
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/")}
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // =========================================================================
  // VIEW 3: User Already Registered with Pending Payment
  // =========================================================================
  if (status === "pending" || (!emailParam && userCompany && userCompany.isPaymentVerified === false)) {
    return (
      <Card className="shadow-md border-amber-500/30">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
            <CreditCard className="size-7" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Complete Registration Payment
          </CardTitle>
          <CardDescription className="text-xs">
            Your company <strong>{userCompany?.name}</strong> is registered, but pending bKash verification payment.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-2 text-xs">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1.5">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Registration Status</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                PENDING PAYMENT
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Registration Fee</span>
              <span className="font-semibold text-foreground">1,000.00 BDT</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            className="w-full gap-2 bg-[#E2136E] hover:bg-[#C91060] text-white shadow-xs"
            disabled={isRetryingPayment || paymentInitiating}
            onClick={() => handleInitiateBkashPayment(userCompany?.id)}
          >
            {isRetryingPayment || paymentInitiating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Opening bKash Portal...</span>
              </>
            ) : (
              <>
                <CreditCard className="size-4" />
                <span>Pay 1,000 BDT with bKash</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // =========================================================================
  // VIEW 4: Default OTP Verification Input
  // =========================================================================
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Verify Company Email</CardTitle>
        <CardDescription>
          Enter the 6-digit verification code sent to{" "}
          <strong className="text-foreground">{emailParam || "your email"}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="otp-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOTP();
          }}
        >
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor="otp">Verification Code (OTP)</FieldLabel>

            <InputOTP
              maxLength={6}
              value={otp}
              name="otp"
              id="otp"
              pattern={REGEXP_ONLY_DIGITS}
              autoComplete="one-time-code"
              onChange={(value) => {
                setOtp(value);
                if (isInvalid) {
                  setIsInvalid(false);
                }
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            {isInvalid && (
              <FieldError
                errors={[{ message: "Please enter a valid 6-digit verification code" }]}
              />
            )}

            <FieldDescription className="text-xs">
              {resendTimer > 0
                ? `Resend code in ${resendTimer}s`
                : "Didn't receive the email? You can resend code now."}
            </FieldDescription>
          </Field>

          {devOtp && (
            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-[11px] text-muted-foreground">
              <span>Test Sandbox Code: </span>
              <strong className="font-mono text-primary">{devOtp}</strong>
            </div>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={resendTimer > 0 || isVerifying || isResending}
          onClick={handleResend}
          className="text-xs"
        >
          {isResending ? <Spinner /> : "Resend Code"}
        </Button>

        <Button
          type="submit"
          form="otp-form"
          disabled={isVerifying || otp.length !== 6}
          className="gap-1.5 text-xs flex-1"
        >
          {isVerifying ? (
            <>
              <Spinner /> Verifying & Initializing Payment...
            </>
          ) : (
            <>
              Verify & Proceed to Payment
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
