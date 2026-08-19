// FROZEN — do not modify unless absolutely required.
// API contract: see docs/api-contract.md
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function get(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const res = await fetch(`${BASE_URL}${path}`, { headers })
  return res.json()
}
