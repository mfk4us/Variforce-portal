"use client";

import { useState } from "react";

export default function CreateProjectPage() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function doLogout() {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/portal/login";
    } catch {
      setLoggingOut(false);
      alert("Logout failed. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm text-gray-700">Signed in</span>
          </div>
          <button
            onClick={doLogout}
            disabled={loggingOut}
            className="text-sm underline disabled:no-underline disabled:opacity-50"
          >
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="max-w-xl">
          <h1 className="text-2xl font-semibold mb-2">Create Project</h1>
          <p className="text-gray-600 mb-6">
            🎉 Auth success! This is your placeholder. Next, we’ll add:
            VariBot intake / Manual form, file upload (20MB), and audit trail.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-5">
            <h2 className="font-medium text-gray-900">Start VariBot Intake</h2>
            <p className="text-sm text-gray-600 mt-1">
              Guided questions to collect project details and auto‑generate a BoQ.
            </p>
            <button
              className="mt-4 rounded bg-black text-white px-4 py-2"
              onClick={() => alert("VariBot intake coming soon")}
            >
              Start
            </button>
          </div>

          <div className="rounded-lg border bg-white p-5">
            <h2 className="font-medium text-gray-900">Manual Project Setup</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a project manually, then add items/files and invite your client.
            </p>
            <button
              className="mt-4 rounded bg-black text-white px-4 py-2"
              onClick={() => alert("Manual project coming soon")}
            >
              Create
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}