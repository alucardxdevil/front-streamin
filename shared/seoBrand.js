/**
 * Marca y plantillas SEO (frontend + Cloudflare Pages Functions).
 * Copia en sync con /shared/seoBrand.js del monorepo (servidor API).
 */

export const BRAND_NAME = 'teleprt'
export const BRAND_DOMAIN = 'teleprt.com'
export const TWITTER_HANDLE = '@teleprt'

export const SEO_DEFAULT_TITLE = `${BRAND_NAME} — Watch, share and create videos`
export const SEO_DEFAULT_DESCRIPTION =
  `${BRAND_NAME} is the beta video platform to upload, share and discover content from independent creators. Explore trends at ${BRAND_DOMAIN}.`

export const SEO_DEFAULT_KEYWORDS =
  `${BRAND_NAME}, ${BRAND_DOMAIN}, videos, creators, streaming, video platform`

export function videoDescription(title) {
  return `Watch "${title || 'Video'}" on ${BRAND_NAME} — videos from independent creators.`
}

export function profileDescription(name, followers = 0) {
  return `Profile of ${name || 'User'} on ${BRAND_NAME}. ${followers} followers.`
}

export function profileDescriptionNoBio(followers = 0) {
  return `Content creator on ${BRAND_NAME}. ${followers} followers.`
}

export function creatorBioFallback() {
  return `Content creator on ${BRAND_NAME}`
}

/** Valida que no queden referencias legacy en HTML OG generado */
export function assertNoLegacyBrand(html) {
  const legacy = ['stream-in', 'Stream-In', 'stream-in.com']
  const found = legacy.filter((term) => html.includes(term))
  if (found.length) {
    throw new Error(`Legacy brand found in OG HTML: ${found.join(', ')}`)
  }
}
