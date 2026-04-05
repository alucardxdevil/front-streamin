import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { formats } from "../pages/Video";
import defaultProfile from '../img/profileUser.png';
import { formatTimeago } from "../utils/timeago";
import { useLanguage } from "../utils/LanguageContext";

const Container = styled.div`
  display: flex;
  width: 100%;
  max-width: 800px;
  background-color: ${({ theme }) => theme.bgLighter};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  margin-bottom: 16px;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 280px;
  height: 158px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px 0 0 12px;
  cursor: pointer;

  @media (max-width: 600px) {
    width: 100%;
    height: 180px;
    border-radius: 12px 12px 0 0;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${ImageWrapper}:hover & {
    transform: scale(1.05);
  }
`;

const DurationBadge = styled.span`
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  padding: 16px;
  gap: 12px;
  box-sizing: border-box;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const ChannelAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 36px;
    height: 36px;
  }
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.textSoft};
  }
`;

const ChannelName = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.text};
    text-decoration: underline;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft};
`;

const CardFollowed = ({ video }) => {
  const [channel, setChannel] = useState({});
  const { language } = useLanguage();
  
  const formattedTotalDuration = formats(video.duration);
  const formattedViews = video.views.toLocaleString();

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await axios.get(`/users/find/${video.userId}`);
        setChannel(res.data);
      } catch (err) {
        console.error("Error fetching channel:", err);
      }
    };
    fetchChannel();
  }, [video.userId]);

  return (
    <Container>
      <Link to={`/video/${video._id}`}>
        <ImageWrapper>
          <Image src={video.imgUrl} alt={video.title} />
          <DurationBadge>{formattedTotalDuration}</DurationBadge>
        </ImageWrapper>
      </Link>
      
      <Content>
        <Link to={`/profileUser/${channel.slug || channel._id}`}>
          <ChannelAvatar 
            src={channel.img || defaultProfile} 
            alt={channel.name}
          />
        </Link>
        
        <TextContent>
          <Link to={`/video/${video._id}`} style={{ textDecoration: 'none' }}>
            <Title title={video.title}>{video.title}</Title>
          </Link>
          
          <Link to={`/profileUser/${channel.slug || channel._id}`} style={{ textDecoration: 'none' }}>
            <ChannelName>{channel.name}</ChannelName>
          </Link>
          
          <MetaInfo>
            <span>{formattedViews} views</span>
            <span>•</span>
            <span>{formatTimeago(video.createdAt, language)}</span>
          </MetaInfo>
        </TextContent>
      </Content>
    </Container>
  );
};

export default CardFollowed;
