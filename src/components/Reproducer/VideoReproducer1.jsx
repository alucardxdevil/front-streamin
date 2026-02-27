import React, { useEffect, useState, useRef } from "react";
import styled, { keyframes } from "styled-components";
import ReactPlayer from "react-player";
import {
  Grid,
  Typography,
  Slider,
  CircularProgress,
  Menu,
  MenuItem,
  IconButton as MuiIconButton,
} from "@mui/material";

import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import PauseRounded from "@mui/icons-material/PauseRounded";
import VolumeUpRounded from "@mui/icons-material/VolumeUpRounded";
import FullscreenRounded from "@mui/icons-material/FullscreenRounded";
import Replay10Rounded from "@mui/icons-material/Replay10Rounded";
import Forward10Rounded from "@mui/icons-material/Forward10Rounded";
import VolumeOffRounded from "@mui/icons-material/VolumeOffRounded";
import SpeedRounded from "@mui/icons-material/SpeedRounded";
import { RiRestartLine } from "react-icons/ri";

import screenfull from "screenfull";
import { useSelector } from "react-redux";
import axios from "axios";

/* =========== Styled Components =========== */

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  /* Sombras del color del reproductor (Azul) */
  box-shadow: 0 10px 30px rgba(11, 103, 220, 0.3);
  cursor: ${({ showControls }) => (showControls ? "default" : "none")};
`;

const ControlsOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    transparent 40%,
    transparent 60%,
    rgba(0, 0, 0, 0.5) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 0.3s ease;
  z-index: 2147483647; /* Máximo z-index para asegurar visibilidad */
  padding: 20px;
`;

