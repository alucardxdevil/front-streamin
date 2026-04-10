import React, { useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";
import styled, { css, keyframes } from "styled-components";
import AddTaskOutlinedIcon from "@mui/icons-material/AddTaskOutlined";
import { BiLike, BiDislike } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { dislike, fetchSuccess, like } from "../redux/videoSlice";
import { follows } from "../redux/userSlice";
import { formatTimeago } from "../utils/timeago";
import { useLanguage } from "../utils/LanguageContext";
import { recordWatchTags } from "../utils/watchTagPreferences";
import axios from "axios";
import VideoReproducer2 from "../components/Reproducer/VideoReproducer2";
import defaultProfile from "../img/profileUser.png";
import LoginRequired from "../components/ModalLogin";
import { RiPlayList2Fill } from "react-icons/ri";
 
const Comments = lazy(() => import("../components/Comments"));
const Recommendation = lazy(() => import("../components/Recommendation").then((m) => ({ default: m.Recommendation })));
const RecommendationRandom = lazy(() => import("../components/RecommendationRandom").then((m) => ({ default: m.RecommendationRandom })));
const DescriptionMore = lazy(() => import("../components/DescriptionMore").then((m) => ({ default: m.DescriptionMore })));
const ShareModal = lazy(() => import("../components/ModalShare"));
const SEOVideoWrapper = lazy(() => import("../components/seo/SEOVideoWrapper"));


/* ================= ANIMATIONS ================= */

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

/* ================= LAYOUT ================= */

const ContainerO = styled.main`
  display: grid;
  grid-template-columns: 260px 1fr 260px;
  gap: 16px;
  max-width: 1800px;
  margin: 0 auto;
  /* Sin padding-top para que el ad quede pegado al navbar */
  padding: 0 28px 40px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  /* Alinear las columnas laterales desde el tope del contenedor */
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 220px 1fr;
    gap: 12px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 12px;
    margin-top: 0;
    overflow-x: hidden;
    overflow-x: clip;
  }
`;


const Side = styled.div`
  /* Sticky: la columna lateral se queda fija al hacer scroll,
     top = altura exacta del navbar (60px) para que el ad quede pegado */
  position: sticky;
  top: 2px;
  /* Altura máxima = viewport - navbar */
  max-height: calc(100vh - 60px);
  overflow: hidden;

  @media (max-width: 1200px) {
    &:last-child {
      display: none;
    }
    
    &:first-child {
      margin-bottom: 20px;
    }
  }

  @media (max-width: 768px) {
    order: 3;
    position: static;
    max-height: none;
    overflow: visible;
  }
`;

const Content = styled.article`
  width: 100%;
  /* Espacio superior para el contenido central (video + info) */
  padding-top: 12px;
`;

/* ================= VIDEO ================= */

const VideoWrapper = styled.div`
  width: 100%;
  height: auto;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: -5px;

  /* ── Mobile: el reproductor es fixed, este div actúa como spacer
     para que el contenido no quede debajo del reproductor fijo.
     La altura es 56.25vw (relación 16:9 del ancho completo). ── */
  @media (max-width: 768px) {
    /* Evita que el contenido de abajo se asome bajo el player fijo al hacer scroll */
    height: calc(56.25vw + 8px);
    border-radius: 0;
    margin-bottom: 0;
    position: relative;
    z-index: 1;
    background: #000;
  }
`;

/* ================= GRID ================= */

const InfoGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr 330px;
  gap: 3px;
  margin: 5px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* ================= CARDS ================= */

const Card = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  padding: 12px;
  display: grid;
  flex-direction: column;
`;

/* ================= VIDEO INFO ================= */

const VideoTitle = styled.h1`
  color: ${({ theme }) => theme.text || "white"};
  font-size: 17px;
  margin-bottom: 6px;
`;

const Meta = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  /* margin-bottom: 12px; */
`;

const Actions = styled.div`
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.text || "white"};
`;

const Action = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
`;

const ClassificationText = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: default;
`;

/* ================= CREATOR ================= */

const CreatorRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
`;

const Avatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
`;

const CreatorInfo = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.text || "white"};
`;

const FollowBtn = styled.button`
  background: ${({ following, theme }) =>
    following
      ? theme.soft
      : "linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%)"};
  color: white;
  border-radius: 10px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;

  ${({ following }) =>
    !following &&
    css`
      animation: ${pulse} 1.2s infinite;
    `}

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(11, 103, 220, 0.4);
  }
