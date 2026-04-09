/**
 * Cloudflare Pages Function — Crawler-Aware Meta Tag Injection + Soft 404 Fix
 *
 * Este middleware intercepta TODAS las peticiones entrantes a Cloudflare Pages.
 *
 * Funcionalidades:
 * 1. CRAWLERS + CONTENIDO DINÁMICO: Si detecta un crawler en una URL de video
 *    o perfil, obtiene HTML con meta tags OG/Twitter pre-renderizados del servidor.
 * 2. CRAWLERS + RUTAS DESCONOCIDAS: Si detecta un crawler en una ruta que NO
 *    es una ruta válida de la SPA, devuelve un 404 real (corrige Soft 404).
 * 3. USUARIOS NORMALES: Deja pasar la petición al asset estático (SPA de React).
 *
 * Esto resuelve:
 * - Miniaturas no aparecen al compartir en redes sociales
 * - "Soft 404" en Google Search Console
 * - "Rastreada: actualmente sin indexar" para contenido dinámico
 */

// ── Configuración ──────────────────────────────────────────────────────────────

const API_BASE = 'https://api.stream-in.com';
const SITE_URL = 'https://stream-in.com';
const SITE_NAME = 'stream-in';

// User-Agent patterns de crawlers conocidos
const CRAWLER_PATTERNS = [
  // Redes sociales
  'facebookexternalhit',   // Facebook (Open Graph scraper)
  'Facebot',               // Facebook
  'LinkedInBot',           // LinkedIn
  'Twitterbot',            // Twitter/X
  'WhatsApp',              // WhatsApp
  'TelegramBot',           // Telegram
  'Discordbot',            // Discord
  'Slackbot',              // Slack
  'vkShare',               // VKontakte
  'PinterestBot',          // Pinterest
  'Applebot',              // Apple (iMessage link previews)
  'Embedly',               // Embed.ly
  'Quora Link Preview',    // Quora
  'Showyoubot',            // Showyou
  'outbrain',              // Outbrain
  'W3C_Validator',         // W3C validator
  'redditbot',             // Reddit
  'SkypeUriPreview',       // Skype
  'Viber',                 // Viber
  'Line',                  // Line messenger
  // Motores de búsqueda
  'Googlebot',
  'bingbot',
  'YandexBot',
  'DuckDuckBot',
  'Baiduspider',
  'Sogou',
  'ia_archiver',
];

const CRAWLER_REGEX = new RegExp(CRAWLER_PATTERNS.join('|'), 'i');

// ── Rutas válidas de la SPA ────────────────────────────────────────────────────

/**
 * Patrones de rutas válidas de la aplicación React.
 * Si un crawler accede a una ruta que NO coincide con ninguno de estos patrones,
 * se devuelve un 404 real en lugar del index.html con status 200 (Soft 404).
 */
const VALID_ROUTE_PATTERNS = [
  /^\/$/,                                    // Home
  /^\/trends$/,                              // Tendencias
  /^\/likes$/,                               // Likes (requiere auth, pero ruta válida)
  /^\/following$/,                           // Siguiendo
  /^\/search$/,                              // Búsqueda
  /^\/trend$/,                               // Trend
  /^\/signin$/,                              // Login
  /^\/register$/,                            // Registro
  /^\/profile$/,                             // Perfil propio
  /^\/myvideos$/,                            // Mis videos
  /^\/videosProfile\/[^/]+$/,                // Videos de un perfil
  /^\/contact$/,                             // Contacto
  /^\/support$/,                             // Soporte
  /^\/us$/,                                  // Nosotros
  /^\/terms$/,                               // Términos
  /^\/help$/,                                // Ayuda
  /^\/advertise$/,                           // Anunciate
  /^\/settings$/,                            // Configuración
  /^\/profileUser\/[^/]+$/,                  // Perfil de usuario
  /^\/video\/[a-f0-9]{24}$/i,               // Video (MongoDB ObjectId)
  /^\/history\/[^/]+$/,                      // Historial
  /^\/playlist\/[^/]+\/[^/]+$/,             // Detalle de playlist
  /^\/playlist-player\/[^/]+\/[^/]+$/,      // Reproductor de playlist
];

function isValidRoute(pathname) {
  return VALID_ROUTE_PATTERNS.some(pattern => pattern.test(pathname));
}

