"use client";

import {
  BarChart3,
  Building2,
  FileCheck2,
  Layers,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DetailedAssessmentReportView } from "@/components/dashboard/assessments-components/detailed-assessment-report-view";
import { AssessmentAnalyticsView } from "./assessment-analytics-view";
import { CompanyAnalyticsView } from "./company-analytics-view";

interface ReportsHubProps {
  defaultTab?: "assessment" | "attempt" | "company";
}

export function ReportsHub({ defaultTab = "assessment" }: ReportsHubProps) {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab") as "assessment" | "attempt" | "company" | null;
  const attemptId = searchParams.get("attemptId");

  const [activeTab, setActiveTab] = useState<"assessment" | "attempt" | "company">(
    queryTab || (attemptId ? "attempt" : defaultTab),
  );

  return (
    <div className="space-y-6">
      {/* Top Tab Navigator */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("assessment")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "assessment"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Assessment Analytics
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("attempt")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "attempt"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          Candidate Attempt Report
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "company"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Organization Pipeline
        </button>
      </div>

      {/* Tab Content Panes */}
      <div>
        {activeTab === "assessment" && <AssessmentAnalyticsView />}
        {activeTab === "attempt" && (
          <DetailedAssessmentReportView isStandalonePage={true} />
        )}
        {activeTab === "company" && <CompanyAnalyticsView />}
      </div>
    </div>
  );
}
