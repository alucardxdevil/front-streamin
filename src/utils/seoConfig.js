/**
 * Configuración centralizada de SEO para stream-in.
 */

import { SITE_URL, API_URL } from './env'

const seoConfig = {
  siteName: 'stream-in',
  siteUrl: SITE_URL,
  apiUrl: API_URL,
  defaultTitle: 'stream-in — Share and discover videos',
  defaultDescription:
    'stream-in is the platform for uploading, sharing, and discovering videos from independent creators. Explore trends, follow your favorite creators, and enjoy high-quality content.',
  defaultImage: `${SITE_URL}/logo-pest.png`,
  twitterHandle: '@streamin',
  locale: 'en_US',
};

export default seoConfig;
