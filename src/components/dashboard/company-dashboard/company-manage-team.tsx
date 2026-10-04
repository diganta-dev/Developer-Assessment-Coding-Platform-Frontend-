"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserCompany, useCompanyMembers, useUpdateCompanyMemberRole } from "@/hook";
import { ICompany, ICompanyMemberItem } from "@/types";
import { toast } from "@/components/ui/toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Calendar,
    Check,
    ChevronDown,
    Crown,
    Loader2,
    Mail,
    Search,
    ShieldCheck,
    UserCheck,
    Users,
} from "lucide-react";

const ROLES = [
    {
        key: "COMPANY_OWNER",
        label: "Owner",
        icon: Crown,
        badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
    },
    {
        key: "COMPANY_ADMIN",
        label: "Admin",
        icon: ShieldCheck,
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
    },
    {
        key: "ASSESSMENT_CREATOR",
        label: "Creator",
        icon: UserCheck,
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
    },
    {
        key: "EVALUATOR",
        label: "Evaluator",
        icon: Users,
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
    },
];

function getRoleConfig(role: string) {
    return (
        ROLES.find((r) => r.key === role) || {
            key: role,
            label: role.replace(/_/g, " "),
            icon: Users,
            badgeClass: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
        }
    );
}

function getInitials(name?: string) {
    if (!name) return "U";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateStr?: string | Date) {
    if (!dateStr) return "N/A";
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return "N/A";
    }
}

export function ManageTeam() {
    const [searchTerm, setSearchTerm] = useState("");
    const [rolesState, setRolesState] = useState<Record<string, string>>({});

    const { data: companyData, isLoading: companyLoading } = useUserCompany();
    const company: ICompany | undefined = companyData?.data || companyData;
    const companyId = company?.id;

    const { data: membersData, isLoading: membersLoading } = useCompanyMembers(companyId);
    console.log(membersData)

    const membersList: ICompanyMemberItem[] = Array.isArray(membersData?.data)
        ? membersData.data
        : Array.isArray(membersData)
            ? membersData
            : [];

    const isLoading = companyLoading || (Boolean(companyId) && membersLoading);

    const getRoleForMember = (member: ICompanyMemberItem) => {
        return rolesState[member.id] || member.role;
    };

    const queryClient = useQueryClient();
    const updateRoleMutation = useUpdateCompanyMemberRole();

    const handleRoleChange = (member: ICompanyMemberItem, newRole: string) => {
        if (!companyId) return;
        const previousRole = getRoleForMember(member);
        if (previousRole === newRole) return;

        // Optimistic UI update
        setRolesState((prev) => ({
            ...prev,
            [member.id]: newRole,
        }));

        const memberUserId = member.userId || member.user?.id || member.id;

        updateRoleMutation.mutate(
            {
                companyId,
                memberUserId,
                payload: { role: newRole },
            },
            {
                onSuccess: () => {
                    toast.add({
                        title: "Role updated",
                        description: `Role successfully updated to ${newRole.replace(/_/g, " ")}.`,
                        type: "success",
                    });
                    queryClient.invalidateQueries({
                        queryKey: ["company-members", companyId],
                    });
                },
                onError: (error: any) => {
                    // Revert back on error
                    setRolesState((prev) => ({
                        ...prev,
                        [member.id]: previousRole,
                    }));
                    toast.add({
                        title: "Failed to update role",
                        description:
                            error?.data?.message ||
                            error?.message ||
                            "Could not update member role. Please try again.",
                        type: "error",
                    });
                },
            }
        );
    };

    const filteredMembers = membersList.filter((member) => {
        const name = member.user?.name?.toLowerCase() || "";
        const email = member.user?.email?.toLowerCase() || "";
        const role = getRoleForMember(member).toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term) || role.includes(term);
    });

    return (
        <Card className="shadow-xs border-border/70">
            <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-semibold">
                                Team Members
                            </CardTitle>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                {isLoading ? "..." : `${membersList.length} Total`}
                            </span>
                        </div>
                        <CardDescription className="text-xs">
                            Manage your organization team members, roles, and permissions
                        </CardDescription>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-9 rounded-full" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                        <p className="text-sm font-medium text-foreground">
                            {searchTerm ? "No members match your search" : "No members found"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {searchTerm
                                ? "Try searching by a different name, email, or role."
                                : "Invite evaluators and challenge creators to collaborate."}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="w-[300px]">Member</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Joined Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.map((member) => {
                                const displayName =
                                    member.user?.name ||
                                    `Member (${member.role.replace(/_/g, " ").toLowerCase()})`;
                                const displayEmail =
                                    member.user?.email || `ID: ${member.userId}`;

                                const currentRole = getRoleForMember(member);
                                const currentRoleConfig = getRoleConfig(currentRole);
                                const CurrentIcon = currentRoleConfig.icon;
                                const isUpdatingThisMember =
                                    updateRoleMutation.isPending &&
                                    updateRoleMutation.variables?.memberUserId === (member.userId || member.user?.id || member.id);

                                return (
                                    <TableRow
                                        key={member.id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9 rounded-full ring-1 ring-border/50 shrink-0">
                                                    {member.user?.avatar ? (
                                                        <AvatarImage
                                                            src={member.user.avatar}
                                                            alt={displayName}
                                                            className="object-cover"
                                                        />
                                                    ) : null}
                                                    <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-primary font-bold text-xs border border-primary/10">
                                                        {getInitials(displayName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {displayName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate font-mono sm:hidden">
                                                        {displayEmail}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="size-3 text-muted-foreground/70" />
                                                {displayEmail}
                                            </div>
                                        </TableCell>

                                        {/* Role Dropdown Button */}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    disabled={isUpdatingThisMember}
                                                    className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed ${currentRoleConfig.badgeClass}`}
                                                    aria-label={`Change role for ${displayName}`}
                                                >
                                                    {isUpdatingThisMember ? (
                                                        <Loader2 className="size-3 animate-spin shrink-0" />
                                                    ) : (
                                                        <CurrentIcon className="size-3 shrink-0" />
                                                    )}
                                                    <span>{currentRoleConfig.label}</span>
                                                    <ChevronDown className="size-3 opacity-60 transition-transform duration-200 group-data-popup-open:rotate-180" />
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="start" className="w-52 p-1.5 shadow-lg border border-border/70 bg-popover">
                                                    <div className="text-[11px] text-muted-foreground px-2 py-1 font-semibold">
                                                        Select Role
                                                    </div>
                                                    <DropdownMenuSeparator className="my-1" />
                                                    {ROLES.map((r) => {
                                                        const Icon = r.icon;
                                                        const isSelected = currentRole === r.key;
                                                        return (
                                                            <DropdownMenuItem
                                                                key={r.key}
                                                                disabled={isUpdatingThisMember}
                                                                onClick={() => handleRoleChange(member, r.key)}
                                                                className={`cursor-pointer flex items-center gap-2 py-1.5 px-2 text-xs rounded-md transition-colors ${
                                                                    isSelected ? "bg-accent font-medium text-accent-foreground" : "hover:bg-muted/60"
                                                                }`}
                                                            >
                                                                <span className={`inline-flex p-1 rounded-full ${r.badgeClass}`}>
                                                                    <Icon className="size-3" />
                                                                </span>
                                                                <span className="flex-1">{r.label}</span>
                                                                {isSelected && <Check className="size-3 text-primary ml-auto" />}
                                                            </DropdownMenuItem>
                                                        );
                                                    })}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>

                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {member.joinedAt ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="size-3 text-muted-foreground/70" />
                                                    {formatDate(member.joinedAt)}
                                                </span>
                                            ) : (
                                                "N/A"
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}