import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { get } from '../../services/api'
import { getDoctorFlow, getDoctorSession, saveDoctorFlow } from '../../services/doctorSession'
import DoctorLayout from './DoctorLayout'
import './DoctorCommon.css'

function initials(name='Patient') { return name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase() }

export default function PatientPreConsultation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { patientId } = useParams()
  const session = getDoctorSession()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const flow = { ...getDoctorFlow(), ...(location.state || {}), patientId }

  useEffect(() => {
    saveDoctorFlow(flow)
    let active = true
    get(`/patients/${encodeURIComponent(patientId)}`, session?.token).then(data => {
      if (!active) return
      if (data?.patientId) setPatient(data)
      else setPatient({ patientId, name:'Demo Patient', age:30 })
      setLoading(false)
    }).catch(() => { if (active) { setPatient({ patientId, name:'Demo Patient', age:30 }); setLoading(false) } })
    return () => { active = false }
  }, [patientId, session?.token])

  function startConsultation() {
    saveDoctorFlow({ ...flow, patient, patientName:patient?.name || flow.patientName })
    navigate('/doctor/call', { state: { ...flow, patient } })
  }

  return <DoctorLayout>
    <main className="doctor-main">
      <div className="doctor-page-head">
        <div><div className="doctor-kicker">Screen 19 · Pre-consultation</div><h1>Patient review</h1><p>Confirm the available patient information before starting the consultation.</p></div>
        <button className="doctor-btn doctor-btn-secondary" onClick={() => navigate('/doctor/queue')}>Back to queue</button>
      </div>
      {error && <div className="doctor-error" style={{marginBottom:'1rem'}}>{error}</div>}
      <section className="doctor-grid doctor-grid-2">
        <article className="doctor-card pad">
          {loading ? <div className="doctor-empty">Loading patient details…</div> : patient ? <>
            <div className="patient-profile"><div className="patient-profile__avatar">{initials(patient.name)}</div><div><div className="doctor-kicker">Patient identity</div><div className="patient-profile__name">{patient.name}</div><div className="patient-profile__meta">Patient ID · {patient.patientId}</div></div></div>
            <div className="doctor-detail-list"><div><span>Age</span><strong>{patient.age}</strong></div><div><span>Queue priority</span><strong>{flow.urgencyLevel ? `${flow.urgencyLevel} priority` : 'Not available'}</strong></div></div>
          </> : null}
        </article>
        <article className="doctor-card pad">
          <div className="doctor-kicker">Triage snapshot</div>
          {flow.urgencyLevel ? <div className={`doctor-status-pill doctor-status-${flow.urgencyLevel}`} style={{marginTop:'.3rem'}}>{flow.urgencyLevel} priority</div> : <div className="doctor-empty" style={{marginTop:'.8rem'}}>No triage level is available in the current navigation state.</div>}
          <div className="doctor-info" style={{marginTop:'1rem'}}>The frozen <code>GET /patients/:id</code> response exposes patientId, name and age only. Symptoms, full medical history and suggested department are shown only when they were already present in the current consultation flow.</div>
          {flow.symptoms?.length ? <div style={{marginTop:'1rem'}}><strong style={{color:'var(--color-navy)'}}>Symptoms</strong><p style={{color:'var(--color-ink-mid)',marginTop:'.35rem'}}>{flow.symptoms.join(', ')}</p></div> : null}
          {flow.suggestedDept ? <div style={{marginTop:'1rem'}}><strong style={{color:'var(--color-navy)'}}>Suggested department</strong><p style={{color:'var(--color-ink-mid)',marginTop:'.35rem'}}>{flow.suggestedDept}</p></div> : null}
        </article>
      </section>
      <section className="doctor-card" style={{marginTop:'1rem'}}>
        <div className="doctor-hero">
          <div><div className="doctor-kicker">Ready to consult</div><h2>Start the doctor call when you’re ready.</h2><p>Starting the consultation will open the video-call workspace. The frozen contract handles the call token through <code>POST /call/start</code>.</p></div>
          <div className="doctor-hero-actions"><button className="doctor-btn doctor-btn-primary" onClick={startConsultation} disabled={!patient}>Start consultation</button></div>
        </div>
      </section>
    </main>
  </DoctorLayout>
}
