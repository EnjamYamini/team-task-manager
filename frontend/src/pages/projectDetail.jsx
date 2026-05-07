import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

const STATUS_OPTIONS = ['todo', 'in_progress', 'done']

export default function ProjectDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo', assigned_to: '', due_date: '' })
  const [filterStatus, setFilterStatus] = useState('')
  const [error, setError] = useState('')

  const fetchData = async () => {
    const [p, t, u] = await Promise.all([api.getProject(id), api.getTasks({ project_id: id }), api.getUsers()])
    setProject(p); setTasks(t); setUsers(u)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id])

  const openCreate = () => {
    setEditTask(null)
    setTaskForm({ title: '', description: '', status: 'todo', assigned_to: '', due_date: '' })
    setShowTaskModal(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      assigned_to: task.assigned_to || '',
      due_date: task.due_date ? task.due_date.slice(0, 10) : ''
    })
    setShowTaskModal(true)
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault(); setError('')
    const payload = {
      ...taskForm,
      project_id: parseInt(id),
      assigned_to: taskForm.assigned_to ? parseInt(taskForm.assigned_to) : null,
      due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null
    }
    try {
      if (editTask) {
        await api.updateTask(editTask.id, payload)
      } else {
        await api.createTask(payload)
      }
      setShowTaskModal(false)
      fetchData()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    await api.deleteTask(taskId)
    fetchData()
  }

  const handleStatusChange = async (taskId, newStatus) => {
    await api.updateTask(taskId, { status: newStatus })
    fetchData()
  }

  if (loading) return <div className="page" style={{ color: 'var(--muted)' }}>Loading...</div>

  const filtered = filterStatus ? tasks.filter(t => t.status === filterStatus) : tasks

  const columns = {
    todo: filtered.filter(t => t.status === 'todo'),
    in_progress: filtered.filter(t => t.status === 'in_progress'),
    done: filtered.filter(t => t.status === 'done'),
  }

  return (
    <div className="page">
      <div className="flex-between mb-2">
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>{project?.name}</h1>
          {project?.description && <p className="text-muted mt-1">{project.description}</p>}
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}>+ Add Task</button>}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className={`btn ${!filterStatus ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterStatus('')}>All ({tasks.length})</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilterStatus(s)}>
            {s.replace('_', ' ')} ({tasks.filter(t => t.status === s).length})
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid-3">
        {Object.entries(columns).map(([status, colTasks]) => (
          <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>({colTasks.length})</span>
            </div>
            {colTasks.map(task => (
              <div key={task.id} className="card" style={{ borderLeft: `3px solid var(--${status === 'in_progress' ? 'progress' : status === 'done' ? 'done' : 'todo'})` }}>
                <div className="flex-between">
                  <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{task.title}</span>
                </div>
                {task.description && <p className="text-muted" style={{ marginTop: '0.3rem', fontSize: '0.85rem' }}>{task.description}</p>}
                {task.assignee && <p className="text-muted" style={{ marginTop: '0.3rem', fontSize: '0.8rem' }}>👤 {task.assignee.name}</p>}
                {task.due_date && (
                  <p style={{ fontSize: '0.8rem', color: new Date(task.due_date) < new Date() && task.status !== 'done' ? 'var(--overdue)' : 'var(--muted)', marginTop: '0.3rem' }}>
                    📅 {new Date(task.due_date).toLocaleDateString()}
                    {new Date(task.due_date) < new Date() && task.status !== 'done' && ' ⚠️ Overdue'}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {STATUS_OPTIONS.filter(s => s !== task.status).map(s => (
                    <button key={s} className="btn btn-ghost" onClick={() => handleStatusChange(task.id, s)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                      → {s.replace('_', ' ')}
                    </button>
                  ))}
                  {isAdmin && <>
                    <button className="btn btn-ghost" onClick={() => openEdit(task)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(task.id)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>Del</button>
                  </>}
                </div>
              </div>
            ))}
            {colTasks.length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem', border: '1px dashed var(--border)', borderRadius: '10px' }}>
                No tasks
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required placeholder="Task title" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows={2} placeholder="Optional details" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Status</label>
                  <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select value={taskForm.assigned_to} onChange={e => setTaskForm({...taskForm, assigned_to: e.target.value})}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="flex gap-2 mt-2">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editTask ? 'Update' : 'Create'} Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}