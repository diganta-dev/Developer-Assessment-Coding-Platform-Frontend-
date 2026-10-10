"use client";

import { CreditCard, ExternalLink, Loader2, LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { useRetryCompanyPayment } from "@/hook";
import type { ICompany } from "@/types";

interface CompanyPaymentGuardProps {
  company: Partial<ICompany>;
}

export default function CompanyPaymentGuard({ company }: CompanyPaymentGuardProps) {
  const router = useRouter();
  const [isInitiating, setIsInitiating] = useState(false);
  const { mutate: retryPayment, isPending } = useRetryCompanyPayment();

  const handlePayWithBkash = () => {
    setIsInitiating(true);
    retryPayment(
      { companyId: company.id },
      {
        onSuccess: (res: any) => {
          const bkashURL = res?.data?.bkashURL || res?.bkashURL;
          if (bkashURL) {
            toast.add({
              title: "Redirecting to bKash",
              description: "Opening bKash Sandbox Checkout portal...",
              type: "info",
            });
            window.location.href = bkashURL;
          } else if (res?.data?.alreadyVerified) {
            toast.add({
              title: "Already Verified",
              description: "Your company registration is already verified.",
              type: "success",
            });
            router.refresh();
          } else {
            setIsInitiating(false);
            toast.add({
              title: "Payment Initialization Failed",
              description: "Could not retrieve checkout link. Please try again.",
              type: "error",
            });
          }
        },
        onError: (err: any) => {
          setIsInitiating(false);
          const msg =
            err?.data?.message || err?.message || "Failed to start payment. Please try again.";
          toast.add({
            title: "Payment Error",
            description: msg,
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div className="flex min-h-[75vh] w-full flex-col items-center justify-center p-6 text-center">
      <Card className="max-w-md w-full shadow-lg border-amber-500/30">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2 ring-8 ring-amber-500/5">
            <CreditCard className="size-7" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            Payment Verification Required
          </CardTitle>
          <CardDescription className="text-xs">
            Access to the company workspace and candidate assessments is locked until registration payment is verified.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-1 text-xs">
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 space-y-2 text-left">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Organization</span>
              <span className="font-semibold text-foreground">
                {company.name || "Company"}
              </span>
            </div>
            {company.slug && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Handle</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  @{company.slug}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Payment Status</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <ShieldAlert className="size-3.5" />
                PENDING (UNVERIFIED)
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground border-t border-border/40 pt-2">
              <span className="font-medium text-foreground">Registration Fee</span>
              <span className="font-bold text-sm text-foreground">1,000.00 BDT</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Complete the checkout in the bKash Sandbox environment using sandbox test credentials.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            className="w-full gap-2 bg-[#E2136E] hover:bg-[#C91060] text-white shadow-xs font-semibold"
            disabled={isPending || isInitiating}
            onClick={handlePayWithBkash}
          >
            {isPending || isInitiating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Opening bKash Portal...</span>
              </>
            ) : (
              <>
                <CreditCard className="size-4" />
                <span>Pay 1,000 BDT with bKash</span>
                <ExternalLink className="size-3.5 ml-auto" />
              </>
            )}
          </Button>

          <Link
            href="/"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "text-xs text-muted-foreground hover:text-foreground w-full",
            })}
          >
            Return to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
