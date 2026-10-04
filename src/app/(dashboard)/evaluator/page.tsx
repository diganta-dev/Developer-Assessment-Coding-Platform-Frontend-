import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckSquare, Clock } from "lucide-react";
import Link from "next/link";
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
            Review candidate code submissions, grade evaluations, and provide feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/evaluator/submissions"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Review Submissions
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
    </div>
  );
}
