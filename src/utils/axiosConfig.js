/**
 * Configuración global de Axios para producción en Cloudflare Pages
 *
 * En producción, el frontend está en Cloudflare Pages y el backend
 * en http://89.167.94.4. Todas las llamadas a la API deben apuntar
 * a esa IP con el prefijo /api.
 *
 * En desarrollo, se usa el proxy de CRA (configurado en package.json)
 * que redirige /api/* a http://localhost:5000.
 */

import axios from 'axios'

// URL base del backend según el entorno
// En producción: http://89.167.94.4/api
// En desarrollo: /api (el proxy de CRA lo redirige a localhost:5000)
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? `${process.env.REACT_APP_API_URL || 'http://89.167.94.4'}/api`
    : '/api'

// Configurar baseURL global de axios
axios.defaults.baseURL = API_BASE_URL

// Configurar withCredentials globalmente para enviar cookies de sesión
// NOTA: En producción (HTTPS → HTTP), las cookies pueden ser bloqueadas por el navegador.
// Si el backend tiene SSL (HTTPS), esto funcionará correctamente.
// Si el backend es HTTP, considera usar tokens JWT en headers en lugar de cookies.
axios.defaults.withCredentials = true

// Interceptor de request: adjuntar token de autenticación si existe
// Solo se aplica a peticiones al backend (no a B2 ni servicios externos)
axios.interceptors.request.use(
  (config) => {
    const url = config.url || ''
    const isBackendRequest =
      url.startsWith('/') ||
      url.includes('89.167.94.4') ||
      url.includes('api.stream-in.com') ||
      url.includes('localhost')

    if (isBackendRequest) {
      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token')
      if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor de response: manejar errores globales
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo limpiar token de autenticación si el 401 viene de un endpoint de auth/usuario,
      // NO de endpoints de streaming (que usan tokens de sesión anónimos diferentes)
      const url = error.config?.url || ''
      const isStreamEndpoint = url.includes('/stream/')
      if (!isStreamEndpoint) {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
      }
    }
    return Promise.reject(error)
  }
)

export default axios
