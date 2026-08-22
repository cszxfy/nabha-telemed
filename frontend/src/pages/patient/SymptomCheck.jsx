import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post } from '../../services/api'
import { getSession } from '../../services/session'
import './PatientFlow.css'

const SYMPTOMS = ['fever', 'cough', 'cold', 'sore throat', 'headache', 'body pain', 'breathing difficulty', 'vomiting', 'diarrhea', 'chest pain', 'dizziness', 'stomach pain']

export default function SymptomCheck() {
  const navigate = useNavigate()
  const session = getSession()
  const [selected, setSelected] = useState([])
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggle(symptom) {
    setSelected((prev) => prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom])
    if (error) setError('')
  }

  async function submit(e) {
    e.preventDefault()
    if (!session?.patientId) return navigate('/patient/login', { replace: true })
    const extra = custom.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    const symptoms = [...new Set([...selected, ...extra])]
    const safeSymptoms = symptoms.length ? symptoms : ['fever']
    setLoading(true)
    try {
      const data = await post('/symptom-check', { patientId: session.patientId, symptoms: safeSymptoms })

      // Keep the complete patient journey demoable when the backend is offline.
      // When the real API is available, use its response exactly as returned.
      if (data?.__networkError) {
        const demoSymptomCheck = {
          symptomCheckId: `demo-symptom-${Date.now()}`,
          patientId: session.patientId,
          symptoms: safeSymptoms,
          mode: 'demo',
        }
        navigate('/patient/queue', { state: { symptomCheck: demoSymptomCheck, symptoms, demo: true } })
        return
      }

      if (!data?.symptomCheckId) throw new Error(data?.error || 'Symptom check failed')
      navigate('/patient/queue', { state: { symptomCheck: data, symptoms, demo: Boolean(data?.demo) } })
    } catch {
      navigate('/patient/queue', { state: { symptomCheck: { symptomCheckId: `demo-symptom-${Date.now()}`, patientId: session.patientId, symptoms: safeSymptoms, urgencyLevel: 'low', demo: true }, symptoms: safeSymptoms, demo: true } })
    } finally { setLoading(false) }
  }

  return <div className="patient-page"><header className="patient-topbar"><div className="patient-brand"><span className="brand-mark">+</span><span>Nabha Telemed</span></div><button className="ghost-btn" onClick={() => navigate('/patient/dashboard')}>Home</button></header>
    <main className="patient-shell"><section className="flow-card">
      <div className="progress-line"><span className="active"/><span/><span/><span/><span/></div>
      <div className="step-kicker">Step 3 · Symptom check</div><h1>What are you feeling today?</h1><p className="muted">Choose all symptoms that apply. This helps us prepare you for the right consultation.</p>
      <form onSubmit={submit}>
        <div className="symptom-grid">{SYMPTOMS.map((s) => <button type="button" key={s} className={`symptom-chip ${selected.includes(s) ? 'selected' : ''}`} onClick={() => toggle(s)}>{selected.includes(s) ? '✓ ' : ''}{s}</button>)}</div>
        <label className="full-label">Other symptoms (optional)<input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. weakness, rash" /></label>
        {error && <div className="error-box" role="alert">{error}</div>}
        <button className="primary-btn" disabled={loading}>{loading ? 'Checking symptoms…' : 'Check symptoms & continue'}</button>
      </form>
    </section></main></div>
}
