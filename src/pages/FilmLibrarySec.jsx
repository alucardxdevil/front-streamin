import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Card from "../components/Card";
import { useParams } from "react-router-dom";
import { keyframes } from "styled-components";
import { FaFilm } from "react-icons/fa";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-top: 70px;
  min-height: 100vh;
  background: ${({ theme }) => theme.bg || "#181818"};
  
  @media (max-width: 768px) {
    padding: 12px;
    padding-top: 60px;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    ${({ theme }) => theme.soft} 100%
  );
  border-radius: 16px;
  animation: ${fadeIn} 0.5s ease;
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const HeaderIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0b67dc 0%, #ff3e6c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
    border-radius: 10px;
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const VideoCount = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  margin-top: 4px;
  display: block;
`;

const VideosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  animation: ${fadeIn} 0.6s ease;
  
  @media (max-width: 768px) {
    gap: 14px;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  
  svg {
    font-size: 64px;
    color: ${({ theme }) => theme.textSoft};
    opacity: 0.4;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 20px;
    color: ${({ theme }) => theme.text};
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: ${({ theme }) => theme.textSoft};
  }
`;

const FilmLibrarySec = ({type}) => {
  const { slug } = useParams();

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch user data to get the name
        const userRes = await axios.get(`/users/find/${slug}`)
        if (userRes.data?.name) {
          setUserName(userRes.data.name)
        }
        
        // Fetch videos
        const res = await axios.get(`/videos/${type}/${slug}`)
        setVideos(res.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setVideos([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [type, slug])



  return (
    <Container>
      <HeaderSection>
        <HeaderIcon>
          <FaFilm />
        </HeaderIcon>
        <HeaderInfo>
          <Title>Videos de {userName || slug}</Title>
          <VideoCount>{videos.length} {videos.length === 1 ? 'video' : 'videos'}</VideoCount>
        </HeaderInfo>
      </HeaderSection>

      {loading ? (
        <VideosGrid>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ aspectRatio: '16/9', background: '#333', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </VideosGrid>
      ) : videos.length === 0 ? (
        <EmptyState>
          <FaFilm />
          <h3>No hay videos</h3>
          <p>Este usuario no ha subido ningún video aún</p>
        </EmptyState>
      ) : (
        <VideosGrid>
          {videos.map(video => (
            <Card key={video._id} video={video} />
          ))}
        </VideosGrid>
      )}
    </Container>
  );
};

export default FilmLibrarySec;
