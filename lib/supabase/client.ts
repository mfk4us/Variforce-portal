// lib/supabase/client.ts
// Centralized Supabase clients for browser (RLS) and server (RLS with cookie store).

import type { Database } from "@/lib/database.types";
import {
  createBrowserClient as _createBrowserClient,
  createServerClient as _createServerClient,
} from "@supabase/ssr";

// ---- Browser client (RLS, uses anon key) ----
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !anon) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[supabase] Missing NEXT_PUBLIC_SUPABASE_URL/ANON_KEY env vars");
    }
  }
  return _createBrowserClient<Database>(url!, anon!);
}

// ---- Server client (RLS) for layouts/pages/actions with cookie store ----
// Pass Next.js cookies() or a compatible store ({ get,set,getAll,setAll }).
export function createServerClientRLS(cookieStore: {
  get: (name: string) => { name: string; value: string } | undefined;
  getAll?: () => { name: string; value: string }[];
  set: (name: string, value: string, options?: any) => void;
  setAll?: (cookies: { name: string; value: string; options?: any }[]) => void;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  // Adapter shape expected by @supabase/ssr
  const cookies = {
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options: any) {
      cookieStore.set(name, value, options);
    },
    getAll() {
      const all = (cookieStore.getAll ? cookieStore.getAll() : []) as any[];
      return all.map((c) => ({ name: c.name, value: c.value }));
    },
    setAll(_cookies: { name: string; value: string; options?: any }[]) {
      if (cookieStore.setAll) cookieStore.setAll(_cookies as any);
      else _cookies.forEach((c) => cookieStore.set(c.name, c.value, c.options));
    },
  };

  return _createServerClient<Database>(url!, anon!, { cookies });
}