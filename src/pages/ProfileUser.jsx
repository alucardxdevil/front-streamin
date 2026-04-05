import React, { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { follows } from '../redux/userSlice';
import defaultProfile from '../img/profileUser.png'
import NotFound from './PageNotFOund';
import { FaTwitter, FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../utils/LanguageContext';
import SEOProfileWrapper from '../components/seo/SEOProfileWrapper';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 60px;
  background: ${({ theme }) => theme.bg || "#181818"};
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;

  @media (min-width: 769px) {
    flex-direction: row;
  }
`;

const LeftImageContainer = styled.div`
  flex: 0.5;
  position: relative;
  overflow: hidden;
  min-height: 200px;

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
    min-height: 250px;
  }
`;

const LeftImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
  min-height: 200px;

  @media (max-width: 1366px) {
    width: 650px;
    height: 650px;
  }

  @media (max-width: 768px) {
    height: 250px;
  }
`;

const ContentContainer = styled.div`
  flex: 0.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 24px;
  background: ${({ theme }) => theme.bgLighter || "rgba(30,30,30,0.85)"};
  backdrop-filter: blur(12px);
  border-radius: 20px;
  margin: auto;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.4);
  max-width: 600px;
  width: 100%;
  animation: ${fadeIn} 0.6s ease;

  @media (max-width: 768px) {
    margin: -30px 16px 20px;
    padding: 20px 16px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const CardButton = styled.button`
  background: ${({ following, theme }) =>
    following
      ? theme.soft
      : "linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%)"};
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: bold;
  color: ${({ theme }) => theme.text || "#fff"};
  border: none;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
  display: list-item;
  align-items: center;
  gap: 6px;

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 8px 14px;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(11, 103, 220, 0.4);
  }
`;

const ProfileImage = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.soft || "#333"};
  object-fit: cover;
  margin-top: -70px;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    margin-top: -50px;
  }

  &:hover {
    transform: scale(1.04);
  }
`;

const ChannelDetail = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const ChannelName = styled.h1`
  font-weight: 600;
  font-size: 25px;
  margin: 0;
  background: linear-gradient(135deg, #d1d1d1, #999);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;


const StatsContainer = styled.div`
  display: flex;
  gap: 5px;
  margin: 7px 0;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 768px) {
    gap: 16px;
    margin: 12px 0;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 3px 20px;
  text-align: center;
  color: ${({ theme }) => theme.text || "#fff"};
  min-width: 100px;
  flex: 1;
  max-width: 180px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 8px 20px rgba(0,0,0,0.4);
  }

  @media (max-width: 768px) {
    min-width: 80px;
    padding: 10px 14px;
    max-width: 140px;
  }

  @media (max-width: 480px) {
    min-width: 70px;
    padding: 8px 10px;
    max-width: 100px;
  }
`;

const StatNumber = styled.h1`
  font-size: 16px;
  font-weight: bold;
  margin: 8px 0;
  background: linear-gradient(90deg, #27f1ff, #00c2ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 20px;
    margin: 6px 0;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: #b0b0b0;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const DescriptionContainer = styled.div`
  max-height: 110px;
  overflow-y: auto;
  width: 85%;
  margin: 0 auto;
  padding: 12px;
  background: ${({ theme }) => theme.bg || "rgba(255,255,255,0.03)"};
  border-radius: 10px;
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.textSoft || "#bbb"};
  box-shadow: inset 0px 2px 6px rgba(0, 0, 0, 0.25);

  @media (max-width: 768px) {
    width: 100%;
    font-size: 14px;
  }
`;

const SocialLinksContainer = styled.div`
  width: 85%;
  margin: 20px auto 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px;
  }
`;

const SocialTitle = styled.h3`
  font-size: 16px;
  color: ${({ theme }) => theme.text || "#fff"};
  margin: 0 0 8px 0;
  font-weight: 500;
`;

const SocialLinksRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: ${({ theme }) => theme.text || "#fff"};
  font-size: 20px;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  ${({ platform }) => {
    switch (platform) {
      case 'twitter':
        return `&:hover { background: #1DA1F2; color: #fff; }`;
      case 'instagram':
        return `&:hover { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: #fff; }`;
      case 'facebook':
        return `&:hover { background: #4267B2; color: #fff; }`;
      case 'website':
        return `&:hover { background: #00c2ff; color: #fff; }`;
      default:
        return '';
    }
  }}
`;

const EmptySocialText = styled.p`
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  font-size: 14px;
  text-align: center;
  margin: 0;
