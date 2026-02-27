import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import Card from "../components/Card";
import { useLanguage } from "../utils/LanguageContext";
import { FaPlay, FaRandom, FaRedo } from "react-icons/fa";

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
      rgba(11, 103, 220, 0.1), 
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
  background: linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%);
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
    color: #0b67dc;
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

// Grid de videos
const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
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

// Mensaje de error
const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #ff3e6c;
  font-size: 16px;
  background: ${({ theme }) => theme.bgLighter};
  border-radius: 16px;
  border: 2px solid #ff3e6c;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 62, 108, 0.1);
    transform: translateY(-2px);
  }
  
  h3 {
    margin-bottom: 12px;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  p {
    color: ${({ theme }) => theme.textSoft};
    font-size: 14px;
  }
`;

// Mensaje de carga
const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  grid-column: 1 / -1;
  
  svg {
    animation: ${pulse} 1s infinite;
  }
`;

// Mensaje sin más videos
const NoMoreMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.textSoft};
  font-size: 14px;
  grid-column: 1 / -1;
  
  span {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
`;

// Botón de cargar más
const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 20px auto;
  padding: 12px 24px;
  background: linear-gradient(135deg, #0b67dc 0%, #0b67dc 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  grid-column: 1 / -1;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(11, 103, 220, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    font-size: 16px;
  }
`;

const Home = ({ type }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const initialized = useRef(false);
  const loadedIds = useRef(new Set());
  const { t } = useLanguage();

  // Reset al cambiar de tipo
  useEffect(() => {
    setVideos([]);
    loadedIds.current.clear();
    initialized.current = false;
    setHasMore(true);
    setError(null);
  }, [type]);

  const fetchMoreVideos = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get("/videos/random");

      const newVideos = res.data.filter(
        (video) => !loadedIds.current.has(video._id)
      );

      if (newVideos.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      newVideos.forEach((video) => loadedIds.current.add(video._id));
      setVideos((prev) => [...prev, ...newVideos]);
    } catch (err) {
      console.error("Error cargando videos:", err);
      setError(t("errorLoadingVideos"));
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 100 &&
      hasMore &&
      !loading
    ) {
      fetchMoreVideos();
    }
  };

  useEffect(() => {
    if (!initialized.current) {
      fetchMoreVideos();
      initialized.current = true;
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  return (
    <PageContainer>
      <HeaderSection>
        <Title>
          <FaRandom /> {t("discover")}
        </Title>
        <Subtitle>
          {t("discoverSubtitle")}
        </Subtitle>
      </HeaderSection>

      {error && (
        <ErrorMessage onClick={fetchMoreVideos}>
          <h3><FaRedo /> {t("errorLoadingData")}</h3>
          <p>{error}</p>
        </ErrorMessage>
      )}

      <VideoGrid>
        {videos.map((video, index) => (
          <Card key={video._id} video={video} />
        ))}
        
        {loading && (
          <>
            {Array(4).fill(0).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
            <LoadingMessage>
              <FaPlay /> {t("loading")}
            </LoadingMessage>
          </>
        )}
        
        {!hasMore && !error && videos.length > 0 && (
          <NoMoreMessage>
            <span>
              <FaPlay /> {t("noMoreVideos")}
            </span>
          </NoMoreMessage>
        )}
        
        {!loading && hasMore && videos.length > 0 && (
          <LoadMoreButton onClick={fetchMoreVideos} disabled={loading}>
            <FaRedo /> {t("loadMore")}
          </LoadMoreButton>
        )}
      </VideoGrid>
    </PageContainer>
  );
};

export default Home;
