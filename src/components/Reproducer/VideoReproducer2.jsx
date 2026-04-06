import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import ReactPlayer from "react-player";
import { CircularProgress } from "@mui/material";
import useStreamSession from "../../hooks/useStreamSession";
import { getStreamUrl } from "../../utils/streamUrl";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeMuteIcon from "@mui/icons-material/VolumeMute";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import Replay10Icon from "@mui/icons-material/Replay10";
import Forward10Icon from "@mui/icons-material/Forward10";
import SettingsIcon from "@mui/icons-material/Settings";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import HighQualityIcon from "@mui/icons-material/HighQuality";

import screenfull from "screenfull";
import { useSelector } from "react-redux";
import { RiRestartLine } from "react-icons/ri";
import axios from "axios";
import { useLanguage } from "../../utils/LanguageContext";

/* ============= Animations ============= */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const fadeOutScale = keyframes`
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
`;

const pulseAnim = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.7; }
`;

const spinAnim = keyframes`
  to { transform: rotate(360deg); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* =========== Styled Components =========== */
const VideoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0;
  background: radial-gradient(circle at top, #0f0f0f 0%, #000 80%);
  animation: ${fadeIn} 0.6s ease-in;
  width: 100%;

  /* ── Mobile: fijo debajo del navbar, no se mueve al hacer scroll ── */
  @media (max-width: 768px) {
    position: fixed;
    top: 60px; /* Altura del navbar */
    left: 0;
    right: 0;
    z-index: 100;
  }
`;

const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1600px;
  padding-top: 56.25%; /* 16:9 aspect ratio fallback */
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.7);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: ${({ $showControls }) => ($showControls ? "auto" : "none")};
  user-select: none;

  &:hover {
    transform: scale(1.002);
  }

  /* ── Desktop: mini-player flotante en esquina inferior derecha ── */
  @media (min-width: 769px) {
    ${({ $sticky }) => $sticky && `
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: 320px;
      padding-top: 0;
      height: 180px; /* 320 * 9/16 */
      z-index: 9999;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.08);
      transform: none;
      cursor: pointer;
      overflow: hidden;
    `}
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0;
    cursor: pointer;
    padding-top: 56.25%;
  }
`;

/* Botón de cerrar el mini-player (solo desktop) */
const StickyCloseBtn = styled.button`
  display: none;

  @media (min-width: 769px) {
    display: ${({ $visible }) => ($visible ? "flex" : "none")};
    position: absolute;
    top: 6px;
    left: 6px;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const ControlsWrapper = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.3) 30%,
    transparent 60%,
    rgba(0, 0, 0, 0.3) 90%,
    rgba(0, 0, 0, 0.5) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  pointer-events: ${({ $show }) => ($show ? "auto" : "none")};
  transition: opacity 0.35s ease;
  z-index: 5;

  @media (max-width: 768px) {
    pointer-events: auto;
  }
`;

/* ===== Play/Pause Feedback Animation ===== */
const FeedbackIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
  animation: ${fadeOutScale} 0.6s ease-out forwards;

  & svg {
    font-size: 80px;
    color: rgba(255, 255, 255, 0.85);
    filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.5));
  }

  @media (max-width: 768px) {
    & svg {
      font-size: 56px;
    }
  }
`;

/* ===== Center Controls ===== */
const CenterControls = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 6;
  transition: opacity 0.3s ease, transform 0.3s ease;

  /* En mini-player: ocultar los controles centrales */
  ${({ $sticky }) => $sticky && `
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, calc(-50% + 8px));
  `}

  @media (max-width: 768px) {
    gap: 24px;
  }
`;

const CenterButton = styled.button`
  color: #f1f1f1;
  font-size: ${({ $large }) => ($large ? "clamp(40px, 8vw, 70px)" : "clamp(28px, 5vw, 44px)")};
  border: none;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: ${({ $large }) => ($large ? "clamp(56px, 10vw, 80px)" : "clamp(40px, 7vw, 56px)")};
  height: ${({ $large }) => ($large ? "clamp(56px, 10vw, 80px)" : "clamp(40px, 7vw, 56px)")};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  filter: drop-shadow(0 0 8px rgba(11, 103, 220, 0.4));

  & svg {
    font-size: inherit !important;
  }

  &:hover {
    color: #fff;
    transform: scale(1.12);
    background: rgba(11, 103, 220, 0.3);
    filter: drop-shadow(0 0 16px rgba(11, 103, 220, 0.8));
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    font-size: ${({ $large }) => ($large ? "36px" : "24px")};
    width: ${({ $large }) => ($large ? "52px" : "40px")};
    height: ${({ $large }) => ($large ? "52px" : "40px")};
  }
`;

/* ===== Bottom Controls ===== */
const BottomControls = styled.div`
  padding: 0 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: ${slideUp} 0.3s ease;

  @media (max-width: 768px) {
    padding: 0 8px 8px;
  }
`;

/* ===== Timeline / Progress Bar ===== */
const TimelineContainer = styled.div`
  position: relative;
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 0;

  &:hover .timeline-bar {
    height: 6px;
  }

  &:hover .timeline-knob {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }

  &:hover .timeline-tooltip {
    opacity: 1;
  }
`;

const TimelineBar = styled.div`
  position: relative;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: visible;
  transition: height 0.15s ease;
`;

const BufferedBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  transition: width 0.4s ease;
  pointer-events: none;
`;

const PlayedBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(90deg, #0b67dc 0%, #5fa8ff 100%);
  border-radius: 4px;
  pointer-events: none;
  z-index: 1;
`;

const TimelineKnob = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%) scale(0);
  width: 14px;
  height: 14px;
  background: #e94560;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(233, 69, 96, 0.6), 0 0 0 3px rgba(11, 103, 220, 0.2);
  z-index: 2;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
`;

const TimelineTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  margin-bottom: 6px;
  z-index: 10;
`;

/* ===== Control Row ===== */
const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const ControlBtn = styled.button`
  color: #e0e0e0;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 6px;
  position: relative;

  & svg {
    font-size: 22px !important;
  }

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.94);
  }

  @media (max-width: 768px) {
    padding: 4px;
    & svg {
      font-size: 20px !important;
    }
  }
`;

const TimeDisplay = styled.span`
  color: #ccc;
  font-size: 13px;
  font-weight: 400;
  font-family: 'Segoe UI', system-ui, sans-serif;
  letter-spacing: 0.3px;
  padding: 0 8px;
  white-space: nowrap;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 0 4px;
  }
`;

