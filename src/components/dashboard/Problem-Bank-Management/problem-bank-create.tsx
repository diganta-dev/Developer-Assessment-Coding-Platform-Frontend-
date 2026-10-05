"use client";

import { FileQuestion, PenTool } from "lucide-react";
import { useState } from "react";
import { CreateMCQQuestion } from "./create-mcq-question";
import { CreateWrittenQuestion } from "./create-written-question";

export function ProblemBankCreate() {
  const [activeTab, setActiveTab] = useState<"MCQ" | "WRITTEN">("MCQ");

  return (
    <div className="space-y-6">
      {/* Question Type Switcher */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="inline-flex items-center p-1 rounded-xl bg-muted/70 border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("MCQ")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "MCQ"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileQuestion className="size-3.5 text-primary" />
            MCQ Question
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("WRITTEN")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "WRITTEN"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PenTool className="size-3.5 text-primary" />
            Written Question
          </button>
        </div>
      </div>

      {/* Active Form Component */}
      {activeTab === "MCQ" ? <CreateMCQQuestion /> : <CreateWrittenQuestion />}
    </div>
  );
}
