import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BiPlayCircle, BiHeart, BiArrowBack } from "react-icons/bi";
import { FaPlay, FaClock, FaVideo, FaHeart } from "react-icons/fa";
import { useSelector } from "react-redux";
import { formats } from "./Video";
import { useLanguage } from "../utils/LanguageContext";

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
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
    svg {
      font-size: 28px;
    }
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.textSoft};
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
  
  svg {
    color: #ff3e6c;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const Button = styled.button`
  background: ${({ primary, theme }) => primary 
    ? 'linear-gradient(135deg, #ff3e6c 0%, #0b67dc 100%)'
    : theme.soft};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 14px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 62, 108, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

// Grid de videos
const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Tarjeta de video
const VideoCard = styled.div`
  background: linear-gradient(145deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    ${({ theme }) => theme.soft} 100%
  );
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${({ index }) => index * 0.05}s;
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 40px rgba(255, 62, 108, 0.2);
  }
`;

const ThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
`;

const Thumbnail = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${VideoCard}:hover & {
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
  
  ${VideoCard}:hover & {
    opacity: 1;
  }
  
  svg {
    font-size: 48px;
    color: white;
    transition: transform 0.3s ease;
  }
  
  ${VideoCard}:hover svg {
    transform: scale(1.2);
  }
`;

const DurationBadge = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const VideoInfo = styled.div`
  padding: 16px;
`;

const VideoTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const VideoMeta = styled.div`
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  margin-bottom: 12px;
`;

const VideoActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.text};
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 500;

  &:hover {
    background: #ff3e6c;
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.textSoft};
  
  svg {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 20px;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.text};
  }
  
  p {
    font-size: 14px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: ${({ theme }) => theme.text};
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid ${({ theme }) => theme.soft};
    border-top-color: #ff3e6c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  p {
    margin-top: 20px;
    font-size: 16px;
    color: ${({ theme }) => theme.textSoft};
  }
`;

const HomeOne = ({ type }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const headers = currentUser ? { Authorization: `Bearer ${currentUser.accessToken}` } : {};
        const videosRes = await axios.get(`/videos/${type}`, { headers });
        setVideos(videosRes.data || []);
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [type, currentUser]);

  const handlePlayAll = async () => {
    if (videos.length === 0) return;
    
    if (!currentUser) {
      // Si no hay usuario, reproducir el primer video
      const firstVideoId = videos[0]._id;
      navigate(`/video/${firstVideoId}`);
      return;
    }
    
    try {
      // Obtener la playlist de favoritos del usuario
      const playlistRes = await axios.get(`/users/playlists/${currentUser._id}`, {
        headers: { Authorization: `Bearer ${currentUser.accessToken}` }
      });
      
      // Buscar la playlist de favoritos en la respuesta
      const playlists = playlistRes.data.playlists || [];
      const favPlaylist = playlists.find(p => p.name === 'My Favorites videos');
      
      if (favPlaylist && favPlaylist._id) {
        navigate(`/playlist-player/${currentUser._id}/${favPlaylist._id}`);
      } else {
        // Si no existe, crear una playlist temporal
        const response = await axios.post('/users/playlists', {
          userId: currentUser._id,
          name: 'My Favorites videos',
          videoIds: videos.map(v => v._id)
        }, {
          headers: { Authorization: `Bearer ${currentUser.accessToken}` }
        });
        
        if (response.data.playlist) {
          navigate(`/playlist-player/${currentUser._id}/${response.data.playlist._id}`);
        }
      }
    } catch (err) {
      console.error('Error playing playlist:', err);
      // Si falla, reproducir el primer video
      const firstVideoId = videos[0]._id;
      navigate(`/video/${firstVideoId}`);
    }
  };

  const handlePlayVideo = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTitle = () => {
    return t("videosILike");
  };

  const getDescription = () => {
    return t("videosILikeDescription");
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div className="spinner" />
          <p>{t("loadingVideos")}</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <Title>
          <FaHeart />
          {getTitle()}
        </Title>
        
        <Description>{getDescription()}</Description>
        
        <MetaInfo>
          <MetaItem>
            <FaVideo />
            {videos.length} {t("videos")}
          </MetaItem>
          <MetaItem>
            <FaClock />
            {t("recentlyUpdated")}
          </MetaItem>
        </MetaInfo>
        
        <ActionButtons>
          <Button onClick={() => navigate(-1)}>
            <BiArrowBack />
            {t("back")}
          </Button>
          <Button primary onClick={() => handlePlayAll()}>
            <FaPlay />
            {t("playAll")}
          </Button>
        </ActionButtons>
      </HeaderSection>

      {videos.length === 0 ? (
        <EmptyState>
          <FaHeart />
          <h3>{t("noVideosYet")}</h3>
          <p>{t("videosILikeWillAppear")}</p>
        </EmptyState>
      ) : (
        <VideoGrid>
          {videos.map((video, index) => (
            <VideoCard 
              key={video._id}
              index={index}
              onClick={() => handlePlayVideo(video._id)}
            >
              <ThumbnailContainer>
                <Thumbnail 
                  src={video.imgUrl || '/placeholder.jpg'} 
                  alt={video.title} 
                />
                <PlayOverlay>
                  <FaPlay />
                </PlayOverlay>
                {video.duration && (
                  <DurationBadge>{formats(Number(video.duration))}</DurationBadge>
                )}
              </ThumbnailContainer>
              
              <VideoInfo>
                <VideoTitle>{video.title}</VideoTitle>
                <VideoMeta>
                  <span>{video.views?.toLocaleString() || 0} {t("views")}</span>
                  <span>{formatDate(video.createdAt)}</span>
                </VideoMeta>
                <VideoActions>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation();
                    handlePlayVideo(video._id);
                  }}>
                    <BiPlayCircle />
                    {t("play")}
                  </ActionButton>
                </VideoActions>
              </VideoInfo>
            </VideoCard>
          ))}
        </VideoGrid>
      )}
    </PageContainer>
  );
};

export default HomeOne;
