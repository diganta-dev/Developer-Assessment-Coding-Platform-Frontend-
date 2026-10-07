import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Building2, FileCode2, ShieldCheck, Activity, FileText } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AdminPage() {
  const stats = [
    {
      title: "Total Users",
      value: "1,248",
      description: "Candidates and recruiters registered",
      icon: Users,
    },
    {
      title: "Companies",
      value: "42",
      description: "Active hiring organizations",
      icon: Building2,
    },
    {
      title: "Assessments",
      value: "186",
      description: "Published coding challenges",
      icon: FileCode2,
    },
    {
      title: "System Status",
      value: "Healthy",
      description: "All services operating normally",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <ShieldCheck className="size-3.5" />
            Admin Control Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor platform metrics, manage organizations, and oversee assessment operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/report"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <FileText className="size-3.5 mr-1" />
            View Reports
          </Link>
          <Link
            href="/admin/users"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Manage Users
          </Link>
          <Link
            href="/admin/companies"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Manage Companies
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-xs transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="rounded-lg bg-muted p-2 text-foreground">
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription className="mt-1 text-xs">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View candidates, evaluators, and company managers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/users"
              className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full" })}
            >
              Browse Users
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>Company Management</CardTitle>
            <CardDescription>
              Review registered organizations, subscriptions, and team access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/companies"
              className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full" })}
            >
              Browse Companies
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>Assessment Oversight</CardTitle>
            <CardDescription>
              Monitor published assessments, question banks, and activity logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/assessments"
              className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full" })}
            >
              Browse Assessments
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>Assessment Reports</CardTitle>
            <CardDescription>
              Submission breakdown, score telemetry, and anti-cheat audit logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/report"
              className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full" })}
            >
              Browse Reports
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}