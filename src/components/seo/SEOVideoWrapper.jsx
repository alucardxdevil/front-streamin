import React from 'react';
import { Helmet } from 'react-helmet-async';
import seoConfig, { interpolateSeo } from '../../utils/seoConfig';
import { getPublicProfilePath } from '../../utils/profilePaths';
import { useLanguage } from '../../utils/LanguageContext';

const SEOVideoWrapper = ({ video, channel }) => {
  const { t } = useLanguage();
  if (!video) return null;

  const title = video.title || 'Video';
  const fullTitle = `${title} | ${seoConfig.siteName}`;
  const description = video.description
    ? video.description.substring(0, 150)
    : interpolateSeo(t('seoVideoDescription'), { title });
  const thumbnailUrl = video.imgUrl || seoConfig.defaultImage;
  const videoPageUrl = `${seoConfig.siteUrl}/video/${video._id}`;
  const embedUrl = video.hlsMasterUrl || video.videoUrl || '';
  const uploadDate = video.createdAt
    ? new Date(video.createdAt).toISOString()
    : new Date().toISOString();
  const channelName = channel?.name || t('seoCreatorLabel');
  const channelUrl = channel
    ? getPublicProfilePath(channel, { absolute: true, siteUrl: seoConfig.siteUrl })
    : seoConfig.siteUrl;

  const durationISO = video.duration
    ? `PT${Math.floor(video.duration / 60)}M${Math.floor(video.duration % 60)}S`
    : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: video.description || description,
    thumbnailUrl: [thumbnailUrl],
    uploadDate,
    contentUrl: embedUrl,
    embedUrl,
    url: videoPageUrl,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'WatchAction' },
      userInteractionCount: video.views || 0,
    },
    author: {
      '@type': 'Person',
      name: channelName,
      url: channelUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: seoConfig.defaultImage,
      },
    },
    ...(durationISO && { duration: durationISO }),
    ...(video.tags?.length && { keywords: video.tags.join(', ') }),
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={videoPageUrl} />

      <meta property="og:site_name" content={seoConfig.siteName} />
      <meta property="og:type" content="video.other" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={thumbnailUrl} />
      <meta property="og:image:width" content="1280" />
      <meta property="og:image:height" content="720" />
      <meta property="og:url" content={videoPageUrl} />
      <meta property="og:locale" content={seoConfig.locale} />
      {embedUrl && <meta property="og:video" content={embedUrl} />}
      {embedUrl && <meta property="og:video:type" content="application/x-mpegURL" />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={seoConfig.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={thumbnailUrl} />
      <meta name="twitter:image:alt" content={title} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default SEOVideoWrapper;
