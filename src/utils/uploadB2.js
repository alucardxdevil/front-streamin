/**
 * uploadB2.js – Utilidad para subida de archivos a Backblaze B2
 *
 * ══════════════════════════════════════════════════════════════
 * MODO ACTUAL: Proxy vía servidor
 * ══════════════════════════════════════════════════════════════
 * El cliente envía el archivo al servidor (multipart/form-data).
 * El servidor lo sube a B2 usando PutObjectCommand.
 * Los bytes NO se escriben en disco — se mantienen en buffer de memoria.
 *
 * Ventaja: No requiere configuración de CORS en B2.
 * Desventaja: El tráfico pasa por el servidor (mayor costo de ancho de banda).
 *
 * ══════════════════════════════════════════════════════════════
 * MODO IDEAL: Subida directa cliente→B2 (sin proxy)
 * ══════════════════════════════════════════════════════════════
 * Para activarlo:
 *  1. Ejecutar: node server/scripts/setup-b2-cors.js
 *  2. Cambiar UPLOAD_MODE a 'direct' abajo
 *
 * Flujo directo:
 *  Cliente → POST /api/upload/generate-presigned-post → Servidor (solo token)
 *  Cliente → POST {b2_url} (FormData con fields + file) → B2 directamente
 *
 * ══════════════════════════════════════════════════════════════
 * Configuración CORS requerida en B2 para modo directo:
 * ══════════════════════════════════════════════════════════════
 *  [{
 *    "corsRuleName": "allowDirectUpload",
 *    "allowedOrigins": ["https://tudominio.com", "http://localhost:3000"],
 *    "allowedOperations": ["s3_post", "s3_put", "s3_get", "s3_head"],
 *    "allowedHeaders": ["*"],
 *    "exposeHeaders": ["ETag"],
 *    "maxAgeSeconds": 3600
 *  }]
 *
 * ══════════════════════════════════════════════════════════════
 * Integración con Cloudflare como CDN:
 * ══════════════════════════════════════════════════════════════
 *  - Apuntar cdn.tudominio.com → bucket B2 como origin en Cloudflare
 *  - Las publicUrl de archivos se sirven a través de Cloudflare (caché, WAF)
 *  - Las subidas (presigned POST) van directo a B2, no a través de Cloudflare
 *    (Cloudflare tiene límite de 100 MB en uploads en plan gratuito)
 *
 * ══════════════════════════════════════════════════════════════
 * Seguridad:
 * ══════════════════════════════════════════════════════════════
 *  - JWT verificado en el servidor antes de cualquier operación
 *  - fileKey = uploads/{userId}/{uuid}.{ext} — generado por el servidor
 *  - Validación de MIME type y tamaño en el servidor
 *  - En modo directo: content-length-range y Content-Type fijados en la política
 *  - Rate limiting recomendado: 10 req/min por usuario en /generate-presigned-post
 */

import axios from 'axios'

/**
 * Modo de subida:
 *  'proxy'  → archivo pasa por el servidor (funciona sin CORS en B2)
 *  'direct' → subida directa cliente→B2 (requiere CORS en B2)
 */
const UPLOAD_MODE = 'proxy'

/**
 * Sube un archivo a B2.
 * Usa el modo configurado en UPLOAD_MODE.
 *
 * @param {File}     file        - Objeto File del input
 * @param {Function} onProgress  - Callback (percent: 0–100)
 * @returns {Promise<{ fileKey: string, publicUrl: string, fileType: string }>}
 */
export const uploadToB2 = async (file, onProgress = () => {}) => {
  if (UPLOAD_MODE === 'direct') {
    return uploadDirect(file, onProgress)
  }
  return uploadViaProxy(file, onProgress)
}

// ─────────────────────────────────────────────────────────────────────────────
// MODO PROXY: el archivo pasa por el servidor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sube el archivo al servidor, que lo reenvía a B2.
 * Usa axios para reportar progreso de subida al servidor.
 */
const uploadViaProxy = async (file, onProgress) => {
  const isImage = file.type.startsWith('image/')
  const endpoint = isImage ? '/upload/image' : '/upload/video'

  const formData = new FormData()
  formData.append('file', file)

  const { data } = await axios.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
    onUploadProgress: (e) => {
      if (e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })

  if (!data.success) throw new Error(data.message || 'Error al subir archivo')

  onProgress(100)
  return data.data // { fileKey, publicUrl, fileType, contentType, size }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODO DIRECTO: cliente→B2 con presigned POST
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Solicita presigned POST al servidor y sube directamente a B2.
 * Requiere CORS configurado en el bucket B2.
 *
 * Ejemplo de FormData correcto para S3/B2:
 *   const form = new FormData()
 *   // 1. Primero todos los fields de la política (en cualquier orden)
 *   Object.entries(fields).forEach(([k, v]) => form.append(k, v))
 *   // 2. El archivo SIEMPRE al final — B2 ignora todo lo que viene después
 *   form.append('file', fileObject)
 *   await fetch(url, { method: 'POST', body: form })
 *   // NO agregar Content-Type manual — el FormData lo setea con boundary
 */
const uploadDirect = async (file, onProgress) => {
  // 1. Obtener presigned POST del servidor
  const { data: tokenRes } = await axios.post(
    '/upload/generate-presigned-post',
    { fileName: file.name, contentType: file.type, fileSize: file.size },
    { withCredentials: true }
  )

  if (!tokenRes.success) {
    throw new Error(tokenRes.message || 'Error al obtener token de subida')
  }

  const { url, fields, fileKey, publicUrl, fileType } = tokenRes.data

  // 2. Construir FormData — fields primero, file al final (obligatorio en S3/B2)
  const form = new FormData()
  Object.entries(fields).forEach(([key, value]) => form.append(key, value))
  form.append('file', file) // ← SIEMPRE último

  // 3. POST directo a B2 con progreso real via XHR
  await uploadWithXHR(url, form, onProgress)

  return { fileKey, publicUrl, fileType }
}

/**
 * Sube datos con XMLHttpRequest para obtener progreso real de subida.
 * fetch() no expone onUploadProgress.
 *
 * Manejo de errores de preflight (CORS):
 *  - Si B2 rechaza el preflight OPTIONS, el error llega como ERR_FAILED
 *  - Verificar que allowedOrigins en B2 incluya el origen exacto
 *  - No enviar headers de Authorization al endpoint de B2
 */
const uploadWithXHR = (url, formData, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      // B2 devuelve 204 No Content en éxito para POST presigned
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
      } else {
        const msg = parseB2Error(xhr.responseText) || `HTTP ${xhr.status}`
        reject(new Error(`B2 rechazó la subida: ${msg}`))
      }
    })

    xhr.addEventListener('error', () =>
      reject(new Error('Error de red al subir a B2. Verifica la configuración CORS del bucket.'))
    )
    xhr.addEventListener('abort', () => reject(new Error('Subida cancelada')))

    xhr.open('POST', url)
    // NO agregar Authorization ni Content-Type manual
    xhr.send(formData)
  })

/**
 * Extrae el mensaje de error de la respuesta XML de B2/S3.
 * B2 responde con: <Error><Code>...</Code><Message>...</Message></Error>
 */
const parseB2Error = (xmlText) => {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'application/xml')
    const message = doc.querySelector('Message')?.textContent
    const code = doc.querySelector('Code')?.textContent
    return code ? `${code}: ${message}` : message
  } catch {
    return null
  }
}
