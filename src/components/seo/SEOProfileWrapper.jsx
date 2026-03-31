import React from 'react';
import { Helmet } from 'react-helmet-async';
import seoConfig from '../../utils/seoConfig';

/**
 * SEOProfileWrapper — Inyecta metadatos SEO para páginas de perfil de usuario.
 *
 * Incluye:
 *  • <title> dinámico con el nombre del usuario
 *  • Meta description con la bio del usuario
 *  • Open Graph (profile)
 *  • Twitter Cards
 *  • JSON-LD con esquema Person de Schema.org
 *
 * @param {Object} user       — Objeto del usuario/canal.
 * @param {number} videoCount — Cantidad de videos del usuario (opcional).
 */
const SEOProfileWrapper = ({ user, videoCount }) => {
  if (!user) return null;

  const name = user.name || 'User';
  const fullTitle = `${name} | ${seoConfig.siteName}`;
  const description = user.description
    ? user.description.substring(0, 150)
    : `Profile of ${name} on ${seoConfig.siteName}. ${user.follows || 0} followers.`;
  const profileImage = user.img || seoConfig.defaultImage;
  const profileUrl = user.slug
    ? `${seoConfig.siteUrl}/profileUser/${user.slug}`
    : `${seoConfig.siteUrl}/profileUser/${user._id}`;

  // ── JSON-LD: Person (Schema.org) ───────────────────────────────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: profileUrl,
    image: profileImage,
    description: user.description || `Content creator on ${seoConfig.siteName}`,
    ...(user.follows && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: { '@type': 'FollowAction' },
        userInteractionCount: user.follows,
      },
    }),
    sameAs: [
      user.twitter && `https://twitter.com/${user.twitter}`,
      user.instagram && `https://instagram.com/${user.instagram}`,
      user.facebook && `https://facebook.com/${user.facebook}`,
      user.website,
    ].filter(Boolean),
  };

  return (
    <Helmet>
      {/* ── Básicos ─────────────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={profileUrl} />

      {/* ── Open Graph ──────────────────────────────────────────── */}
      <meta property="og:site_name" content={seoConfig.siteName} />
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={profileImage} />
      <meta property="og:url" content={profileUrl} />
      <meta property="og:locale" content={seoConfig.locale} />
      <meta property="profile:username" content={user.slug || user.name} />

      {/* ── Twitter Cards ───────────────────────────────────────── */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content={seoConfig.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={profileImage} />

      {/* ── JSON-LD: Datos Estructurados ────────────────────────── */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default SEOProfileWrapper;
