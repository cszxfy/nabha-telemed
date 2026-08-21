import { Routes, Route, Navigate } from 'react-router-dom'
import PatientWelcome from './pages/patient/PatientWelcome'
import PatientPhoneLogin from './pages/patient/PatientPhoneLogin'
import PatientOtp from './pages/patient/PatientOtp'
import PatientRegister from './pages/patient/PatientRegister'
import PatientDashboard from './pages/patient/PatientDashboard'
import SymptomCheck from './pages/patient/SymptomCheck'
import QueueStatus from './pages/patient/QueueStatus'
import ConsultationReady from './pages/patient/ConsultationReady'
import Consultation from './pages/patient/Consultation'
import Completed from './pages/patient/Completed'

const Stub = ({ name }) => <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}><h2>{name} — Coming soon</h2></div>

export default function App() {
  return <Routes>
    <Route path="/" element={<PatientWelcome />} />
    <Route path="/patient/login" element={<PatientPhoneLogin />} />
    <Route path="/patient/otp" element={<PatientOtp />} />
    <Route path="/patient/register" element={<PatientRegister />} />
    <Route path="/patient/dashboard" element={<PatientDashboard />} />
    <Route path="/patient/symptoms" element={<SymptomCheck />} />
    <Route path="/patient/queue" element={<QueueStatus />} />
    <Route path="/patient/ready" element={<ConsultationReady />} />
    <Route path="/patient/consultation" element={<Consultation />} />
    <Route path="/patient/completed" element={<Completed />} />
    <Route path="/doctor/*" element={<Stub name="Doctor Portal" />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
