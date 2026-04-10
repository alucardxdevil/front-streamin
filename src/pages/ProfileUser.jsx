import React, { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { follows } from '../redux/userSlice';
import defaultProfile from '../img/profileUser.png'
import NotFound from './PageNotFOund';
import { FaTwitter, FaInstagram, FaFacebook, FaGlobe, FaSearchPlus } from 'react-icons/fa';
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
  padding-top: 0;
  background: ${({ theme }) => theme.bg || "#181818"};
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;

  @media (min-width: 769px) {
    flex-direction: row;
    min-height: calc(100vh - 60px);
  }
`;

const LeftImageContainer = styled.div`
  flex: 0.5;
  position: relative;
  overflow: hidden;
  min-height: 200px;
  display: flex;

  @media (max-width: 768px) {
    flex: none;
    width: 100%;
    min-height: 250px;
  }

  @media (min-width: 769px) {
    min-height: calc(100vh - 60px);
  }
`;

const LeftImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
  min-height: 200px;

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
  justify-content: flex-start;
  gap: 12px;
  padding: 28px 26px 24px;
  background:
    linear-gradient(165deg, rgba(11, 103, 220, 0.16), rgba(11, 103, 220, 0.03) 45%, rgba(20, 20, 20, 0.88) 100%),
    ${({ theme }) => theme.bgLighter || "rgba(30,30,30,0.85)"};
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin: 16px;
  box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.4);
  max-width: 640px;
  width: 100%;
  animation: ${fadeIn} 0.6s ease;
  max-height: calc(100vh - 92px);
  overflow-y: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.22);
    border-radius: 12px;
  }

  @media (max-width: 768px) {
    margin: -30px 16px 20px;
    padding: 20px 16px;
    max-height: none;
    overflow-y: visible;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 8px 0 4px;
  flex-wrap: wrap;
`;

const CardButton = styled.button`
  background: ${({ following, theme }) =>
    following
      ? theme.soft
      : "linear-gradient(135deg, rgba(11, 103, 220, 0.95), rgba(11, 103, 220, 0.75))"};
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 8px 14px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(11, 103, 220, 0.35);
  }
`;

const ProfileImage = styled.img`
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 4px solid rgba(11, 103, 220, 0.9);
  object-fit: cover;
  margin-top: 4px;
  box-shadow:
    0 0 0 5px rgba(11, 103, 220, 0.2),
    0 10px 24px rgba(11, 103, 220, 0.25);
  transition: transform 0.3s ease;
  cursor: zoom-in;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    margin-top: 0;
  }

  &:hover {
    transform: scale(1.04);
  }
`;

const ProfileImageWrapper = styled.button`
  position: relative;
  border: 0;
  padding: 0;
  background: transparent;
  border-radius: 50%;
  cursor: zoom-in;

  &:hover > span {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const ProfileImageZoomHint = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ChannelDetail = styled.div`
  text-align: center;
  margin-bottom: 6px;
`;

const ChannelName = styled.h1`
  font-weight: 600;
  font-size: 27px;
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
  gap: 10px;
  margin: 6px 0 2px;
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
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03));
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 10px 16px;
  text-align: center;
  color: ${({ theme }) => theme.text || "#fff"};
  border: 1px solid rgba(255, 255, 255, 0.09);
  min-width: 100px;
  flex: 1;
  max-width: 180px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0px 8px 20px rgba(11, 103, 220, 0.25);
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
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 2px;
  color: #0b67dc;

  @media (max-width: 768px) {
    font-size: 20px;
    margin: 6px 0;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const StatLabel = styled.span`
  font-size: 12px;
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
  max-height: 190px;
  overflow-y: auto;
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  background: ${({ theme }) => theme.bg || "rgba(255,255,255,0.04)"};
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 16px;
  line-height: 1.7;
  font-weight: 500;
  color: ${({ theme }) => theme.text || "#e6e6e6"};
  box-shadow: inset 0px 2px 6px rgba(0, 0, 0, 0.25);

  @media (min-width: 1024px) {
    min-height: 230px;
    max-height: 320px;
    font-size: 16px;
    line-height: 1.7;
    padding: 18px;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 15px;
  }
`;

const SocialLinksContainer = styled.div`
  width: 100%;
  margin: 6px auto 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
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

const ImagePreviewBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const PreviewProfileImage = styled.img`
  width: min(70vw, 460px);
  max-height: 78vh;
  border-radius: 20px;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
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
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const { t } = useLanguage();
  const isOwnProfile = Boolean(currentUser?._id && channel?._id && currentUser._id === channel._id);

  const handleSub = async () => {
    if (!currentUser) return;
    if (isOwnProfile) {
      navigate("/profile");
      return;
    }
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
        if (currentUser?._id && currentUser._id === channelRes.data._id) {
          navigate("/profile", { replace: true });
          return;
        }

        await axios.put(`/users/${path}/update-total-views`);

        // 2) Obtener el valor actualizado (GET)
        const viewsRes = await axios.get(`/users/${path}/total-views`);
        setTotalViews(viewsRes.data.totalViews || 0);
        
        // Obtener cantidad de videos del usuario
        try {
          const videosRes = await axios.get(`/videos/second/${path}`);
          setVideoCount(videosRes.data?.length || 0);
        } catch (err) {
          setVideoCount(0);
        }
      } catch (error) {
        console.error("Error fetching channel data:", error);
        setNotFound(true);
      }
    };
    fetchData();
  }, [path, currentUser?._id, navigate]);

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
          <ProfileImageWrapper onClick={() => setShowProfilePreview(true)} aria-label="Preview profile image">
            <ProfileImage
              src={channel.img || defaultProfile}
              alt="Profile"
            />
            <ProfileImageZoomHint>
              <FaSearchPlus />
            </ProfileImageZoomHint>
          </ProfileImageWrapper>
          <ButtonContainer>
            {isOwnProfile ? (
              <CardButton following={false} onClick={() => navigate("/profile")}>
                {t("myProfile")}
              </CardButton>
            ) : (
              <CardButton
                following={currentUser?.followsProfile.includes(channel._id)}
                onClick={handleSub}
              >
                {currentUser?.followsProfile.includes(channel._id)
                  ? t("following")
                  : t("follow")}
              </CardButton>
            )}

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

      {showProfilePreview && (
        <ImagePreviewBackdrop onClick={() => setShowProfilePreview(false)}>
          <PreviewProfileImage
            src={channel.img || defaultProfile}
            alt="Profile Preview"
            onClick={(e) => e.stopPropagation()}
          />
        </ImagePreviewBackdrop>
      )}
    </>
  );
};
