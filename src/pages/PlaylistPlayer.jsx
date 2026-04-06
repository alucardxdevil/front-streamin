/**
 * PlaylistPlayer.jsx — Full playlist player with video list, playback controls,
 * deleted-video markers, owner-only editing, read-only mode for non-owners,
 * sharing, polling for real-time consistency, and accessibility.
 *
 * ============================================================================
 * DATA STRUCTURES
 * ============================================================================
 *
 * URL Params (from react-router-dom useParams):
 *   - userId    {string} MongoDB _id of the playlist owner
 *   - playlistId {string} MongoDB _id of the playlist document
 *
 * Playlist object (from GET /users/playlists/:userId/:playlistId):
 * {
 *   _id: string,
 *   userId: string,              // Owner's MongoDB _id
 *   name: string,                // Playlist name
 *   description?: string,        // Optional description
 *   videos: PlaylistVideoItem[], // Array of video entries
 *   createdAt: string,           // ISO date
 *   updatedAt: string,           // ISO date
 * }
 *
 * PlaylistVideoItem (each element in playlist.videos):
 * {
 *   _id: string,                         // Subdocument ID in the array
 *   videoId: PopulatedVideo | null,       // Populated video data, or null if deleted
 *   videoTitle: string,                   // Denormalized title (survives deletion)
 *   videoDuration: string,                // Denormalized duration
 *   addedAt: string,                      // ISO date
 * }
 *
 * PopulatedVideo (when videoId is populated & video still exists):
 * {
 *   _id: string,
 *   title: string,
 *   description: string,
 *   imgUrl: string,         // Thumbnail URL
 *   videoUrl: string,       // Direct video URL (legacy)
 *   duration: number,       // Duration in seconds
 *   tags: string[],
 * }
 *
 * When a video has been deleted by its uploader, `videoItem.videoId` will be
 * `null` after Mongoose populate. The component detects this and shows a
 * "video deleted" marker. The owner can remove these from the playlist.
 *
 * ============================================================================
 * ACCESS CONTROL
 * ============================================================================
 *
 * - isOwner: currentUser._id === playlist.userId
 *   - Can remove deleted videos from the playlist
 *   - Can see delete/remove buttons on items
 *   - Full edit capabilities
 *
 * - Non-owner (viewer via shared link or direct URL):
 *   - Read-only mode: no delete buttons, no edit actions
 *   - Can play videos and navigate the playlist
 *   - Cannot modify the playlist in any way
 *
 * ============================================================================
 * USER FLOWS
 * ============================================================================
 *
 * Owner flow:
 *   1. Navigates to /playlist-player/:userId/:playlistId
 *   2. Sees full player with all controls
 *   3. Deleted videos show "Video Deleted" marker with "Remove" button
 *   4. Clicking "Remove" calls DELETE API and refreshes playlist
 *   5. Share button generates correct URL
 *
 * Viewer flow (shared link):
 *   1. Opens /shared-playlist/:playlistId → redirected to /playlist/:userId/:playlistId
 *   2. Or navigates directly to /playlist-player/:userId/:playlistId
 *   3. Sees player in read-only mode
 *   4. Deleted videos show "Video Unavailable" message (no remove button)
 *   5. Can play, skip, navigate — cannot edit
 *
 * Real-time consistency:
 *   - Playlist is polled every 30 seconds to detect changes by other users
 *   - On poll, deleted videos are detected and UI updates
 *   - Current playback index is preserved across polls
 *   - If currently playing video is deleted, auto-advance to next available
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { useLanguage } from "../utils/LanguageContext";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BiSkipNext, BiSkipPrevious, BiTrash, BiArrowBack } from "react-icons/bi";
import { MdPlaylistAdd, MdErrorOutline, MdDeleteForever } from "react-icons/md";
import { FaPlay, FaRegShareSquare } from "react-icons/fa";
import { formats } from "./Video";
import VideoReproducer from "../components/Reproducer/VideoReproducer2";
import ShareModalPlaylist from "../components/ModalSharePlaylist";
import { useDispatch, useSelector } from "react-redux";
import { fetchSuccess } from "../redux/videoSlice";

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

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

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

const BackButton = styled.button`
  background: ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.text};
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.bgLighter};
    transform: translateY(-1px);
  }
`;

const ReadOnlyBadge = styled.span`
  background: ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.textSoft};
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PlayerContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
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

const VideoInfoSection = styled.div`
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
  flex-wrap: wrap;
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
  background: ${({ theme }) => theme.bgLighter};
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

  &:focus-visible {
    outline: 2px solid #0b67dc;
    outline-offset: 2px;
  }

  svg { font-size: 20px; }
`;

// --- Playlist Panel ---

const PlaylistPanel = styled.aside`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    max-height: 400px;
  }
`;

const PlaylistHeader = styled.div`
  padding: 16px 20px;
  background: linear-gradient(135deg, #ff3e6c 0%, #0b67dc 100%);
  color: white;
  flex-shrink: 0;
`;

const PlaylistTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
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
  overflow-y: auto;
  flex: 1;

  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.soft};
    border-radius: 3px;
  }
`;

const PlaylistItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  cursor: ${({ $deleted }) => ($deleted ? "default" : "pointer")};
  transition: all 0.2s ease;
  background: ${({ $active, theme }) => ($active ? theme.soft : "transparent")};
  opacity: ${({ $deleted }) => ($deleted ? 0.6 : 1)};
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;

  &:hover {
    background: ${({ $deleted, theme }) => ($deleted ? "transparent" : theme.soft)};
  }

  &:focus-visible {
    outline: 2px solid #0b67dc;
    outline-offset: -2px;
    border-radius: 10px;
  }
`;

const ItemIndex = styled.span`
  font-size: 12px;
  color: ${({ theme, $active }) => ($active ? "#ff3e6c" : theme.textSoft)};
  font-weight: ${({ $active }) => ($active ? "700" : "400")};
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemThumbnailContainer = styled.div`
  position: relative;
  width: 80px;
  height: 45px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: ${({ theme }) => theme.soft};
`;

const ItemThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.textSoft};
`;

const DeletedOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff3e6c;
  font-size: 18px;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ItemTitle = styled.p`
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme, $deleted }) => ($deleted ? theme.textSoft : theme.text)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: ${({ $deleted }) => ($deleted ? "line-through" : "none")};
`;

const ItemDuration = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.textSoft};
`;

const DeletedBadge = styled.span`
  font-size: 10px;
  color: #ff3e6c;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
`;

const ItemActions = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 62, 108, 0.15);
    color: #ff3e6c;
  }

  &:focus-visible {
    outline: 2px solid #ff3e6c;
    outline-offset: 2px;
  }

  svg { font-size: 16px; }
`;

// --- States ---

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
    to { transform: rotate(360deg); }
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

const ErrorState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.textSoft};

  svg {
    font-size: 64px;
    margin-bottom: 20px;
    color: #ff3e6c;
  }

  h3 {
    font-size: 20px;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.text};
  }

  button {
    margin-top: 20px;
    background: linear-gradient(135deg, #ff3e6c 0%, #0b67dc 100%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 24px;
    cursor: pointer;
    font-weight: 600;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 62, 108, 0.3);
    }
  }
`;

const DeletedVideoPlayer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: ${({ theme }) => theme.soft};
  color: ${({ theme }) => theme.textSoft};
  border-radius: 16px 16px 0 0;
  gap: 12px;

  svg {
    font-size: 48px;
    color: #ff3e6c;
  }

  h3 {
    font-size: 18px;
    color: ${({ theme }) => theme.text};
    margin: 0;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
`;

const NowPlayingIcon = styled.span`
  color: #ff3e6c;
  font-size: 14px;
  display: flex;
  align-items: center;
`;

// ============================================================================
// CONSTANTS
// ============================================================================

const POLL_INTERVAL_MS = 30000; // 30 seconds

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Checks if a playlist video item's referenced video has been deleted.
 * After Mongoose populate, a deleted video reference will be null.
 */
