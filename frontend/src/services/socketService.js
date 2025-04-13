import io from 'socket.io-client';

let socket = null;
let isConnecting = false;

export const getSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }
  
  if (isConnecting) {
    return null;
  }
  
  isConnecting = true;
  
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  try {
    socket = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000', {
      auth: { token },
      reconnection: true, // Change to true for better reliability
      timeout: 10000,     // Increase timeout
      transports: ['polling', 'websocket'] // Support both transports
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