// ── Endpoint OG dinámico ───────────────────────────────────────────────────────

function getOgEndpoint(pathname) {
  // /video/:id → /api/og/video/:id
  const videoMatch = pathname.match(/^\/video\/([a-f0-9]{24})$/i);
  if (videoMatch) {
    return `${API_BASE}/api/og/video/${videoMatch[1]}`;
  }

  // /profileUser/:slug → /api/og/profile/:slug
  const profileMatch = pathname.match(/^\/profileUser\/([^/]+)$/);
  if (profileMatch) {
    return `${API_BASE}/api/og/profile/${encodeURIComponent(profileMatch[1])}`;
  }

  return null;
}

// ── HTML de 404 para crawlers ──────────────────────────────────────────────────

function build404Html(pathname) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Page Not Found | ${SITE_NAME}</title>
  <meta name="description" content="The page you are looking for does not exist on ${SITE_NAME}." />
  <meta name="robots" content="noindex, nofollow" />
  <meta property="og:title" content="Page Not Found | ${SITE_NAME}" />
  <meta property="og:description" content="The page you are looking for does not exist." />
  <meta property="og:image" content="${SITE_URL}/logo-pest.jpg" />
  <meta property="og:url" content="${SITE_URL}" />
  <link rel="canonical" href="${SITE_URL}" />
</head>
<body>
  <h1>404 — Page Not Found</h1>
  <p>The page <code>${pathname}</code> does not exist on ${SITE_NAME}.</p>
  <a href="${SITE_URL}">Go to homepage</a>
</body>
</html>`;
}

// ── Handler principal ──────────────────────────────────────────────────────────

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  const pathname = url.pathname;

  // 1. Solo interceptar GETs (crawlers solo hacen GET)
  if (request.method !== 'GET') {
    return next();
  }

  // 2. Proxy del sitemap dinámico desde el servidor API
  //    Esto permite que el sitemap esté accesible en https://stream-in.com/sitemap.xml
  //    (mismo dominio) además de https://api.stream-in.com/sitemap.xml
  if (pathname === '/sitemap.xml') {
    try {
      const sitemapResponse = await fetch(`${API_BASE}/sitemap.xml`, {
        headers: { 'Accept': 'application/xml' },
        signal: AbortSignal.timeout(10000),
      });
      if (sitemapResponse.ok) {
        const xml = await sitemapResponse.text();
        return new Response(xml, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
          },
        });
      }
    } catch (err) {
      console.error(`Error proxying sitemap: ${err.message}`);
    }
    // Fallback: dejar que Cloudflare sirva un sitemap estático si existe
    return next();
  }

  // 3. No interceptar assets estáticos (JS, CSS, imágenes, fuentes, etc.)
  if (/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot|map|json|txt)$/i.test(pathname)) {
    return next();
  }

  // 4. Verificar si es un crawler
  const isCrawler = CRAWLER_REGEX.test(userAgent);
  if (!isCrawler) {
    // Usuario normal → servir SPA
    return next();
  }

  // ── A partir de aquí: ES UN CRAWLER ──────────────────────────────────────

  // 5. Si es una ruta con contenido dinámico, obtener HTML con meta tags del servidor
  const ogEndpoint = getOgEndpoint(pathname);
  if (ogEndpoint) {
    try {
      const ogResponse = await fetch(ogEndpoint, {
        headers: {
          'User-Agent': 'CloudflarePages-OGProxy/1.0',
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (ogResponse.ok) {
        const html = await ogResponse.text();
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
            'Vary': 'User-Agent',
          },
        });
      }

      // Si el recurso no existe en el servidor (404), devolver 404 al crawler
      if (ogResponse.status === 404) {
        return new Response(build404Html(pathname), {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
            'Vary': 'User-Agent',
          },
        });
      }

      // Otros errores del servidor → fallback a SPA
      console.error(`OG endpoint returned ${ogResponse.status} for ${ogEndpoint}`);
      return next();
    } catch (err) {
      console.error(`Error fetching OG: ${err.message}`);
      return next();
    }
  }

  // 6. Para rutas estáticas válidas de la SPA, dejar pasar al index.html
  if (isValidRoute(pathname)) {
    return next();
  }

  // 7. Ruta NO válida + es un crawler → 404 real (corrige Soft 404)
  return new Response(build404Html(pathname), {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'Vary': 'User-Agent',
    },
  });
}
