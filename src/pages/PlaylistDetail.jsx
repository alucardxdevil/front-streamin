import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useLanguage } from "../utils/LanguageContext";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiPlayCircle, BiTrash, BiEdit, BiArrowBack } from "react-icons/bi";
import { MdPlaylistAdd, MdDeleteForever, MdErrorOutline } from "react-icons/md";
import { FaPlay, FaClock, FaVideo } from "react-icons/fa";
import { formats } from "./Video";
import ShareModalPlaylist from "../components/ModalSharePlaylist";

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
    color: #0b67dc;
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
    background: ${({ danger }) => danger ? '#ff3e6c' : '#0b67dc'};
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

const ReadOnlyBadge = styled.span`
  background: ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.textSoft};
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
`;

const DeletedVideoCard = styled(VideoCard)`
  opacity: 0.6;
  cursor: default;

  &:hover {
    transform: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const DeletedThumbnailOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: #ff3e6c;

  svg {
    font-size: 40px;
  }

  span {
    font-size: 12px;
    font-weight: 600;
    color: white;
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

/**
 * Checks if a playlist video item's referenced video has been deleted.
 * After Mongoose populate, a deleted video reference will be null.
 */
const isVideoDeleted = (videoItem) => {
  const v = videoItem?.videoId;
  if (v == null) return true;
  if (typeof v === "object" && !v._id) return true;
  return false;
};

export const PlaylistDetailPage = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { userId, playlistId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derived: is the current user the owner of this playlist?
  const isOwner =
    currentUser &&
    playlist &&
    String(currentUser._id) === String(playlist.userId);
  const normalizedPlaylistName = (playlist?.name || "").trim().toLowerCase();
  const isFavoritesPlaylist = new Set([
    "favorites",
    "mis videos favoritos",
    "my favorites videos",
  ]).has(normalizedPlaylistName);
  const canEdit = isOwner && !isFavoritesPlaylist;

  /** Quitar ítem: playlists normales (owner); entradas con video ya borrado también en Favoritos (limpieza). */
  const canUserRemoveItem = (videoItem) => {
    if (!isOwner) return false;
    if (isVideoDeleted(videoItem)) return true;
    return canEdit;
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      const response = await axios.get(`/users/playlists/${userId}/${playlistId}`);
      setPlaylist(response.data);
    } catch (error) {
      console.error("Error loading playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVideo = (videoId) => {
    if (videoId) navigate(`/video/${videoId}`);
  };

  const handleRemoveVideo = async (videoItem) => {
    if (!canUserRemoveItem(videoItem)) return;
    try {
      // If the referenced video was deleted, populate returns null and we can't rely on videoId.
      // In that case, force-remove the playlist entry by its subdocument _id.
      if (isVideoDeleted(videoItem)) {
        await axios.delete(
          `/users/playlists/${userId}/${playlistId}/item/${videoItem._id}`
        );
        fetchPlaylist();
        return;
      }

      // Normal case: remove by videoId
      const rawVideoId = videoItem?.videoId?._id || videoItem?.videoId;
      if (rawVideoId) {
        await axios.delete(`/users/playlists/${userId}/${playlistId}/${rawVideoId}`);
      } else {
        // Fallback: force-remove by playlist item id
        await axios.delete(
          `/users/playlists/${userId}/${playlistId}/item/${videoItem._id}`
        );
      }
      fetchPlaylist();
    } catch (error) {
      console.error("Error removing video from playlist:", error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    if (typeof duration === 'number' || !isNaN(duration)) {
      return formats(Number(duration));
    }
    const parts = duration.split(':');
    if (parts.length === 3) {
      return `${parts[1]}:${parts[2]}`;
    }
    return duration;
  };

  // Count available (non-deleted) videos
  const availableCount = playlist?.videos?.filter((v) => !isVideoDeleted(v)).length || 0;

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

  if (!playlist) {
    return (
      <PageContainer>
        <EmptyState>
          <MdPlaylistAdd />
          <h3>{t("playlistNotFound")}</h3>
          <p>{t("playlistNotFoundDescription")}</p>
          <Button onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>
            <BiArrowBack />
            {t("back")}
          </Button>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeaderSection>
        <Title>
          <MdPlaylistAdd aria-hidden="true" />
          {playlist.name}
        </Title>

        {playlist.description && (
          <Description>{playlist.description}</Description>
        )}

        <MetaInfo>
          <MetaItem>
            <FaVideo aria-hidden="true" />
            {availableCount} / {playlist.videos?.length || 0} {t("videos")}
          </MetaItem>
          <MetaItem>
            <FaClock aria-hidden="true" />
            {t("created")}: {formatDate(playlist.createdAt)}
          </MetaItem>
          {!canEdit && (
            <ReadOnlyBadge aria-label={t("playlistReadOnly")}>
              {t("playlistReadOnly")}
            </ReadOnlyBadge>
          )}
        </MetaInfo>

        <ActionButtons>
          <Button onClick={() => navigate(-1)} aria-label={t("back")}>
            <BiArrowBack aria-hidden="true" />
            {t("back")}
          </Button>
          <Button 
            primary 
            onClick={() => {
              if (availableCount > 0) {
                navigate(`/playlist-player/${userId}/${playlistId}`);
              }
            }}
            disabled={availableCount === 0}
            aria-label={t("playAll")}
          >
            <FaPlay aria-hidden="true" />
            {t("playAll")}
          </Button>
          <ShareModalPlaylist 
            playlistId={playlistId}
            playlistName={playlist.name}
            videoCount={availableCount}
            userId={userId}
          />
        </ActionButtons>
      </HeaderSection>

      {playlist.videos?.length === 0 ? (
        <EmptyState role="status">
          <FaVideo aria-hidden="true" />
          <h3>{t("playlistEmpty")}</h3>
          <p>{t("playlistEmptyDescription")}</p>
          {canEdit && (
            <Button
              primary
              onClick={() => navigate(`/history/${userId}`)}
              style={{ marginTop: "20px" }}
            >
              <MdPlaylistAdd aria-hidden="true" />
              {t("goToHistory")}
            </Button>
          )}
        </EmptyState>
      ) : (
        <VideoGrid role="list" aria-label={t("playlistVideos")}>
          {playlist.videos?.map((videoItem, index) => {
            const deleted = isVideoDeleted(videoItem);

            if (deleted) {
              return (
                <DeletedVideoCard
                  key={videoItem._id || index}
                  index={index}
                  role="listitem"
                  aria-label={`${videoItem.videoTitle} - ${t("videoDeletedTitle")}`}
                >
                  <ThumbnailContainer>
                    <Thumbnail
                      src="/placeholder.jpg"
                      alt=""
                      aria-hidden="true"
                    />
                    <DeletedThumbnailOverlay>
                      <MdDeleteForever aria-hidden="true" />
                      <span>{t("videoDeletedBadge")}</span>
                    </DeletedThumbnailOverlay>
                  </ThumbnailContainer>

                  <VideoInfo>
                    <VideoTitle style={{ textDecoration: "line-through", opacity: 0.7 }}>
                      {videoItem.videoTitle}
                    </VideoTitle>
                    <VideoMeta>
                      <span style={{ color: "#ff3e6c", display: "flex", alignItems: "center", gap: 4 }}>
                        <MdErrorOutline />
                        {t("videoDeletedDescription")}
                      </span>
                    </VideoMeta>
                    {canUserRemoveItem(videoItem) && (
                      <VideoActions
                        onClick={(e) => e.stopPropagation()}
                        style={{ pointerEvents: "auto" }}
                      >
                        <ActionButton
                          danger
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveVideo(videoItem);
                          }}
                          aria-label={`${t("removeFromPlaylist")}: ${videoItem.videoTitle}`}
                        >
                          <BiTrash />
                          {t("removeFromPlaylist")}
                        </ActionButton>
                      </VideoActions>
                    )}
                  </VideoInfo>
                </DeletedVideoCard>
              );
            }

            return (
              <VideoCard
                key={videoItem._id || index}
                index={index}
                onClick={() =>
                  handlePlayVideo(videoItem.videoId?._id || videoItem.videoId)
                }
                role="listitem"
                aria-label={videoItem.videoTitle}
              >
                <ThumbnailContainer>
                  <Thumbnail
                    src={videoItem.videoId?.imgUrl || "/placeholder.jpg"}
                    alt={videoItem.videoTitle}
                    loading="lazy"
                  />
                  <PlayOverlay>
                    <FaPlay aria-hidden="true" />
                  </PlayOverlay>
                  {videoItem.videoDuration && (
                    <DurationBadge>
                      {formatDuration(videoItem.videoDuration)}
                    </DurationBadge>
                  )}
                </ThumbnailContainer>

                <VideoInfo>
                  <VideoTitle>{videoItem.videoTitle}</VideoTitle>
                  <VideoMeta>
                    <span>
                      {t("added")}:{" "}
                      {formatDate(videoItem.addedAt || playlist.updatedAt)}
                    </span>
                  </VideoMeta>
                  <VideoActions>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVideo(
                          videoItem.videoId?._id || videoItem.videoId,
                        );
                      }}
                      aria-label={`${t("play")}: ${videoItem.videoTitle}`}
                    >
                      <BiPlayCircle aria-hidden="true" />
                      {t("play")}
                    </ActionButton>
                    {canUserRemoveItem(videoItem) && (
                      <ActionButton
                        danger
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVideo(videoItem);
                        }}
                        aria-label={`${t("removeFromPlaylist")}: ${videoItem.videoTitle}`}
                      >
                        <BiTrash aria-hidden="true" />
                        {t("removeFromPlaylist")}
                      </ActionButton>
                    )}
                  </VideoActions>
                </VideoInfo>
              </VideoCard>
            );
          })}
        </VideoGrid>
      )}
    </PageContainer>
  );
};
