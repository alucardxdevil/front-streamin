import React from 'react';
import { Helmet } from 'react-helmet-async';
import seoConfig, { interpolateSeo } from '../../utils/seoConfig';
import { getPublicProfilePath } from '../../utils/profilePaths';
import { useLanguage } from '../../utils/LanguageContext';

const SEOProfileWrapper = ({ user, videoCount }) => {
  const { t } = useLanguage();
  if (!user) return null;

  const name = user.name || 'User';
  const fullTitle = `${name} | ${seoConfig.siteName}`;
  const followers = user.follows || 0;
  const bio = user.description || user.descriptionAccount;
  const description = bio
    ? bio.substring(0, 150)
    : interpolateSeo(t('seoProfileDescription'), { name, followers });
  const profileImage = user.img || seoConfig.defaultImage;
  const profileUrl = getPublicProfilePath(user, {
    absolute: true,
    siteUrl: seoConfig.siteUrl,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: profileUrl,
    image: profileImage,
    description: user.description || user.descriptionAccount || t('seoCreatorOnTeleprt'),
    ...(followers && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: { '@type': 'FollowAction' },
        userInteractionCount: followers,
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
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={profileUrl} />

      <meta property="og:site_name" content={seoConfig.siteName} />
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={profileImage} />
      <meta property="og:url" content={profileUrl} />
      <meta property="og:locale" content={seoConfig.locale} />
      <meta property="profile:username" content={user.slug || user.name} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content={seoConfig.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={profileImage} />

      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default SEOProfileWrapper;
