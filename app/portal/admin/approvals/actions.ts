// app/portal/admin/approvals/actions.ts
'use server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function signDoc(path: string) {
  const { data, error } = await supabase
    .storage.from('documents')
    .createSignedUrl(path, 60 * 5); // 5 min
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function setApproval(phone: string, nextStatus: 'approved'|'rejected', adminId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ status: nextStatus, approved_by: adminId, approved_at: new Date().toISOString() })
    .eq('phone', phone);
  if (error) throw new Error(error.message);
}