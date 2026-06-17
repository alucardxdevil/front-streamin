/**
 * Configuración centralizada de SEO para teleprt.
 */

import { SITE_URL, API_URL } from './env'
import {
  BRAND_NAME,
  BRAND_DOMAIN,
  TWITTER_HANDLE,
  SEO_DEFAULT_TITLE,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_KEYWORDS,
} from '../../shared/seoBrand.js'

const seoConfig = {
  siteName: BRAND_NAME,
  siteUrl: SITE_URL,
  apiUrl: API_URL,
  defaultTitle: SEO_DEFAULT_TITLE,
  defaultDescription: SEO_DEFAULT_DESCRIPTION,
  defaultKeywords: SEO_DEFAULT_KEYWORDS,
  defaultImage: `${SITE_URL}/logo-icon.png`,
  twitterHandle: TWITTER_HANDLE,
  locale: 'en_US',
  themeColor: '#0d0d0d',
}

export { BRAND_NAME, BRAND_DOMAIN, TWITTER_HANDLE }

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
