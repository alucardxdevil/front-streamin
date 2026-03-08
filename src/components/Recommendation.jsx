import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components';
import Card from './Card';

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
  min-height: 0; /* necesario para que flex + overflow funcione correctamente */

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

export const Recommendation = ({tags, currentPlayingVideoId}) => {
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const lastCardRef = useRef();

    const itemsPerPage = 10;

    const fetchVideos = async (currentPage) => {
        if (!tags) return;
        setLoading(true);
        try {
            const res = await axios.get(`/videos/tags?tags=${tags}`);
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
            console.error("Error fetching related videos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setVideos([]);
        setPage(0);
        setHasMore(true);
        fetchVideos(0);
    }, [tags, currentPlayingVideoId]);

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
                <AdIcon>📢</AdIcon>
                <AdLabel>Publicidad</AdLabel>
            </AdPlaceholder>

            {/* Las cards de recomendación hacen scroll independientemente del ad */}
            <ScrollableCards>
                <h3 style={{ color: "white", justifyContent: "center", display: "flex" }}>
                    Video Relation
                </h3>
                <Hr />
                {videos.map((video, index) => {
                    if (videos.length === index + 1) {
                        return (
                            <div ref={lastCardElement} key={video._id}>
                                <Card type={"sm"} video={video} />
                            </div>
                        );
                    } else {
                        return (
                            <div key={video._id}>
                                <Card type={"sm"} video={video} />
                            </div>
                        );
                    }
                })}
                {loading && <Loading>Cargando más videos...</Loading>}
                {!hasMore && !loading && <Loading>No hay más videos relacionados</Loading>}
            </ScrollableCards>
        </Container>
    );
}
