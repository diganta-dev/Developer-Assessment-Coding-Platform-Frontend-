"use client";

import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Filter,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const LEFT_GRID_CELLS = [
  "lg-1",
  "lg-2",
  "lg-3",
  "lg-4",
  "lg-5",
  "lg-6",
  "lg-7",
  "lg-8",
  "lg-9",
  "lg-10",
  "lg-11",
  "lg-12",
];

const RIGHT_GRID_CELLS = [
  "rg-1",
  "rg-2",
  "rg-3",
  "rg-4",
  "rg-5",
  "rg-6",
  "rg-7",
  "rg-8",
  "rg-9",
];

const LINE_NUMBERS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
];

const FEATURE_TABS = [
  {
    id: "ai-era-skills",
    label: "AI-era skills",
    title: "Built for how developers work today",
    desc: "We embrace AI and put it in the pad. AI assistants run with code context and prompts are captured so you see how candidates think, validate, and ship.",
    theme: "red",
  },
  {
    id: "candidate-experience",
    label: "Candidate Experience",
    title: "96% of candidates finish our assessments",
    desc: "Traditional tests frustrate great candidates and hurt your brand. CoderPad reflects real work, which is why 97% of engineers prefer it, and completion is 60% higher than other platforms.",
    theme: "orange",
  },
  {
    id: "real-engineering-work",
    label: "Real engineering work",
    title: "Test real skills, not quiz-taking ability",
    desc: "Algorithms and quizzes don't reflect actual engineering. Multi-file, realistic coding tasks provide your team with accurate signals—helping you hire developers ready to build real products.",
    theme: "dark",
  },
  {
    id: "catch-cheating",
    label: "Catch cheating",
    title: "Never lose another interview cycle to the wrong candidate.",
    desc: "Catch suspicious behavior without manual effort or wasted hours with the wrong candidate. Realistic projects deter shortcuts before they start, real-time alerts flag suspicious behavior as it happens, and playback reports make it easy to confirm afterwards.",
    theme: "zinc",
  },
];

const CASE_STUDIES = [
  {
    company: "ALTEN",
    headline:
      "How ALTEN made CoderPad its technical hiring standard — and took it global",
    highlight: "Standardized across 30+ countries",
    metric: "12,000+ candidates evaluated annually",
    tag: "Global Engineering",
  },
  {
    company: "Harmattan AI",
    headline:
      "How a next-generation defense company built technical hiring to keep pace with hypergrowth",
    highlight: "Zero mis-hires during rapid scale",
    metric: "500+ engineers hired in 2 years",
    tag: "High-Growth Defense",
  },
  {
    company: "McAfee",
    headline:
      "CoderPad helped McAfee accelerate time-to-accept by 22% and boost completion rates by 35%",
    highlight: "22% faster time-to-hire",
    metric: "35% higher assessment completion",
    tag: "Cybersecurity",
  },
  {
    company: "monday.com",
    headline:
      "monday.com scaled engineering hiring with CoderPad across 70+ technical interviewers",
    highlight: "Seamless interview collaboration",
    metric: "70+ interviewers aligned on rubrics",
    tag: "Enterprise SaaS",
  },
  {
    company: "Nasdaq",
    headline:
      "Hiring 300 technical roles across 30 R&D offices with CoderPad Screen",
    highlight: "Global consistent hiring standard",
    metric: "300 roles filled with verified signal",
    tag: "FinTech & Exchange",
  },
];