const IconBtn = styled.button`
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  /* Sombra del color del reproductor en los iconos */
  filter: drop-shadow(0 0 8px rgba(11, 103, 220, 0.8));

  &:hover {
    transform: scale(1.15);
    color: #0b67dc;
  }

  & svg {
    font-size: ${({ size }) => size || "40px"};
  }
`;

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 5px;
`;

const TimelineSlider = styled(Slider)`
  color: #0b67dc;
  height: 4px;
  padding: 10px 0 !important;
  & .MuiSlider-track {
    border: none;
    background: #0b67dc;
  }
  & .MuiSlider-thumb {
    width: 12px;
    height: 12px;
    background-color: #e94560;
    &:hover {
      box-shadow: 0 0 0 8px rgba(233, 69, 96, 0.2);
    }
  }
  & .MuiSlider-rail {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

/* =========== Componente Principal =========== */

export default function VideoPlayerPro() {
  const { currentVideo } = useSelector((s) => s.video || {});

  const [state, setState] = useState({
    playing: true,
    muted: false,
    volume: 0.5,
    played: 0,
    playbackRate: 1.0,
  });

  const [showControls, setShowControls] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [durationDBSaved, setDurationDBSaved] = useState(false);

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimeout = useRef(null);

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

  // Sincronización de Play/Pause y Restart
  const handlePlayPause = () => {
    if (videoEnded) {
      playerRef.current.seekTo(0);
      setVideoEnded(false);
      setState((p) => ({ ...p, playing: true }));
    } else {
      setState((p) => ({ ...p, playing: !p.playing }));
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (state.playing) setShowControls(false);
    }, 3000);
  };

  const handleSpeedClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSpeedClose = (speed) => {
    if (speed && typeof speed === "number") {
      setState((p) => ({ ...p, playbackRate: speed }));
    }
    setAnchorEl(null);
  };

  const formatTime = (sec) => {
    if (!sec) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div style={{ padding: "20px", background: "#080808" }}>
      <PlayerContainer
        ref={containerRef}
        onMouseMove={handleMouseMove}
        showControls={showControls}
      >
        <ReactPlayer
          ref={playerRef}
          url={currentVideo?.videoUrl}
          width="100%"
          height="100%"
          playing={state.playing}
          muted={state.muted}
          volume={state.volume}
          playbackRate={state.playbackRate}
          onProgress={(s) => setState((p) => ({ ...p, played: s.played }))}
          onDuration={handleDuration}
          onEnded={() => {
            setVideoEnded(true);
            setState((p) => ({ ...p, playing: false }));
          }}
        />

        <ControlsOverlay show={showControls || !state.playing || videoEnded}>
          {/* Top: Título */}
          <Typography
            sx={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500 }}
          >
            {currentVideo?.title}
          </Typography>

          {/* Center: Controles Grandes (Sin Círculos) */}
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            spacing={4}
          >
            <Grid item>
              <IconBtn
                onClick={() =>
                  playerRef.current.seekTo(
                    playerRef.current.getCurrentTime() - 10
                  )
                }
              >
                <Replay10Rounded />
              </IconBtn>
            </Grid>
            <Grid item>
              <IconBtn size="70px" onClick={handlePlayPause}>
                {videoEnded ? (
                  <RiRestartLine />
                ) : state.playing ? (
                  <PauseRounded />
                ) : (
                  <PlayArrowRounded />
                )}
              </IconBtn>
            </Grid>
            <Grid item>
              <IconBtn
                onClick={() =>
                  playerRef.current.seekTo(
                    playerRef.current.getCurrentTime() + 10
                  )
                }
              >
                <Forward10Rounded />
              </IconBtn>
            </Grid>
          </Grid>

          {/* Bottom: Barra de progreso y controles inferiores */}
          <div style={{ width: "100%" }}>
            <TimelineSlider
              min={0}
              max={100}
              value={state.played * 100}
              onChange={(_, v) => {
                setState((p) => ({ ...p, played: v / 100 }));
                playerRef.current.seekTo(v / 100);
              }}
            />

            <BottomBar>
              <Grid item sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconBtn size="30px" onClick={handlePlayPause}>
                  {videoEnded ? (
                    <RiRestartLine />
                  ) : state.playing ? (
                    <PauseRounded />
                  ) : (
                    <PlayArrowRounded />
                  )}
                </IconBtn>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <IconBtn
                    size="25px"
                    onClick={() => setState((p) => ({ ...p, muted: !p.muted }))}
                  >
                    {state.muted || state.volume === 0 ? (
                      <VolumeOffRounded />
                    ) : (
                      <VolumeUpRounded />
                    )}
                  </IconBtn>
                  <Slider
                    sx={{ width: 80, color: "#0b67dc" }}
                    size="small"
                    value={state.volume * 100}
                    onChange={(_, v) =>
                      setState((p) => ({
                        ...p,
                        volume: v / 100,
                        muted: v === 0,
                      }))
                    }
                  />
                </div>

                <Typography sx={{ color: "#fff", fontSize: "13px" }}>
                  {formatTime(playerRef.current?.getCurrentTime())} /{" "}
                  {formatTime(duration)}
                </Typography>
              </Grid>

              <Grid item sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Botón Velocidad */}
                <IconBtn size="28px" onClick={handleSpeedClick}>
                  <SpeedRounded />
                </IconBtn>

                {/* Botón Fullscreen */}
                <IconBtn
                  size="30px"
                  onClick={() => screenfull.toggle(containerRef.current)}
                >
                  <FullscreenRounded />
                </IconBtn>
              </Grid>
            </BottomBar>
          </div>
        </ControlsOverlay>

        {/* Menú de Velocidad configurado para Fullscreen */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => handleSpeedClose()}
          disablePortal={false} // Crucial para que aparezca en Fullscreen
          container={containerRef.current} // Hace que el menú pertenezca al contenedor del player
          PaperProps={{
            style: {
              background: "rgba(15, 15, 15, 0.95)",
              color: "white",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(11, 103, 220, 0.2)",
            },
          }}
        >
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
            <MenuItem
              key={s}
              onClick={() => handleSpeedClose(s)}
              sx={{ "&:hover": { background: "#0b67dc" } }}
            >
              {s === 1 ? "Normal" : `${s}x`}
            </MenuItem>
          ))}
        </Menu>
      </PlayerContainer>
    </div>
  );
}

