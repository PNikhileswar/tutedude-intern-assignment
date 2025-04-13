import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/progress';

export const saveProgress = async (userId, videoId, watchedIntervals, currentTime, duration) => {
  if (!userId || !videoId) {
    console.warn('Missing userId or videoId for progress tracking');
    return;
  }
  
  try {
    console.log(`Saving progress via API for video ${videoId} at position ${currentTime}`);
    await axios.post(`${API_URL}/save`, { 
      userId, 
      videoId, 
      watchedIntervals,
      currentTime,    // Include current time
      duration        // Include duration for percentage calculation
    });
    console.log('Progress saved successfully via REST API');
  } catch (error) {
    console.error('Error saving progress:', error);
    // Try again with absolute URL if it might be a relative path issue
    try {
      const fullUrl = process.env.REACT_APP_API_BASE_URL + '/api/progress/save';
      await axios.post(fullUrl, { 
        userId, 
        videoId, 
        watchedIntervals,
        currentTime,
        duration
      });
      console.log('Progress saved with fallback URL');
    } catch (secondError) {
      console.error('Complete progress saving failure:', secondError);
    }
  }
};

export const getProgress = async (userId, videoId) => {
  if (!userId || !videoId) {
    console.warn('Missing userId or videoId for fetching progress');
    return null;
  }
  
  try {
    const response = await axios.get(`${API_URL}/${userId}/${videoId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status !== 404) {
      console.error('Error fetching progress:', error);
    }
    return null;
  }
};