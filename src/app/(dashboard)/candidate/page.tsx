import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Code2, CheckCircle2, User, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function CandidateDashboardPage() {
  const stats = [
    {
      title: "Invitations",
      value: "2",
      description: "Pending assessment invitations",
      icon: Mail,
      badge: "Action Required",
    },
    {
      title: "Assessments",
      value: "1",
      description: "In progress / ready to take",
      icon: Code2,
      badge: "Active",
    },
    {
      title: "Completed",
      value: "3",
      description: "Finished technical assessments",
      icon: CheckCircle2,
      badge: "Evaluated",
    },
    {
      title: "Profile Status",
      value: "Complete",
      description: "Resume and skills verified",
      icon: User,
      badge: "Verified",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
            <Code2 className="size-3.5" />
            Candidate Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Candidate Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your coding tests, invitations, and submission results in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/candidate/invitations"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Mail className="mr-1.5 size-3.5" />
            View Invitations
          </Link>
          <Link
            href="/candidate/assessments"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Start Assessment
            <ArrowRight className="ml-1.5 size-3.5" />
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

      {/* Quick Actions & Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Invitations Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Pending Invitations</CardTitle>
                <CardDescription>
                  Companies waiting for your technical assessment
                </CardDescription>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                2 New
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Senior Full Stack Engineer</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Acme Corp</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> 60 mins
                  </span>
                </div>
              </div>
              <Link
                href="/candidate/assessments"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Accept & Start
              </Link>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Frontend React Specialist</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>TechNova Solutions</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> 45 mins
                  </span>
                </div>
              </div>
              <Link
                href="/candidate/assessments"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Accept & Start
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Candidate Center</CardTitle>
            <CardDescription>
              Manage your profile and review previous assessment submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/candidate/assessments"
              className="flex flex-col gap-1 rounded-lg border p-4 hover:border-primary/50 transition-colors"
            >
              <span className="text-sm font-semibold">My Assessments</span>
              <span className="text-xs text-muted-foreground">
                View active and upcoming coding tests
              </span>
            </Link>

            <Link
              href="/candidate/results"
              className="flex flex-col gap-1 rounded-lg border p-4 hover:border-primary/50 transition-colors"
            >
              <span className="text-sm font-semibold">Test Results</span>
              <span className="text-xs text-muted-foreground">
                Check scores, feedback, and rankings
              </span>
            </Link>

            <Link
              href="/candidate/profile"
              className="flex flex-col gap-1 rounded-lg border p-4 hover:border-primary/50 transition-colors"
            >
              <span className="text-sm font-semibold">Candidate Profile</span>
              <span className="text-xs text-muted-foreground">
                Update resume, skills, and portfolio
              </span>
            </Link>

            <Link
              href="/candidate/invitations"
              className="flex flex-col gap-1 rounded-lg border p-4 hover:border-primary/50 transition-colors"
            >
              <span className="text-sm font-semibold">All Invitations</span>
              <span className="text-xs text-muted-foreground">
                Review invitation archive and history
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
