import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiX } from "react-icons/fi";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
`;

const Popover = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 400px;
  background-color: ${({ theme }) => theme.bgLighter || "#1e1e2f"};
  color: ${({ theme }) => theme.text || "#fff"};
  padding: 24px;
  border-radius: 16px;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
`;

const Close = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.textSoft};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.text};
  }
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin: 0 0 16px 0;
`;

const VideoTitle = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.textSoft};
  text-align: center;
  margin-bottom: 20px;
  padding: 12px;
  background-color: ${({ theme }) => theme.bg || "#15151f"};
  border-radius: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant }) => variant === "confirm" ? `
    background-color: #e94560;
    color: #fff;
    &:hover {
      background-color: #ff6b6b;
    }
  ` : `
    background-color: #333;
    color: #fff;
    &:hover {
      background-color: #444;
    }
  `}
`;

export const DeleteAlert = ({ setOpenO, videoId }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/videos/${videoId._id}`);
      setOpenO(false);
      if (res.status === 200) {
        navigate('/profile');
      }
    } catch (err) {
      console.error("Error deleting video:", err);
      setOpenO(false);
    }
  };

  return (
    <>
      <Overlay onClick={() => setOpenO(false)} />
      <Popover>
        <Close onClick={() => setOpenO(false)}>
          <FiX />
        </Close>
        <Title>Delete video?</Title>
        <VideoTitle title={videoId.title}>
          {videoId.title}
        </VideoTitle>
        <ButtonGroup>
          <Button variant="cancel" onClick={() => setOpenO(false)}>
            Cancel
          </Button>
          <Button variant="confirm" onClick={handleDelete}>
            Delete
          </Button>
        </ButtonGroup>
      </Popover>
    </>
  );
};
