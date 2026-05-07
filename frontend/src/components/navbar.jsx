import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '60px', position: 'sticky', top: 0, zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)', textDecoration: 'none' }}>
          ⚡ TaskFlow
        </Link>
        <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Dashboard</Link>
        <Link to="/projects" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Projects</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          {user?.name} <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        </span>
        <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '0.4rem 1rem' }}>
          Logout
        </button>
      </div>
    </nav>
  )
}