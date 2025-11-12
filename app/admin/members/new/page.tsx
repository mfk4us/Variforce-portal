'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const ROLE_OPTIONS = [
  'admin',
  'company_manager',
  'team_member',
  'workforce_leader',
  'technician',
  'helper',
] as const;

const STATUS_OPTIONS = ['active', 'inactive', 'suspended'] as const;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Tenant { id: string; name: string | null; status?: string | null }
type CreateResp = { success?: boolean; data?: unknown; error?: string };

export default function NewMemberPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('team_member');
  const [status, setStatus] = useState<string>('active');
  const [tenantId, setTenantId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTenants = async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, status')
        .eq('status', 'approved')
        .order('name', { ascending: true });

      if (error) console.error('Error loading tenants:', error);
      setTenants(data || []);
    };
    loadTenants();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    // Require User ID (compulsory)
    if (!userId.trim()) {
      setError('User ID is required');
      setSaving(false);
      return;
    }

    const payload: Record<string, string> = {};
    if (name.trim()) payload.name = name.trim();
    if (email.trim()) payload.email = email.trim();
    if (role.trim()) payload.role = role.trim();
    if (status.trim()) payload.status = status.trim();
    if (tenantId.trim()) payload.tenant_id = tenantId.trim();
    if (userId.trim()) payload.user_id = userId.trim();

    try {
      const res = await fetch('/admin/members/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ action: 'create', payload }),
        cache: 'no-store',
        credentials: 'same-origin',
      });

      const ct = res.headers.get('content-type') || '';
      let json: CreateResp | null = null;
      let text: string | null = null;
      if (ct.includes('application/json')) { try { json = await res.json(); } catch { json = null; } }
      else { try { text = await res.text(); } catch { text = null; } }

      if (!res.ok) {
        const msg = json?.error ?? text ?? `HTTP ${res.status}`;
        setError(typeof msg === 'string' ? `${msg} (HTTP ${res.status})` : `HTTP ${res.status}`);
        return;
      }

      router.push('/admin/members');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">New Member</h1>

      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>

        <div className="grid gap-1">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </div>

        <div className="grid gap-1">
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur bg-white/80 dark:bg-emerald-950/80">
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur bg-white/80 dark:bg-emerald-950/80">
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label>Company</Label>
          <Select value={tenantId} onValueChange={setTenantId}>
            <SelectTrigger className="bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur">
              <SelectValue placeholder="Select company (tenant)" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur bg-white/80 dark:bg-emerald-950/80 max-h-64 overflow-y-auto">
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name ?? t.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <Label>User ID</Label>
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="auth.users id (uuid)"
            required
          />
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="flex gap-3">
        <Button onClick={handleCreate} disabled={saving}>
          {saving ? 'Creating…' : 'Create Member'}
        </Button>
        <Button variant="outline" onClick={() => router.push('/admin/members')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}