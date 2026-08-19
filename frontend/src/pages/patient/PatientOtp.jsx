import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './PatientOtp.css'

const OTP_LENGTH = 4          // matches api-contract.md: otp-verify example "1234"
const RESEND_SECONDS = 30

/* ── Logo mark (shared visual identity — same as Welcome / Login) ── */
function NabhaLogoMark() {
  return (
    <svg
      className="otp-logo-mark"
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

/* ── Spinner icon (same as Login) ──────────────────────────────────── */
function Spinner() {
  return (
    <svg
      className="otp-spinner"
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

/* ── Helpers ─────────────────────────────────────────────────────── */
function maskPhoneDisplay(phone) {
  if (!phone || phone.length !== 10) return phone || ''
  // "+91 98XXX X4210" style partial mask — shows enough to recognise, hides most digits
  return `${phone.slice(0, 2)}XXX X${phone.slice(-4)}`
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function PatientOtp() {
  const navigate = useNavigate()
  const location = useLocation()

  // Phone number is passed from PatientPhoneLogin via router state — no query
  // string, no localStorage. If it's missing (e.g. direct URL visit / refresh),
  // send the user back to re-enter their number rather than guessing it.
  const phone = location.state?.phone || ''

  useEffect(() => {
    if (!phone) {
      navigate('/patient/login', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone])

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [fieldError, setFieldError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(RESEND_SECONDS)
  const [resendNotice, setResendNotice] = useState('')

  const inputRefs = useRef([])

  // Focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const clearErrors = useCallback(() => {
    if (fieldError) setFieldError('')
    if (resendNotice) setResendNotice('')
  }, [fieldError, resendNotice])

  function handleChange(index, value) {
    const clean = value.replace(/\D/g, '')

    if (!clean) {
      // Backspace-cleared or invalid char — just clear this box
      setDigits((prev) => {
        const next = [...prev]
        next[index] = ''
        return next
      })
      clearErrors()
      return
    }

    // Take only the last typed character (handles overtype in a filled box)
    const char = clean.slice(-1)

    setDigits((prev) => {
      const next = [...prev]
      next[index] = char
      return next
    })
    clearErrors()

    // Move focus to next box, if any
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // Let handleChange clear the current box; do nothing extra here
        return
      }
      // Current box already empty — move back and clear previous
      if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        setDigits((prev) => {
          const next = [...prev]
          next[index - 1] = ''
          return next
        })
      }
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      e.preventDefault()
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
      e.preventDefault()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return

    const next = Array(OTP_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    clearErrors()

    // Focus the box after the last pasted digit, or the last box
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const code = digits.join('')
  const isComplete = code.length === OTP_LENGTH

  async function handleSubmit(e) {
    e.preventDefault()

    if (!isComplete) {
      setFieldError(`Please enter the full ${OTP_LENGTH}-digit code.`)
      return
    }

    setLoading(true)
    setFieldError('')

    // NOTE: real verification against POST /auth/patient/otp-verify is not
    // wired up in this MVP screen (per task scope) — this is a local/mock
    // check so the flow can be demoed end-to-end. Replace with the real
    // api.js call when auth is implemented.
    setTimeout(() => {
      setLoading(false)
      navigate('/patient/register', { state: { phone } })
    }, 600)
  }

  function handleResend() {
    if (resendCooldown > 0) return

    // Mock/local resend — no API call per task scope.
    setDigits(Array(OTP_LENGTH).fill(''))
    setFieldError('')
    setResendNotice('A new OTP has been sent.')
    setResendCooldown(RESEND_SECONDS)
    inputRefs.current[0]?.focus()
  }

  function handleChangeNumber() {
    navigate('/patient/login')
  }

  if (!phone) {
    // Redirect effect above will fire; render nothing meanwhile.
    return null
  }

  return (
    <div className="otp-page">
      {/* ── Header ── */}
      <header className="otp-header">
        <div className="otp-header__brand">
          <NabhaLogoMark />
          <span className="otp-header__name">Nabha Telemed</span>
        </div>
      </header>

      {/* ── Card ── */}
      <main className="otp-main">
        <div className="otp-card">
          {/* Back link */}
          <button
            className="otp-back"
            onClick={handleChangeNumber}
            aria-label="Back to phone login"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          {/* Heading block */}
          <div className="otp-heading-block">
            <h1 className="otp-heading">Verify your mobile number</h1>
            <p className="otp-sub">
              OTP sent to <strong>+91 {maskPhoneDisplay(phone)}</strong> via SMS. Enter the {OTP_LENGTH}-digit
              code below to continue.
            </p>
          </div>

          {/* Form */}
          <form
            className="otp-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="OTP verification form"
          >
            {/* OTP boxes */}
            <div
              className={`otp-boxes${fieldError ? ' otp-boxes--error' : ''}`}
              role="group"
              aria-label={`${OTP_LENGTH}-digit OTP input`}
            >
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  className={`otp-box${digit ? ' otp-box--filled' : ''}`}
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  aria-label={`OTP digit ${i + 1} of ${OTP_LENGTH}`}
                  aria-describedby={fieldError ? 'otp-error' : 'otp-hint'}
                  aria-invalid={Boolean(fieldError)}
                />
              ))}
            </div>

            {/* Field error */}
            {fieldError && (
              <p id="otp-error" className="otp-error" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {fieldError}
              </p>
            )}

            {/* Resend row */}
            <div className="otp-resend-row">
              {resendCooldown > 0 ? (
                <p className="otp-resend-hint">
                  Didn't get the code? Resend in{' '}
                  <span className="otp-resend-timer" aria-live="polite" aria-atomic="true">
                    {resendCooldown}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={handleResend}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>

            {resendNotice && (
              <p className="otp-resend-notice" role="status" aria-live="polite">
                {resendNotice}
              </p>
            )}

            {/* Hint when no error */}
            {!fieldError && (
              <p id="otp-hint" className="otp-hint">
                Never share your OTP with anyone, including Nabha Telemed staff.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="otp-submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Spinner />
                  Verifying…
                </>
              ) : (
                <>
                  Verify &amp; Continue
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>

            {/* Change number */}
            <button
              type="button"
              className="otp-change-number"
              onClick={handleChangeNumber}
              disabled={loading}
            >
              Change phone number
            </button>
          </form>

          {/* Trust note */}
          <p className="otp-trust">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            Free service &nbsp;·&nbsp; Certified doctors &nbsp;·&nbsp; Your data is secure
          </p>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="otp-footer">
        <p>A public-health initiative · Smart India Hackathon 2024 · Free for all patients</p>
      </footer>
    </div>
  )
}
