/**
 * Utilidad para construir URLs del proxy de streaming
 *
 * En producción (Cloudflare Pages), el frontend está en un dominio diferente
 * al backend (http://89.167.94.4), por lo que se deben usar URLs absolutas.
 *
 * En desarrollo, el proxy de CRA (configurado en package.json) redirige
 * solicitudes de /api/* a http://localhost:5000, por lo que se usan rutas relativas.
 *
 * IMPORTANTE: Las URLs de B2 NUNCA se exponen al cliente.
 * Todo el contenido se sirve a través del proxy backend (/api/stream/*).
 */

// URL base del backend según el entorno
// En producción: http://89.167.94.4
// En desarrollo: vacío (usa proxy de CRA con rutas relativas)
const BACKEND_URL =
  process.env.NODE_ENV === 'production'
    ? (process.env.REACT_APP_API_URL || 'http://89.167.94.4')
    : ''

/**
 * Construye la URL del proxy para un video específico.
 *
 * @param {string} videoId - ID del video en MongoDB
 * @returns {string} URL del proxy de streaming
 */
export const getStreamUrl = (videoId) => {
  if (!videoId) return null
  return `${BACKEND_URL}/api/stream/video/${videoId}`
}

/**
 * Construye la URL del endpoint de sesión.
 *
 * @returns {string} URL del endpoint de sesión
 */
export const getSessionUrl = () => {
  return `${BACKEND_URL}/api/stream/session`
}

/**
 * Construye la URL del proxy para un fragmento HLS.
 *
 * @param {string} key - Key del fragmento en B2
 * @param {string} videoId - ID del video (opcional)
 * @returns {string} URL del proxy de fragmento
 */
export const getHLSSegmentUrl = (key, videoId) => {
  const base = `${BACKEND_URL}/api/stream/hls`
  const vidParam = videoId ? `&vid=${videoId}` : ''
  return `${base}?key=${encodeURIComponent(key)}${vidParam}`
}

const streamUrlUtils = { getStreamUrl, getSessionUrl, getHLSSegmentUrl }
export default streamUrlUtils
