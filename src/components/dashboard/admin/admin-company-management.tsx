"use client";

import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  FileCode2,
  Globe,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAdminCompanies } from "@/hook/admin.hook";
import type { IAdminCompanyListItem } from "@/types/admin.type";

function getInitials(name?: string) {
  if (!name) return "CO";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDate(dateValue?: string | Date | null) {
  if (!dateValue) return "N/A";
  try {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "N/A";
  }
}

export function AdminCompanyManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const query = useMemo(() => {
    return {
      searchTerm: searchTerm.trim() || undefined,
      isVerified:
        verificationFilter === "ALL"
          ? undefined
          : verificationFilter === "VERIFIED",
      page,
      limit: 10,
    };
  }, [searchTerm, verificationFilter, page]);

  const { data, isLoading, error, refetch, isRefetching } =
    useGetAdminCompanies(query);

  const companies: IAdminCompanyListItem[] = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const meta = data?.meta;

  const totalCount = meta?.total ?? companies.length;
  const verifiedCount = companies.filter((c) => c.isVerified).length;
  const pendingCount = companies.filter((c) => !c.isVerified).length;

  return (
    <div className="space-y-6">
      {/* 1. Stat Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Organizations
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Building2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{totalCount}</div>
            <CardDescription className="text-xs">
              Registered business workspaces on the platform
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Verified Organizations
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {verifiedCount}
            </div>
            <CardDescription className="text-xs">
              Approved enterprise accounts
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Review
            </CardTitle>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </div>
            <CardDescription className="text-xs">
              Awaiting verification review
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 2. Directory Card with Search and Filters */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Platform Companies Directory
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect company rosters, team sizes, and assessment usage
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search company name, slug, email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <select
                value={verificationFilter}
                onChange={(e) => {
                  setVerificationFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium focus:outline-none"
              >
                <option value="ALL">All Verification</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="PENDING">Pending Only</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                className="h-8 text-xs gap-1.5"
              >
                <RefreshCw
                  className={`size-3.5 ${isRefetching ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" />
              </div>
              <p className="text-xs text-muted-foreground">
                Failed to load platform companies directory.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Retry
              </Button>
            </div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Building2 className="mx-auto size-10 text-muted-foreground/40" />
              <h4 className="text-sm font-semibold text-foreground">
                No companies found
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchTerm || verificationFilter !== "ALL"
                  ? "No registered companies match your filter criteria."
                  : "No companies have registered on the platform yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-[11px]">
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Assessments</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="text-right">Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow
                      key={company.id}
                      className="text-xs hover:bg-muted/30"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 rounded-lg border border-border shrink-0">
                            {company.logoUrl ? (
                              <AvatarImage
                                src={company.logoUrl}
                                alt={company.name}
                                className="object-cover"
                              />
                            ) : null}
                            <AvatarFallback className="rounded-lg text-[10px] font-bold bg-primary/10 text-primary">
                              {getInitials(company.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{company.name}</span>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                @{company.slug}
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Mail className="size-3" />
                              <span>{company.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {company.isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <BadgeCheck className="size-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="size-3" />
                            Pending Review
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                          <Users className="size-3 text-muted-foreground" />
                          {company.totalMembers ?? 0}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                          <FileCode2 className="size-3 text-muted-foreground" />
                          {company.totalAssessments ?? 0}
                        </span>
                      </TableCell>

                      <TableCell>
                        {company.website ? (
                          <a
                            href={
                              company.website.startsWith("http")
                                ? company.website
                                : `https://${company.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-medium max-w-[140px] truncate"
                          >
                            <Globe className="size-3 shrink-0" />
                            <span className="truncate">
                              {company.website.replace(/^https?:\/\//, "")}
                            </span>
                            <ExternalLink className="size-2.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-[11px] italic">
                            None
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDate(company.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
