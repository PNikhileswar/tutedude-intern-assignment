import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './PlaylistVideos.css';

const PlaylistVideos = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylistVideos = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/playlists/${playlistId}/videos`);
        setPlaylist(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch playlist videos');
        setLoading(false);
      }
    };

    fetchPlaylistVideos();
  }, [playlistId]);

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!playlist) return <div className="error">Playlist not found</div>;

  return (
    <div className="playlist-videos-container">
      <h2>{playlist.title}</h2>
      <p className="playlist-description">{playlist.description}</p>
      
      <div className="videos-list">
        {playlist.videos.map((video, index) => (
          <Link to={`/video/${video._id}`} key={video._id} className="video-item">
            <div className="video-thumbnail">
              <img 
                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                alt={video.title} 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/320x180?text=Tutorial+Video'; }}
              />
              <span className="video-number">{index + 1}</span>
            </div>
            <div className="video-info">
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              <div className="video-meta">
                <span className="duration">{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PlaylistVideos;