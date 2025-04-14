import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProgress, saveProgress } from '../services/api';
import axios from 'axios';
import { getSocket, closeSocket } from '../services/socketService';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [videoData, setVideoData] = useState(null);
  const [playedIntervals, setPlayedIntervals] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [loaded, setLoaded] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isStableConnection, setIsStableConnection] = useState(false);
  const [lastPosition, setLastPosition] = useState(0);
  const [hasInitialSeeked, setHasInitialSeeked] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [nextVideo, setNextVideo] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const playerRef = useRef(null);
  const progressBarRef = useRef(null);
  const lastIntervalRef = useRef(null);
  const socketRef = useRef(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(100);
  const lastPositionRef = useRef(0);
  const progressUpdateTimeoutRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser?.id) return;

    const socket = getSocket(token);
    socketRef.current = socket;
    
    if (!socket) {
      setIsStableConnection(false);
      return;
    }
    
    socket.on('progress_saved', (data) => {
      if (data.videoId === videoId) {
        setProgress(data.percent);
        setIsSaving(false);
      }
    });

    socket.on('progress_error', (data) => {
      console.error('Socket progress error:', data.error);
      setIsSaving(false);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off('progress_saved');
        socketRef.current.off('progress_error');
      }
    };
  }, [currentUser, videoId]);

  useEffect(() => {
    if (!socketRef.current) return;
    
    let connectionTimer;
    
    const handleConnect = () => {
      clearTimeout(connectionTimer);
      connectionTimer = setTimeout(() => {
        setIsStableConnection(true);
      }, 2000);
    };
    
    const handleDisconnect = () => {
      clearTimeout(connectionTimer);
      setIsStableConnection(false);
    };
    
    socketRef.current.on('connect', handleConnect);
    socketRef.current.on('disconnect', handleDisconnect);
    
    return () => {
      clearTimeout(connectionTimer);
      socketRef.current?.off('connect', handleConnect);
      socketRef.current?.off('disconnect', handleDisconnect);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log('Component unmounting, disconnecting socket');
        
        if (lastIntervalRef.current && videoId) {
          socketRef.current.emit('progress_update', {
            videoId,
            watchedIntervals: Array.isArray(lastIntervalRef.current) 
              ? lastIntervalRef.current 
              : [lastIntervalRef.current],
            currentTime: currentTimeRef.current,
            duration: durationRef.current
          });
        }
        
        socketRef.current.removeAllListeners();
        closeSocket(socketRef.current);
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Skip if no user, no video, or if socket is connected
    if (!currentUser?.id || !videoId || (socketRef.current && socketRef.current.connected)) return;
    
    // REST API fallback interval (only runs when socket is unavailable)
    const saveInterval = setInterval(() => {
      if (playedIntervals.length > 0) {
        console.log('Socket unavailable, using REST API fallback for progress');
        // Include currentTime and duration like the socket version does
        saveProgress(
          currentUser.id, 
          videoId, 
          playedIntervals,
          currentTimeRef.current, // Add current time
          durationRef.current     // Add duration
        );
      }
    }, 1000); // Save every 1 seconds
    
    return () => clearInterval(saveInterval);
  }, [currentUser?.id, videoId, playedIntervals]);

  useEffect(() => {
    if (!currentUser?.id || !videoId) return;
    
    // Either socket isn't initialized or we've tried connecting but failed
    if (!socketRef.current || !isStableConnection) {
      console.log('Using REST API fallback for progress tracking');
      
      const saveInterval = setInterval(() => {
        if (playedIntervals.length > 0 && currentTimeRef.current > 0) {
          saveProgress(
            currentUser.id, 
            videoId, 
            playedIntervals,
            currentTimeRef.current,
            durationRef.current
          );
        }
      }, 10000);
      
      return () => clearInterval(saveInterval);
    }
  }, [currentUser?.id, videoId, playedIntervals, isStableConnection]);

  const mergeIntervals = (intervals) => {
    if (!intervals.length) return [];

    intervals.sort((a, b) => a.start - b.start);

    const merged = [];
    let current = intervals[0];

    for (let i = 1; i < intervals.length; i++) {
      if (current.end >= intervals[i].start) {
        current.end = Math.max(current.end, intervals[i].end);
      } else {
        merged.push(current);
        current = intervals[i];
      }
    }

    merged.push(current);
    return merged;
  };

  const calculateProgress = useCallback((intervals, videoDuration) => {
    if (!intervals || intervals.length === 0 || !videoDuration) return 0;

    const mergedIntervals = mergeIntervals([...intervals]);

    let totalUniqueSeconds = 0;
    mergedIntervals.forEach(({ start, end }) => {
      totalUniqueSeconds += Math.min(end, videoDuration) - start;
    });

    return Math.min(100, (totalUniqueSeconds / videoDuration) * 100);
  }, []);

  const fetchNextVideo = useCallback(async () => {
    if (!videoData || !videoData.playlistId) return;
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/playlists/${videoData.playlistId}/videos`);
      
      if (response.data && response.data.videos && response.data.videos.length > 0) {
        const currentIndex = response.data.videos.findIndex(v => v._id === videoId);
        if (currentIndex !== -1 && currentIndex < response.data.videos.length - 1) {
          setNextVideo(response.data.videos[currentIndex + 1]);
        }
      }
    } catch (err) {
      console.error('Error fetching next video:', err);
    }
  }, [videoId, videoData]);

  useEffect(() => {
    if (videoData) {
      fetchNextVideo();
    }
  }, [videoData, fetchNextVideo]);

  useEffect(() => {
    if (nextVideo) {
      console.log("Next video data loaded:", nextVideo.title);
    }
  }, [nextVideo]);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/videos/${videoId}`);
        setVideoData(response.data);
        
        // If user is logged in, fetch their progress but don't show resume dialog
        if (currentUser?.id) {
          try {
            const progressData = await getProgress(currentUser.id, videoId);
            if (progressData && progressData.lastPosition > 5) {
              setLastPosition(progressData.lastPosition);
              lastPositionRef.current = progressData.lastPosition;
              // Don't set showResumePrompt, just set the position
            }
          } catch (err) {
            console.error("Error fetching video progress position:", err);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching video:", error);
        setError("Failed to load video. Please try again.");
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
      setVideoFinished(false);
    }
    
    setHasInitialSeeked(false);
  }, [videoId, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id && videoId) {
      setProgressLoading(true);
      
      // Clear any existing timeout
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
      
      // Set a 2-second delay before fetching progress
      progressUpdateTimeoutRef.current = setTimeout(() => {
        getProgress(currentUser.id, videoId).then(data => {
          if (data && data.watchedIntervals) {
            setPlayedIntervals(data.watchedIntervals);
            const calculatedProgress = calculateProgress(data.watchedIntervals, duration);
            setProgress(calculatedProgress);
            console.log("Updated progress after delay:", calculatedProgress);
          }
          setProgressLoading(false);
        }).catch(err => {
          console.error("Error fetching progress:", err);
          setProgressLoading(false);
        });
      }, 2000);
    }
    
    return () => {
      if (progressUpdateTimeoutRef.current) {
        clearTimeout(progressUpdateTimeoutRef.current);
      }
    };
  }, [currentUser?.id, videoId, duration, calculateProgress]);

  useEffect(() => {
    if (!videoId || !currentUser?.id || !socketRef.current) {
      return;
    }
    
    const updateInterval = setInterval(() => {
      if (lastIntervalRef.current && currentTimeRef.current > 0 && socketRef.current?.connected) {
        setIsSaving(true);
        
        try {
          socketRef.current.emit('progress_update', {
            videoId,
            watchedIntervals: Array.isArray(lastIntervalRef.current) 
              ? lastIntervalRef.current 
              : [lastIntervalRef.current],
            currentTime: currentTimeRef.current,
            duration: durationRef.current
          });
        } catch (err) {
          console.error('Error sending progress update:', err);
          setIsSaving(false);
        }
      }
    }, 3000); 
    
    return () => clearInterval(updateInterval);
  }, [videoId, currentUser?.id]);

  const handleProgress = (state) => {
    const currentTime = state.playedSeconds;
    setCurrentTime(currentTime);
    currentTimeRef.current = currentTime;

    if (currentTime === 0) return;

    if (lastIntervalRef.current &&
        currentTime >= lastIntervalRef.current.start &&
        currentTime <= lastIntervalRef.current.end + 1) {
      lastIntervalRef.current.end = currentTime;
    } else {
      const newInterval = { start: currentTime, end: currentTime + 1 };
      lastIntervalRef.current = newInterval;
      setPlayedIntervals(prev => [...prev, newInterval]);
    }

    const calculatedProgress = calculateProgress([...playedIntervals, lastIntervalRef.current], duration);
    setProgress(calculatedProgress);
    
    // Mark video as finished when progress is over 95% or we're at the end
    if (calculatedProgress > 95 || (currentTime > 0 && Math.abs(currentTime - duration) < 2)) {
      setVideoFinished(true);
    }

    // Force show next video when we're very close to the end
    if (duration > 0 && currentTime > 0 && duration - currentTime < 0.5) {
      setVideoFinished(true);
    }
    
    setLoaded(state.loaded * 100);
  };

  const handleDuration = (videoDuration) => {
    setDuration(videoDuration);
    durationRef.current = videoDuration;
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeekMouseMove = (e) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const position = Math.max(0, Math.min(1, offsetX / rect.width));
    setHoverPosition(position * 100);
  };

  const handleSeekMouseLeave = () => {
    setHoverPosition(null);
  };

  const handleSeekStart = (e) => {
    setSeeking(true);
    handleSeekChange(e);
  };

  const handleSeekChange = useCallback((e) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const position = Math.max(0, Math.min(1, offsetX / rect.width));

    if (playerRef.current) {
      playerRef.current.seekTo(position * duration);
    }
  }, [duration]);

  const handleSeekEnd = () => {
    setSeeking(false);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (seeking) handleSeekChange(e);
    };

    const handleMouseUp = () => {
      if (seeking) handleSeekEnd();
    };

    if (seeking) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [seeking, handleSeekChange]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleFullscreen = () => {
    if (playerRef.current) {
      const wrapper = document.querySelector('.video-wrapper');

      if (wrapper) {
        if (wrapper.requestFullscreen) {
          wrapper.requestFullscreen();
        } else if (wrapper.mozRequestFullScreen) {
          wrapper.mozRequestFullScreen();
        } else if (wrapper.webkitRequestFullscreen) {
          wrapper.webkitRequestFullscreen();
        } else if (wrapper.msRequestFullscreen) {
          wrapper.msRequestFullscreen();
        }
      }
    }
  };

  const handleMute = () => {
    setVolume(volume === 0 ? 0.8 : 0);
  };

  const handleReady = () => {
    if (lastPosition > 5 && !hasInitialSeeked && playerRef.current) {
      console.log(`Auto-resuming video at ${formatTime(lastPosition)}`);
      playerRef.current.seekTo(lastPosition);
      setHasInitialSeeked(true);
      
      // Auto-play after seeking
      setTimeout(() => {
        setIsPlaying(true);
      }, 300);
    }
  };

  const handleStartFromBeginning = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      setIsPlaying(true); // Start playing from the beginning
    }
  };

  const handleDismissResumePrompt = () => {
    // Start playback after the prompt is dismissed
    setIsPlaying(true);
  };

  const handleVideoEnded = () => {
    console.log("Video ended - showing next video prompt");
    setVideoFinished(true);
    setIsPlaying(false);
  };

  const handleNextVideo = () => {
    if (nextVideo) {
      navigate(`/video/${nextVideo._id}`);
    }
  };

  return (
    <div className="video-player-container">
      {loading ? (
        <div className="loading">Loading video...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : videoData ? (
        <>
          <h2>{videoData.title}</h2>
          <div className="video-wrapper">
            <ReactPlayer
              ref={playerRef}
              url={`https://www.youtube.com/watch?v=${videoData.youtubeId}`}
              width="100%"
              height="100%"
              playing={isPlaying}
              volume={volume}
              onProgress={handleProgress}
              onDuration={handleDuration}
              onPlay={handlePlay}
              onPause={handlePause}
              onReady={handleReady}
              onEnded={handleVideoEnded}
              fallback={<div className="video-fallback">Video cannot be played</div>}
              onError={(e) => {
                console.error("Video playback error:", e);
                // Try multiple fallback options
                setError("We're having trouble playing this video. Trying alternatives...");
                
                // Try different YouTube embedding options sequentially
                const tryAlternatives = async () => {
                  // First try nocookie domain
                  try {
                    const url1 = `https://www.youtube-nocookie.com/embed/${videoData.youtubeId}?autoplay=1&mute=0&playsinline=1`;
                    playerRef.current.getInternalPlayer().src = url1;
                    await new Promise(r => setTimeout(r, 3000));
                    
                    if (!playerRef.current.getInternalPlayer().getPlayerState) {
                      // Second try with different parameters
                      const url2 = `https://www.youtube.com/embed/${videoData.youtubeId}?autoplay=0&rel=0`;
                      playerRef.current.getInternalPlayer().src = url2;
                    }
                  } catch (err) {
                    setError(`This video is currently unavailable. Please try a different video or check back later.`);
                  }
                };
                
                tryAlternatives();
              }}
              progressInterval={500}
              controls={false}
              config={{
                youtube: {
                  playerVars: {
                    disablekb: 0,
                    modestbranding: 1,
                    origin: window.location.origin,
                    rel: 0,
                    fs: 0,
                    iv_load_policy: 3,
                    autoplay: 0
                  },
                  embedOptions: {
                    host: 'https://www.youtube-nocookie.com'
                  }
                }
              }}
              className="react-player"
            />
            
            {hasInitialSeeked && lastPosition > 5 && (
              <div className="auto-resume-indicator">
                Resumed from {formatTime(lastPosition)}
              </div>
            )}
            
            {/* Show next video button when video is finished */}
            {videoFinished && nextVideo && (
              <div className="next-video-overlay">
                <div className="next-video-content">
                  <h3>Video Complete!</h3>
                  <p>Next: {nextVideo.title}</p>
                  <button onClick={handleNextVideo} className="next-video-button">
                    Watch Next Video <span className="next-arrow">→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="controls-container">
            <div className="progress-container">
              <div 
                className="progress-bar" 
                ref={progressBarRef}
                onMouseDown={handleSeekStart}
                onMouseMove={handleSeekMouseMove}
                onMouseLeave={handleSeekMouseLeave}
              >
                <div className="progress-loaded" style={{ width: `${loaded}%` }}></div>
                <div className="progress-played" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                
                {hoverPosition !== null && (
                  <>
                    <div className="seek-hover-indicator" style={{ left: `${hoverPosition}%` }}></div>
                    <div className="seek-hover-time" style={{ left: `${hoverPosition}%` }}>
                      {formatTime(duration * (hoverPosition / 100))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="video-controls">
              <div className="primary-controls">
                <button className="control-button" onClick={handlePlayPause}>
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                
                <div className="volume-control">
                  <button className="control-button secondary" onClick={handleMute}>
                    {volume === 0 ? '🔇' : '🔊'}
                  </button>
                  <input
                    type="range"
                    className="volume-slider"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    style={{
                      background: `linear-gradient(to right, #4f46e5 ${volume * 100}%, #d1d5db ${volume * 100}%)`
                    }}
                  />
                </div>

                {hasInitialSeeked && lastPosition > 5 && (
                  <button 
                    className="control-button secondary restart-button" 
                    onClick={() => playerRef.current.seekTo(0)}
                    title="Restart video"
                  >
                    ⟲ Restart
                  </button>
                )}
              </div>
              
              <div className="secondary-controls">
                <div className="progress-percentage">
                  <div className="progress-circle" style={{ '--progress': `${progressLoading ? 0 : progress}%` }}>
                    <div className="progress-circle-fill"></div>
                    <span>{progressLoading ? "..." : Math.round(progress) + "%"}</span>
                  </div>
                  <p>
                    {progressLoading ? "Loading..." : "Watched"}
                    {!progressLoading && isSaving && <span className="saving-indicator">• Saving</span>}
                  </p>
                </div>
                
                <button className="control-button secondary" onClick={handleFullscreen}>
                  <span role="img" aria-label="fullscreen">⛶</span>
                </button>
                
                {/* Always show next video button */}
                {nextVideo && (
                  <button 
                    className="control-button next-button" 
                    onClick={handleNextVideo}
                    title={nextVideo ? `Next: ${nextVideo.title}` : ''}
                  >
                    Next <span className="next-icon">→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="connection-status">
            {isStableConnection ? 
              <span className="status-connected">● Connected</span> : 
              <span className="status-disconnected">● Offline</span>
            }
          </div>

          {/* Add video info panel below the video player component */}
          {videoData && (
            <div className="video-info-panel">
              <div className="video-info-content">
                <h3>{videoData.title}</h3>
                <p>{videoData.description}</p>
                
                {nextVideo && (
                  <div className="next-up-preview">
                    <h4>Next Up</h4>
                    <div className="next-video-preview" onClick={handleNextVideo}>
                      <div className="preview-thumbnail">
                        <img 
                          src={`https://img.youtube.com/vi/${nextVideo.youtubeId}/mqdefault.jpg`}
                          alt={nextVideo.title}
                        />
                        <div className="play-icon">▶</div>
                      </div>
                      <div className="preview-info">
                        <strong>{nextVideo.title}</strong>
                        <span>{nextVideo.description}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="error-message">Video not found</div>
      )}
    </div>
  );
};

export default VideoPlayer;