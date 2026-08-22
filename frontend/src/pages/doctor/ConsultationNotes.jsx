import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getDoctorFlow, saveDoctorFlow } from '../../services/doctorSession'
import DoctorLayout from './DoctorLayout'
import './DoctorCommon.css'

export default function ConsultationNotes() {
  const navigate = useNavigate()
  const location = useLocation()
  const flow = useMemo(() => ({ ...getDoctorFlow(), ...(location.state || {}) }), [location.state])
  const [form, setForm] = useState({
    observations: flow.notes?.observations || '',
    diagnosis: flow.notes?.diagnosis || '',
    treatmentPlan: flow.notes?.treatmentPlan || '',
    notes: flow.notes?.notes || '',
  })
  const [error, setError] = useState('')

  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })) }
  function continueNext(e) {
    e.preventDefault()
    const safeForm = { observations: form.observations.trim() || 'Routine teleconsultation observations recorded.', diagnosis: form.diagnosis.trim() || 'No acute diagnosis recorded in local demo.', treatmentPlan: form.treatmentPlan.trim() || 'Continue supportive care and follow-up as advised.', notes: form.notes.trim() }
    const next = { ...flow, notes: form }
    saveDoctorFlow(next)
    navigate('/doctor/prescription', { state: next })
  }

  return <DoctorLayout><main className="doctor-main">
    <div className="doctor-page-head"><div><div className="doctor-kicker">Screen 21 · Clinical notes</div><h1>Consultation notes</h1><p>Capture the clinical assessment for this consultation. These notes stay in the current frontend flow because the frozen contract does not expose a notes-persistence endpoint.</p></div></div>
    <div className="doctor-stepper" style={{marginBottom:'1rem'}}><div className="doctor-step active"><span>1</span>Review</div><div className="doctor-step-sep"/><div className="doctor-step active"><span>2</span>Notes</div><div className="doctor-step-sep"/><div className="doctor-step"><span>3</span>Prescription</div><div className="doctor-step-sep"/><div className="doctor-step"><span>4</span>Complete</div></div>
    <section className="doctor-grid doctor-grid-2">
      <div className="doctor-card pad"><div className="doctor-kicker">Patient</div><h2 style={{margin:'.25rem 0 .35rem'}}>{flow.patient?.name || flow.patientName || 'Patient'}</h2><p style={{color:'var(--color-ink-light)',fontSize:'.8rem'}}>Patient ID · {flow.patient?.patientId || flow.patientId || '—'} · Age {flow.patient?.age ?? '—'}</p>{flow.urgencyLevel && <span className={`doctor-status-pill doctor-status-${flow.urgencyLevel}`} style={{marginTop:'.8rem'}}>{flow.urgencyLevel} priority</span>}<div className="doctor-info" style={{marginTop:'1rem'}}>Clinical note persistence is intentionally frontend-only until a consultation endpoint is added to the frozen contract.</div></div>
      <div className="doctor-card pad"><form className="doctor-form" onSubmit={continueNext}><div className="doctor-form-grid"><div className="doctor-field full"><label htmlFor="observations">Observations</label><textarea id="observations" value={form.observations} onChange={e=>update('observations',e.target.value)} placeholder="Record relevant examination observations…" /></div><div className="doctor-field full"><label htmlFor="diagnosis">Diagnosis</label><textarea id="diagnosis" value={form.diagnosis} onChange={e=>update('diagnosis',e.target.value)} placeholder="Record the working diagnosis…" /></div><div className="doctor-field full"><label htmlFor="treatment">Treatment plan</label><textarea id="treatment" value={form.treatmentPlan} onChange={e=>update('treatmentPlan',e.target.value)} placeholder="Record the treatment plan and follow-up instructions…" /></div><div className="doctor-field full"><label htmlFor="notes">Additional notes <span style={{fontWeight:500,color:'var(--color-ink-light)'}}>(optional)</span></label><textarea id="notes" value={form.notes} onChange={e=>update('notes',e.target.value)} placeholder="Add any additional consultation notes…" /></div></div>{error && <div className="doctor-error">{error}</div>}<div className="doctor-actions" style={{justifyContent:'flex-end'}}><button className="doctor-btn doctor-btn-secondary" type="button" onClick={()=>navigate('/doctor/queue')}>Leave workflow</button><button className="doctor-btn doctor-btn-primary" type="submit">Continue to prescription</button></div></form></div>
    </section>
  </main></DoctorLayout>
}
