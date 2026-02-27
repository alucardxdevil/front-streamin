import React, { useEffect, useState, useRef, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import ReactPlayer from "react-player";
import { CircularProgress } from "@mui/material";

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
import PictureInPictureAltIcon from "@mui/icons-material/PictureInPictureAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import ClosedCaptionDisabledIcon from "@mui/icons-material/ClosedCaptionDisabled";
import SpeedIcon from "@mui/icons-material/Speed";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import HighQualityIcon from "@mui/icons-material/HighQuality";
import SubtitlesIcon from "@mui/icons-material/Subtitles";

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
  transition: transform 0.3s ease;
  cursor: ${({ $showControls }) => ($showControls ? "auto" : "none")};
  user-select: none;

  &:hover {
    transform: scale(1.002);
  }

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 10px;
    cursor: pointer;
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
  right: 12px;
  background: rgba(20, 20, 20, 0.96);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  min-width: 260px;
  max-height: 340px;
  overflow-y: auto;
  z-index: 50;
  animation: ${fadeInScale} 0.2s ease;
  transform-origin: bottom right;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    min-width: 220px;
    right: 8px;
    bottom: 50px;
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
`;

const MenuItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MenuItemRight = styled.span`
  color: #888;
  font-size: 12px;
`;

const MenuDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 0;
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
const QUALITY_OPTIONS = ["Auto", "1080p", "720p", "480p", "360p"];

/* =========== MAIN COMPONENT =========== */
export default function VideoReproducer({ onVideoEnd, countdown = 5 }) {
  const { currentVideo } = useSelector((s) => s.video);
  const { currentUser } = useSelector((s) => s.user || {});
  const { t } = useLanguage();

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
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  // UI state
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [durationDBSaved, setDurationDBSaved] = useState(false);
  const [countdownTime, setCountdownTime] = useState(null);
  const [seeking, setSeeking] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState("main"); // main, speed, quality, captions

  // Feedback animation
  const [feedbackIcon, setFeedbackIcon] = useState(null);
  const feedbackKey = useRef(0);

  // Refs
  const hideTimeout = useRef(null);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const timelineRef = useRef(null);
  const volumeTrackRef = useRef(null);
  const menuRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const videoReadyRef = useRef(false); // Track if video has been initially loaded

  /* ========== Show feedback icon ========== */
  const showFeedback = useCallback((icon) => {
    feedbackKey.current += 1;
    setFeedbackIcon({ icon, key: feedbackKey.current });
    setTimeout(() => setFeedbackIcon(null), 600);
  }, []);

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
    if (!seeking) {
      setPlayed(state.played);
    }
    setLoaded(state.loaded);
  }, [seeking]);

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

  /* ========== Picture-in-Picture ========== */
  const togglePiP = useCallback(async () => {
    try {
      const videoEl = playerContainerRef.current?.querySelector("video");
      if (!videoEl) return;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoEl.requestPictureInPicture();
      }
    } catch (err) {
      console.log("PiP not supported:", err.message);
    }
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
    setLoading(true);
    videoReadyRef.current = false; // Reset video ready state

    // Scroll to top when video changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 3000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [currentVideo]);

  /* ========== Cleanup ========== */
  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
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
          {QUALITY_OPTIONS.map((q) => (
            <MenuItem
              key={q}
              $active={quality === q}
              onClick={() => {
                setQuality(q);
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

    if (menuView === "captions") {
      return (
        <>
          <MenuHeader onClick={() => setMenuView("main")}>
            <ArrowBackIosNewIcon /> Subtítulos
          </MenuHeader>
          <MenuItem
            $active={!captionsEnabled}
            onClick={() => {
              setCaptionsEnabled(false);
              setMenuView("main");
            }}
          >
            <MenuItemLeft>
              {!captionsEnabled && <CheckIcon />}
              <span style={{ marginLeft: !captionsEnabled ? 0 : 28 }}>
                {captionsEnabled ? t("captionsOn") : t("captionsOff")}
              </span>
            </MenuItemLeft>
          </MenuItem>
          <MenuItem
            $active={captionsEnabled}
            onClick={() => {
              setCaptionsEnabled(true);
              setMenuView("main");
            }}
          >
            <MenuItemLeft>
              {captionsEnabled && <CheckIcon />}
              <span style={{ marginLeft: captionsEnabled ? 0 : 28 }}>
                Español (auto)
              </span>
            </MenuItemLeft>
          </MenuItem>
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
        <MenuDivider />
        <MenuItem onClick={() => setMenuView("captions")}>
          <MenuItemLeft>
            <SubtitlesIcon />
            <span>Subtítulos</span>
          </MenuItemLeft>
          <MenuItemRight>{captionsEnabled ? t("captionsOn") : t("captionsOff")}</MenuItemRight>
        </MenuItem>
      </>
    );
  };

  /* ============= RENDER ============= */
  return (
    <VideoWrapper>
      <PlayerWrapper
        ref={playerContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        $showControls={showControls}
      >
        <ReactPlayer
          ref={playerRef}
          url={currentVideo?.videoUrl}
          width="100%"
          height="100%"
          playing={playing}
          muted={muted}
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
            videoReadyRef.current = true;
            setLoading(false);
          }}
          onBuffer={() => {
            // Only show loading during initial buffer, not during normal playback
            if (!videoReadyRef.current && playing) setLoading(true);
          }}
          onBufferEnd={() => {
            // Only hide loading if we're still in initial buffer phase
            if (!videoReadyRef.current) setLoading(false);
          }}
          onPlay={() => {
            setLoading(false);
            if (videoEnded) setVideoEnded(false);
          }}
          onError={(e) => {
            console.log("ReactPlayer error:", e);
            setLoading(false);
          }}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        />

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
          {/* Top bar */}
          <TopBar>
            <VideoTitle>{currentVideo?.title}</VideoTitle>
          </TopBar>

          {/* Center controls */}
          <CenterControls>
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
            {/* Timeline */}
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

            {/* Control row */}
            <ControlRow>
              <ControlGroup>
                {/* Play/Pause */}
                <ControlBtn onClick={handlePlayPause} title={playing ? `${t("pause")} (K)` : `${t("play")} (K)`}>
                  {videoEnded ? <RiRestartLine style={{ fontSize: 22 }} /> : playing ? <PauseIcon /> : <PlayArrowIcon />}
                </ControlBtn>

                {/* Skip back */}
                <ControlBtn
                  onClick={() => {
                    const ct = playerRef.current?.getCurrentTime() || 0;
                    playerRef.current?.seekTo(Math.max(0, ct - 10));
                  }}
                  title={`${t("rewind10")} (J)`}
                >
                  <Replay10Icon />
                </ControlBtn>

                {/* Skip forward */}
                <ControlBtn
                  onClick={() => {
                    const ct = playerRef.current?.getCurrentTime() || 0;
                    playerRef.current?.seekTo(Math.min(duration, ct + 10));
                  }}
                  title={`${t("forward10")} (L)`}
                >
                  <Forward10Icon />
                </ControlBtn>

                {/* Volume */}
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

                {/* Time */}
                <TimeDisplay>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </TimeDisplay>
              </ControlGroup>

              <ControlGroup>
                {/* Captions toggle */}
                <ControlBtn
                  onClick={() => setCaptionsEnabled((p) => !p)}
                  title={`${t("subtitles")} (C)`}
                  style={{ color: captionsEnabled ? "#5fa8ff" : undefined }}
                >
                  {captionsEnabled ? <ClosedCaptionIcon /> : <ClosedCaptionDisabledIcon />}
                </ControlBtn>

                {/* Settings */}
                <div ref={menuRef} style={{ position: "relative" }}>
                  <ControlBtn
                    onClick={toggleMenu}
                    title={t("settings")}
                    style={{
                      color: menuOpen ? "#5fa8ff" : undefined,
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
                </div>

                {/* PiP */}
                <ControlBtn onClick={togglePiP} title={t("pictureInPicture")}>
                  <PictureInPictureAltIcon />
                </ControlBtn>

                {/* Fullscreen */}
                <ControlBtn onClick={toggleFullScreen} title={isFullscreen ? `${t("exitFullscreen")} (F)` : `${t("fullscreen")} (F)`}>
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </ControlBtn>
              </ControlGroup>
            </ControlRow>
          </BottomControls>
        </ControlsWrapper>
      </PlayerWrapper>
    </VideoWrapper>
  );
}