`;

export const ProfileUser = () => {
  const [channel, setChannel] = useState({});
  const [totalViews, setTotalViews] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const { currentUser } = useSelector((state) => state.user);
  const { currentVideo } = useSelector((state) => state.video);
  const { slug } = useParams();
  const path = slug;
  const dispatch = useDispatch();
  const [notFound, setNotFound] = useState(false);
  const { t } = useLanguage();

  const handleSub = async () => {
    try {
      if (currentUser.followsProfile.includes(channel._id)) {
        await axios.put(`/users/unfol/${channel._id}`);
      } else {
        await axios.put(`/users/fol/${channel._id}`);
      }
      dispatch(follows(channel._id));
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const channelRes = await axios.get(`/users/find/${path}`);
        if (!channelRes.data || Object.keys(channelRes.data).length === 0) {
          setNotFound(true);
          return;
        }

        setChannel(channelRes.data);

        await axios.put(`/users/${path}/update-total-views`);

        // 2) Obtener el valor actualizado (GET)
        const viewsRes = await axios.get(`/users/${path}/total-views`);
        setTotalViews(viewsRes.data.totalViews || 0);
        
        // Obtener cantidad de videos del usuario
        try {
          const videosRes = await axios.get(`/videos/second/${path}`);
          setVideoCount(videosRes.data?.length || 0);
        } catch (err) {
          console.log("No videos found for user");
          setVideoCount(0);
        }
      } catch (error) {
        console.error("Error fetching channel data:", error);
        setNotFound(true);
      }
    };
    fetchData();
  }, [path]);

  if (notFound) return <NotFound />;

  if (!channel) return null;

  // Helper function to normalize URL - adds https:// if missing
  const normalizeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const socialLinks = channel.socialLinks || {};
  const hasSocialLinks = socialLinks.twitter || socialLinks.instagram || socialLinks.facebook || socialLinks.website;

  const leftImageUrl = channel.imgBanner;

  return (
    <>
      {/* SEO: metadatos dinámicos para perfil de usuario */}
      <SEOProfileWrapper user={channel} videoCount={videoCount} />

      <Container>
        <LeftImageContainer>
          <LeftImage
            src={
              leftImageUrl ||
              "https://f005.backblazeb2.com/file/streamin-videos/uploads/6958ed67bb26d62f7607e915/1775388233418-50c092e0-068d-40bd-bfcf-f3b3df9c960b.webp"
            }
            alt="Left Image"
          />
        </LeftImageContainer>

        <ContentContainer>
          <ProfileImage src={channel.img || defaultProfile} alt="Profile" />
          <ButtonContainer>
            <CardButton
              following={currentUser?.followsProfile.includes(channel._id)}
              onClick={handleSub}
            >
              {currentUser?.followsProfile.includes(channel._id)
                ? t("following")
                : t("follow")}
            </CardButton>

            <Link
              to={`/videosProfile/${channel.slug || channel._id}`}
              style={{ textDecoration: "none" }}
            >
              <CardButton>{t("filmLibrary")}</CardButton>
            </Link>
          </ButtonContainer>
          <ChannelDetail>
            <ChannelName>{channel.name}</ChannelName>
          </ChannelDetail>
          <StatsContainer>
            <StatCard>
              <StatNumber>{channel.follows?.toLocaleString() || 0}</StatNumber>
              <StatLabel>{t("followers")}</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{totalViews?.toLocaleString() || 0}</StatNumber>
              <StatLabel>{t("views")}</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{videoCount > 0 ? videoCount.toLocaleString() : t("noVideos")}</StatNumber>
              <StatLabel>{videoCount === 1 ? t("video") : t("videos")}</StatLabel>
            </StatCard>
          </StatsContainer>

          <DescriptionContainer>{channel.descriptionAccount}</DescriptionContainer>

          {hasSocialLinks && (
            <SocialLinksContainer>
              <SocialTitle>{t("socialNetworks")}</SocialTitle>
              <SocialLinksRow>
                {socialLinks.twitter && (
                  <SocialLink href={normalizeUrl(socialLinks.twitter)} target="_blank" platform="twitter" title="Twitter">
                    <FaTwitter />
                  </SocialLink>
                )}
                {socialLinks.instagram && (
                  <SocialLink href={normalizeUrl(socialLinks.instagram)} target="_blank" platform="instagram" title="Instagram">
                    <FaInstagram />
                  </SocialLink>
                )}
                {socialLinks.facebook && (
                  <SocialLink href={normalizeUrl(socialLinks.facebook)} target="_blank" platform="facebook" title="Facebook">
                    <FaFacebook />
                  </SocialLink>
                )}
                {socialLinks.website && (
                  <SocialLink href={normalizeUrl(socialLinks.website)} target="_blank" platform="website" title="Website">
                    <FaGlobe />
                  </SocialLink>
                )}
              </SocialLinksRow>
            </SocialLinksContainer>
          )}
        </ContentContainer>
      </Container>
    </>
  );
};
