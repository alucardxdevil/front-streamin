/**
 * Hook useVideoUpload
 *
 * Maneja el flujo completo de subida y transcodificación de video:
 *
 * Paso 1: Solicitar presigned URL al backend
 * Paso 2: Subir MP4 directamente a B2 (sin pasar por el servidor)
 * Paso 3: Encolar transcodificación en el backend
 * Paso 4: Polling del estado hasta que el video esté listo
 *
 * Uso:
 *   const { upload, state, progress, videoId, error, reset } = useVideoUpload()
 *
 *   await upload({
 *     videoFile,    // File object del input
 *     imageFile,    // File object de la miniatura
 *     title,
 *     description,
 *     tags,
 *   })
 */

import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

/**
 * Estados del proceso de upload:
 *  idle         → Sin actividad
 *  uploading    → Subiendo MP4 a B2 (progreso 0-100)
 *  enqueuing    → Encolando job de transcodificación
 *  processing   → Worker transcodificando (progreso 0-100)
 *  ready        → Video listo para reproducir
 *  error        → Error en algún paso
 */

const useVideoUpload = () => {
  const [state, setState] = useState('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [transcodeProgress, setTranscodeProgress] = useState(0)
  const [videoId, setVideoId] = useState(null)
  const [hlsMasterUrl, setHlsMasterUrl] = useState(null)
  const [error, setError] = useState(null)

  const pollingRef = useRef(null)
  const abortControllerRef = useRef(null)

  // ── Obtener token de autenticación ─────────────────────────────────────────
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // ── Paso 1: Subir imagen de miniatura ──────────────────────────────────────
  const uploadThumbnail = async (imageFile) => {
    const formData = new FormData()
    formData.append('file', imageFile)

    const res = await axios.post(`${API_BASE}/upload/image`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      imgUrl: res.data.data.publicUrl,
      imgKey: res.data.data.fileKey,
    }
  }

  // ── Paso 2: Obtener presigned URL para el video ────────────────────────────
  const getVideoPresignedUrl = async (videoFile) => {
    const res = await axios.post(
      `${API_BASE}/transcode/presigned-upload`,
      {
        fileName: videoFile.name,
        contentType: videoFile.type,
        fileSize: videoFile.size,
      },
      { headers: getAuthHeaders() }
    )

    return res.data.data // { uploadUrl, rawKey, expiresIn }
  }

  // ── Paso 3: Subir MP4 directamente a B2 ───────────────────────────────────
  const uploadVideoToB2 = async (uploadUrl, videoFile) => {
    abortControllerRef.current = new AbortController()

    await axios.put(uploadUrl, videoFile, {
      headers: {
        'Content-Type': videoFile.type,
      },
      signal: abortControllerRef.current.signal,
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(percent)
      },
    })
  }

  // ── Paso 4: Encolar transcodificación ──────────────────────────────────────
  const enqueueTranscode = async ({ rawKey, title, description, tags, imgUrl, imgKey, fileSize }) => {
    const res = await axios.post(
      `${API_BASE}/transcode/enqueue`,
      { rawKey, title, description, tags, imgUrl, imgKey, fileSize },
      { headers: getAuthHeaders() }
    )

    return res.data.data // { videoId, jobId, status }
  }

  // ── Paso 5: Polling del estado de transcodificación ────────────────────────
  const startPolling = useCallback((id) => {
    if (pollingRef.current) clearInterval(pollingRef.current)

    const poll = async () => {
      try {
        const res = await axios.get(`${API_BASE}/transcode/status/${id}`, {
          headers: getAuthHeaders(),
        })

        const data = res.data?.data
        if (!data) return

        setTranscodeProgress(data.progress || 0)

        if (data.status === 'ready') {
          clearInterval(pollingRef.current)
          pollingRef.current = null
          setHlsMasterUrl(data.hlsMasterUrl)
          setState('ready')
        } else if (data.status === 'error') {
          clearInterval(pollingRef.current)
          pollingRef.current = null
          setError(data.error || 'Error en la transcodificación')
          setState('error')
        }
        // Si sigue 'pending' o 'processing', continuar polling
      } catch (err) {
        console.error('[useVideoUpload] Error en polling:', err.message)
      }
    }

    poll() // Consultar inmediatamente
    pollingRef.current = setInterval(poll, 4000)
  }, [])

  // ── Función principal de upload ────────────────────────────────────────────
  const upload = useCallback(async ({
    videoFile,
    imageFile,
    title,
    description,
    tags = [],
  }) => {
    if (!videoFile) throw new Error('videoFile es requerido')
    if (!imageFile) throw new Error('imageFile es requerido')
    if (!title) throw new Error('title es requerido')
    if (!description) throw new Error('description es requerido')

    // Reset estado
    setError(null)
    setUploadProgress(0)
    setTranscodeProgress(0)
    setVideoId(null)
    setHlsMasterUrl(null)

    try {
      // ── 1. Subir miniatura ───────────────────────────────────────────────
      setState('uploading')
      console.log('[Upload] Subiendo miniatura...')
      const { imgUrl, imgKey } = await uploadThumbnail(imageFile)

      // ── 2. Obtener presigned URL para el video ───────────────────────────
      console.log('[Upload] Obteniendo presigned URL...')
      const { uploadUrl, rawKey } = await getVideoPresignedUrl(videoFile)

      // ── 3. Subir MP4 directamente a B2 ──────────────────────────────────
      console.log('[Upload] Subiendo video a B2...')
      await uploadVideoToB2(uploadUrl, videoFile)
      setUploadProgress(100)

      // ── 4. Encolar transcodificación ─────────────────────────────────────
      setState('enqueuing')
      console.log('[Upload] Encolando transcodificación...')
      const { videoId: newVideoId } = await enqueueTranscode({
        rawKey,
        title,
        description,
        tags,
        imgUrl,
        imgKey,
        fileSize: videoFile.size,
      })

      setVideoId(newVideoId)

      // ── 5. Iniciar polling ───────────────────────────────────────────────
      setState('processing')
      console.log(`[Upload] Video ${newVideoId} encolado. Iniciando polling...`)
      startPolling(newVideoId)

      return { videoId: newVideoId }

    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('[Upload] Upload cancelado por el usuario')
        setState('idle')
        return
      }

      const message = err.response?.data?.message || err.message || 'Error desconocido'
      console.error('[Upload] Error:', message)
      setError(message)
      setState('error')
      throw err
    }
  }, [startPolling])

  // ── Cancelar upload en progreso ────────────────────────────────────────────
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setState('idle')
    setUploadProgress(0)
    setTranscodeProgress(0)
  }, [])

  // ── Reset completo ─────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    cancel()
    setError(null)
    setVideoId(null)
    setHlsMasterUrl(null)
  }, [cancel])

  return {
    // Función principal
    upload,
    cancel,
    reset,

    // Estado
    state,           // 'idle' | 'uploading' | 'enqueuing' | 'processing' | 'ready' | 'error'
    uploadProgress,  // 0-100 durante la subida del MP4
    transcodeProgress, // 0-100 durante la transcodificación

    // Resultado
    videoId,
    hlsMasterUrl,
    error,

    // Flags de conveniencia
    isUploading: state === 'uploading',
    isProcessing: state === 'processing' || state === 'enqueuing',
    isReady: state === 'ready',
    hasError: state === 'error',
  }
}

export default useVideoUpload
