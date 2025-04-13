import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Playlist.css';

const Playlist = () => {
  const { languageSlug } = useParams();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/playlists/language/${languageSlug}`);
        setPlaylists(response.data.playlists);
        setLanguage(response.data.language);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch playlists');
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [languageSlug]);

  if (loading) return <div className="loading">Loading playlists...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="playlist-container">
      <h2>{language?.name} Tutorials</h2>
      <div className="playlists-grid">
        {playlists.map(playlist => (
          <Link to={`/playlist/${playlist._id}`} key={playlist._id} className="playlist-card">
            <div className="playlist-thumbnail">
              <img src={playlist.thumbnail || '/default-playlist.jpg'} alt={playlist.title} />
              <div className="playlist-count">{playlist.videos.length} videos</div>
            </div>
            <h3>{playlist.title}</h3>
            <p>{playlist.description}</p>
            <div className="progress-bar">
              <div 
                className="progress-filled" 
                style={{ width: `${playlist.progress || 0}%` }}
              ></div>
            </div>
            <div className="progress-text">{Math.round(playlist.progress || 0)}% complete</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Playlist;