// import React, { useEffect, useState, useRef } from "react";
// import styled, { keyframes, css } from "styled-components";
// import ReactPlayer from "react-player";
// import {
//   Grid,
//   Typography,
//   Slider,
//   CircularProgress,
//   Tooltip,
//   Menu,
//   MenuItem,
// } from "@mui/material";

// // Iconos
// import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
// import PauseRounded from "@mui/icons-material/PauseRounded";
// import VolumeUpRounded from "@mui/icons-material/VolumeUpRounded";
// import FullscreenRounded from "@mui/icons-material/FullscreenRounded";
// import Replay10Rounded from "@mui/icons-material/Replay10Rounded";
// import Forward10Rounded from "@mui/icons-material/Forward10Rounded";
// import VolumeOffRounded from "@mui/icons-material/VolumeOffRounded";
// import SpeedRounded from "@mui/icons-material/SpeedRounded";

// import screenfull from "screenfull";
// import { useSelector } from "react-redux";
// import { RiRestartLine } from "react-icons/ri";
// import axios from "axios";

// /* ============= Animaciones ============= */
// const fadeIn = keyframes`
//   from { opacity: 0; }
//   to { opacity: 1; }
// `;

// /* =========== Styled Components =========== */
// const VideoWrapper = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   padding: 20px;
//   background: #000;
//   min-height: 50vh;
//   width: 100%;
//   box-sizing: border-box;
// `;

// const PlayerContainer = styled.div`
//   position: relative;
//   width: 100%;
//   max-width: 1200px;
//   aspect-ratio: 16 / 9;
//   background: #000;
//   border-radius: 16px;
//   overflow: hidden;
//   box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
//   cursor: ${({ showControls }) => (showControls ? "default" : "none")};

//   &:hover {
//     box-shadow: 0 0 30px rgba(11, 103, 220, 0.2);
//   }
// `;

// const ControlsOverlay = styled.div`
//   position: absolute;
//   inset: 0;
//   background: linear-gradient(
//     to top,
//     rgba(0, 0, 0, 0.9) 0%,
//     rgba(0, 0, 0, 0.2) 20%,
//     rgba(0, 0, 0, 0) 50%,
//     rgba(0, 0, 0, 0.4) 100%
//   );
//   display: flex;
//   flex-direction: column;
//   justify-content: space-between;
//   opacity: ${({ show }) => (show ? 1 : 0)};
//   transition: opacity 0.3s ease-in-out;
//   z-index: 10;
//   padding: 20px;

//   @media (max-width: 600px) {
//     padding: 10px;
//   }
// `;

// const CenterActionArea = styled.div`
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   display: flex;
//   gap: 40px;
//   align-items: center;
//   z-index: 11;
// `;

// const BigIconButton = styled.button`
//   background: rgba(255, 255, 255, 0.1);
//   backdrop-filter: blur(10px);
//   border: 1px solid rgba(255, 255, 255, 0.1);
//   border-radius: 50%;
//   width: 80px;
//   height: 80px;
//   color: white;
//   cursor: pointer;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   transition: all 0.2s;

//   & svg {
//     font-size: 50px;
//   }
//   &:hover {
//     background: rgba(11, 103, 220, 0.3);
//     transform: scale(1.1);
//   }

//   @media (max-width: 600px) {
//     width: 50px;
//     height: 50px;
//     & svg {
//       font-size: 30px;
//     }
//   }
// `;

// const TimelineSlider = styled(Slider)`
//   color: #0b67dc;
//   height: 6px;
//   padding: 15px 0;

//   & .MuiSlider-track {
//     border: none;
//     background: linear-gradient(90deg, #0b67dc, #e94560);
//   }

//   & .MuiSlider-rail {
//     background-color: rgba(255, 255, 255, 0.3);
//   }

