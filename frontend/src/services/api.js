// API contract: see the project's frozen API contract.
// In local development Vite proxies /api -> the backend server.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const REQUEST_TIMEOUT_MS = 7000

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()
  let payload = {}

  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      // If an HTML page comes back, this is usually a frontend fallback or
      // misrouted request rather than a valid API response.
      payload = { __html: true }
    }
  }

  const isHtml = contentType.includes('text/html') || payload.__html

  if (!res.ok) {
    return {
      ...payload,
      __networkError: false,
      __status: res.status,
      __error: payload?.error || `Request failed with status ${res.status}`,
      ...(isHtml ? { __html: true } : {}),
    }
  }

  if (isHtml) {
    return {
      __networkError: true,
      __status: res.status,
      __html: true,
      __error: 'The API request was routed to the frontend instead of the backend. Check that the backend is running on the configured URL.',
    }
  }

  return {
    ...payload,
    __networkError: false,
    __status: res.status,
  }
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    })
    return await parseResponse(res)
  } catch (error) {
    return {
      __networkError: true,
      __error:
        error?.name === 'AbortError'
          ? 'Backend request timed out'
          : (error?.message || 'Network error'),
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  return request(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

export async function get(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  return request(path, { headers })
}

export function isBackendUnavailable(data) {
  return Boolean(data?.__networkError || data?.__html)
}
