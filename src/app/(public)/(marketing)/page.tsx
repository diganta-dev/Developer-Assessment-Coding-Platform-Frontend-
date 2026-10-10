import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketingHomePage } from "@/components/home/marketing-home-page";

export const metadata: Metadata = {
  title: "CoderPad - Coding Interview & Technical Assessment Platform",
  description:
    "Hire better devs with CoderPad's live coding interview & technical assessment platform. Filter candidates based on their coding skills in 99+ languages.",
};

export default function MarketingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full  flex items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      }
    >
      <MarketingHomePage />
    </Suspense>
  );
}
