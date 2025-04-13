import React, { createContext, useState, useCallback } from 'react';

export const PlaybackContext = createContext();

export const PlaybackProvider = ({ children }) => {
  const [lastUpdatedVideoId, setLastUpdatedVideoId] = useState(null);
  
  const registerVideoProgress = useCallback((videoId, progress) => {
    setLastUpdatedVideoId(videoId);
  }, []);
  
  return (
    <PlaybackContext.Provider value={{ lastUpdatedVideoId, registerVideoProgress }}>
      {children}
    </PlaybackContext.Provider>
  );
};