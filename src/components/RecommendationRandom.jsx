import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components';
import Card from './Card';
import { useLanguage } from "../utils/LanguageContext";

const Container = styled.div`
  flex: 1.5;
  display: flex;
  flex-direction: column;
  /* La altura total disponible = viewport - navbar (60px) */
  height: calc(100vh - 60px);
  overflow: hidden;
`;

/* Área scrollable que contiene las cards de recomendación */
const ScrollableCards = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 10px;
  min-height: 0; /* necesario para que flex + overflow funcione correctamente */

  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.text} ${({ theme }) => theme.soft};

  /* Chrome/Edge/Safari scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.soft};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.text};
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    padding-right: 0;
  }
`;

const CardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const Hr = styled.hr`
  margin: 6px 0px;
  border: 0.5px solid ${({ theme }) => theme.soft};
`;

const Loading = styled.div`
  color: ${({ theme }) => theme.text};
  text-align: center;
  padding: 10px;
  font-size: 14px;
`;

/* ===== Espacio reservado para publicidad ===== */
const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const AdPlaceholder = styled.div`
  width: 100%;
  min-height: 220px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.bgLighter} 0%,
    ${({ theme }) => theme.soft} 50%,
    ${({ theme }) => theme.bgLighter} 100%
  );
  background-size: 800px 100%;
  border: 1.5px dashed ${({ theme }) => theme.soft};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
  padding: 20px 12px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  /* Efecto shimmer sutil para indicar que es un espacio dinámico */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.04) 50%,
      transparent 100%
    );
    background-size: 400px 100%;
    animation: ${shimmer} 2.5s infinite linear;
    border-radius: 14px;
    pointer-events: none;
  }

  @media (max-width: 1200px) {
    min-height: 200px;
  }

  @media (max-width: 768px) {
    min-height: 160px;
    border-radius: 10px;
  }
`;

const AdLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.textSoft};
  opacity: 0.5;
  user-select: none;
`;

const AdIcon = styled.div`
  font-size: 28px;
  opacity: 0.2;
  user-select: none;
`;

export const RecommendationRandom = ({ type, currentPlayingVideoId }) => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const lastCardRef = useRef();
  const { t } = useLanguage();

  const itemsPerPage = 10;

  const fetchVideos = async (currentPage) => {
    setLoading(true);
    try {
      const res = await axios.get(`/videos/random`);
      const filteredVideos = res.data.filter(video => video._id !== currentPlayingVideoId);
      
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const videosToLoad = filteredVideos.slice(startIndex, endIndex);

      if (currentPage === 0) {
        setVideos(videosToLoad);
      } else {
        setVideos(prev => [...prev, ...videosToLoad]);
      }

      setHasMore(endIndex < filteredVideos.length);
    } catch (error) {
      console.error("Error fetching random videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVideos([]);
    setPage(0);
    setHasMore(true);
    fetchVideos(0);
  }, [type, currentPlayingVideoId]);

  // Cargar anuncios de Google Adsense
  useEffect(() => {
      const ads = document.querySelectorAll('.adsbygoogle');
      ads.forEach((ad) => {
          if (!ad.getAttribute('data-adsbygoogle-status')) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
          }
      });
  });

  const lastCardElement = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  };

  useEffect(() => {
    if (page > 0) {
      fetchVideos(page);
    }
  }, [page]);

  return (
    <Container>
      {/* Espacio reservado para publicidad — se reemplazará con el componente de anuncio */}
      <AdPlaceholder>
        <ins className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '160px' }}
            data-ad-client="ca-pub-7445263311603329"
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true">
        </ins>
      </AdPlaceholder>

      {/* Las cards de recomendación hacen scroll independientemente del ad */}
      <ScrollableCards>
        <h3 style={{ color: "white", justifyContent: "center", display: "flex" }}>{t("randomVideos")}</h3>
        <Hr />
        <CardsList>
          {videos.map((video, index) => {
            if (videos.length === index + 1) {
              return (
                <div ref={lastCardElement} key={video._id}>
                  <Card type="sm" video={video} />
                </div>
              );
            } else {
              return (
                <div key={video._id}>
                  <Card type="sm" video={video} />
                </div>
              );
            }
          })}
        </CardsList>
        {loading && <Loading>{t("loadingMoreVideos")}</Loading>}
        {!hasMore && !loading && <Loading>{t("noMoreRandomVideos")}</Loading>}
      </ScrollableCards>
    </Container>
  );
};
