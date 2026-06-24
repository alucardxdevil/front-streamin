/**
 * Valida que el generador OG de Cloudflare Functions use marca teleprt.
 * Simula lo que verán crawlers cuando la API aún devuelve stream-in.
 *
 * Uso: node scripts/validate-crawler-og.js
 */
import { buildDefaultOgHtml, buildOgHtmlFromPathname } from '../functions/ogHtml.js';
import { assertNoLegacyBrand, BRAND_NAME } from '../functions/seoBrand.js';

const SAMPLE_VIDEO_PATH = '/video/6a18daeb79898133f950b6ac';
const SAMPLE_PROFILE_PATH = '/@test1';

function check(label, html) {
  if (!html) throw new Error('empty HTML');
  assertNoLegacyBrand(html);
  if (!html.includes(BRAND_NAME)) throw new Error(`missing "${BRAND_NAME}"`);
}

async function main() {
  check('default OG', buildDefaultOgHtml());
  check('video OG (JSON API)', await buildOgHtmlFromPathname(SAMPLE_VIDEO_PATH));
  check('profile OG (JSON API)', await buildOgHtmlFromPathname(SAMPLE_PROFILE_PATH));
  console.log('Crawler OG builder uses teleprt brand.');
}

main().catch((err) => {
  console.error('Crawler OG validation failed:', err.message);
  process.exit(1);
});
