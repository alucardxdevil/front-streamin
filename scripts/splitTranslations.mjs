/**
 * Generador one-off: parte translations.js (un único objeto con 12 locales)
 * en módulos por idioma dentro de src/i18n/locales/<lang>.js.
 *
 * Cada archivo se genera COMPLETO: { ...en, ...locale } para que las claves
 * faltantes caigan a inglés igual que hacía el runtime anterior
 * (`translations[lang]?.[key] || translations["en"]?.[key] || key`). Así cada
 * locale es autocontenido y el provider sólo necesita cargar un chunk.
 *
 * Uso: node scripts/splitTranslations.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import translations from '../src/utils/translations.source.js'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', 'src', 'i18n', 'locales')
mkdirSync(outDir, { recursive: true })

const en = translations.en || {}
const langs = Object.keys(translations)

for (const lang of langs) {
  const merged = lang === 'en' ? { ...en } : { ...en, ...translations[lang] }
  const body = JSON.stringify(merged, null, 2)
  const content = `// Auto-generado por scripts/splitTranslations.mjs — NO editar a mano.\n// Fuente: src/utils/translations.source.js + localePatches.source.js\nexport default ${body}\n`
  writeFileSync(join(outDir, `${lang}.js`), content, 'utf8')
}

writeFileSync(
  join(outDir, 'index.js'),
  `// Auto-generado por scripts/splitTranslations.mjs — NO editar a mano.\nexport const SUPPORTED_LANGUAGES = ${JSON.stringify(langs)}\n`,
  'utf8',
)

console.log(`Generados ${langs.length} locales en ${outDir}:`, langs.join(', '))
