"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileText,
  Filter,
  Gamepad2,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Loader2,
  LogOut,
  Map as MapIcon,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Tv,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useGetMe, useLogout } from "@/hook";
import { getCompanyRole, getRoleDashboardRoute } from "@/utils";
import { UserMenu } from "../user-menu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useGetMe();
  const user = data?.data;
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (menuName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

  const handleMobileLogout = () => {
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
    logout(undefined, {
      onSuccess: async () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        toast.add({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
          type: "success",
        });
        queryClient.setQueryData(["user"], null);
        await queryClient.invalidateQueries({ queryKey: ["user"] });
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        queryClient.clear();
        router.push("/login");
        router.refresh();
      },
      onError: (error: unknown) => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        const message =
          error instanceof Error ? error.message : "Session ended";
        toast.add({
          title: "Logged out",
          description: message,
          type: "info",
        });
        queryClient.setQueryData(["user"], null);
        queryClient.clear();
        router.push("/login");
        router.refresh();
      },
    });
  };

  const dashboardUrl = getRoleDashboardRoute(user);
  const companyRole = getCompanyRole(user);

  return (
    <div className="rounded-xl">
      <div className="bg-[#121112]  text-white rounded-xl">
        {/* 1. Announcement Banner */}
        <aside className="w-full bg-[#121112] text-center pt-2.5 pb-1">
          <div className="mx-auto flex h-10 max-w-[90rem] items-center justify-center px-4 sm:px-6 lg:px-8">
            <a
              href="https://coderpad.io/events/everyone-says-theyre-ai-fluent-can-they-prove-it/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 text-xs sm:text-[13.5px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <span suppressHydrationWarning>
                {
                  "Everyone Says They're AI Fluent, Can They Prove It? Join Our Webinar->"
                }
              </span>
            </a>
          </div>
        </aside>

        {/* 2. Main Site Navigation */}
        <header
          ref={navRef}
          className="sticky top-0 z-50 w-full bg-[#121112] backdrop-blur-md rounded-xl supports-[backdrop-filter]:bg-[#121112]/95"
        >
          <div className="mx-auto flex h-20 max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo & Navigation Container */}
            <div className="flex items-center gap-8 lg:gap-10">
              {/* CoderPad Monotone Logo (Exact SVG) */}
              <Link
                href="/"
                className="flex items-center gap-2 transition-opacity hover:opacity-95 shrink-0"
                aria-label="CoderPad Home"
              >
                <svg
                  className="h-[27px] w-auto"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 152 27"
                  fill="none"
                >
                  <title>CoderPad</title>
                  {/* Wordmark "CoderPad" in pure white */}
                  <path
                    fill="#ffffff"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="m47.042 22.669-.282.115q-1.176.48-2.298.717-1.115.237-2.315.236c-1.28 0-2.43-.188-3.447-.576l-.004-.002a6.76 6.76 0 0 1-2.576-1.771l-.002-.003c-.697-.784-1.222-1.745-1.58-2.874l-.002-.004c-.35-1.14-.52-2.445-.52-3.912 0-1.506.189-2.858.575-4.052.384-1.197.938-2.22 1.668-3.055a7.1 7.1 0 0 1 2.65-1.92c1.044-.445 2.205-.663 3.475-.663q.601 0 1.127.027.546.028 1.068.11.519.07 1.05.195a12 12 0 0 1 1.106.318l.307.104v4.302l-.64-.305a9.7 9.7 0 0 0-2.037-.728 8 8 0 0 0-1.745-.216c-.761 0-1.384.14-1.885.403l-.003.001-.002.001c-.512.26-.933.627-1.267 1.11-.33.478-.582 1.063-.746 1.764v.002a10 10 0 0 0-.251 2.335q0 1.37.25 2.427c.172.69.43 1.259.766 1.719q.495.678 1.273 1.044c.516.234 1.147.36 1.905.36q.391 0 .86-.074.491-.09.985-.218.504-.14.983-.32.5-.195.92-.389l.634-.292zm14.998-3.43q-.475 1.403-1.381 2.426a6.16 6.16 0 0 1-2.225 1.583c-.88.374-1.87.556-2.962.556-1.035 0-1.974-.153-2.813-.469a5.64 5.64 0 0 1-2.155-1.42l-.003-.003c-.593-.64-1.04-1.43-1.348-2.355-.308-.938-.457-2.012-.457-3.214q-.002-1.68.471-3.084l.002-.004q.486-1.4 1.394-2.41l.002-.003a6.2 6.2 0 0 1 2.236-1.552c.878-.373 1.858-.555 2.934-.555 1.043 0 1.988.157 2.828.483a5.6 5.6 0 0 1 2.155 1.435c.595.642 1.037 1.431 1.336 2.356.308.92.457 1.971.457 3.147 0 1.11-.155 2.14-.471 3.082m-4.468-5.893-.002-.002c-.418-.575-1.039-.883-1.94-.883-.504 0-.903.1-1.216.277a2.3 2.3 0 0 0-.817.773l-.002.004q-.332.494-.5 1.196a7.2 7.2 0 0 0-.16 1.552c0 1.363.272 2.312.744 2.92.468.592 1.101.895 1.95.895.474 0 .863-.094 1.18-.265q.492-.278.798-.754c.214-.342.38-.75.493-1.233a7 7 0 0 0 .172-1.59c0-1.36-.257-2.298-.698-2.887zm30.618 6.802a16.5 16.5 0 0 0 2.253-.493l.572-.166v3.537l-.327.094q-.533.152-1.154.275-.616.122-1.258.218-.647.096-1.308.137-.66.054-1.282.054-1.591.002-2.888-.467a5.9 5.9 0 0 1-2.217-1.401l-.003-.003c-.611-.63-1.074-1.4-1.392-2.3-.319-.905-.473-1.938-.473-3.09 0-1.144.154-2.195.47-3.146.314-.956.762-1.784 1.348-2.475a5.9 5.9 0 0 1 2.131-1.614c.845-.385 1.776-.573 2.787-.573.993 0 1.89.158 2.68.487a5.4 5.4 0 0 1 1.99 1.352q.804.876 1.213 2.069a7.9 7.9 0 0 1 .407 2.579q0 .348-.027.884-.013.543-.054 1.023l-.035.417h-8.73q.05.535.21.949.244.59.651.982a3 3 0 0 0 1.025.598q.617.214 1.394.216.939 0 2.017-.143m-.782-6.625v-.003a2.3 2.3 0 0 0-.48-.824l-.002-.003-.003-.003a1.75 1.75 0 0 0-.672-.458l-.004-.002a2.3 2.3 0 0 0-.863-.156c-.695 0-1.236.232-1.661.686l-.003.003c-.346.363-.595.865-.725 1.536h4.57a3 3 0 0 0-.157-.776m33.712.317-.001.001a5.9 5.9 0 0 1-1.438 2.153c-.64.61-1.429 1.077-2.356 1.406-.935.332-2.004.493-3.2.493h-1.196v5.604h-4.16V5.145h5.487q1.718-.002 3.069.39c.905.254 1.681.634 2.315 1.15a4.94 4.94 0 0 1 1.459 1.92c.337.753.499 1.605.499 2.547q.001 1.44-.478 2.688m-4.007-3.55-.002-.007a1.94 1.94 0 0 0-.534-.791l-.003-.003-.002-.002a2.5 2.5 0 0 0-.937-.516c-.393-.125-.876-.193-1.458-.193h-1.248v5.481h1.354c.52 0 .963-.07 1.335-.2a2.5 2.5 0 0 0 .912-.574l.002-.002.003-.003q.373-.364.562-.885l.002-.004.001-.004q.204-.522.206-1.208a2.9 2.9 0 0 0-.191-1.084zm14.919 13.207-.054-1.203q-.094.083-.191.164l-.003.003-.003.002q-.499.405-1.092.706-.605.306-1.309.463a6.3 6.3 0 0 1-1.523.172c-.727 0-1.385-.108-1.965-.338a4.1 4.1 0 0 1-1.46-.96 4.1 4.1 0 0 1-.904-1.484l-.001-.004-.001-.003a5.7 5.7 0 0 1-.287-1.857q-.001-1.06.44-1.975l.002-.003.001-.003a4.3 4.3 0 0 1 1.364-1.566l.002-.002c.605-.428 1.339-.754 2.193-.987h.001c.871-.236 1.876-.35 3.009-.35h1.301v-.358c0-.304-.043-.563-.119-.782l-.002-.004a1.2 1.2 0 0 0-.345-.527l-.003-.003-.004-.003c-.15-.14-.363-.262-.657-.354-.286-.09-.659-.14-1.131-.14q-1.13 0-2.237.268h-.004a11.4 11.4 0 0 0-2.139.733l-.633.29V9.775l.283-.114q1.006-.404 2.288-.664a13.7 13.7 0 0 1 2.705-.262c1.017 0 1.908.1 2.667.309.758.199 1.403.509 1.92.942.525.433.913.979 1.159 1.629.244.633.359 1.358.359 2.166v9.716zm-.48-5.991h-1.511c-.518 0-.935.05-1.261.143-.337.095-.586.22-.765.361a1.3 1.3 0 0 0-.393.483 1.4 1.4 0 0 0-.118.585c0 .444.135.725.36.915.248.2.614.325 1.151.325.335 0 .713-.123 1.144-.417q.62-.421 1.393-1.22zM72.603 22.32l.156-.153.052 1.33h3.656V3.731h-4.108V8.92l-.4-.061a8 8 0 0 0-1.058-.07q-1.552-.002-2.893.463a6.1 6.1 0 0 0-2.351 1.438c-.667.648-1.183 1.463-1.554 2.432v.002c-.367.972-.543 2.106-.543 3.392q-.002 1.61.343 2.945c.23.887.566 1.66 1.014 2.308l.002.003.002.003a4.85 4.85 0 0 0 1.71 1.498c.686.358 1.46.531 2.31.531a5 5 0 0 0 1.41-.19q.642-.174 1.205-.496l.004-.002.003-.002a6 6 0 0 0 1.04-.795m-.816-9.972h.002q.325.055.57.123v5.445c-.508.7-.98 1.243-1.415 1.637-.427.386-.842.551-1.253.551-.304 0-.56-.061-.776-.174-.206-.114-.395-.299-.56-.576-.16-.282-.295-.66-.394-1.15q-.136-.744-.136-1.835.001-1.001.22-1.77v-.001c.145-.525.347-.951.596-1.289.26-.34.563-.596.912-.777.342-.177.735-.27 1.19-.27q.529 0 1.044.086m74.918 10.066q.079-.075.156-.152l.052 1.33h3.656V3.824h-4.107v5.19l-.401-.062a8 8 0 0 0-1.058-.07q-1.552-.001-2.893.464a6.1 6.1 0 0 0-2.351 1.438c-.667.648-1.183 1.463-1.554 2.432l-.001.002c-.366.972-.542 2.106-.542 3.392q-.001 1.61.344 2.945c.23.887.565 1.66 1.013 2.308l.002.003.003.003a4.84 4.84 0 0 0 1.71 1.498c.686.358 1.459.531 2.31.531q.761.001 1.41-.19.643-.175 1.204-.496l.004-.002.004-.002a6 6 0 0 0 1.039-.795m-.815-9.97q.325.053.571.122v5.445q-.763 1.048-1.416 1.637c-.427.386-.842.551-1.253.551a1.66 1.66 0 0 1-.776-.174c-.205-.114-.394-.299-.561-.577-.159-.281-.294-.66-.392-1.148q-.136-.746-.137-1.836.001-1.002.22-1.77v-.001c.146-.525.347-.951.596-1.289q.388-.508.912-.777c.342-.178.736-.27 1.191-.27q.528 0 1.044.086m-42.85 2.334c-.046-.4-.078-.597-.139-1.002-.108-.724-.443-1.443-1.267-1.443-.618 0-.932.269-1.521.752-.473.389-.954 1.012-1.377 1.551v8.706H94.55V8.872h3.778l.073 1.217.042-.043.005-.005q.46-.452 1.007-.774a4.8 4.8 0 0 1 1.247-.515 5.8 5.8 0 0 1 1.466-.174c.726 0 1.386.129 1.971.4a3.73 3.73 0 0 1 1.487 1.177c.406.523.693 1.168.871 1.918q.208.83.237 1.83c-.869.2-3.318.808-3.694.872"
                  />
                  {/* Red rounded container */}
                  <path
                    fill="#d91629"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.847.814a4.78 4.78 0 0 0-4.78 4.78v16.44a4.78 4.78 0 0 0 4.78 4.78h16.44a4.78 4.78 0 0 0 4.78-4.78V5.595a4.78 4.78 0 0 0-4.78-4.78z"
                  />
                  {/* White brackets inside the red icon box */}
                  <path
                    fill="#ffffff"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.535 9.41h-2.131l-2.88 8.809h2.11zm-5.847 2.424v-2.4l-6.195 3.288v2.184l6.195 3.288V15.93l-3.91-2.135zm12.953.888-6.23-3.287v2.4l3.978 1.96-3.978 2.134v2.264l6.23-3.287z"
                  />
                </svg>
              </Link>

              {/* Desktop Navigation Links with Mega-Menus */}
              <nav aria-label="Main Navigation">
                <ul className="hidden items-center gap-1 xl:gap-2 lg:flex list-none m-0 p-0">
                  {/* 1. Platform Item */}
                  <li
                    className="relative list-none m-0 p-0"
                    onMouseEnter={() => handleMouseEnter("platform")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === "platform" ? null : "platform",
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-6 text-[15px] font-medium transition-colors cursor-pointer ${
                        activeMenu === "platform"
                          ? "text-white underline underline-offset-8"
                          : "text-white/90 hover:text-white"
                      }`}
                      aria-expanded={activeMenu === "platform"}
                    >
                      <span>Platform</span>
                      <ChevronDown
                        className={`size-3.5 transition-transform duration-200 ${
                          activeMenu === "platform" ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Platform Mega Menu Panel */}
                    {activeMenu === "platform" && (
                      <div className="absolute top-[85%] left-0 z-50 w-[780px] -translate-x-12 pt-3 animate-in fade-in zoom-in-95 duration-150">
                        <div className="relative rounded-2xl bg-[#1e1d1e] border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
                          {/* Pointer triangle */}
                          <div className="absolute -top-2 left-20 size-4 rotate-45 border-l border-t border-white/10 bg-[#1e1d1e]" />

                          <div className="grid grid-cols-3 gap-4">
                            {/* Qualify */}
                            <div className="rounded-xl bg-[#141314] p-4 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="flex items-center gap-2 text-base font-bold text-white">
                                    <span className="flex size-7 items-center justify-center rounded-md bg-[#d91629] text-white">
                                      <Filter className="size-4" />
                                    </span>
                                    Qualify
                                  </span>
                                  <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#141314] font-mono">
                                    New
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                                  Run automated pre-screens at scale without
                                  adding recruiter hours.
                                </p>
                              </div>
                              <Link
                                href="/company-registration"
                                className="text-xs font-mono font-bold uppercase text-[#d91629] group-hover:underline flex items-center gap-1"
                              >
                                Discover Qualify →
                              </Link>
                            </div>

                            {/* Screen */}
                            <div className="rounded-xl bg-[#141314] p-4 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group">
                              <div>
                                <div className="flex items-center gap-2 mb-2 text-base font-bold text-white">
                                  <span className="flex size-7 items-center justify-center rounded-md bg-white/10 text-white">
                                    <CheckCircle2 className="size-4 text-[#37c773]" />
                                  </span>
                                  Screen
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                                  Move candidates forward with confidence via
                                  fair, fast and accurate assessments.
                                </p>
                              </div>
                              <Link
                                href="/register"
                                className="text-xs font-mono font-bold uppercase text-white group-hover:underline flex items-center gap-1"
                              >
                                Discover Screen →
                              </Link>
                            </div>

                            {/* Interview */}
                            <div className="rounded-xl bg-[#141314] p-4 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group">
                              <div>
                                <div className="flex items-center gap-2 mb-2 text-base font-bold text-white">
                                  <span className="flex size-7 items-center justify-center rounded-md bg-white/10 text-white">
                                    <Code2 className="size-4 text-[#0693e3]" />
                                  </span>
                                  Interview
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                                  See how candidates code, communicate and
                                  collaborate in live 360° IDEs.
                                </p>
                              </div>
                              <Link
                                href="/company-registration"
                                className="text-xs font-mono font-bold uppercase text-white group-hover:underline flex items-center gap-1"
                              >
                                Discover Interview →
                              </Link>
                            </div>

                            {/* Map */}
                            <div className="rounded-xl bg-[#141314] p-4 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group">
                              <div>
                                <div className="flex items-center gap-2 mb-2 text-base font-bold text-white">
                                  <span className="flex size-7 items-center justify-center rounded-md bg-white/10 text-white">
                                    <MapIcon className="size-4 text-[#fcb900]" />
                                  </span>
                                  Map
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                                  Identify team strengths and weaknesses and
                                  track benchmark skill progression.
                                </p>
                              </div>
                              <Link
                                href="/company-registration"
                                className="text-xs font-mono font-bold uppercase text-white group-hover:underline flex items-center gap-1"
                              >
                                Discover Map →
                              </Link>
                            </div>

                            {/* Play */}
                            <div className="rounded-xl bg-[#141314] p-4 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between group">
                              <div>
                                <div className="flex items-center gap-2 mb-2 text-base font-bold text-white">
                                  <span className="flex size-7 items-center justify-center rounded-md bg-white/10 text-white">
                                    <Gamepad2 className="size-4 text-[#fe0f66]" />
                                  </span>
                                  Play
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                                  Engage your team and sharpen their skills with
                                  dynamic technical challenges.
                                </p>
                              </div>
                              <Link
                                href="/register"
                                className="text-xs font-mono font-bold uppercase text-white group-hover:underline flex items-center gap-1"
                              >
                                Discover Play →
                              </Link>
                            </div>

                            {/* Feature Highlights Card */}
                            <div className="rounded-xl bg-gradient-to-br from-[#241c22] to-[#161516] p-4 border border-white/10 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#d91629] uppercase mb-1">
                                  <Sparkles className="size-3.5" />
                                  Platform Engine
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2">
                                  Over 99+ Supported Languages
                                </h4>
                                <p className="text-xs text-neutral-400">
                                  Production-ready judge infrastructure with
                                  automatic unit tests, AI metrics and
                                  anti-cheat.
                                </p>
                              </div>
                              <Link
                                href="/register"
                                className="mt-3 text-xs font-mono font-bold text-white hover:text-[#d91629] transition-colors"
                              >
                                Explore Capabilities →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>

                  {/* 2. Why CoderPad? Item */}
                  <li
                    className="relative list-none m-0 p-0"
                    onMouseEnter={() => handleMouseEnter("why-coderpad")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === "why-coderpad" ? null : "why-coderpad",
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-6 text-[15px] font-medium transition-colors cursor-pointer ${
                        activeMenu === "why-coderpad"
                          ? "text-white underline underline-offset-8"
                          : "text-white/90 hover:text-white"
                      }`}
                      aria-expanded={activeMenu === "why-coderpad"}
                    >
                      <span>Why CoderPad?</span>
                      <ChevronDown
                        className={`size-3.5 transition-transform duration-200 ${
                          activeMenu === "why-coderpad" ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Why CoderPad? Mega Menu Panel */}
                    {activeMenu === "why-coderpad" && (
                      <div className="absolute top-[85%] left-0 z-50 w-[720px] -translate-x-28 pt-3 animate-in fade-in zoom-in-95 duration-150">
                        <div className="relative rounded-2xl bg-[#1e1d1e] border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
                          <div className="absolute -top-2 left-44 size-4 rotate-45 border-l border-t border-white/10 bg-[#1e1d1e]" />

                          <div className="grid grid-cols-2 gap-6">
                            {/* Left column: by Use Case & Teams */}
                            <div className="space-y-4">
                              <div>
                                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                                  By Use Case
                                </span>
                                <ul className="mt-2.5 space-y-2 text-sm">
                                  <li>
                                    <Link
                                      href="/register"
                                      className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                    >
                                      <Sparkles className="size-4 text-[#d91629]" />
                                      <span>AI Fluency Screening</span>
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      href="/company-registration"
                                      className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                    >
                                      <LineChart className="size-4 text-[#37c773]" />
                                      <span>High-Volume Hiring Pipeline</span>
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      href="/company-registration"
                                      className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                    >
                                      <GraduationCap className="size-4 text-[#0693e3]" />
                                      <span>University Recruiting</span>
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      href="/register"
                                      className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                    >
                                      <ShieldCheck className="size-4 text-[#fcb900]" />
                                      <span>Fraud & Cheating Detection</span>
                                    </Link>
                                  </li>
                                </ul>
                              </div>

                              <div className="pt-2 border-t border-white/10">
                                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                                  By Teams
                                </span>
                                <ul className="mt-2.5 space-y-2 text-sm">
                                  <li>
                                    <Link
                                      href="/company-registration"
                                      className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                    >
                                      <Users className="size-4 text-neutral-400" />
                                      <span>For Talent Acquisition Teams</span>
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      href="/company-registration"
                                      className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                    >
                                      <Wrench className="size-4 text-neutral-400" />
                                      <span>For Engineering Leaders</span>
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Right column: Compare & Webinar Feature */}
                            <div className="flex flex-col justify-between">
                              <div>
                                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                                  Compare
                                </span>
                                <ul className="mt-2.5 space-y-2 text-sm">
                                  <li>
                                    <Link
                                      href="/company-registration"
                                      className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                    >
                                      <CheckCircle2 className="size-4 text-neutral-400" />
                                      <span>vs HackerRank</span>
                                    </Link>
                                  </li>
                                  <li>
                                    <Link
                                      href="/company-registration"
                                      className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                    >
                                      <CheckCircle2 className="size-4 text-neutral-400" />
                                      <span>vs CodeSignal</span>
                                    </Link>
                                  </li>
                                </ul>
                              </div>

                              {/* Upcoming Webinar Card */}
                              <div className="mt-4 rounded-xl bg-[#141314] p-4 border border-white/10">
                                <span className="text-[10px] font-mono font-bold uppercase text-[#d91629]">
                                  Upcoming Webinar
                                </span>
                                <h5 className="mt-1 text-xs font-bold text-white line-clamp-2">
                                  How to spot early-career potential beyond the
                                  resume
                                </h5>
                                <p className="mt-1 text-[11px] text-neutral-400">
                                  Wednesday, October 28th • 12:15pm PDT
                                </p>
                                <a
                                  href="https://coderpad.io/events/how-to-spot-early-career-potential-beyond-the-resume/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-block rounded-full border border-white/40 px-3 py-1 font-mono text-[10px] font-bold uppercase text-white hover:bg-white hover:text-[#121112] transition-colors"
                                >
                                  Save Your Seat
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>

                  {/* 3. Resources Item */}
                  <li
                    className="relative list-none m-0 p-0"
                    onMouseEnter={() => handleMouseEnter("resources")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === "resources" ? null : "resources",
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-6 text-[15px] font-medium transition-colors cursor-pointer ${
                        activeMenu === "resources"
                          ? "text-white underline underline-offset-8"
                          : "text-white/90 hover:text-white"
                      }`}
                      aria-expanded={activeMenu === "resources"}
                    >
                      <span>Resources</span>
                      <ChevronDown
                        className={`size-3.5 transition-transform duration-200 ${
                          activeMenu === "resources" ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Resources Mega Menu Panel */}
                    {activeMenu === "resources" && (
                      <div className="absolute top-[85%] left-0 z-50 w-[640px] -translate-x-48 pt-3 animate-in fade-in zoom-in-95 duration-150">
                        <div className="relative rounded-2xl bg-[#1e1d1e] border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
                          <div className="absolute -top-2 left-64 size-4 rotate-45 border-l border-t border-white/10 bg-[#1e1d1e]" />

                          <div className="grid grid-cols-2 gap-6">
                            {/* Links list */}
                            <div className="space-y-3">
                              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                                Explore
                              </span>
                              <ul className="space-y-2 text-sm">
                                <li>
                                  <Link
                                    href="/register"
                                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                  >
                                    <Code2 className="size-4 text-neutral-400" />
                                    <span>Sandbox & Code Playground</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/company-registration"
                                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                  >
                                    <FileText className="size-4 text-neutral-400" />
                                    <span>Platform Documentation</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/register"
                                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                  >
                                    <MessageSquare className="size-4 text-neutral-400" />
                                    <span>Interview Question Bank</span>
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/company-registration"
                                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                  >
                                    <BarChart3 className="size-4 text-neutral-400" />
                                    <span>Customer Case Studies</span>
                                  </Link>
                                </li>
                                <li>
                                  <a
                                    href="https://coderpad.io/blog/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                                  >
                                    <Tv className="size-4 text-neutral-400" />
                                    <span>Blog & Engineering Insights</span>
                                  </a>
                                </li>
                              </ul>
                            </div>

                            {/* Featured Report Card */}
                            <div className="rounded-xl bg-[#141314] p-4 border border-white/10 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-mono font-bold uppercase text-[#d91629]">
                                  Featured Research
                                </span>
                                <h5 className="mt-1.5 text-sm font-bold text-white">
                                  State of Tech Hiring 2026
                                </h5>
                                <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                                  Learn how leading tech engineering leaders are
                                  navigating generative AI and technical skill
                                  validation.
                                </p>
                              </div>
                              <a
                                href="https://coderpad.io/survey-reports/coderpad-state-of-tech-hiring-2026/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center justify-center rounded-full border border-white bg-white/10 px-4 py-1.5 font-mono text-xs font-bold uppercase text-white hover:bg-white hover:text-[#121112] transition-colors"
                              >
                                Download Report
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>

                  {/* 4. For Candidates */}
                  <li className="list-none m-0 p-0">
                    <Link
                      href="/register"
                      className="px-3 py-6 text-[15px] font-medium text-white/90 hover:text-white transition-colors block"
                    >
                      For Candidates
                    </Link>
                  </li>

                  {/* 5. Get own Company */}
                  <li className="list-none m-0 p-0">
                    <Link
                      href="/company-registration"
                      className="px-3 py-6 text-[15px] font-medium text-white/90 hover:text-white transition-colors block"
                    >
                      Get own Company
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Right Action Controls (SIGN UP FREE, REQUEST DEMO, Login) */}
            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <>
                  {!companyRole && (
                    <Link
                      href="/company-registration"
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.05em] text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white shadow-sm"
                    >
                      <Building2 className="size-3.5" />
                      <span>Register Company</span>
                    </Link>
                  )}
                  <UserMenu user={user} />
                  <Link
                    href={dashboardUrl}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.05em] text-[#121112] transition-colors hover:bg-neutral-200 shadow-sm"
                  >
                    <LayoutDashboard className="size-3.5" />
                    <span>Dashboard</span>
                    <span className="font-sans">→</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Secondary Pill Button: SIGN UP FREE */}
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-full border-2 border-white bg-transparent px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.05em] text-white transition-colors hover:bg-white/10"
                  >
                    SIGN UP FREE
                  </Link>

                  {/* Primary Pill Button: REQUEST DEMO */}
                  <Link
                    href="/company-registration"
                    className="inline-flex items-center justify-center rounded-full border-2 border-white bg-white px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.05em] text-[#121112] transition-colors hover:bg-neutral-200 shadow-sm"
                  >
                    REQUEST DEMO
                  </Link>

                  {/* Text Link: Login → */}
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-1.5 pl-2 text-[15px] font-medium text-white/90 transition-colors hover:text-white"
                  >
                    <span>Login</span>
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="inline-flex size-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="size-6" />
                ) : (
                  <Menu className="size-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="border-t border-white/10 bg-[#121112] px-6 py-6 lg:hidden animate-in slide-in-from-top-4 duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
              <nav className="flex flex-col space-y-4 pb-6">
                {/* Mobile Platform Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileSubmenu(
                        mobileSubmenu === "platform" ? null : "platform",
                      )
                    }
                    className="flex w-full items-center justify-between text-left text-base font-semibold text-white py-2"
                  >
                    <span>Platform</span>
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        mobileSubmenu === "platform" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileSubmenu === "platform" && (
                    <div className="mt-2 space-y-2.5 pl-4 border-l border-white/10 py-2">
                      <Link
                        href="/company-registration"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-300 hover:text-white"
                      >
                        Qualify (Automated Pre-screens)
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-300 hover:text-white"
                      >
                        Screen (Coding Assessments)
                      </Link>
                      <Link
                        href="/company-registration"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-300 hover:text-white"
                      >
                        Interview (Live Coding)
                      </Link>
                      <Link
                        href="/company-registration"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-300 hover:text-white"
                      >
                        Map (Skill Analytics)
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Why CoderPad? Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileSubmenu(
                        mobileSubmenu === "why-coderpad"
                          ? null
                          : "why-coderpad",
                      )
                    }
                    className="flex w-full items-center justify-between text-left text-base font-semibold text-white py-2"
                  >
                    <span>Why CoderPad?</span>
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        mobileSubmenu === "why-coderpad" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileSubmenu === "why-coderpad" && (
                    <div className="mt-2 space-y-2.5 pl-4 border-l border-white/10 py-2">
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-300 hover:text-white"
                      >
                        AI Fluency Screening
                      </Link>
                      <Link
                        href="/company-registration"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-300 hover:text-white"
                      >
                        High-Volume Hiring
                      </Link>
                      <Link
                        href="/company-registration"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-300 hover:text-white"
                      >
                        Fraud & Cheating Prevention
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Resources Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileSubmenu(
                        mobileSubmenu === "resources" ? null : "resources",
                      )
                    }
                    className="flex w-full items-center justify-between text-left text-base font-semibold text-white py-2"
                  >
                    <span>Resources</span>
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        mobileSubmenu === "resources" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileSubmenu === "resources" && (
                    <div className="mt-2 space-y-2.5 pl-4 border-l border-white/10 py-2">
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-300 hover:text-white"
                      >
                        Sandbox & Playground
                      </Link>
                      <Link
                        href="/company-registration"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-300 hover:text-white"
                      >
                        Interview Questions
                      </Link>
                      <Link
                        href="/company-registration"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-neutral-300 hover:text-white"
                      >
                        State of Tech Hiring Report
                      </Link>
                    </div>
                  )}
                </div>

                {/* For Candidates & Pricing */}
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-white py-2"
                >
                  For Candidates
                </Link>
                <Link
                  href="/company-registration"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-white py-2"
                >
                  Get own Company
                </Link>
              </nav>

              {/* Mobile CTAs */}
              <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
                {user ? (
                  <>
                    <div className="flex items-center justify-between px-1 text-xs text-neutral-400">
                      <span className="truncate">
                        Signed in as{" "}
                        <strong className="text-white">
                          {user.name || user.email}
                        </strong>
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-white">
                        {getCompanyRole(user) || user.role}
                      </span>
                    </div>
                    {!companyRole && (
                      <Link
                        href="/company-registration"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 py-3 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        <Building2 className="size-4" />
                        <span>Register Company</span>
                      </Link>
                    )}
                    <Link
                      href={dashboardUrl}
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-white bg-white py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#121112]"
                    >
                      <LayoutDashboard className="size-4" />
                      <span>Go to Dashboard</span>
                    </Link>
                    <Button
                      variant="destructive"
                      disabled={isLoggingOut}
                      onClick={handleMobileLogout}
                      className="w-full rounded-full py-3 font-mono text-xs font-bold uppercase cursor-pointer"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : (
                        <LogOut className="size-4 mr-2" />
                      )}
                      <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex w-full items-center justify-center rounded-full border-2 border-white bg-transparent py-3 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10"
                    >
                      SIGN UP FREE
                    </Link>
                    <Link
                      href="/company-registration"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex w-full items-center justify-center rounded-full border-2 border-white bg-white py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#121112] hover:bg-neutral-200"
                    >
                      REQUEST DEMO
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-white/90 hover:text-white"
                    >
                      <span>Login</span>
                      <span>→</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </header>
      </div>
    </div>
  );
}

export default Header;
