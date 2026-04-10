import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "timeago.js";
import { formats } from "../pages/Video";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { EditVideo } from "./EditVideo";
import { DeleteAlert } from "./DeleteAlert";
import defaultProfile from "../img/profileUser.png";
import { useLanguage } from "../utils/LanguageContext";

const Wrapper = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(145deg, ${({ theme }) => theme.bgLighter}, ${({ theme }) => theme.bg});
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.soft};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
    border-color: ${({ theme }) => theme.accent};
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 260px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  background-color: #333;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    height: 180px;
  }
`;

const DurationBadge = styled.span`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
`;

const InfoSection = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.accent};
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ChannelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ChannelImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.accent};
  object-fit: cover;
`;

const ChannelName = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  font-weight: 500;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.textSoft};
  flex-wrap: wrap;
`;

const Views = styled.span`
  font-weight: 500;
`;

const Dot = styled.span`
  opacity: 0.5;
`;

const ActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 120px;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const EditButton = styled(ActionBtn)`
  background: linear-gradient(135deg, #0b67dc, #0b67dc);
  color: white;
  box-shadow: 0 4px 12px rgba(11, 103, 220, 0.4);
  
  &:hover {
    box-shadow: 0 6px 16px rgba(11, 103, 220, 0.5);
  }
  
  svg {
    font-size: 18px;
  }
`;

const DeleteButton = styled(ActionBtn)`
  background: linear-gradient(135deg, #f44336, #c62828);
  color: white;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
  
  &:hover {
    box-shadow: 0 6px 16px rgba(244, 67, 54, 0.5);
  }
  
  svg {
    font-size: 18px;
  }
`;

const Popover = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.bgLighter};
  border: 1px solid ${({ theme }) => theme.soft};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  padding: 24px;
  border-radius: 20px;
  z-index: 2000;
  width: 90%;
  max-width: 550px;
  animation: modalIn 0.25s ease-out;

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  z-index: 1999;
`;

const CardSec = ({ video }) => {
  const [channel, setChannel] = useState({});
  const { t } = useLanguage();

  const formattedTotalDuration = formats(video.duration);

  useEffect(() => {
    const fetchChannel = async () => {
      const res = await axios.get(`/users/find/${video.userId}`);
      setChannel(res.data);
    };
    fetchChannel();
  }, [video.userId]);

  const formattedViews = video.views.toLocaleString();
  const [open, setOpen] = useState(false);
  const [openO, setOpenO] = useState(false);

  const navigate = useNavigate();

  return (
    <>
      <Wrapper>
        <Container>
          <ImageWrapper>
            <Image
              src={video.imgUrl}
              onClick={() => navigate(`/video/${video._id}`)}
              alt={video.title}
            />
            <DurationBadge>{formattedTotalDuration}</DurationBadge>
          </ImageWrapper>
          
          <InfoSection>
            <Title onClick={() => navigate(`/video/${video._id}`)}>
              {video.title}
            </Title>
            
            <ChannelInfo>
              <ChannelImage 
                src={channel.img || defaultProfile} 
                alt={channel.name}
              />
              <ChannelName>{channel.name}</ChannelName>
            </ChannelInfo>
            
            <MetaInfo>
              <Views>{formattedViews} {t("views")}</Views>
              <Dot>•</Dot>
              <span>{format(video.createdAt)}</span>
            </MetaInfo>
          </InfoSection>

          <ActionsSection>
            <EditButton onClick={() => setOpen(true)}>
              <FiEdit3 />
              {t("edit")}
            </EditButton>
            <DeleteButton onClick={() => setOpenO(true)}>
              <FiTrash2 />
              {t("delete")}
            </DeleteButton>
          </ActionsSection>
        </Container>
      </Wrapper>

      {open && (
        <>
          <Overlay onClick={() => setOpen(false)} />
          <Popover>
            <EditVideo setOpen={setOpen} videoId={video._id} />
          </Popover>
        </>
      )}

      {openO && (
        <>
          <Overlay onClick={() => setOpenO(false)} />
          <Popover>
            <DeleteAlert setOpenO={setOpenO} videoId={video} />
          </Popover>
        </>
      )}
    </>
  );
};

export default CardSec;
