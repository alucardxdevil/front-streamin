import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { 
  FaFireAlt, 
  FaGlobeAmericas, 
  FaHeart, 
  FaStar, 
  FaUsers,
  FaClock,
  FaArrowRight,
  FaBullhorn
} from "react-icons/fa";
import { MdCampaign } from "react-icons/md";
import { Link } from "react-router-dom";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import Card from "../components/Card";
import { VideoCardGrid, VideoCardSkeleton } from "../components/VideoCardGrid";
import { useLanguage } from "../utils/LanguageContext";
import { getPublicProfilePath } from "../utils/profilePaths";
import defaultProfile from '../img/profileUser.png';

// Animaciones
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const adShimmer = keyframes`
  0% {
    background-position: -400% 0;
  }
  100% {
    background-position: 400% 0;
  }
`;

// Contenedor principal
const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.bg};
  min-height: 100vh;
  padding-top: 0;
  
  @media (max-width: 768px) {
    padding: 10px;
    padding-top: 0;
  }
`;

// Header con gradiente
const HeaderSection = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    ${({ theme }) => theme.soft} 50%,
    ${({ theme }) => theme.bgLighter} 100%
  );
  border-radius: 24px 24px 0 0;
  padding: 40px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 62, 108, 0.1), 
      transparent
    );
    animation: ${shimmer} 3s infinite;
  }
  
  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 16px 16px 0 0;
  }
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff3e6c 0%, #0b67dc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;

  svg {
    font-size: 40px;
    color: #ff3e6c;
    -webkit-text-fill-color: initial;
    animation: ${pulse} 2s infinite;
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
    svg {
      font-size: 28px;
    }
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.textSoft};
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const HeaderWrapper = styled.div`
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const SecondaryAdBanner = styled.div`
  width: 100%;
  height: 100px;
  margin-top: 0;
  margin-bottom: 0;
  border-radius: 0 0 24px 24px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.soft} 0%,
    ${({ theme }) => theme.bgLighter} 25%,
    rgba(11, 103, 220, 0.08) 50%,
    ${({ theme }) => theme.bgLighter} 75%,
    ${({ theme }) => theme.soft} 100%
  );
  background-size: 400% 100%;
  animation: ${adShimmer} 6s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px dashed ${({ theme }) => theme.textSoft};
  border-top: none;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(11, 103, 220, 0.5);
    background: linear-gradient(
      90deg,
      rgba(11, 103, 220, 0.05) 0%,
      rgba(11, 103, 220, 0.12) 50%,
      rgba(11, 103, 220, 0.05) 100%
    );
  }

  @media (max-width: 768px) {
    height: 72px;
    border-radius: 0 0 16px 16px;
    gap: 8px;
  }
`;

const AdBannerLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.textSoft};
  opacity: 0.6;
  position: absolute;
  top: 6px;
  right: 12px;

  @media (max-width: 768px) {
    font-size: 9px;
    top: 4px;
    right: 8px;
  }
`;

const AdBannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.textSoft};
  opacity: 0.7;

  svg {
    font-size: 22px;
    color: #0b67dc;
    opacity: 0.8;
  }

  span {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  @media (max-width: 768px) {
    gap: 8px;
    svg {
      font-size: 18px;
    }
    span {
      font-size: 12px;
    }
  }
`;

// Secciones
const Section = styled.div`
  margin-bottom: 48px;
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${({ index }) => index * 0.1}s;
  animation-fill-mode: both;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    font-size: 24px;
    color: ${({ iconColor }) => iconColor || '#0b67dc'};
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    svg {
      font-size: 20px;
    }
  }
`;

const ViewAllLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0b67dc;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ff3e6c;
    gap: 12px;
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(4px);
  }
`;

// Sección de perfiles seguidos
const ProfilesSection = styled.div`
  margin-bottom: 48px;
`;

const ProfilesScroll = styled.div`
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding: 8px 0 16px 0;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.soft} transparent;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.soft};
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const ProfileCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 140px;
  padding: 24px 16px;
  background: linear-gradient(145deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    ${({ theme }) => theme.soft} 100%
  );
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(11, 103, 220, 0.2);
  }
`;

const ProfileAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #0b67dc;
  transition: all 0.3s ease;
  
  ${ProfileCard}:hover & {
    border-color: #ff3e6c;
    transform: scale(1.1);
  }
`;

const ProfileName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-align: center;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProfileFollowers = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    color: #ff3e6c;
  }
