'use client'

import { useState, useTransition } from 'react'
import { createProject } from './actions'

export default function CreateProjectForm({ tenantId }: { tenantId: string }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <form
      className="rounded-lg border p-4 space-y-3"
      onSubmit={e => {
        e.preventDefault()
        setMsg(null)
        startTransition(async () => {
          try {
            await createProject(tenantId, { name, description, view_mode: 'kanban' })
            setName(''); setDescription('')
            setMsg('Project created.')
            // You can also refresh router here if needed
          } catch (err: any) {
            setMsg(err?.message ?? 'Failed')
          }
        })
      }}
    >
      <div className="font-medium">New project</div>
      <input
        className="w-full rounded border px-3 py-2"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <textarea
        className="w-full rounded border px-3 py-2"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <button
          disabled={isPending}
          className="rounded bg-emerald-600 text-white px-4 py-2 disabled:opacity-50"
        >
          {isPending ? 'Creating…' : 'Create'}
        </button>
        {msg && <span className="text-sm opacity-70">{msg}</span>}
      </div>
    </form>
  )
}