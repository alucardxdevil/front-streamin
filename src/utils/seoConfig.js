/**
 * Configuración centralizada de SEO para stream-in.
 *
 * Todas las URLs base, nombres de sitio y valores por defecto
 * se definen aquí para evitar duplicación en los componentes SEO.
 */

const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://stream-in.com';
const API_URL  = process.env.REACT_APP_API_URL  || 'https://api.stream-in.com';

const seoConfig = {
  siteName: 'stream-in',
  siteUrl: SITE_URL,
  apiUrl: API_URL,
  defaultTitle: 'stream-in — Share and discover videos',
  defaultDescription:
    'stream-in is the platform for uploading, sharing, and discovering videos from independent creators. Explore trends, follow your favorite creators, and enjoy high-quality content.',
  defaultImage: `${SITE_URL}/logo-pest.jpg`,
  twitterHandle: '@streamin',
  locale: 'en_US',
};

export default seoConfig;