`;

const ProfileSkeleton = styled.div`
  min-width: 140px;
  height: 160px;
  border-radius: 20px;
  background: linear-gradient(90deg,
    ${({ theme }) => theme.soft} 25%,
    ${({ theme }) => theme.bgLighter} 50%,
    ${({ theme }) => theme.soft} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const NoDataMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 16px;
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  border: 2px dashed ${({ theme }) => theme.soft};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #ff3e6c;
  font-size: 16px;
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  border: 2px solid #ff3e6c;
  margin-bottom: 24px;
  
  h3 {
    margin-bottom: 12px;
    font-size: 18px;
  }
  
  p {
    color: ${({ theme }) => theme.textSoft};
    font-size: 14px;
  }
`;

function Trends({ }) {
  const { t } = useLanguage();
  const [worldTrends, setWorldTrends] = useState([]);
  const [mostLiked, setMostLiked] = useState([]);
  const [mostDisliked, setMostDisliked] = useState([]);
  const [topFollowedUsers, setTopFollowedUsers] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const [worldRes, mostLikedRes, mostDislikedRes, topFollowedRes, recentRes] = await Promise.all([
          axios.get("/videos/trend"),
          axios.get("/videos/top-liked"),
          axios.get("/videos/top-disliked"),
          axios.get("/users/top-followed"),
          axios.get("/videos/recent")
        ]);

        setWorldTrends(worldRes.data);
        setMostLiked(mostLikedRes.data);
        setMostDisliked(mostDislikedRes.data);
        setTopFollowedUsers(topFollowedRes.data);
        setRecentVideos(recentRes.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching trends:", err);
        setError(t("serverError"));
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  const renderTrends = (data, showRank = true) =>
    data.length > 0 ? (
      data.map((video, i) => (
        <Card
          key={video?._id || i}
          video={video}
          rank={showRank ? i + 1 : undefined}
        />
      ))
    ) : (
      <NoDataMessage>{t("noDataAvailable")}</NoDataMessage>
    );

  const renderProfiles = () =>
    topFollowedUsers.length > 0 ? (
      topFollowedUsers.map((user, i) => (
        <ProfileCard to={getPublicProfilePath(user)} key={user?._id || i}>
          <ProfileAvatar 
            src={user?.img || defaultProfile} 
            alt={user?.name} 
          />
          <ProfileName>{user?.name}</ProfileName>
          <ProfileFollowers>
            <FaUsers /> {user?.follows?.toLocaleString() || 0} {t("followers")}
          </ProfileFollowers>
        </ProfileCard>
      ))
    ) : (
      <NoDataMessage>{t("noProfilesAvailable")}</NoDataMessage>
    );

  const renderRecentVideos = () =>
    recentVideos.length > 0 ? (
      recentVideos.map((video, i) => (
        <Card key={video?._id || i} video={video} />
      ))
    ) : (
      <NoDataMessage>{t("noRecentVideos")}</NoDataMessage>
    );

  return (
    <PageContainer>
      <HeaderWrapper>
        <HeaderSection>
          <Title>
            <FaFireAlt /> {t("trendingNow")}
          </Title>
          <Subtitle>{t("discoverPopular")}</Subtitle>
        </HeaderSection>
        <SecondaryAdBanner>
          <AdBannerLabel>{t("adLabel")}</AdBannerLabel>
          <AdBannerContent>
            <FaBullhorn />
            <span>
              <MdCampaign style={{ marginRight: "4px" }} />
              {t("adBannerText")}
            </span>
          </AdBannerContent>
        </SecondaryAdBanner>
      </HeaderWrapper>

      {/* Mensaje de error */}
      {error && (
        <ErrorMessage>
          <h3>⚠️ {t("errorLoadingData")}</h3>
          <p>{error}</p>
        </ErrorMessage>
      )}

      {/* Sección de Perfiles más seguidos */}
      <Section index={0}>
        <SectionHeader>
          <SectionTitle iconColor="#ff3e6c">
            <FaUsers /> {t("mostFollowedProfiles")}
          </SectionTitle>
        </SectionHeader>
        <ProfilesScroll>
          {loading
            ? Array(5)
                .fill(0)
                .map((_, i) => <ProfileSkeleton key={i} />)
            : renderProfiles()}
        </ProfilesScroll>
      </Section>

      {/* Sección de Videos más recientes */}
      <Section index={1}>
        <SectionHeader>
          <SectionTitle iconColor="#10b981">
            <FaClock /> {t("mostRecentVideos")}
          </SectionTitle>
        </SectionHeader>
        <VideoCardGrid>
          {loading
            ? Array(4)
                .fill(0)
                .map((_, i) => <VideoCardSkeleton key={i} />)
            : renderRecentVideos()}
        </VideoCardGrid>
      </Section>

      {/* Top Ten World */}
      <Section index={2}>
        <SectionHeader>
          <SectionTitle iconColor="#fbbf24">
            <FaStar /> {t("topTenMonthly")}
          </SectionTitle>
        </SectionHeader>
        <VideoCardGrid>
          {loading
            ? Array(10)
                .fill(0)
                .map((_, i) => <VideoCardSkeleton key={i} />)
            : renderTrends(worldTrends)}
        </VideoCardGrid>
      </Section>

      {/* Most Liked */}
      <Section index={3}>
        <SectionHeader>
          <SectionTitle iconColor="#0b67dc">
            <BiSolidLike /> {t("MostLiked")}
          </SectionTitle>
        </SectionHeader>
        <VideoCardGrid>
          {loading
            ? Array(10)
                .fill(0)
                .map((_, i) => <VideoCardSkeleton key={i} />)
            : renderTrends(mostLiked)}
        </VideoCardGrid>
      </Section>

      {/* Most Disliked */}
      <Section index={4}>
        <SectionHeader>
          <SectionTitle iconColor="#f87171">
            <BiSolidDislike /> {t("MostDisliked")}
          </SectionTitle>
        </SectionHeader>
        <VideoCardGrid>
          {loading
            ? Array(10)
                .fill(0)
                .map((_, i) => <VideoCardSkeleton key={i} />)
            : renderTrends(mostDisliked)}
        </VideoCardGrid>
      </Section>
    </PageContainer>
  );
}

export default Trends;
