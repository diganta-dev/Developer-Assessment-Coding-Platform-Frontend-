"use client";

import { Layers, Plus } from "lucide-react";
import { useState } from "react";
import CreateAssessmentForm from "./create-assessment";
import { GetAllAssessment } from "./getAllAssessment";

export function AssessmentManagement() {
  const [activeTab, setActiveTab] = useState<"ALL" | "CREATE">("ALL");

  return (
    <div className="space-y-6 w-full">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between pb-1">
        <div className="inline-flex items-center p-1 rounded-xl bg-muted/70 border border-border/60 gap-1">
          <button
            type="button"
            id="tab-all-assessments-btn"
            onClick={() => setActiveTab("ALL")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5 text-primary" />
            All Assessments
          </button>
          <button
            type="button"
            id="tab-create-assessment-btn"
            onClick={() => setActiveTab("CREATE")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "CREATE"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className="size-3.5 text-primary" />
            Create Assessment
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "ALL" ? (
        <GetAllAssessment onCreateClick={() => setActiveTab("CREATE")} />
      ) : (
        <CreateAssessmentForm />
      )}
    </div>
  );
}

export default AssessmentManagement;
