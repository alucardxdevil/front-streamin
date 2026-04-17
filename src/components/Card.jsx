import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { formats } from "../pages/Video";
import defaultProfile from '../img/profileUser.png';
import { useLanguage } from "../utils/LanguageContext";
import { formatTimeago } from "../utils/timeago";
import { FaPlay } from "react-icons/fa";

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

// Contenedor principal - Tarjeta mejorada
const Container = styled(Link)`
  width: ${(props) => (props.type !== "sm" ? "100%" : "100%")};
  margin-bottom: 5px;
  cursor: pointer;
  display: flex;
  flex-direction: ${(props) => (props.type === "sm" ? "row" : "column")};
  gap: 0;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(145deg, 
    ${({ theme }) => theme.bgLighter} 0%, 
    ${({ theme }) => theme.soft} 100%
  );
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;

  &:hover {
    transform: translateY(-3px) scale(1.008);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.25);
    border-color: rgba(255, 62, 108, 0.35);
  }
  
  &::before {
    content: "";
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, rgba(255, 62, 108, 0.9) 0%, rgba(255, 126, 95, 0.85) 100%);
    opacity: 0.82;
    z-index: 1;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    border: 2px solid transparent;
    transition: border-color 0.3s ease;
    pointer-events: none;
  }
  
  &:hover::after {
    border-color: rgba(255, 62, 108, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    margin: 0;
    border-radius: 12px;

    flex-direction: ${(props) => (props.type === "sm" ? "column" : "column")};
    
    &:hover {
      transform: translateY(-2px) scale(1.004);
    }
  }
`;

// Wrapper de imagen con efectos
const ImageWrapper = styled.div`
  position: relative;
  width: ${(props) => (props.type === "sm" ? "46%" : "100%")};
  height: ${(props) => (props.type === "sm" ? "120px" : "190px")};
  overflow: hidden;
  background: #111;

  @media (max-width: 768px) {
    width: 100%;
    height: ${(props) => (props.type === "sm" ? "210px" : "190px")};
  }
`;

// Imagen con efecto de zoom
const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #999;
  transition: transform 0.35s ease;
  
  ${Container}:hover & {
    transform: scale(1.05);
  }
`;

// Overlay de reproducción
const PlayOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.12) 0%,
    rgba(0, 0, 0, 0.5) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  svg {
    font-size: 42px;
    color: white;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    transition: transform 0.25s ease;
  }
  
  ${Container}:hover & {
    opacity: 1;
    
    svg {
      transform: scale(1.1);
    }
  }
  
  @media (max-width: 768px) {
    svg {
      font-size: 36px;
    }
  }
`;

// Badge de duración
const InfoDuration = styled.span`
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
  background: rgba(228, 60, 98, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
`;

// Sección de información
const Details = styled.div`
  display: flex;
  gap: 14px;
  flex: 1;
  padding: ${(props) => (props.type === "sm" ? "10px" : "16px")};
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );

  @media (max-width: 768px) {
    padding: ${(props) => (props.type === "sm" ? "14px" : "16px")};
    gap: 10px;
  }
`;

// Avatar del canal
const ChannelImage = styled.img`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: #999;
  display: ${(props) => props.type === "sm" && "none"};
  object-fit: cover;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
  
  ${Container}:hover & {
    border-color: #ff3e6c;
  }
`;

// Contenedor de textos
const Texts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

// Título del video
const Title = styled.h1`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  min-height: 44px;
  font-weight: 700;
  font-size: 15.5px;
  color: ${({ theme }) => theme.text || "#fff"};
  transition: color 0.3s ease;
  
  ${Container}:hover & {
    color: #ff3e6c;
  }
`;

// Nombre del canal
const ChannelName = styled.h2`
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  margin: 4px 0 2px;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${({ theme }) => theme.text};
  }
`;

// Información adicional
const Info = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const InfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    font-size: 12px;
  }
`;

// Separador
const Separator = styled.span`
  color: ${({ theme }) => theme.textSoft};
  opacity: 0.5;
`;

// Estadísticas rápidas (opcional)
const QuickStats = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 4px;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.textSoft};
  
  svg {
    font-size: 12px;
  }
`;

const Card = ({ type, video }) => {
  const [channel, setChannel] = useState({});

  const { language, t } = useLanguage();
  
  const formattedTotalDuration = formats(video?.duration);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await axios.get(`/users/find/${video?.userId}`);
        setChannel(res.data);
      } catch (err) {
        console.error("Error fetching channel:", err);
      }
    };
    if (video?.userId) {
      fetchChannel();
    }
  }, [video?.userId]);

  const formattedViews = video?.views?.toLocaleString() || "0";
  
  return (
    <Container to={`/video/${video?._id}`} type={type}>
      <ImageWrapper type={type}>
        <Image type={type} src={video?.imgUrl} alt={video?.title} />
        <PlayOverlay>
          <FaPlay />
        </PlayOverlay>
        <InfoDuration>{formattedTotalDuration}</InfoDuration>
      </ImageWrapper>
      <Details type={type}>
        {type !== "sm" && (
          <ChannelImage 
            type={type} 
            src={channel.img || defaultProfile} 
            alt={channel.name}
          />
        )}
        <Texts>
          <Title title={video?.title}>{video?.title}</Title>
          <ChannelName>{channel.name || "User"}</ChannelName>
          <Info>
            <InfoItem> {formattedViews} {t("views")}
            </InfoItem>
            <Separator>•</Separator>
            <span>{formatTimeago(video?.createdAt, language)}</span>
          </Info>
        </Texts>
      </Details>
    </Container>
  );
};

export default Card;