const isVideoDeleted = (videoItem) => {
  return !videoItem.videoId || videoItem.videoId === null;
};

/**
 * Finds the next available (non-deleted) video index starting from a given index.
 * Returns -1 if no available videos exist after the start index.
 */
const findNextAvailableIndex = (videos, startIndex, direction = 1) => {
  if (!videos || videos.length === 0) return -1;
  let idx = startIndex;
  while (idx >= 0 && idx < videos.length) {
    if (!isVideoDeleted(videos[idx])) return idx;
    idx += direction;
  }
  return -1;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const PlaylistPlayerPage = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId, playlistId } = useParams();
  const { currentUser } = useSelector((state) => state.user);

  // Core state
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [removing, setRemoving] = useState(null); // videoItem._id being removed

  // Ref for preserving playback across polls
  const currentIndexRef = useRef(0);
  const pollTimerRef = useRef(null);
  const playlistLoadedRef = useRef(false); // tracks if initial load succeeded

  // Derived state
  const isOwner = currentUser && playlist && currentUser._id === playlist.userId;
  const isFavoritesPlaylist = playlist?.name === "Favorites" || playlist?.name === "Mis videos favoritos";
  const canEdit = isOwner && !isFavoritesPlaylist; // Favorites playlist is auto-managed via likes
  const currentVideoItem = playlist?.videos?.[currentIndex];
  const isCurrentDeleted = currentVideoItem ? isVideoDeleted(currentVideoItem) : false;

  // Available (non-deleted) video count
  const availableCount = playlist?.videos?.filter((v) => !isVideoDeleted(v)).length || 0;

  // =========================================================================
  // DATA FETCHING
  // =========================================================================

  const fetchPlaylist = useCallback(
    async (preserveIndex = false) => {
      try {
        const response = await axios.get(`/users/playlists/${userId}/${playlistId}`);
        const newPlaylist = response.data;
        playlistLoadedRef.current = true;

        setPlaylist((prevPlaylist) => {
          if (preserveIndex && prevPlaylist) {
            const prevVideo = prevPlaylist.videos?.[currentIndexRef.current];
            if (prevVideo) {
              const newIdx = newPlaylist.videos?.findIndex(
                (v) => v._id === prevVideo._id
              );
              if (newIdx >= 0) {
                setCurrentIndex(newIdx);
                currentIndexRef.current = newIdx;
              } else {
                const nextIdx = findNextAvailableIndex(
                  newPlaylist.videos,
                  Math.min(currentIndexRef.current, newPlaylist.videos.length - 1)
                );
                if (nextIdx >= 0) {
                  setCurrentIndex(nextIdx);
                  currentIndexRef.current = nextIdx;
                }
              }
            }
          }
          return newPlaylist;
        });

        setError(null);
      } catch (err) {
        console.error("Error loading playlist:", err);
        if (!playlistLoadedRef.current) {
          setError(err.response?.status === 404 ? "notFound" : "generic");
        }
        // Silently ignore polling errors if playlist was already loaded
      } finally {
        setLoading(false);
      }
    },
    [userId, playlistId] // removed `playlist` to avoid infinite re-creation
  );

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    playlistLoadedRef.current = false;
    fetchPlaylist();
  }, [playlistId, userId]);

  // Polling for real-time consistency — stable interval, no dependency on fetchPlaylist
  useEffect(() => {
    pollTimerRef.current = setInterval(() => {
      fetchPlaylist(true);
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [userId, playlistId]); // stable deps instead of fetchPlaylist

  // =========================================================================
  // VIDEO DISPATCH — Fetch full video data for the player
  // =========================================================================

  useEffect(() => {
    currentIndexRef.current = currentIndex;

    if (playlist && playlist.videos?.length > 0) {
      const videoItem = playlist.videos[currentIndex];
      if (videoItem && videoItem.videoId && !isVideoDeleted(videoItem)) {
        // The populated videoId only has partial fields (title, imgUrl, etc.)
        // VideoReproducer2 needs the full video document (_id, hlsMasterUrl,
        // status, qualities, likes, dislikes, views, etc.)
        const videoId = videoItem.videoId._id || videoItem.videoId;
        if (videoId) {
          axios
            .get(`/videos/find/${videoId}`)
            .then((res) => {
              dispatch(fetchSuccess(res.data));
            })
            .catch((err) => {
              console.error("Error fetching video for player:", err);
              // Fallback: dispatch partial data so at least title shows
              dispatch(fetchSuccess(videoItem.videoId));
            });
        }
      }
    }
  }, [playlist, currentIndex, dispatch]);

  // =========================================================================
  // DOCUMENT TITLE
  // =========================================================================

  useEffect(() => {
    if (currentVideoItem?.videoTitle && !isCurrentDeleted) {
      document.title = `${currentVideoItem.videoTitle} | stream-in`;
    } else if (playlist?.name) {
      document.title = `${playlist.name} | stream-in`;
    }
    return () => {
      document.title = "stream-in";
    };
  }, [currentVideoItem, playlist, isCurrentDeleted]);

  // =========================================================================
  // NAVIGATION
  // =========================================================================

  const handlePrevious = useCallback(() => {
    if (!playlist?.videos) return;
    const prevIdx = findNextAvailableIndex(playlist.videos, currentIndex - 1, -1);
    if (prevIdx >= 0) setCurrentIndex(prevIdx);
  }, [playlist, currentIndex]);

  const handleNext = useCallback(() => {
    if (!playlist?.videos) return;
    const nextIdx = findNextAvailableIndex(playlist.videos, currentIndex + 1, 1);
    if (nextIdx >= 0) setCurrentIndex(nextIdx);
  }, [playlist, currentIndex]);

  const handleVideoEnd = useCallback(() => {
    if (!playlist?.videos) return;
    const nextIdx = findNextAvailableIndex(playlist.videos, currentIndex + 1, 1);
    if (nextIdx >= 0) {
      setCurrentIndex(nextIdx);
    }
  }, [playlist, currentIndex]);

  const handleItemClick = useCallback(
    (index) => {
      const videoItem = playlist?.videos?.[index];
      if (videoItem && !isVideoDeleted(videoItem)) {
        setCurrentIndex(index);
      }
    },
    [playlist]
  );

  // =========================================================================
  // OWNER ACTIONS
  // =========================================================================

  const handleRemoveVideo = useCallback(
    async (videoItem) => {
      if (!isOwner || isFavoritesPlaylist) return;
      const videoId = videoItem.videoId?._id || videoItem.videoId;
      if (!videoId) {
        // For deleted videos where videoId is null, we need to refetch
        // after removing. Use the subdocument _id to identify.
        // The backend expects the original videoId from the playlist entry.
        // Since the video is deleted, we need a different approach.
        // We'll remove by refetching and filtering on the client, then
        // the backend pull will handle it via the videoId stored in the doc.
        // Actually, the playlist schema stores videoId as ObjectId ref.
        // Even if the video is deleted, the ObjectId reference persists in
        // the playlist document. We can extract it from the raw response.
      }

      setRemoving(videoItem._id);
      try {
        // For deleted videos, we need to get the raw videoId from the playlist
        // We'll re-fetch the raw playlist to get the ObjectId string
        const rawResponse = await axios.get(`/users/playlists/${userId}/${playlistId}`);
        const rawPlaylist = rawResponse.data;
        const rawItem = rawPlaylist.videos?.find((v) => v._id === videoItem._id);
        const rawVideoId = rawItem?.videoId?._id || rawItem?.videoId;

        if (rawVideoId) {
          await axios.delete(
            `/users/playlists/${userId}/${playlistId}/${rawVideoId}`
          );
        }

        // Refresh playlist
        await fetchPlaylist(true);
      } catch (err) {
        console.error("Error removing video from playlist:", err);
      } finally {
        setRemoving(null);
      }
    },
    [isOwner, isFavoritesPlaylist, userId, playlistId, fetchPlaylist]
  );

  // =========================================================================
  // KEYBOARD NAVIGATION
  // =========================================================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      switch (e.key) {
        case "N":
        case "n":
          if (e.shiftKey) {
            e.preventDefault();
            handleNext();
          }
          break;
        case "P":
        case "p":
          if (e.shiftKey) {
            e.preventDefault();
            handlePrevious();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious]);

  // =========================================================================
  // HELPERS
  // =========================================================================

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Can navigate previous?
  const canGoPrev =
    playlist?.videos && findNextAvailableIndex(playlist.videos, currentIndex - 1, -1) >= 0;
  // Can navigate next?
  const canGoNext =
    playlist?.videos && findNextAvailableIndex(playlist.videos, currentIndex + 1, 1) >= 0;

  // =========================================================================
  // RENDER — Loading State
  // =========================================================================

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer role="status" aria-label={t("loadingPlaylist")}>
          <div className="spinner" aria-hidden="true" />
          <p>{t("loadingPlaylist")}</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // =========================================================================
  // RENDER — Error State
  // =========================================================================

  if (error) {
    return (
      <PageContainer>
        <ErrorState role="alert">
          <MdErrorOutline aria-hidden="true" />
          <h3>
            {error === "notFound"
              ? t("playlistNotFound")
              : t("playlistLoadError")}
          </h3>
          <p>
            {error === "notFound"
              ? t("playlistNotFoundDescription")
              : t("playlistLoadErrorDescription")}
          </p>
          <button onClick={() => navigate(-1)} aria-label={t("back")}>
            <BiArrowBack style={{ marginRight: 6, verticalAlign: "middle" }} />
            {t("back")}
          </button>
        </ErrorState>
      </PageContainer>
    );
  }

  // =========================================================================
  // RENDER — Empty State
  // =========================================================================

  if (!playlist || playlist.videos?.length === 0) {
    return (
      <PageContainer>
        <EmptyState role="status">
          <MdPlaylistAdd aria-hidden="true" />
          <h3>{t("playlistEmpty")}</h3>
          <p>{t("playlistEmptyDescription")}</p>
        </EmptyState>
      </PageContainer>
    );
  }

  // =========================================================================
  // RENDER — Main Player
  // =========================================================================

  return (
    <PageContainer>
      <TopBar>
        <BackButton
          onClick={() => navigate(-1)}
          aria-label={t("back")}
        >
          <BiArrowBack />
          {t("back")}
        </BackButton>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {(!isOwner || isFavoritesPlaylist) && (
            <ReadOnlyBadge aria-label={t("playlistReadOnly")}>
              {t("playlistReadOnly")}
            </ReadOnlyBadge>
          )}
          <ShareModalPlaylist
            playlistId={playlistId}
            playlistName={playlist.name}
            videoCount={availableCount}
            userId={userId}
          />
        </div>
      </TopBar>

      <PlayerContainer>
        {/* ====== Main Video Area ====== */}
        <MainPlayer role="region" aria-label={t("videoPlayer")}>
          {isCurrentDeleted ? (
            <DeletedVideoPlayer role="alert">
              <MdDeleteForever aria-hidden="true" />
              <h3>{t("videoDeletedTitle")}</h3>
              <p>{t("videoDeletedDescription")}</p>
              {canGoNext && (
                <NavButton onClick={handleNext} aria-label={t("next")}>
                  {t("playNextVideo")}
                  <BiSkipNext />
                </NavButton>
              )}
            </DeletedVideoPlayer>
          ) : (
            <VideoReproducer onVideoEnd={handleVideoEnd} />
          )}

          <VideoInfoSection>
            <VideoTitle>
              {isCurrentDeleted
                ? currentVideoItem?.videoTitle || t("videoDeletedTitle")
                : currentVideoItem?.videoTitle}
            </VideoTitle>
            <VideoMeta>
              <span>
                {formatDate(currentVideoItem?.addedAt || playlist.updatedAt)}
              </span>
              <span>
                {currentIndex + 1} / {playlist.videos.length}
              </span>
              {availableCount < playlist.videos.length && (
                <span style={{ color: "#ff3e6c" }}>
                  ({playlist.videos.length - availableCount} {t("videosUnavailable")})
                </span>
              )}
            </VideoMeta>
          </VideoInfoSection>

          <NavigationControls role="navigation" aria-label={t("playlistNavigation")}>
            <NavButton
              onClick={handlePrevious}
              disabled={!canGoPrev}
              aria-label={t("previous")}
            >
              <BiSkipPrevious aria-hidden="true" />
              {t("previous")}
            </NavButton>

            <NavButton
              onClick={handleNext}
              disabled={!canGoNext}
              aria-label={t("next")}
            >
              {t("next")}
              <BiSkipNext aria-hidden="true" />
            </NavButton>
          </NavigationControls>
        </MainPlayer>

        {/* ====== Playlist Side Panel ====== */}
        <PlaylistPanel
          role="region"
          aria-label={`${t("playlist")}: ${playlist.name}`}
        >
          <PlaylistHeader>
            <PlaylistTitleRow>
              <div>
                <PlaylistTitle>{playlist.name}</PlaylistTitle>
                <PlaylistCount>
                  {availableCount} / {playlist.videos.length} {t("videos")}
                </PlaylistCount>
              </div>
            </PlaylistTitleRow>
          </PlaylistHeader>

          <PlaylistItems role="list" aria-label={t("playlistVideos")}>
            {playlist.videos.map((videoItem, index) => {
              const deleted = isVideoDeleted(videoItem);
              const isActive = index === currentIndex;
              const thumbnailUrl = deleted
                ? null
                : videoItem.videoId?.imgUrl || null;

              return (
                <PlaylistItem
                  key={videoItem._id || index}
                  $active={isActive}
                  $deleted={deleted}
                  onClick={() => !deleted && handleItemClick(index)}
                  role="listitem"
                  aria-current={isActive ? "true" : undefined}
                  aria-label={
                    deleted
                      ? `${videoItem.videoTitle} - ${t("videoDeletedTitle")}`
                      : `${index + 1}. ${videoItem.videoTitle}`
                  }
                  tabIndex={deleted ? -1 : 0}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !deleted) {
                      e.preventDefault();
                      handleItemClick(index);
                    }
                  }}
                >
                  {/* Index number or playing icon */}
                  <ItemIndex $active={isActive}>
                    {isActive && !deleted ? (
                      <NowPlayingIcon aria-label={t("nowPlaying")}>
                        <FaPlay />
                      </NowPlayingIcon>
                    ) : (
                      index + 1
                    )}
                  </ItemIndex>

                  {/* Thumbnail */}
                  <ItemThumbnailContainer>
                    {thumbnailUrl ? (
                      <ItemThumbnail
                        src={thumbnailUrl}
                        alt={videoItem.videoTitle}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.querySelector(
                            "[data-placeholder]"
                          ) &&
                            (e.target.parentElement.querySelector(
                              "[data-placeholder]"
                            ).style.display = "flex");
                        }}
                      />
                    ) : null}
                    {deleted ? (
                      <DeletedOverlay aria-hidden="true">
                        <MdDeleteForever />
                      </DeletedOverlay>
                    ) : !thumbnailUrl ? (
                      <ThumbnailPlaceholder aria-hidden="true">
                        <FaPlay />
                      </ThumbnailPlaceholder>
                    ) : null}
                  </ItemThumbnailContainer>

                  {/* Info */}
                  <ItemInfo>
                    <ItemTitle $deleted={deleted}>
                      {videoItem.videoTitle}
                    </ItemTitle>
                    {deleted ? (
                      <DeletedBadge>
                        <MdErrorOutline />
                        {t("videoDeletedBadge")}
                      </DeletedBadge>
                    ) : (
                      <ItemDuration>
                        {videoItem.videoDuration &&
                          formats(Number(videoItem.videoDuration))}
                      </ItemDuration>
                    )}
                  </ItemInfo>

                  {/* Owner-only: Remove button for deleted videos (not on favorites) */}
                  {canEdit && deleted && (
                    <ItemActions>
                      <RemoveButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVideo(videoItem);
                        }}
                        disabled={removing === videoItem._id}
                        aria-label={`${t("removeFromPlaylist")}: ${videoItem.videoTitle}`}
                        title={t("removeFromPlaylist")}
                      >
                        <BiTrash />
                        {removing === videoItem._id
                          ? "..."
                          : t("remove")}
                      </RemoveButton>
                    </ItemActions>
                  )}

                  {/* Owner-only: Remove button for any video (not on favorites) */}
                  {canEdit && !deleted && (
                    <ItemActions>
                      <RemoveButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVideo(videoItem);
                        }}
                        disabled={removing === videoItem._id}
                        aria-label={`${t("removeFromPlaylist")}: ${videoItem.videoTitle}`}
                        title={t("removeFromPlaylist")}
                      >
                        <BiTrash />
                      </RemoveButton>
                    </ItemActions>
                  )}
                </PlaylistItem>
              );
            })}
          </PlaylistItems>
        </PlaylistPanel>
      </PlayerContainer>
    </PageContainer>
  );
};
