// API contract: see docs/api-contract.md
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const REQUEST_TIMEOUT_MS = 1500

async function parseResponse(res) {
  const text = await res.text()
  if (!res.ok) return { __networkError: true, __status: res.status }
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    // A frontend dev server may return index.html for an unknown /api route.
    return { __networkError: true, __status: res.status, __html: true }
  }
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, signal: controller.signal })
    return await parseResponse(res)
  } catch (error) {
    return {
      __networkError: true,
      __error: error?.name === 'AbortError' ? 'Backend request timed out' : (error?.message || 'Network error'),
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return request(path, { method: 'POST', headers, body: JSON.stringify(body) })
}

export async function get(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  return request(path, { headers })
}

export function isBackendUnavailable(data) {
  return Boolean(data?.__networkError)
}
