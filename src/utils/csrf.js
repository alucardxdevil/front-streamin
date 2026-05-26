/**
 * Gestión de tokens CSRF para peticiones al API (VPS Hetzner).
 * Usa fetch (no axios) para evitar dependencia circular con axiosConfig.
 */

import { API_BASE } from './env'

let csrfToken = null
let initPromise = null

export function readCsrfFromCookie() {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function getCsrfToken() {
  return csrfToken || readCsrfFromCookie()
}

export async function initCsrf() {
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/csrf`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      csrfToken = data?.csrfToken || readCsrfFromCookie()
      return csrfToken
    } catch (err) {
      console.warn('[CSRF] No se pudo obtener token inicial:', err?.message)
      csrfToken = readCsrfFromCookie()
      return csrfToken
    } finally {
      initPromise = null
    }
  })()

  return initPromise
}

export async function refreshCsrf() {
  csrfToken = null
  return initCsrf()
}

export function setCsrfToken(token) {
  if (token) csrfToken = token
}
