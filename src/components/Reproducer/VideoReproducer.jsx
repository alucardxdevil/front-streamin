import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes } from "styled-components";
import ReactPlayer from "react-player";
import {
  Grid,
  Typography,
  Slider,
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import FullScreenIcon from "@mui/icons-material/Fullscreen";
import Replay10Icon from "@mui/icons-material/Replay10";
import Forward10Icon from "@mui/icons-material/Forward10";
import VolumeOff from "@mui/icons-material/VolumeOff";

import screenfull from "screenfull";
import { useSelector } from "react-redux";
import { RiRestartLine } from "react-icons/ri";
import axios from "axios";

/* ============= Animación ============= */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* =========== Styled =========== */
const VideoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 0;
  background: radial-gradient(circle at top, #0f0f0f 0%, #000 80%);
  animation: ${fadeIn} 0.6s ease-in;
  width: 100%;
`;

const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1600px;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.7);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.002);
  }

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 10px;
  }
`;

const ControlsWrapper = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 40%,
    rgba(0, 0, 0, 0) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  opacity: ${({ show }) => (show ? 1 : 0)};
  pointer-events: ${({ show }) => (show ? "auto" : "none")};
  transition: opacity 0.4s ease;

  @media (max-width: 768px) {
    pointer-events: auto;
  }
`;

const ControlIcons = styled.button`
  color: #f1f1f1;
  font-size: clamp(24px, 6vw, 50px);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 8px rgba(11, 103, 220, 0.5));

  & svg {
    width:1em !important;
    height: 1em !important;
    font-size: inherit !important;
  } 

  &:hover { color: #fff;
    transform: scale(1.15);
    filter: drop-shadow(0 0 12px rgba(11, 103, 220, 1));
  }

  @media (max-width: 768px) {
    font-size: 30px;
  } 
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(161, 19, 161, 0.5); }
  70% { transform: scale(1.15); box-shadow: 0 0 10px 4px rgba(161, 19, 161, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(161, 19, 161, 0); } ;
`;

const PrettoSlider = styled(Slider)`
  color: #0b67dc;
  height: 4px;
  padding: 8px 0;
  position: relative;
  transition: all 0.3s ease;

  & .MuiSlider-track {
    border: none;
    height: 4px;
    background: linear-gradient(90deg, #0b67dc 0%, #5fa8ff 100%);
    transition: background 0.3s ease;
  }

  & .MuiSlider-rail {
    opacity: 0.15;
    background-color: #ccc;
    height: 4px;
  }

  & .MuiSlider-thumb {
    height: 12px;
    width: 12px;
    background-color: #E94560;
    box-shadow: 0 0 0 3px rgba(11, 103, 220, 0.15);
    transition: all 0.25s ease;
    margin-top: -4px;
    
    &:hover {
      transform: scale(1.3);
      box-shadow: 0 0 0 6px rgba(11, 103, 220, 0.25);
    }
    
    &:active {
      transform: scale(1.4);
      box-shadow: 0 0 0 8px rgba(11, 103, 220, 0.35);
    }
  }

  & .MuiSlider-valueLabel {
    background: #0b67dc;
    color: #fff;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    height: 3px;
    & .MuiSlider-thumb {
      height: 10px;
      width: 10px;
      margin-top: -3px;
    }
  }
`;

const CenterControls = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 50px;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 5;
`;

const VolumeSlider = styled(Slider)`
  color: #0b67dc;
  height: 4px;
  
  & .MuiSlider-thumb {
    height: 10px;
    width: 10px;
    border: 2px solid #FF3E6C;
    margin-top: -3px;
    transition: all 0.3s ease;
    background-color: #FF3E6C;
    box-shadow: 0 0 6px rgba(11, 103, 220, 0.3);
    
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 0 10px rgba(11, 103, 220, 0.8);
    }
  } 
  
  & .MuiSlider-track {
    background-color: #0b67dc;
  } 
  
  & .MuiSlider-rail {
    opacity: 0.3;
    background-color: #ccc;
  }
`;

const ControlButton = styled.button`
  color: #fff;
  font-size: clamp(26px, 6vw, 45px);
  background: none;
  border: none;
  cursor: pointer;
  transition: 0.25s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const SmallControlButton = styled(ControlButton)`
  font-size: clamp(20px, 5vw, 32px);
`;

const ValueLabelComponent = ({ children, value }) => (
  <Tooltip enterTouchDelay={0} placement="top" title={value}>
    {children}
  </Tooltip>
);

/* ============= Utils ============= */
const formatTime = (sec) => {
  if (!sec || isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

/* =========== COMPONENTE PRINCIPAL =========== */
export default function VideoReproducer() {
  const { currentVideo } = useSelector((s) => s.video);

  const [state, setState] = useState({
    playing: true,
    muted: false,
    volume: 0.5,
    played: 0,
  });

  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [durationDBSaved, setDurationDBSaved] = useState(false);
  const [duration, setDuration] = useState(0);

  const hideTimeout = useRef(null);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  /* ========== Guarda duración solo UNA VEZ ========== */
  const { currentUser } = useSelector((s) => s.user || {});

  const handleDuration = async (d) => {
    setDuration(d);

    // 1. Si ya había duración en BD → NO GUARDAR
    if (currentVideo?.duration && currentVideo.duration > 0) {
      setDurationDBSaved(true);
      return;
    }

    // 2. Si ya se guardó en esta sesión → NO GUARDAR
    if (durationDBSaved) return;

    // 3. Si el usuario NO está loggeado → NO GUARDAR (evita el 403)
    if (!currentUser) return;

    // 4. Guardar por primera vez
    try {
      await axios.put(`/videos/${currentVideo._id}`, { duration: d });
      setDurationDBSaved(true);
    } catch (err) {
      console.log("Error guardando duración:", err.message);
    }
  };

  /* =========== HANDLERS =========== */

  const handlePlayPause = () =>
    setState((p) => ({ ...p, playing: !p.playing }));

  const handleMute = () => setState((p) => ({ ...p, muted: !p.muted }));

  const handleVolume = (_, v) =>
    setState((p) => ({ ...p, volume: v / 100, muted: v === 0 }));

  const handleSeek = (_, v) => setState((p) => ({ ...p, played: v / 100 }));

  const handleSeekUp = (_, v) => playerRef.current.seekTo(v / 100);

  const handleProgress = (s) => setState((p) => ({ ...p, ...s }));

  const toggleFullScreen = () => screenfull.toggle(playerContainerRef.current);

  const currentTime = playerRef.current?.getCurrentTime() || 0;

  /* Ocultar controles */
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimeout.current);

    hideTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  /* Reset al cambiar video */
  useEffect(() => {
    setVideoEnded(false);
    setDurationDBSaved(false);
    setState((p) => ({ ...p, playing: true, played: 0 }));
  }, [currentVideo]);

  /* ============= RENDER ============= */
  return (
    <VideoWrapper>
      <PlayerWrapper ref={playerContainerRef} onMouseMove={handleMouseMove}>
        <ReactPlayer
          ref={playerRef}
          url={currentVideo?.videoUrl}
          width="100%"
          height="100%"
          playing={state.playing}
          muted={state.muted}
          volume={state.volume}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={() => setVideoEnded(true)}
          onReady={() => setLoading(false)}
        />

        {loading && (
          <CircularProgress
            color="secondary"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}

        {/* === CONTROLES === */}
        <ControlsWrapper show={showControls}>
          {/* Título */}
          <Grid container style={{ padding: "12px 16px" }}>
            <Typography style={{ color: "#fff", fontSize: 18 }}>
              {currentVideo?.title}
            </Typography>
          </Grid>

          {/* MEDIO */}
          <CenterControls>
            <ControlIcons
              onClick={() => playerRef.current.seekTo(currentTime - 10)}
            >
              <Replay10Icon />
            </ControlIcons>

            <ControlIcons onClick={handlePlayPause}>
              {videoEnded ? (
                <RiRestartLine />
              ) : state.playing ? (
                <PauseIcon />
              ) : (
                <PlayArrowIcon />
              )}
            </ControlIcons>

            <ControlIcons
              onClick={() => playerRef.current.seekTo(currentTime + 10)}
            >
              <Forward10Icon />
            </ControlIcons>
          </CenterControls>

          {/* ABAJO */}
          <Grid container px={2} pb={2}>
            <PrettoSlider
              min={0}
              max={100}
              value={state.played * 100}
              onChange={handleSeek}
              onChangeCommitted={handleSeekUp}
              ValueLabelComponent={(props) => (
                <ValueLabelComponent
                  {...props}
                  value={formatTime(currentTime)}
                />
              )}
            />

            <Grid container justifyContent="space-between" mt={1}>
              <Grid item>
                <SmallControlButton onClick={handlePlayPause}>
                  {state.playing ? <PauseIcon /> : <PlayArrowIcon />}
                </SmallControlButton>

                <SmallControlButton onClick={handleMute}>
                  {state.muted ? <VolumeOff /> : <VolumeUpIcon />}
                </SmallControlButton>

                <VolumeSlider
                  min={0}
                  max={100}
                  value={state.volume * 100}
                  onChange={handleVolume}
                  sx={{ width: 80 }}
                />
              </Grid>

              <Typography style={{ color: "#fff", fontSize: 13 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>

              <SmallControlButton onClick={toggleFullScreen}>
                <FullScreenIcon />
              </SmallControlButton>
            </Grid>
          </Grid>
        </ControlsWrapper>
      </PlayerWrapper>
    </VideoWrapper>
  );
}

// import React, {useEffect, useState, useRef} from 'react'
// import styled from "styled-components";
// import ReactPlayer from "react-player";
// import Container from "@mui/material/Container"
// import Grid from "@mui/material/Grid"
// import Typography from '@mui/material/Typography';
// import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// import PauseIcon from "@mui/icons-material/Pause";
// import VolumeUpIcon from "@mui/icons-material/VolumeUp"
// import FullScreenIcon from "@mui/icons-material/Fullscreen"
// import Popover from '@mui/material/Popover';
// import Replay10Icon from '@mui/icons-material/Replay10';
// import Forward10Icon from '@mui/icons-material/Forward10';
// import VolumeOff from '@mui/icons-material/VolumeOff';
// import Slider from '@mui/material/Slider';
// import Button from '@mui/material/Button';
// import screenfull from "screenfull";
// import { useSelector } from 'react-redux';
// import { RiRestartLine } from "react-icons/ri";
// import Tooltip from "@mui/material/Tooltip"
// import axios from 'axios';
// import { CircularProgress } from '@mui/material';

// const VideoWrapper = styled.div`
//   position: relative;
//   z-index: 0;

// `;

// const PlayerWrapper = styled.div`
//   position: relative;
//   width: 100%;
//   aspect-ratio: 16 / 9; /* mantiene proporción */
//   background: #000;
//   border-radius: 12px;
//   overflow: hidden;
//   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

//   @media (max-width: 768px) {
//     border-radius: 8px;
//   }
// `;

// const ControlIcons = styled.button`
//   color: #e5e5e5;
//   font-size: 48px;
//   border: none;
//   background: transparent;
//   cursor: pointer;
//   transition: all 0.2s ease;

//   &:hover {
//     color: #fff;
//     transform: scale(1.1);
//   }

//   @media (max-width: 768px) {
//     font-size: 36px;
//   }
// `;

// const ControlsWrapper = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.6);
//   display: flex;
//   flex-direction: column;
//   justify-content: space-between;
//   z-index: 1;
//   opacity: 0;
//   transition: opacity 0.3s ease;

//   &:hover {
//     opacity: 1;
//   }
// `;

// function ValueLabelComponent(props) {
//   const { children, value } = props;

//   return (
//     <Tooltip enterTouchDelay={0} placement="top" title={value}>
//       {children}
//     </Tooltip>
//   );
// }

// const PrettoSlider = styled(Slider)({
//   color: "#a113a1",
//   height: 6,
//   "& .MuiSlider-thumb": {
//     height: 14,
//     width: 14,
//     backgroundColor: "#fff",
//     border: "2px solid #a113a1",
//   },
//   "& .MuiSlider-rail": {
//     opacity: 0.3,
//     backgroundColor: "#fff",
//   },
// });

// export const formats = (seconds) => {
//   if (isNaN(seconds)) {
//     return '00:00'
//   }

//   const date = new Date(seconds * 1000)
//   const hh = date.getUTCHours()
//   const mm = date.getUTCMinutes()
//   const ss = date.getUTCSeconds().toString().padStart(2,'0')
//   if (hh) {
//     return `${hh}:${mm.toString().padStart(2,'0')}:${ss}`
//   }

//   return `${mm}:${ss}`
// }

// let count = 0;

// function VideoReproducer() {

//     const [state, setState] = useState({
//         playing: true,
//         muted: false,
//         volume: 0.5,
//         playbackRate: 1.0,
//         played:0,
//         seeking: false
//       })

//       const [timeDisplayFormat, setTimeDisplayFormat] = useState('normal')

//       const {playing, muted, volume, playbackRate, played} = state
//       const [videoEnded, setVideoEnded] = useState(false);

//       const playerRef = useRef(null)

//       const playerContainerRef = useRef(null)
//       const controlsRef = useRef(null)

//       const handlePlayPause = () => {
//         if (videoEnded) {
//           setVideoEnded(false);
//           playerRef.current.seekTo(0);
//           setState({ ...state, playing: true });
//         } else {
//           setState({ ...state, playing: !state.playing });
//         }
//       };

//       const handleVideoEnd = () => {
//         setVideoEnded(true);
//         setState({ ...state, playing: true });
//       };

//       const handleRewind = () => {
//         playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10)
//       }

//       const handleFastForward = () => {
//         playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10)
//       }

//       const handleMute = () => {
//         setState({...state, muted: !state.muted})
//       }

//       const handleVolumeChange = (e, newValue) => {
//         setState({...state, volume:parseFloat(newValue/100), muted: newValue === 0 ? true : false})
//       }

//       const handleVolumeSeek = (e, newValue) => {
//         setState({...state, volume:parseFloat(newValue/100), muted: newValue === 0 ? true : false})
//       }

//       const handlePlaybackRateChange = (rate) => {
//         setState({...state, playbackRate: rate})
//       }

//       const toggleFullScreen = () => {
//         screenfull.toggle(playerContainerRef.current)
//       }

//       const handleProgress = (changeState) => {
//         // if (!state.seeking) {
//         //   setState({ ...state, ...changeState });
//         // }
//         if (playerRef.current && playerRef.current.getCurrentTime() === playerRef.current.getDuration()) {
//           setVideoEnded(true);
//         }

//         if(count>1) {
//           controlsRef.current.style.visibility = 'hidden'
//           count = 0
//         }

//         if(controlsRef.current.style.visibility === 'visible') {
//           count+=1
//         }

//         if(!state.seeking) {
//           setState({...state, ...changeState})
//         }
//       }

//       const handleSeek = (e, newValue) => {
//         setState({...state, played: parseFloat(newValue / 100)})
//       }

//       const handleSeekMouseDown = (e) => {
//         setState({...state, seeking: true})
//       }

//       const handleSeekMouseUp = (e, newValue) => {
//         setState({...state, seeking: false})
//         playerRef.current.seekTo(newValue / 100)
//       }

//       const handleChangeDisplayFormat = () => {
//         setTimeDisplayFormat(timeDisplayFormat === 'normal' ? 'remaining' : 'normal')
//       }

//       const currentTime = playerRef.current ? playerRef.current.getCurrentTime() : '00:00'
//       const duration = playerRef.current ? playerRef.current.getDuration() : '00:00'

//       const elapsedTime = timeDisplayFormat === 'normal' ? formats(currentTime) : `-${formats(duration - currentTime)}`
//       const totalDuration = formats(duration)

//       const handleMouseMove = () => {
//         controlsRef.current.style.visibility = 'visible'
//         // count = 0
//       }

//       const [anchorEl, setAnchorEl] = React.useState(null);

//       const handlePopover = (event) => {
//         setAnchorEl(event.currentTarget);
//       };

//       const handleClose = () => {
//         setAnchorEl(null);
//       };

//       const open = Boolean(anchorEl);
//       const id = open ? 'simple-popover' : undefined;

//     const { currentVideo } = useSelector((state) => state.video);

//     useEffect(() => {
//       if (totalDuration && currentVideo) {
//         const saveDurationToDatabase = async () => {
//           try {
//             await axios.put(`/videos/${currentVideo._id}`, { duration });
//             // setDurationSaved(true);
//           } catch (error) {}
//         };

//         saveDurationToDatabase();
//       }
//     }, [totalDuration, currentVideo]);

//     useEffect(() => {
//       if (currentVideo) {
//         setVideoEnded(false);
//         setState((prev) => ({ ...prev, playing: true, played: 0 }));
//       }
//     }, [currentVideo]);

//     const [loading, setLoading] = useState(true);

//   return (
//     <VideoWrapper>
//       <Container maxWidth="md">
//         <PlayerWrapper ref={playerContainerRef} onMouseMove={handleMouseMove}>
//           <ReactPlayer
//             ref={playerRef}
//             width={"100%"}
//             height={"100%"}
//             url={currentVideo.videoUrl}
//             muted={muted}
//             playing={playing}
//             volume={volume}
//             playbackRate={playbackRate}
//             onProgress={handleProgress}
//             onEnded={handleVideoEnd}
//             onReady={() => setLoading(false)}
//             onBuffer={() => setLoading(true)}
//             onBufferEnd={() => setLoading(false)}
//           />

//           {loading && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)",
//               }}
//             >
//               <CircularProgress color="secondary" />
//             </div>
//           )}
//           <ControlsWrapper
//             ref={controlsRef}
//             playing={playing}
//             onVolumeChange={handleVolumeChange}
//             playbackRate={playbackRate}
//             played={played}
//             elapsedTime={elapsedTime}
//             totalDuration={totalDuration}
//           >
//             <Grid
//               container
//               alignItems="center"
//               justifyContent="space-between"
//               style={{ padding: "0 12px 8px" }}
//             >
//               <Grid container style={{ padding: "12px 16px" }}>
//                 <Typography style={{ color: "#fff", fontSize: "18px", fontWeight: "500" }}>
//                   {currentVideo.title}
//                 </Typography>
//               </Grid>
//             </Grid>
//             {/* middle controls */}
//             <Grid
//               container
//               alignItems="center"
//               justifyContent="center"
//               spacing={5}
//             >
//               <ControlIcons
//                 onClick={handleRewind}
//                 aria-label="rewind"
//                 style={{ marginRight: "70px", fontSize: "80px" }}
//               >
//                 <Replay10Icon fontSize="inherit" />
//               </ControlIcons>

//               <ControlIcons
//                 onClick={handlePlayPause}
//                 aria-label="play"
//                 style={{ fontSize: "80px" }}
//               >
//                 {videoEnded ? (
//                   <RiRestartLine fontSize="inherit" />
//                 ) : playing ? (
//                   <PauseIcon fontSize="inherit" />
//                 ) : (
//                   <PlayArrowIcon fontSize="inherit" />
//                 )}
//               </ControlIcons>

//               {/* <ControlIcons onClick={handlePlayPause} aria-label="play" style={{fontSize:'80px'}}>
//                         {playing ? ( <PauseIcon fontSize="inherit"/>) : (<PlayArrowIcon fontSize="inherit" />)}
//                       </ControlIcons> */}

//               <ControlIcons
//                 onClick={handleFastForward}
//                 aria-label="forward"
//                 style={{ marginLeft: "70px", fontSize: "80px" }}
//               >
//                 <Forward10Icon fontSize="inherit" />
//               </ControlIcons>
//             </Grid>

//             {/* bottom controls */}
//             <Grid
//               container
//               direction="row"
//               justifyContent="space-between"
//               alignItems="center"
//               style={{ padding: 6 }}
//             >
//               <Grid item xs={32}>
//                 <PrettoSlider
//                   min={0}
//                   max={100}
//                   value={played * 100}
//                   ValueLabelComponent={(props) => (
//                     <ValueLabelComponent {...props} value={elapsedTime} />
//                   )}
//                   onChange={handleSeek}
//                   onMouseDown={handleSeekMouseDown}
//                   onChangeCommitted={handleSeekMouseUp}
//                   style={{ color: "pink" }}
//                 />
//               </Grid>
//               <Grid item>
//                 <Grid container alignItems="center" direction="row">
//                   <ControlIcons onClick={handlePlayPause}>
//                     {playing ? (
//                       <PauseIcon fontSize="large" />
//                     ) : (
//                       <PlayArrowIcon fontSize="large" />
//                     )}
//                   </ControlIcons>
//                   <ControlIcons onClick={handleMute}>
//                     {muted ? (
//                       <VolumeOff fontSize="large" />
//                     ) : (
//                       <VolumeUpIcon fontSize="large" />
//                     )}
//                   </ControlIcons>
//                   <Slider
//                     min={0}
//                     max={100}
//                     value={volume * 100}
//                     onChange={handleVolumeChange}
//                     onChangeCommitted={handleVolumeSeek}
//                     sx={{
//                       "& .MuiSlider-thumb": {
//                         height: 12, // Ajusta la altura del cursor del volumen
//                         width: 12, // Ajusta el ancho del cursor del volumen
//                       },
//                     }}
//                     style={{ width: 100, color: "#a113a1" }}
//                   />
//                   <Button
//                     onClick={handleChangeDisplayFormat}
//                     variant="text"
//                     style={{ color: "#fff", marginLeft: 16 }}
//                   >
//                     <Typography>
//                       {elapsedTime}/{totalDuration}
//                     </Typography>
//                   </Button>
//                 </Grid>
//               </Grid>
//               <Grid>
//                 <Button
//                   onClick={handlePopover}
//                   variant="text"
//                   style={{ color: "#fff", width: 100, bottom: 13 }}
//                 >
//                   <Typography>{playbackRate} V</Typography>
//                 </Button>
//                 <Popover
//                   id={id}
//                   open={open}
//                   anchorEl={anchorEl}
//                   onClose={handleClose}
//                   anchorOrigin={{
//                     vertical: "top",
//                     horizontal: "center",
//                   }}
//                 >
//                   <Grid container direction="column-reverse">
//                     {[0.5, 1, 1.5, 2].map((rate) => (
//                       <Button onClick={() => handlePlaybackRateChange(rate)}>
//                         <Typography
//                           color={
//                             rate === playbackRate ? "secondary" : "default"
//                           }
//                         >
//                           {rate}
//                         </Typography>
//                       </Button>
//                     ))}
//                   </Grid>
//                 </Popover>
//                 <ControlIcons onClick={toggleFullScreen}>
//                   <FullScreenIcon fontSize="large" />
//                 </ControlIcons>
//               </Grid>
//             </Grid>
//           </ControlsWrapper>
//         </PlayerWrapper>
//       </Container>
//     </VideoWrapper>
//   );
// }

// export default VideoReproducer
