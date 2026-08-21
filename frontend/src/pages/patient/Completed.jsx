import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../../services/api'
import { getSession } from '../../services/session'
import './PatientFlow.css'

export default function Completed() {
  const navigate = useNavigate()
  const session = getSession()
  const [prescriptions, setPrescriptions] = useState([])

  useEffect(() => {
    if (!session?.token || !session?.patientId) { navigate('/patient/login', { replace: true }); return }
    get(`/prescriptions/patient/${session.patientId}`, session.token).then((data) => setPrescriptions(data?.prescriptions || [])).catch(() => {})
  }, [navigate, session?.patientId, session?.token])

  return <div className="patient-page"><header className="patient-topbar"><div className="patient-brand"><span className="brand-mark">+</span><span>Nabha Telemed</span></div></header><main className="patient-shell"><section className="flow-card center-card">
    <div className="ready-icon">✓</div><div className="step-kicker">Step 7 · Consultation complete</div><h1>Your consultation is complete</h1><p className="muted">Thank you for using Nabha Telemed.</p>
    {prescriptions.length > 0 && <div className="success-panel"><strong>Prescription available</strong><span>Your doctor has added a prescription. You can view it from your patient home.</span></div>}
    <button className="primary-btn" onClick={() => navigate('/patient/dashboard')}>Go to patient home</button>
  </section></main></div>
}
