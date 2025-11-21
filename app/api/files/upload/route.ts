import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs' // ensure Node for formData File handling

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const tenantId = form.get('tenantId') as string | null
    const projectId = form.get('projectId') as string | null

    if (!file || !tenantId || !projectId) {
      return NextResponse.json({ error: 'file, tenantId, projectId required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const path = `tenants/${tenantId}/projects/${projectId}/${Date.now()}_${file.name}`

    const { error: upErr } = await supabase.storage
      .from('project-files')
      .upload(path, file, { upsert: false })

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    // create a short-lived signed URL for immediate preview/download
    const { data: signed, error: signErr } = await supabase.storage
      .from('project-files')
      .createSignedUrl(path, 60 * 10) // 10 minutes

    if (signErr) return NextResponse.json({ error: signErr.message }, { status: 500 })

    // (optional) persist a DB row in project_files table later; for now return the URL
    return NextResponse.json({ ok: true, path, url: signed.signedUrl })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}