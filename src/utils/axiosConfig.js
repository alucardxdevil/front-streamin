/**
 * Configuración global de Axios para producción en Cloudflare Pages
 *
 * Producción: Cloudflare Pages (stream-in.com) → API VPS Hetzner (api.stream-in.com)
 * Auth: cookie httpOnly + protección CSRF double-submit
 */

import axios from 'axios'
import { getCsrfToken, readCsrfFromCookie, refreshCsrf, setCsrfToken } from './csrf'

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? `${process.env.REACT_APP_API_URL}/api`
    : '/api'

if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
  console.error('[Security] REACT_APP_API_URL no está definido en producción')
}

axios.defaults.baseURL = API_BASE_URL
axios.defaults.withCredentials = true

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete'])

function isBackendRequest(config) {
  const url = config.url || ''
  const base = config.baseURL || axios.defaults.baseURL || ''
  const full = url.startsWith('http') ? url : `${base}${url}`

  if (full.includes('backblazeb2.com') || full.includes('amazonaws.com')) {
    return false
  }

  return (
    url.startsWith('/') ||
    full.includes('api.stream-in.com') ||
    full.includes('localhost') ||
    (process.env.REACT_APP_API_URL && full.includes(process.env.REACT_APP_API_URL))
  )
}

function attachCsrfHeaders(config) {
  const method = (config.method || 'get').toLowerCase()
  if (!MUTATING_METHODS.has(method) || !isBackendRequest(config)) {
    return config
  }

  config.headers = config.headers || {}
  config.headers['X-Requested-With'] = 'XMLHttpRequest'

  const token = getCsrfToken() || readCsrfFromCookie()
  if (token) {
    config.headers['X-CSRF-Token'] = token
  }

  return config
}

axios.interceptors.request.use(
  (config) => attachCsrfHeaders(config),
  (error) => Promise.reject(error)
)

axios.interceptors.response.use(
  (response) => {
    if (response.data?.csrfToken) {
      setCsrfToken(response.data.csrfToken)
    }
    return response
  },
  async (error) => {
    const config = error.config
    const status = error.response?.status
    const code = error.response?.data?.code
    const message = error.response?.data?.message || ''
    const url = config?.url || ''

    if (
      status === 403 &&
      code === 'CSRF_INVALID' &&
      config &&
      !config._csrfRetried
    ) {
      config._csrfRetried = true
      await refreshCsrf()
      attachCsrfHeaders(config)
      return axios(config)
    }

    const isStreamEndpoint = url.includes('/stream/')

    if ((status === 401 || status === 403) && code !== 'CSRF_INVALID') {
      if (!isStreamEndpoint) {
        localStorage.removeItem('user')
        sessionStorage.removeItem('user')

        if (
          message.includes('deleted') ||
          message.includes('eliminated') ||
          message.includes('Account has been deleted')
        ) {
          alert('Your account has been deleted. You will be redirected to the login page.')
          window.location.href = '/signin'
        } else if (!url.includes('/auth/')) {
          window.location.href = '/signin'
        }
      }
    }

    return Promise.reject(error)
  }
)

export default axios
