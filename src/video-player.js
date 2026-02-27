const playPauseBtn = document.querySelector(".play-pause-btn")
const video = document.querySelector("video")

playPauseBtn.addEventListener("click", togglePlay)
video.addEventListener("click", togglePlay)
              
function togglePlay() {
    video.paused ? video.play() : video.pause()
}



<div className="video-container paused">
                <div className="video-controls-container">
                  <div className="timeline-container"></div>
                  <div className="controls">
                    <button className="play-pause-btn" onClick={handlePlayPauseClick}>
                      {isPlaying ? <AiOutlinePlayCircle style={{fontSize: '30px'}} className="play-icon" /> : <AiOutlinePauseCircle style={{fontSize: '30px'}} className="pause-icon" />}
                    </button>
                  </div>
                </div>
                {/* <script src="./video-player.js"></script> */}
                <video src={currentVideo.videoUrl}></video>
              </div>