import React, { useEffect, useState, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, SkipBack, SkipForward, Settings, Loader } from "lucide-react";

const VideoPlayer = () => {
  const [state, setState] = useState({
    playing: false,
    muted: false,
    volume: 0.7,
    played: 0,
    playbackRate: 1,
    quality: 'auto'
  });

  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const hideTimeout = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);

  // Video de demostración
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const videoTitle = "Big Buck Bunny - Video de Demostración";

  /* ========== HANDLERS ========== */
  const handlePlayPause = useCallback(() => {
    if (videoEnded) {
      videoRef.current.currentTime = 0;
      setVideoEnded(false);
      setState(p => ({ ...p, playing: true }));
      videoRef.current.play();
    } else {
      setState(p => ({ ...p, playing: !p.playing }));
      if (state.playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [videoEnded, state.playing]);

  const handleMute = useCallback(() => {
    setState(p => ({ ...p, muted: !p.muted }));
    videoRef.current.muted = !state.muted;
  }, [state.muted]);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setState(p => ({ ...p, volume: newVolume, muted: newVolume === 0 }));
    videoRef.current.volume = newVolume;
  }, []);

  const handleSeek = useCallback((e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    setIsSeeking(true);
    videoRef.current.currentTime = newTime;
    setState(p => ({ ...p, played: pos }));
    setCurrentTime(newTime);
    
    if (videoEnded && pos < 0.99) {
      setVideoEnded(false);
      setState(p => ({ ...p, playing: true }));
      videoRef.current.play();
    }
  }, [duration, videoEnded]);

  const handleProgressClick = useCallback((e) => {
    handleSeek(e);
    setTimeout(() => setIsSeeking(false), 100);
  }, [handleSeek]);

  const handleProgressDrag = useCallback((e) => {
    if (e.buttons !== 1) return;
    handleSeek(e);
  }, [handleSeek]);

  const skip = useCallback((seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
  }, [currentTime, duration]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const changePlaybackRate = useCallback((rate) => {
    setState(p => ({ ...p, playbackRate: rate }));
    videoRef.current.playbackRate = rate;
    setShowSettings(false);
  }, []);

  /* ========== EFECTOS ========== */
  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (!isSeeking) {
        const currentTime = video.currentTime;
        const duration = video.duration;
        setCurrentTime(currentTime);
        setState(p => ({ ...p, played: currentTime / duration }));
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffer(bufferedEnd / video.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };

    const handleEnded = () => {
      setVideoEnded(true);
      setState(p => ({ ...p, playing: false }));
    };

    const handleWaiting = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [isSeeking]);

  // Manejo de mouse para ocultar controles
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(hideTimeout.current);
      
      if (state.playing) {
        hideTimeout.current = setTimeout(() => {
          setShowControls(false);
        }, 2500);
      }
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimeout.current);
    };
  }, [state.playing]);

  // Teclado shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'm':
          handleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setState(p => ({ ...p, volume: Math.min(1, p.volume + 0.1) }));
          videoRef.current.volume = Math.min(1, state.volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setState(p => ({ ...p, volume: Math.max(0, p.volume - 0.1) }));
          videoRef.current.volume = Math.max(0, state.volume - 0.1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePlayPause, handleMute, skip, toggleFullscreen, state.volume]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div 
        ref={containerRef}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.002] cursor-pointer"
        onClick={(e) => {
          if (e.target === videoRef.current || e.target === containerRef.current) {
            handlePlayPause();
          }
        }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onClick={handlePlayPause}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Loader className="w-16 h-16 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-between transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ pointerEvents: showControls ? 'auto' : 'none' }}
        >
          {/* Title */}
          <div className="p-4">
            <h2 className="text-white text-xl font-semibold drop-shadow-lg">
              {videoTitle}
            </h2>
          </div>

          {/* Center Play Button */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-12 items-center pointer-events-auto z-10">
            <button 
              onClick={() => skip(-10)}
              className="text-white hover:text-blue-400 transition-all hover:scale-110 drop-shadow-lg"
            >
              <SkipBack className="w-12 h-12" />
            </button>

            <button 
              onClick={handlePlayPause}
              className="text-white hover:text-blue-400 transition-all hover:scale-110 drop-shadow-lg"
            >
              {videoEnded ? (
                <RotateCcw className="w-16 h-16" />
              ) : state.playing ? (
                <Pause className="w-16 h-16" />
              ) : (
                <Play className="w-16 h-16 ml-1" />
              )}
            </button>

            <button 
              onClick={() => skip(10)}
              className="text-white hover:text-blue-400 transition-all hover:scale-110 drop-shadow-lg"
            >
              <SkipForward className="w-12 h-12" />
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="p-4 space-y-3">
            {/* Progress Bar */}
            <div 
              ref={progressRef}
              className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
              onMouseMove={handleProgressDrag}
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={() => setIsSeeking(false)}
            >
              {/* Buffered */}
              <div 
                className="absolute h-full bg-white/40 rounded-full transition-all"
                style={{ width: `${buffer * 100}%` }}
              />
              
              {/* Played */}
              <div 
                className="absolute h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
                style={{ width: `${state.played * 100}%` }}
              />
              
              {/* Thumb */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform -translate-x-1/2"
                style={{ left: `${state.played * 100}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePlayPause}
                  className="hover:text-blue-400 transition-colors"
                >
                  {state.playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>

                <button 
                  onClick={handleMute}
                  className="hover:text-blue-400 transition-colors"
                >
                  {state.muted || state.volume === 0 ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={state.volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 accent-blue-500 cursor-pointer"
                />

                <span className="text-sm ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3 relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover:text-blue-400 transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </button>

                {/* Settings Menu */}
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg p-2 min-w-[150px] shadow-xl">
                    <div className="text-sm font-semibold mb-2 px-2">Velocidad</div>
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors ${
                          state.playbackRate === rate ? 'bg-blue-600' : ''
                        }`}
                      >
                        {rate}x {rate === 1 && '(Normal)'}
                      </button>
                    ))}
                  </div>
                )}

                <button 
                  onClick={toggleFullscreen}
                  className="hover:text-blue-400 transition-colors"
                >
                  <Maximize className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Click hint */}
        {!state.playing && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white text-6xl opacity-70 drop-shadow-2xl animate-pulse">
              <Play className="w-20 h-20" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;