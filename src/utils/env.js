/**
 * Variables de entorno (Vite).
 * En Cloudflare Pages: VITE_API_URL, VITE_SITE_URL en Environment Variables.
 */

export const isProd = import.meta.env.PROD
export const isDev = import.meta.env.DEV

const PROD_API_URL = 'https://api.teleprt.com'
const PROD_SITE_URL = 'https://teleprt.com'

/** Normaliza URLs legacy del rebrand stream-in → teleprt (sin log en consola) */
function normalizeBrandUrl(url, { api = false } = {}) {
  if (!url) return url
  let normalized = String(url).trim().replace(/\/$/, '')
  if (normalized.includes('stream-in.com')) {
    normalized = api ? PROD_API_URL : PROD_SITE_URL
  }
  return normalized
}

/** URL base del backend sin /api (ej. https://api.teleprt.com) */
export const API_URL = normalizeBrandUrl(
  import.meta.env.VITE_API_URL ||
    (isProd ? PROD_API_URL : 'http://localhost:5000'),
  { api: true }
)

/** URL pública del sitio (ej. https://teleprt.com) */
export const SITE_URL = normalizeBrandUrl(
  import.meta.env.VITE_SITE_URL || PROD_SITE_URL
)

/** Prefijo API para axios y fetch internos */
export const API_BASE = isProd ? `${API_URL}/api` : '/api'

/** URL base para streaming (vacío en dev → rutas relativas vía proxy Vite) */
export const STREAM_BACKEND_URL = isProd ? API_URL : ''
