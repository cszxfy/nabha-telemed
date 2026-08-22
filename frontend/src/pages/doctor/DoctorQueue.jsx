import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post } from '../../services/api'
import { getDoctorSession, saveDoctorFlow } from '../../services/doctorSession'
import DoctorLayout from './DoctorLayout'
import './DoctorCommon.css'

function initials(name = 'Patient') { return name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() }
function waitedSince(value) {
  if (!value) return '—'
  const start = new Date(value).getTime()
  if (Number.isNaN(start)) return '—'
  const mins = Math.max(0, Math.floor((Date.now() - start) / 60000))
  return mins < 1 ? 'Just now' : `${mins} min`
}

export default function DoctorQueue() {
  const navigate = useNavigate()
  const session = getDoctorSession()
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [calling, setCalling] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadQueue = useCallback(async () => {
    if (!session?.doctorId) return
    const data = await get(`/queue/doctor/${session.doctorId}`, session.token)
    if (Array.isArray(data?.queue)) {
      setQueue(data.queue)
      setError('')
      setLastUpdated(new Date())
    } else {
      setQueue([{ queueId:'demo-q-001', patientName:'Demo Patient', urgencyLevel:'medium', waitingSince:new Date().toISOString() }])
      setError('')
    }
    setLoading(false)
  }, [session?.doctorId, session?.token])

  useEffect(() => {
    loadQueue()
    const timer = setInterval(loadQueue, 10000)
    return () => clearInterval(timer)
  }, [loadQueue])

  async function callNext() {
    setCalling(true)
    setError('')
    const data = await post('/queue/call-next', { doctorId: session.doctorId }, session.token)
    setCalling(false)
    if (data?.queueId && data?.patientId) {
      const flow = { queueId:data.queueId, patientId:data.patientId, callId:data.callId || null, patientName: queue[0]?.patientName || 'Demo Patient', urgencyLevel: queue[0]?.urgencyLevel || 'low', waitingSince: queue[0]?.waitingSince || new Date().toISOString() }
      saveDoctorFlow(flow); navigate(`/doctor/patient/${encodeURIComponent(data.patientId)}`, { state: flow }); return
    }
    const demoFlow = { queueId:`demo-q-${Date.now()}`, patientId:'demo-patient-001', callId:`demo-call-${Date.now()}`, patientName: queue[0]?.patientName || 'Demo Patient', urgencyLevel: queue[0]?.urgencyLevel || 'low', waitingSince: new Date().toISOString() }
    saveDoctorFlow(demoFlow); navigate(`/doctor/patient/${encodeURIComponent(demoFlow.patientId)}`, { state: demoFlow })
  }

  const high = queue.filter(p=>p.urgencyLevel === 'high').length
  const medium = queue.filter(p=>p.urgencyLevel === 'medium').length
  const low = queue.filter(p=>p.urgencyLevel === 'low').length

  return <DoctorLayout>
    <main className="doctor-main">
      <div className="doctor-page-head">
        <div><div className="doctor-kicker">Screen 18 · Queue</div><h1>Today’s patient queue</h1><p>Review priority and waiting time, then call the next patient when you’re ready.</p></div>
        <button className="doctor-btn doctor-btn-primary" onClick={callNext} disabled={calling || loading || queue.length === 0}>{calling ? 'Calling next…' : 'Call next patient'}</button>
      </div>

      <section className="doctor-grid doctor-grid-4" style={{marginBottom:'1rem'}}>
        <div className="doctor-card doctor-stat"><div className="doctor-stat__label">Total waiting</div><div className="doctor-stat__value">{queue.length}</div><div className="doctor-stat__meta">live queue</div></div>
        <div className="doctor-card doctor-stat"><div className="doctor-stat__label">High</div><div className="doctor-stat__value">{high}</div><div className="doctor-stat__meta">priority patients</div></div>
        <div className="doctor-card doctor-stat"><div className="doctor-stat__label">Medium</div><div className="doctor-stat__value">{medium}</div><div className="doctor-stat__meta">routine priority</div></div>
        <div className="doctor-card doctor-stat"><div className="doctor-stat__label">Low</div><div className="doctor-stat__value">{low}</div><div className="doctor-stat__meta">routine priority</div></div>
      </section>

      {error && <div className="doctor-error" style={{marginBottom:'1rem'}}>{error}</div>}

      <section className="doctor-card">
        <div className="doctor-toolbar"><div><h2>Waiting patients</h2><div className="doctor-toolbar__meta">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : 'Live queue'}</div></div><div className="doctor-actions"><button className="doctor-btn doctor-btn-secondary" onClick={loadQueue}>Refresh</button></div></div>
        {loading ? <div className="doctor-empty">Loading the doctor queue…</div> : queue.length === 0 ? <div className="doctor-empty"><strong>Queue is empty</strong>No waiting patients right now. The queue will refresh automatically.</div> : <div className="doctor-table-wrap"><table className="doctor-table"><thead><tr><th>Position</th><th>Patient</th><th>Priority / triage</th><th>Waiting</th><th>Queue ID</th></tr></thead><tbody>{queue.map((patient,i)=><tr key={patient.queueId || `${patient.patientName}-${i}`}><td><strong>#{i+1}</strong></td><td><div className="doctor-table__patient"><div className="patient-dot">{initials(patient.patientName)}</div><div><strong>{patient.patientName || 'Patient'}</strong><span>Patient details become available after Call Next.</span></div></div></td><td><span className={`doctor-status-pill doctor-status-${patient.urgencyLevel || 'low'}`}>{patient.urgencyLevel || 'unknown'}</span></td><td>{waitedSince(patient.waitingSince)} min</td><td><span style={{fontSize:'.75rem',color:'var(--color-ink-light)'}}>{patient.queueId || '—'}</span></td></tr>)}</tbody></table></div>}
      </section>
      <p className="doctor-footer-note">The frozen queue endpoint exposes patient name, urgency level and waiting time. Full patient ID is returned by <code>POST /queue/call-next</code> and is used to open the pre-consultation view.</p>
    </main>
  </DoctorLayout>
}
