import React from 'react';
import { Helmet } from 'react-helmet-async';
import seoConfig from '../../utils/seoConfig';

/**
 * SEOHead — Componente base de metadatos para cualquier página.
 *
 * Inyecta <title>, meta description, canonical, Open Graph y Twitter Cards.
 * Cada página puede sobreescribir los valores por defecto pasando props.
 *
 * @param {string}  title       — Título de la página (se concatena con el siteName).
 * @param {string}  description — Meta description (máx. ~160 caracteres).
 * @param {string}  canonical   — URL canónica de la página.
 * @param {string}  image       — URL de la imagen para Open Graph / Twitter.
 * @param {string}  type        — og:type (website, article, video.other, profile).
 * @param {boolean} noIndex     — Si true, agrega robots noindex.
 * @param {React.ReactNode} children — Etiquetas <meta> adicionales.
 */
const SEOHead = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  noIndex = false,
  children,
}) => {
  const fullTitle = title
    ? `${title} | ${seoConfig.siteName}`
    : seoConfig.defaultTitle;

  const metaDescription = description || seoConfig.defaultDescription;
  const metaImage = image || seoConfig.defaultImage;
  const metaCanonical = canonical || seoConfig.siteUrl;

  return (
    <Helmet>
      {/* ── Básicos ─────────────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaCanonical} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* ── Open Graph ──────────────────────────────────────────── */}
      <meta property="og:site_name" content={seoConfig.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaCanonical} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={seoConfig.locale} />

      {/* ── Twitter Cards ───────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={seoConfig.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {children}
    </Helmet>
  );
};

export default SEOHead;