`;

/* ================= DESCRIPTION ================= */

const DescriptionCard = styled(Card)`
  margin-top: 6px;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
`;

const ExactDate = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.textSoft || "#aaa"};
  opacity: 0.6;
`;

/* ================= FORMATS (NO TOCAR) ================= */

export const formats = (seconds) => {
  if (isNaN(seconds)) return "00:00";
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  return `${mm}:${ss}`;
};

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  width: 100%;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #e94560;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/* ================= PLAYLIST MODAL ================= */

const PlaylistModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
`;

const PlaylistModalContent = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 20px;
  padding: 30px;
  max-width: 520px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid ${({ theme }) => theme.soft};
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
`;

const PlaylistModalTitle = styled.h2`
  color: ${({ theme }) => theme.text};
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #ff3e6c;
  }
`;

const PlaylistInputGroup = styled.div`
  margin-bottom: 18px;
`;

const PlaylistLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  font-size: 14px;
`;

const PlaylistInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid ${({ theme }) => theme.soft};
  border-radius: 12px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #ff3e6c;
    box-shadow: 0 0 0 3px rgba(255, 62, 108, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.textSoft};
  }
`;

const PlaylistActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PlaylistButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  ${({ cancel }) => cancel && `
    background: ${({ theme }) => theme.soft};
    color: ${({ theme }) => theme.text};
    
    &:hover {
      background: ${({ theme }) => theme.bg};
      transform: translateY(-1px);
    }
  `}

  ${({ confirm }) => confirm && `
    background: linear-gradient(135deg, #ff3e6c 0%, #0b67dc 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 62, 108, 0.3);
    }
  `}
`;

const PlaylistList = styled.div`
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 16px;
  padding-right: 4px;
  
  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.soft} transparent;

  /* Chrome/Edge/Safari scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.soft};
    border-radius: 3px;
  }
`;

const PlaylistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: ${({ theme }) => theme.bg};
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  border: 2px solid transparent;
  
  &:hover {
    background: ${({ theme }) => theme.soft};
    border-color: #ff3e6c;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PlaylistItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PlaylistItemTitle = styled.h4`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  margin: 0 0 4px 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlaylistItemMeta = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
`;

const PlaylistIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff3e6c 0%, #0b67dc 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
`;

const CreateNewSection = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  padding: 20px;
  border: 2px dashed ${({ theme }) => theme.soft};
  margin-top: 16px;
`;

const SectionLabel = styled.p`
  color: ${({ theme }) => theme.textSoft};
  font-size: 13px;
  margin: 0 0 16px 0;
  text-align: center;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: ${({ theme }) => theme.textSoft};
  font-size: 13px;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.soft};
  }
`;

const SuccessMessage = styled.div`
  background: rgba(0, 200, 0, 0.15);
  color: #00ff00;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
`;

/* ================= COMPONENT ================= */