//   & .MuiSlider-thumb {
//     width: 14px;
//     height: 14px;
//     background-color: #e94560;
//     transition: 0.3s ease;
//     &:hover,
//     &.Mui-focusVisible {
//       box-shadow: 0 0 0 8px rgba(233, 69, 96, 0.2);
//     }
//   }
// `;

// const BottomBar = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   width: 100%;
//   gap: 15px;
// `;

// const VolumeContainer = styled.div`
//   display: flex;
//   align-items: center;
//   width: 150px;
//   gap: 8px;
//   @media (max-width: 600px) {
//     width: 100px;
//   }
// `;

// /* =========== Componentes de Soporte =========== */
// const formatTime = (sec) => {
//   if (!sec || isNaN(sec)) return "00:00";
//   const m = Math.floor(sec / 60);
//   const s = Math.floor(sec % 60)
//     .toString()
//     .padStart(2, "0");
//   return `${m}:${s}`;
// };

// export default function AdvancedVideoPlayer() {
//   const { currentVideo } = useSelector((s) => s.video || {});
//   const { currentUser } = useSelector((s) => s.user || {});

//   const [state, setState] = useState({
//     playing: true,
//     muted: false,
//     volume: 0.7,
//     played: 0,
//     playbackRate: 1.0,
//   });

//   const [showControls, setShowControls] = useState(true);
//   const [loading, setLoading] = useState(true);
//   const [videoEnded, setVideoEnded] = useState(false);
//   const [duration, setDuration] = useState(0);
//   const [anchorEl, setAnchorEl] = useState(null);

//   const playerRef = useRef(null);
//   const containerRef = useRef(null);
//   const hideTimeout = useRef(null);

//   /* Atajos de Teclado */
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.code === "Space") {
//         e.preventDefault();
//         handleTogglePlay();
//       }
//       if (e.code === "KeyM") handleToggleMute();
//       if (e.code === "ArrowRight")
//         playerRef.current.seekTo(playerRef.current.getCurrentTime() + 5);
//       if (e.code === "ArrowLeft")
//         playerRef.current.seekTo(playerRef.current.getCurrentTime() - 5);
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [state.playing, state.muted]);

//   const handleTogglePlay = () =>
//     setState((p) => ({ ...p, playing: !p.playing }));
//   const handleToggleMute = () => setState((p) => ({ ...p, muted: !p.muted }));
//   const handleMouseMove = () => {
//     setShowControls(true);
//     clearTimeout(hideTimeout.current);
//     hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
//   };

//   const handleSeek = (v) => {
//     setState((p) => ({ ...p, played: v / 100 }));
//     playerRef.current.seekTo(v / 100);
//   };

//   const handleSpeedChange = (speed) => {
//     setState((p) => ({ ...p, playbackRate: speed }));
//     setAnchorEl(null);
//   };

//   return (
//     <VideoWrapper>
//       <PlayerContainer
//         ref={containerRef}
//         onMouseMove={handleMouseMove}
//         showControls={showControls}
//       >
//         <ReactPlayer
//           ref={playerRef}
//           url={currentVideo?.videoUrl || "URL_DE_PRUEBA_AQUI"}
//           width="100%"
//           height="100%"
//           playing={state.playing}
//           muted={state.muted}
//           volume={state.volume}
//           playbackRate={state.playbackRate}
//           onProgress={(s) => setState((p) => ({ ...p, played: s.played }))}
//           onDuration={(d) => setDuration(d)}
//           onEnded={() => setVideoEnded(true)}
//           onReady={() => setLoading(false)}
//           style={{ position: "absolute", top: 0, left: 0 }}
//         />

//         {loading && (
//           <CircularProgress
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               color: "#0b67dc",
//             }}
//           />
//         )}

//         <ControlsOverlay show={showControls || !state.playing}>
//           {/* Header */}
//           <Typography
//             variant="h6"
//             sx={{ color: "white", fontWeight: 300, opacity: 0.9 }}
//           >
//             {currentVideo?.title || "Reproduciendo video"}
//           </Typography>

