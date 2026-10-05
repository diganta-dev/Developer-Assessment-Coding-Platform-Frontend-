"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyMembers, useUserCompany } from "@/hook/company.hook";
import { ICompany, ICompanyMemberItem } from "@/types";
import {
    AlertCircle,
    ArrowUpRight,
    BadgeCheck,
    Building2,
    Calendar,
    Check,
    Clock,
    Copy,
    ExternalLink,
    FileCode2,
    Globe,
    Layers,
    Mail,
    Plus,
    RefreshCw,
    ShieldCheck,
    Users,
} from "lucide-react";

function getInitials(name?: string) {
    if (!name) return "CO";
    const parts = name.trim().split(/[\s_]+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function isValidLogoUrl(url?: string | null): boolean {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    // Ignore known missing/dummy seed URLs to prevent browser 404 console errors
    if (
        trimmed.includes("devassess/company_logo.png") ||
        trimmed.endsWith("/company_logo.png") ||
        trimmed.toLowerCase().includes("placeholder")
    ) {
        return false;
    }
    return true;
}

function formatDate(dateValue?: string | Date | null) {
    if (!dateValue) return "N/A";
    try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "N/A";
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(date);
    } catch {
        return "N/A";
    }
}

export default function CompanyProfile() {
    const { data, isLoading, error, refetch } = useUserCompany();
    const company: ICompany | undefined = data?.data || data;
    const companyId = company?.id;
    const { data: membersData, isLoading: membersLoading } = useCompanyMembers(companyId);

    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [logoError, setLogoError] = useState(false);

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Skeleton Loading State
    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                {/* Banner Skeleton */}
                <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <Skeleton className="size-20 sm:size-24 rounded-2xl shrink-0" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-32" />
                                <div className="flex gap-2 pt-2">
                                    <Skeleton className="h-5 w-24 rounded-full" />
                                    <Skeleton className="h-5 w-28 rounded-full" />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-28 rounded-lg" />
                            <Skeleton className="h-9 w-32 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="shadow-xs">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="size-8 rounded-lg" />
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <Skeleton className="h-7 w-12" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Details Skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-36" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error State
    if (error || !company) {
        return (
            <Card className="border-destructive/30 bg-destructive/5 text-center p-8">
                <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertCircle className="size-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">
                            Failed to load company profile
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            {error?.message || "Company information could not be retrieved at this moment."}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="gap-2 mt-2"
                    >
                        <RefreshCw className="size-3.5" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Calculate dynamic counts from schema relations, membersData or _count
    const membersList: ICompanyMemberItem[] = Array.isArray(membersData?.data)
        ? membersData.data
        : Array.isArray(membersData)
            ? membersData
            : Array.isArray(company.members)
                ? company.members
                : [];

    const membersCount =
        membersList.length > 0
            ? membersList.length
            : company._count?.members ??
            (Array.isArray(company.members) ? company.members.length : 0);

    const assessmentsCount =
        company._count?.assessments ??
        (Array.isArray(company.assessments) ? company.assessments.length : 0);

    const problemsCount =
        company._count?.problems ??
        (Array.isArray(company.problems) ? company.problems.length : 0);

    const stats = [
        {
            title: "Team Members",
            value: membersLoading && membersList.length === 0 ? "..." : membersCount,
            description: "Active managers & evaluators",
            icon: Users,
            href: "#company-members",
            actionText: "View team",
        },
        {
            title: "Assessments",
            value: assessmentsCount,
            description: "Published tests & challenges",
            icon: FileCode2,
            href: "/company-admin/assessments",
            actionText: "View assessments",
        },
        {
            title: "Problem Bank",
            value: problemsCount,
            description: "Custom questions created",
            icon: Layers,
            href: "/company-admin/assessments",
            actionText: "Question library",
        },
        {
            title: "Account Status",
            value: company.isVerified ? "Verified" : "Pending",
            description: company.isVerified
                ? "Enterprise verified organization"
                : "Pending platform verification",
            icon: ShieldCheck,
            isStatus: true,
        },
    ];

    return (
        <div className="w-full space-y-6">
            {/* 1. Hero Branding & Profile Header Card */}
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-primary/5 p-6 sm:p-8 shadow-sm">
                {/* Subtle decorative glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/5 blur-3xl" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Logo & Company Identity */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <Avatar className="size-20 sm:size-24 rounded-2xl ring-4 ring-background/90 shadow-md bg-muted/60 shrink-0 after:rounded-2xl">
                            {isValidLogoUrl(company.logoUrl) && !logoError ? (
                                <AvatarImage
                                    src={company.logoUrl!}
                                    alt={company.name}
                                    onError={() => setLogoError(true)}
                                    className="object-cover rounded-2xl"
                                />
                            ) : null}
                            <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary font-bold text-xl sm:text-2xl border border-primary/10">
                                {getInitials(company.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                    {company.name}
                                </h1>
                                {company.isVerified ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        <BadgeCheck className="size-3.5" />
                                        Verified
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        <Clock className="size-3.5" />
                                        Pending Verification
                                    </span>
                                )}
                            </div>

                            {/* Slug & Handle */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="rounded-md bg-muted px-2 py-0.5 font-mono font-medium text-foreground">
                                    @{company.slug}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="size-3 text-muted-foreground" />
                                    Joined {formatDate(company.createdAt)}
                                </span>
                            </div>

                            {/* Quick links & contact */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                                {company.email && (
                                    <a
                                        href={`mailto:${company.email}`}
                                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Mail className="size-3.5" />
                                        <span>{company.email}</span>
                                    </a>
                                )}
                                {company.website && (
                                    <>
                                        <span className="text-muted-foreground/40">•</span>
                                        <a
                                            href={
                                                company.website.startsWith("http")
                                                    ? company.website
                                                    : `https://${company.website}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                                        >
                                            <Globe className="size-3.5" />
                                            <span>{company.website.replace(/^https?:\/\//, "")}</span>
                                            <ExternalLink className="size-3" />
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:self-start lg:self-center">
                        <Link
                            href="/company-admin/company-members"
                            className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                                className: "gap-1.5 shadow-2xs",
                            })}
                        >
                            <Users className="size-3.5" />
                            Manage Team
                        </Link>
                        <Link
                            href="/company-admin/assessments"
                            className={buttonVariants({
                                variant: "default",
                                size: "sm",
                                className: "gap-1.5 shadow-sm",
                            })}
                        >
                            <Plus className="size-3.5" />
                            Create Assessment
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. Key Metrics & Counts Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className="shadow-xs transition-all hover:shadow-md hover:border-primary/40 relative group"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {stat.title}
                                </CardTitle>
                                <div className="rounded-lg bg-primary/10 p-2 text-primary transition-transform duration-200 group-hover:scale-110">
                                    <Icon className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-1.5">
                                <div
                                    className={`text-2xl font-bold tracking-tight ${stat.isStatus
                                        ? company.isVerified
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : "text-amber-600 dark:text-amber-400"
                                        : "text-foreground"
                                        }`}
                                >
                                    {stat.value}
                                </div>
                                <CardDescription className="text-xs">
                                    {stat.description}
                                </CardDescription>

                                {stat.href && (
                                    <div className="pt-2">
                                        <Link
                                            href={stat.href}
                                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                                        >
                                            {stat.actionText}
                                            <ArrowUpRight className="size-3" />
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* 3. Company Overview & Details Cards */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* About Company Card */}
                <Card className="lg:col-span-2 shadow-xs">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-semibold">
                                    About Organization
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Public profile details visible to potential candidates
                                </CardDescription>
                            </div>
                            <div className="rounded-lg bg-muted p-1.5 text-muted-foreground">
                                <Building2 className="size-4" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-4">
                        {company.description ? (
                            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                                {company.description}
                            </p>
                        ) : (
                            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
                                <Building2 className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                                <p className="text-sm font-medium text-foreground">
                                    No company description added yet
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                    Add a company mission statement, tech stack, and hiring vision so
                                    candidates know what makes your engineering team unique.
                                </p>
                            </div>
                        )}

                        {/* Quick Details List */}
                        <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/40 text-xs">
                            <div className="space-y-1">
                                <span className="text-muted-foreground font-medium">Company ID</span>
                                <div className="flex items-center gap-1.5 font-mono text-foreground">
                                    <span className="truncate max-w-[180px]">{company.id}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(company.id, "id")}
                                        className="cursor-pointer text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                                        title="Copy Company ID"
                                    >
                                        {copiedField === "id" ? (
                                            <Check className="size-3 text-emerald-500" />
                                        ) : (
                                            <Copy className="size-3" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-muted-foreground font-medium">Public Portal URL</span>
                                <div className="flex items-center gap-1.5 font-mono text-foreground">
                                    <span className="truncate">devassess.com/{company.slug}</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopy(`https://devassess.com/${company.slug}`, "slug")
                                        }
                                        className="cursor-pointer text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                                        title="Copy Public URL"
                                    >
                                        {copiedField === "slug" ? (
                                            <Check className="size-3 text-emerald-500" />
                                        ) : (
                                            <Copy className="size-3" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Organization Status & System Info Card */}
                <Card className="shadow-xs">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-base font-semibold">
                            Organization Info
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Account configuration & activity
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4 space-y-3.5 text-xs">
                        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                            <span className="text-muted-foreground">Verification</span>
                            {company.isVerified ? (
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <BadgeCheck className="size-3.5" />
                                    Verified
                                </span>
                            ) : (
                                <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Clock className="size-3.5" />
                                    Under Review
                                </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                            <span className="text-muted-foreground">Official Email</span>
                            <span className="font-medium text-foreground truncate max-w-[160px]">
                                {company.email}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                            <span className="text-muted-foreground">Website</span>
                            {company.website ? (
                                <a
                                    href={
                                        company.website.startsWith("http")
                                            ? company.website
                                            : `https://${company.website}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary hover:underline truncate max-w-[160px] flex items-center gap-1"
                                >
                                    <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
                                    <ExternalLink className="size-3 shrink-0" />
                                </a>
                            ) : (
                                <span className="text-muted-foreground italic">Not provided</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                            <span className="text-muted-foreground">Registration Date</span>
                            <span className="font-medium text-foreground">
                                {formatDate(company.createdAt)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-muted-foreground">Last Updated</span>
                            <span className="font-medium text-foreground">
                                {formatDate(company.updatedAt)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}