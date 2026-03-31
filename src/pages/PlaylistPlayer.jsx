import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useLanguage } from "../utils/LanguageContext";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BiArrowBack, BiSkipNext, BiSkipPrevious } from "react-icons/bi";
import { MdPlaylistAdd } from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import { formats } from "./Video";
import VideoReproducer from "../components/Reproducer/VideoReproducer2";
import { useDispatch } from "react-redux";
import { fetchSuccess } from "../redux/videoSlice";

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

// Contenedor principal
const PageContainer = styled.div`
  padding: 20px;
  max-width: 1600px;
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

const PlayerContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainPlayer = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const VideoInfo = styled.div`
  padding: 20px;
`;

const VideoTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: ${({ theme }) => theme.text};
`;

const VideoMeta = styled.div`
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
`;

const NavigationControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 15px;
  background: ${({ theme }) => theme.soft};
`;

const NavButton = styled.button`
  background: ${({ active, theme }) => active ? '#ff3e6c' : theme.bgLighter};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background: #ff3e6c;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 20px;
  }
`;

const PlaylistPanel = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  
  @media (max-width: 1024px) {
    max-height: 400px;
  }
`;

const PlaylistHeader = styled.div`
  padding: 16px 20px;
  background: linear-gradient(135deg, #ff3e6c 0%, #0b67dc 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const PlaylistTitle = styled.h3`
  margin: 0 0 5px 0;
  font-size: 16px;
`;

const PlaylistCount = styled.span`
  font-size: 12px;
  opacity: 0.9;
`;

const PlaylistItems = styled.div`
  padding: 10px;
`;

const PlaylistItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ active, theme }) => active ? theme.soft : 'transparent'};
  
  &:hover {
    background: ${({ theme }) => theme.soft};
  }
`;

const ItemThumbnail = styled.img`
  width: 80px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.p`
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemDuration = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.textSoft};
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
`;

export const PlaylistPlayerPage = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId, playlistId } = useParams();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  useEffect(() => {
    if (playlist && playlist.videos?.length > 0) {
      const currentVideo = playlist.videos[currentIndex];
      if (currentVideo && currentVideo.videoId) {
        dispatch(fetchSuccess(currentVideo.videoId));
      }
    }
  }, [playlist, currentIndex, dispatch]);

  const fetchPlaylist = async () => {
    try {
      const response = await axios.get(`/users/playlists/${userId}/${playlistId}`);
      setPlaylist(response.data);
    } catch (error) {
      console.error("¡Error cargando playlist!", error);
    } finally {
      setLoading(false);
    }
  };

  const currentVideo = playlist?.videos?.[currentIndex];

  // Update document title when video changes
  useEffect(() => {
    if (currentVideo?.videoTitle) {
      document.title = `${currentVideo.videoTitle} | stream-in`;
    } else if (playlist?.name) {
      document.title = `${playlist.name} | stream-in`;
    }
    return () => {
      document.title = "stream-in";
    };
  }, [currentVideo, playlist]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < playlist.videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleVideoEnd = () => {
    if (playlist && currentIndex < playlist.videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleItemClick = (index) => {
    setCurrentIndex(index);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div className="spinner" />
          <p>{t("loadingPlaylist")}</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!playlist || playlist.videos?.length === 0) {
    return (
      <PageContainer>
        <EmptyState>
          <MdPlaylistAdd />
          <h3>{t("playlistEmpty")}</h3>
          <p>{t("playlistEmptyDescription")}</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PlayerContainer>
        <MainPlayer>
          <VideoReproducer onVideoEnd={handleVideoEnd} />
          
          <VideoInfo>
            <VideoTitle>{currentVideo?.videoTitle}</VideoTitle>
            <VideoMeta>
              <span>{formatDate(currentVideo?.addedAt || playlist.updatedAt)}</span>
              <span>{t("videoOf")} {currentIndex + 1} {t("of")} {playlist.videos.length}</span>
            </VideoMeta>
          </VideoInfo>
          
          <NavigationControls>
            <NavButton 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <BiSkipPrevious />
              {t("previous")}
            </NavButton>
            
            <NavButton 
              onClick={handleNext}
              disabled={currentIndex === playlist.videos.length - 1}
            >
              {t("next")}
              <BiSkipNext />
            </NavButton>
          </NavigationControls>
        </MainPlayer>
        
        <PlaylistPanel>
          <PlaylistHeader>
            <PlaylistTitle>{playlist.name}</PlaylistTitle>
            <PlaylistCount>{playlist.videos.length} {t("videos")}</PlaylistCount>
          </PlaylistHeader>
          
          <PlaylistItems>
            {playlist.videos.map((videoItem, index) => (
              <PlaylistItem
                key={videoItem._id || index}
                active={index === currentIndex}
                onClick={() => handleItemClick(index)}
              >
                <ItemThumbnail 
                  src={videoItem.videoId?.imgUrl || '/placeholder.jpg'} 
                  alt={videoItem.videoTitle}
                />
                <ItemInfo>
                  <ItemTitle>{videoItem.videoTitle}</ItemTitle>
                  <ItemDuration>
                    {videoItem.videoDuration && formats(Number(videoItem.videoDuration))}
                  </ItemDuration>
                </ItemInfo>
              </PlaylistItem>
            ))}
          </PlaylistItems>
        </PlaylistPanel>
      </PlayerContainer>
    </PageContainer>
  );
};
