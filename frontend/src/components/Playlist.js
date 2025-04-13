import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Playlist.css';

const Playlist = () => {
  const { languageSlug } = useParams();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const [hasLoaded, setHasLoaded] = useState(false);
  const lastLoadedSlugRef = useRef(null);

  useEffect(() => {
    if (hasLoaded && languageSlug === lastLoadedSlugRef.current) {
      return;
    }
    
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching playlists for ${languageSlug}`);
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/playlists/language/${languageSlug}`
        );
        
        if (response.data?.playlists) {
          setPlaylists(response.data.playlists);
          setLanguage(response.data.language);
          
          if (currentUser && response.data.playlists.length > 0) {
            const progressPromises = response.data.playlists.map(playlist => 
              axios.get(
                `http://localhost:5000/api/playlists/${playlist._id}/progress`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
              ).catch(err => {
                console.error(`Error fetching progress for playlist ${playlist._id}:`, err);
                return { data: { progress: 0, videoProgress: [] } };
              })
            );
            
            const progressResults = await Promise.all(progressPromises);
            
            const playlistsWithProgress = response.data.playlists.map((playlist, index) => ({
              ...playlist,
              progress: progressResults[index]?.data?.progress || 0,
              videosCompleted: progressResults[index]?.data?.videoProgress?.filter(
                p => p.percent >= 90
              ).length || 0
            }));
            
            setPlaylists(playlistsWithProgress);
          }
          
          lastLoadedSlugRef.current = languageSlug;
          setHasLoaded(true);
        }
      } catch (err) {
        console.error('Failed to fetch playlists:', err);
        setError('Failed to fetch playlists');
      } finally {
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
              <div className="playlist-count">{playlist.videos?.length} videos</div>
              {playlist.videosCompleted > 0 && (
                <div className="videos-completed">{playlist.videosCompleted} completed</div>
              )}
            </div>
            <h3>{playlist.title}</h3>
            <p>{playlist.description}</p>
            <div className="progress-bar">
              <div 
                className="progress-filled" 
                style={{ width: `${playlist.progress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(playlist.progress)}% complete
              {playlist.progress >= 100 && (
                <span className="completed-badge">✓ Completed</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Playlist;