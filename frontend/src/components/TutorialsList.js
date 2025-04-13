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
    <div className="tutorials-main">
      <div className="tutorials-hero">
        <h1>Master Coding with Interactive Tutorials</h1>
        <p>Choose a programming language to get started on your learning journey</p>
      </div>
      
      <div className="tutorials-container">
        <div className="languages-grid">
          {languages.map(language => (
            <Link to={`/tutorials/${language.slug}`} key={language.slug} className="language-card">
              <div className="language-icon">{language.icon}</div>
              <div className="language-info">
                <h3>{language.name}</h3>
                <span className="playlist-count">{language.playlistCount} courses</span>
                <p className="language-description">
                  {language.name === "JavaScript" && "Build dynamic web applications and modern UIs"}
                  {language.name === "Python" && "Create apps, analyze data, and build AI solutions"}
                  {language.name === "HTML/CSS" && "Design beautiful responsive websites"}
                </p>
                <div className="card-action">
                  <span>Explore courses</span>
                  <span className="arrow">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorialsList;