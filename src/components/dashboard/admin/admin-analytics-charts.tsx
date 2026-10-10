"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  FileCode2,
  PieChart as PieIcon,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  IAdminDashboardStats,
  ISystemStatistics,
} from "@/types/admin.type";

interface AdminAnalyticsChartsProps {
  stats?: IAdminDashboardStats;
  system?: ISystemStatistics;
}

// Custom Tooltip component for consistent glassmorphism design
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md">
        {label && (
          <p className="mb-1.5 text-xs font-bold text-foreground">{label}</p>
        )}
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div
              key={`item-${index}`}
              className="flex items-center gap-2 text-xs"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              <span className="font-medium text-muted-foreground">
                {entry.name}:
              </span>
              <span className="font-bold text-foreground">
                {typeof entry.value === "number"
                  ? entry.value.toLocaleString()
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function AdminAnalyticsCharts({ stats, system }: AdminAnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-muted/20 animate-pulse border border-border/40" />
        <div className="h-80 rounded-2xl bg-muted/20 animate-pulse border border-border/40" />
      </div>
    );
  }

  // 1. Data for 30-Day Platform Velocity
  const velocityData = [
    {
      name: "New Users",
      count: stats?.recentActivity.newUsersLast30Days ?? 0,
      fill: "#3b82f6",
    },
    {
      name: "Assessments",
      count: stats?.recentActivity.assessmentsCreatedLast30Days ?? 0,
      fill: "#10b981",
    },
    {
      name: "Submissions",
      count: stats?.recentActivity.submissionsLast30Days ?? 0,
      fill: "#8b5cf6",
    },
  ];

  // 2. Data for Assessment Lifecycle
  const assessmentData = [
    { name: "Draft", value: stats?.assessments.draft ?? 0, color: "#94a3b8" },
    { name: "Published", value: stats?.assessments.published ?? 0, color: "#3b82f6" },
    { name: "Active", value: stats?.assessments.active ?? 0, color: "#10b981" },
    { name: "Completed", value: stats?.assessments.completed ?? 0, color: "#8b5cf6" },
    { name: "Archived", value: stats?.assessments.archived ?? 0, color: "#f59e0b" },
  ].filter((item) => item.value > 0);

  // Fallback if zero assessments
  const safeAssessmentData =
    assessmentData.length > 0
      ? assessmentData
      : [{ name: "No Assessments", value: 1, color: "#cbd5e1" }];

  // 3. Data for Submissions Breakdown
  const submissionData = [
    { name: "Passed", count: stats?.submissions.passed ?? 0, fill: "#10b981" },
    { name: "Failed", count: stats?.submissions.failed ?? 0, fill: "#f43f5e" },
    { name: "Pending", count: stats?.submissions.pending ?? 0, fill: "#f59e0b" },
    { name: "Evaluated", count: stats?.submissions.evaluated ?? 0, fill: "#3b82f6" },
  ];

  // 4. Data for User Roles
  const userRoleData = [
    { name: "Candidates", value: stats?.users.candidates ?? 0, color: "#3b82f6" },
    { name: "Admins", value: stats?.users.admins ?? 0, color: "#10b981" },
    { name: "Super Admins", value: stats?.users.superAdmins ?? 0, color: "#8b5cf6" },
  ].filter((item) => item.value > 0);

  const safeUserRoleData =
    userRoleData.length > 0
      ? userRoleData
      : [{ name: "Users", value: stats?.users.total || 1, color: "#3b82f6" }];

  // 5. Data for Database Entity Records
  const dbData = system?.databaseCounts
    ? [
        { entity: "Users", records: system.databaseCounts.users },
        { entity: "Companies", records: system.databaseCounts.companies },
        { entity: "Assessments", records: system.databaseCounts.assessments },
        { entity: "Attempts", records: system.databaseCounts.assessmentAttempts },
        { entity: "Submissions", records: system.databaseCounts.submissions },
        { entity: "Evaluations", records: system.databaseCounts.evaluations },
        { entity: "Cheating Logs", records: system.databaseCounts.antiCheatEvents },
      ]
    : [];

  // 6. Data for Security Incident Types
  const securityIncidentData = system?.security?.incidentsByType
    ? Object.entries(system.security.incidentsByType).map(([type, count]) => ({
        type: type.replace(/_/g, " "),
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <BarChart3 className="size-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Platform Analytics & Telemetry Visualizations
        </h2>
      </div>

      {/* ── Row 1: Platform Velocity & Assessment Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30-Day Platform Velocity */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  30-Day Platform Activity Velocity
                </CardTitle>
                <CardDescription className="text-xs">
                  Monthly acquisition volume across users, assessments, and candidate code submissions.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={velocityData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/40"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Volume (30 Days)"
                    radius={[6, 6, 0, 0]}
                  >
                    {velocityData.map((entry, index) => (
                      <Cell key={`velocity-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Lifecycle Distribution */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileCode2 className="size-4 text-emerald-500" />
                  Assessment Lifecycle Status
                </CardTitle>
                <CardDescription className="text-xs">
                  Proportion of coding assessments across stages: Draft, Published, Active, and Completed.
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Total
                </span>
                <span className="text-sm font-bold text-foreground">
                  {stats?.assessments.total ?? 0}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(val) => (
                      <span className="text-xs text-foreground font-medium">
                        {val}
                      </span>
                    )}
                  />
                  <Pie
                    data={safeAssessmentData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {safeAssessmentData.map((entry, index) => (
                      <Cell
                        key={`assessment-cell-${index}`}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Submissions Verdicts & User Role Composition ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solution Submissions Breakdown */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Activity className="size-4 text-violet-500" />
                  Code Submissions Execution Verdicts
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated Judge0 execution results and manual written evaluations.
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Total
                </span>
                <span className="text-sm font-bold text-foreground">
                  {stats?.submissions.total ?? 0}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={submissionData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/40"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Submissions"
                    radius={[6, 6, 0, 0]}
                  >
                    {submissionData.map((entry, index) => (
                      <Cell key={`sub-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Role Composition & Status */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="size-4 text-sky-500" />
                  Global User Role Demographics
                </CardTitle>
                <CardDescription className="text-xs">
                  Breakdown of candidate talent vs platform and system administrators.
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Active Ratio
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.users.total
                    ? Math.round((stats.users.active / stats.users.total) * 100)
                    : 100}
                  %
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(val) => (
                      <span className="text-xs text-foreground font-medium">
                        {val}
                      </span>
                    )}
                  />
                  <Pie
                    data={safeUserRoleData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {safeUserRoleData.map((entry, index) => (
                      <Cell
                        key={`user-role-cell-${index}`}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Infrastructure Database Cardinality & Security Incidents ── */}
      {system && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Database Entities Bar Chart */}
          {dbData.length > 0 && (
            <Card className="border-border/70 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Database className="size-4 text-primary" />
                  Database Entity Record Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Live row cardinality across core PostgreSQL relational tables.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dbData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border/40"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="entity"
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="records"
                        name="Records"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security & Anti-Cheating Telemetry */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldAlert className="size-4 text-amber-500" />
                    Anti-Cheat Security Telemetry
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Incident frequency across proctored candidate attempt events.
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-muted-foreground block">
                    Total Logged
                  </span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {system.security.totalAntiCheatIncidents}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {securityIncidentData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={securityIncidentData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border/40"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="type"
                        stroke="#888888"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="count"
                        name="Violations"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                  <CheckCircle2 className="size-10 text-emerald-500/60 mb-2" />
                  <p className="text-sm font-semibold text-foreground">
                    Zero Security Violations Logged
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1">
                    No anti-cheat infractions (tab switches, clipboard leaks, or fullscreen departures) recorded yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminAnalyticsCharts;
