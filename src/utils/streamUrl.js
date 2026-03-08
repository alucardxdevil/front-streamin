/**
 * Utilidad para construir URLs del proxy de streaming
 *
 * El proxy de React (configurado en package.json) redirige solicitudes
 * de axios a http://localhost:5000/api/. Sin embargo, las solicitudes
 * de media (video) que hace el navegador directamente no pasan por el proxy.
 *
 * Esta utilidad construye la URL correcta según el contexto:
 * - En desarrollo: usa la URL completa del backend (http://localhost:5000/api/stream/...)
 * - En producción: usa rutas relativas (/api/stream/...)
 */

// URL base del backend
// En desarrollo, el servidor corre en localhost:5000
// En producción, el frontend y backend están en el mismo dominio
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

/**
 * Construye la URL del proxy para un video específico.
 *
 * @param {string} videoId - ID del video en MongoDB
 * @returns {string} URL del proxy de streaming
 */
export const getStreamUrl = (videoId) => {
  if (!videoId) return null
  // En producción (mismo dominio), usar ruta relativa
  if (process.env.NODE_ENV === 'production') {
    return `/api/stream/video/${videoId}`
  }
  // En desarrollo, usar URL completa del backend
  return `${BACKEND_URL}/api/stream/video/${videoId}`
}

/**
 * Construye la URL del endpoint de sesión.
 *
 * @returns {string} URL del endpoint de sesión
 */
export const getSessionUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/api/stream/session'
  }
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
  const base = process.env.NODE_ENV === 'production'
    ? '/api/stream/hls'
    : `${BACKEND_URL}/api/stream/hls`
  const vidParam = videoId ? `&vid=${videoId}` : ''
  return `${base}?key=${encodeURIComponent(key)}${vidParam}`
}

export default { getStreamUrl, getSessionUrl, getHLSSegmentUrl }
