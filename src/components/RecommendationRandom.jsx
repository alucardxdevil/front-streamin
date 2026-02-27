import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components';
import Card from './Card';

const Container = styled.div`
  flex: 1.5;
  display: flow-root;
  height: calc(100vh - 120px);
  overflow-y: auto;
  padding-right: 8px;

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

export const RecommendationRandom = ({ type, currentPlayingVideoId }) => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const lastCardRef = useRef();

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
      <h3 style={{ color: "white", justifyContent: "center", display: "flex" }}>Video Random</h3>
      <Hr />
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
      {loading && <Loading>Cargando más videos...</Loading>}
      {!hasMore && !loading && <Loading>No hay más videos aleatorios</Loading>}
    </Container>
  );
};
