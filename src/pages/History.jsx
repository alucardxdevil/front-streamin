import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useLanguage } from "../utils/LanguageContext";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { BiPlayCircle, BiTrash, BiPlus, BiMinus, BiEdit, BiCheck, BiHistory } from "react-icons/bi";
import { MdPlaylistAdd, MdVideoLibrary } from "react-icons/md";
import { FcClock } from "react-icons/fc";
import { FaPlus, FaList } from "react-icons/fa";
import { RiPlayList2Fill } from "react-icons/ri";
import { formats } from "./Video";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 70px;
  min-height: 100vh;
  background: ${({ theme }) => theme.bg};
  
  @media (max-width: 768px) {
    padding: 12px;
    padding-top: 60px;
    gap: 14px;
  }
`;

const Section = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 14px;
    border-radius: 12px;
  }
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    gap: 8px;
    margin-bottom: 12px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 16px;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    font-size: 14px;
  }
`;

const HistoryList = styled.div`
  display: grid;
  gap: 15px;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: ${({ theme }) => theme.bg};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.soft};
    transform: translateX(5px);
  }
  
  @media (max-width: 768px) {
    gap: 12px;
    padding: 12px;
    flex-wrap: wrap;
  }
`;

const HistoryActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    margin-left: 0;
    margin-top: 8px;
    flex-wrap: wrap;
  }
`;

const HistoryThumbnail = styled.img`
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100px;
    height: 70px;
  }
  
  @media (max-width: 480px) {
    width: 80px;
    height: 60px;
  }
`;

const HistoryInfo = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
`;

const HistoryTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  margin: 0 0 5px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 14px;
    -webkit-line-clamp: 2;
  }
`;

const HistoryMeta = styled.div`
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  
  @media (max-width: 768px) {
    gap: 10px;
    font-size: 12px;
    flex-wrap: wrap;
  }
`;

const PlaylistSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const PlaylistList = styled.div`
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 14px;
    border-radius: 12px;
  }
`;

const PlaylistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: ${({ theme }) => theme.bg};
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.soft};
  }
  
  @media (max-width: 768px) {
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
  }
`;

const PlaylistInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PlaylistTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const PlaylistMeta = styled.div`
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const PlaylistActions = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.accent};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.2s ease;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.accentDark};
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const ButtonOne = styled.button`
  background: #ff3e6c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.2s ease;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.accentDark};
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const ActionButton = styled(Button)`
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 6px 8px;
  }
  
  @media (max-width: 480px) {
    span {
      display: none;
    }
  }
`;

const ActionButtonOne = styled(Button)`
  white-space: nowrap;
  background: #ff3e6c;

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 6px 8px;
  }

  @media (max-width: 480px) {
    span {
      display: none;
    }
  }
`;

const ActionButtonTwo = styled(Button)`
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 6px 8px;
  }

  @media (max-width: 480px) {
    span {
      display: none;
    }
  }
`;

const CreatePlaylistModal = styled.div`
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
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
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
    width: 95%;
  }
  
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

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.text};
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  svg {
    color: #ff3e6c;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  font-size: 14px;
`;

const Input = styled.input`
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
  
  @media (max-width: 768px) {
    padding: 12px 14px;
    font-size: 14px;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    margin-top: 16px;
  }
`;

const ModalButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 12px 20px;
  }

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

const PlaylistSelectList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    max-height: 150px;
    margin-bottom: 14px;
  }
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.soft};
    border-radius: 2px;
  }
`;

const PlaylistSelectItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  
  &:hover {
    background: ${({ theme }) => theme.soft};
    border-color: #ff3e6c;
    transform: translateX(4px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    padding: 12px 14px;
    gap: 10px;
  }
`;

const PlaylistSelectInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PlaylistSelectTitle = styled.h4`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  margin: 0 0 4px 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const PlaylistSelectMeta = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  
  @media (max-width: 768px) {
    font-size: 11px;
    gap: 6px;
  }
  
  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
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
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
    border-radius: 8px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: ${({ theme }) => theme.textSoft};
  font-size: 13px;
  
  @media (max-width: 768px) {
    margin: 16px 0;
    font-size: 12px;
  }
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.soft};
  }
`;

const CreateNewSection = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  padding: 20px;
  border: 2px dashed ${({ theme }) => theme.soft};
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const SectionLabel = styled.p`
  color: ${({ theme }) => theme.textSoft};
  font-size: 13px;
  margin: 0 0 16px 0;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 12px;
    margin: 0 0 12px 0;
  }
`;

