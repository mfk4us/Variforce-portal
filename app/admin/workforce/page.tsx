// cspell:ignore shadcn ilike

/* eslint-disable @next/next/no-img-element */
'use client';

// cspell:ignore shadcn ilike
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

// --- Client-only wrapper to avoid Radix hydration mismatches
function ClientOnly({ children }: { children: React.ReactNode }) {
  // Avoid setState in effect lint by deriving initial mount from window
  const [mounted] = useState(() => typeof window !== 'undefined');
  if (!mounted) return null;
  return <>{children}</>;
}

// --- Types aligned with your DB ---
interface Team {
  id: string;
  name: string | null;
  avatar_url: string | null;
  leader_member_id: string | null;
  description: string | null;
  created_at: string | null;
  updated_at?: string | null;
}

interface MemberOption {
  id: string;
  name: string | null;
  email: string | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TeamsPage() {
  const [rows, setRows] = useState<Team[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [q, setQ] = useState('');

  // Edit modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      let query = supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      const raw = q.trim();
      const safeQ = raw.replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').trim();
      if (safeQ) {
        // filter by name or description
        query = query.or(`name.ilike.%${safeQ}%,description.ilike.%${safeQ}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message || JSON.stringify(error));
      setRows((data ?? []) as Team[]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('load teams error:', e);
      setErrorMessage(msg || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      // light payload for leader dropdown
      const { data, error } = await supabase
        .from('members')
        .select('id,name,email')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw new Error(error.message || JSON.stringify(error));
      setMembers((data ?? []) as MemberOption[]);
    } catch (e: unknown) {
      console.error('load members (for leaders) error:', e);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => rows, [rows]);

  const startEdit = (r: Team) => {
    setEditing(r);
    setSaveError(null);
    setOpen(true);
  };

  const handleField = <K extends keyof Team>(k: K, v: Team[K]) => {
    setEditing((prev) => (prev ? { ...prev, [k]: v } : prev));
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: editing.name,
        description: editing.description,
        avatar_url: editing.avatar_url,
        leader_member_id: editing.leader_member_id,
      };

      const { data, error } = await supabase
        .from('teams')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single();

      if (error) throw new Error(error.message || JSON.stringify(error));

      setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...(data as Team) } : r)));
      setOpen(false);
      setEditing(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('save team error:', e);
      setSaveError(msg || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const leaderLabel = (id: string | null) => {
    if (!id) return '—';
    const m = members.find((x) => x.id === id);
    if (!m) return '—';
    return m.name ? `${m.name}${m.email ? ` · ${m.email}` : ''}` : (m.email ?? '—');
    };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Workforce Teams</h1>
          <p className="text-sm text-muted-foreground">Manage internal teams. Each team can have a leader (linked to a member).</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/workforce/new">
            <Button className="bg-emerald-600/90 hover:bg-emerald-600">+ Create Team</Button>
          </Link>
          <Button variant="outline" onClick={fetchTeams}>Refresh</Button>
        </div>
      </div>

      <Card className="backdrop-blur supports-[backdrop-filter]:bg-emerald-900/5 border-emerald-500/20">
        <div className="p-3 flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            placeholder="Search teams by name or description…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTeams()}
            className="md:max-w-sm"
          />
          <Button variant="secondary" onClick={fetchTeams}>Apply</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No teams found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtered.map((r) => {
                  const created = r.created_at ? new Date(r.created_at).toLocaleDateString() : '—';
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {r.avatar_url ? (
                            // using img here; you can swap to next/image if domain configured
                            <img src={r.avatar_url} alt="avatar" className="h-7 w-7 rounded border object-cover" />
                          ) : (
                            <div className="h-7 w-7 rounded border bg-muted" />
                          )}
                          <span>{r.name ?? '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{leaderLabel(r.leader_member_id)}</TableCell>
                      <TableCell>{created}</TableCell>
                      <TableCell className="max-w-[360px] truncate">{r.description ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => startEdit(r)}>View / Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {errorMessage && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded">
          {errorMessage}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>Edit team</DialogTitle>
            <DialogDescription>Update team details. Changes save instantly.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label htmlFor="name">Team name</Label>
              <Input
                id="name"
                value={editing?.name ?? ''}
                onChange={(e) => handleField('name', e.target.value)}
                placeholder="e.g., Riyadh Crew A"
              />
            </div>

            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={editing?.avatar_url ?? ''}
                onChange={(e) => handleField('avatar_url', e.target.value)}
                placeholder="https://…/team.png"
              />
            </div>

            <div>
              <Label>Leader</Label>
              <ClientOnly>
                <Select
                  value={editing?.leader_member_id ?? undefined}
                  onValueChange={(v) => handleField('leader_member_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingMembers ? 'Loading members…' : 'Select leader'} />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name ? `${m.name}${m.email ? ` · ${m.email}` : ''}` : (m.email ?? m.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ClientOnly>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editing?.description ?? ''}
                onChange={(e) => handleField('description', e.target.value)}
                placeholder="What this team does…"
              />
            </div>
          </div>

          {saveError && (
            <p className="text-sm text-red-600 mt-2">{saveError}</p>
          )}

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveEdit} disabled={saving} className="bg-emerald-600/90 hover:bg-emerald-600">
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
