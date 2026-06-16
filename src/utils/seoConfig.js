/**
 * Configuración centralizada de SEO para teleprt.
 */

import { SITE_URL, API_URL } from './env'

const seoConfig = {
  siteName: 'teleprt',
  siteUrl: SITE_URL,
  apiUrl: API_URL,
  defaultTitle: 'teleprt — Share and discover videos',
  defaultDescription:
    'teleprt is the platform for uploading, sharing, and discovering videos from independent creators. Explore trends, follow your favorite creators, and enjoy high-quality content.',
  defaultImage: `${SITE_URL}/logo-icon.png`,
  twitterHandle: '@teleprt',
  locale: 'en_US',
};

export default seoConfig;