const Video = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { currentVideo } = useSelector((state) => state.video);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const path = useLocation().pathname.split("/")[2];
  const { t, language } = useLanguage();

  const [channel, setChannel] = useState({});
  const [currentPlayingVideoId, setCurrentPlayingVideoId] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [nonCriticalReady, setNonCriticalReady] = useState(false);
  const [nextVideoId, setNextVideoId] = useState(null);
  
  // Playlist modal state
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistMessage, setPlaylistMessage] = useState("");
  const [modalData, setModalData] = useState({
    name: '',
    description: '',
    videoId: null
  });
  const likes = Array.isArray(currentVideo?.likes) ? currentVideo.likes : [];
  const dislikes = Array.isArray(currentVideo?.dislikes) ? currentVideo.dislikes : [];
  const hasLiked = currentUser?._id ? likes.includes(currentUser._id) : false;
  const hasDisliked = currentUser?._id ? dislikes.includes(currentUser._id) : false;
  const isOwnChannel = Boolean(currentUser?._id && channel?._id && currentUser._id === channel._id);
  const channelProfilePath = isOwnChannel ? "/profile" : `/profileUser/${channel.slug || channel._id}`;

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingVideo(true);
      setNonCriticalReady(false);
      try {
        const videoRes = await axios.get(`/videos/find/${path}`);
        dispatch(fetchSuccess(videoRes.data));
        setCurrentPlayingVideoId(videoRes.data._id);

        // Cargar el canal en segundo plano (no debe bloquear el arranque del player)
        axios
          .get(`/users/find/${videoRes.data.userId}`)
          .then((channelRes) => setChannel(channelRes.data))
          .catch((err) => console.error("Error cargando canal:", err));

        // Defer del contenido no-crítico para priorizar el reproductor.
        // requestIdleCallback no existe en todos los navegadores, por eso el fallback.
        const ric = window.requestIdleCallback;
        if (typeof ric === "function") {
          ric(() => setNonCriticalReady(true), { timeout: 1200 });
        } else {
          setTimeout(() => setNonCriticalReady(true), 250);
        }
      } catch (err) {
        console.error("Error cargando video:", err);
      } finally {
        setLoadingVideo(false);
      }
    };
    fetchData();
  }, [path, dispatch]);

  /* Preferencias "Para ti": registrar etiquetas en cuanto el usuario abre el video */
  useEffect(() => {
    if (!currentVideo?._id || !currentVideo.tags?.length) return;
    recordWatchTags(currentVideo.tags, 1);
  }, [currentVideo?._id]);

  const handleLike = async () => {
    if (!currentUser) return openLoginModal();
    if (!currentVideo?._id) return;
    const res = hasLiked
      ? await axios.put(`/users/notlike/${currentVideo._id}`)
      : await axios.put(`/users/like/${currentVideo._id}`);
    if (res.status === 200) dispatch(like(currentUser._id));
  };

  const handleDislike = async () => {
    if (!currentUser) return openLoginModal();
    if (!currentVideo?._id) return;
    const res = hasDisliked
      ? await axios.put(`/users/notdislike/${currentVideo._id}`)
      : await axios.put(`/users/dislike/${currentVideo._id}`);
    if (res.status === 200) dispatch(dislike(currentUser._id));
  };

  const handleSub = async () => {
    if (!currentUser) return openLoginModal();
    if (isOwnChannel) return navigate("/profile");
    currentUser.followsProfile.includes(channel._id)
      ? await axios.put(`/users/unfol/${channel._id}`)
      : await axios.put(`/users/fol/${channel._id}`);
    dispatch(follows(channel._id));
  };

  // Playlist functions
  const openPlaylistModal = () => {
    if (!currentUser) return openLoginModal();
    setModalData({ ...modalData, videoId: currentVideo._id });
    fetchPlaylists();
    setShowPlaylistModal(true);
  };

  const closePlaylistModal = () => {
    setShowPlaylistModal(false);
    setModalData({ name: '', description: '', videoId: null });
    setPlaylistMessage("");
  };

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`/users/playlists/${currentUser._id}`);
      // Filtrar playlist de favoritos (solo se actualiza al dar like a un video)
      const favoritePlaylistNames = new Set([
        "favorites",
        "mis videos favoritos",
        "my favorites videos",
      ]);
      const filteredPlaylists = response.data.playlists.filter((playlist) => {
        const normalizedName = playlist?.name?.trim().toLowerCase();
        return !favoritePlaylistNames.has(normalizedName);
      });
      setPlaylists(filteredPlaylists);
    } catch (error) {
      console.error("Error cargando playlists:", error);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      await axios.post(`/users/playlists`, {
        userId: currentUser._id,
        name: modalData.name,
        description: modalData.description,
        videoId: modalData.videoId
      });
      fetchPlaylists();
      setModalData({ name: '', description: '', videoId: null });
    } catch (error) {
      console.error("Error creando playlist:", error);
    }
  };

  const handleAddToPlaylist = async (playlistId, videoId) => {
    try {
      await axios.put(`/users/playlists/${currentUser._id}/${playlistId}/${videoId}`);
      setPlaylistMessage(t("videoAddedToPlaylist"));
      setTimeout(() => {
        closePlaylistModal();
      }, 1500);
    } catch (error) {
      // Si el video ya está en la playlist
      if (error.response?.data?.message?.includes('ya existe') || error.response?.status === 400) {
        setPlaylistMessage(t("videoAlreadyInPlaylist"));
      } else {
        setPlaylistMessage(t("errorAddingVideoToPlaylist"));
      }
    }
  };

  /**
   * Callback que se pasa al reproductor (VideoReproducer2).
   * Se invoca UNA SOLA VEZ por sesión cuando el usuario ha visto ≥50% del video.
   * Aquí se registra la vista y se agrega el video al historial.
   */
  const handleViewCounted = useCallback(() => {
    if (!currentVideo?._id) return;

    // Registrar la vista en el servidor
    axios.put(`/videos/view/${currentVideo._id}`).catch((err) => {
      console.error("Error registrando vista:", err);
    });

    if (currentVideo?.tags?.length) {
      recordWatchTags(currentVideo.tags, 2);
    }

    // Agregar al historial solo si el usuario está autenticado
    if (currentUser) {
      axios.post(`/users/history`, {
        userId: currentUser._id,
        videoId: currentVideo._id,
        videoTitle: currentVideo.title,
        videoDuration: currentVideo.duration,
      }).catch((error) => {
        console.error("Error al agregar al historial:", error);
      });
    }
  }, [currentVideo?._id, currentVideo?.title, currentVideo?.duration, currentVideo?.tags, currentUser]);

  // Obtener un video recomendado aleatorio
  useEffect(() => {
    const fetchNextVideo = async () => {
      if (!currentVideo?.tags) return;
      try {
        const res = await axios.get(`/videos/tags?tags=${currentVideo.tags}`);
        const filteredVideos = res.data.filter(v => v._id !== currentVideo._id);
        if (filteredVideos.length > 0) {
          // Seleccionar un video aleatorio
          const randomIndex = Math.floor(Math.random() * filteredVideos.length);
          setNextVideoId(filteredVideos[randomIndex]._id);
        }
      } catch (err) {
        console.error("Error obteniendo siguiente video:", err);
      }
    };
    fetchNextVideo();
  }, [currentVideo]);

  // Función callback para el autoplay
  const handleVideoEnd = () => {
    if (nextVideoId) {
      navigate(`/video/${nextVideoId}`);
    }
  };

  const formatExactDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const exactDate = formatExactDate(currentVideo?.createdAt);
  

  return (
    <ContainerO>
      {/* SEO: diferido para no bloquear el primer render del reproductor */}
      {nonCriticalReady && (
        <Suspense fallback={null}>
          <SEOVideoWrapper video={currentVideo} channel={channel} />
        </Suspense>
      )}

      <Side>
        {nonCriticalReady && (
          <Suspense fallback={null}>
            <RecommendationRandom currentPlayingVideoId={currentPlayingVideoId} />
          </Suspense>
        )}
      </Side>

      <Content>
        <VideoWrapper>
          {loadingVideo && !currentVideo?._id ? (
            <LoadingWrapper>
              <Spinner />
            </LoadingWrapper>
          ) : (
            <VideoReproducer2
              onVideoEnd={handleVideoEnd}
              countdown={10}
              onViewCounted={handleViewCounted}
            />
          )}
        </VideoWrapper>

        {currentVideo && (
          <>
            <DescriptionCard>
              <VideoTitle>{currentVideo.title}</VideoTitle>
              <Meta>
                {formatTimeago(currentVideo.createdAt, language)}
                {exactDate && <ExactDate>({exactDate})</ExactDate>} •{" "}
                {currentVideo.views.toLocaleString()} {t("views")}
              </Meta>
            </DescriptionCard>

            {nonCriticalReady && (
              <>
                <InfoGrid>
                  {/* VIDEO INFO */}
                  <Card>
                    <Actions>
                      <Action onClick={handleLike}>
                        <BiLike
                          size={26}
                          color={
                            hasLiked
                              ? "#0b67dc"
                              : "white"
                          }
                        />
                        {likes.length}
                      </Action>

                      <Action onClick={handleDislike}>
                        <BiDislike
                          size={26}
                          color={
                            hasDisliked
                              ? "#e94560"
                              : "white"
                          }
                        />
                        {dislikes.length}
                      </Action>

                      <ClassificationText>
                        {t("classification")} {currentVideo.classification || "A"}
                      </ClassificationText>
                      <Suspense fallback={null}>
                        <ShareModal videoId={currentVideo._id} />
                      </Suspense>

                      <Action onClick={openPlaylistModal}>
                        <RiPlayList2Fill /> {t("save")}
                      </Action>
                    </Actions>
                  </Card>

                  {/* CREATOR */}
                  <Card>
                    <CreatorRow>
                      <Link to={channelProfilePath}>
                        <Avatar
                          src={channel.img || defaultProfile}
                          alt={`Foto de perfil de ${channel.name}`}
                        />
                      </Link>

                      <CreatorInfo>
                        <strong>{channel.name}</strong>
                        <div style={{ fontSize: 12, color: "#aaa" }}>
                          {channel.follows} {t("followers")}
                        </div>
                      </CreatorInfo>

                      {isOwnChannel ? (
                        <FollowBtn following={false} onClick={() => navigate("/profile")}>
                          {t("myProfile")}
                        </FollowBtn>
                      ) : (
                        <FollowBtn
                          following={currentUser?.followsProfile.includes(
                            channel._id,
                          )}
                          onClick={handleSub}
                        >
                          {currentUser?.followsProfile.includes(channel._id)
                            ? t("following")
                            : t("follow")}
                        </FollowBtn>
                      )}
                    </CreatorRow>
                  </Card>
                </InfoGrid>

                <DescriptionCard>
                  <Suspense fallback={null}>
                    <DescriptionMore
                      initialContent={currentVideo.description}
                      fullContent={currentVideo.description}
                    />
                  </Suspense>
                </DescriptionCard>

                <Suspense fallback={null}>
                  <Comments videoId={currentVideo._id} />
                </Suspense>
              </>
            )}
          </>
        )}
      </Content>

      <Side>
        {nonCriticalReady && (
          <Suspense fallback={null}>
            <Recommendation
              tags={currentVideo?.tags}
              currentPlayingVideoId={currentPlayingVideoId}
            />
          </Suspense>
        )}
      </Side>

      <LoginRequired open={showLoginModal} onClose={closeLoginModal} />

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <PlaylistModalOverlay onClick={closePlaylistModal}>
          <PlaylistModalContent onClick={(e) => e.stopPropagation()}>
            <PlaylistModalTitle>
              <RiPlayList2Fill />
              {t("savePlaylist")}
            </PlaylistModalTitle>

            {playlistMessage && (
              <SuccessMessage>{playlistMessage}</SuccessMessage>
            )}

            {playlists.length > 0 && (
              <>
                <PlaylistList>
                  {playlists.map((playlist) => (
                    <PlaylistItem
                      key={playlist._id}
                      onClick={() => handleAddToPlaylist(playlist._id, modalData.videoId)}
                    >
                      <PlaylistIcon>
                        <RiPlayList2Fill />
                      </PlaylistIcon>
                      <PlaylistItemInfo>
                        <PlaylistItemTitle>{playlist.name}</PlaylistItemTitle>
                        <PlaylistItemMeta>
                          <span>{playlist.videos?.length || 0} videos</span>
                        </PlaylistItemMeta>
                      </PlaylistItemInfo>
                    </PlaylistItem>
                  ))}
                </PlaylistList>
                <Divider>{t("optionNewPlaylist")}</Divider>
              </>
            )}

            <CreateNewSection>
              <SectionLabel>{t("createNewPlaylist")}</SectionLabel>
              <PlaylistInputGroup>
                <PlaylistLabel>{t("namePlaylist")}</PlaylistLabel>
                <PlaylistInput
                  type="text"
                  placeholder={t("myPlaylist")}
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                />
              </PlaylistInputGroup>
              <PlaylistInputGroup>
                <PlaylistLabel>{t("descriptionOptionPlaylist")}</PlaylistLabel>
                <PlaylistInput
                  type="text"
                  placeholder={t("playlistDescription")}
                  value={modalData.description}
                  onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                />
              </PlaylistInputGroup>
              <PlaylistActions>
                <PlaylistButton cancel onClick={closePlaylistModal}>
                  {t("cancelPlaylist")}
                </PlaylistButton>
                <PlaylistButton
                  confirm
                  onClick={handleCreatePlaylist}
                  disabled={!modalData.name.trim()}
                >
                  {t("createAndSave")}
                </PlaylistButton>
              </PlaylistActions>
            </CreateNewSection>
          </PlaylistModalContent>
        </PlaylistModalOverlay>
      )}
    </ContainerO>
  );
};

export default Video;