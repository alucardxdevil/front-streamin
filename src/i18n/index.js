/**
 * Carga de traducciones por locale (code-split).
 *
 * Antes todas las traducciones (12 idiomas, ~250 KB) vivían en un único módulo
 * que entraba completo en el main chunk. Ahora cada idioma es su propio chunk
 * y se carga bajo demanda con import dinámico, así el usuario sólo descarga el
 * idioma que usa.
 *
 * Los archivos en ./locales/<lang>.js los genera scripts/splitTranslations.mjs.
 */
import { SUPPORTED_LANGUAGES } from './locales/index.js'

export { SUPPORTED_LANGUAGES }

export const DEFAULT_LANGUAGE = 'en'

// import.meta.glob hace que Vite emita un chunk independiente por cada locale.
const loaders = import.meta.glob('./locales/*.js')

/**
 * Carga (dinámicamente) el diccionario de un idioma. Cae a inglés si el locale
 * pedido no existe.
 * @param {string} lang
 * @returns {Promise<Record<string,string>>}
 */
export function loadMessages(lang) {
  const key = `./locales/${lang}.js`
  const loader = loaders[key] || loaders[`./locales/${DEFAULT_LANGUAGE}.js`]
  return loader().then((mod) => mod.default)
}

/**
 * Determina el idioma inicial: preferencia manual guardada > idioma del
 * navegador soportado > inglés. Replica la lógica que vivía en LanguageContext.
 * @returns {string}
 */
export function getInitialLanguage() {
  try {
    const manuallySet = localStorage.getItem('languageManuallySet')
    if (manuallySet === 'true') {
      const saved = localStorage.getItem('language')
      if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved
    }
  } catch {
    // localStorage puede no estar disponible (SSR, modo privado estricto)
  }

  const browserLanguages =
    (typeof navigator !== 'undefined' &&
      (navigator.languages || [navigator.language || navigator.userLanguage])) ||
    []

  for (const lang of browserLanguages) {
    if (!lang) continue
    const base = lang.split('-')[0].toLowerCase()
    if (SUPPORTED_LANGUAGES.includes(base)) return base
  }

  return DEFAULT_LANGUAGE
}
