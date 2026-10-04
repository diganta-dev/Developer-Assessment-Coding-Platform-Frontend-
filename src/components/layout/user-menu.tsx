"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { useLogout } from "@/hook";
import { IUser } from "@/types";
import { getCompanyRole, getRoleDashboardRoute, getUserEffectiveRole } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LayoutDashboard, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user: IUser;
}

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/[\s_]+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: logout, isPending } = useLogout();

  const effectiveRole = getUserEffectiveRole(user);
  const companyRole = getCompanyRole(user);
  const displayRole = companyRole || user.role;
  const dashboardUrl = getRoleDashboardRoute(user);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: async () => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs transition-all hover:border-border hover:bg-muted/70 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
        aria-label="User account menu"
      >
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="max-w-[120px] truncate font-medium text-foreground">
          {user.name || user.email}
        </span>
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {displayRole}
        </span>
        <ChevronDown className="size-3 text-muted-foreground transition-transform duration-200 group-data-popup-open:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-64 p-2 shadow-xl border border-border/70 bg-popover/95 backdrop-blur-md"
      >
        {/* User Card */}
        <div className="flex items-center gap-3 p-2">
          <Avatar className="size-9 ring-1 ring-border">
            {user.avatar && (
              <AvatarImage src={user.avatar} alt={user.name || "User"} />
            )}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(user.name || user.email || displayRole)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name || "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <div className="mt-1 flex items-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                <ShieldCheck className="size-3" />
                {displayRole}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Dashboard Link */}
        <DropdownMenuItem
          onClick={() => router.push(dashboardUrl)}
          className="cursor-pointer gap-2 py-2"
        >
          <LayoutDashboard className="size-4 text-muted-foreground" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Logout Button */}
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={handleLogout}
          className="cursor-pointer gap-2 py-2 font-medium text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          <span>{isPending ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
