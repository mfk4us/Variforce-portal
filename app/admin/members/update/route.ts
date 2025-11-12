export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(data: unknown, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export async function GET() {
  // Health check
  return json({ ok: true, route: '/admin/members/update' }, 200);
}

/**
 * POST body shapes:
 * - Update: { id: string, payload: { name?: string, email?: string, role?: string, status?: string } }
 * - Create: { action: 'create', payload: { name?: string, email?: string, role?: string, status?: string, tenant_id?: string, user_id?: string } }
 */
export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL) return json({ error: 'NEXT_PUBLIC_SUPABASE_URL not set' }, 500);
    if (!SERVICE_KEY) return json({ error: 'SUPABASE_SERVICE_ROLE not set (or SUPABASE_SERVICE_ROLE_KEY). Set it in .env.local and restart the dev server.' }, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    // Narrow type after parse
    const b = body as Record<string, unknown>;
    const action = (b?.action as string) || 'update';

    if (action === 'create') {
      const p = (b?.payload as Record<string, unknown>) || {};
      const insert: Record<string, string> = {};

      (['name', 'email', 'role', 'status', 'tenant_id', 'user_id'] as const).forEach((k) => {
        const v = p[k];
        if (typeof v === 'string' && v.trim()) insert[k] = v.trim();
      });

      if (!insert.role) insert.role = 'team_member';
      if (!insert.status) insert.status = 'active';

      const { data, error } = await supabase
        .from('members')
        .insert(insert)
        .select('*, tenant:tenant_id(name)')
        .single();

      if (error) return json({ error: error.message }, 400);
      if (!data) return json({ error: 'No data returned from Supabase' }, 500);

      return json({ success: true, data }, 200);
    }

    // UPDATE
    const id = b?.id as string | undefined;
    const payload = (b?.payload as Record<string, unknown>) || {};
    if (!id || typeof id !== 'string') return json({ error: 'Missing or invalid member id' }, 400);
    if (!payload || typeof payload !== 'object') return json({ error: 'Missing payload object' }, 400);

    const allowed: Record<string, string> = {};
    (['name', 'email', 'role', 'status'] as const).forEach((k) => {
      const v = payload[k];
      if (typeof v === 'string' && v.trim()) allowed[k] = v.trim();
    });

    if (Object.keys(allowed).length === 0) return json({ error: 'No valid fields to update' }, 400);

    const { data, error } = await supabase
      .from('members')
      .update(allowed)
      .eq('id', id)
      .select('*, tenant:tenant_id(name)')
      .single();

    if (error) return json({ error: error.message }, 400);
    if (!data) return json({ error: 'No data returned from Supabase' }, 500);

    return json({ success: true, data }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return json({ error: message }, 500);
  }
}