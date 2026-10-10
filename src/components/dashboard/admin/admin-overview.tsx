"use client";

import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  FileCode2,
  HardDrive,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAdminDashboardStats,
  useGetAdminSystemStats,
} from "@/hook/admin.hook";
import { AdminAnalyticsCharts } from "./admin-analytics-charts";

export function AdminOverview() {
  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
    isRefetching: isRefetchingStats,
  } = useGetAdminDashboardStats();

  const {
    data: systemData,
    isLoading: isLoadingSystem,
    refetch: refetchSystem,
  } = useGetAdminSystemStats();

  const stats = statsData?.data;
  const system = systemData?.data;

  const uptimeFormatted = useMemo(() => {
    if (!system?.uptimeSeconds) return "N/A";
    const hours = Math.floor(system.uptimeSeconds / 3600);
    const mins = Math.floor((system.uptimeSeconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }, [system]);

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-1">
            <ShieldCheck className="size-3.5" />
            Platform Control Center
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Global Administration & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor infrastructure health, manage global user directories, and
            oversee organization compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              refetchStats();
              refetchSystem();
            }}
            disabled={isRefetchingStats}
            className="text-xs font-semibold gap-1.5 h-8 cursor-pointer"
          >
            <RefreshCw
              className={`size-3.5 ${isRefetchingStats ? "animate-spin text-primary" : ""}`}
            />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* ── High-Level Statistics Grid ── */}
      {isLoadingStats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={`admin-stat-skel-${i + 1}`}
              className="h-28 rounded-xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <Card className="shadow-xs border-border/70 hover:border-border transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Registered Users
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {stats?.users.total.toLocaleString() ?? "0"}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats?.users.active ?? 0} Active •{" "}
                {stats?.users.candidates ?? 0} Candidates
              </p>
            </CardContent>
          </Card>

          {/* Hiring Companies */}
          <Card className="shadow-xs border-border/70 hover:border-border transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Hiring Organizations
              </CardTitle>
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                <Building2 className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {stats?.companies.total.toLocaleString() ?? "0"}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats?.companies.verified ?? 0} Verified •{" "}
                {stats?.companies.unverified ?? 0} Pending
              </p>
            </CardContent>
          </Card>

          {/* Assessments */}
          <Card className="shadow-xs border-border/70 hover:border-border transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Coding Assessments
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <FileCode2 className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {stats?.assessments.total.toLocaleString() ?? "0"}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats?.assessments.published ?? 0} Published •{" "}
                {stats?.assessments.active ?? 0} In Progress
              </p>
            </CardContent>
          </Card>

          {/* Pass Rate & Outcomes */}
          <Card className="shadow-xs border-border/70 hover:border-border transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Global Pass Rate
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <TrendingUp className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {stats?.attempts.overallPassRate ?? 0}%
              </div>
              <p className="text-[11px] text-muted-foreground">
                {stats?.attempts.completed ?? 0} Completed Attempts
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Visual Analytics & Telemetry Charts ── */}
      <AdminAnalyticsCharts stats={stats} system={system} />

      {/* ── System Infrastructure Telemetry Banner ── */}
      <Card className="border-border/70 overflow-hidden shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                Platform Infrastructure & Database Telemetry
              </CardTitle>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Activity className="size-3" />
              System Online
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {isLoadingSystem ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={`sys-skel-${i + 1}`}
                  className="h-20 rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3 text-primary" />
                    Server Uptime
                  </div>
                  <p className="text-base font-bold text-foreground">
                    {uptimeFormatted}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <HardDrive className="size-3 text-primary" />
                    Heap Memory
                  </div>
                  <p className="text-base font-bold text-foreground">
                    {system?.processMemory.heapUsedMb ?? 0} MB /{" "}
                    {system?.processMemory.heapTotalMb ?? 0} MB
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Cpu className="size-3 text-primary" />
                    Runtime Environment
                  </div>
                  <p className="text-base font-bold text-foreground">
                    Node {system?.nodeVersion || "v20"}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldAlert className="size-3 text-amber-500" />
                    Security Incidents
                  </div>
                  <p className="text-base font-bold text-foreground">
                    {system?.security.totalAntiCheatIncidents ?? 0} Logged
                  </p>
                </div>
              </div>

              {/* Database Model Inventory */}
              {system?.databaseCounts && (
                <div className="pt-3 border-t border-border/40">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Database className="size-3 text-primary" />
                    Database Entity Records:
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-md bg-muted/60 border border-border/50">
                      Users: <strong>{system.databaseCounts.users}</strong>
                    </span>
                    <span className="px-2 py-1 rounded-md bg-muted/60 border border-border/50">
                      Companies:{" "}
                      <strong>{system.databaseCounts.companies}</strong>
                    </span>
                    <span className="px-2 py-1 rounded-md bg-muted/60 border border-border/50">
                      Assessments:{" "}
                      <strong>{system.databaseCounts.assessments}</strong>
                    </span>
                    <span className="px-2 py-1 rounded-md bg-muted/60 border border-border/50">
                      Attempts:{" "}
                      <strong>
                        {system.databaseCounts.assessmentAttempts}
                      </strong>
                    </span>
                    <span className="px-2 py-1 rounded-md bg-muted/60 border border-border/50">
                      Submissions:{" "}
                      <strong>{system.databaseCounts.submissions}</strong>
                    </span>
                    <span className="px-2 py-1 rounded-md bg-muted/60 border border-border/50">
                      Evaluations:{" "}
                      <strong>{system.databaseCounts.evaluations}</strong>
                    </span>
                    <span className="px-2 py-1 rounded-md bg-muted/60 border border-border/50">
                      Cheating Events:{" "}
                      <strong>{system.databaseCounts.antiCheatEvents}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminOverview;
