import { Navigate, Route, Routes } from 'react-router-dom'
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
import DoctorLogin from './pages/doctor/DoctorLogin'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorQueue from './pages/doctor/DoctorQueue'
import PatientPreConsultation from './pages/doctor/PatientPreConsultation'
import DoctorCall from './pages/doctor/DoctorCall'
import ConsultationNotes from './pages/doctor/ConsultationNotes'
import PrescriptionCreation from './pages/doctor/PrescriptionCreation'
import ConsultationCompleted from './pages/doctor/ConsultationCompleted'
import DoctorHistory from './pages/doctor/DoctorHistory'
import { getDoctorSession } from './services/doctorSession'

function DoctorGuard({ children }) {
  const session = getDoctorSession()
  if (!session?.token || !session?.doctorId || session?.role !== 'doctor') {
    return <Navigate to="/doctor/login" replace />
  }
  return children
}

function ProtectedDoctor({ children }) {
  return <DoctorGuard>{children}</DoctorGuard>
}

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

    <Route path="/doctor" element={<Navigate to="/doctor/login" replace />} />
    <Route path="/doctor/login" element={<DoctorLogin />} />
    <Route path="/doctor/dashboard" element={<ProtectedDoctor><DoctorDashboard /></ProtectedDoctor>} />
    <Route path="/doctor/queue" element={<ProtectedDoctor><DoctorQueue /></ProtectedDoctor>} />
    <Route path="/doctor/patient/:patientId" element={<ProtectedDoctor><PatientPreConsultation /></ProtectedDoctor>} />
    <Route path="/doctor/call" element={<ProtectedDoctor><DoctorCall /></ProtectedDoctor>} />
    <Route path="/doctor/consultation-notes" element={<ProtectedDoctor><ConsultationNotes /></ProtectedDoctor>} />
    <Route path="/doctor/prescription" element={<ProtectedDoctor><PrescriptionCreation /></ProtectedDoctor>} />
    <Route path="/doctor/completed" element={<ProtectedDoctor><ConsultationCompleted /></ProtectedDoctor>} />
    <Route path="/doctor/history" element={<ProtectedDoctor><DoctorHistory /></ProtectedDoctor>} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
