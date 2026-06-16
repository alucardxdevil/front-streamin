/**
 * Utilidad para construir URLs del proxy de streaming
 *
 * Producción: URLs absolutas al VPS (api.teleprt.com)
 * Desarrollo: rutas relativas /api/* (proxy Vite → localhost:5000)
 */

import { STREAM_BACKEND_URL } from './env'

/**
 * @param {string} videoId
 * @param {string} [sessionToken]
 * @returns {string|null}
 */
export const getStreamUrl = (videoId, sessionToken) => {
  if (!videoId) return null
  const base = `${STREAM_BACKEND_URL}/api/stream/video/${videoId}`
  if (sessionToken) {
    return `${base}?_st=${encodeURIComponent(sessionToken)}`
  }
  return base
}

export const getSessionUrl = () => {
  return `${STREAM_BACKEND_URL}/api/stream/session`
}

export const getHLSSegmentUrl = (key, videoId) => {
  const base = `${STREAM_BACKEND_URL}/api/stream/hls`
  const vidParam = videoId ? `&vid=${videoId}` : ''
  return `${base}?key=${encodeURIComponent(key)}${vidParam}`
}

const streamUrlUtils = { getStreamUrl, getSessionUrl, getHLSSegmentUrl }
export default streamUrlUtils
