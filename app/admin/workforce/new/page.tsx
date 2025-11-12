

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ----- Types -----
type Member = {
  id: string;
  tenant_id: string | null;
  name: string | null;
  email: string | null;
  role: 'admin' | 'company_manager' | 'team_member' | 'workforce_leader' | 'technician' | 'helper' | null;
  status: 'active' | 'inactive' | 'suspended' | null;
  created_at: string | null;
};

type TeamInsert = {
  name: string;
  description?: string | null;
  avatar_url?: string | null;
  leader_member_id?: string | null;
};

// ----- Supabase client (browser / anon) -----
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default function NewTeamPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [leaderId, setLeaderId] = useState<string>('');

  // UI state
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load members for leader dropdown
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingMembers(true);
      setError(null);
      const { data, error } = await supabase
        .from('members')
        .select('id, tenant_id, name, email, role, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (!isMounted) return;
      if (error) {
        console.error('load members error:', error);
        setError(error.message || 'Failed to load members');
      } else {
        setMembers(data as Member[]);
      }
      setLoadingMembers(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const leaders = useMemo(
    () =>
      members.filter(
        (m) => m.status !== 'suspended' && (m.role === 'workforce_leader' || m.role === 'company_manager' || m.role === 'admin')
      ),
    [members]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!name.trim()) {
      setError('Team name is required.');
      return;
    }

    setSaving(true);
    const payload: TeamInsert = {
      name: name.trim(),
      description: description.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      leader_member_id: leaderId || null,
    };

    const { error } = await supabase.from('teams').insert(payload).select('*').single();

    setSaving(false);

    if (error) {
      console.error('create team error:', error);
      setError(error.message || 'Failed to create team');
      return;
    }

    setSuccess('Team created successfully.');
    // Redirect back to Workforce list after a short delay
    setTimeout(() => {
      router.push('/admin/workforce');
    }, 600);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create New Team</h1>
        <p className="text-sm text-muted-foreground">
          Add a new workforce team. Leader is optional and can be assigned later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 glass-card rounded-lg border p-6">
        {/* Team Name */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Electrical Crew A"
            className="h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short summary of this team's scope..."
            rows={3}
            className="w-full rounded-md border bg-transparent p-3 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Avatar URL */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Avatar URL</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…/team.png"
            className="h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Preview"
              className="mt-2 h-16 w-16 rounded border object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : null}
        </div>

        {/* Leader */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Leader (optional)</label>
          <select
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
            className="h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">— No leader —</option>
            {loadingMembers ? (
              <option value="" disabled>
                Loading…
              </option>
            ) : (
              leaders.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name ?? 'Unnamed'} {m.email ? `· ${m.email}` : ''} {m.role ? `· ${m.role}` : ''}
                </option>
              ))
            )}
          </select>
          <p className="text-xs text-muted-foreground">
            Only admins, company managers, and workforce leaders are listed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create Team'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/workforce')}
            className="inline-flex h-10 items-center rounded-md border px-4 text-sm"
          >
            Cancel
          </button>
        </div>

        {/* Messages */}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      </form>
    </div>
  );
}