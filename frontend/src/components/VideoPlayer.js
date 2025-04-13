import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProgress } from '../services/api';
import axios from 'axios';
import { getSocket, closeSocket } from '../services/socketService';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { videoId } = useParams();
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
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isStableConnection, setIsStableConnection] = useState(false);
  const playerRef = useRef(null);
  const progressBarRef = useRef(null);
  const lastIntervalRef = useRef(null);
  const socketRef = useRef(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(100);

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

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/videos/${videoId}`);
        setVideoData(response.data);
        console.log("Video data loaded:", response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching video:", error);
        setError("Failed to load video. Please try again.");
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  useEffect(() => {
    if (currentUser?.id && videoId) {
      getProgress(currentUser.id, videoId).then(data => {
        if (data && data.watchedIntervals) {
          setPlayedIntervals(data.watchedIntervals);
          setProgress(calculateProgress(data.watchedIntervals, duration));
        }
      }).catch(err => {
        console.error("Error fetching progress:", err);
      });
    }
  }, [currentUser, videoId, duration, calculateProgress]);

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

    setProgress(calculateProgress([...playedIntervals, lastIntervalRef.current], duration));
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

  const handlePlaybackRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    setPlaybackRate(rate);
  };

  const handleMute = () => {
    setVolume(volume === 0 ? 0.8 : 0);
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
              playbackRate={playbackRate}
              onProgress={handleProgress}
              onDuration={handleDuration}
              onPlay={handlePlay}
              onPause={handlePause}
              onError={(e) => {
                console.error("Video playback error:", e);
                setError("Error playing video. Please try another tutorial.");
              }}
              progressInterval={500}
              controls={false}
              config={{
                youtube: {
                  playerVars: {
                    disablekb: 0,
                    modestbranding: 1,
                    rel: 0,
                    fs: 0
                  }
                }
              }}
              className="react-player"
            />
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
              </div>
              
              <div className="secondary-controls">
                <div className="playback-rate">
                  <select value={playbackRate} onChange={handlePlaybackRateChange}>
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
                
                <div className="progress-percentage">
                  <div className="progress-circle" style={{ '--progress': `${progress}%` }}>
                    <div className="progress-circle-fill"></div>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <p>Watched {isSaving && <span className="saving-indicator">• Saving</span>}</p>
                </div>
                
                <button className="control-button secondary" onClick={handleFullscreen}>
                  <span role="img" aria-label="fullscreen">⛶</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="connection-status">
            {isStableConnection ? 
              <span className="status-connected">● Connected</span> : 
              <span className="status-disconnected">● Offline</span>
            }
          </div>
        </>
      ) : (
        <div className="error-message">Video not found</div>
      )}
    </div>
  );
};

export default VideoPlayer;