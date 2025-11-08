"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * TEMP Auth provider (swap later for NextAuth / Supabase / Clerk)
 * --------------------------------------------------------------
 * This keeps the app compiling now and gives you a typed hook.
 * Replace this with your real auth provider when ready.
 */
type AuthUser = { id: string; name?: string; email?: string } | null;

type AuthContextValue = {
  user: AuthUser;
  signIn: (provider?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser>(null);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      // Replace these with your real auth calls
      signIn: async () => setUser({ id: "dev", name: "Developer" }),
      signOut: async () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook you can use anywhere (eg. const {user, signIn} = useAuth()) */
export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within &lt;AuthProvider&gt;");
  return ctx;
}

/**
 * Global Providers (Theme + React Query + Auth + Toast)
 * -----------------------------------------------------
 * - ThemeProvider: dark/system themes via class on &lt;html&gt;
 * - QueryClientProvider: caching/fetching
 * - AuthProvider: temporary context (swap later)
 * - Toaster: global notifications (sonner)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create one QueryClient for the lifetime of the app
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1m
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  );
}