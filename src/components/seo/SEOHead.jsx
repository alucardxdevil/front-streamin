import React from 'react';
import { Helmet } from 'react-helmet-async';
import seoConfig, { buildWebsiteJsonLd } from '../../utils/seoConfig';
import { useLanguage } from '../../utils/LanguageContext';

/**
 * SEOHead — Metadatos base para cualquier página de teleprt.
 */
const SEOHead = ({
  title,
  description,
  canonical,
  image,
  type = 'website',
  noIndex = false,
  includeWebsiteSchema = false,
  children,
}) => {
  const { t } = useLanguage();

  const fullTitle = title
    ? `${title} | ${seoConfig.siteName}`
    : t('seoDefaultTitle');

  const metaDescription = description || t('seoDefaultDescription');
  const metaImage = image || seoConfig.defaultImage;
  const metaCanonical = canonical || seoConfig.siteUrl;
  const keywords = t('seoKeywords');

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={metaCanonical} />
      <meta name="theme-color" content={seoConfig.themeColor} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={seoConfig.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:alt" content={`${seoConfig.siteName} logo`} />
      <meta property="og:url" content={metaCanonical} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={seoConfig.locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={seoConfig.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:image:alt" content={`${seoConfig.siteName} logo`} />

      {includeWebsiteSchema && (
        <script type="application/ld+json">
          {JSON.stringify(buildWebsiteJsonLd(metaCanonical))}
        </script>
      )}

      {children}
    </Helmet>
  );
};

export default SEOHead;
