"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PeopleIcon from "@mui/icons-material/People";

export default function TenantPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const tenantId = getTenantIdFromPath(pathname);

  const [isDark, setIsDark] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const isCurrentlyDark = root.classList.contains("dark");
    setIsDark(isCurrentlyDark);
  }, []);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    if (nextIsDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const currentSection = pathname.includes("/projects")
    ? "Projects"
    : pathname.includes("/clients")
    ? "Clients"
    : pathname.includes("/settings")
    ? "Settings"
    : "Dashboard";

  const navItems = [
    {
      key: "home",
      name: "Home",
      href: `/portal/${tenantId}/dashboard`,
      icon: <HomeIcon fontSize="small" />,
    },
    {
      key: "projects",
      name: "Projects",
      href: `/portal/${tenantId}/projects`,
      icon: <FolderIcon fontSize="small" />,
    },
    {
      key: "clients",
      name: "Clients",
      href: `/portal/${tenantId}/clients`,
      icon: <PeopleIcon fontSize="small" />,
    },
    {
      key: "settings",
      name: "Settings",
      href: `/portal/${tenantId}/settings`,
      icon: <SettingsIcon fontSize="small" />,
    },
  ];

  const [tenantInfo, setTenantInfo] = useState<{
    name: string | null;
    logo_url: string | null;
  } | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const loadTenant = async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("name, logo_url")
        .eq("id", tenantId)
        .single();

      if (!error && data) {
        setTenantInfo({
          name: data.name ?? null,
          logo_url: (data as any).logo_url ?? null,
        });
      }
    };

    loadTenant();
  }, [tenantId]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-50">
      <div className="flex min-h-screen w-full gap-0 px-0 py-0 md:px-0">
        {/* SIDEBAR */}
        <aside className="hidden w-64 flex-col rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-emerald-500/40 dark:bg-slate-950/90 dark:shadow-[0_0_40px_rgba(16,185,129,0.35)] md:flex">
          {/* Brand */}
          <div className="mb-4 flex flex-col items-center justify-center text-center">
            {/* Big Centered Company Logo */}
            <img
              src={
                tenantInfo?.logo_url && tenantInfo.logo_url !== ""
                  ? tenantInfo.logo_url
                  : "/placeholder-logo.png"
              }
              alt="Company Logo"
              className="h-20 w-20 rounded-2xl object-cover border border-emerald-300 dark:border-emerald-500/60 bg-white/70 dark:bg-slate-900 shadow-md"
            />

            {/* Company Name */}
            <div className="mt-3 flex flex-col">
              <span className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
                {tenantInfo?.name || "Company Name"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Client Portal
              </span>
            </div>
          </div>

          <Separator className="my-3 bg-emerald-200/70 dark:bg-emerald-500/40" />

          {/* Nav */}
          <ScrollArea className="flex-1">
            <nav className="flex flex-col gap-1 pt-1">
              {navItems.map((item) => {
                const isHome = item.key === "home";

                const active = isHome
                  ? pathname === `/portal/${tenantId}` ||
                    pathname === `/portal/${tenantId}/dashboard`
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.key}
                    href={isHome ? `/portal/${tenantId}/dashboard` : item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
                      "border border-transparent",
                      active
                        ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-700 shadow-[0_0_18px_rgba(16,185,129,0.25)] dark:bg-emerald-500/20 dark:text-emerald-100"
                        : "text-slate-700 hover:border-emerald-400/70 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:border-emerald-400/70 dark:hover:bg-slate-900/70 dark:hover:text-emerald-50"
                    )}
                  >
                    <span className="text-base leading-none flex items-center justify-center">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          <Separator className="my-3 bg-emerald-100 dark:bg-emerald-500/30" />

          {/* Footer / Placeholder for later (profile/logout) */}
          <div className="mt-2 flex items-center justify-between gap-2 text-slate-700 dark:text-slate-200">
            <div className="text-xs text-slate-400 dark:text-slate-400">
              Signed in as
              <span className="ml-1 font-medium text-emerald-700 dark:text-emerald-300">
                Tenant User
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-500/70 bg-white/80 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-900/80 dark:text-emerald-100 dark:hover:bg-slate-800"
            >
              Logout
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-emerald-500/40 dark:bg-slate-950/80 dark:shadow-[0_0_40px_rgba(15,23,42,0.9)] md:p-6">
          {/* Top header bar */}
          <div className="relative z-20 mb-4 flex flex-col gap-3 border-b border-emerald-100 pb-3 md:flex-row md:items-center md:justify-between">
            {/* Left: section title */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500 dark:text-emerald-300">
                Client Workspace
              </p>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {currentSection}
              </h1>
            </div>

            {/* Right: search + theme toggle + notifications + account */}
            <div className="flex flex-1 items-center justify-end gap-3">
              {/* Search */}
              <div className="hidden w-full max-w-xs md:block">
                <Input
                  type="search"
                  placeholder="Search projects, clients..."
                  className="h-9 w-full rounded-xl border border-emerald-100 bg-emerald-50/60 text-xs text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-300 dark:border-emerald-500/40 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Theme toggle */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-full border-emerald-400 bg-white/80 text-emerald-700 shadow-sm hover:bg-emerald-50 hover:text-emerald-900 dark:bg-slate-900/80 dark:text-emerald-200 dark:hover:bg-slate-800"
              >
                <span className="text-base" aria-hidden="true">
                  {isDark ? "🌙" : "☀️"}
                </span>
                <span className="sr-only">
                  Toggle {isDark ? "light" : "dark"} mode
                </span>
              </Button>

              {/* Notifications with dropdown */}
              <div className="relative z-30">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsNotificationsOpen((prev) => !prev)}
                  className="relative h-9 w-9 rounded-full border-emerald-300 bg-white/80 text-emerald-700 shadow-sm hover:bg-emerald-50 hover:text-emerald-900 dark:border-emerald-500/60 dark:bg-slate-900/80 dark:text-emerald-200 dark:hover:bg-slate-800"
                >
                  <NotificationsIcon fontSize="small" />
                  {/* Unread dot (static for now, can be wired to real data later) */}
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  <span className="sr-only">Open notifications</span>
                </Button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-emerald-100 bg-white/95 p-3 text-xs shadow-[0_18px_45px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-emerald-500/40 dark:bg-slate-900/95 dark:text-slate-100">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-500 dark:text-emerald-300">
                        Notifications
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-[11px] font-medium text-slate-400 hover:text-emerald-500 dark:text-slate-500 dark:hover:text-emerald-300"
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-lg border border-emerald-50 bg-emerald-50/60 p-2 text-[11px] text-slate-800 dark:border-emerald-500/30 dark:bg-slate-900/80 dark:text-slate-100">
                        <p className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-300">
                          New project created
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                          “IT expert project” was added to your workspace.
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                          Just now
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-100 bg-white/80 p-2 text-[11px] text-slate-800 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
                        <p className="font-semibold text-[11px] text-slate-800 dark:text-slate-100">
                          Status updates
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                          Kanban changes and approvals will appear here.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="mt-1 w-full rounded-lg border border-dashed border-emerald-200/70 py-1.5 text-[11px] font-medium text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-emerald-500/50 dark:text-emerald-300 dark:hover:border-emerald-300 dark:hover:bg-slate-900"
                      >
                        View all activity
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Account avatar */}
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9 border border-emerald-200 bg-emerald-50 dark:border-emerald-500/60 dark:bg-slate-900">
                  <AvatarFallback className="text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                    TU
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
            <div className="pb-10">{children}</div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}

/**
 * Extract current tenantId from path
 * e.g., /portal/123/projects → '123'
 */
function getTenantIdFromPath(path: string) {
  const parts = path.split("/");
  const index = parts.indexOf("portal");
  if (index >= 0 && parts[index + 1]) {
    return parts[index + 1];
  }
  return "";
}