export function MarketingHomePage() {
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);
  const [activeQualifyTab, setActiveQualifyTab] = useState<number>(0);
  const [activeScreenTab, setActiveScreenTab] = useState<number>(0);
  const [activeInterviewTab, setActiveInterviewTab] = useState<number>(0);
  const [caseStudyIndex, setCaseStudyIndex] = useState<number>(0);

  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);

  const handleRunCode = () => {
    setIsRunningCode(true);
    setTimeout(() => {
      setIsRunningCode(false);
    }, 1200);
  };

  const nextCaseStudy = () => {
    setCaseStudyIndex((prev) => (prev + 1) % CASE_STUDIES.length);
  };

  const prevCaseStudy = () => {
    setCaseStudyIndex(
      (prev) => (prev - 1 + CASE_STUDIES.length) % CASE_STUDIES.length,
    );
  };

  return (
    <div className="relative w-full text-white selection:bg-[#d91629] selection:text-white">
      {/* ========================================================
          1. HERO SECTION (hero-v3-block)
         ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Subtle grid decoration on left: 3 cols x 4 rows */}
        <div
          className="pointer-events-none absolute left-4 sm:left-10 lg:left-16 top-10 sm:top-14 w-[140px] h-[186px] opacity-25"
          aria-hidden="true"
        >
          <div className="grid grid-cols-3 grid-rows-4 size-full border-t border-l border-white/[0.15]">
            {LEFT_GRID_CELLS.map((cellKey) => (
              <div
                key={cellKey}
                className="border-r border-b border-white/[0.15] size-full"
              />
            ))}
          </div>
        </div>

        {/* Subtle grid decoration on right: 3 cols x 3 rows */}
        <div
          className="pointer-events-none absolute right-4 sm:right-10 lg:right-16 top-48 sm:top-56 w-[140px] h-[140px] opacity-25"
          aria-hidden="true"
        >
          <div className="grid grid-cols-3 grid-rows-3 size-full border-t border-l border-white/[0.15]">
            {RIGHT_GRID_CELLS.map((cellKey) => (
              <div
                key={cellKey}
                className="border-r border-b border-white/[0.15] size-full"
              />
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-extrabold tracking-tight leading-[1.08] text-white">
              Every role is technical
              <span className="block mt-2">
                <span className="inline-block bg-[#E52A12] px-4 py-1 sm:px-5 sm:py-1.5 text-white rounded-lg shadow-lg font-bold">
                  Hire like it.
                </span>
              </span>
            </h1>

            {/* Description Subtext - Exact 3-line wrap */}
            <p className="mx-auto max-w-[640px] text-base sm:text-[18px] text-neutral-300 font-normal leading-[1.6]">
              AI rewrote what &ldquo;technical&rdquo; means for every job. The
              <br className="hidden sm:inline" /> platform engineering teams
              trust now assesses analysts,
              <br className="hidden sm:inline" /> marketers, sales, and ops
              hires too.
            </p>

            {/* Call To Action Button - Single white pill button matching Figma */}
            <div className="pt-3 flex items-center justify-center">
              <Link
                href="/company-registration"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#121112] transition-colors hover:bg-neutral-200 shadow-md"
              >
                REQUEST A DEMO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. HERO BENTO SHOWCASE (Exact to Figma Reference)
         ======================================================== */}
      <section className="relative mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Bento Card: Vibrant Orange Gradient with Code Editor & Preview Window */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FF4915] via-[#FF3E0F] to-[#E52A0A] p-4 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between min-h-[460px]">
            {/* Inner IDE Window Frame */}
            <div className="relative z-10 flex h-full flex-col rounded-2xl bg-[#17181D] border border-white/10 shadow-2xl overflow-hidden">
              {/* Window Header */}
              <div className="flex h-10 items-center justify-between border-b border-white/10 bg-[#121316] px-3 sm:px-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="size-2.5 rounded-full bg-[#27C93F]" />
                  <span className="ml-2 font-mono text-[11px] text-neutral-400 flex items-center gap-1">
                    <span>Files</span>
                  </span>
                </div>

                {/* Center / Actions */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="inline-flex items-center gap-1 rounded-full bg-[#22C55E] px-3 py-0.5 font-mono text-[10.5px] font-bold text-[#121112] hover:bg-[#1eb354] transition-colors cursor-pointer disabled:opacity-75"
                  >
                    <span>{isRunningCode ? "Running..." : "Run"}</span>
                    <span className="text-[9px]">▶</span>
                  </button>
                  <span className="hidden sm:inline font-mono text-[10.5px] text-neutral-400">
                    Running Apps (1/1)
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="size-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] flex items-center justify-center font-bold">
                      25
                    </span>
                    <span className="size-4 rounded-full bg-purple-500/20 text-purple-400 text-[9px] flex items-center justify-center font-bold">
                      5x
                    </span>
                  </div>
                </div>

                {/* URL Bar */}
                <div className="flex items-center gap-1.5 rounded bg-black/50 px-2 py-0.5 text-[10px] font-mono text-neutral-400 border border-white/5">
                  <span className="truncate max-w-[130px] sm:max-w-[180px]">
                    http://localhost:3000/
                  </span>
                  <span className="text-[10px] text-neutral-400">↻</span>
                </div>
              </div>

              {/* Window Content: Left Editor & Right Web Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-[360px]">
                {/* Left: Dark Code Editor */}
                <div className="md:col-span-7 border-r border-white/10 bg-[#131418] p-3 sm:p-4 font-mono text-[11px] leading-[1.65] overflow-y-auto overflow-x-hidden">
                  <div className="flex">
                    {/* Line numbers */}
                    <div className="select-none text-neutral-600 text-right pr-3 font-mono text-[10.5px] space-y-0.5">
                      {LINE_NUMBERS.map((num) => (
                        <div key={`line-no-${num}`}>{num}</div>
                      ))}
                    </div>

                    {/* Code Syntax Highlighting */}
                    <pre className="text-neutral-300 font-mono text-[11px] leading-[1.65] pl-1 overflow-x-hidden">
                      <code>
                        <span className="text-[#38BDF8]">
                          export async function
                        </span>{" "}
                        <span className="text-[#FBBF24]">loginUser</span>
                        (username, password) &#123;{"\n"}
                        {"  "}
                        <span className="text-[#C084FC]">const</span>{" "}
                        loginRequest = &#123;{"\n"}
                        {"    "}username,{"\n"}
                        {"    "}password,{"\n"}
                        {"    "}grant_type:{" "}
                        <span className="text-[#4ADE80]">
                          &apos;password&apos;
                        </span>
                        ,{"\n"}
                        {"    "}client_id: API_IDENTITY_SERVER_CLIENT_ID,{"\n"}
                        {"    "}client_secret:
                        API_IDENTITY_SERVER_CLIENT_SECRET,{"\n"}
                        {"    "}scope: API_IDENTITY_SERVER_SCOPE,{"\n"}
                        {"  "}&#125;;{"\n\n"}
                        {"  "}
                        <span className="text-[#F472B6]">try</span> &#123;{"\n"}
                        {"    "}
                        <span className="text-[#C084FC]">const</span> response ={" "}
                        <span className="text-[#38BDF8]">await</span>{" "}
                        api.post(IDENTITY_URL, loginRequest);{"\n"}
                        {"    "}
                        <span className="text-[#F472B6]">if</span>{" "}
                        (response.status ==={" "}
                        <span className="text-[#FBBF24]">200</span>) &#123;
                        {"\n"}
                        {"      "}
                        <span className="text-[#F472B6]">return</span> &#123;
                        {"\n"}
                        {"        "}status:{" "}
                        <span className="text-[#4ADE80]">
                          &apos;success&apos;
                        </span>
                        ,{"\n"}
                        {"        "}data: response.data,{"\n"}
                        {"      "}&#125;;{"\n"}
                        {"    "}&#125;{"\n"}
                        {"  "}&#125;{" "}
                        <span className="text-[#F472B6]">catch</span> (err)
                        &#123;{"\n"}
                        {"    "}
                        <span className="text-neutral-500">{`// handle error`}</span>
                        {"\n"}
                        {"  "}&#125;{"\n"}
                        &#125;
                      </code>
                    </pre>
                  </div>
                </div>

                {/* Right: Web Preview & Terminal/Video Stack */}
                <div className="md:col-span-5 flex flex-col justify-between bg-[#16171B]">
                  {/* Top: Browser Preview with CoderPad header and React Atom Logo */}
                  <div className="bg-white p-3 flex-1 flex flex-col justify-between text-black relative min-h-[190px]">
                    {/* Header with CoderPad logo and refresh */}
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="size-3.5 rounded bg-[#E52A12] text-white flex items-center justify-center font-mono font-bold text-[8px]">
                          &lt;/&gt;
                        </span>
                        <span className="font-bold text-[11px] text-neutral-900 tracking-tight">
                          CoderPad
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400">↻</span>
                    </div>

                    {/* Centered React Atom Logo */}
                    <div className="flex flex-col items-center justify-center py-4 my-auto">
                      <svg
                        className="size-16 text-[#00D8FF] animate-spin-slow"
                        viewBox="-11.5 -10.23174 23 20.46348"
                        fill="currentColor"
                        role="img"
                        aria-label="React logo"
                      >
                        <title>React Logo</title>
                        <circle cx="0" cy="0" r="2.05" fill="#00D8FF" />
                        <g stroke="#00D8FF" strokeWidth="1" fill="none">
                          <ellipse rx="11" ry="4.2" />
                          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                        </g>
                      </svg>
                      <span className="text-[9.5px] font-mono text-neutral-400 mt-2">
                        Use shell to install react...
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Shell and Attendee Video Thumbnails */}
                  <div className="flex border-t border-white/10 bg-[#0E1013] min-h-[135px]">
                    {/* Shell Console */}
                    <div className="flex-1 p-2.5 font-mono text-[9.5px] border-r border-white/10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 text-neutral-400 border-b border-white/5 pb-1 mb-1.5">
                          <span className="text-white border-b border-[#22C55E] pb-0.5">
                            Shell
                          </span>
                          <span>Logs</span>
                        </div>
                        <div className="space-y-0.5 text-neutral-300">
                          <p className="text-[#22C55E]">
                            VITE v5.0.4 ready in 1500 ms
                          </p>
                          <p>➜ Local: http://localhost:3000/</p>
                          <p className="text-neutral-400">
                            ➜ Network: http://172.16.0.2:3000/
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2 Video Feeds with Real Attendee Photos */}
                    <div className="w-[84px] sm:w-[96px] p-1.5 flex flex-col gap-1.5 justify-center bg-[#131518]">
                      {/* Video 1: Man with glasses */}
                      <div className="relative rounded overflow-hidden aspect-[4/3] bg-neutral-800 border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/attendee-1.jpg"
                          alt="Alex P."
                          className="size-full object-cover object-top"
                        />
                        <span className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-[#22C55E] ring-1 ring-black" />
                      </div>

                      {/* Video 2: Woman smiling */}
                      <div className="relative rounded overflow-hidden aspect-[4/3] bg-neutral-800 border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/images/attendee-2.jpg"
                          alt="Sarah K."
                          className="size-full object-cover object-top"
                        />
                        <span className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-[#22C55E] ring-1 ring-black" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Bento Card: Exact Photo of Candidate with 3 Monospace Badges */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl flex flex-col justify-between min-h-[460px] aspect-[16/11] lg:aspect-auto">
            {/* Background Candidate Photo */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/images/candidate-photo.jpg')",
              }}
            />

            {/* Dark Vignette & Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/55" />

            {/* Dashed Connecting Lines Overlay */}
            <svg
              className="pointer-events-none absolute inset-0 size-full text-white/20"
              viewBox="0 0 500 500"
              fill="none"
              aria-hidden="true"
            >
              <title>Connection lines</title>
              <path
                d="M160 340 C 220 340, 260 370, 280 440"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <path
                d="M370 110 C 350 180, 310 240, 260 270"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
            </svg>

            {/* 1. Top Right Badge: REDUCE MIS-HIRES */}
            <div className="absolute top-7 right-7 sm:top-9 sm:right-9 z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#18181A]/85 backdrop-blur-md border border-white/20 px-3.5 py-1.5 sm:px-4 sm:py-2 font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white shadow-xl">
                <span>REDUCE MIS-HIRES</span>
                <span className="size-2 rounded-full bg-[#E52A12] shadow-[0_0_8px_rgba(229,42,18,0.8)]" />
              </div>
            </div>

            {/* 2. Middle Left Badge: SEE HOW THEY THINK */}
            <div className="absolute bottom-36 left-6 sm:bottom-40 sm:left-7 z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#18181A]/85 backdrop-blur-md border border-white/20 px-3.5 py-1.5 sm:px-4 sm:py-2 font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white shadow-xl">
                <span>SEE HOW THEY THINK</span>
                <span className="size-2 rounded-full bg-[#E52A12] shadow-[0_0_8px_rgba(229,42,18,0.8)]" />
              </div>
            </div>

            {/* 3. Bottom Right Badge: REAL ENGINEERING WORK */}
            <div className="absolute bottom-7 right-7 sm:bottom-9 sm:right-9 z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#18181A]/85 backdrop-blur-md border border-white/20 px-3.5 py-1.5 sm:px-4 sm:py-2 font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white shadow-xl">
                <span>REAL ENGINEERING WORK</span>
                <span className="size-2 rounded-full bg-[#E52A12] shadow-[0_0_8px_rgba(229,42,18,0.8)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. LOGO ROW (Trusted by 4,000+ customers worldwide)
         ======================================================== */}
      <section className="bg-[#121112] py-12">
        <div className="mx-auto max-w-[90rem] px-4 text-center">
          <p className="text-base sm:text-[18px] font-bold text-white tracking-tight mb-8">
            Trusted by 4,000+ customers worldwide
          </p>

          {/* Authentic Brand Logos Row matching Figma Reference */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10 xl:gap-12 text-white">
            {/* 1. LinkedIn */}
            <div className="flex items-center font-bold text-xl sm:text-2xl tracking-tighter text-[#0A66C2]">
              <span>Linked</span>
              <span className="ml-0.5 rounded bg-[#0A66C2] px-1 text-white text-[18px] font-bold">
                in
              </span>
            </div>

            {/* 2. Goldman Sachs */}
            <div className="font-serif text-[15px] sm:text-[17px] tracking-wide text-neutral-400 font-medium leading-none">
              <span>Goldman Sachs</span>
            </div>

            {/* 3. TOYOTA */}
            <div className="flex items-center gap-1.5 text-white">
              <svg
                className="size-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
                role="img"
                aria-label="Toyota logo"
              >
                <path d="M12 3c-4.97 0-9 2.24-9 5 0 2.45 3.2 4.49 7.42 4.91L9.12 18h2.09l.86-3.8c.63.02 1.28.02 1.93 0l.86 3.8h2.09l-1.3-5.09C19.8 12.49 23 10.45 23 8c0-2.76-4.03-5-9-5zm0 1.8c3.87 0 7 1.43 7 3.2s-3.13 3.2-7 3.2-7-1.43-7-3.2 3.13-3.2 7-3.2zm0 1.2c-2.76 0-5 .9-5 2s2.24 2 5 2 5-.9 5-2-2.24-2-5-2z" />
              </svg>
              <span className="font-extrabold text-lg tracking-[0.16em]">
                TOYOTA
              </span>
            </div>

            {/* 4. Discord */}
            <div className="flex items-center gap-1.5 text-[#5865F2] font-bold text-lg sm:text-xl tracking-tight">
              <svg
                className="size-5 fill-current"
                viewBox="0 0 127.14 96.36"
                role="img"
                aria-label="Discord logo"
              >
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              <span>Discord</span>
            </div>

            {/* 5. snowflake */}
            <div className="flex items-center gap-1.5 text-[#29B5E8] font-mono text-lg sm:text-xl font-bold tracking-tight">
              <span className="text-lg">❄</span>
              <span>snowflake</span>
            </div>

            {/* 6. BIGCOMMERCE */}
            <div className="flex items-center gap-1.5 text-neutral-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
              <svg
                className="size-4 fill-current"
                viewBox="0 0 24 24"
                role="img"
                aria-label="BigCommerce logo"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-8-4v9l8 4 8-4v-9l-8 4z" />
              </svg>
              <span>BIGCOMMERCE</span>
            </div>

            {/* 7. WAYMO */}
            <div className="flex items-center gap-1 font-black text-lg sm:text-xl tracking-widest text-white">
              <span className="text-[#00DEB5]">W</span>
              <span>WAYMO</span>
            </div>

            {/* 8. shopify */}
            <div className="flex items-center gap-1.5 text-white font-bold text-lg sm:text-xl tracking-tight">
              <svg
                className="size-5 text-[#95BF47] fill-current"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Shopify logo"
              >
                <path d="M19.78 6.55c-.06-.39-.42-.64-.81-.64h-.05l-2.07.16c-.34-.73-.83-1.63-1.51-2.22-1.37-1.18-2.93-1.28-3.66-1.28-.15 0-.29.01-.4.02C10.74 1.15 9.77 0 8.35 0 7.39 0 6.64.49 6.2 1.34L3.06 2.05c-.65.15-.9.46-1 .61L.05 18.25C0 18.66.27 19.04.68 19.12l13.62 2.65c.1.02.2.03.3.03.32 0 .62-.17.76-.46L20 7.23c.09-.2.07-.46-.22-.68zm-8.31-2.61c.42 0 1.2.06 2.06.77.58.48.97 1.18 1.25 1.77l-3.32.26c.01-.96.01-2.8.01-2.8zm-2.03-1.5c.32 0 .73.34.98.92-.32.06-.69.17-1.07.33-.24-.65-.05-1.25.09-1.25zm-2.67 1.31l1.83-.41c-.08.3-.12.63-.12.98 0 .44.07.87.19 1.28l-2.3.18.4-2.03zm1.88 15.69L1.93 17.77 3.5 4.67l4.98-.39c-.25.75-.38 1.57-.38 2.45 0 .58.07 1.16.19 1.72l-4.14.33c-.32.03-.56.3-.53.62.03.32.3.56.62.53l4.37-.35c.48 1.51 1.48 2.77 2.85 3.51l-3.8 9.97zm2.41-.01l3.52-9.23c.48.16.99.25 1.52.25 1.14 0 2.22-.44 3.03-1.22L14.7 18.6l-3.64.84z" />
              </svg>
              <span>shopify</span>
            </div>

            {/* 9. The New York Times */}
            <div className="font-serif italic font-semibold text-base sm:text-lg text-neutral-400 tracking-tight">
              The New York Times
            </div>

            {/* 10. Circle mark */}
            <div className="size-5 rounded-full border-2 border-[#007DC1] opacity-75" />
          </div>
        </div>
      </section>

      {/* ========================================================
          4. INLINE TABBED CONTENT CARDS (Built for how developers work today)
         ======================================================== */}
      <section className="py-20 lg:py-28 mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        {/* Tab pill navigation bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
          {FEATURE_TABS.map((tab, idx) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFeatureTab(idx)}
              className={`rounded-full px-5 py-2 font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeFeatureTab === idx
                  ? "bg-white text-[#121112] shadow-lg scale-105"
                  : "bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Feature Card Showcase */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl bg-[#16171B] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Copy Side */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-neutral-300">
                <span
                  className={`size-2 rounded-full ${
                    activeFeatureTab === 0
                      ? "bg-[#E52A12]"
                      : activeFeatureTab === 1
                        ? "bg-[#FF4915]"
                        : activeFeatureTab === 2
                          ? "bg-[#38BDF8]"
                          : "bg-[#22C55E]"
                  }`}
                />
                <span>{FEATURE_TABS[activeFeatureTab].label}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                {FEATURE_TABS[activeFeatureTab].title}
              </h2>

              <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
                {FEATURE_TABS[activeFeatureTab].desc}
              </p>

              <div className="pt-2">
                <Link
                  href="/company-registration"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#121112] hover:bg-neutral-200 transition-colors shadow-lg"
                >
                  <span>Learn more</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Visual Simulator Side based on active tab */}
            <div className="lg:col-span-7">
              {activeFeatureTab === 0 && (
                <div className="rounded-2xl bg-gradient-to-br from-[#201518] to-[#121114] border border-[#E52A12]/30 p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-[#E52A12]" />
                      <span className="font-mono text-xs font-bold text-white">
                        AI CONTEXT IN THE PAD
                      </span>
                    </div>
                    <span className="font-mono text-xs text-neutral-400">
                      Prompts Captured (4)
                    </span>
                  </div>

                  <div className="rounded-xl bg-black/60 p-4 font-mono text-xs space-y-3 border border-white/5">
                    <div className="text-neutral-400">
                      <span className="text-[#38BDF8]">
                        candidate@prompt-1:
                      </span>{" "}
                      &quot;Write a binary search function to find the insertion
                      index in O(log n)&quot;
                    </div>
                    <div className="rounded bg-[#1a1315] p-3 border border-[#E52A12]/20 text-neutral-300">
                      <span className="text-xs text-[#E52A12] block font-bold mb-1">
                        AI Output Stream:
                      </span>
                      <pre className="text-[11px] leading-relaxed overflow-x-hidden">
                        <code>{`function searchInsert(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return left;
}`}</code>
                      </pre>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400 text-[11px] pt-1">
                      <Check className="size-3.5 text-[#22C55E]" />
                      <span>
                        Candidate modified variable names &amp; added edge-case
                        handling for empty arrays
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 1 && (
                <div className="rounded-2xl bg-gradient-to-br from-[#241710] to-[#141212] border border-[#FF4915]/30 p-6 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Star className="size-4 text-[#FF4915]" />
                      <span className="font-mono text-xs font-bold text-white">
                        CANDIDATE SATISFACTION INDEX
                      </span>
                    </div>
                    <span className="rounded-full bg-[#22C55E]/10 px-2.5 py-0.5 text-xs font-mono text-[#22C55E] font-bold">
                      97% PREFER CODERPAD
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-black/50 p-5 border border-white/5 text-center space-y-1">
                      <span className="text-4xl font-extrabold text-white">
                        96%
                      </span>
                      <p className="text-xs text-neutral-400">
                        Assessment Completion Rate
                      </p>
                      <span className="text-[10px] text-[#22C55E] block">
                        +60% vs traditional tools
                      </span>
                    </div>
                    <div className="rounded-xl bg-black/50 p-5 border border-white/5 text-center space-y-1">
                      <span className="text-4xl font-extrabold text-white">
                        4.9/5
                      </span>
                      <p className="text-xs text-neutral-400">
                        Candidate Experience Score
                      </p>
                      <span className="text-[10px] text-[#38BDF8] block">
                        Over 200,000 ratings
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 2 && (
                <div className="rounded-2xl bg-[#131418] border border-white/10 p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <FileCode className="size-4 text-[#38BDF8]" />
                      <span className="font-mono text-xs font-bold text-white">
                        MULTI-FILE PROJECT REPOSITORY
                      </span>
                    </div>
                    <span className="text-xs font-mono text-neutral-400">
                      Full Node / React Environment
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-xs text-neutral-400">
                    <div className="bg-black/40 p-2.5 rounded border border-white/5">
                      📁 src/controllers
                    </div>
                    <div className="bg-black/40 p-2.5 rounded border border-white/5">
                      📁 src/models
                    </div>
                    <div className="bg-black/40 p-2.5 rounded border border-white/5 text-white border-cyan-500/30">
                      📄 auth.service.ts
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/70 p-4 font-mono text-xs border border-white/5 text-neutral-300">
                    <p className="text-neutral-500">
                      $ npm test -- auth.service.spec.ts
                    </p>
                    <p className="text-[#22C55E] mt-1">
                      ✓ PASS tests/auth.service.spec.ts (1.43s)
                    </p>
                    <p className="text-neutral-400 mt-0.5">
                      Tests: 8 passed, 8 total
                    </p>
                  </div>
                </div>
              )}

              {activeFeatureTab === 3 && (
                <div className="rounded-2xl bg-[#131418] border border-white/10 p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-[#22C55E]" />
                      <span className="font-mono text-xs font-bold text-white">
                        LIVE ANTI-CHEATING TELEMETRY AUDIT
                      </span>
                    </div>
                    <span className="rounded-full bg-[#22C55E]/10 px-2.5 py-0.5 text-xs font-mono text-[#22C55E] font-bold">
                      Low Risk (0%)
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-white/5 text-neutral-300">
                      <span>Tab Switches</span>
                      <span className="text-[#22C55E]">0 Departures</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-white/5 text-neutral-300">
                      <span>External Clipboard Injections</span>
                      <span className="text-[#22C55E]">0 Pastes</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-white/5 text-neutral-300">
                      <span>Code Playback Session</span>
                      <span className="text-[#38BDF8]">
                        100% Verified Keystroke Replay
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. PRODUCT CAPABILITY 1: QUALIFY (Assess everyone at the top of the funnel)
         ======================================================== */}
      <section className="py-20 lg:py-28 mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 bg-[#161516] border-y border-white/[0.08]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Copy Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-white">
              <Filter className="size-3 text-[#ff3201]" />
              <span>Qualify</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              Assess everyone at the top of the funnel
            </h2>

            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
              With <strong className="text-white">Qualify</strong>, you can give
              every applicant a first interview using candidate-submitted video
              responses and an AI reviewer. Turn submissions into a ranked,
              high-signal shortlist, no recruiter hours or calendar juggling.
              Save 33+ hours per hire.
            </p>

            {/* Vertical Accordion Tabs */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              {[
                {
                  title: "Automate high-volume video screening",
                  desc: "Eliminate manual phone screens with asynchronous video responses that candidates record on their own time.",
                },
                {
                  title: "Precise AI evaluation",
                  desc: "Our AI analyzes video responses against your custom rubric, providing consistent, objective candidate rankings.",
                },
                {
                  title: "Defensible hiring decisions",
                  desc: "Standardized video prompts and evaluation criteria create an auditable trail, making every decision fair and easy to justify.",
                },
                {
                  title: "Seamless ATS integration",
                  desc: "Automatically saving 33+ hours per hire without losing top talent.",
                },
              ].map((tab, idx) => (
                <button
                  key={tab.title}
                  type="button"
                  onClick={() => setActiveQualifyTab(idx)}
                  className={`w-full text-left rounded-xl p-4 transition-all border cursor-pointer ${
                    activeQualifyTab === idx
                      ? "bg-[#1f1d1f] border-white/20 shadow-md"
                      : "bg-transparent border-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-base">
                      {tab.title}
                    </span>
                    <ChevronRight
                      className={`size-4 text-neutral-400 transition-transform ${
                        activeQualifyTab === idx ? "rotate-90 text-white" : ""
                      }`}
                    />
                  </div>
                  {activeQualifyTab === idx && (
                    <p className="mt-2 text-sm text-neutral-300 leading-relaxed animate-in fade-in duration-150">
                      {tab.desc}
                    </p>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/company-registration"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#121112] hover:bg-neutral-200 transition-colors shadow-lg"
              >
                <span>Discover Qualify</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Media Visual Side */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-[#121112] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#ff3201] text-white font-bold">
                    <Video className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Candidate Video Response #104
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Prompt: &quot;Describe your approach to distributed system
                      caching&quot;
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#22C55E]/10 px-3 py-1 text-xs font-mono font-bold text-[#22C55E]">
                  AI Rank: #1 of 48
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-neutral-800 border border-white/10 flex items-center justify-center">
                  <div className="size-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Play className="size-6 ml-0.5" />
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white">
                    01:45 / 02:00
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                    <span className="text-[11px] text-neutral-400 block">
                      Technical Clarity
                    </span>
                    <strong className="text-base text-white">96% High</strong>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Clear explanation of invalidation strategies &amp; Redis
                      clusters
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                    <span className="text-[11px] text-neutral-400 block">
                      Communication Skill
                    </span>
                    <strong className="text-base text-white">
                      94% Exceptional
                    </strong>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Structured thought process and succinct articulation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. PRODUCT CAPABILITY 2: SCREEN (Smarter screening)
         ======================================================== */}
      <section className="py-20 lg:py-28 mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Copy Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-white">
              <span className="size-2 rounded-full bg-[#d91629]" />
              <span>Screen</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              Smarter screening, faster hiring
            </h2>

            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
              <strong className="text-white">CoderPad Screen</strong> gives you
              reliable coding assessments built around real-world engineering
              tasks—quickly identify top talent and reduce costly mis-hires.
            </p>

            {/* Interactive Feature Accordion Tabs */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              {[
                {
                  title: "Real-world coding tasks",
                  desc: "Engage candidates with practical assessments they'll actually complete, mirroring true repo workflows.",
                },
                {
                  title: "Clear, structured scoring",
                  desc: "Gain immediate clarity to move qualified candidates forward faster with public and private test coverage.",
                },
                {
                  title: "Candidate-friendly format",
                  desc: "Improve your hiring brand with customizable IDE settings, autocomplete, and 99+ supported languages.",
                },
                {
                  title: "Anti-cheating & Integrity telemetry",
                  desc: "Tests adapt and monitor tab departure, fullscreen departures, and copy-paste activity for complete auditability.",
                },
              ].map((tab, idx) => (
                <button
                  key={tab.title}
                  type="button"
                  onClick={() => setActiveScreenTab(idx)}
                  className={`w-full text-left rounded-xl p-4 transition-all border cursor-pointer ${
                    activeScreenTab === idx
                      ? "bg-[#1f1d1f] border-white/20 shadow-md"
                      : "bg-transparent border-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-base">
                      {tab.title}
                    </span>
                    <ChevronRight
                      className={`size-4 text-neutral-400 transition-transform ${
                        activeScreenTab === idx ? "rotate-90 text-white" : ""
                      }`}
                    />
                  </div>
                  {activeScreenTab === idx && (
                    <p className="mt-2 text-sm text-neutral-300 leading-relaxed animate-in fade-in duration-150">
                      {tab.desc}
                    </p>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/company-registration"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#d91629] bg-[#d91629] px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b20d1d] transition-colors"
              >
                <span>Discover Screen</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Media Visual Side */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#241c22] to-[#141314] p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <CheckCircle2 className="size-64 text-[#d91629]" />
              </div>

              {/* Simulated Screen Dashboard View */}
              <div className="relative space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#d91629] text-white font-bold">
                      TS
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        Senior Full Stack Engineer Assessment
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Duration: 60 mins • 3 Questions (Coding, MCQ,
                        Architecture)
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#37c773]/10 px-3 py-1 text-xs font-mono font-bold text-[#37c773]">
                    Score: 94 / 100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                    <span className="text-[11px] text-neutral-400 block">
                      Code Execution
                    </span>
                    <strong className="text-base text-white">
                      100% Passed
                    </strong>
                    <span className="text-[10px] text-[#37c773] block mt-0.5">
                      12/12 Unit Tests
                    </span>
                  </div>
                  <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                    <span className="text-[11px] text-neutral-400 block">
                      Code Complexity
                    </span>
                    <strong className="text-base text-white">O(n log n)</strong>
                    <span className="text-[10px] text-[#0693e3] block mt-0.5">
                      Optimal Memory
                    </span>
                  </div>
                  <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                    <span className="text-[11px] text-neutral-400 block">
                      Cheating Risk
                    </span>
                    <strong className="text-base text-white">
                      Low Risk (4%)
                    </strong>
                    <span className="text-[10px] text-[#37c773] block mt-0.5">
                      Zero Tab Switches
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#121112] p-4 border border-white/10 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-neutral-400 text-[11px] border-b border-white/5 pb-1.5">
                    <span>Test Case Breakdown</span>
                    <span>Status</span>
                  </div>
                  <div className="flex items-center justify-between text-[#37c773]">
                    <span>✓ testCase_1: Handles standard payload</span>
                    <span>PASS (4ms)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#37c773]">
                    <span>✓ testCase_2: Handles boundary concurrency</span>
                    <span>PASS (12ms)</span>
                  </div>
                  <div className="flex items-center justify-between text-[#37c773]">
                    <span>✓ testCase_3: Edge case null validation</span>
                    <span>PASS (6ms)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. PRODUCT CAPABILITY 3: INTERVIEW (Real interviews)
         ======================================================== */}
      <section className="py-20 lg:py-28 bg-[#161516] border-y border-white/[0.08]">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Simulator */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="rounded-2xl bg-[#121112] border border-white/10 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-[#37c773] animate-pulse" />
                    <span className="font-mono text-xs font-bold text-white">
                      LIVE INTERVIEW SESSION #8492
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-neutral-300">
                      Python 3.12
                    </span>
                    <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-neutral-300">
                      Multi-cursor Enabled
                    </span>
                  </div>
                </div>

                {/* Simulated Synchronized Collaborative Code */}
                <div className="rounded-xl bg-black/60 p-4 font-mono text-xs text-neutral-300 border border-white/5 space-y-2">
                  <div className="text-neutral-500">
                    {"// Collaborative live editing"}
                  </div>
                  <div>
                    <span className="text-[#e54150]">class</span>{" "}
                    <span className="text-[#fcb900]">LRUCache</span>:
                  </div>
                  <div className="pl-4">
                    <span className="text-[#e54150]">def</span>{" "}
                    <span className="text-[#0693e3]">__init__</span>(self,
                    capacity: int):
                  </div>
                  <div className="pl-8 text-neutral-400">
                    self.capacity = capacity{"\n"}
                    self.cache = &#123;&#125;
                    <span className="inline-block w-2 h-4 bg-[#37c773] ml-1 animate-pulse" />
                  </div>
                </div>

                {/* Interviewer Private Scorecard */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg bg-white/5 p-3 border border-white/5">
                    <span className="text-xs text-neutral-400 block">
                      Problem Solving
                    </span>
                    <span className="font-bold text-white text-sm">
                      4.8 / 5.0 (Strong Hire)
                    </span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 border border-white/5">
                    <span className="text-xs text-neutral-400 block">
                      Code Architecture
                    </span>
                    <span className="font-bold text-white text-sm">
                      Clean Modularity
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy Side */}
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-white">
                <span className="size-2 rounded-full bg-[#0693e3]" />
                <span>Interview</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                Real interviews, real engineering
              </h2>

              <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
                <strong className="text-white">CoderPad Interview</strong>{" "}
                enables your team to conduct real-time, collaborative coding
                sessions—assess how candidates code, communicate, and solve
                problems.
              </p>

              {/* Accordion Tabs */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                {[
                  {
                    title: "Collaborative IDE",
                    desc: "Evaluate real coding and soft skills during live paired programming sessions.",
                  },
                  {
                    title: "Multi-file environment",
                    desc: "Assess true problem-solving and debugging in complex realistic setups, not whiteboard tricks.",
                  },
                  {
                    title: "Built-in interviewer tools",
                    desc: "Equip interviewers with structured scoring, private notes, and complete playback history.",
                  },
                  {
                    title: "AI-Enabled validation",
                    desc: "Observe how candidates use AI in context, evaluate prompts, and review generated solutions.",
                  },
                ].map((tab, idx) => (
                  <button
                    key={tab.title}
                    type="button"
                    onClick={() => setActiveInterviewTab(idx)}
                    className={`w-full text-left rounded-xl p-4 transition-all border cursor-pointer ${
                      activeInterviewTab === idx
                        ? "bg-[#1f1d1f] border-white/20 shadow-md"
                        : "bg-transparent border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-base">
                        {tab.title}
                      </span>
                      <ChevronRight
                        className={`size-4 text-neutral-400 transition-transform ${
                          activeInterviewTab === idx
                            ? "rotate-90 text-white"
                            : ""
                        }`}
                      />
                    </div>
                    {activeInterviewTab === idx && (
                      <p className="mt-2 text-sm text-neutral-300 leading-relaxed animate-in fade-in duration-150">
                        {tab.desc}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/company-registration"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#121112] hover:bg-neutral-200 transition-colors shadow-lg"
                >
                  <span>Discover Interview</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          8. ENTERPRISE COMPLIANCE & SECURITY
         ======================================================== */}
      <section className="py-20 lg:py-24 mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#1e1d1e] border border-white/10 p-8 sm:p-12 lg:p-16 overflow-hidden">
          {/* Concentric rings vector background */}
          <div
            className="pointer-events-none absolute -right-20 -bottom-20 size-[480px] opacity-15 text-[#ff3201]"
            aria-hidden="true"
          >
            <svg
              className="size-full"
              viewBox="0 0 477 477"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.3"
            >
              <title>Concentric Rings</title>
              <circle cx="238.5" cy="238.5" r="236.8" />
              <circle cx="238.5" cy="238.5" r="183.8" />
              <circle cx="238.5" cy="238.5" r="127.3" />
              <circle cx="238.5" cy="238.5" r="74.3" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#d91629]">
                Enterprise Security &amp; Trust
              </span>
              <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Enterprise-ready security, scalability &amp; GDPR compliance
              </h3>
              <p className="text-neutral-300 text-base leading-relaxed max-w-2xl">
                Protection is woven into our architecture and operations,
                continuously tested and independently verified. Engineered with
                strict tenant isolation, SOC-2 Type 2 compliance, end-to-end
                telemetry encryption, automated sandbox teardown, and seamless
                ATS integrations with Greenhouse, Lever, and Workday.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-[#37c773]" /> SOC-2 Type 2
                  Certified
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-[#37c773]" /> Single Sign-On
                  (SAML/Okta)
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-[#37c773]" /> Anti-Cheating
                  Telemetry
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-[#37c773]" /> 99.99% Uptime SLA
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <Link
                href="/company-registration"
                className="inline-flex items-center justify-center rounded-full border-2 border-white bg-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider text-[#121112] hover:bg-neutral-200 transition-colors shadow-2xl"
              >
                REQUEST ENTERPRISE DEMO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          9. INTEGRATIONS PROMO MOSAIC (Built for your hiring stack)
         ======================================================== */}
      <section className="py-20 lg:py-24 mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#17181D] border border-white/10 p-8 sm:p-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                Integrations
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Built for
                <br />
                your hiring stack
              </h3>
              <p className="text-neutral-300 text-base leading-relaxed">
                Plug directly into your ATS and scheduling tools to run screens
                and interviews in one seamless flow without context switching.
              </p>
              <div className="pt-2">
                <Link
                  href="/company-registration"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-white transition-colors"
                >
                  <span>See integrations</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Mosaic Partner Logo Tiles */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  "Greenhouse",
                  "Lever",
                  "Ashby",
                  "Workday",
                  "SAP SuccessFactors",
                  "SmartRecruiters",
                  "Jobvite",
                  "iCIMS",
                  "GoodTime",
                  "Prelude",
                  "ModernLoop",
                  "Figma",
                ].map((partner) => (
                  <div
                    key={partner}
                    className="flex items-center justify-center p-4 rounded-xl bg-black/40 border border-white/5 text-sm font-semibold text-neutral-300 hover:border-white/20 hover:text-white transition-colors"
                  >
                    <span>{partner}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          10. CASE STUDIES & TESTIMONIALS CAROUSEL
         ======================================================== */}
      <section className="py-20 lg:py-24 mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Trusted by hiring teams at leading companies
            </h3>
            <p className="text-neutral-400 text-sm mt-1">
              Real engineering organizations driving measurable hiring impact
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevCaseStudy}
              aria-label="Previous customer story"
              className="size-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={nextCaseStudy}
              aria-label="Next customer story"
              className="size-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((offset) => {
            const item =
              CASE_STUDIES[(caseStudyIndex + offset) % CASE_STUDIES.length];
            return (
              <div
                key={item.company}
                className="rounded-2xl bg-[#16171B] border border-white/10 p-6 flex flex-col justify-between space-y-6 hover:border-white/30 transition-all shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-lg text-white tracking-tight">
                      {item.company}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-mono text-neutral-300">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed font-medium">
                    &ldquo;{item.headline}&rdquo;
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-1">
                  <span className="text-xs text-[#22C55E] font-mono font-bold block">
                    ✓ {item.highlight}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono block">
                    {item.metric}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          11. PRE-FOOTER AI PROMPTS & FINAL CTA
         ======================================================== */}
      <section className="border-t border-white/[0.08] bg-[#121112] py-20 text-center">
        <div className="mx-auto max-w-3xl px-4 space-y-8">
          {/* CoderPad Logomark Icon */}
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#d91629] text-white shadow-xl">
            <span className="font-mono font-bold text-lg">&lt;/&gt;</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Not sure if CoderPad is right for your team?
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg">
              Ask leading AI models directly about our platform benchmarks and
              ROI:
            </p>
          </div>

          {/* AI Prompts Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://chat.openai.com/?q=tell%20me%20why%20CoderPad%20is%20a%20great%20choice%20for%20me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-mono font-semibold text-white hover:bg-white/10 hover:border-white transition-colors"
            >
              <Bot className="size-4 text-[#10A37F]" />
              <span>Ask ChatGPT</span>
            </a>
            <a
              href="https://claude.ai/new?q=tell%20me%20why%20CoderPad%20is%20a%20great%20choice%20for%20me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-mono font-semibold text-white hover:bg-white/10 hover:border-white transition-colors"
            >
              <Sparkles className="size-4 text-[#D97706]" />
              <span>Ask Claude</span>
            </a>
            <a
              href="https://www.perplexity.ai/search/new?q=tell%20me%20why%20CoderPad%20is%20a%20great%20choice%20for%20me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-mono font-semibold text-white hover:bg-white/10 hover:border-white transition-colors"
            >
              <Search className="size-4 text-[#20B2AA]" />
              <span>Ask Perplexity</span>
            </a>
          </div>

          {/* Standard Primary / Secondary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-white/10">
            <Link
              href="/company-registration"
              className="inline-flex items-center justify-center rounded-full border-2 border-white bg-white px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-[#121112] hover:bg-neutral-200 transition-colors shadow-xl"
            >
              REQUEST A DEMO
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/30 bg-transparent px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:border-white transition-colors"
            >
              SIGN UP FREE
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Search icon"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default MarketingHomePage;
