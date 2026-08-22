import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { post } from '../../services/api'
import { getSession, saveSession } from '../../services/session'
import './PatientFlow.css'

export default function PatientRegister() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()
  const phone = location.state?.phone || session?.phone || ''
  const [form, setForm] = useState({ name: '', age: '', gender: '', village: '', language: 'pa' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const safeForm = {
      name: form.name.trim() || 'Demo Patient',
      age: Number.isInteger(Number(form.age)) && Number(form.age) >= 1 && Number(form.age) <= 120 ? Number(form.age) : 30,
      gender: form.gender || 'O',
      village: form.village.trim() || 'Nabha',
      language: form.language || 'pa',
    }
    const age = safeForm.age
    if (!session?.token || !session?.patientId) {
      navigate('/patient/login', { replace: true })
      return
    }
    setLoading(true)
    try {
      const data = session.demoMode ? { __networkError: true } : await post('/patients/register', {
        userId: session.patientId,
        name: safeForm.name,
        age,
        gender: safeForm.gender,
        village: safeForm.village,
        language: safeForm.language,
      })
      if (data?.patientId) {
        saveSession({ ...session, patientId: data.patientId, name: safeForm.name, age, gender: safeForm.gender, village: safeForm.village, language: safeForm.language })
      } else if (data?.__networkError || session.demoMode) {
        saveSession({ ...session, name: safeForm.name, age, gender: safeForm.gender, village: safeForm.village, language: safeForm.language, demoMode: true })
      } else {
        throw new Error(data?.error || 'Registration failed')
      }
      navigate('/patient/dashboard', { replace: true })
    } catch {
      saveSession({ ...session, name: safeForm.name, age, gender: safeForm.gender, village: safeForm.village, language: safeForm.language, demoMode: true })
      navigate('/patient/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="patient-page">
      <header className="patient-topbar"><div className="patient-brand"><span className="brand-mark">+</span><span>Nabha Telemed</span></div></header>
      <main className="patient-shell">
        <section className="flow-card narrow-card">
          <div className="step-kicker">Almost done</div>
          <h1>Tell us about you</h1>
          <p className="muted">We need a few details before your first consultation.</p>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>Full name<input value={form.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" /></label>
            <label>Age<input type="number" min="1" max="120" value={form.age} onChange={(e) => update('age', e.target.value)} /></label>
            <label>Gender<select value={form.gender} onChange={(e) => update('gender', e.target.value)}><option value="">Select</option><option value="F">Female</option><option value="M">Male</option><option value="O">Other</option></select></label>
            <label>Village<input value={form.village} onChange={(e) => update('village', e.target.value)} autoComplete="address-level2" /></label>
            <label>Preferred language<select value={form.language} onChange={(e) => update('language', e.target.value)}><option value="pa">Punjabi</option><option value="hi">Hindi</option><option value="en">English</option></select></label>
            {error && <div className="error-box" role="alert">{error}</div>}
            <button className="primary-btn" disabled={loading}>{loading ? 'Saving…' : 'Continue to Nabha Telemed'}</button>
          </form>
          {phone && <p className="small-note">Verified number: +91 {phone}</p>}
        </section>
      </main>
    </div>
  )
}
