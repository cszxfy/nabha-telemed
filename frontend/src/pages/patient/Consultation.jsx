import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { post, isBackendUnavailable } from '../../services/api'
import './PatientFlow.css'

export default function Consultation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { callId, queueId, agoraToken, demo } = location.state || {}
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [mic, setMic] = useState(true)
  const [camera, setCamera] = useState(true)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const [ending, setEnding] = useState(false)

  useEffect(() => {
    if (!callId) { navigate('/patient/dashboard', { replace: true }); return }
    let active = true
    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setConnected(true)
      } catch {
        setError('Camera or microphone access was blocked. You can still stay on this page and join once permissions are enabled.')
      }
    }
    setup()
    return () => { active = false; streamRef.current?.getTracks().forEach((t) => t.stop()) }
  }, [callId, navigate])

  useEffect(() => {
    const stream = streamRef.current
    stream?.getAudioTracks().forEach((track) => { track.enabled = mic })
  }, [mic])

  useEffect(() => {
    const stream = streamRef.current
    stream?.getVideoTracks().forEach((track) => { track.enabled = camera })
  }, [camera])

  async function endCall() {
    if (!callId || ending) return
    setEnding(true)
    try {
      const data = await post('/call/end', { callId })
      if (!isBackendUnavailable(data) && data?.error) throw new Error(data.error)
      navigate('/patient/completed', { replace: true, state: { queueId, demo: Boolean(demo || isBackendUnavailable(data)) } })
    } catch {
      setError('We could not confirm the call ended. Please try again.')
      setEnding(false)
    }
  }

  return <div className="call-page"><header className="patient-topbar"><div className="patient-brand"><span className="brand-mark">+</span><span>Nabha Telemed</span></div><span className="call-status">{connected ? 'Connected' : 'Connecting'}</span></header>
    <main className="call-shell"><section className="video-stage"><div className="remote-pane"><div className="remote-avatar">Dr</div><div><strong>Doctor consultation</strong><span>{connected ? 'Waiting for doctor video…' : 'Connecting securely…'}</span></div></div><div className="local-pane"><video ref={videoRef} autoPlay playsInline muted className={camera ? '' : 'video-hidden'} />{!camera && <div className="camera-off">Camera off</div>}</div></section>
      <div className="call-banner">{demo ? 'Demo consultation mode — backend not connected' : (agoraToken ? 'Secure consultation session ready' : 'Secure consultation session')}</div>
      {error && <div className="error-box" role="alert">{error}</div>}
      <div className="call-controls"><button className={`control-btn ${mic ? '' : 'off'}`} onClick={() => setMic((v) => !v)}>{mic ? 'Mic on' : 'Mic off'}</button><button className={`control-btn ${camera ? '' : 'off'}`} onClick={() => setCamera((v) => !v)}>{camera ? 'Camera on' : 'Camera off'}</button><button className="end-btn" onClick={endCall} disabled={ending}>{ending ? 'Ending…' : 'End consultation'}</button></div>
    </main></div>
}
