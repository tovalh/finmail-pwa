import { API_URL, IS_DEMO } from './env.js'

const STORAGE_KEY = 'finmail_rt'

let _accessToken = null
let _refreshToken = localStorage.getItem(STORAGE_KEY) ?? null

export function setTokens(access, refresh) {
  _accessToken = access
  _refreshToken = refresh
  localStorage.setItem(STORAGE_KEY, refresh)
}

export function getAccessToken() {
  return _accessToken
}

export function clearTokens() {
  _accessToken = null
  _refreshToken = null
  localStorage.removeItem(STORAGE_KEY)
}

export function hasStoredSession() {
  return !!_refreshToken
}

// Devuelve el access token nuevo; lanza si el refresh falla.
export async function refreshAccessToken() {
  if (!_refreshToken) throw new Error('No hay refresh token')

  if (IS_DEMO) {
    _accessToken = 'demo'
    return _accessToken
  }

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: _refreshToken,
  })

  if (!res.ok) {
    clearTokens()
    throw new Error('Refresh rechazado')
  }

  const data = await res.json()
  setTokens(data.accessToken, data.refreshToken)
  return data.accessToken
}
