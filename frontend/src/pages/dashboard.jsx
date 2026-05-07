import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}`, textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Syne', color }}>{value}</div>
      <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getTasks()])
      .then(([s, t]) => { setStats(s); setTasks(t) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page" style={{ color: 'var(--muted)' }}>Loading dashboard...</div>

  const recentTasks = tasks.slice(0, 6)

  return (
    <div className="page">
      <div className="flex-between mb-2">
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>👋 Welcome, {user?.name}</h1>
          <p className="text-muted mt-1">Here's your task overview</p>
        </div>
        <Link to="/projects" className="btn btn-primary">View Projects →</Link>
      </div>

      {stats && (
        <div className="grid-4 mt-2 mb-2" style={{ marginBottom: '2rem' }}>
          <StatCard label="Total Tasks" value={stats.total} color="var(--accent)" />
          <StatCard label="To Do" value={stats.todo} color="var(--todo)" />
          <StatCard label="In Progress" value={stats.in_progress} color="var(--progress)" />
          <StatCard label="Done" value={stats.done} color="var(--done)" />
        </div>
      )}

      {stats?.overdue > 0 && (
        <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem', color: 'var(--overdue)' }}>
          ⚠️ You have <strong>{stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''}</strong> that need attention!
        </div>
      )}

      <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Recent Tasks</h2>
      {recentTasks.length === 0 ? (
        <div className="card text-center" style={{ color: 'var(--muted)', padding: '3rem' }}>
          No tasks yet. <Link to="/projects" style={{ color: 'var(--accent)' }}>Create a project</Link> to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recentTasks.map(task => (
            <div key={task.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{task.title}</div>
                <div className="text-muted" style={{ marginTop: '0.2rem' }}>
                  Project #{task.project_id} · {task.assignee ? `Assigned to ${task.assignee.name}` : 'Unassigned'}
                </div>
              </div>
              <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}