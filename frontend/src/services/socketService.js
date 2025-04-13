import io from 'socket.io-client';

let socket = null;
let connectionAttempts = 0;
const maxAttempts = 5;

export const getSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }
  
  if (connectionAttempts >= maxAttempts) {
    console.error('Maximum connection attempts reached');
    return null;
  }
  
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  
  connectionAttempts++;
  
  socket = io('http://localhost:5000', {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: connectionAttempts * 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['polling', 'websocket'] 
  });
  
  socket.on('connect', () => {
    console.log('Socket connected successfully');
    connectionAttempts = 0;
  });
  
  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });
  
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};