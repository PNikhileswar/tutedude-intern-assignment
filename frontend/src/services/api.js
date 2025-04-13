import axios from 'axios';

const API_URL = 'http://localhost:5000/api/progress';

export const saveProgress = async (userId, videoId, watchedIntervals) => {
  if (!userId || !videoId) {
    console.warn('Missing userId or videoId for progress tracking');
    return;
  }
  
  try {
    await axios.post(`${API_URL}/save`, { userId, videoId, watchedIntervals });
  } catch (error) {
    console.error('Error saving progress:', error);
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