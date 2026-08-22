const KEY = 'nabha_doctor_session'
const FLOW_KEY = 'nabha_doctor_flow'

export function saveDoctorSession(session) {
  sessionStorage.setItem(KEY, JSON.stringify({ ...session, role: 'doctor' }))
}

export function getDoctorSession() {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearDoctorSession() {
  sessionStorage.removeItem(KEY)
  sessionStorage.removeItem(FLOW_KEY)
}

export function saveDoctorFlow(flow) {
  sessionStorage.setItem(FLOW_KEY, JSON.stringify(flow))
}

export function getDoctorFlow() {
  try {
    const raw = sessionStorage.getItem(FLOW_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function clearDoctorFlow() {
  sessionStorage.removeItem(FLOW_KEY)
}
