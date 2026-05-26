import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { formats } from '../utils/formatDuration';
import defaultProfile from '../img/profileUser.png';
import { useLanguage } from "../utils/LanguageContext";
import { formatTimeago } from "../utils/timeago";
import { FaPlay } from "react-icons/fa";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled(Link)`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: ${({ theme }) => theme.bgLighter};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  text-decoration: none;
  cursor: pointer;
  animation: ${fadeIn} 0.4s ease-out;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
    border-color: rgba(255, 62, 108, 0.4);
  }

  @media (max-width: 768px) {
    border-radius: 10px;

    &:hover {
      transform: none;
    }

    &:active {
      transform: scale(0.985);
    }
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #0c0c0c;
  overflow: hidden;
  flex-shrink: 0;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;

  ${Container}:hover & {
    transform: scale(1.04);
  }
`;

const PlayOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  transition: opacity 0.25s ease;

  svg {
    font-size: 36px;
    color: #fff;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45));
  }

  ${Container}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    opacity: 0.85;
    background: linear-gradient(180deg, transparent 55%, rgba(0, 0, 0, 0.55) 100%);

    svg {
      display: none;
    }
  }
`;

const Badge = styled.span`
  position: absolute;
  padding: 3px 7px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  color: #fff;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

const InfoDuration = styled(Badge)`
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.78);
`;

const InfoClassification = styled(Badge)`
  bottom: 6px;
  left: 6px;
  background: ${({ classification }) => {
    switch (classification) {
      case 'B': return 'rgba(255, 193, 7, 0.88)';
      case 'C': return 'rgba(255, 152, 0, 0.88)';
      case 'D': return 'rgba(244, 67, 54, 0.88)';
      default: return 'rgba(76, 175, 80, 0.88)';
    }
  }};
`;

const RankBadge = styled(Badge)`
  top: 6px;
  left: 6px;
  background: linear-gradient(135deg, #ff3e6c 0%, #ff6b8a 100%);
  box-shadow: 0 2px 8px rgba(255, 62, 108, 0.45);
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px 10px;
  min-width: 0;
`;

const Title = styled.h3`
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.35;
  color: ${({ theme }) => theme.text || "#fff"};
  transition: color 0.2s ease;

  ${Container}:hover & {
    color: #ff3e6c;
  }

  @media (max-width: 768px) {
    font-size: 13px;
    -webkit-line-clamp: 2;
  }
`;

const ChannelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const ChannelAvatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #333;
`;

const ChannelName = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Info = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: ${({ theme }) => theme.textSoft};
  line-height: 1.3;
`;

const Separator = styled.span`
  opacity: 0.45;
`;

const Card = ({ video, rank }) => {
  const [channel, setChannel] = useState({});
  const { language, t } = useLanguage();
  const formattedTotalDuration = formats(video?.duration);
  const formattedViews = video?.views?.toLocaleString() || "0";

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

  return (
    <Container to={`/video/${video?._id}`}>
      <ImageWrapper>
        <Image src={video?.imgUrl} alt={video?.title || "Video"} loading="lazy" />
        <PlayOverlay>
          <FaPlay />
        </PlayOverlay>
        {rank != null && <RankBadge>#{rank}</RankBadge>}
        <InfoClassification classification={video?.classification}>
          {video?.classification || "A"}
        </InfoClassification>
        <InfoDuration>{formattedTotalDuration}</InfoDuration>
      </ImageWrapper>
      <Details>
        <Title title={video?.title}>{video?.title}</Title>
        <ChannelRow>
          <ChannelAvatar
            src={channel.img || defaultProfile}
            alt={channel.name || "Channel"}
          />
          <ChannelName>{channel.name || "User"}</ChannelName>
        </ChannelRow>
        <Info>
          <span>{formattedViews} {t("views")}</span>
          <Separator>•</Separator>
          <span>{formatTimeago(video?.createdAt, language)}</span>
        </Info>
      </Details>
    </Container>
  );
};

export default Card;
