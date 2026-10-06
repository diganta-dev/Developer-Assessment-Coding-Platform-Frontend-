"use client";

import { BookOpen, Code2, FileQuestion, PenTool } from "lucide-react";
import { useState } from "react";
import { CreateCodingQuestion } from "./create-coding-problem";
import { CreateMCQQuestion } from "./create-mcq-question";
import { CreateWrittenQuestion } from "./create-written-question";
import { GetAllProblemTable } from "./getallproblem-table";

type Tab = "MCQ" | "WRITTEN" | "CODING" | "ALL";

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: "MCQ", label: "MCQ Question", icon: FileQuestion },
  { value: "WRITTEN", label: "Written Question", icon: PenTool },
  { value: "CODING", label: "Coding Problem", icon: Code2 },
  { value: "ALL", label: "All Problems", icon: BookOpen },
];

export function ProblemBankCreate() {
  const [activeTab, setActiveTab] = useState<Tab>("MCQ");

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="inline-flex items-center p-1 rounded-xl bg-muted/70 border border-border/60 gap-0.5">
          {TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              id={`tab-${value.toLowerCase()}-btn`}
              onClick={() => setActiveTab(value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === value
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5 text-primary" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "MCQ" && <CreateMCQQuestion />}
      {activeTab === "WRITTEN" && <CreateWrittenQuestion />}
      {activeTab === "CODING" && <CreateCodingQuestion />}
      {activeTab === "ALL" && <GetAllProblemTable />}
    </div>
  );
}
