/**
 * HTML OG/Twitter para crawlers — generado en Cloudflare Pages Functions.
 * Usa JSON público de la API cuando /api/og/* aún devuelve marca legacy.
 */

import {
  BRAND_NAME,
  SEO_DEFAULT_TITLE,
  SEO_DEFAULT_DESCRIPTION,
  videoDescription,
  profileDescription,
  creatorBioFallback,
  assertNoLegacyBrand,
} from './seoBrand.js';

export const API_BASE = 'https://api.teleprt.com';
export const SITE_URL = 'https://teleprt.com';
export const SITE_NAME = BRAND_NAME;

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

export function profilePath(slug) {
  const clean = String(slug || '').replace(/^@+/, '').trim();
  return clean ? `${SITE_URL}/@${encodeURIComponent(clean)}` : SITE_URL;
}

export function buildDefaultOgHtml() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${SEO_DEFAULT_TITLE}</title>
  <meta name="description" content="${SEO_DEFAULT_DESCRIPTION}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${SEO_DEFAULT_TITLE}" />
  <meta property="og:description" content="${SEO_DEFAULT_DESCRIPTION}" />
  <meta property="og:image" content="${SITE_URL}/logo-icon.png" />
  <meta property="og:url" content="${SITE_URL}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@teleprt" />
  <meta name="twitter:title" content="${SEO_DEFAULT_TITLE}" />
  <meta name="twitter:description" content="${SEO_DEFAULT_DESCRIPTION}" />
  <meta name="twitter:image" content="${SITE_URL}/logo-icon.png" />
  <meta http-equiv="refresh" content="0;url=${SITE_URL}" />
</head>
<body>
  <h1>${SITE_NAME}</h1>
  <p>${SEO_DEFAULT_DESCRIPTION}</p>
  <a href="${SITE_URL}">Go to ${SITE_NAME}</a>
</body>
</html>`;
  assertNoLegacyBrand(html);
  return html;
}

export function buildVideoOgHtml(video, channel = null) {
  const title = escapeHtml(video.title || 'Video');
  const description = escapeHtml(
    (video.description || videoDescription(video.title)).substring(0, 200)
  );
  const thumbnail = escapeHtml(video.imgUrl || `${SITE_URL}/logo-icon.png`);
  const pageUrl = `${SITE_URL}/video/${video._id}`;
  const embedUrl = escapeHtml(video.hlsMasterUrl || video.videoUrl || '');
  const channelName = escapeHtml(channel?.name || 'Creator');
  const channelSlug = channel?.slug || channel?._id;
  const channelUrl = channelSlug ? profilePath(channelSlug) : SITE_URL;
  const uploadDate = video.createdAt
    ? new Date(video.createdAt).toISOString()
    : new Date().toISOString();

  const durationISO = video.duration
    ? `PT${Math.floor(video.duration / 60)}M${Math.floor(video.duration % 60)}S`
    : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title || 'Video',
    description: video.description || videoDescription(video.title),
    thumbnailUrl: [video.imgUrl || `${SITE_URL}/logo-icon.png`],
    uploadDate,
    contentUrl: video.hlsMasterUrl || video.videoUrl || '',
    embedUrl: video.hlsMasterUrl || video.videoUrl || '',
    url: pageUrl,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: video.views || 0,
    },
    author: {
      '@type': 'Person',
      name: channel?.name || 'Creator',
      url: channelUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-icon.png` },
    },
    ...(durationISO && { duration: durationISO }),
    ...(video.tags?.length && { keywords: video.tags.join(', ') }),
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title} | ${SITE_NAME}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${pageUrl}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:type" content="video.other" />
  <meta property="og:title" content="${title} | ${SITE_NAME}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${thumbnail}" />
  <meta property="og:image:width" content="1280" />
  <meta property="og:image:height" content="720" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:locale" content="en_US" />
  ${embedUrl ? `<meta property="og:video" content="${embedUrl}" />` : ''}
  ${embedUrl ? '<meta property="og:video:type" content="application/x-mpegURL" />' : ''}
  <meta property="article:author" content="${channelName}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@teleprt" />
  <meta name="twitter:title" content="${title} | ${SITE_NAME}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${thumbnail}" />
  <meta name="twitter:image:alt" content="${title}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p>By ${channelName}</p>
  <img src="${thumbnail}" alt="${title}" />
  <a href="${pageUrl}">Watch on ${SITE_NAME}</a>
</body>
</html>`;
  assertNoLegacyBrand(html);
  return html;
}

export function buildProfileOgHtml(user) {
  const name = escapeHtml(user.name || 'User');
  const description = escapeHtml(
    (user.descriptionAccount || profileDescription(user.name, user.follows || 0)).substring(0, 200)
  );
  const profileImage = escapeHtml(user.img || `${SITE_URL}/logo-icon.png`);
  const profileUrl = profilePath(user.slug || user._id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name || 'User',
    url: profileUrl,
    image: user.img || `${SITE_URL}/logo-icon.png`,
    description: user.descriptionAccount || creatorBioFallback(),
    ...(user.follows && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: { '@type': 'FollowAction' },
        userInteractionCount: user.follows,
      },
    }),
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${name} | ${SITE_NAME}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${profileUrl}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="${name} | ${SITE_NAME}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${profileImage}" />
  <meta property="og:url" content="${profileUrl}" />
  <meta property="og:locale" content="en_US" />
  <meta property="profile:username" content="${escapeHtml(user.slug || user.name)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content="@teleprt" />
  <meta name="twitter:title" content="${name} | ${SITE_NAME}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${profileImage}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <meta http-equiv="refresh" content="0;url=${profileUrl}" />
</head>
<body>
  <h1>${name}</h1>
  <p>${description}</p>
  <img src="${profileImage}" alt="${name}" />
  <a href="${profileUrl}">View profile on ${SITE_NAME}</a>
</body>
</html>`;
  assertNoLegacyBrand(html);
  return html;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'CloudflarePages-OGProxy/1.0' },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function buildOgHtmlFromPathname(pathname) {
  const videoMatch = pathname.match(/^\/video\/([a-f0-9]{24})$/i);
  if (videoMatch) {
    const video = await fetchJson(`${API_BASE}/api/videos/find/${videoMatch[1]}`);
    if (!video?._id) return null;
    let channel = null;
    if (video.userId) {
      channel = await fetchJson(`${API_BASE}/api/users/find/${encodeURIComponent(video.userId)}`);
    }
    return buildVideoOgHtml(video, channel);
  }

  const profileMatch =
    pathname.match(/^\/@([^/]+)$/) ||
    pathname.match(/^\/profileUser\/([^/]+)$/);
  if (profileMatch) {
    const slug = decodeURIComponent(profileMatch[1]);
    const user = await fetchJson(`${API_BASE}/api/users/find/${encodeURIComponent(slug)}`);
    if (!user?._id && !user?.slug) return null;
    return buildProfileOgHtml(user);
  }

  return null;
}

export function ogResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Vary': 'User-Agent',
    },
  });
}
