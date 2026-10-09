"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  Code2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogout } from "@/hook";
import { getCompanyRole, getRoleDashboardRoute } from "@/utils";
import { UserMenu } from "../user-menu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useGetMe();
  const user = data?.data;
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleMobileLogout = () => {
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
    logout(undefined, {
      onSuccess: async () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        toast.add({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
          type: "success",
        });
        queryClient.setQueryData(["user"], null);
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        queryClient.clear();
        router.push("/login");
        router.refresh();
      },
      onError: (error: any) => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        toast.add({
          title: "Logged out",
          description: error?.message || "Session ended",
          type: "info",
        });
        queryClient.setQueryData(["user"], null);
        queryClient.clear();
        router.push("/login");
        router.refresh();
      },
    });
  };

  const navLinks = [
    { label: "Assessments", href: "/#assessments" },
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Enterprise", href: "/#enterprise" },
  ];

  const dashboardUrl = getRoleDashboardRoute(user);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Code2 className="size-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold leading-tight tracking-tight">
                DevAssess
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                PRO
              </span>
            </div>
            <span className="text-[11px] font-medium leading-none text-muted-foreground">
              Coding Assessment Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth / CTA Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <UserMenu user={user} />
              <Link
                href={dashboardUrl}
                className={buttonVariants({
                  variant: "default",
                  size: "sm",
                  className: "gap-1.5 shadow-sm",
                })}
              >
                <LayoutDashboard className="size-3.5" />
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/company-registration"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "gap-1.5",
                })}
              >
                <Building2 className="size-3.5" />
                For Employers
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={buttonVariants({
                  variant: "default",
                  size: "sm",
                  className: "gap-1.5 shadow-sm",
                })}
              >
                Get Started
                <ArrowRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex size-9 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-muted"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background/95 px-4 pt-3 pb-6 backdrop-blur md:hidden">
          <nav className="flex flex-col space-y-2 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <div className="flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground">
                <span className="truncate">
                  Signed in as{" "}
                  <strong className="text-foreground">
                    {user.name || user.email}
                  </strong>
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase shrink-0">
                  {getCompanyRole(user) || user.role}
                </span>
              </div>
              <Link
                href={dashboardUrl}
                onClick={() => setMobileMenuOpen(false)}
                className={buttonVariants({
                  variant: "default",
                  className: "w-full justify-center gap-1.5",
                })}
              >
                <LayoutDashboard className="size-4" />
                Go to Dashboard
              </Link>
              <Button
                variant="destructive"
                disabled={isLoggingOut}
                onClick={handleMobileLogout}
                className="w-full justify-center gap-1.5 cursor-pointer"
              >
                {isLoggingOut ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <Link
                href="/company-registration"
                onClick={() => setMobileMenuOpen(false)}
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full justify-center gap-1.5",
                })}
              >
                <Building2 className="size-4 text-muted-foreground" />
                For Employers / Register Company
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={buttonVariants({
                  variant: "ghost",
                  className: "w-full justify-center",
                })}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className={buttonVariants({
                  variant: "default",
                  className: "w-full justify-center gap-1.5",
                })}
              >
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
