import io from 'socket.io-client';

let socket = null;
let isConnecting = false;

export const getSocket = (token) => {
  // Force enable sockets even in production
  const enableSockets = true; // Override the environment check

  if (socket && socket.connected) {
    return socket;
  }
  
  if (isConnecting) {
    return null;
  }
  
  isConnecting = true;
  
  try {
    // Update connection settings for Vercel environment
    socket = io(process.env.REACT_APP_API_BASE_URL, {
      path: '/api/socketio', // Match the path we set on the server
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['polling'], // Stick with polling for Vercel
      forceNew: true
    });
    
    socket.on('connect', () => {
      console.log('Socket connected');
      isConnecting = false;
    });
    
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      isConnecting = false;
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    return socket;
  } catch (err) {
    console.error('Socket creation error:', err);
    isConnecting = false;
    return null;
  }
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  isConnecting = false;
};