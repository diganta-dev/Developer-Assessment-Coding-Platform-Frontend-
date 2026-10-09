import { ArrowLeft, LayoutDashboard, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AccessDenied() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5 mb-6">
        <ShieldAlert className="size-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Access Denied
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You do not have permission to access this page with your current account
        role.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Home
        </Link>
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          <LayoutDashboard className="mr-1.5 size-4" />
          Go to Your Dashboard
        </Link>
      </div>
    </div>
  );
}
