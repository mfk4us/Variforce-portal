import { listProjects } from './actions'
import Link from 'next/link'

export default async function ProjectsPage({ params }: { params: { tenantId: string }}) {
  const projects = await listProjects(params.tenantId)
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Projects</h1>
      <ul className="space-y-2">
        {projects.map(p => (
          <li key={p.id} className="rounded border p-3">
            <div className="font-medium">{p.name}</div>
            <div className="text-sm opacity-75">{p.description}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}