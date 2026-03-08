import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import Card from "../components/Card";
import { useLanguage } from "../utils/LanguageContext";
import { FaPlay, FaRandom, FaRedo, FaBullhorn } from "react-icons/fa";
import { MdCampaign } from "react-icons/md";

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

// ─── Banner Publicitario Secundario ───────────────────────────────────────────

const SecondaryAdBanner = styled.div`
  width: 100%;
  height: 90px;
  margin-top: 0;
  margin-bottom: 40px;
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
    height: 64px;
    margin-bottom: 24px;
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

// ─── Contenedor del Header + Banner Secundario ────────────────────────────────

const HeaderWrapper = styled.div`
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 24px;
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

// ─── Tarjeta Publicitaria en el Grid ─────────────────────────────────────────

const AdCardContainer = styled.div`
  width: 100%;
  margin-bottom: 5px;
  border-radius: 16px;
  background: linear-gradient(
    145deg,
    ${({ theme }) => theme.bgLighter} 0%,
    ${({ theme }) => theme.soft} 100%
  );
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  border: 1px dashed ${({ theme }) => theme.textSoft};
  opacity: 0.9;
  animation: ${fadeIn} 0.6s ease-out;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 40px rgba(11, 103, 220, 0.2);
    opacity: 1;
    border-color: rgba(11, 103, 220, 0.4);
  }

  @media (max-width: 768px) {
    border-radius: 12px;
    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }
`;

const AdCardImageArea = styled.div`
  width: 100%;
  height: 160px;
  background: linear-gradient(
    135deg,
    rgba(11, 103, 220, 0.08) 0%,
    rgba(11, 103, 220, 0.15) 50%,
    rgba(255, 62, 108, 0.08) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(11, 103, 220, 0.06),
      transparent
    );
    background-size: 200% 100%;
    animation: ${shimmer} 2.5s infinite;
  }
`;

const AdCardIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;

  svg {
    font-size: 40px;
    color: #0b67dc;
    opacity: 0.6;
  }
`;

const AdCardBadge = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: rgba(11, 103, 220, 0.15);
  color: #0b67dc;
  border: 1px solid rgba(11, 103, 220, 0.3);
  backdrop-filter: blur(4px);
`;

const AdCardDetails = styled.div`
  display: flex;
  gap: 14px;
  padding: 16px;
  flex: 1;
`;

const AdCardTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const AdCardTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.textSoft};
  opacity: 0.7;
  line-height: 1.4;
  min-height: 42px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const AdCardSubtitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    font-size: 11px;
  }
`;

// ─── Componente AdCard ────────────────────────────────────────────────────────

const AdCard = ({ t }) => (
  <AdCardContainer>
    <AdCardImageArea>
      <AdCardIcon>
        <FaBullhorn />
      </AdCardIcon>
      <AdCardBadge>{t("adLabel")}</AdCardBadge>
    </AdCardImageArea>
    <AdCardDetails>
      <AdCardTexts>
        <AdCardTitle>{t("adCardTitle")}</AdCardTitle>
        <AdCardSubtitle>
          <MdCampaign /> {t("adCardSubtitle")}
        </AdCardSubtitle>
      </AdCardTexts>
    </AdCardDetails>
  </AdCardContainer>
);

// ─── Función para intercalar AdCards cada 10 elementos ───────────────────────

const buildGridItems = (videos, t) => {
  const items = [];
  videos.forEach((video, index) => {
    items.push(<Card key={video._id} video={video} />);
    // Insertar AdCard después de cada 10 tarjetas de video (índice 9, 19, 29…)
    if ((index + 1) % 10 === 0) {
      items.push(<AdCard key={`ad-${index}`} t={t} />);
    }
  });
  return items;
};

// ─── Componente Principal ─────────────────────────────────────────────────────

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
      {/* ── Banner principal + Banner secundario ── */}
      <HeaderWrapper>
        <HeaderSection>
          <Title>
            <FaRandom /> {t("discover")}
          </Title>
          <Subtitle>
            {t("discoverSubtitle")}
          </Subtitle>
        </HeaderSection>

        {/* Banner publicitario secundario — misma anchura, menor altura */}
        <SecondaryAdBanner>
          <AdBannerLabel>{t("adLabel")}</AdBannerLabel>
          <AdBannerContent>
            <FaBullhorn />
            <span>{t("adBannerText")}</span>
          </AdBannerContent>
        </SecondaryAdBanner>
      </HeaderWrapper>

      {error && (
        <ErrorMessage onClick={fetchMoreVideos}>
          <h3><FaRedo /> {t("errorLoadingData")}</h3>
          <p>{error}</p>
        </ErrorMessage>
      )}

      <VideoGrid>
        {/* Tarjetas de video con AdCards intercaladas cada 10 elementos */}
        {buildGridItems(videos, t)}

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
