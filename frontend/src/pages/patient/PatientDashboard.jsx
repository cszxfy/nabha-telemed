import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../../services/api'
import { clearSession, getSession } from '../../services/session'
import './PatientFlow.css'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [session, setSession] = useState(getSession())
  const [prescriptions, setPrescriptions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const current = getSession()
    if (!current?.token || !current?.patientId) {
      navigate('/patient/login', { replace: true })
      return
    }
    setSession(current)
    get(`/prescriptions/patient/${current.patientId}`, current.token)
      .then((data) => setPrescriptions(Array.isArray(data?.prescriptions) ? data.prescriptions : []))
      .catch(() => setPrescriptions([]))
  }, [navigate])

  function logout() {
    clearSession()
    navigate('/', { replace: true })
  }

  return (
    <div className="patient-page">
      <header className="patient-topbar"><div className="patient-brand"><span className="brand-mark">+</span><span>Nabha Telemed</span></div><button className="ghost-btn" onClick={logout}>Logout</button></header>
      <main className="patient-shell">
        <section className="hero-card">
          <div><div className="step-kicker">Patient home</div><h1>Namaste{session?.name ? `, ${session.name}` : ''}.</h1><p>Start a symptom check and join the doctor queue.</p></div>
          <button className="primary-btn" onClick={() => navigate('/patient/symptoms')}>Start symptom check</button>
        </section>
        <section className="section-block"><div className="section-heading"><h2>Latest prescriptions</h2><span>{prescriptions.length}</span></div>
          {error && <div className="error-box">{error}</div>}
          {!prescriptions.length && !error && <div className="empty-state">No prescriptions yet. They will appear here after a consultation.</div>}
          <div className="prescription-list">{prescriptions.map((p) => <article className="mini-card" key={p.prescriptionId}><strong>Prescription</strong><span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'}</span><div>{Array.isArray(p.medicines) && p.medicines.length ? `${p.medicines.length} medicine${p.medicines.length > 1 ? 's' : ''}` : 'No medicine details'}</div></article>)}</div>
        </section>
      </main>
    </div>
  )
}
