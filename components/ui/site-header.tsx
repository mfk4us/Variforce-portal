"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

interface SiteHeaderProps {
  onMenuClick?: () => void; // used for mobile overlay layouts
}

export function SiteHeader({ onMenuClick }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          {/* Hamburger (mobile only) */}
          {onMenuClick && (
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link href="/" className="font-semibold tracking-tight">
            Variforce Portal
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/projects" className="hover:text-foreground">
              Projects
            </Link>
            <Link href="/settings" className="hover:text-foreground">
              Settings
            </Link>
          </nav>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Sign up</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}