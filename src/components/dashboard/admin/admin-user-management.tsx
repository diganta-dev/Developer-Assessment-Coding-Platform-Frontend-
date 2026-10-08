"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  Unlock,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  useDeleteAdminUser,
  useGetAdminUsers,
  useUpdateAdminUserStatus,
} from "@/hook/admin.hook";
import type { IAdminUserListItem } from "@/types/admin.type";
import { UserRole } from "@/types/user.type";

export function AdminUserManagement() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [deleteTargetUser, setDeleteTargetUser] = useState<IAdminUserListItem | null>(null);

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useGetAdminUsers({
      page,
      limit,
      searchTerm: searchTerm || undefined,
      role: selectedRole === "ALL" ? undefined : selectedRole,
      isActive:
        selectedStatus === "ALL"
          ? undefined
          : selectedStatus === "ACTIVE"
            ? true
            : false,
    });

  const updateUserStatusMutation = useUpdateAdminUserStatus();
  const deleteUserMutation = useDeleteAdminUser();

  const users: IAdminUserListItem[] = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const meta = data?.meta;

  const handleToggleStatus = (targetUser: IAdminUserListItem) => {
    const newStatus = !targetUser.isActive;

    updateUserStatusMutation.mutate(
      {
        id: targetUser.id,
        payload: { isActive: newStatus },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
          toast.add({
            title: "User Status Updated",
            description: `${targetUser.name} is now ${newStatus ? "Active" : "Deactivated"}.`,
            type: "success",
          });
        },
        onError: (err: unknown) => {
          const apiErr = err as { data?: { message?: string }; message?: string };
          toast.add({
            title: "Update Failed",
            description: apiErr?.data?.message || apiErr?.message || "Could not update user status.",
            type: "error",
          });
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetUser) return;

    deleteUserMutation.mutate(deleteTargetUser.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
        toast.add({
          title: "User Deleted",
          description: `User "${deleteTargetUser.name}" has been permanently removed.`,
          type: "success",
        });
        setDeleteTargetUser(null);
      },
      onError: (err: unknown) => {
        const apiErr = err as { data?: { message?: string }; message?: string };
        toast.add({
          title: "Delete Failed",
          description: apiErr?.data?.message || apiErr?.message || "Cannot delete user with active dependencies.",
          type: "error",
        });
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* ── Filters Toolbar ── */}
      <Card className="p-3 sm:p-4 border-border/70 shadow-xs bg-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-8 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <div className="flex items-center gap-1">
              {(["ALL", UserRole.CANDIDATE, UserRole.ADMIN, UserRole.SUPER_ADMIN] as const).map(
                (role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                      selectedRole === role
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {role}
                  </button>
                ),
              )}
            </div>

            <span className="text-border">|</span>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    selectedStatus === st
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`size-3 ${isRefetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Users Table ── */}
      <Card className="border-border/70 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`user-skel-${i + 1}`} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Failed to load platform users
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {error instanceof Error ? error.message : "Ensure you have platform administrator rights."}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="text-xs">
              Retry
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-muted-foreground">
            <Users className="size-8 mx-auto opacity-40" />
            <p className="text-xs font-semibold text-foreground">No users found</p>
            <p className="text-[11px]">Adjust your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Attempts / Tests</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 rounded-full border border-border/60">
                          <AvatarImage src={usr.profilePictureUrl || undefined} />
                          <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                            {usr.name ? usr.name.slice(0, 2).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{usr.name}</p>
                          <p className="text-[11px] text-muted-foreground">{usr.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted border border-border/60">
                        {usr.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {usr.companyName ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="size-3" />
                          {usr.companyName}
                        </span>
                      ) : (
                        <span>Independent</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          usr.isActive
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        }`}
                      >
                        {usr.isActive ? (
                          <CheckCircle2 className="size-2.5" />
                        ) : (
                          <XCircle className="size-2.5" />
                        )}
                        {usr.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground text-[11px] font-mono">
                      {usr.totalAttempts} attempts
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={updateUserStatusMutation.isPending}
                          onClick={() => handleToggleStatus(usr)}
                          className="h-7 px-2 text-[11px] font-medium gap-1"
                          title={usr.isActive ? "Deactivate User" : "Activate User"}
                        >
                          {usr.isActive ? (
                            <>
                              <Lock className="size-3 text-amber-500" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Unlock className="size-3 text-emerald-500" />
                              Activate
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteTargetUser(usr)}
                          className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete User"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {meta && meta.totalPages > 1 && (
          <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} registered users)
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={Boolean(deleteTargetUser)}
        onOpenChange={(open) => {
          if (!open && !deleteUserMutation.isPending) {
            setDeleteTargetUser(null);
          }
        }}
      >
        <DialogContent size="md" className="p-5 sm:p-6 gap-4">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
                <ShieldAlert className="size-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Confirm User Deletion
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  This action is permanent and cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {deleteTargetUser && (
            <div className="rounded-xl border border-border/70 bg-muted/40 p-3 space-y-1 my-1">
              <p className="text-xs font-semibold text-foreground">
                {deleteTargetUser.name}
              </p>
              <p className="text-[11px] font-mono text-muted-foreground">
                {deleteTargetUser.email}
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete this user? Associated records, active
            sessions, and invitations will be permanently removed.
          </p>

          <DialogFooter className="gap-2 sm:gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteTargetUser(null)}
              disabled={deleteUserMutation.isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleteUserMutation.isPending}
              onClick={handleConfirmDelete}
              className="text-xs font-semibold gap-1.5"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Deleting User...
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  Confirm & Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminUserManagement;
