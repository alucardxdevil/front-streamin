const STORAGE_KEY = "streamin_watch_tag_weights_v1";

/**
 * Suma peso a cada etiqueta (p. ej. al abrir un video o al contabilizar la vista).
 * `weight` permite dar más importancia a una señal (p. ej. vista ≥50 %) que al simple acceso.
 */
export function recordWatchTags(tags, weight = 1) {
  if (!Array.isArray(tags) || tags.length === 0) return;
  const w = typeof weight === "number" && weight > 0 ? weight : 1;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const weights = raw ? JSON.parse(raw) : {};
    for (const tag of tags) {
      const t = typeof tag === "string" ? tag.trim() : "";
      if (!t) continue;
      weights[t] = (weights[t] || 0) + w;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
  } catch (e) {
    console.error("recordWatchTags:", e);
  }
}

/** Etiquetas con más peso (las que más ha consumido el usuario). */
export function getTopTagsForYou(limit = 8) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const weights = JSON.parse(raw);
    return Object.entries(weights)
      .filter(([, n]) => typeof n === "number" && n > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag);
  } catch {
    return [];
  }
}
