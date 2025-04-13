import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TutorialsList.css';

const TutorialsList = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/playlists/languages');
        setLanguages(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tutorials');
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  if (loading) return <div className="loading">Loading tutorials...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="tutorials-container">
      <h2>Coding Tutorials</h2>
      <div className="languages-grid">
        {languages.map(language => (
          <Link to={`/tutorials/${language.slug}`} key={language.slug} className="language-card">
            <div className="language-icon">{language.icon}</div>
            <h3>{language.name}</h3>
            <p>{language.playlistCount} playlists</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TutorialsList;