import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { 
  FaFireAlt, 
  FaGlobeAmericas, 
  FaHeart, 
  FaStar, 
  FaPlay, 
  FaUsers,
  FaClock,
  FaEye,
  FaArrowRight
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { useLanguage } from "../utils/LanguageContext";
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

// Contenedor principal
const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  color: ${({ theme }) => theme.text};
  background-color: ${({ theme }) => theme.bg};
  min-height: 100vh;
  padding-top: 80px;
  
  @media (max-width: 768px) {
    padding: 10px;
    padding-top: 70px;
  }
`;

// Header con gradiente
const HeaderSection = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    ${({ theme }) => theme.soft} 50%,
    ${({ theme }) => theme.bgLighter} 100%
  );
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 40px;
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
    border-radius: 16px;
    margin-bottom: 24px;
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

// Grid de videos
const TrendList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Tarjeta de video mejorada
const TrendCard = styled(Link)`
  background: linear-gradient(145deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    ${({ theme }) => theme.soft} 100%
  );
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  text-decoration: none;
  position: relative;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 40px rgba(255, 62, 108, 0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    border: 2px solid transparent;
    transition: border-color 0.3s ease;
  }
  
  &:hover::after {
    border-color: rgba(255, 62, 108, 0.3);
  }
`;

const ThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${TrendCard}:hover & {
    transform: scale(1.1);
  }
`;

const PlayOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  svg {
    font-size: 48px;
    color: white;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
  
  ${TrendCard}:hover & {
    opacity: 1;
  }
`;

const RankBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ff3e6c 0%, #ff6b8a 100%);
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(255, 62, 108, 0.4);
`;

const DurationBadge = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
`;

const TrendInfo = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TrendTitle = styled.h3`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.text};
  line-height: 1.4;
  min-height: 42px;
`;

const TrendStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  flex-wrap: wrap;
  gap: 8px;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    font-size: 14px;
  }
`;

const LikesDislikes = styled.div`
  display: flex;
  gap: 12px;
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

// Loading skeleton
const SkeletonCard = styled.div`
  background: linear-gradient(90deg, 
    ${({ theme }) => theme.soft} 25%, 
    ${({ theme }) => theme.bgLighter} 50%, 
    ${({ theme }) => theme.soft} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 16px;
  height: 260px;
`;

const NoDataMessage = styled.div`
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

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTrends = (data, showRank = true) =>
    data.length > 0 ? (
      data.map((video, i) => (
        <TrendCard to={`/video/${video?._id}`} key={video?._id || i}>
          <ThumbnailContainer>
            <Thumbnail
              src={video?.imgUrl || "/img/default-thumbnail.jpg"}
              alt={video?.title}
            />
            <PlayOverlay>
              <FaPlay />
            </PlayOverlay>
            {showRank && <RankBadge>#{i + 1}</RankBadge>}
            <DurationBadge>{formatDuration(video?.duration)}</DurationBadge>
          </ThumbnailContainer>
          <TrendInfo>
            <TrendTitle title={video?.title}>{video?.title}</TrendTitle>
            <TrendStats>
              <StatItem>
                <FaEye /> {video?.views?.toLocaleString() || 0}
              </StatItem>
              <LikesDislikes>
                <StatItem style={{ color: "#0b67dc" }}>
                  <BiSolidLike /> {video?.likes?.length || 0}
                </StatItem>
                <StatItem style={{ color: "#f87171" }}>
                  <BiSolidDislike /> {video?.dislikes?.length || 0}
                </StatItem>
              </LikesDislikes>
            </TrendStats>
          </TrendInfo>
        </TrendCard>
      ))
    ) : (
      <NoDataMessage>{t("noDataAvailable")}</NoDataMessage>
    );

  const renderProfiles = () =>
    topFollowedUsers.length > 0 ? (
      topFollowedUsers.map((user, i) => (
        <ProfileCard to={`/profileUser/${user?.slug || user?._id}`} key={user?._id || i}>
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
        <TrendCard to={`/video/${video?._id}`} key={video?._id || i}>
          <ThumbnailContainer>
            <Thumbnail
              src={video?.imgUrl || "/img/default-thumbnail.jpg"}
              alt={video?.title}
            />
            <PlayOverlay>
              <FaPlay />
            </PlayOverlay>
            <DurationBadge>{formatDuration(video?.duration)}</DurationBadge>
          </ThumbnailContainer>
          <TrendInfo>
            <TrendTitle title={video?.title}>{video?.title}</TrendTitle>
            <TrendStats>
              <StatItem>
                <FaClock /> {t("recent")}
              </StatItem>
              <StatItem>
                <FaEye /> {video?.views?.toLocaleString() || 0}
              </StatItem>
            </TrendStats>
          </TrendInfo>
        </TrendCard>
      ))
    ) : (
      <NoDataMessage>{t("noRecentVideos")}</NoDataMessage>
    );

  return (
    <PageContainer>
      <HeaderSection>
        <Title>
          <FaFireAlt /> {t("trendingNow")}
        </Title>
        <Subtitle>{t("discoverPopular")}</Subtitle>
      </HeaderSection>

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
                .map((_, i) => (
                  <SkeletonCard
                    key={i}
                    style={{ minWidth: "140px", height: "160px" }}
                  />
                ))
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
        <TrendList>
          {loading
            ? Array(4)
                .fill(0)
                .map((_, i) => <SkeletonCard key={i} />)
            : renderRecentVideos()}
        </TrendList>
      </Section>

      {/* Top Ten World */}
      <Section index={2}>
        <SectionHeader>
          <SectionTitle iconColor="#fbbf24">
            <FaStar /> {t("topTenMonthly")}
          </SectionTitle>
        </SectionHeader>
        <TrendList>
          {loading
            ? Array(10)
                .fill(0)
                .map((_, i) => <SkeletonCard key={i} />)
            : renderTrends(worldTrends)}
        </TrendList>
      </Section>

      {/* Most Liked */}
      <Section index={3}>
        <SectionHeader>
          <SectionTitle iconColor="#0b67dc">
            <BiSolidLike /> {t("MostLiked")}
          </SectionTitle>
        </SectionHeader>
        <TrendList>
          {loading
            ? Array(10)
                .fill(0)
                .map((_, i) => <SkeletonCard key={i} />)
            : renderTrends(mostLiked)}
        </TrendList>
      </Section>

      {/* Most Disliked */}
      <Section index={4}>
        <SectionHeader>
          <SectionTitle iconColor="#f87171">
            <BiSolidDislike /> {t("MostDisliked")}
          </SectionTitle>
        </SectionHeader>
        <TrendList>
          {loading
            ? Array(10)
                .fill(0)
                .map((_, i) => <SkeletonCard key={i} />)
            : renderTrends(mostDisliked)}
        </TrendList>
      </Section>
    </PageContainer>
  );
}

export default Trends;
