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
import { useNavigate } from 'react-router-dom'

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
    const status = error.response?.status
    const message = error.response?.data?.message || ''
    const url = error.config?.url || ''
    const isStreamEndpoint = url.includes('/stream/')
    
    // Manejar errores de autenticación
    if (status === 401 || status === 403) {
      // No limpiar tokens para streaming (usan tokens diferentes)
      if (!isStreamEndpoint) {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')
        
        // Verificar si es cuenta eliminada
        if (message.includes('deleted') || message.includes('eliminated') || message.includes('Account has been deleted')) {
          alert('Your account has been deleted. You will be redirected to the login page.')
          window.location.href = '/signin'
        } else {
          // Redireccionar al login solo si no es el endpoint de login
          if (!url.includes('/auth/')) {
            window.location.href = '/signin'
          }
        }
      }
    }
    return Promise.reject(error)
  }
)

export default axios
