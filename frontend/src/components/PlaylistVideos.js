import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './PlaylistVideos.css';

const PlaylistVideos = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const { currentUser } = useContext(AuthContext);
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const lastPlaylistIdRef = useRef(null);
  const navigate = useNavigate();

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const calculateTimeRemaining = (totalDuration, progressPercent) => {
    const remainingSeconds = Math.round(totalDuration * (100 - progressPercent) / 100);
    return formatDuration(remainingSeconds);
  };

  const calculateTimeWatched = (totalDuration, progressPercent) => {
    const watchedSeconds = Math.round(totalDuration * progressPercent / 100);
    return formatDuration(watchedSeconds);
  };

  const getVideoThumbnail = (youtubeId) => {
    return [
      `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${youtubeId}/0.jpg`, 
      `https://img.youtube.com/vi/${youtubeId}/default.jpg`,
      'https://via.placeholder.com/320x180?text=Tutorial+Video'
    ];
  };

  const loadPlaylistData = async (forceRefresh = false) => {
    if (isLoadingRef.current || (hasLoadedRef.current && !forceRefresh)) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      
      console.log(`Loading playlist ${playlistId}`);
      
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/playlists/${playlistId}/videos`);
      setPlaylist(response.data);
      
      if (currentUser && response.data) {
        try {
          const progressRes = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/playlists/${playlistId}/progress`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
          );
          
          const progressMap = {};
          progressRes.data.videoProgress?.forEach(item => {
            progressMap[item.videoId] = item;
          });
          
          setVideoProgress(progressMap);
          setOverallProgress(parseFloat(progressRes.data.progress));
        } catch (err) {
          console.error('Error fetching progress data:', err);
        }
      }
      
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err.message || 'Failed to load playlist');
      console.error(err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!hasLoadedRef.current || playlistId !== lastPlaylistIdRef.current) {
      lastPlaylistIdRef.current = playlistId;
      loadPlaylistData();
    }
    
    return () => {
      if (playlistId !== lastPlaylistIdRef.current) {
        hasLoadedRef.current = false;
      }
    };
  }, [playlistId, currentUser]);

  const handleRefreshProgress = () => {
    loadPlaylistData(true); 
  };

  const continueWatching = () => {
    if (!playlist?.videos) return;
    
    const nextVideo = playlist.videos.find(video => 
      !videoProgress[video._id] || videoProgress[video._id].percent < 90
    );
    
    if (nextVideo) {
      navigate(`/video/${nextVideo._id}`);
    } else {
      navigate(`/video/${playlist.videos[0]._id}`);
    }
  };

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!playlist) return <div className="error">Playlist not found</div>;

  const totalDuration = playlist.videos.reduce((sum, video) => sum + (video.duration || 0), 0);
  const videosCompleted = playlist.videos.filter(video => 
    videoProgress[video._id]?.percent >= 90
  ).length;

  return (
    <div className="playlist-videos-container">
      <div className="playlist-header">
        <h2>{playlist.title}</h2>
        <p className="playlist-description">{playlist.description}</p>
        
        <div className="playlist-progress-section">
          <div className="progress-stats">
            <div className="progress-stat">
              <span className="stat-value">{videosCompleted}</span>
              <span className="stat-label">of {playlist.videos.length} videos completed</span>
            </div>
            <div className="progress-stat">
              <span className="stat-value">{calculateTimeWatched(totalDuration, overallProgress)}</span>
              <span className="stat-label">watched</span>
            </div>
            <div className="progress-stat">
              <span className="stat-value">{calculateTimeRemaining(totalDuration, overallProgress)}</span>
              <span className="stat-label">remaining</span>
            </div>
          </div>
          
          <div className="progress-container">
            <div className="progress-bar-large">
              <div className="progress-filled" style={{ width: `${overallProgress}%` }}></div>
            </div>
            <div className="progress-percentage">
              <span>{Math.round(overallProgress)}%</span> complete
            </div>
          </div>
          
          <div className="playlist-actions">
            <button className="continue-button" onClick={continueWatching}>
              {overallProgress > 0 ? (
                <>
                  <span className="button-icon">▶</span> Continue Learning
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span> Start Now
                </>
              )}
            </button>
            <button className="refresh-button" onClick={handleRefreshProgress}>
              <span className="button-icon">⟳</span> Refresh Progress
            </button>
          </div>
        </div>
      </div>
      
      <div className="videos-list">
        <h3>Course Content</h3>
        {playlist.videos.map((video, index) => {
          const progress = videoProgress[video._id]?.percent || 0;
          const isCompleted = progress >= 90;
          
          return (
            <Link to={`/video/${video._id}`} key={video._id} className={`video-item ${isCompleted ? 'completed' : ''}`}>
              <div className="video-thumbnail">
                <img 
                  src={getVideoThumbnail(video.youtubeId)[0]}
                  alt={video.title} 
                  onError={(e) => {
                    const currentSrc = e.target.src;
                    const srcs = getVideoThumbnail(video.youtubeId);
                    const currentIndex = srcs.indexOf(currentSrc);
                    if (currentIndex < srcs.length - 1) {
                      e.target.src = srcs[currentIndex + 1];
                    }
                  }}
                />
                <span className="video-number">{index + 1}</span>
                {isCompleted && <div className="video-completed-badge">✓</div>}
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                <div className="video-meta">
                  <span className="duration">{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span>
                  <div className="video-progress-wrapper">
                    <div className="video-progress-bar">
                      <div className="video-progress-filled" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="video-progress-text">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PlaylistVideos;