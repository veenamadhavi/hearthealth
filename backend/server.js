require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const heartRoutes = require('./routes/heart');
const consultationRoutes = require('./routes/consultations');
const chatRoutes = require('./routes/chat');
const setupSocket = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  const io = new Server(server, {
    cors: {
      origin: "https://hearthealth-roan.vercel.app",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

// Middleware


app.use(cors({
  origin: "https://hearthealth-roan.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/heart', heartRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'HeartHealth API is running', timestamp: new Date() });
});

// Setup Socket.io
setupSocket(io);

// Make io accessible in routes
app.set('io', io);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hearthealth')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 HeartHealth Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { app, io };
