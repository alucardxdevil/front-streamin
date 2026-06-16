import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../utils/LanguageContext';
import SEOHead from './SEOHead';

/** Metadatos SEO por ruta pública de la SPA */
const ROUTE_SEO = [
  { match: /^\/$/, titleKey: null, descriptionKey: null },
  { match: /^\/trends$/, titleKey: 'seoTrendsTitle', descriptionKey: 'seoTrendsDescription' },
  { match: /^\/us$/, titleKey: 'seoUsTitle', descriptionKey: 'seoUsDescription' },
  { match: /^\/help$/, titleKey: 'seoHelpTitle', descriptionKey: 'seoHelpDescription' },
  { match: /^\/terms$/, titleKey: 'seoTermsTitle', descriptionKey: 'seoTermsDescription' },
  { match: /^\/contact$/, titleKey: 'seoContactTitle', descriptionKey: 'seoContactDescription' },
  { match: /^\/support$/, titleKey: 'seoSupportTitle', descriptionKey: 'seoSupportDescription' },
  { match: /^\/advertise$/, titleKey: 'seoAdvertiseTitle', descriptionKey: 'seoAdvertiseDescription' },
  { match: /^\/signin$/, titleKey: 'seoSignInTitle', descriptionKey: 'seoSignInDescription', noIndex: true },
  { match: /^\/register$/, titleKey: 'seoRegisterTitle', descriptionKey: 'seoRegisterDescription', noIndex: true },
  { match: /^\/settings$/, titleKey: 'settings', descriptionKey: 'settingsSubtitle', noIndex: true },
  { match: /^\/profile$/, titleKey: 'myProfile', descriptionKey: 'seoDefaultDescription', noIndex: true },
  { match: /^\/search$/, titleKey: 'search', descriptionKey: 'seoDefaultDescription', noIndex: true },
  { match: /^\/playlist-player\//, titleKey: 'seoPlaylistTitle', descriptionKey: 'seoDefaultDescription' },
  { match: /^\/playlist\//, titleKey: 'seoPlaylistTitle', descriptionKey: 'seoDefaultDescription' },
];

function matchRoute(pathname) {
  return ROUTE_SEO.find(({ match }) => match.test(pathname));
}

/**
 * SEO dinámico según la ruta actual.
 * Video y perfil usan SEOVideoWrapper / SEOProfileWrapper (last wins).
 */
const RouteSEO = () => {
  const { pathname } = useLocation();
  const { t } = useLanguage();

  const config = useMemo(() => {
    // Rutas con SEO dedicado en componentes hijos
    if (/^\/video\/[a-f0-9]{24}$/i.test(pathname)) return null;
    if (/^\/@[^/]+$/.test(pathname) || /^\/profileUser\//.test(pathname)) return null;
    if (/^\/playlist-player\//.test(pathname)) return null;

    const route = matchRoute(pathname);
    if (!route) {
      return { noIndex: pathname !== '/' };
    }

    return {
      title: route.titleKey ? t(route.titleKey) : undefined,
      description: route.descriptionKey ? t(route.descriptionKey) : undefined,
      noIndex: route.noIndex,
      includeWebsiteSchema: pathname === '/',
    };
  }, [pathname, t]);

  if (config === null) return null;

  return (
    <SEOHead
      title={config.title}
      description={config.description}
      noIndex={config.noIndex}
      includeWebsiteSchema={config.includeWebsiteSchema}
    />
  );
};

export default RouteSEO;