/* ===== Volume Slider ===== */
const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;

  &:hover .volume-slider-wrap {
    width: 80px;
    opacity: 1;
    margin-left: 4px;
  }

  @media (max-width: 600px) {
    &:hover .volume-slider-wrap {
      width: 60px;
    }
  }
`;

const VolumeSliderWrap = styled.div`
  width: 0;
  opacity: 0;
  overflow: hidden;
  transition: width 0.25s ease, opacity 0.25s ease, margin 0.25s ease;
  display: flex;
  align-items: center;
  margin-left: 0;
`;

const VolumeSliderTrack = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 2px;
  cursor: pointer;
`;

const VolumeSliderFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(90deg, #0b67dc, #5fa8ff);
  border-radius: 2px;
  pointer-events: none;
`;

const VolumeSliderThumb = styled.div`
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #e94560;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(233, 69, 96, 0.5);
  pointer-events: none;
  transition: transform 0.1s ease;
`;

/* ===== Settings Menu ===== */
const MenuOverlay = styled.div`
  position: absolute;
  bottom: 56px;
  right: 0;
  background: rgba(20, 20, 20, 0.96);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  min-width: 220px;
  max-height: 340px;
  overflow-y: auto;
  z-index: 50;
  animation: ${fadeInScale} 0.2s ease;
  transform-origin: bottom right;

  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;

  /* Chrome/Edge/Safari scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    min-width: 180px;
    right: 0;
    bottom: 48px;
    max-height: 260px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    min-width: 160px;
    right: 0;
    bottom: 44px;
    max-height: 220px;
  }
`;

const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  & svg {
    font-size: 18px !important;
    color: #aaa;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  color: ${({ $active }) => ($active ? "#5fa8ff" : "#ddd")};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  gap: 10px;

  &:hover {
    background: rgba(11, 103, 220, 0.12);
    color: #fff;
  }

  & svg {
    font-size: 18px !important;
  }

  @media (max-width: 768px) {
    padding: 9px 12px;
    font-size: 12px;
  }
`;

const MenuItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const MenuItemRight = styled.span`
  color: #888;
  font-size: 12px;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 0;
`;

/* ===== Timeline que se simplifica en mini-player ===== */
const MiniTimelineContainer = styled.div`
  transition: opacity 0.3s ease, max-height 0.3s ease;

  ${({ $sticky }) => $sticky && `
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    pointer-events: none;
  `}

  ${({ $sticky }) => !$sticky && `
    opacity: 1;
    max-height: 40px;
  `}
`;

/* ===== Countdown Overlay ===== */
const CountdownOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 30;
  animation: ${fadeInScale} 0.3s ease;
`;

const CountdownText = styled.div`
  color: white;
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 12px;
  animation: ${pulseAnim} 1s infinite;
  text-shadow: 0 0 20px rgba(11, 103, 220, 0.5);
`;

const CountdownMessage = styled.div`
  color: #aaa;
  font-size: 16px;
  text-align: center;
  max-width: 80%;
  margin-bottom: 20px;
`;

const CountdownButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const CountdownButton = styled.button`
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: scale(1.04);
  }
  &:active {
    transform: scale(0.97);
  }
`;

const CancelBtn = styled(CountdownButton)`
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const NextBtn = styled(CountdownButton)`
  background: linear-gradient(135deg, #0b67dc, #5fa8ff);
  color: #fff;

  &:hover {
    background: linear-gradient(135deg, #1a77ff, #6fb5ff);
    box-shadow: 0 4px 16px rgba(11, 103, 220, 0.4);
  }
`;

/* ===== Top Bar ===== */
const TopBar = styled.div`
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: opacity 0.3s ease, transform 0.3s ease;

  /* En mini-player: ocultar el top bar */
  ${({ $sticky }) => $sticky && `
    opacity: 0;
    pointer-events: none;
    transform: translateY(-8px);
  `}
`;

const VideoTitle = styled.div`
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;

  @media (max-width: 768px) {
    font-size: 13px;
    max-width: 60%;
  }
`;

