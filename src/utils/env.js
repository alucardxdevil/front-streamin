/**
 * Variables de entorno (Vite).
 * En Cloudflare Pages: VITE_API_URL, VITE_SITE_URL en Environment Variables.
 */

export const isProd = import.meta.env.PROD
export const isDev = import.meta.env.DEV

/** URL base del backend sin /api (ej. https://api.stream-in.com) */
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (isProd ? 'https://api.stream-in.com' : 'http://localhost:5000')

/** URL pública del sitio (ej. https://stream-in.com) */
export const SITE_URL =
  import.meta.env.VITE_SITE_URL || 'https://stream-in.com'

/** Prefijo API para axios y fetch internos */
export const API_BASE = isProd ? `${API_URL}/api` : '/api'

/** URL base para streaming (vacío en dev → rutas relativas vía proxy Vite) */
export const STREAM_BACKEND_URL = isProd ? API_URL : ''
