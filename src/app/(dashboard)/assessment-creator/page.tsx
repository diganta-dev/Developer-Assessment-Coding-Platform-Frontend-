import { Database, FileCode2, FileText } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AssessmentCreatorPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <FileCode2 className="size-3.5" />
            Assessment Builder
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Assessment Creator Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Author coding challenges, manage problem banks, and inspect
            candidate attempt reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/assessment-creator/report"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <FileText className="mr-1.5 size-3.5" />
            Detailed Reports
          </Link>
          <Link
            href="/assessment-creator/problems"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Database className="mr-1.5 size-3.5" />
            Problem Bank
          </Link>
          <Link
            href="/assessment-creator/assessments"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Create New Test
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
            <CardDescription>
              Manage and configure test templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/assessment-creator/assessments"
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "w-full",
              })}
            >
              View Assessments
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Problem Bank</CardTitle>
            <CardDescription>
              Browse and add algorithmic questions and test cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/assessment-creator/problems"
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "w-full",
              })}
            >
              View Problem Bank
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>Assessment Reports</CardTitle>
            <CardDescription>
              Audit test submissions, scoring rubrics, and proctoring logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/assessment-creator/report"
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "w-full",
              })}
            >
              View Detailed Reports
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
