import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import Facebook from "@mui/icons-material/Facebook";
import Twitter from "@mui/icons-material/Twitter";
import WhatsApp from "@mui/icons-material/WhatsApp";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useLanguage } from "../utils/LanguageContext";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.bgLighter || "#1f1f1f"};
  padding: 24px;
  border-radius: 16px;
  width: 320px;
  text-align: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h3`
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text || "#fff"};
`;

const ShareButton = styled.button`
  width: 100%;
  margin: 6px 0;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.soft || "#333"};
  background: transparent;
  color: ${({ theme }) => theme.text || "#fff"};
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${({ theme }) => theme.soft || "#333"};
  }
`;

const ShareButtonWhat = styled(ShareButton)`
  &:hover {
    background: #25d366;
  }
`;

const ShareButtonX = styled(ShareButton)`
  &:hover {
    background: #000;
  }
`;

const ShareButtonFace = styled(ShareButton)`
  &:hover {
    background: #3c5a99;
  }
`;

const CloseButton = styled.button`
  margin-top: 16px;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.soft || "#333"};
  color: ${({ theme }) => theme.text || "#fff"};
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #ff3e6c;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.soft || "#2c2c2c"};
  color: ${({ theme }) => theme.text || "#fff"};
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.25);
  animation: ${slideUp} 0.3s ease forwards;
  z-index: 3000;
`;

const ButtonO = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: linear-gradient(135deg, #ff3e6c 0%, #0b67dc 100%);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: white;
  border-radius: 12px;
  padding: 12px 24px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 62, 108, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
  }
`;

const PlaylistInfo = styled.div`
  background: ${({ theme }) => theme.soft || "#2c2c2c"};
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const PlaylistName = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.text || "#fff"};
  margin: 0 0 4px 0;
`;

const PlaylistStats = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.textSoft || "#888"};
  margin: 0;
`;

export default function ShareModalPlaylist({ playlistId, playlistName, videoCount, userId }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const link = userId
    ? `${window.location.origin}/playlist/${userId}/${playlistId}`
    : `${window.location.origin}/shared-playlist/${playlistId}`;
  const { t } = useLanguage();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const shareText = t("sharePlaylistText", "", { playlistName, videoCount });

  return (
    <>
      <ButtonO onClick={() => setOpen(true)}>
        <ReplyOutlinedIcon /> {t("sharePlaylist") || "Share Playlist"}
      </ButtonO>

      {open && (
        <Overlay onClick={() => setOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <Title>{t("sharePlaylist") || "Share Playlist"}</Title>
            
            <PlaylistInfo>
              <PlaylistName>{playlistName}</PlaylistName>
              <PlaylistStats>{videoCount} videos</PlaylistStats>
            </PlaylistInfo>
            
            <ShareButton onClick={copyToClipboard}>
              <ContentCopyIcon /> {t("copyLink") || "Copiar enlace"}
            </ShareButton>
            <ShareButtonWhat
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + link)}`,
                  "_blank"
                )
              }
            >
              <WhatsApp /> WhatsApp
            </ShareButtonWhat>
            <ShareButtonX
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
                    link
                  )}`,
                  "_blank"
                )
              }
            >
              <Twitter /> Twitter/X
            </ShareButtonX>
            <ShareButtonFace
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    link
                  )}&quote=${encodeURIComponent(shareText)}`,
                  "_blank"
                )
              }
            >
              <Facebook /> Facebook
            </ShareButtonFace>
            <CloseButton onClick={() => setOpen(false)}>{t("close") || "Cerrar"}</CloseButton>
          </Modal>
        </Overlay>
      )}
      {toast && <Toast>✅ {t("linkCopied") || "Enlace copiado al portapapeles"}</Toast>}
    </>
  );
}
