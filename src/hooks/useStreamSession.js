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
  const [sessionToken, setSessionToken] = useState(null)
  const [sessionReady, setSessionReady] = useState(false)
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

        // Programar renovación automática
        const renewInSeconds = renewBefore || (expiresIn - RENEW_BEFORE_SECONDS)
        const renewInMs = Math.max(renewInSeconds * 1000, 60000) // Mínimo 1 minuto

        if (renewTimerRef.current) {
          clearTimeout(renewTimerRef.current)
        }

        renewTimerRef.current = setTimeout(() => {
          isFetchingRef.current = false
          fetchSessionToken()
        }, renewInMs)
      }
    } catch (err) {
      console.error('[useStreamSession] Error al obtener token de sesión:', err.message)
      setSessionError('No se pudo iniciar la sesión de reproducción')
      setSessionReady(false)

      // Reintentar después de 30 segundos en caso de error
      if (renewTimerRef.current) {
        clearTimeout(renewTimerRef.current)
      }
      renewTimerRef.current = setTimeout(() => {
        isFetchingRef.current = false
        fetchSessionToken()
      }, 30000)
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
