import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckSquare, FileText, Layers } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { EvaluatorGradingQueue } from "@/components/dashboard/evaluator/evaluator-grading-queue";
import { buttonVariants } from "@/components/ui/button";

export default function EvaluatorPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <CheckSquare className="size-3.5" />
            Evaluator Portal
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Evaluator Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Review candidate code submissions, grade evaluations, and inspect detailed attempt reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/evaluator/assessments"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Layers className="mr-1.5 size-3.5" />
            Assigned Assessments
          </Link>
          <Link
            href="/evaluator/report"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <FileText className="mr-1.5 size-3.5" />
            Candidate Reports
          </Link>
          <Link
            href="/evaluator/submissions"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Review Submissions
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>Assigned Assessments</CardTitle>
            <CardDescription>Browse test windows, proctoring rules, and candidate rosters</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/evaluator/assessments"
              className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full" })}
            >
              Browse Assessments
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>Candidate test submissions pending grading</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/evaluator/submissions"
              className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full" })}
            >
              View Submissions
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>Detailed Reports</CardTitle>
            <CardDescription>Inspect test case telemetry, anti-cheat audit logs, and code</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/evaluator/report"
              className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full" })}
            >
              View Candidate Reports
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4 border-t border-border/40">
        <Suspense
          fallback={
            <div className="space-y-3 p-4">
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-40 w-full bg-muted/40 animate-pulse rounded-xl" />
            </div>
          }
        >
          <EvaluatorGradingQueue />
        </Suspense>
      </div>
    </div>
  );
}
