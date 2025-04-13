import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlaybackProvider } from './context/PlaybackContext';

import Login from './components/Login';
import Signup from './components/Signup';
import TutorialsList from './components/TutorialsList';
import Playlist from './components/Playlist';
import PlaylistVideos from './components/PlaylistVideos'; 
import VideoPlayer from './components/VideoPlayer';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function App() {
  const [backendAvailable, setBackendAvailable] = useState(true);

  useEffect(() => {
    // Check if backend is available
    const checkBackend = async () => {
      try {
        await axios.get(`${API_BASE_URL}/`);
        setBackendAvailable(true);
      } catch (error) {
        console.error('Backend not available:', error);
        setBackendAvailable(false);
      }
    };
    
    checkBackend();
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      console.log('Page route changed to:', window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  if (!backendAvailable) {
    return (
      <div className="backend-error">
        <h1>Connection Error</h1>
        <p>Cannot connect to the server. Please ensure the backend is running at http://localhost:5000</p>
        <button onClick={() => window.location.reload()}>Retry Connection</button>
      </div>
    );
  }

  return (
    <AuthProvider>
      <PlaybackProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/tutorials" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/tutorials/html/css" element={<Navigate to="/tutorials/html-css" replace />} />

              <Route path="/tutorials" element={
                <ProtectedRoute>
                  <TutorialsList />
                </ProtectedRoute>
              } />
              
              <Route 
                path="/tutorials/:languageSlug" 
                element={
                  <ProtectedRoute>
                    <Playlist key={window.location.pathname} />
                  </ProtectedRoute>
                } 
              />

              <Route path="/playlist/:playlistId" element={
                <ProtectedRoute>
                  <PlaylistVideos key={window.location.pathname} />
                </ProtectedRoute>
              } />
              
              <Route path="/video/:videoId" element={
                <ProtectedRoute>
                  <VideoPlayer />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </PlaybackProvider>
    </AuthProvider>
  );
}

export default App;
