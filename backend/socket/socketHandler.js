const jwt = require('jsonwebtoken');

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.userId} (${socket.userRole})`);

    // Join role-specific room for notifications
    if (socket.userRole === 'patient') {
      socket.join(`patient_${socket.userId}`);
    } else if (socket.userRole === 'doctor') {
      socket.join(`doctor_${socket.userId}`);
    }

    // Join a consultation chat room
    socket.on('join_chat', (consultationId) => {
      socket.join(`chat_${consultationId}`);
      console.log(`${socket.userId} joined chat_${consultationId}`);
    });

    socket.on('leave_chat', (consultationId) => {
      socket.leave(`chat_${consultationId}`);
    });

    socket.on('typing', ({ consultationId, isTyping }) => {
      socket.to(`chat_${consultationId}`).emit('user_typing', {
        userId: socket.userId,
        role: socket.userRole,
        isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });
};

module.exports = setupSocket;
