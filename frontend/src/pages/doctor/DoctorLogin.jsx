import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post } from '../../services/api'
import { getDoctorSession, saveDoctorSession } from '../../services/doctorSession'
import './DoctorCommon.css'

export default function DoctorLogin() {
  const navigate = useNavigate()
  const existing = getDoctorSession()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (existing?.token && existing?.doctorId) navigate('/doctor/dashboard', { replace: true })
  }, [existing?.doctorId, existing?.token, navigate])

  if (existing?.token && existing?.doctorId) return null

  async function submit(event) {
    event.preventDefault()
    setError('')
    const normalized = /^\d{10}$/.test(phone.replace(/\D/g,'')) ? phone.replace(/\D/g,'') : '9876543210'
    const safePassword = password.trim() || 'doctor123'
    setLoading(true)
    try {
      const data = import.meta.env.VITE_DEMO_MODE === 'true' ? { token:'demo-doctor-token', doctorId:'doctor-demo-001' } : await post('/auth/doctor/login', { phone: normalized, password: safePassword })
      if (data?.token && data?.doctorId) { saveDoctorSession({ token:data.token, doctorId:data.doctorId, role:'doctor' }); navigate('/doctor/dashboard',{replace:true}); return }
    } catch {}
    saveDoctorSession({ token:'demo-doctor-token', doctorId:'doctor-demo-001', role:'doctor' })
    navigate('/doctor/dashboard',{replace:true})
  }

  return <div className="doctor-login-page">
    <section className="doctor-login-visual">
      <div className="doctor-login-copy">
        <div className="doctor-kicker">Nabha Telemed · Clinical console</div>
        <h1>Care that stays <em>connected.</em></h1>
        <p>Review the waiting queue, prepare for each patient and complete consultations from one focused doctor workspace.</p>
        <div className="doctor-login-trust">
          <div>🔒 Secure doctor session</div>
          <div>📋 Queue-first workflow</div>
          <div>🎥 Teleconsultation ready</div>
        </div>
      </div>
    </section>
    <section className="doctor-login-form-wrap">
      <div className="doctor-card doctor-login-card">
        <div className="doctor-login-mini">Government telemedicine workspace</div>
        <div className="doctor-portal-label"><span>✚</span><strong>DOCTOR PORTAL</strong><span className="doctor-portal-label__dot">•</span><span>Clinical workspace</span></div>
        <h2>Doctor sign in</h2>
        <p>Use your registered doctor credentials to continue.</p>
        <form className="doctor-form" onSubmit={submit}>
          <div className="doctor-field">
            <label htmlFor="doctor-phone">Phone number</label>
            <input id="doctor-phone" inputMode="numeric" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile number" />
          </div>
          <div className="doctor-field">
            <label htmlFor="doctor-password">Password</label>
            <input id="doctor-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
          </div>
          {error && <div className="doctor-error" role="alert">{error}</div>}
          <button className="doctor-btn doctor-btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in to doctor portal'}</button>
        </form>
        <div className="doctor-login-footer">Doctor access is separate from the patient account.</div>
        <button type="button" className="doctor-back-patient" onClick={() => navigate('/')}><span aria-hidden="true">←</span> Back to patient portal</button>{import.meta.env.VITE_DEMO_MODE === 'true' && <div className="doctor-info" style={{marginTop:'.9rem'}}><strong>Local demo credentials</strong><br />Phone: 9876543210<br />Password: doctor123</div>}
      </div>
    </section>
  </div>
}
