"use client";
import { useEffect } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function LogoutPage() {
  useEffect(() => {
    async function signOut() {
      try {
        await supabase.auth.signOut();
      } catch {}
      // Clear local workspace hints
      try { localStorage.removeItem("vf_tenant"); } catch {}
      document.cookie = "vf_tenant=; Max-Age=0; Path=/; SameSite=Lax";
      window.location.href = "/portal/login";
    }
    signOut();
  }, []);

  return (
    <div className="min-h-screen grid place-items-center text-center p-6">
      <p className="text-sm opacity-60">Signing out…</p>
    </div>
  );
}