/**
 * HLSPlayer — Reproductor de Video HLS con Adaptive Bitrate Streaming
 *
 * Usa hls.js para reproducir streams HLS (.m3u8) con:
 *  - Adaptive Bitrate (ABR): cambia calidad automáticamente según el ancho de banda
 *  - Selector manual de calidad (1080p / 720p / 480p / Auto)
 *  - Indicador de estado de transcodificación (pending / processing / ready / error)
 *  - Polling automático cuando el video está en proceso
 *
 * PROTECCIÓN DE VIDEO:
 *  - Las URLs de B2 NUNCA se exponen al cliente
 *  - Todo el contenido se sirve a través del proxy backend (/api/stream/*)
 *  - El token de sesión anónimo se adjunta automáticamente a cada solicitud
 *  - hls.js usa xhrSetup para inyectar el header X-Session-Token en cada fragmento
 *
 * Props:
 *  - videoId:      string  — ID del video en MongoDB
 *  - hlsMasterUrl: string  — URL del master.m3u8 (ignorada — se usa el proxy)
 *  - status:       string  — Estado inicial ('pending'|'processing'|'ready'|'error')
 *  - poster:       string  — URL de la miniatura
 *  - autoPlay:     bool    — Reproducir automáticamente
 *  - className:    string  — Clases CSS adicionales
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import axios from 'axios'
import useStreamSession from '../hooks/useStreamSession'
import { getStreamUrl } from '../utils/streamUrl'

// Intervalo de polling en ms cuando el video está procesando
const POLLING_INTERVAL = 4000

// Etiquetas de calidad para el selector
const QUALITY_LABELS = {
  '-1': 'Auto',
  0: '1080p',
  1: '720p',
  2: '480p',
}

const HLSPlayer = ({
  videoId,
  hlsMasterUrl: initialMasterUrl,
  status: initialStatus = 'pending',
  poster,
  autoPlay = false,
  className = '',
}) => {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const pollingRef = useRef(null)
  const playerWrapperRef = useRef(null) // Ref para el contenedor del player (sticky)
  const isPlayingRef = useRef(false)    // Ref para acceder al estado de reproducción en callbacks

  // ── Token de sesión anónimo (Capa 3 de protección) ────────────────────────
  const { sessionToken, sessionReady, getAuthHeaders } = useStreamSession()

  const [status, setStatus] = useState(initialStatus)
  // La URL del proxy siempre apunta al backend, nunca a B2 directamente
  // getStreamUrl() construye la URL correcta para desarrollo y producción
  const [masterUrl, setMasterUrl] = useState(
    videoId ? getStreamUrl(videoId) : null
  )
  const [progress, setProgress] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(-1)   // -1 = Auto
  const [availableLevels, setAvailableLevels] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  // Sticky player state (solo mobile)
  const [isStickyActive, setIsStickyActive] = useState(false)
  const [stickyDismissed, setStickyDismissed] = useState(false)

  // ── Polling de estado ──────────────────────────────────────────────────────
  const pollStatus = useCallback(async () => {
    if (!videoId) return

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const res = await axios.get(`/transcode/status/${videoId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      const data = res.data?.data
      if (!data) return

      setStatus(data.status)
      setProgress(data.progress || 0)

      if (data.status === 'ready') {
        // PROTECCIÓN: Usar siempre la URL del proxy, nunca la URL directa de B2
        setMasterUrl(getStreamUrl(videoId))
        stopPolling()
      } else if (data.status === 'error') {
        setError(data.error || 'Error en la transcodificación')
        stopPolling()
      }
    } catch (err) {
      console.error('[HLSPlayer] Error en polling:', err.message)
    }
  }, [videoId])

  const startPolling = useCallback(() => {
    if (pollingRef.current) return
    pollingRef.current = setInterval(pollStatus, POLLING_INTERVAL)
    pollStatus() // Consultar inmediatamente
  }, [pollStatus])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  // ── Inicializar hls.js ─────────────────────────────────────────────────────
  const initHLS = useCallback((url) => {
    const video = videoRef.current
    if (!video || !url) return

    // Destruir instancia anterior si existe
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    setIsLoading(true)
    setError(null)
    // Resetear flag de corrección de inicio
    video._startFixed = false

    // Verificar soporte nativo (Safari/iOS)
    // Preferir hls.js cuando está disponible (mejor control de calidad y compatibilidad).
    // Solo usar HLS nativo en Safari/iOS donde hls.js no funciona (no soporta MSE).
    if (!Hls.isSupported() && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari soporta HLS nativamente (sin MSE, hls.js no funciona)
      // PROTECCIÓN: Adjuntar token de sesión como query param para Safari
      // (Safari no soporta xhrSetup de hls.js)
      const safeUrl = sessionToken
        ? `${url}${url.includes('?') ? '&' : '?'}_st=${encodeURIComponent(sessionToken)}`
        : url
      video.src = safeUrl

      // Escuchar múltiples eventos para garantizar que el spinner se oculte
      const hideLoading = () => setIsLoading(false)
      video.addEventListener('canplay', hideLoading, { once: true })
      video.addEventListener('canplaythrough', hideLoading, { once: true })
      video.addEventListener('loadeddata', hideLoading, { once: true })

      // Manejar eventos de buffering en Safari
      const handleWaiting = () => setIsLoading(true)
      const handlePlaying = () => setIsLoading(false)
      video.addEventListener('waiting', handleWaiting)
      video.addEventListener('playing', handlePlaying)
      video.addEventListener('stalled', handleWaiting)

      // Cleanup de los event listeners al destruir
      video._hlsCleanup = () => {
        video.removeEventListener('canplay', hideLoading)
        video.removeEventListener('canplaythrough', hideLoading)
        video.removeEventListener('loadeddata', hideLoading)
        video.removeEventListener('waiting', handleWaiting)
        video.removeEventListener('playing', handlePlaying)
        video.removeEventListener('stalled', handleWaiting)
      }

      if (autoPlay) {
        video.play().catch((err) => {
          console.warn('[HLSPlayer] Autoplay bloqueado en Safari:', err.message)
        })
      }
      return
    }

    // Usar hls.js para otros navegadores
    if (!Hls.isSupported()) {
      setError('Tu navegador no soporta reproducción HLS')
      setIsLoading(false)
      return
    }

    // Capturar el token actual en el closure para inyectarlo en cada solicitud
    const currentSessionToken = sessionToken

    const hls = new Hls({
      // Configuración optimizada para streaming VOD
      enableWorker: true,                    // Usar Web Worker para parsing
      lowLatencyMode: false,                 // VOD, no live
      backBufferLength: 60,                  // Mantener 60s en buffer trasero
      maxBufferLength: 30,                   // Buffer adelante de 30s
      maxMaxBufferLength: 120,               // Máximo buffer total
      startLevel: -1,                        // Empezar en Auto (ABR)
      abrEwmaDefaultEstimate: 1000000,       // Estimación inicial de ancho de banda (1Mbps)
      // Buffer y timing ajustados para Firefox:
      // - maxBufferHole: tolera huecos de hasta 1s sin saltar (Firefox es más
      //   estricto con huecos en el buffer que Chrome/Safari).
      // - nudgeMaxRetry: más reintentos antes de saltar un hueco.
      // - startFragPrefetch: precarga el primer fragmento mientras se parsea
      //   el playlist, reduciendo el delay de inicio que causaba que Firefox
      //   no iniciara la reproducción desde el segundo 0.
      maxBufferHole: 1,
      nudgeMaxRetry: 10,
      startFragPrefetch: true,
      // Reintentos en caso de error de red
      fragLoadingMaxRetry: 4,
      manifestLoadingMaxRetry: 3,
      levelLoadingMaxRetry: 3,
      fragLoadingRetryDelay: 1000,
      // PROTECCIÓN: Inyectar token de sesión SOLO si la URL no lo tiene ya.
      // El servidor ahora incluye _st como query param en TODAS las URLs
      // reescritas del .m3u8 (tanto playlists como segmentos .ts).
      // Esto evita que Firefox necesite preflight CORS en cada petición,
      // que era la causa principal del retraso en la carga de segmentos iniciales.
      xhrSetup: (xhr, url) => {
        if (currentSessionToken && url && !url.includes('_st=')) {
          xhr.setRequestHeader('X-Session-Token', currentSessionToken)
        }
      },
    })

    hls.loadSource(url)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      setIsLoading(false)
      setAvailableLevels(data.levels)
      console.log(`[HLSPlayer] ${data.levels.length} calidades disponibles`)

      // Forzar seek a 0 para evitar PTS offset de segmentos .ts
      video.currentTime = 0

      if (autoPlay) {
        // En Firefox, intentar play() mutado primero para evitar bloqueo de autoplay.
        // Si play() con audio falla (NotAllowedError), mutear e intentar de nuevo.
        const attemptPlay = () => {
          const p = video.play()
          if (p && typeof p.catch === 'function') {
            p.catch((err) => {
              if (err.name === 'NotAllowedError' && !video.muted) {
                console.warn('[HLSPlayer] Autoplay bloqueado, reintentando mutado')
                video.muted = true
                video.play().catch(() => {})
              }
            })
          }
        }
        attemptPlay()
      }
    })

    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      setCurrentLevel(data.level)
    })

    // Manejar buffering durante la reproducción
    hls.on(Hls.Events.FRAG_BUFFERED, () => {
      // Fragmento cargado: si el video puede reproducirse, ocultar spinner
      if (video.readyState >= 3) {
        setIsLoading(false)
      }
    })

    // Escuchar eventos nativos del elemento video para buffering
    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handlePlaying = () => {
      setIsLoading(false)
      // Corrección de inicio: si es la primera vez que el video entra en
      // estado "playing" y currentTime saltó adelante, corregir a 0.
      if (!video._startFixed) {
        video._startFixed = true
        if (video.currentTime > 1.5) {
          video.currentTime = 0
        }
      }
    }
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('stalled', handleWaiting)

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        console.error('[HLSPlayer] Error fatal:', data.type, data.details)

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log('[HLSPlayer] Reintentando por error de red...')
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('[HLSPlayer] Recuperando error de media...')
            hls.recoverMediaError()
            break
          default:
            setError('Error al reproducir el video')
            setIsLoading(false)
            hls.destroy()
            break
        }
      }
    })

    // Guardar cleanup de event listeners nativos
    video._hlsCleanup = () => {
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('stalled', handleWaiting)
    }

    hlsRef.current = hls
  }, [autoPlay])

  // ── Efectos ────────────────────────────────────────────────────────────────

  // Iniciar polling si el video no está listo, o inicializar HLS si ya está listo.
  // NOTA: Solo un useEffect maneja la inicialización para evitar doble llamada a initHLS.
  // PROTECCIÓN: Esperar a que el token de sesión esté disponible antes de inicializar HLS
  useEffect(() => {
    if (status === 'pending' || status === 'processing') {
      startPolling()
    } else if (status === 'ready' && masterUrl && sessionReady) {
      // Solo inicializar HLS cuando el token de sesión esté listo
      initHLS(masterUrl)
    }

    return () => {
      stopPolling()
      // Limpiar event listeners nativos del video si existen
      const video = videoRef.current
      if (video && video._hlsCleanup) {
        video._hlsCleanup()
        delete video._hlsCleanup
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, masterUrl, sessionReady])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopPolling()
      // Limpiar event listeners nativos del video si existen
      const video = videoRef.current
      if (video && video._hlsCleanup) {
        video._hlsCleanup()
        delete video._hlsCleanup
      }
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [stopPolling])

  // ── Sticky Player — IntersectionObserver (solo mobile) ────────────────────
  useEffect(() => {
    const isMobile = () => window.innerWidth <= 768
    if (!isMobile()) return

    const wrapper = playerWrapperRef.current
    if (!wrapper) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting
        if (!isVisible && isPlayingRef.current && !stickyDismissed) {
          setIsStickyActive(true)
        } else {
          setIsStickyActive(false)
        }
      },
      { threshold: 0, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(wrapper)

    const handleResize = () => {
      if (!isMobile()) setIsStickyActive(false)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [stickyDismissed])

  // Sincronizar isPlayingRef con el estado del video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => { isPlayingRef.current = true }
    const handlePause = () => {
      isPlayingRef.current = false
      setIsStickyActive(false)
    }
    const handleEnded = () => {
      isPlayingRef.current = false
      setIsStickyActive(false)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [status]) // Re-ejecutar cuando el video esté listo

  // ── Cambiar calidad manualmente ────────────────────────────────────────────
  const handleQualityChange = (levelIndex) => {
    if (!hlsRef.current) return
    hlsRef.current.currentLevel = levelIndex
    setCurrentLevel(levelIndex)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  // Estado: Pendiente o Procesando
  if (status === 'pending' || status === 'processing') {
    return (
      <div className={`hls-player-processing ${className}`} style={styles.processingContainer}>
        <div style={styles.processingContent}>
          <div style={styles.spinner} />
          <p style={styles.processingTitle}>
            {status === 'pending' ? '⏳ Video en cola...' : '⚙️ Procesando video...'}
          </p>
          {progress > 0 && (
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${progress}%` }} />
              <span style={styles.progressText}>{progress}%</span>
            </div>
          )}
          <p style={styles.processingSubtitle}>
            {status === 'pending'
              ? 'Tu video está en la cola de transcodificación'
              : 'Generando versiones HLS multi-calidad...'}
          </p>
        </div>
      </div>
    )
  }

  // Estado: Error
  if (status === 'error') {
    return (
      <div className={`hls-player-error ${className}`} style={styles.errorContainer}>
        <p style={styles.errorIcon}>❌</p>
        <p style={styles.errorTitle}>Error al procesar el video</p>
        <p style={styles.errorMessage}>{error || 'Ocurrió un error durante la transcodificación'}</p>
      </div>
    )
  }

  // Estado: Listo — Reproductor HLS
  return (
    // Contenedor de posición: siempre en el flujo del documento (para IntersectionObserver)
    <div ref={playerWrapperRef} style={{ width: '100%', position: 'relative' }}>
      {/* Placeholder para evitar layout shift en mobile cuando el player está en sticky */}
      {isStickyActive && (
        <div style={styles.stickyPlaceholder} />
      )}

      <div
        className={`hls-player ${className}`}
        style={{
          ...styles.playerContainer,
          // Aplicar estilos sticky solo en mobile cuando está activo
          ...(isStickyActive ? styles.stickyContainer : {}),
        }}
      >
        {/* Botón para cerrar el sticky player (solo visible en modo sticky) */}
        {isStickyActive && (
          <button
            style={styles.stickyCloseBtn}
            onClick={(e) => {
              e.stopPropagation()
              setStickyDismissed(true)
              setIsStickyActive(false)
            }}
            title="Cerrar mini reproductor"
          >
            ✕
          </button>
        )}

        {/* preload="metadata" permite que Firefox prepare el pipeline de media.
            "none" causaba que Firefox rechazara play() con DOMException. */}
        <video
          ref={videoRef}
          poster={poster}
          controls
          style={isStickyActive ? styles.videoSticky : styles.video}
          playsInline
          crossOrigin="anonymous"
          preload="metadata"
        />

        {/* Overlay de carga */}
        {isLoading && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner} />
          </div>
        )}

        {/* Selector de calidad (oculto en modo sticky para no ocupar espacio) */}
        {availableLevels.length > 0 && !isStickyActive && (
          <div style={styles.qualitySelector}>
            <select
              value={currentLevel}
              onChange={(e) => handleQualityChange(parseInt(e.target.value))}
              style={styles.qualitySelect}
              title="Seleccionar calidad"
            >
              <option value={-1}>🎯 Auto</option>
              {availableLevels.map((level, index) => (
                <option key={index} value={index}>
                  {level.height}p
                  {level.bitrate ? ` (${Math.round(level.bitrate / 1000)}kbps)` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error de reproducción */}
        {error && (
          <div style={styles.playbackError}>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Estilos inline (reemplazar con CSS/Tailwind según el proyecto) ────────────
const styles = {
  playerContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    display: 'block',
    maxHeight: '80vh',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  qualitySelector: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    zIndex: 10,
  },
  qualitySelect: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  processingContainer: {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#111',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingContent: {
    textAlign: 'center',
    color: '#fff',
    padding: '20px',
  },
  processingTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '16px 0 8px',
  },
  processingSubtitle: {
    fontSize: '14px',
    color: '#aaa',
    margin: '8px 0 0',
  },
  progressContainer: {
    width: '200px',
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '3px',
    margin: '12px auto',
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e50914',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '12px',
    color: '#aaa',
  },
  errorContainer: {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#1a0000',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    padding: '20px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '48px',
    margin: '0 0 16px',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 8px',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#ff6b6b',
    margin: 0,
  },
  playbackError: {
    position: 'absolute',
    bottom: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(229,9,20,0.9)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
  },
  // ── Sticky player styles (solo mobile) ──────────────────────────────────────
  stickyContainer: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    width: '280px',
    height: '158px', // 280 * 9/16
    zIndex: 9999,
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
    overflow: 'hidden',
    paddingTop: 0,
  },
  stickyPlaceholder: {
    width: '100%',
    paddingTop: '56.25%', // 16:9
    backgroundColor: '#000',
    borderRadius: '8px',
  },
  videoSticky: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'contain',
  },
  stickyCloseBtn: {
    position: 'absolute',
    top: '6px',
    left: '6px',
    zIndex: 10000,
    background: 'rgba(0,0,0,0.7)',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '14px',
    lineHeight: 1,
    padding: 0,
  },
}

export default HLSPlayer
