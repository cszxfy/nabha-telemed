import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function demoApiPlugin(enabled) {
  if (!enabled) return null

  const state = {
    doctor: { doctorId: 'doctor-demo-1', name: 'Dr. Simran Kaur', phone: '9876543210' },
    patients: new Map([
      ['demo-patient-001', { patientId: 'demo-patient-001', name: 'Aman Kumar', age: 38, gender: 'M', village: 'Nabha', language: 'hi', phone: '9000000001' }],
    ]),
    queue: [
      { queueId: 'demo-queue-001', patientId: 'demo-patient-001', patientName: 'Aman Kumar', urgencyLevel: 'high', waitingSince: new Date(Date.now() - 8 * 60 * 1000).toISOString(), status: 'waiting' },
    ],
    symptomChecks: new Map(),
    calls: new Map(),
    prescriptions: new Map(),
    otp: new Map(),
  }

  let id = 1
  const makeId = (prefix) => `${prefix}-${Date.now()}-${id++}`

  function send(res, status, payload) {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(payload === undefined ? '' : JSON.stringify(payload))
  }

  async function readBody(req) {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    if (!chunks.length) return {}
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { return {} }
  }

  function requireDoctor(req) {
    const auth = req.headers.authorization || ''
    return auth === 'Bearer demo-doctor-token'
  }

  function findPatient(patientId) {
    return state.patients.get(patientId)
  }

  return {
    name: 'nabha-demo-api',
    configureServer(server) {
      server.middlewares.use('/api/v1', async (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          return res.end()
        }

        const url = new URL(req.url || '/', 'http://localhost')
        const path = url.pathname
        const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readBody(req) : {}

        // Doctor authentication
        if (req.method === 'POST' && path === '/auth/doctor/login') {
          const phone = String(body.phone || '').replace(/\D/g, '')
          if (phone === state.doctor.phone && body.password === 'doctor123') {
            return send(res, 200, { token: 'demo-doctor-token', doctorId: state.doctor.doctorId })
          }
          return send(res, 401, { error: 'Invalid credentials' })
        }

        // Patient OTP authentication
        if (req.method === 'POST' && path === '/auth/patient/otp-request') {
          const phone = String(body.phone || '').replace(/\D/g, '')
          if (!/^\d{10}$/.test(phone)) return send(res, 400, { error: 'Invalid phone number' })
          state.otp.set(phone, '1234')
          return send(res, 200, { message: 'OTP sent' })
        }

        if (req.method === 'POST' && path === '/auth/patient/otp-verify') {
          const phone = String(body.phone || '').replace(/\D/g, '')
          if (body.otp !== (state.otp.get(phone) || '1234')) return send(res, 401, { error: 'Invalid OTP' })
          const existing = Array.from(state.patients.values()).find((p) => p.phone === phone)
          const patientId = existing?.patientId || `demo-patient-${phone}`
          if (!existing) state.patients.set(patientId, { patientId, name: '', age: null, gender: '', village: '', language: 'pa', phone })
          return send(res, 200, { token: `demo-patient-token-${phone}`, patientId, phone, isNewUser: !existing })
        }

        // Patient registration
        if (req.method === 'POST' && path === '/patients/register') {
          const patientId = String(body.userId || '')
          if (!patientId) return send(res, 400, { error: 'userId is required' })
          const current = state.patients.get(patientId) || { patientId, phone: '' }
          const patient = { ...current, patientId, name: String(body.name || '').trim(), age: Number(body.age), gender: body.gender || '', village: body.village || '', language: body.language || 'pa' }
          state.patients.set(patientId, patient)
          return send(res, 200, { patientId })
        }

        // Patient profile
        const patientMatch = path.match(/^\/patients\/([^/]+)$/)
        if (req.method === 'GET' && patientMatch) {
          const patient = findPatient(decodeURIComponent(patientMatch[1]))
          if (!patient) return send(res, 404, { error: 'Patient not found' })
          return send(res, 200, { patientId: patient.patientId, name: patient.name || 'Demo Patient', age: patient.age || 30 })
        }

        // Symptom check
        if (req.method === 'POST' && path === '/symptom-check') {
          const symptoms = Array.isArray(body.symptoms) ? body.symptoms : []
          const highRisk = symptoms.some((s) => ['chest pain', 'breathing difficulty'].includes(String(s).toLowerCase()))
          const symptomCheckId = makeId('demo-symptom')
          const result = {
            symptomCheckId,
            patientId: body.patientId,
            symptoms,
            urgencyLevel: highRisk ? 'high' : (symptoms.length >= 3 ? 'medium' : 'low'),
            suggestedDept: highRisk ? 'General Medicine – urgent review' : 'General Medicine',
            demo: true,
          }
          state.symptomChecks.set(symptomCheckId, result)
          return send(res, 200, result)
        }

        // Queue join
        if (req.method === 'POST' && path === '/queue/join') {
          const patientId = String(body.patientId || '')
          const symptomCheck = state.symptomChecks.get(body.symptomCheckId)
          const patient = findPatient(patientId)
          if (!patient) return send(res, 404, { error: 'Patient not found' })
          const existing = state.queue.find((q) => q.patientId === patientId && q.status === 'waiting')
          if (existing) return send(res, 200, { queueId: existing.queueId, position: state.queue.filter((q) => q.status === 'waiting').indexOf(existing) + 1, estimatedWaitMins: 1, status: 'waiting', demo: true })
          const queueItem = {
            queueId: makeId('demo-queue'),
            patientId,
            patientName: patient.name || 'Demo Patient',
            urgencyLevel: symptomCheck?.urgencyLevel || 'medium',
            waitingSince: new Date().toISOString(),
            status: 'waiting',
          }
          state.queue.push(queueItem)
          const waiting = state.queue.filter((q) => q.status === 'waiting')
          return send(res, 200, { queueId: queueItem.queueId, position: waiting.indexOf(queueItem) + 1, estimatedWaitMins: Math.max(1, waiting.length * 2), status: 'waiting', demo: true })
        }

        // Queue status
        const queueStatusMatch = path.match(/^\/queue\/status\/([^/]+)$/)
        if (req.method === 'GET' && queueStatusMatch) {
          const item = state.queue.find((q) => q.queueId === decodeURIComponent(queueStatusMatch[1]))
          if (!item) return send(res, 404, { error: 'Queue item not found' })
          if (item.status === 'in_call') return send(res, 200, { queueId: item.queueId, status: 'in_call', position: 1, estimatedWaitMins: 0 })
          return send(res, 200, { queueId: item.queueId, status: 'waiting', position: Math.max(1, state.queue.filter((q) => q.status === 'waiting').indexOf(item) + 1), estimatedWaitMins: 1 })
        }

        // Doctor queue
        const doctorQueueMatch = path.match(/^\/queue\/doctor\/([^/]+)$/)
        if (req.method === 'GET' && doctorQueueMatch) {
          if (!requireDoctor(req)) return send(res, 401, { error: 'Unauthorized' })
          const queue = state.queue.filter((q) => q.status === 'waiting').map(({ queueId, patientName, urgencyLevel, waitingSince }) => ({ queueId, patientName, urgencyLevel, waitingSince }))
          return send(res, 200, { queue })
        }

        // Doctor calls next patient
        if (req.method === 'POST' && path === '/queue/call-next') {
          if (!requireDoctor(req)) return send(res, 401, { error: 'Unauthorized' })
          const item = state.queue.find((q) => q.status === 'waiting')
          if (!item) return send(res, 204)
          item.status = 'in_call'
          item.calledAt = new Date().toISOString()
          const callId = makeId('room')
          state.calls.set(callId, { callId, queueId: item.queueId, patientId: item.patientId, startedAt: null, endedAt: null, consultationId: makeId('consultation') })
          return send(res, 200, { queueId: item.queueId, patientId: item.patientId, callId })
        }

        // Start call
        if (req.method === 'POST' && path === '/call/start') {
          const queueId = String(body.queueId || '')
          const item = state.queue.find((q) => q.queueId === queueId)
          if (!item) return send(res, 404, { error: 'Queue item not found' })
          let call = Array.from(state.calls.values()).find((c) => c.queueId === queueId && !c.endedAt)
          if (!call) {
            const callId = makeId('room')
            call = { callId, queueId, patientId: item.patientId, startedAt: new Date().toISOString(), endedAt: null, consultationId: makeId('consultation') }
            state.calls.set(callId, call)
          } else if (!call.startedAt) {
            call.startedAt = new Date().toISOString()
          }
          item.status = 'in_call'
          return send(res, 200, { callId: call.callId, agoraToken: `demo-agora-token-${call.callId}` })
        }

        // End call
        if (req.method === 'POST' && path === '/call/end') {
          const call = state.calls.get(String(body.callId || ''))
          if (!call) return send(res, 404, { error: 'Call not found' })
          call.endedAt = new Date().toISOString()
          const durationSecs = Math.max(1, Math.floor((new Date(call.endedAt) - new Date(call.startedAt || call.endedAt)) / 1000))
          const item = state.queue.find((q) => q.queueId === call.queueId)
          if (item) item.status = 'completed'
          return send(res, 200, { message: 'Call ended', durationSecs, consultationId: call.consultationId })
        }

        // Prescriptions
        if (req.method === 'POST' && path === '/prescriptions') {
          if (!requireDoctor(req)) return send(res, 401, { error: 'Unauthorized' })
          if (!body.consultationId) return send(res, 400, { error: 'consultationId is required' })
          const prescriptionId = makeId('prescription')
          const prescription = { prescriptionId, consultationId: body.consultationId, medicines: Array.isArray(body.medicines) ? body.medicines : [], notes: body.notes || '', createdAt: new Date().toISOString() }
          state.prescriptions.set(prescriptionId, prescription)
          return send(res, 201, { prescriptionId })
        }

        const prescriptionsPatientMatch = path.match(/^\/prescriptions\/patient\/([^/]+)$/)
        if (req.method === 'GET' && prescriptionsPatientMatch) {
          const patientId = decodeURIComponent(prescriptionsPatientMatch[1])
          const patientPrescriptions = Array.from(state.prescriptions.values()).filter((p) => {
            const call = Array.from(state.calls.values()).find((c) => c.consultationId === p.consultationId)
            return call?.patientId === patientId
          })
          return send(res, 200, { prescriptions: patientPrescriptions })
        }

        // Demo-only health information
        if (req.method === 'GET' && path === '/health') return send(res, 200, { status: 'ok', mode: 'demo' })

        return next()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000'
  const demoMode = String(env.VITE_DEMO_MODE || '').toLowerCase() === 'true'

  return {
    plugins: [react(), demoApiPlugin(demoMode)].filter(Boolean),
    server: {
      port: 5173,
      proxy: demoMode ? undefined : {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