//           {/* Central Controls */}
//           <CenterActionArea>
//             <BigIconButton
//               onClick={() =>
//                 playerRef.current.seekTo(
//                   playerRef.current.getCurrentTime() - 10
//                 )
//               }
//             >
//               <Replay10Rounded />
//             </BigIconButton>

//             <BigIconButton onClick={handleTogglePlay}>
//               {videoEnded ? (
//                 <RiRestartLine />
//               ) : state.playing ? (
//                 <PauseRounded />
//               ) : (
//                 <PlayArrowRounded />
//               )}
//             </BigIconButton>

//             <BigIconButton
//               onClick={() =>
//                 playerRef.current.seekTo(
//                   playerRef.current.getCurrentTime() + 10
//                 )
//               }
//             >
//               <Forward10Rounded />
//             </BigIconButton>
//           </CenterActionArea>

//           {/* Footer */}
//           <Grid container direction="column">
//             <TimelineSlider
//               min={0}
//               max={100}
//               value={state.played * 100}
//               onChange={(_, v) => handleSeek(v)}
//               valueLabelDisplay="auto"
//               valueLabelFormat={() =>
//                 formatTime(playerRef.current?.getCurrentTime())
//               }
//             />

//             <BottomBar>
//               <Grid item sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <IconButton onClick={handleTogglePlay}>
//                   {state.playing ? <PauseRounded /> : <PlayArrowRounded />}
//                 </IconButton>

//                 <VolumeContainer>
//                   <IconButton onClick={handleToggleMute}>
//                     {state.muted || state.volume === 0 ? (
//                       <VolumeOffRounded />
//                     ) : (
//                       <VolumeUpRounded />
//                     )}
//                   </IconButton>
//                   <Slider
//                     size="small"
//                     value={state.volume * 100}
//                     onChange={(_, v) =>
//                       setState((p) => ({
//                         ...p,
//                         volume: v / 100,
//                         muted: v === 0,
//                       }))
//                     }
//                     sx={{ color: "#fff" }}
//                   />
//                 </VolumeContainer>

//                 <Typography sx={{ color: "white", fontSize: "0.85rem", ml: 2 }}>
//                   {formatTime(playerRef.current?.getCurrentTime())} /{" "}
//                   {formatTime(duration)}
//                 </Typography>
//               </Grid>

//               <Grid item sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                 <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
//                   <SpeedRounded />
//                 </IconButton>

//                 <IconButton
//                   onClick={() => screenfull.toggle(containerRef.current)}
//                 >
//                   <FullscreenRounded />
//                 </IconButton>
//               </Grid>
//             </BottomBar>
//           </Grid>
//         </ControlsOverlay>

//         {/* Menú de Velocidad */}
//         <Menu
//           anchorEl={anchorEl}
//           open={Boolean(anchorEl)}
//           onClose={() => setAnchorEl(null)}
//           PaperProps={{
//             style: {
//               background: "rgba(20, 20, 20, 0.9)",
//               color: "white",
//               backdropFilter: "blur(10px)",
//             },
//           }}
//         >
//           {[0.5, 1, 1.5, 2].map((speed) => (
//             <MenuItem key={speed} onClick={() => handleSpeedChange(speed)}>
//               {speed === 1 ? "Normal" : `${speed}x`}
//             </MenuItem>
//           ))}
//         </Menu>
//       </PlayerContainer>
//     </VideoWrapper>
//   );
// }

// // Auxiliar para iconos consistente
// const IconButton = styled.button`
//   background: transparent;
//   border: none;
//   color: white;
//   cursor: pointer;
//   padding: 5px;
//   display: flex;
//   align-items: center;
//   transition: transform 0.1s;
//   &:hover {
//     transform: scale(1.1);
//     color: #0b67dc;
//   }
//   & svg {
//     font-size: 28px;
//   }
// `;
