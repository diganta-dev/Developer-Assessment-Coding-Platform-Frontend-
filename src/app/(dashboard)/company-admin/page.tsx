import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Users, FileCode2, UserCheck } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function CompanyAdminPage() {
  const stats = [
    { title: "Team Members", value: "8", description: "Hiring managers and evaluators", icon: Users },
    { title: "Active Tests", value: "14", description: "Published company assessments", icon: FileCode2 },
    { title: "Candidates", value: "96", description: "Evaluated this month", icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Building2 className="size-3.5" />
            Company Admin Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Company Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your company members, technical assessments, and candidate pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/company-admin/members"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Manage Team
          </Link>
          <Link
            href="/company-admin/assessments"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Create Assessment
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-xs">
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
    </div>
  );
}
