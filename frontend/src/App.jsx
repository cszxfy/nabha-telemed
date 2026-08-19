import { Routes, Route, Navigate } from 'react-router-dom'
import PatientWelcome from './pages/patient/PatientWelcome'
import PatientPhoneLogin from './pages/patient/PatientPhoneLogin'
import PatientOtp from './pages/patient/PatientOtp'

// Placeholder stubs for routes not yet built
const Stub = ({ name }) => (
  <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
    <h2>{name} — Coming soon</h2>
  </div>
)

export default function App() {
  return (
    <Routes>
      {/* Patient flow */}
      <Route path="/" element={<PatientWelcome />} />
      <Route path="/patient/login" element={<PatientPhoneLogin />} />
      <Route path="/patient/otp" element={<PatientOtp />} />
      <Route path="/patient/register" element={<Stub name="Patient Registration" />} />
      <Route path="/patient/dashboard" element={<Stub name="Patient Dashboard" />} />

      {/* Doctor flow — untouched placeholder */}
      <Route path="/doctor/*" element={<Stub name="Doctor Portal" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
