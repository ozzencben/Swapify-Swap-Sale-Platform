const { Server } = require('socket.io');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New user connected', socket.id);

    // Kullanıcıyı register et
    socket.on('register', (userId) => {
      onlineUsers.set(String(userId), socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Örnek mesajlaşma
    socket.on('send_message', (data) => {
      console.log('Message received', data);
      socket.broadcast.emit('receive_message', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) onlineUsers.delete(userId);
      }
      console.log('User disconnected', socket.id);
    });
  });
};

// Socket.io instance getter
const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO, onlineUsers };
