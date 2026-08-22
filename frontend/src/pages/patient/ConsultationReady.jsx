import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { post, isBackendUnavailable } from '../../services/api'
import { getSession } from '../../services/session'
import './PatientFlow.css'

export default function ConsultationReady() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function startCall() {
    const queueId = location.state?.queueId || `demo-q-${Date.now()}`
    setLoading(true)
    try {
      const data = await post('/call/start', { queueId }, session.token)
      if (isBackendUnavailable(data)) {
        navigate('/patient/consultation', { replace: true, state: { queueId, callId: `demo-call-${Date.now()}`, demo: true } })
        return
      }
      if (!data?.callId) { navigate('/patient/consultation', { replace: true, state: { queueId, callId: `demo-call-${Date.now()}`, demo: true } }); return }
      navigate('/patient/consultation', { replace: true, state: { queueId, callId: data.callId, agoraToken: data.agoraToken } })
    } catch { navigate('/patient/consultation', { replace: true, state: { queueId, callId: `demo-call-${Date.now()}`, demo: true } }) }
    finally { setLoading(false) }
  }

  if (!session?.patientId) { navigate('/patient/login', { replace: true }); return null }

  return <div className="patient-page"><header className="patient-topbar"><div className="patient-brand"><span className="brand-mark">+</span><span>Nabha Telemed</span></div></header><main className="patient-shell"><section className="flow-card center-card">
    <div className="step-kicker">Step 5 · Consultation ready</div><div className="ready-icon">✓</div><h1>Your doctor is ready</h1><p className="muted">Tap below to enter the video consultation. Please allow camera and microphone access.</p>
    <div className="ready-note"><strong>Before you join</strong><span>Find a quiet place and keep your phone charged.</span></div>
    {error && <div className="error-box" role="alert">{error}</div>}
    <button className="primary-btn" onClick={startCall} disabled={loading}>{loading ? 'Connecting…' : 'Start video consultation'}</button>
  </section></main></div>
}
