import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { clearDoctorSession, getDoctorSession } from '../../services/doctorSession'
import './DoctorCommon.css'

function BrandMark() {
  return <span className="doctor-mark" aria-hidden="true">
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h4l1.5-4 2.5 8 1.5-4H19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
}

export default function DoctorLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getDoctorSession()
  const name = session?.name || 'Doctor'

  function logout() {
    clearDoctorSession()
    navigate('/doctor/login', { replace: true })
  }

  const isHistory = location.pathname.startsWith('/doctor/history')
  const isQueue = location.pathname.startsWith('/doctor/queue') || location.pathname.startsWith('/doctor/patient') || location.pathname.startsWith('/doctor/call') || location.pathname.startsWith('/doctor/consultation') || location.pathname.startsWith('/doctor/prescription') || location.pathname.startsWith('/doctor/completed')

  return <div className="doctor-app">
    <header className="doctor-topbar">
      <div className="doctor-brand">
        <BrandMark />
        <div className="doctor-brand-text">
          <strong>Nabha Telemed</strong>
          <span>Doctor console</span>
        </div>
      </div>
      <nav className="doctor-nav" aria-label="Doctor navigation">
        <NavLink to="/doctor/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/doctor/queue" className={() => isQueue ? 'active' : ''}>Queue</NavLink>
        <NavLink to="/doctor/history" className={() => isHistory ? 'active' : ''}>History</NavLink>
      </nav>
      <div className="doctor-user">
        <span className="doctor-portal-badge" aria-label="You are in the Doctor Portal">✚ Doctor Portal</span>
        <div className="doctor-user-copy">
          <strong>{name}</strong>
          <span>Doctor ID · {session?.doctorId || '—'}</span>
        </div>
        <div className="doctor-avatar" aria-hidden="true">{name.slice(0,1).toUpperCase()}</div>
        <button className="doctor-btn doctor-btn-quiet" onClick={logout}>Logout</button>
      </div>
    </header>
    {children}
  </div>
}
