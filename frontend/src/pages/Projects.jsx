import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Projects() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')

  const fetchProjects = () => api.getProjects().then(setProjects).finally(() => setLoading(false))

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.createProject(form)
      setShowModal(false)
      setForm({ name: '', description: '' })
      fetchProjects()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    await api.deleteProject(id)
    fetchProjects()
  }

  if (loading) return <div className="page" style={{ color: 'var(--muted)' }}>Loading...</div>

  return (
    <div className="page">
      <div className="flex-between mb-2">
        <h1 style={{ fontSize: '1.8rem' }}>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center" style={{ color: 'var(--muted)', padding: '3rem' }}>
          No projects yet. Create your first project!
        </div>
      ) : (
        <div className="grid-2">
          {projects.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex-between">
                <h3 style={{ fontSize: '1.1rem' }}>{p.name}</h3>
                {isAdmin && (
                  <button className="btn btn-danger" onClick={() => handleDelete(p.id)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                    Delete
                  </button>
                )}
              </div>
              {p.description && <p className="text-muted">{p.description}</p>}
              <div className="text-muted">Owner: {p.owner?.name}</div>
              <Link to={`/projects/${p.id}`} className="btn btn-ghost" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                View Tasks →
              </Link>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Website Redesign" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="What is this project about?" />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="flex gap-2 mt-2">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}