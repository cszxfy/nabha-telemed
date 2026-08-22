import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearDoctorFlow, getDoctorFlow } from '../../services/doctorSession'
import DoctorLayout from './DoctorLayout'
import './DoctorCommon.css'

export default function ConsultationCompleted() {
  const navigate = useNavigate()
  const location = useLocation()
  const flow = useMemo(() => ({ ...getDoctorFlow(), ...(location.state || {}) }), [location.state])
  const prescriptionSaved = Boolean(flow.prescriptionId)

  function nextPatient() { clearDoctorFlow(); navigate('/doctor/queue') }
  function dashboard() { clearDoctorFlow(); navigate('/doctor/dashboard') }

  return <DoctorLayout><main className="doctor-main">
    <section className="doctor-card doctor-success">
      <div className="doctor-success__icon">✓</div>
      <div className="doctor-kicker">Screen 23 · Completed</div>
      <h2>Consultation completed</h2>
      <p>{flow.patient?.name || flow.patientName || 'Patient'}’s consultation has been closed on the doctor side. Review the summary below, then continue with the next patient.</p>
      <div className="doctor-grid doctor-grid-2" style={{textAlign:'left',maxWidth:720,margin:'1.5rem auto 0'}}>
        <div className="doctor-card pad"><span style={{fontSize:'.72rem',textTransform:'uppercase',letterSpacing:'.06em',color:'var(--color-ink-light)',fontWeight:750}}>Patient</span><strong style={{display:'block',fontSize:'1.05rem',color:'var(--color-navy)',marginTop:'.25rem'}}>{flow.patient?.name || flow.patientName || 'Patient'}</strong><span style={{fontSize:'.78rem',color:'var(--color-ink-light)'}}>ID · {flow.patient?.patientId || flow.patientId || '—'}</span></div>
        <div className="doctor-card pad"><span style={{fontSize:'.72rem',textTransform:'uppercase',letterSpacing:'.06em',color:'var(--color-ink-light)',fontWeight:750}}>Prescription</span><strong style={{display:'block',fontSize:'1.05rem',color:prescriptionSaved ? '#23724c' : '#8a6400',marginTop:'.25rem'}}>{prescriptionSaved ? 'Generated' : 'Not saved to backend'}</strong><span style={{fontSize:'.78rem',color:'var(--color-ink-light)'}}>{prescriptionSaved ? `ID · ${flow.prescriptionId}` : 'Current contract limitation'}</span></div>
      </div>
      {!prescriptionSaved && <div className="doctor-warning" style={{maxWidth:720,margin:'1rem auto 0',textAlign:'left'}}>The consultation flow reached completion, but the prescription was not persisted because the frozen API currently requires a <code>consultationId</code> that this frontend cannot create without a consultation endpoint.</div>}
      {flow.notes?.diagnosis && <div className="doctor-card pad" style={{maxWidth:720,margin:'1rem auto 0',textAlign:'left'}}><div className="doctor-kicker">Summary</div><p style={{color:'var(--color-ink-mid)',marginTop:'.3rem'}}><strong>Diagnosis:</strong> {flow.notes.diagnosis}</p>{flow.notes.treatmentPlan && <p style={{color:'var(--color-ink-mid)',marginTop:'.4rem'}}><strong>Treatment plan:</strong> {flow.notes.treatmentPlan}</p>}</div>}
      <div className="doctor-success-actions"><button className="doctor-btn doctor-btn-primary" onClick={nextPatient}>Next patient</button><button className="doctor-btn doctor-btn-secondary" onClick={dashboard}>Doctor dashboard</button></div>
    </section>
  </main></DoctorLayout>
}
