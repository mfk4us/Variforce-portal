import { listProjects } from './actions'
import CreateProjectForm from './CreateProjectForm'

export default async function ProjectsPage({ params }: { params: { tenantId: string } }) {
  const projects = await listProjects(params.tenantId)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm opacity-70">Create and manage your projects.</p>
      </div>

      <CreateProjectForm tenantId={params.tenantId} />

      <ul className="grid gap-3">
        {projects.map(p => (
          <li key={p.id} className="rounded-lg border p-4">
            <div className="font-medium">{p.name}</div>
            {p.description && <div className="text-sm opacity-75">{p.description}</div>}
          </li>
        ))}
      </ul>
    </div>
  )
}