const KEY = 'nabha_patient_session'

export function saveSession(session) {
  sessionStorage.setItem(KEY, JSON.stringify(session))
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  sessionStorage.removeItem(KEY)
}
