/**
 * Hook: useStreamSession — Gestión de Token de Sesión Anónimo
 *
 * Capa de protección: SESIÓN ANÓNIMA (Capa 3) — lado cliente
 *
 * Este hook gestiona el ciclo de vida del token de sesión anónimo:
 *  1. Solicita un token al backend al montar el componente
 *  2. Almacena el token en memoria (NO en localStorage ni sessionStorage)
 *     para que no sea accesible fuera del contexto de la aplicación
 *  3. Renueva automáticamente el token antes de que expire
 *  4. Expone el token para que los componentes lo incluyan en sus solicitudes
 *
 * El token se adjunta automáticamente a las solicitudes de video mediante
 * el header X-Session-Token.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { getSessionUrl } from '../utils/streamUrl'

// URL del endpoint de sesión (usa URL completa en desarrollo, relativa en producción)
const SESSION_ENDPOINT = getSessionUrl()

// Tiempo de anticipación para renovar el token (5 minutos antes de expirar)
const RENEW_BEFORE_SECONDS = 300

// ── Cache global en memoria ────────────────────────────────────────────────
// Evita pedir un token nuevo en cada mount del reproductor (p. ej. al navegar
// entre videos). Esto reduce el TTFB percibido porque el stream URL depende
// de `sessionToken`.
let cachedToken = null
let cachedRenewTimer = null
let cachedSessionReady = false

/**
 * Hook para gestionar el token de sesión anónimo.
 *
 * @returns {{
 *   sessionToken: string|null,
 *   sessionReady: boolean,
 *   sessionError: string|null,
 *   getAuthHeaders: () => Object,
 *   refreshSession: () => Promise<void>
 * }}
 */
const useStreamSession = () => {
  // Token almacenado en memoria (no en localStorage)
  const [sessionToken, setSessionToken] = useState(cachedToken)
  const [sessionReady, setSessionReady] = useState(cachedSessionReady && !!cachedToken)
  const [sessionError, setSessionError] = useState(null)

  // Ref para el timer de renovación automática
  const renewTimerRef = useRef(null)
  // Ref para evitar solicitudes duplicadas
  const isFetchingRef = useRef(false)

  /**
   * Solicita un nuevo token de sesión al backend.
   */
  const fetchSessionToken = useCallback(async () => {
    if (isFetchingRef.current) return
    // Si ya tenemos token cacheado, úsalo sin hacer request.
    if (cachedToken) {
      setSessionToken(cachedToken)
      setSessionReady(true)
      setSessionError(null)
      return
    }
    isFetchingRef.current = true

    try {
      const response = await axios.get(SESSION_ENDPOINT, {
        withCredentials: true,
      })

      if (response.data?.success && response.data?.data?.sessionToken) {
        const { sessionToken: token, expiresIn, renewBefore } = response.data.data

        // Almacenar token en memoria (estado de React)
        setSessionToken(token)
        setSessionReady(true)
        setSessionError(null)

        // Cache global
        cachedToken = token
        cachedSessionReady = true

        // Programar renovación automática
        const renewInSeconds = renewBefore || (expiresIn - RENEW_BEFORE_SECONDS)
        const renewInMs = Math.max(renewInSeconds * 1000, 60000) // Mínimo 1 minuto

        // Limpiar timers previos (local y global)
        if (renewTimerRef.current) clearTimeout(renewTimerRef.current)
        if (cachedRenewTimer) clearTimeout(cachedRenewTimer)

        const renewFn = () => {
          // Permitir que se refresque cuando toque
          cachedToken = null
          cachedSessionReady = false
          isFetchingRef.current = false
          fetchSessionToken()
        }

        renewTimerRef.current = setTimeout(renewFn, renewInMs)
        cachedRenewTimer = renewTimerRef.current
      }
    } catch (err) {
      console.error('[useStreamSession] Error al obtener token de sesión:', err.message)
      setSessionError('No se pudo iniciar la sesión de reproducción')
      setSessionReady(false)
      cachedSessionReady = false

      // Reintentar después de 30 segundos en caso de error
      if (renewTimerRef.current) clearTimeout(renewTimerRef.current)
      if (cachedRenewTimer) clearTimeout(cachedRenewTimer)
      renewTimerRef.current = setTimeout(() => {
        isFetchingRef.current = false
        fetchSessionToken()
      }, 30000)
      cachedRenewTimer = renewTimerRef.current
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  // Obtener token al montar el componente
  useEffect(() => {
    fetchSessionToken()

    return () => {
      if (renewTimerRef.current) {
        clearTimeout(renewTimerRef.current)
      }
    }
  }, [fetchSessionToken])

  /**
   * Retorna los headers necesarios para solicitudes de video protegidas.
   *
   * @returns {Object} Headers con el token de sesión
   */
  const getAuthHeaders = useCallback(() => {
    if (!sessionToken) return {}
    return {
      'X-Session-Token': sessionToken,
    }
  }, [sessionToken])

  /**
   * Fuerza la renovación del token de sesión.
   */
  const refreshSession = useCallback(async () => {
    isFetchingRef.current = false
    await fetchSessionToken()
  }, [fetchSessionToken])

  return {
    sessionToken,
    sessionReady,
    sessionError,
    getAuthHeaders,
    refreshSession,
  }
}

export default useStreamSession
