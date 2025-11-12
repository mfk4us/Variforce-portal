'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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

type Role = typeof ROLE_OPTIONS[number];
type Status = typeof STATUS_OPTIONS[number];

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: Role | null;
  status: Status | null;
  created_at: string | null;
  tenant_id?: string | null;
  tenant?: { name?: string | null };
}

type UpdateResp = { success?: boolean; data?: Member; error?: string };

export default function AdminMembersPage() {
  const [rows, setRows] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edited, setEdited] = useState<Partial<Member>>({});
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [tenants, setTenants] = useState<{ id: string; name: string | null }[]>([]);
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cRole, setCRole] = useState<string>('team_member');
  const [cStatus, setCStatus] = useState<string>('active');
  const [cTenantId, setCTenantId] = useState<string>('');
  const [cUserId, setCUserId] = useState<string>('');
  const [cSaving, setCSaving] = useState(false);
  const [cError, setCError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*, tenant:tenant_id(name)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading members:', error);
        setRows([]);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadTenants = async () => {
      const { data } = await supabase
        .from('tenants')
        .select('id, name, status')
        .eq('status', 'approved')
        .order('name', { ascending: true });
      setTenants(data || []);
    };
    if (createOpen) loadTenants();
  }, [createOpen]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((m) => {
      const nm = (m.name || '').toLowerCase();
      const em = (m.email || '').toLowerCase();
      const rl = (m.role || '').toString().toLowerCase();
      const co = (m.tenant?.name || '').toLowerCase();
      return nm.includes(term) || em.includes(term) || rl.includes(term) || co.includes(term);
    });
  }, [rows, search]);

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setEdited({
      id: m.id,
      name: m.name ?? '',
      email: m.email ?? '',
      role: (m.role ?? '') as Role | '',
      status: (m.status ?? '') as Status | '',
    });
    setSaveError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEdited({});
    setSaveError(null);
  };

  const setField = (field: keyof Member, value: string) => {
    setEdited((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setSaveError(null);

    const changed: Record<string, string> = {};
    (['name', 'email', 'role', 'status'] as const).forEach((k) => {
      const v = (edited as Record<string, unknown>)[k];
      if (typeof v === 'string' && v.trim()) changed[k] = v.trim();
    });
    if (Object.keys(changed).length === 0) {
      setSaveError('Nothing to update');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/admin/members/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: editingId, payload: changed }),
        cache: 'no-store',
        credentials: 'same-origin',
      });

      const ct = res.headers.get('content-type') || '';
      let json: UpdateResp | null = null;
      let text: string | null = null;
      if (ct.includes('application/json')) { try { json = await res.json(); } catch { json = null; } }
      else { try { text = await res.text(); } catch { text = null; } }

      if (!res.ok) {
        const raw = json?.error ?? text ?? `HTTP ${res.status}`;
        const msg = typeof raw === 'string' ? raw : `HTTP ${res.status}`;

        // Special guidance for missing service-role key on the server route
        if (/SUPABASE_SERVICE_ROLE/i.test(msg) || /SERVICE_ROLE/i.test(msg)) {
          setSaveError(
            `Server route is missing the Supabase service role key. ` +
            `Set SUPABASE_SERVICE_ROLE (or SUPABASE_SERVICE_ROLE_KEY) in .env.local and restart dev. ` +
            `Health check: open /admin/members/update to verify ok.`
          );
        } else {
          setSaveError(`${msg} (HTTP ${res.status})`);
        }
        return;
      }

      if (!json?.data) {
        setSaveError('Save succeeded but API returned no data');
        return;
      }

      setRows((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...json.data! } : m)));
      cancelEdit();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Unexpected error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setCSaving(true);
    setCError(null);
    const payload: Record<string, string> = {};
    if (cName.trim()) payload.name = cName.trim();
    if (cEmail.trim()) payload.email = cEmail.trim();
    if (cRole.trim()) payload.role = cRole.trim();
    if (cStatus.trim()) payload.status = cStatus.trim();
    if (cTenantId.trim()) payload.tenant_id = cTenantId.trim();
    if (cUserId.trim()) payload.user_id = cUserId.trim();

    try {
      const res = await fetch('/admin/members/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ action: 'create', payload }),
      });
      const ct = res.headers.get('content-type') || '';
      let json: any = null; let text: string | null = null;
      if (ct.includes('application/json')) { try { json = await res.json(); } catch { json = null; } }
      else { try { text = await res.text(); } catch { text = null; } }

      if (!res.ok || !json?.data) {
        const msg = json?.error ?? text ?? `HTTP ${res.status}`;
        setCError(typeof msg === 'string' ? msg : 'Failed to create');
        return;
      }

      // Prepend new row and close modal
      setRows((prev) => [json.data, ...prev]);
      setCreateOpen(false);
      setCName(''); setCEmail(''); setCRole('team_member'); setCStatus('active'); setCTenantId(''); setCUserId('');
    } catch (e) {
      setCError(e instanceof Error ? e.message : 'Unexpected error');
    } finally {
      setCSaving(false);
    }
  };
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Members</h1>
        <Button onClick={() => setCreateOpen(true)} variant="default">+ New Member</Button>
      </div>

      <div className="flex items-center justify-between">
        <Input
          placeholder="Search members or companies…"
          className="max-w-sm bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No members found.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-emerald-500/20 bg-emerald-500/5 backdrop-blur supports-[backdrop-filter]:bg-emerald-500/10">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-500/10 text-xs uppercase text-emerald-900 dark:text-emerald-200">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Joined</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const isEditing = editingId === m.id;
                return (
                  <tr key={m.id} className="border-t hover:bg-emerald-500/10 transition-colors">
                    <td className="p-2">
                      {isEditing ? (
                        <Input
                          className="bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur"
                          value={(edited.name as string) ?? ''}
                          onChange={(e) => setField('name', e.target.value)}
                        />
                      ) : (
                        m.name || '—'
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <Input
                          className="bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur"
                          value={(edited.email as string) ?? ''}
                          onChange={(e) => setField('email', e.target.value)}
                        />
                      ) : (
                        m.email || '—'
                      )}
                    </td>
                    <td className="p-2 text-emerald-900 dark:text-emerald-200 font-medium">
                      {m.tenant?.name || '—'}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <Select
                          value={(edited.role as string) ?? (m.role ?? '')}
                          onValueChange={(v) => setField('role', v)}
                        >
                          <SelectTrigger className="w-[180px] bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent className="backdrop-blur bg-white/80 dark:bg-emerald-950/80">
                            {ROLE_OPTIONS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        m.role || '—'
                      )}
                    </td>
                    <td className="p-2">
                      {isEditing ? (
                        <Select
                          value={(edited.status as string) ?? (m.status ?? '')}
                          onValueChange={(v) => setField('status', v)}
                        >
                          <SelectTrigger className="w-[160px] bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="backdrop-blur bg-white/80 dark:bg-emerald-950/80">
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        m.status || '—'
                      )}
                    </td>
                    <td className="p-2">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-2 space-x-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={saveEdit} disabled={saving}>
                            {saving ? 'Saving…' : 'Save'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} disabled={saving}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startEdit(m)}>
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {saveError ? <div className="p-2 text-xs text-red-600">{saveError}</div> : null}
        </div>
      )}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[560px] backdrop-blur bg-white/80 dark:bg-emerald-950/80 border-emerald-500/30">
          <DialogHeader>
            <DialogTitle>Create Member</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1">
              <Label>Name</Label>
              <Input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="grid gap-1">
              <Label>Email</Label>
              <Input value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="grid gap-1">
              <Label>Role</Label>
              <Select value={cRole} onValueChange={setCRole}>
                <SelectTrigger className="bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur bg-white/80 dark:bg-emerald-950/80">
                  {['admin','company_manager','team_member','workforce_leader','technician','helper'].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Status</Label>
              <Select value={cStatus} onValueChange={setCStatus}>
                <SelectTrigger className="bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur bg-white/80 dark:bg-emerald-950/80">
                  {['active','inactive','suspended'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Company (Tenant)</Label>
              <Select value={cTenantId} onValueChange={setCTenantId}>
                <SelectTrigger className="bg-white/60 dark:bg-emerald-950/40 border-emerald-500/30 backdrop-blur">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto backdrop-blur bg-white/80 dark:bg-emerald-950/80">
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name ?? t.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>User ID (optional)</Label>
              <Input value={cUserId} onChange={(e) => setCUserId(e.target.value)} placeholder="auth.users id (uuid)" />
            </div>
            {cError ? <div className="text-sm text-red-600">{cError}</div> : null}
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={handleCreate} disabled={cSaving}>{cSaving ? 'Creating…' : 'Create'}</Button>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={cSaving}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}