const PlaylistCreateButton = styled(Button)`
  width: 100%;
  justify-content: center;
`;

export const HistoryPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const [history, setHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    name: '',
    description: '',
    videoId: null
  });

  useEffect(() => {
    fetchHistory();
    fetchPlaylists();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`/users/history/${userId}`);
      setHistory(response.data.history);
    } catch (error) {
      console.error("¡Error cargando historial!", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`/users/playlists/${userId}`);
      // Filtrar playlist de favoritos (solo se actualiza al dar like a un video)
      const filteredPlaylists = response.data.playlists.filter(
        playlist => playlist.name !== "Favorites" && playlist.name !== "Mis videos favoritos"
      );
      setPlaylists(filteredPlaylists);
    } catch (error) {
      console.error("¡Error cargando playlists!", error);
    }
  };

  const handlePlayVideo = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  const handleDeleteHistory = async (historyId) => {
    try {
      await axios.delete(`/users/history/${userId}/${historyId}`);
      fetchHistory();
    } catch (error) {
      console.error("¡Error eliminando del historial!", error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await axios.delete(`/users/history/${userId}`);
      fetchHistory();
    } catch (error) {
      console.error("¡Error limpiando historial!", error);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      await axios.post(`/users/playlists`, {
        userId,
        name: modalData.name,
        description: modalData.description,
        videoId: modalData.videoId
      });
      fetchPlaylists();
      setShowModal(false);
      setModalData({ name: '', description: '', videoId: null });
    } catch (error) {
      console.error("¡Error creando playlist!", error);
    }
  };

  const handleAddVideoToPlaylist = async (playlistId, videoId) => {
    try {
      await axios.put(`/users/playlists/${userId}/${playlistId}/${videoId}`);
      console.log("¡Video agregado a playlist!");
    } catch (error) {
      console.error("¡Error agregando video a playlist!", error);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    // Si es un número (segundos), usar la función formats
    if (typeof duration === 'number' || !isNaN(duration)) {
      return formats(Number(duration));
    }
    // Si es string en formato HH:MM:SS o MM:SS
    const parts = duration.split(':');
    if (parts.length === 3) {
      return `${parts[1]}:${parts[2]}`;
    }
    return duration;
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
      <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
        <div style={{ fontSize: '20px', marginBottom: '10px' }}>
          Cargando...
        </div>
        <div style={{ fontSize: '14px', opacity: '0.7' }}>
          Obteniendo tu historial y playlists
        </div>
      </div>
    );
  }

  return (
    <Container>
      {/* Main layout with two columns: Left = Playlists, Right = History */}
      <div style={{ display: "flex", gap: "30px", flexWrap: "nowrap", width: "100%" }}>
        
        {/* LEFT COLUMN - History */}
        <div style={{ flex: 1, minWidth: "400px", width: "50%" }}>
          <Title>
            <BiHistory />
            {t("videoHistory")}
          </Title>

          <Section>
            <h3 style={{ color: "white", marginBottom: "10px" }}>{t("viewedVideos")}</h3>

            {history.length === 0 ? (
              <EmptyState>{t("noVideosWatchedYet")}</EmptyState>
            ) : (
              <HistoryList>
                {history.map((item) => (
                  <HistoryItem
                    key={item._id}
                    onClick={() => navigate(`/video/${item.videoId._id}`)}
                  >
                    <HistoryThumbnail 
                      src={item.videoId.thumbnailUrl || item.videoId.imgUrl} 
                      alt={item.videoTitle}
                    />
                    <HistoryInfo>
                      <HistoryTitle>{item.videoTitle}</HistoryTitle>
                      <HistoryMeta>
                        <div>{formatDuration(item.videoDuration)}</div>
                        <div>{formatDate(item.viewedAt)}</div>
                      </HistoryMeta>
                    </HistoryInfo>
                    <HistoryActions>
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalData({
                            ...modalData,
                            videoId: item.videoId._id,
                          });
                          setShowModal(true);
                        }}
                      >
                        <RiPlayList2Fill />
                        <span>{t("add")}</span>
                      </ActionButton>
                      <ActionButtonOne
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(item._id);
                        }}
                      >
                        <BiTrash />
                        <span>{t("delete")}</span>
                      </ActionButtonOne>
                    </HistoryActions>
                  </HistoryItem>
                ))}
              </HistoryList>
            )}

            {history.length > 0 && (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <ButtonOne onClick={handleClearHistory}>
                  <BiTrash />
                  {t("clearAll")}
                </ButtonOne>
              </div>
            )}
          </Section>
        </div>

        {/* RIGHT COLUMN - Playlists */}
        <div style={{ flex: 1, minWidth: "400px", width: "50%" }}>
          <Title>
            <RiPlayList2Fill />
            {t("playlists")}
          </Title>

          <PlaylistSection>
            <PlaylistList>
              <h3 style={{ color: "white", marginBottom: "10px" }}>{t("yourPlaylists")}</h3>

              {playlists.length === 0 ? (
                <EmptyState>{t("noPlaylistsCreated")}</EmptyState>
              ) : (
                playlists.map((playlist) => (
                  <PlaylistItem key={playlist._id}>
                    <PlaylistInfo>
                      <PlaylistTitle>{playlist.name}</PlaylistTitle>
                      <PlaylistMeta>
                        <div>{formatDate(playlist.createdAt)}</div>
                        <div>{playlist.videos.length} {t("videos")}</div>
                      </PlaylistMeta>
                    </PlaylistInfo>
                    <PlaylistActions>
                      <Button
                        onClick={() =>
                          navigate(`/playlist/${userId}/${playlist._id}`)
                        }
                      >
                        <BiPlayCircle />
                        {t("view")}
                      </Button>
                    </PlaylistActions>
                  </PlaylistItem>
                ))
              )}

              <div style={{ marginTop: "20px" }}>
                <PlaylistCreateButton
                  onClick={() => {
                    setModalData({ name: "", description: "", videoId: null });
                    setShowModal(true);
                  }}
                >
                  <RiPlayList2Fill />
                  {t("createList")}
                </PlaylistCreateButton>
              </div>
            </PlaylistList>
          </PlaylistSection>
        </div>

      </div>

      {showModal && (
        <CreatePlaylistModal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>
              <RiPlayList2Fill />
              {modalData.videoId
                ? t("addVideoToPlaylist")
                : t("createNewPlaylist")}
            </ModalTitle>

            {modalData.videoId && (
              <>
                {playlists.length > 0 ? (
                  <>
                    <Label>{t("selectExistingPlaylist")}</Label>
                    <PlaylistSelectList>
                      {playlists.map((playlist) => (
                        <PlaylistSelectItem
                          key={playlist._id}
                          onClick={() => {
                            handleAddVideoToPlaylist(
                              playlist._id,
                              modalData.videoId,
                            );
                            setShowModal(false);
                            setModalData({
                              name: "",
                              description: "",
                              videoId: null,
                            });
                          }}
                        >
                          <PlaylistIcon>
                            <FaList />
                          </PlaylistIcon>
                          <PlaylistSelectInfo>
                            <PlaylistSelectTitle>
                              {playlist.name}
                            </PlaylistSelectTitle>
                            <PlaylistSelectMeta>
                              <span>
                                <MdVideoLibrary />
                                {playlist.videos?.length || 0} videos
                              </span>
                            </PlaylistSelectMeta>
                          </PlaylistSelectInfo>
                          <BiCheck
                            style={{ color: "#0b67dc", fontSize: "20px" }}
                          />
                        </PlaylistSelectItem>
                      ))}
                    </PlaylistSelectList>
                    <Divider>o crea una nueva</Divider>
                  </>
                ) : (
                  <SectionLabel>
                    No tienes playlists creadas. Crea una nueva:
                  </SectionLabel>
                )}
              </>
            )}

            <CreateNewSection>
              <InputGroup>
                <Label>Nombre de la Playlist</Label>
                <Input
                  value={modalData.name}
                  onChange={(e) =>
                    setModalData({ ...modalData, name: e.target.value })
                  }
                  placeholder={t("enterPlaylistName")}
                />
              </InputGroup>

              <InputGroup>
                <Label>{t("descriptionOptional")}</Label>
                <Input
                  value={modalData.description}
                  onChange={(e) =>
                    setModalData({ ...modalData, description: e.target.value })
                  }
                  placeholder={t("enterDescription")}
                />
              </InputGroup>
            </CreateNewSection>

            <ModalActions>
              <ModalButton cancel onClick={() => setShowModal(false)}>
                {t("cancel")}
              </ModalButton>
              <ModalButton confirm onClick={handleCreatePlaylist}>
                <FaPlus style={{ marginRight: "6px" }} />
                {t("createPlaylist")}
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </CreatePlaylistModal>
      )}
    </Container>
  );
};