import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './components/Login';
import Signup from './components/Signup';
import TutorialsList from './components/TutorialsList';
import Playlist from './components/Playlist';
import PlaylistVideos from './components/PlaylistVideos'; 
import VideoPlayer from './components/VideoPlayer';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/tutorials" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/tutorials" element={
              <ProtectedRoute>
                <TutorialsList />
              </ProtectedRoute>
            } />
            
            <Route path="/tutorials/:languageSlug" element={
              <ProtectedRoute>
                <Playlist />
              </ProtectedRoute>
            } />

            <Route path="/playlist/:playlistId" element={
              <ProtectedRoute>
                <PlaylistVideos />
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
    </AuthProvider>
  );
}

export default App;
