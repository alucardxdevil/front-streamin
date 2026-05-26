/** Normaliza un id de video para comparaciones consistentes */
export function normalizeVideoId(id) {
  if (id == null) return ''
  return String(id)
}

/**
 * Filtra duplicados y excluye el video en reproducción.
 * Preserva el orden de la primera aparición.
 */
export function uniqueRecommendations(videos, excludeId = null) {
  if (!Array.isArray(videos)) return []

  const seen = new Set()
  if (excludeId) seen.add(normalizeVideoId(excludeId))

  return videos.filter((video) => {
    const id = normalizeVideoId(video?._id)
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

/**
 * Añade videos nuevos sin duplicar los ya mostrados ni el video actual.
 */
export function mergeUniqueRecommendations(existing, incoming, excludeId = null) {
  return uniqueRecommendations([...(existing || []), ...(incoming || [])], excludeId)
}
