// app/admin/layout.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// shadcn/ui kit
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  Wrench,
  FolderKanban,
  FileSpreadsheet,
  Receipt,
  BookText,
  Boxes,
  Store,
  LifeBuoy,
  FileText,
  PhoneCall,
  ScrollText,
  Settings as SettingsIcon,
} from "lucide-react";
// --- Local theme toggle (no dependency on next-themes) ---
function applyThemeClass(theme: "light" | "dark") {
  try {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  } catch {}
}

function getInitialTheme(): "light" | "dark" {
  try {
    const stored = localStorage.getItem("vf_theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  try {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {}
  return "light";
}

function LocalThemeToggle() {
  const [mounted, setMounted] = (require("react") as typeof import("react")).useState(false);
  const [theme, setTheme] = (require("react") as typeof import("react")).useState<"light" | "dark">("light");
  const React = require("react") as typeof import("react");

  React.useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyThemeClass(t);
    setMounted(true);
  }, []);

  const setAndApply = (t: "light" | "dark") => {
    setTheme(t);
    try { localStorage.setItem("vf_theme", t); } catch {}
    applyThemeClass(t);
  };

  const icon = theme === "dark" ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
  );

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" aria-label="Theme" disabled>
        {icon}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Theme">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setAndApply("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setAndApply("dark")}>Dark</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
// --- End local theme toggle ---

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/partner-applications", label: "Partner Applications", icon: Handshake },
  { href: "/admin/workforce", label: "Workforce", icon: Wrench },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/estimates", label: "Estimates", icon: FileSpreadsheet },
  { href: "/admin/invoices-payments", label: "Invoices & Payments", icon: Receipt },
  { href: "/admin/rate-books", label: "Rate Books", icon: BookText },
  { href: "/admin/catalogs", label: "Catalogs", icon: Boxes },
  { href: "/admin/vendors", label: "Vendors & Marketplace", icon: Store },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/calls-log", label: "Calls Log", icon: PhoneCall },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const React = require("react") as typeof import("react");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Don't wrap the login page at /admin in the admin shell.
  if (pathname === "/admin") return <>{children}</>;

  const segments = pathname.split("/").filter(Boolean);
  const activeItem = NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  const pageTitle = activeItem?.label || (segments[segments.length - 1]?.replace(/-/g, " ") || "Dashboard");

  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = seg === "admin" ? "Admin" : seg.replace(/-/g, " ");
    return { href, label };
  });

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex lg:min-h-dvh lg:flex-col lg:border-r lg:bg-card/40 lg:backdrop-blur">
          <div className="flex items-center gap-3 p-4">
            <Image src="/logo.png" alt="BOCC" width={32} height={32} className="rounded-full" />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">VariForce Admin</div>
              <div className="text-[11px] text-muted-foreground">Logistics & partners</div>
            </div>
          </div>
          <Separator />
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className="w-full justify-between rounded-full"
                >
                  <Link href={item.href} className="flex w-full items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <item.icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </span>
                    {active && <span className="ml-2 h-2 w-2 rounded-full bg-emerald-500" />}
                  </Link>
                </Button>
              );
            })}
          </nav>
          <div className="p-4 text-[11px] text-muted-foreground">BOCC · Internal use only</div>
        </aside>

        {/* Main column */}
        <div className="min-h-dvh flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur" suppressHydrationWarning>
            <div className="flex h-14 items-center gap-2 px-3">
              {/* Mobile: open sidebar */}
              {mounted && (
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="icon" aria-label="Open menu">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[240px]">
                    <div className="flex items-center gap-3 p-4">
                      <Image src="/logo.png" alt="BOCC" width={28} height={28} className="rounded-full" />
                      <div className="text-sm font-extrabold tracking-tight">VariForce Admin</div>
                    </div>
                    <Separator />
                    <nav className="p-3 space-y-1">
                      {NAV.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                          <Button
                            key={item.href}
                            asChild
                            variant={active ? "secondary" : "ghost"}
                            className="w-full justify-between rounded-full"
                          >
                            <Link href={item.href} className="flex w-full items-center justify-between">
                              <span className="inline-flex items-center gap-2">
                                <item.icon className="h-4 w-4" aria-hidden />
                                {item.label}
                              </span>
                              {active && <span className="ml-2 h-2 w-2 rounded-full bg-emerald-500" />}
                            </Link>
                          </Button>
                        );
                      })}
                    </nav>
                  </SheetContent>
                </Sheet>
              )}

              {/* Breadcrumbs + title */}
              <div className="flex min-w-0 items-center gap-3">
                <Breadcrumb className="hidden sm:block">
                  <BreadcrumbList>
                    {crumbs.map((c, i) => (
                      <BreadcrumbItem key={c.href}>
                        {i < crumbs.length - 1 ? (
                          <>
                            <BreadcrumbLink asChild>
                              <Link href={c.href}>{c.label}</Link>
                            </BreadcrumbLink>
                            <BreadcrumbSeparator />
                          </>
                        ) : (
                          <BreadcrumbPage>{c.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
                <div className="truncate text-sm font-semibold sm:hidden">{pageTitle}</div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                {/* Theme toggle */}
                <LocalThemeToggle />

                {/* Notifications */}
                {mounted && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Notifications">
                        🔔
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-muted-foreground">All clear — no new notifications.</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Account */}
                {mounted && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2 px-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline text-sm">Admin</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                      <DropdownMenuItem className="text-muted-foreground">admin@bocc.sa</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/logout" className="text-red-600">Log out</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </header>

          {/* Routed content */}
          <main className="flex-1 px-3 py-4 md:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}