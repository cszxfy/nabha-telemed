import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { get, post, isBackendUnavailable } from '../../services/api'
import { getSession } from '../../services/session'
import './PatientFlow.css'

function demoQueue() {
  return { queueId: `demo-q-${Date.now()}`, position: 1, estimatedWaitMins: 0, status: 'waiting', demo: true }
}

export default function QueueStatus() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()
  const [queue, setQueue] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.patientId) { navigate('/patient/login', { replace: true }); return }
    let cancelled = false
    async function join() {
      const symptomCheckId = location.state?.symptomCheck?.symptomCheckId
      // Explicit frontend demo mode skips the backend completely. This is important
      // for local UI testing and avoids hanging on an unavailable queue endpoint.
      if (location.state?.demo || location.state?.symptomCheck?.demo) {
        if (!cancelled) setQueue(demoQueue())
        return
      }
      if (!symptomCheckId) {
        if (!cancelled) setQueue(demoQueue())
        return
      }
      try {
        const data = await post('/queue/join', { patientId: session.patientId, symptomCheckId }, session.token)
        // Demo fallback is intentional: it keeps the patient flow testable when the backend is offline.
        if (isBackendUnavailable(data) || !data?.queueId) {
          if (!cancelled) setQueue(demoQueue())
          return
        }
        if (!cancelled) setQueue(data)
      } catch {
        if (!cancelled) setQueue(demoQueue())
      }
    }
    join()
    return () => { cancelled = true }
  }, [location.state, navigate, session?.patientId, session?.token])

  useEffect(() => {
    if (!queue?.queueId) return
    let active = true
    if (queue.demo) {
      const timer = setTimeout(() => {
        if (active) navigate('/patient/ready', { replace: true, state: { queueId: queue.queueId, demo: true } })
      }, 2200)
      return () => { active = false; clearTimeout(timer) }
    }
    async function poll() {
      const data = await get(`/queue/status/${queue.queueId}`, session?.token)
      if (!active) return
      if (isBackendUnavailable(data)) return
      setQueue((prev) => ({ ...prev, ...data }))
      if (data?.status === 'in_call') navigate('/patient/ready', { replace: true, state: { queueId: queue.queueId } })
      if (data?.status === 'completed') navigate('/patient/completed', { replace: true })
    }
    poll()
    const id = setInterval(poll, 10000)
    return () => { active = false; clearInterval(id) }
  }, [navigate, queue?.queueId, queue?.demo, session?.token])

  return <div className="patient-page"><header className="patient-topbar"><div className="patient-brand"><span className="brand-mark">+</span><span>Nabha Telemed</span></div></header><main className="patient-shell"><section className="flow-card center-card">
    <div className="queue-orbit"><span>●</span></div><div className="step-kicker">Step 4 · Doctor queue</div><h1>{queue ? (queue.demo ? 'You are in the queue' : 'You are in the queue') : 'Joining the queue…'}</h1><p className="muted">Please keep this page open. We’ll update your position automatically.</p>
    {queue && <div className="queue-stats"><div><span>Position</span><strong>{queue.position ?? '—'}</strong></div><div><span>Estimated wait</span><strong>{queue.estimatedWaitMins != null ? `${queue.estimatedWaitMins} min` : 'Updating'}</strong></div></div>}
    {queue?.demo && <div className="success-box" role="status">Demo mode: connecting you to the consultation flow…</div>}
    {location.state?.symptomCheck?.urgencyLevel && <div className={`urgency urgency-${location.state.symptomCheck.urgencyLevel}`}>Priority: {location.state.symptomCheck.urgencyLevel}</div>}
    {error && <div className="error-box" role="alert">{error}<button className="inline-action" onClick={() => navigate('/patient/symptoms')}>Start again</button></div>}
  </section></main></div>
}
