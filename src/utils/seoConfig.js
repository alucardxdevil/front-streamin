/**
 * Configuración centralizada de SEO para teleprt.
 */

import { SITE_URL, API_URL } from './env'

export const BRAND_NAME = 'teleprt'
export const BRAND_DOMAIN = 'teleprt.com'
export const TWITTER_HANDLE = '@teleprt'

const seoConfig = {
  siteName: BRAND_NAME,
  siteUrl: SITE_URL,
  apiUrl: API_URL,
  defaultTitle: 'teleprt — Watch, share and create videos',
  defaultDescription:
    'teleprt is the beta video platform to upload, share and discover content from independent creators. Explore trends at teleprt.com.',
  defaultKeywords:
    'teleprt, teleprt.com, videos, creators, streaming, video platform',
  defaultImage: `${SITE_URL}/logo-icon.png`,
  twitterHandle: TWITTER_HANDLE,
  locale: 'en_US',
  themeColor: '#0d0d0d',
}

/** Sustituye ${var} en plantillas i18n de SEO */
export function interpolateSeo(template, vars = {}) {
  if (!template) return ''
  return String(template).replace(/\$\{(\w+)\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : ''
  )
}

/** JSON-LD WebSite + Organization para la home */
export function buildWebsiteJsonLd(siteUrl = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: BRAND_NAME,
        description: seoConfig.defaultDescription,
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: BRAND_NAME,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo-icon.png`,
        },
        sameAs: [
          `https://twitter.com/${TWITTER_HANDLE.replace('@', '')}`,
          `https://ko-fi.com/${BRAND_NAME}`,
        ],
      },
    ],
  }
}

export default seoConfig