/* ===== Click Overlay (for play/pause on video click) ===== */
const ClickOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  cursor: pointer;
`;

/* ===== Loading Spinner ===== */
const LoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* ============= Utils ============= */
const formatTime = (sec) => {
  if (!sec || isNaN(sec)) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s}`;
  return `${m}:${s}`;
};

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/* =========== MAIN COMPONENT =========== */
export default function VideoReproducer({ onVideoEnd, countdown = 5, onViewCounted }) {
  const { currentVideo } = useSelector((s) => s.video);
  const { currentUser } = useSelector((s) => s.user || {});
  const { t } = useLanguage();

  // ── Token de sesión anónimo (Capa 3 de protección) ────────────────────────
  // Permite que usuarios sin registro vean videos, pero solo a través del proxy
  const { sessionToken, sessionReady } = useStreamSession();

  // ── Verificar si el video está listo para reproducción ───────────────────
  // Un video puede reproducirse si:
  // 1. Tiene HLS listo (hlsMasterUrl + status 'ready')
  // 2. Tiene un archivo de video directo (videoUrl o videoKey)
  const videoStatus = currentVideo?.status || 'ready';
  const hasDirectVideo = currentVideo?.videoUrl || currentVideo?.videoKey;
  const hasHLS = currentVideo?.hlsMasterUrl && videoStatus === 'ready';
  const isVideoReady = hasHLS || !!hasDirectVideo;

  // ── Calidades disponibles dinámicamente desde el video ─────────────────────
  // El backend guarda en currentVideo.qualities las calidades reales generadas
  // (ej: ["480p", "360p", "240p"] para un video de baja resolución)
  const availableQualities = useMemo(() => {
    const quals = currentVideo?.qualities;
    if (quals && Array.isArray(quals) && quals.length > 0) {
      return ["Auto", ...quals];
    }
    // Fallback si no hay qualities (videos legacy)
    return ["Auto"];
  }, [currentVideo?.qualities]);

  // ── URL del proxy (nunca expone la URL directa de B2) ─────────────────────
  // getStreamUrl() construye la URL correcta para desarrollo y producción
  // Se incluye el sessionToken como query param _st para que las peticiones
  // nativas del navegador (que no pueden enviar headers personalizados) lo incluyan.
  // IMPORTANTE: No generar URL hasta que el sessionToken esté disponible
  // y el video esté en estado "ready".
  const proxyVideoUrl = useMemo(() => {
    if (currentVideo?._id) {
      // No intentar reproducir si el video no está listo
      if (!isVideoReady) return null;
      // Esperar a que el token de sesión esté disponible antes de generar la URL
      if (!sessionToken) return null;
      return getStreamUrl(currentVideo._id, sessionToken);
    }
    // Fallback para videos sin _id (legacy)
    return currentVideo?.videoUrl || null;
  }, [currentVideo?._id, currentVideo?.videoUrl, sessionToken, isVideoReady]);

  // Core state
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("Auto");

  // UI state
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [durationDBSaved, setDurationDBSaved] = useState(false);
  const [countdownTime, setCountdownTime] = useState(null);
  const [seeking, setSeeking] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);
  // Sticky player state (solo mobile)
  const [isStickyActive, setIsStickyActive] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState("main"); // main, speed, quality

  // Feedback animation
  const [feedbackIcon, setFeedbackIcon] = useState(null);
  const feedbackKey = useRef(0);

  // Refs
  const hideTimeout = useRef(null);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const playerWrapperRef = useRef(null); // Ref para el wrapper del player (sticky)
  const countdownTimerRef = useRef(null);
  const timelineRef = useRef(null);
  const volumeTrackRef = useRef(null);
  const menuRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const videoReadyRef = useRef(false); // Track if video has been initially loaded
  const bufferingRef = useRef(false);  // Track active buffering state
  const loadingTimerRef = useRef(null); // Debounce timer for loading state
  const playingRef = useRef(playing);  // Ref para acceder al estado playing en callbacks
  const hlsRef = useRef(null);         // Referencia a la instancia de hls.js
  const [hlsLevels, setHlsLevels] = useState([]); // Niveles HLS detectados por hls.js

  /**
   * Flag de sesión para el conteo de vistas.
   * Se usa un ref (no state) para evitar re-renders y garantizar
   * que la lógica de tracking no se ejecute más de una vez por video.
   * Se resetea a `false` cada vez que cambia el video (ver useEffect de reset).
   */
  const viewCountedRef = useRef(false);

  /* ========== Show feedback icon ========== */
  const showFeedback = useCallback((icon) => {
    feedbackKey.current += 1;
    setFeedbackIcon({ icon, key: feedbackKey.current });
    setTimeout(() => setFeedbackIcon(null), 600);
  }, []);

  /* ========== HLS Quality Control ========== */
  /**
   * Obtiene la instancia de hls.js desde ReactPlayer.
   * ReactPlayer expone el player interno via getInternalPlayer('hls').
   */
  const getHlsInstance = useCallback(() => {
    try {
      const internal = playerRef.current?.getInternalPlayer('hls');
      return internal || null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Cambia la calidad del video via hls.js.
   * - "Auto" → currentLevel = -1 (ABR automático)
   * - "720p" → busca el nivel por URL, height, width o índice
   *
   * Estrategia de búsqueda (en orden):
   *  1. URL del nivel contiene el nombre del perfil (ej: "480p/")
   *  2. height del nivel coincide con el valor numérico
   *  3. width del nivel coincide con el ancho del perfil
   *  4. Índice basado en el orden de qualities del backend
   */
  const handleQualityChange = useCallback((q) => {
    setQuality(q);
    const hls = getHlsInstance();
    if (!hls || !hls.levels || hls.levels.length === 0) return;

    if (q === "Auto") {
      hls.currentLevel = -1;
      console.log("[HLS] Calidad: Auto (ABR)");
      return;
    }

    const targetValue = parseInt(q); // "480p" → 480
    const profileName = q.toLowerCase(); // "480p"

    // Estrategia 1: Buscar por URL del nivel (más confiable)
    let levelIndex = hls.levels.findIndex((level) => {
      const url = level.url?.[0] || level.uri || "";
      return url.includes(`${profileName}/`) || url.includes(`/${profileName}`);
    });

    // Estrategia 2: Buscar por height
    if (levelIndex < 0 && !isNaN(targetValue)) {
      levelIndex = hls.levels.findIndex((level) => level.height === targetValue);
    }

    // Estrategia 3: Buscar por width (para perfiles definidos por width)
    if (levelIndex < 0 && !isNaN(targetValue)) {
      // Mapeo de nombre de perfil a width esperado
      const widthMap = { "1080p": 1920, "720p": 1280, "480p": 854, "360p": 640, "240p": 426 };
      const targetWidth = widthMap[profileName];
      if (targetWidth) {
        levelIndex = hls.levels.findIndex((level) => level.width === targetWidth);
      }
    }

    // Estrategia 4: Usar índice basado en el orden de qualities del backend
    if (levelIndex < 0) {
      const quals = currentVideo?.qualities || [];
      const qIndex = quals.indexOf(q);
      if (qIndex >= 0 && qIndex < hls.levels.length) {
        levelIndex = qIndex;
      }
    }

    if (levelIndex >= 0) {
      hls.currentLevel = levelIndex;
      const level = hls.levels[levelIndex];
      console.log(`[HLS] Calidad fijada: ${q} (nivel ${levelIndex}, ${level.width}x${level.height})`);
    } else {
      console.warn(`[HLS] No se encontró nivel para ${q}. Niveles disponibles:`, hls.levels.map((l, i) => `${i}: ${l.width}x${l.height}`));
    }
  }, [getHlsInstance, currentVideo?.qualities]);

  /* ========== Save duration once ========== */
  const handleDuration = async (d) => {
    setDuration(d);
    if (currentVideo?.duration && currentVideo.duration > 0) {
      setDurationDBSaved(true);
      return;
    }
    if (durationDBSaved) return;
    if (!currentUser) return;
    try {
      await axios.put(`/videos/${currentVideo._id}`, { duration: d });
      setDurationDBSaved(true);
    } catch (err) {
      console.log("Error guardando duración:", err.message);
    }
  };

  /* ========== Play/Pause ========== */
  const handlePlayPause = useCallback(() => {
    if (videoEnded) {
      playerRef.current?.seekTo(0);
      setVideoEnded(false);
      setPlaying(true);
      showFeedback("play");
    } else {
      setPlaying((p) => {
        showFeedback(p ? "pause" : "play");
        return !p;
      });
    }
  }, [videoEnded, showFeedback]);

  /* ========== Volume ========== */
  const handleMuteToggle = useCallback(() => {
    if (muted) {
      setMuted(false);
      setVolume(prevVolume > 0 ? prevVolume : 0.5);
    } else {
      setPrevVolume(volume);
      setMuted(true);
    }
  }, [muted, volume, prevVolume]);

  const handleVolumeChange = useCallback((e) => {
    const track = volumeTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newVol = x / rect.width;
    setVolume(newVol);
    setMuted(newVol === 0);
    if (newVol > 0) setPrevVolume(newVol);
  }, []);

  const handleVolumeMouseDown = useCallback((e) => {
    handleVolumeChange(e);
    const onMove = (ev) => handleVolumeChange(ev);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [handleVolumeChange]);

  /* ========== Seek / Timeline ========== */
  const getTimeFromEvent = useCallback((e) => {
    const bar = timelineRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    return (x / rect.width) * duration;
  }, [duration]);

  const handleTimelineMouseMove = useCallback((e) => {
    const bar = timelineRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    setHoverTime(pct * duration);
    setHoverPos(x);
  }, [duration]);

  const handleTimelineMouseLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  const handleTimelineMouseDown = useCallback((e) => {
    setSeeking(true);
    const time = getTimeFromEvent(e);
    const fraction = time / duration;
    setPlayed(fraction);
    playerRef.current?.seekTo(fraction);

    if (videoEnded && fraction < 0.999) {
      setVideoEnded(false);
      setPlaying(true);
    }

    const onMove = (ev) => {
      const t = getTimeFromEvent(ev);
      const f = t / duration;
      setPlayed(f);
    };

    const onUp = (ev) => {
      const t = getTimeFromEvent(ev);
      const f = t / duration;
      setPlayed(f);
      playerRef.current?.seekTo(f);
      setSeeking(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [duration, getTimeFromEvent, videoEnded]);

  /* ========== Progress ========== */
  const handleProgress = useCallback((state) => {
    // Actualizar la barra de progreso solo si no se está haciendo seek manual
    if (!seeking) {
      setPlayed(state.played);
    }
    setLoaded(state.loaded);

    /**
     * ── LÓGICA DE CONTEO DE VISTAS ──
     *
     * Condiciones para registrar una vista:
     *  1. El callback `onViewCounted` debe estar definido (pasado desde Video.jsx).
     *  2. La vista NO debe haberse contado ya en esta sesión (`viewCountedRef.current === false`).
     *  3. El usuario debe haber visto al menos el 50% del video (`state.played >= 0.5`).
     *
     * Por qué usamos `viewCountedRef` en lugar de state:
     *  - Un ref no provoca re-renders, lo que evita efectos secundarios.
     *  - Su valor persiste entre renders sin necesidad de incluirlo en dependencias.
     *  - Se resetea a `false` en el useEffect de reset de video (ver abajo).
     *
     * Casos edge manejados:
     *  - Seek adelante al 50%+: `state.played` ya supera 0.5, se cuenta igualmente.
     *  - Rebobinar después de contar: el flag ya está en `true`, no se vuelve a contar.
     *  - Replay del video: el useEffect de reset pone el flag en `false` de nuevo,
     *    pero solo si el usuario navega a otro video. Si hace replay del mismo video
     *    sin cambiar de ruta, el flag permanece en `true` (comportamiento intencional:
     *    una vista por sesión de reproducción del mismo video).
     */
    if (onViewCounted && !viewCountedRef.current && state.played >= 0.5) {
      // Marcar como contada ANTES de llamar al callback para evitar race conditions
      viewCountedRef.current = true;
      onViewCounted();
    }
  }, [seeking, onViewCounted]);

  /* ========== Fullscreen ========== */
  const toggleFullScreen = useCallback(() => {
    if (screenfull.isEnabled) {
      screenfull.toggle(playerContainerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!screenfull.isEnabled) return;
    const onChange = () => setIsFullscreen(screenfull.isFullscreen);
    screenfull.on("change", onChange);
    return () => screenfull.off("change", onChange);
  }, []);

  /* ========== Countdown ========== */
  const cancelCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdownTime(null);
  }, []);

  const playNextNow = useCallback(() => {
    cancelCountdown();
    if (onVideoEnd) onVideoEnd();
  }, [cancelCountdown, onVideoEnd]);

  /* ========== Mouse activity ========== */
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (!menuOpen) setShowControls(false);
    }, 3000);
  }, [menuOpen]);

  const handleMouseLeave = useCallback(() => {
    if (!menuOpen) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => setShowControls(false), 1000);
    }
  }, [menuOpen]);

  /* ========== Settings Menu ========== */
  const toggleMenu = useCallback(() => {
    setMenuOpen((p) => {
      if (p) setMenuView("main");
      return !p;
    });
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setMenuView("main");
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  /* ========== Keyboard shortcuts ========== */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          handlePlayPause();
          break;
        case "arrowleft":
          e.preventDefault();
          playerRef.current?.seekTo(
            Math.max(0, (playerRef.current?.getCurrentTime() || 0) - 10) / duration
          );
          break;
        case "arrowright":
          e.preventDefault();
          playerRef.current?.seekTo(
            Math.min(duration, (playerRef.current?.getCurrentTime() || 0) + 10) / duration
          );
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((v) => {
            const nv = Math.min(1, v + 0.05);
            setMuted(false);
            return nv;
          });
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((v) => {
            const nv = Math.max(0, v - 0.05);
            if (nv === 0) setMuted(true);
            return nv;
          });
          break;
        case "m":
          e.preventDefault();
          handleMuteToggle();
          break;
        case "f":
          e.preventDefault();
          toggleFullScreen();
          break;
        case "escape":
          if (menuOpen) {
            setMenuOpen(false);
            setMenuView("main");
          }
          break;
        case "j":
          e.preventDefault();
          playerRef.current?.seekTo(
            Math.max(0, (playerRef.current?.getCurrentTime() || 0) - 10) / duration
          );
          break;
        case "l":
          e.preventDefault();
          playerRef.current?.seekTo(
            Math.min(duration, (playerRef.current?.getCurrentTime() || 0) + 10) / duration
          );
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause, handleMuteToggle, toggleFullScreen, duration, menuOpen]);

  /* ========== Reset on video change ========== */
  useEffect(() => {
    setVideoEnded(false);
    setDurationDBSaved(false);
    setShowControls(true);
    setCountdownTime(null);
    setPlaying(true);
    setPlayed(0);
    setLoaded(0);
    setMenuOpen(false);
    setMenuView("main");
    setQuality("Auto");           // Reset calidad a Auto
    setHlsLevels([]);             // Limpiar niveles HLS
    hlsRef.current = null;        // Limpiar referencia hls.js
    // Mostrar spinner solo brevemente al cambiar de video, se ocultará en onReady
    setLoading(true);
    videoReadyRef.current = false; // Reset video ready state
    bufferingRef.current = false;  // Reset buffering state
    // Limpiar timer de debounce si existe
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    /**
     * Resetear el flag de vista al cambiar de video.
     * Esto permite que el nuevo video pueda registrar su propia vista
     * cuando el usuario alcance el 50% de reproducción.
     */
    viewCountedRef.current = false;

    // Scroll to top when video changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 3000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [currentVideo]);

  /* ========== Sticky Player ========== */

  // Sincronizar playingRef con el estado playing (para callbacks del IntersectionObserver)
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  /**
   * Mini-player flotante en DESKTOP (≥769px):
   * Usa IntersectionObserver para detectar cuando el player sale del viewport.
   * Cuando sale y el video está reproduciéndose, activa el mini-player flotante
   * en la esquina inferior derecha.
   */
  useEffect(() => {
    const isDesktop = () => window.innerWidth >= 769;

    const wrapper = playerWrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        // Activar mini-player solo en desktop cuando el player sale del viewport
        if (!isVisible && playingRef.current && !stickyDismissed && isDesktop()) {
          setIsStickyActive(true);
        } else {
          setIsStickyActive(false);
        }
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(wrapper);

    // Desactivar mini-player si se redimensiona a mobile
    const handleResize = () => {
      if (!isDesktop()) {
        setIsStickyActive(false);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [stickyDismissed]);

  // Desactivar mini-player desktop cuando el video se pausa o termina
  useEffect(() => {
    if (!playing || videoEnded) {
      setIsStickyActive(false);
    }
  }, [playing, videoEnded]);

  // Resetear el estado de dismiss al cambiar de video
  useEffect(() => {
    setStickyDismissed(false);
  }, [currentVideo]);

  /* ========== Cleanup ========== */
  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  /* ========== Computed values ========== */
  const currentTime = playerRef.current?.getCurrentTime() || 0;
  const volumeIcon = muted || volume === 0
    ? <VolumeOffIcon />
    : volume < 0.3
      ? <VolumeMuteIcon />
      : volume < 0.7
        ? <VolumeDownIcon />
        : <VolumeUpIcon />;

  const speedLabel = playbackRate === 1 ? t("normalSpeed") : `${playbackRate}x`;
  const qualityLabel = quality;

  /* ========== Render Menu Content ========== */
  const renderMenuContent = () => {
    if (menuView === "speed") {
      return (
        <>
          <MenuHeader onClick={() => setMenuView("main")}>
            <ArrowBackIosNewIcon /> Velocidad de reproducción
          </MenuHeader>
          {SPEED_OPTIONS.map((speed) => (
            <MenuItem
              key={speed}
              $active={playbackRate === speed}
              onClick={() => {
                setPlaybackRate(speed);
                setMenuView("main");
              }}
            >
              <MenuItemLeft>
                {playbackRate === speed && <CheckIcon />}
                <span style={{ marginLeft: playbackRate === speed ? 0 : 28 }}>
                  {speed === 1 ? t("normalSpeed") : `${speed}x`}
                </span>
              </MenuItemLeft>
            </MenuItem>
          ))}
        </>
      );
    }

    if (menuView === "quality") {
      return (
        <>
          <MenuHeader onClick={() => setMenuView("main")}>
            <ArrowBackIosNewIcon /> Calidad
          </MenuHeader>
          {availableQualities.map((q) => (
            <MenuItem
              key={q}
              $active={quality === q}
              onClick={() => {
                handleQualityChange(q);
                setMenuView("main");
              }}
            >
              <MenuItemLeft>
                {quality === q && <CheckIcon />}
                <span style={{ marginLeft: quality === q ? 0 : 28 }}>
                  {q}
                </span>
              </MenuItemLeft>
            </MenuItem>
          ))}
        </>
      );
    }

    // Main menu
    return (
      <>
        <MenuItem onClick={() => setMenuView("speed")}>
          <MenuItemLeft>
            <SpeedIcon />
            <span>Velocidad</span>
          </MenuItemLeft>
          <MenuItemRight>{speedLabel}</MenuItemRight>
        </MenuItem>
        <MenuDivider />
        <MenuItem onClick={() => setMenuView("quality")}>
          <MenuItemLeft>
            <HighQualityIcon />
            <span>Calidad</span>
          </MenuItemLeft>
          <MenuItemRight>{qualityLabel}</MenuItemRight>
        </MenuItem>
      </>
    );
  };

  /* ============= RENDER ============= */
  return (
    <VideoWrapper>
      {/*
        Contenedor de posición: siempre en el flujo del documento.
        El IntersectionObserver observa este elemento para detectar
        cuándo el player sale del viewport (solo desktop).
      */}
      <div ref={playerWrapperRef} style={{ width: "100%", position: "relative" }}>
        <PlayerWrapper
          ref={playerContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          $showControls={showControls}
          $sticky={isStickyActive}
        >
          {/* Botón para cerrar el mini-player (solo desktop) */}
          <StickyCloseBtn
            $visible={isStickyActive}
            onClick={(e) => {
              e.stopPropagation();
              setStickyDismissed(true);
              setIsStickyActive(false);
            }}
            title="Cerrar mini reproductor"
          >
            ✕
          </StickyCloseBtn>
        {/* Solo renderizar ReactPlayer cuando la sesión esté lista y tengamos URL.
            Esto evita que se haga la primera petición sin token de sesión. */}
        {proxyVideoUrl && <ReactPlayer
          ref={playerRef}
          url={proxyVideoUrl}
          width="100%"
          height="100%"
          playing={playing}
          muted={muted}
          controls={false}
          volume={volume}
          playbackRate={playbackRate}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={() => {
            setVideoEnded(true);
            setPlaying(false);
            setShowControls(true);

            if (onVideoEnd) {
              setCountdownTime(countdown);
              countdownTimerRef.current = setInterval(() => {
                setCountdownTime((prev) => {
                  if (prev <= 1) {
                    clearInterval(countdownTimerRef.current);
                    countdownTimerRef.current = null;
                    onVideoEnd();
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);
            }
          }}
          onReady={() => {
            // El video está listo para reproducirse: ocultar spinner inmediatamente
            videoReadyRef.current = true;
            bufferingRef.current = false;
            if (loadingTimerRef.current) {
              clearTimeout(loadingTimerRef.current);
              loadingTimerRef.current = null;
            }
            setLoading(false);

            // Firefox fix: escuchar el evento "canplay" del <video> element
            // para reintentar play() UNA SOLA VEZ cuando Firefox tiene datos
            // decodificables listos. Esto resuelve la race condition sin causar
            // saltos/loops de seek como lo haría un reintento en cada BUFFER_APPENDED.
            if (playing && playerRef.current) {
              const internalPlayer = playerRef.current.getInternalPlayer();
              if (internalPlayer && internalPlayer.paused) {
                const tryPlay = () => {
                  if (internalPlayer.paused && playingRef.current) {
                    const p = internalPlayer.play();
                    if (p && typeof p.catch === 'function') {
                      p.catch(() => {});
                    }
                  }
                };
                // "canplay" se dispara cuando el navegador puede empezar a reproducir
                // sin necesidad de más buffering. Es el momento seguro para play().
                internalPlayer.addEventListener("canplay", tryPlay, { once: true });
              }
            }

            // Capturar instancia de hls.js para control de calidad
            const hls = getHlsInstance();
            if (hls) {
              hlsRef.current = hls;
              // Escuchar cuando se cargan los niveles del manifest
              const onManifestParsed = (event, data) => {
                const levels = hls.levels || [];
                setHlsLevels(levels);
                console.log(`[HLS] Manifest parseado: ${levels.length} niveles`, levels.map(l => `${l.height}p`));
              };
              // Escuchar errores HLS para recuperación automática
              const onHlsError = (event, data) => {
                if (data.fatal) {
                  console.error(`[HLS] Error fatal: ${data.type} - ${data.details}`);
                  switch (data.type) {
                    case 'networkError':
                      console.log('[HLS] Intentando recuperar de error de red...');
                      hls.startLoad();
                      break;
                    case 'mediaError':
                      console.log('[HLS] Intentando recuperar de error de media...');
                      hls.recoverMediaError();
                      break;
                    default:
                      console.error('[HLS] Error no recuperable, destruyendo y recreando...');
                      // Último recurso: destruir hls.js y dejar que ReactPlayer lo reinicie
                      hls.destroy();
                      break;
                  }
                } else {
                  // Errores no fatales: recuperación proactiva
                  switch (data.details) {
                    case 'bufferStalledError':
                      // Buffer vacío — normal al iniciar/cambiar video o en Firefox.
                      // Forzar recarga silenciosamente.
                      hls.startLoad();
                      break;
                    case 'levelLoadTimeOut':
                    case 'fragLoadTimeOut':
                      // Timeout al cargar playlist/fragmento: reintentar la carga
                      console.log(`[HLS] Timeout (${data.details}) — reintentando carga`);
                      hls.startLoad();
                      break;
                    default:
                      // Otros errores no fatales: solo log
                      break;
                  }
                }
              };
              // Usar los eventos de hls.js directamente
              if (hls.constructor?.Events) {
                hls.on(hls.constructor.Events.MANIFEST_PARSED, onManifestParsed);
                hls.on(hls.constructor.Events.ERROR, onHlsError);
              }
              // Si los niveles ya están cargados (manifest ya parseado)
              if (hls.levels && hls.levels.length > 0) {
                setHlsLevels(hls.levels);
              }
            }
          }}
          onBuffer={() => {
            // Mostrar spinner con un pequeño debounce (300ms) para evitar
            // flashes de spinner en micro-interrupciones de red
            bufferingRef.current = true;
            if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
            loadingTimerRef.current = setTimeout(() => {
              // Solo mostrar si aún estamos en buffering
              if (bufferingRef.current) {
                setLoading(true);
              }
            }, 300);
          }}
          onBufferEnd={() => {
            // El buffer se completó: ocultar spinner siempre
            bufferingRef.current = false;
            if (loadingTimerRef.current) {
              clearTimeout(loadingTimerRef.current);
              loadingTimerRef.current = null;
            }
            setLoading(false);
          }}
          onPlay={() => {
            // Al iniciar reproducción, ocultar spinner y limpiar estado
            bufferingRef.current = false;
            if (loadingTimerRef.current) {
              clearTimeout(loadingTimerRef.current);
              loadingTimerRef.current = null;
            }
            setLoading(false);
            if (videoEnded) setVideoEnded(false);
          }}
          onError={(e, data) => {
            // ── Errores HLS (vienen de hls.js via ReactPlayer) ──
            if (data?.type === 'hlsError' || data?.type === 'networkError' || data?.type === 'mediaError') {
              const details = data?.details || '';
              const isFatal = !!data?.fatal;

              // Errores no fatales: hls.js se recupera solo, pero ayudamos
              if (!isFatal) {
                if (details === 'bufferStalledError') {
                  // Buffer vacío — normal al inicio o cambio de video. Silencioso.
                  const hls = getHlsInstance();
                  if (hls) hls.startLoad();
                  return;
                }
                if (details === 'levelLoadTimeOut' || details === 'fragLoadTimeOut' || details === 'manifestLoadTimeOut') {
                  // Timeout: reintentar carga silenciosamente
                  const hls = getHlsInstance();
                  if (hls) hls.startLoad();
                  return;
                }
                // Otros errores no fatales: silenciar (ABR switching, etc)
                return;
              }

              // ── Errores fatales: intentar recuperación ──
              console.error(`[HLS] Error fatal: ${data?.type} - ${details}`);
              const hls = getHlsInstance();
              if (hls) {
                if (data?.type === 'mediaError' || details.includes('buffer')) {
                  console.log("[HLS] Recuperando con recoverMediaError...");
                  hls.recoverMediaError();
                  return;
                }
                if (data?.type === 'networkError' || details.includes('Load') || details.includes('frag')) {
                  console.log("[HLS] Recuperando con startLoad...");
                  hls.startLoad();
                  return;
                }
              }
              // Si no se pudo recuperar, no hacer nada más (dejar que ReactPlayer maneje)
              return;
            }

            // ── Errores del elemento <video> nativo ──
            // DOMException de Firefox: "The fetching process was aborted"
            // Esto pasa cuando play() se llama antes de que hls.js tenga buffer.
            // Programar un reintento — hls.js llenará el buffer y onBufferEnd/BUFFER_APPENDED
            // también reintentarán play().
            if (e instanceof DOMException) {
              return;
            }
            // Error genérico de <video> (Event type='error'): puede pasar cuando
            // el elemento <video> intenta cargar la URL antes de que hls.js tome control.
            // Con preload="none" esto no debería ocurrir, pero si pasa, es ignorable.
            if (e instanceof Event && e.type === 'error') {
              console.log("[Player] Error event del <video> element (ignorado, hls.js maneja la carga)");
              return;
            }
            // Error de aborto del user agent
            if (typeof e === 'object' && e?.message?.includes('aborted')) {
              return;
            }
            // Solo errores realmente inesperados llegan aquí
            console.warn("ReactPlayer error no manejado:", e, data);
          }}
          progressInterval={500}
          config={{
            file: {
              attributes: {
                crossOrigin: "anonymous", // No necesitamos cookies; el token va en la URL (_st) y en headers (X-Session-Token)
                // "metadata" permite que el <video> element prepare su pipeline de media
                // sin descargar el contenido completo. Esto es necesario para que Firefox
                // acepte video.play() cuando hls.js empuje los primeros fragmentos al buffer.
                // NOTA: "none" causaba que Firefox rechazara play() con DOMException
                // porque el element no tenía datos listos para decodificar.
                preload: "metadata",
                // Reproducción inline en móviles (evita pantalla completa forzada en iOS)
                playsInline: true,
              },
              // Forzar uso de hls.js para URLs del proxy que no terminan en .m3u8
              // El proxy devuelve Content-Type: application/vnd.apple.mpegurl
              // pero ReactPlayer necesita saber que es HLS para usar hls.js
              forceHLS: hasHLS,
              // Configuración de hls.js para streaming adaptativo
              hlsOptions: {
                // Usar Web Worker para parsing (mejor rendimiento)
                enableWorker: true,
                // Buffer adelante: 30s es suficiente para VOD
                maxBufferLength: 30,
                // Buffer máximo total
                maxMaxBufferLength: 60,
                // Mantener 30s de buffer trasero para seek rápido
                backBufferLength: 30,
                // Empezar en calidad automática (ABR) — -1 = auto
                startLevel: -1,
                // Estimación inicial de ancho de banda (500kbps conservador)
                // Un valor más bajo hace que hls.js empiece en calidad baja
                // y suba rápidamente, evitando stalls iniciales en Firefox
                abrEwmaDefaultEstimate: 500000,
                // Reintentos generosos para manejar la latencia del proxy
                fragLoadingMaxRetry: 8,
                manifestLoadingMaxRetry: 6,
                levelLoadingMaxRetry: 6,
                // Tiempo de espera antes de reintentar (ms)
                fragLoadingRetryDelay: 1000,
                manifestLoadingRetryDelay: 500,
                levelLoadingRetryDelay: 500,
                // Timeouts de carga más generosos (ms)
                // El proxy a B2 puede tardar en responder, especialmente
                // con preflight CORS en Firefox
                fragLoadingTimeOut: 30000,
                manifestLoadingTimeOut: 25000,
                levelLoadingTimeOut: 25000,
                // No usar modo de baja latencia (es VOD, no live)
                lowLatencyMode: false,
                // Usar Web Crypto API nativa del navegador para AES (mejor rendimiento en Firefox)
                enableSoftwareAES: false,
                // Detección de buffer vacío más agresiva:
                // nudgeOffset y nudgeMaxRetry controlan cómo hls.js intenta
                // recuperarse cuando el buffer se vacía (bufferStalledError)
                nudgeOffset: 0.2,
                nudgeMaxRetry: 5,
                // PROTECCIÓN: Inyectar token de sesión en cada solicitud XHR de hls.js.
                // Esto incluye el manifest, playlists de calidad y cada fragmento .ts.
                xhrSetup: sessionToken
                  ? (xhr, url) => {
                      xhr.setRequestHeader("X-Session-Token", sessionToken);
                    }
                  : undefined,
              },
            },
          }}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        />}

        {/* Mensaje cuando el video está procesándose */}
        {!isVideoReady && currentVideo?._id && (
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "#000", color: "#fff", gap: "16px", padding: "20px", textAlign: "center"
          }}>
            <CircularProgress sx={{ color: "#fff" }} />
            <span style={{ fontSize: "16px", opacity: 0.9 }}>
              {videoStatus === 'processing'
                ? (t?.("videoProcessing") || "El video se está procesando. Por favor espera unos minutos...")
                : videoStatus === 'error'
                ? (t?.("videoError") || "Hubo un error al procesar este video.")
                : (t?.("videoPending") || "El video está en cola de procesamiento. Estará disponible pronto...")}
            </span>
          </div>
        )}

        {/* Spinner mientras se obtiene el token de sesión */}
        {isVideoReady && !proxyVideoUrl && currentVideo?._id && (
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", background: "#000"
          }}>
            <CircularProgress sx={{ color: "#fff" }} />
          </div>
        )}

        {/* Clickable overlay for play/pause and fullscreen */}
        <ClickOverlay
          onClick={(e) => {
            e.stopPropagation();
            // Use timeout to distinguish single click from double click
            if (clickTimeoutRef.current) {
              clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = null;
              return; // This is the second click of a double-click
            }
            clickTimeoutRef.current = setTimeout(() => {
              clickTimeoutRef.current = null;
              handlePlayPause();
            }, 250);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (clickTimeoutRef.current) {
              clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = null;
            }
            toggleFullScreen();
          }}
        />

        {/* Loading spinner */}
        {loading && (
          <LoadingOverlay>
            <CircularProgress
              size={48}
              sx={{ color: "#0b67dc" }}
            />
          </LoadingOverlay>
        )}

        {/* Play/Pause feedback */}
        {feedbackIcon && (
          <FeedbackIcon key={feedbackIcon.key}>
            {feedbackIcon.icon === "play" ? (
              <PlayArrowIcon />
            ) : (
              <PauseIcon />
            )}
          </FeedbackIcon>
        )}

        {/* Countdown overlay */}
        {countdownTime !== null && countdownTime > 0 && (
          <CountdownOverlay>
            <CountdownText>{countdownTime}</CountdownText>
            <CountdownMessage>
              {t("nextVideoIn")}
            </CountdownMessage>
            <CountdownButtons>
              <CancelBtn onClick={cancelCountdown}>{t("cancelNext")}</CancelBtn>
              <NextBtn onClick={playNextNow}>{t("nextNow")}</NextBtn>
            </CountdownButtons>
          </CountdownOverlay>
        )}

        {/* ===== CONTROLS ===== */}
        <ControlsWrapper $show={showControls || videoEnded}>
          {/* Top bar: se oculta en mini-player */}
          <TopBar $sticky={isStickyActive}>
            <VideoTitle>{currentVideo?.title}</VideoTitle>
          </TopBar>

          {/* Center controls: se ocultan en mini-player */}
          <CenterControls $sticky={isStickyActive}>
            <CenterButton
              onClick={(e) => {
                e.stopPropagation();
                const ct = playerRef.current?.getCurrentTime() || 0;
                playerRef.current?.seekTo(Math.max(0, ct - 10));
              }}
            >
              <Replay10Icon />
            </CenterButton>

            <CenterButton
              $large
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
            >
              {videoEnded ? (
                <RiRestartLine />
              ) : playing ? (
                <PauseIcon />
              ) : (
                <PlayArrowIcon />
              )}
            </CenterButton>

            <CenterButton
              onClick={(e) => {
                e.stopPropagation();
                const ct = playerRef.current?.getCurrentTime() || 0;
                playerRef.current?.seekTo(Math.min(duration, ct + 10));
              }}
            >
              <Forward10Icon />
            </CenterButton>
          </CenterControls>

          {/* Bottom controls */}
          <BottomControls onClick={(e) => e.stopPropagation()}>
            {/* Timeline: se oculta en mini-player */}
            <MiniTimelineContainer $sticky={isStickyActive}>
              <TimelineContainer
                ref={timelineRef}
                onMouseMove={handleTimelineMouseMove}
                onMouseLeave={handleTimelineMouseLeave}
                onMouseDown={handleTimelineMouseDown}
              >
                <TimelineBar className="timeline-bar">
                  <BufferedBar style={{ width: `${loaded * 100}%` }} />
                  <PlayedBar style={{ width: `${played * 100}%` }} />
                  <TimelineKnob
                    className="timeline-knob"
                    style={{ left: `calc(${played * 100}% - 7px)` }}
                  />
                </TimelineBar>

                {hoverTime !== null && (
                  <TimelineTooltip
                    className="timeline-tooltip"
                    style={{ left: `${hoverPos}px` }}
                  >
                    {formatTime(hoverTime)}
                  </TimelineTooltip>
                )}
              </TimelineContainer>
            </MiniTimelineContainer>

            {/* Control row */}
            <ControlRow>
              <ControlGroup>
                {/* Play/Pause — siempre visible */}
                <ControlBtn onClick={handlePlayPause} title={playing ? `${t("pause")} (K)` : `${t("play")} (K)`}>
                  {videoEnded ? <RiRestartLine style={{ fontSize: 22 }} /> : playing ? <PauseIcon /> : <PlayArrowIcon />}
                </ControlBtn>

                {/* Skip back — se oculta en mini-player con transición suave */}
                <ControlBtn
                  onClick={() => {
                    const ct = playerRef.current?.getCurrentTime() || 0;
                    playerRef.current?.seekTo(Math.max(0, ct - 10));
                  }}
                  title={`${t("rewind10")} (J)`}
                  style={{
                    opacity: isStickyActive ? 0 : 1,
                    maxWidth: isStickyActive ? 0 : "44px",
                    overflow: "hidden",
                    padding: isStickyActive ? 0 : undefined,
                    transition: "opacity 0.3s ease, max-width 0.3s ease, padding 0.3s ease",
                    pointerEvents: isStickyActive ? "none" : "auto",
                  }}
                >
                  <Replay10Icon />
                </ControlBtn>

                {/* Skip forward — se oculta en mini-player con transición suave */}
                <ControlBtn
                  onClick={() => {
                    const ct = playerRef.current?.getCurrentTime() || 0;
                    playerRef.current?.seekTo(Math.min(duration, ct + 10));
                  }}
                  title={`${t("forward10")} (L)`}
                  style={{
                    opacity: isStickyActive ? 0 : 1,
                    maxWidth: isStickyActive ? 0 : "44px",
                    overflow: "hidden",
                    padding: isStickyActive ? 0 : undefined,
                    transition: "opacity 0.3s ease, max-width 0.3s ease, padding 0.3s ease",
                    pointerEvents: isStickyActive ? "none" : "auto",
                  }}
                >
                  <Forward10Icon />
                </ControlBtn>

                {/* Volume — siempre visible */}
                <VolumeContainer>
                  <ControlBtn onClick={handleMuteToggle} title={muted ? `${t("unmute")} (M)` : `${t("mute")} (M)`}>
                    {volumeIcon}
                  </ControlBtn>
                  <VolumeSliderWrap className="volume-slider-wrap">
                    <VolumeSliderTrack
                      ref={volumeTrackRef}
                      onMouseDown={handleVolumeMouseDown}
                    >
                      <VolumeSliderFill style={{ width: `${(muted ? 0 : volume) * 100}%` }} />
                      <VolumeSliderThumb style={{ left: `${(muted ? 0 : volume) * 100}%` }} />
                    </VolumeSliderTrack>
                  </VolumeSliderWrap>
                </VolumeContainer>

                {/* Time — siempre visible */}
                <TimeDisplay>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </TimeDisplay>
              </ControlGroup>

              {/* Grupo derecho: se oculta en mini-player con transición suave */}
              {/* menuRef envuelve todo el grupo para que el click fuera cierre el menú */}
              <div
                ref={menuRef}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  opacity: isStickyActive ? 0 : 1,
                  maxWidth: isStickyActive ? 0 : "340px",
                  overflow: "hidden",
                  transition: "opacity 0.3s ease, max-width 0.3s ease",
                  pointerEvents: isStickyActive ? "none" : "auto",
                  flexShrink: 0,
                }}
              >
                {/* Settings */}
                <ControlBtn
                  onClick={toggleMenu}
                  title={t("settings")}
                  style={{
                    color: menuOpen && menuView === "main" ? "#5fa8ff" : undefined,
                    transition: "transform 0.3s ease, color 0.15s ease",
                    transform: menuOpen ? "rotate(30deg)" : "rotate(0deg)",
                  }}
                >
                  <SettingsIcon />
                </ControlBtn>

                {menuOpen && (
                  <MenuOverlay>
                    {renderMenuContent()}
                  </MenuOverlay>
                )}

                {/* Fullscreen */}
                <ControlBtn onClick={toggleFullScreen} title={isFullscreen ? `${t("exitFullscreen")} (F)` : `${t("fullscreen")} (F)`}>
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </ControlBtn>
              </div>
            </ControlRow>
          </BottomControls>
        </ControlsWrapper>
      </PlayerWrapper>
      </div>
    </VideoWrapper>
  );
}
