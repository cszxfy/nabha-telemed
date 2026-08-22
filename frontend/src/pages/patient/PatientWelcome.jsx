import { useNavigate } from 'react-router-dom'
import { useTranslation, LANGUAGES } from '../../hooks/useTranslation'
import './PatientWelcome.css'

/* ── Inline SVG: stethoscope-style mark ─────────────────────────── */
function NabhaLogoMark() {
  return (
    <svg
      className="welcome-logo-mark"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Circle base */}
      <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="2" />
      {/* Heartbeat line */}
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

/* ── Language selector ───────────────────────────────────────────── */
function LanguageSelector({ lang, setLang }) {
  return (
    <div className="lang-selector" role="group" aria-label="Select language">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          className={`lang-btn${lang === code ? ' lang-btn--active' : ''}`}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/* ── Trust badge ─────────────────────────────────────────────────── */
function TrustBadge({ icon, text }) {
  return (
    <div className="trust-badge">
      <span className="trust-badge__icon" aria-hidden="true">{icon}</span>
      <span className="trust-badge__text">{text}</span>
    </div>
  )
}

/* ── Main illustration: abstract healthcare visual ───────────────── */
function HealthIllustration() {
  return (
    <div className="health-illustration" aria-hidden="true">
      <svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" className="health-svg">
        {/* Village backdrop */}
        <rect x="0" y="160" width="320" height="80" fill="var(--color-sky)" rx="4" />

        {/* Far hills */}
        <ellipse cx="60" cy="165" rx="80" ry="30" fill="#c8e6e4" />
        <ellipse cx="260" cy="168" rx="90" ry="28" fill="#c8e6e4" />

        {/* House silhouette left */}
        <rect x="20" y="135" width="40" height="30" fill="#a8d0cc" rx="2" />
        <polygon points="20,135 60,135 40,110" fill="#7fb8b3" />
        <rect x="34" y="148" width="12" height="17" fill="#5a9e99" rx="1" />

        {/* House right */}
        <rect x="250" y="138" width="48" height="27" fill="#a8d0cc" rx="2" />
        <polygon points="250,138 298,138 274,115" fill="#7fb8b3" />
        <rect x="265" y="151" width="18" height="14" fill="#5a9e99" rx="1" />

        {/* Doctor + patient silhouettes (center) */}
        {/* Doctor */}
        <circle cx="142" cy="82" r="14" fill="var(--color-navy)" />
        <rect x="130" y="97" width="24" height="36" fill="var(--color-navy)" rx="3" />
        {/* Stethoscope */}
        <path d="M 142 107 Q 158 112 158 124 Q 158 132 150 132" stroke="var(--color-teal)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <circle cx="150" cy="133" r="4" fill="var(--color-teal)" />

        {/* Patient */}
        <circle cx="190" cy="86" r="12" fill="#e8a87c" />
        <rect x="179" y="100" width="22" height="30" fill="#e8c5a0" rx="3" />

        {/* Signal / connectivity arc */}
        <path d="M 164 68 Q 166 58 170 68" stroke="var(--color-teal)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M 160 64 Q 165 50 170 64" stroke="var(--color-teal)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4"/>
        <path d="M 156 60 Q 163 42 170 60" stroke="var(--color-teal)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25"/>

        {/* Cross / health emblem */}
        <rect x="154" y="26" width="6" height="18" fill="var(--color-amber)" rx="1" />
        <rect x="148" y="32" width="18" height="6" fill="var(--color-amber)" rx="1" />
      </svg>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function PatientWelcome() {
  const navigate = useNavigate()
  const { t, lang, setLang } = useTranslation('en')

  function handleGetStarted() {
    navigate('/patient/login')
  }

  return (
    <div className="welcome-page">
      {/* ── Top bar ── */}
      <header className="welcome-header">
        <div className="welcome-header__brand">
          <NabhaLogoMark />
          <span className="welcome-header__name">Nabha Telemed</span>
        </div>
        <div className="welcome-header__actions">
          <button
            className="doctor-portal-entry"
            onClick={() => navigate('/doctor/login')}
            aria-label="Open the Nabha Telemed doctor portal"
          >
            <span className="doctor-portal-entry__icon" aria-hidden="true">✚</span>
            <span>Doctor Portal</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <LanguageSelector lang={lang} setLang={setLang} />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="welcome-main">
        <div className="welcome-content">
          {/* Eyebrow */}
          <p className="welcome-eyebrow">Government of Punjab · Smart India Hackathon</p>

          {/* Headline */}
          <h1 className="welcome-headline">
            Doctor care,<br />
            <em>wherever you are.</em>
          </h1>

          {/* Sub-copy */}
          <p className="welcome-sub">
            Nabha Telemedicine connects rural patients to qualified doctors
            by video call — in your language, without travel.
          </p>

          {/* CTA */}
          <button
            className="welcome-cta"
            onClick={handleGetStarted}
            aria-label="Get started with Nabha Telemedicine"
          >
            Get Started
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Trust row */}
          <div className="trust-row" role="list" aria-label="Why Nabha Telemed">
            <TrustBadge icon="🔒" text="Secure & private" />
            <TrustBadge icon="🌐" text="3 languages" />
            <TrustBadge icon="🏥" text="Certified doctors" />
            <TrustBadge icon="📱" text="No app needed" />
          </div>
        </div>

        {/* Illustration */}
        <div className="welcome-visual">
          <HealthIllustration />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="welcome-footer">
        <p>
          A public-health initiative under the Smart India Hackathon 2024 · Free for all patients
        </p>
      </footer>
    </div>
  )
}
