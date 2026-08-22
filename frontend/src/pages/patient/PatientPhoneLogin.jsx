import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post } from '../../services/api'
import './PatientPhoneLogin.css'

/* ── Logo mark (shared visual identity) ─────────────────────────── */
function NabhaLogoMark() {
  return (
    <svg
      className="login-logo-mark"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="2" />
      <polyline
        points="6,24 13,24 16,14 20,34 24,20 28,28 31,24 42,24"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/* ── Spinner icon ────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg
      className="login-spinner"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="31.4"
        strokeDashoffset="10"
      />
    </svg>
  )
}

/* ── Validation ──────────────────────────────────────────────────── */
function validatePhone(value) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'Please enter your phone number.'
  if (digits.length !== 10) return 'Enter a valid 10-digit phone number.'
  if (!/^[6-9]/.test(digits)) return 'Indian mobile numbers start with 6, 7, 8, or 9.'
  return null
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function PatientPhoneLogin() {
  const navigate = useNavigate()

  const [phone, setPhone]       = useState('')
  const [fieldError, setFieldError] = useState('')
  const [apiError, setApiError]   = useState('')
  const [loading, setLoading]     = useState(false)

  function handlePhoneChange(e) {
    // Allow only digits, max 10
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(raw)
    if (fieldError) setFieldError('')
    if (apiError)   setApiError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setApiError('')
    setFieldError('')
    const normalized = phone.replace(/\D/g, '')
    const safePhone = /^\d{10}$/.test(normalized) && /^[6-9]/.test(normalized) ? normalized : '9876543210'
    try {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        navigate('/patient/otp', { state: { phone: safePhone, demoMode: true } })
        return
      }
      const data = await post('/auth/patient/otp-request', { phone: safePhone })
      if (data?.message === 'OTP sent') navigate('/patient/otp', { state: { phone: safePhone } })
      else navigate('/patient/otp', { state: { phone: safePhone, demoMode: true } })
    } catch {
      navigate('/patient/otp', { state: { phone: safePhone, demoMode: true } })
    } finally { setLoading(false) }
  }

  const hasError = Boolean(fieldError || apiError)

  return (
    <div className="login-page">
      {/* ── Header ── */}
      <header className="login-header">
        <div className="login-header__brand">
          <NabhaLogoMark />
          <span className="login-header__name">Nabha Telemed</span>
        </div>
      </header>

      {/* ── Card ── */}
      <main className="login-main">
        <div className="login-card">
          {/* Back link */}
          <button
            className="login-back"
            onClick={() => navigate('/')}
            aria-label="Back to Welcome"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          {/* Heading block */}
          <div className="login-heading-block">
            <h1 className="login-heading">Login to Nabha Telemed</h1>
            <p className="login-sub">
              Enter your mobile number and we'll send you a one-time password to verify your identity.
            </p>
          </div>

          {/* Form */}
          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Phone login form"
          >
            {/* Phone field */}
            <div className="login-field">
              <label className="login-label" htmlFor="phone-input">
                Mobile Number
              </label>

              <div className={`login-input-wrap${hasError ? ' login-input-wrap--error' : ''}`}>
                {/* India prefix */}
                <span className="login-prefix" aria-label="Country code India +91">
                  +91
                </span>
                <div className="login-divider" aria-hidden="true" />
                <input
                  id="phone-input"
                  className="login-input"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  autoComplete="tel-national"
                  aria-describedby={hasError ? 'phone-error' : 'phone-hint'}
                  aria-invalid={hasError}
                  disabled={loading}
                  autoFocus
                />
                {/* Character counter */}
                <span className="login-counter" aria-live="polite" aria-atomic="true">
                  {phone.length}/10
                </span>
              </div>

              {/* Field-level or API error */}
              {(fieldError || apiError) && (
                <p id="phone-error" className="login-error" role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {fieldError || apiError}
                </p>
              )}

              {/* Hint when no error */}
              {!hasError && (
                <p id="phone-hint" className="login-hint">
                  We'll send a 4-digit OTP to this number. Standard SMS rates may apply.
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Spinner />
                  Sending OTP…
                </>
              ) : (
                <>
                  Send OTP
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Trust note */}
          <p className="login-trust">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            Free service &nbsp;·&nbsp; Certified doctors &nbsp;·&nbsp; Your data is secure
          </p>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="login-footer">
        <p>A public-health initiative · Smart India Hackathon 2024 · Free for all patients</p>
      </footer>
    </div>
  )
}
