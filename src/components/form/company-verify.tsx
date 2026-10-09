"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCompanyVerfication, useVerifyAccount } from "@/hook";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Spinner } from "../ui/spinner";
import { toast } from "../ui/toast";

const RESEND_COOLDOWN = 120;

export default function VerifyCompanyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const { mutate: verifyAccount, isPending: isVerifying } =
    useCompanyVerfication();

  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      router.push("/");
    }
  }, [email, router]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleOTP = () => {
    if (otp.length !== 6) {
      setIsInvalid(true);
      return;
    }

    verifyAccount(
      {
        email,
        otp,
      },
      {
        onSuccess: (res) => {
          if (!res.success) {
            toast.add({
              title: "Verification Failed",
              description: "Something went wrong. Please try again",
              type: "error",
            });
            return;
          }

          toast.add({
            title: "Verification Successful",
            description: "Welcome onboard",
            type: "success",
          });

          router.push("/");
        },

        onError: (err) => {
          toast.add({
            title: "Verification Failure",
            description:
              err.message || "Something went wrong. Please try again",
            type: "error",
          });
        },
      },
    );
  };

  const handleResend = () => {
    // Resend OTP logic will go here
    setResendTimer(RESEND_COOLDOWN);
  };

  if (!email) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Company</CardTitle>
        <CardDescription>
          Please provide the OTP we sent you in your email
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
            <FieldLabel htmlFor="otp">OTP</FieldLabel>

            <InputOTP
              maxLength={6}
              value={otp}
              name="otp"
              id="otp"
              pattern={REGEXP_ONLY_DIGITS}
              autoComplete="off"
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
                errors={[{ message: "Invalid code. Please try again" }]}
              />
            )}

            <FieldDescription>
              {resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : "You can resend OTP now"}
            </FieldDescription>
          </Field>
        </form>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={resendTimer > 0 || isVerifying}
          onClick={handleResend}
        >
          Resend
        </Button>

        <Button type="submit" form="otp-form" disabled={isVerifying}>
          {isVerifying ? (
            <>
              <Spinner /> Submitting
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
